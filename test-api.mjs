// Quick test to verify API key works
import { GoogleGenAI } from "@google/genai";
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env.local manually
let apiKey = '';
try {
  const envContent = readFileSync(join(__dirname, '.env.local'), 'utf-8');
  const match = envContent.match(/GEMINI_API_KEY=(.+)/);
  if (match) {
    apiKey = match[1].trim();
  }
} catch (e) {
  console.error('❌ Cannot read .env.local file');
  process.exit(1);
}

if (!apiKey) {
  console.error('❌ API Key not found in .env.local');
  process.exit(1);
}

console.log('✅ API Key found in .env.local');
console.log(`📝 API Key: ${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 5)}`);
console.log(`📏 Length: ${apiKey.length} characters`);

// Validate format
if (!apiKey.startsWith('AIza')) {
  console.error('❌ Invalid API key format (should start with AIza)');
  process.exit(1);
}

if (apiKey.length < 30) {
  console.error(`❌ API key too short (${apiKey.length} characters, minimum 30)`);
  process.exit(1);
}

console.log('✅ API Key format is valid\n');

// Test API call
const ai = new GoogleGenAI({ apiKey });

async function testAPI() {
  try {
    console.log('🔄 Testing API connection...');
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: "Say 'API key is working correctly' in one sentence.",
      config: {
        responseMimeType: "text/plain"
      }
    });
    
    const text = response.text;
    console.log('✅ API Key is working!');
    console.log(`📄 Response: ${text}`);
    return true;
  } catch (error) {
    console.error('❌ API Key test failed:');
    if (error.message) {
      console.error(`   Error: ${error.message}`);
    } else {
      console.error(error);
    }
    return false;
  }
}

testAPI().then(success => {
  process.exit(success ? 0 : 1);
});

