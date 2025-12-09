import "dotenv/config";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

async function listModels() {
  console.log("Listing available models...\n");

  const models = ["gemini-3-pro", "gemini-2.5-pro-preview-06-05", "gemini-2.0-flash", "gemini-1.5-pro", "gemini-1.5-flash"];

  for (const modelName of models) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent("Hi");
      console.log(`✅ ${modelName}: WORKS - "${result.response.text().substring(0, 30)}..."`);
      return modelName; // Return first working model
    } catch (error) {
      if (error.message.includes("429")) {
        console.log(`⏳ ${modelName}: Rate limited (but available)`);
      } else if (error.message.includes("404")) {
        console.log(`❌ ${modelName}: Not found`);
      } else {
        console.log(`❌ ${modelName}: ${error.message.substring(0, 50)}`);
      }
    }
  }
}

listModels();
