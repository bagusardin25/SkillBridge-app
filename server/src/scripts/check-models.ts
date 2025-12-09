import dotenv from 'dotenv';
import path from 'path';
import { GoogleGenerativeAI } from "@google/generative-ai";

// Load .env from server directory (assuming script run from server root)
dotenv.config({ path: '.env' });

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.error("Error: GEMINI_API_KEY is not set in environment variables. Make sure you are running this from the server directory.");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

async function listModels() {
    try {
        const response = await genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        // Actually we want to list models, but the SDK reference suggests using the model to generate content.
        // However, the error message said "Call ListModels to see the list of available models"
        // The GoogleGenerativeAI class doesn't strictly have a listModels method on the client instance in some versions?
        // Let's check if we can simply try a known working model like 'gemini-pro' as a fallback test.

        // Correction: The SDK typically doesn't expose listModels directly on the main class in all versions, 
        // but the error message from the API suggests it exists on the API side.
        // Let's try to query the models endpoint directly if the SDK doesn't help, 
        // but for now let's just try to instantiate 'gemini-pro' and see if it works.

        console.log("Testing access to 'gemini-1.5-flash'...");
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            await model.generateContent("Hello");
            console.log("SUCCESS: 'gemini-1.5-flash' is working.");
        } catch (e: any) {
            console.log("FAILED 'gemini-1.5-flash':", e.message.split('\n')[0]);
        }

        console.log("\nTesting access to 'gemini-pro'...");
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-pro" });
            await model.generateContent("Hello");
            console.log("SUCCESS: 'gemini-pro' is working.");
        } catch (e: any) {
            console.log("FAILED 'gemini-pro':", e.message.split('\n')[0]);
        }

        console.log("\nTesting access to 'gemini-1.0-pro'...");
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-1.0-pro" });
            await model.generateContent("Hello");
            console.log("SUCCESS: 'gemini-1.0-pro' is working.");
        } catch (e: any) {
            console.log("FAILED 'gemini-1.0-pro':", e.message.split('\n')[0]);
        }

    } catch (error: any) {
        console.error("Error:", error.message);
    }
}

listModels();
