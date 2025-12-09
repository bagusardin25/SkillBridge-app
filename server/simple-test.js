import "dotenv/config";
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

async function testModel(modelName) {
    try {
        console.log("Testing:", modelName, "...");
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("Say hello");
        const text = result.response.text();
        console.log("SUCCESS -", modelName);
        console.log("Response:", text.trim().substring(0, 100));
        return true;
    } catch (error) {
        const msg = error.message;
        if (msg.includes("429")) {
            console.log("QUOTA EXCEEDED -", modelName, "(model exists but quota limit reached)");
        } else if (msg.includes("404")) {
            console.log("NOT FOUND -", modelName);
        } else {
            console.log("FAILED -", modelName, "-", msg.substring(0, 80));
        }
        return false;
    }
}

async function main() {
    console.log("=== Testing Gemini API ===\n");

    const models = [
        "gemini-2.0-flash-exp",
        "gemini-1.5-flash-latest",
        "gemini-1.5-pro-latest",
        "gemini-pro"
    ];

    for (const model of models) {
        await testModel(model);
        console.log("");
    }
}

main();
