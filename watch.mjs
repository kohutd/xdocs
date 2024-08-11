import fs from "fs";
import * as child_process from "node:child_process";
import path from "path";

const __filename = new URL(import.meta.url).pathname;
const __dirname = path.dirname(__filename);

let inputFolder = process.argv[2];
let outputFolder = process.argv[3];
let themeFolder = process.argv[4];

if (!inputFolder) {
  console.error("Необхідно вказати шлях до документації першим параметром");
  process.exit(1);
}

if (!outputFolder) {
  console.error("Необхідно вказати шлях до вихідної папки другим параметром");
  process.exit(1);
}

if (!themeFolder) {
  console.error("Необхідно вказати шлях до теми третім параметром");
  process.exit(1);
}

function generate() {
  console.log("Генерація...");
  child_process.execSync(`node ${__dirname}/generate.mjs ${inputFolder} ${outputFolder} ${themeFolder}`, { stdio: "inherit" });
  console.log("Готово");
}

generate();

[inputFolder, themeFolder, __dirname].forEach((folder) => {
  fs.watch(folder, { recursive: true }, (eventType, filename) => {
    if (filename) {
      if (!filename.endsWith("~")) {
        generate();
      }
    }
  });
});
