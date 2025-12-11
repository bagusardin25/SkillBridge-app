import crypto from "crypto";

// Google OAuth configuration
const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo";

// GitHub OAuth configuration
const GITHUB_AUTH_URL = "https://github.com/login/oauth/authorize";
const GITHUB_TOKEN_URL = "https://github.com/login/oauth/access_token";
const GITHUB_USERINFO_URL = "https://api.github.com/user";
const GITHUB_EMAILS_URL = "https://api.github.com/user/emails";

export interface OAuthUserInfo {
    id: string;
    email: string;
    name: string | null;
    avatarUrl: string | null;
    provider: "google" | "github";
}

// Generate random state for CSRF protection
export function generateState(): string {
    return crypto.randomBytes(32).toString("hex");
}

// Google OAuth
export function getGoogleAuthUrl(state: string): string {
    const params = new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID || "",
        redirect_uri: process.env.GOOGLE_REDIRECT_URI || "",
        response_type: "code",
        scope: "openid email profile",
        state,
        access_type: "offline",
        prompt: "consent",
    });

    return `${GOOGLE_AUTH_URL}?${params.toString()}`;
}

export async function getGoogleTokens(code: string): Promise<{ access_token: string; id_token: string }> {
    const response = await fetch(GOOGLE_TOKEN_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
            code,
            client_id: process.env.GOOGLE_CLIENT_ID || "",
            client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
            redirect_uri: process.env.GOOGLE_REDIRECT_URI || "",
            grant_type: "authorization_code",
        }),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to get Google tokens: ${error}`);
    }

    return response.json();
}

export async function getGoogleUserInfo(accessToken: string): Promise<OAuthUserInfo> {
    const response = await fetch(GOOGLE_USERINFO_URL, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });

    if (!response.ok) {
        throw new Error("Failed to get Google user info");
    }

    const data = await response.json();

    return {
        id: data.id,
        email: data.email,
        name: data.name || null,
        avatarUrl: data.picture || null,
        provider: "google",
    };
}

// GitHub OAuth
export function getGitHubAuthUrl(state: string): string {
    const params = new URLSearchParams({
        client_id: process.env.GITHUB_CLIENT_ID || "",
        redirect_uri: process.env.GITHUB_REDIRECT_URI || "",
        scope: "user:email read:user",
        state,
    });

    return `${GITHUB_AUTH_URL}?${params.toString()}`;
}

export async function getGitHubToken(code: string): Promise<string> {
    const response = await fetch(GITHUB_TOKEN_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        },
        body: JSON.stringify({
            client_id: process.env.GITHUB_CLIENT_ID,
            client_secret: process.env.GITHUB_CLIENT_SECRET,
            code,
            redirect_uri: process.env.GITHUB_REDIRECT_URI,
        }),
    });

    if (!response.ok) {
        throw new Error("Failed to get GitHub token");
    }

    const data = await response.json();

    if (data.error) {
        throw new Error(`GitHub OAuth error: ${data.error_description || data.error}`);
    }

    return data.access_token;
}

export async function getGitHubUserInfo(accessToken: string): Promise<OAuthUserInfo> {
    // Get user profile
    const userResponse = await fetch(GITHUB_USERINFO_URL, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/vnd.github.v3+json",
        },
    });

    if (!userResponse.ok) {
        throw new Error("Failed to get GitHub user info");
    }

    const userData = await userResponse.json();

    // Get user emails (in case email is private)
    let email = userData.email;
    if (!email) {
        const emailsResponse = await fetch(GITHUB_EMAILS_URL, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                Accept: "application/vnd.github.v3+json",
            },
        });

        if (emailsResponse.ok) {
            const emails = await emailsResponse.json();
            const primaryEmail = emails.find((e: { primary: boolean; verified: boolean }) => e.primary && e.verified);
            email = primaryEmail?.email || emails[0]?.email;
        }
    }

    if (!email) {
        throw new Error("Could not get email from GitHub. Please make sure your email is public or grant email access.");
    }

    return {
        id: String(userData.id),
        email,
        name: userData.name || userData.login || null,
        avatarUrl: userData.avatar_url || null,
        provider: "github",
    };
}
