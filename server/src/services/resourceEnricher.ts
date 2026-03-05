/**
 * Resource Enricher Service
 * 
 * Replaces AI-hallucinated URLs with real, verified resources by querying:
 * 1. YouTube Data API v3 — for video tutorials (with titles + thumbnails)
 * 2. Dev.to API — for programming articles
 * 3. freeCodeCamp News API — for tutorial articles
 * 4. HTTP validation — for official documentation links
 * 
 * Features:
 * - In-memory cache to avoid redundant API calls
 * - Multi-source fallback strategy
 * - Structured video objects (title, url, thumbnail)
 */

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || "";

// ────────────────────────────────────
// Types
// ────────────────────────────────────

export interface VideoResource {
    url: string;
    title: string;
    thumbnail: string;
    channelTitle?: string;
    duration?: string;
}

export interface ArticleResource {
    url: string;
    title: string;
    source: string; // "dev.to", "freecodecamp", "official"
}

// ────────────────────────────────────
// In-Memory Cache (Improvement #4)
// ────────────────────────────────────

interface CacheEntry<T> {
    data: T;
    timestamp: number;
}

const CACHE_TTL = 1000 * 60 * 60; // 1 hour

const videoCache = new Map<string, CacheEntry<VideoResource[]>>();
const articleCache = new Map<string, CacheEntry<ArticleResource[]>>();

function getCached<T>(cache: Map<string, CacheEntry<T>>, key: string): T | null {
    const entry = cache.get(key);
    if (entry && Date.now() - entry.timestamp < CACHE_TTL) {
        return entry.data;
    }
    if (entry) cache.delete(key); // expired
    return null;
}

function setCache<T>(cache: Map<string, CacheEntry<T>>, key: string, data: T): void {
    cache.set(key, { data, timestamp: Date.now() });

    // Prevent unbounded cache growth (max 200 entries)
    if (cache.size > 200) {
        const firstKey = cache.keys().next().value;
        if (firstKey) cache.delete(firstKey);
    }
}

// ────────────────────────────────────
// Topic normalization
// ────────────────────────────────────

function normalizeTopicForSearch(topic: string): string {
    return topic
        .replace(/^(Belajar|Pelajari|Dasar|Pengenalan|Introduction to|Learn|Basic|Memahami)\s+/i, "")
        .replace(/\s+(Tutorial|Basics|Fundamentals|Guide|Panduan|Dasar)$/i, "")
        .trim();
}

// ────────────────────────────────────
// YouTube Data API v3 (Improvements #1, #2)
// Returns structured objects with title + thumbnail
// ────────────────────────────────────

export async function searchYouTube(topic: string, maxResults: number = 2): Promise<VideoResource[]> {
    if (!YOUTUBE_API_KEY) {
        console.warn("  ⚠️ YOUTUBE_API_KEY not set. Skipping YouTube search.");
        return [];
    }

    const normalizedTopic = normalizeTopicForSearch(topic);
    const cacheKey = `yt:${normalizedTopic}`;

    // Check cache first
    const cached = getCached(videoCache, cacheKey);
    if (cached) {
        console.log(`  📦 YouTube cache hit for "${normalizedTopic}"`);
        return cached;
    }

    const query = `${normalizedTopic} tutorial programming`;

    try {
        const params = new URLSearchParams({
            part: "snippet",
            q: query,
            type: "video",
            maxResults: String(maxResults + 2), // fetch extra for filtering
            relevanceLanguage: "en",
            videoDuration: "medium", // 4-20 minutes
            order: "relevance",
            safeSearch: "strict",
            key: YOUTUBE_API_KEY,
        });

        const response = await fetch(
            `https://www.googleapis.com/youtube/v3/search?${params}`
        );

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error("  ❌ YouTube API error:", response.status, errorData);
            return [];
        }

        const data = await response.json();

        if (!data.items || data.items.length === 0) {
            return [];
        }

        // Map to structured video objects with title + thumbnail
        const videos: VideoResource[] = data.items
            .filter((item: any) => item.id?.videoId && item.snippet)
            .slice(0, maxResults)
            .map((item: any) => ({
                url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
                title: item.snippet.title || "Untitled Video",
                thumbnail: item.snippet.thumbnails?.medium?.url ||
                    item.snippet.thumbnails?.default?.url ||
                    `https://img.youtube.com/vi/${item.id.videoId}/mqdefault.jpg`,
                channelTitle: item.snippet.channelTitle || "",
            }));

        // Cache results
        setCache(videoCache, cacheKey, videos);

        return videos;
    } catch (error) {
        console.error("  ❌ YouTube search failed:", error);
        return [];
    }
}

// ────────────────────────────────────
// Dev.to API
// ────────────────────────────────────

