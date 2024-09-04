#!/usr/bin/env node

import * as child_process from "child_process";
import path from "path";

const __filename = new URL(import.meta.url).pathname;
const __dirname = path.dirname(__filename);

const command = process.argv[2];
const args = process.argv.slice(3);

if (command === "перетворити") {
  child_process.execSync(`node ${__dirname}/generate.mjs ${args.join(" ")}`, {
    stdio: "inherit",
  });
} else if (command === "стежити") {
  child_process.execSync(`node ${__dirname}/watch.mjs ${args.join(" ")}`, {
    stdio: "inherit",
  });
} else if (command === "карта") {
  child_process.execSync(`node ${__dirname}/sitemap.mjs ${args.join(" ")}`, {
    stdio: "inherit",
  });
} else {
  console.error(
    "докс <перетворити|стежити|карта> [--вхід=,--вихід=,--вигляд=, --ґтег=]",
  );
  process.exit(0);
}
