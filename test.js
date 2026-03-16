
require("dotenv").config({path: "./Backend/.env"});
const fetch = require("node-fetch");
async function run() {
  const k = process.env.STEAM_API_KEY;
  if (!k) return console.log("no key");
  console.log("key length:", k.length);
}
run();

