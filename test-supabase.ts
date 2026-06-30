import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || "";

async function main() {
  const url = `${supabaseUrl}/rest/v1/`;
  console.log("Fetching from:", url);
  try {
    const res = await fetch(url, {
      headers: {
        "apikey": supabaseAnonKey,
        "Authorization": `Bearer ${supabaseAnonKey}`
      }
    });
    console.log("Status:", res.status);
    const text = await res.text();
    console.log("Response starts with:", text.slice(0, 1000));
    const parsed = JSON.parse(text);
    console.log("Paths available:", Object.keys(parsed.paths || {}));
    
    // Write the definitions to a JSON file so we can view them easily
    const fs = require("fs");
    fs.writeFileSync("supabase-openapi.json", JSON.stringify(parsed.definitions, null, 2));
    console.log("Wrote definitions to supabase-openapi.json");
  } catch (e: any) {
    console.error("Error:", e);
  }
}

main();