async function searchDevToArticles(topic: string, maxResults: number = 2): Promise<ArticleResource[]> {
    const normalizedTopic = normalizeTopicForSearch(topic);
    const tag = normalizedTopic
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "")
        .slice(0, 30);

    try {
        // Try tag-based search (most relevant)
        let response = await fetch(
            `https://dev.to/api/articles?tag=${encodeURIComponent(tag)}&top=30&per_page=${maxResults + 2}`,
            { headers: { "Accept": "application/json" } }
        );

        let articles = await response.json();

        // Fallback: general tag search
        if (!Array.isArray(articles) || articles.length === 0) {
            response = await fetch(
                `https://dev.to/api/articles?tag=${encodeURIComponent(tag)}&per_page=${maxResults + 2}`,
                { headers: { "Accept": "application/json" } }
            );
            articles = await response.json();
        }

        if (!Array.isArray(articles) || articles.length === 0) {
            return [];
        }

        return articles
            .filter((a: any) => a.url && a.title)
            .sort((a: any, b: any) => (b.positive_reactions_count || 0) - (a.positive_reactions_count || 0))
            .slice(0, maxResults)
            .map((a: any) => ({
                url: a.url,
                title: a.title,
                source: "dev.to",
            }));
    } catch (error) {
        console.error("  ❌ Dev.to search failed:", error);
        return [];
    }
}

// ────────────────────────────────────
// freeCodeCamp News Search (Improvement #3)
// ────────────────────────────────────

async function searchFreeCodeCamp(topic: string, maxResults: number = 1): Promise<ArticleResource[]> {
    const normalizedTopic = normalizeTopicForSearch(topic);

    try {
        // freeCodeCamp uses a search API
        const response = await fetch(
            `https://www.freecodecamp.org/news/ghost/api/content/posts/?key=61a3c11c38df25002c5e2c78&filter=tag:${encodeURIComponent(normalizedTopic.toLowerCase().replace(/\s+/g, '-'))}&limit=${maxResults}&fields=title,url&order=published_at%20desc`,
            { headers: { "Accept": "application/json" } }
        );

        if (!response.ok) {
            // Fallback: try search-like approach
            const searchResponse = await fetch(
                `https://search.freecodecamp.org/news?query=${encodeURIComponent(normalizedTopic)}&size=${maxResults}`,
                { headers: { "Accept": "application/json" } }
            );

            if (!searchResponse.ok) return [];

            const searchData = await searchResponse.json();
            if (!searchData.hits || !Array.isArray(searchData.hits)) return [];

            return searchData.hits
                .slice(0, maxResults)
                .map((hit: any) => ({
                    url: hit.url || `https://www.freecodecamp.org/news/${hit.objectID || ''}`,
                    title: hit.title || hit.post_title || normalizedTopic,
                    source: "freecodecamp",
                }));
        }

        const data = await response.json();
        if (!data.posts || !Array.isArray(data.posts)) return [];

        return data.posts
            .slice(0, maxResults)
            .map((post: any) => ({
                url: post.url || `https://www.freecodecamp.org/news/`,
                title: post.title || normalizedTopic,
                source: "freecodecamp",
            }));
    } catch (error) {
        // freeCodeCamp API is not always reliable, fail silently
        console.log(`  ℹ️ freeCodeCamp search unavailable for "${normalizedTopic}"`);
        return [];
    }
}

// ────────────────────────────────────
// Combined Article Search (Improvement #5 — Fallback strategy)
// ────────────────────────────────────

async function searchArticles(topic: string, maxResults: number = 2): Promise<ArticleResource[]> {
    const normalizedTopic = normalizeTopicForSearch(topic);
    const cacheKey = `art:${normalizedTopic}`;

    // Check cache
    const cached = getCached(articleCache, cacheKey);
    if (cached) {
        console.log(`  📦 Article cache hit for "${normalizedTopic}"`);
        return cached;
    }

    // Strategy: Search multiple sources in parallel, merge and deduplicate
    const [devtoResults, fccResults] = await Promise.allSettled([
        searchDevToArticles(topic, maxResults),
        searchFreeCodeCamp(topic, 1),
    ]);

    const devtoArticles = devtoResults.status === "fulfilled" ? devtoResults.value : [];
    const fccArticles = fccResults.status === "fulfilled" ? fccResults.value : [];

    // Merge: prioritize Dev.to (more reliable), add freeCodeCamp if space
    const combined: ArticleResource[] = [];
    const seenUrls = new Set<string>();

    // Add Dev.to first
    for (const article of devtoArticles) {
        if (!seenUrls.has(article.url) && combined.length < maxResults) {
            combined.push(article);
            seenUrls.add(article.url);
        }
    }

    // Fill with freeCodeCamp
    for (const article of fccArticles) {
        if (!seenUrls.has(article.url) && combined.length < maxResults) {
            combined.push(article);
            seenUrls.add(article.url);
        }
    }

    // Fallback: if nothing found from any source, create a search link
    if (combined.length === 0) {
        combined.push({
            url: `https://dev.to/search?q=${encodeURIComponent(normalizedTopic)}`,
            title: `Search "${normalizedTopic}" on Dev.to`,
            source: "dev.to",
        });
    }

    // Cache results
    setCache(articleCache, cacheKey, combined);

    return combined;
}

