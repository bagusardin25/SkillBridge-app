
import dotenv from 'dotenv';
import path from 'path';

// Load .env
dotenv.config({ path: '.env' });

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.error("No API KEY found");
    process.exit(1);
}

const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

async function getModels() {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.error(`Error: ${response.status} ${response.statusText}`);
            const text = await response.text();
            console.error(text);
            return;
        }
        const data = await response.json();
        if (data.models) {
            console.log("AVAILABLE MODELS:");
            data.models.forEach((m: any) => {
                // Filter for generateContent supported models
                if (m.supportedGenerationMethods && m.supportedGenerationMethods.includes("generateContent")) {
                    console.log(`- ${m.name.replace('models/', '')}`);
                }
            });
        } else {
            console.log("No models found in response.");
        }
    } catch (e: any) {
        console.error("Fetch error:", e.message);
    }
}

getModels();
