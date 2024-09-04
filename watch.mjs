import fs from "fs";
import * as child_process from "node:child_process";
import path from "path";
import { parseArgv } from "./common.mjs";

const __filename = new URL(import.meta.url).pathname;
const __dirname = path.dirname(__filename);

const { inputFolder, outputFolder, themeFolder } = parseArgv();

if (!inputFolder) {
  console.error("Необхідно вказати шлях до документації параметром --вхід=");
  process.exit(1);
}

if (!outputFolder) {
  console.error("Необхідно вказати шлях до вихідної папки параметром --вихід=");
  process.exit(1);
}

if (!themeFolder) {
  console.error("Необхідно вказати шлях до теми параметром --вигляд=");
  process.exit(1);
}

function generate() {
  console.log("Генерація...");
  child_process.execSync(
    `node ${__dirname}/generate.mjs ${inputFolder} ${outputFolder} ${themeFolder}`,
    { stdio: "inherit" },
  );
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