// ────────────────────────────────────
// URL Validation
// ────────────────────────────────────

async function validateUrl(url: string, timeoutMs: number = 5000): Promise<boolean> {
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), timeoutMs);

        const response = await fetch(url, {
            method: "HEAD",
            redirect: "follow",
            signal: controller.signal,
            headers: { "User-Agent": "SkillBridge-LinkValidator/1.0" },
        });

        clearTimeout(timeout);
        return response.ok || (response.status >= 300 && response.status < 400);
    } catch {
        return false;
    }
}

function isOfficialDocsUrl(url: string): boolean {
    const officialPatterns = [
        /docs\./i, /developer\./i, /learn\./i, /devdocs\.io/i,
        /developer\.mozilla\.org/i, /react\.dev/i, /vuejs\.org/i,
        /angular\.io\/(docs|guide|tutorial)/i, /nodejs\.org\/.*docs/i,
        /typescriptlang\.org/i, /python\.org\/doc/i, /go\.dev\/doc/i,
        /rust-lang\.org/i, /kotlinlang\.org\/docs/i, /dart\.dev\/guides/i,
        /flutter\.dev\/docs/i, /nextjs\.org\/docs/i, /tailwindcss\.com\/docs/i,
        /prisma\.io\/docs/i, /expressjs\.com/i, /roadmap\.sh/i,
        /freecodecamp\.org/i, /w3schools\.com/i, /geeksforgeeks\.org/i,
    ];
    return officialPatterns.some(p => p.test(url));
}

// ────────────────────────────────────
// Main Enrichment Function
// ────────────────────────────────────

export async function enrichNodeResources(
    nodes: {
        id: string;
        label: string;
        data: {
            description: string;
            resources: string[];
            videos?: (string | VideoResource)[];
            articles?: ArticleResource[];
            [key: string]: any;
        };
        [key: string]: any;
    }[]
): Promise<typeof nodes> {
    console.log(`\n🔗 Enriching resources for ${nodes.length} nodes...`);

    const BATCH_SIZE = 3;

    for (let i = 0; i < nodes.length; i += BATCH_SIZE) {
        const batch = nodes.slice(i, i + BATCH_SIZE);

        await Promise.all(
            batch.map(async (node) => {
                const topic = node.label;
                console.log(`  📚 Node "${topic}" — fetching resources...`);

                try {
                    // 1. Search YouTube (returns structured objects with title + thumbnail)
                    const videoResults = await searchYouTube(topic);

                    // 2. Search articles from multiple sources (Dev.to + freeCodeCamp)
                    const articleResults = await searchArticles(topic);

                    // 3. Validate existing AI-generated resources (keep valid official docs)
                    const existingResources = node.data.resources || [];
                    const validatedDocs: ArticleResource[] = [];

                    for (const url of existingResources) {
                        if (url.includes("youtube.com") || url.includes("youtu.be")) continue;

                        if (isOfficialDocsUrl(url)) {
                            const isValid = await validateUrl(url);
                            if (isValid) {
                                // Extract a readable title from the URL
                                let title = "";
                                try {
                                    const urlObj = new URL(url);
                                    title = urlObj.pathname.split("/").filter(Boolean).pop() || urlObj.hostname;
                                    title = title.replace(/[-_]/g, " ").replace(/\.(html|htm|php|aspx)$/i, "");
                                    title = title.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
                                } catch {
                                    title = url;
                                }
                                validatedDocs.push({ url, title, source: "official" });
                            } else {
                                console.log(`    ❌ Invalid doc URL: ${url}`);
                            }
                        }
                    }

                    // 4. Compose final resources
                    // Videos: structured objects with title + thumbnail
                    node.data.videos = videoResults;

                    // Articles: structured objects from multiple sources + validated docs
                    node.data.articles = [...validatedDocs, ...articleResults];

                    // Resources: keep as plain URL array for backward compatibility
                    node.data.resources = [
                        ...validatedDocs.map(d => d.url),
                        ...articleResults.map(a => a.url),
                    ];

                    // Fallback: if no resources at all, keep original non-YouTube resources
                    if (node.data.resources.length === 0 && node.data.videos.length === 0) {
                        node.data.resources = existingResources.filter(r =>
                            !r.includes("youtube.com") && !r.includes("youtu.be")
                        );
                    }

                    console.log(
                        `    ✅ "${topic}" → ${videoResults.length} videos, ${node.data.articles.length} articles`
                    );
                } catch (error) {
                    console.error(`    ⚠️ Failed to enrich "${topic}":`, error);
                }
            })
        );

        // Small delay between batches
        if (i + BATCH_SIZE < nodes.length) {
            await new Promise(r => setTimeout(r, 300));
        }
    }

    console.log(`✅ Resource enrichment complete\n`);
    return nodes;
}
