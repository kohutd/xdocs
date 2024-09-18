import path from "path";
import { parseArgv } from "./common.mjs";
import fs from "fs";

const __filename = new URL(import.meta.url).pathname;
const __dirname = path.dirname(__filename);

const { inputFolder, outputFolder, domain } = parseArgv();

if (!inputFolder) {
  console.error("Необхідно вказати шлях до документації параметром --вхід=");
  process.exit(1);
}

if (!outputFolder) {
  console.error("Необхідно вказати шлях до вихідної папки параметром --вихід=");
  process.exit(1);
}

if (!domain) {
  console.error("Необхідно вказати домен сайту параметром --домен=");
  process.exit(1);
}

const tree = { children: {} };

function walk(dir, parent) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stats = fs.statSync(fullPath);

    if (stats.isDirectory()) {
      const node = { children: {} };
      parent.children[file] = node;
      walk(fullPath, node);
    } else {
      parent.children[file] = null;
    }
  }

  return parent;
}

walk(inputFolder, tree);

const sitemap = [];

function render(node, prefix = "") {
  for (const [key, value] of Object.entries(node.children)) {
    if (value) {
      render(value, `${prefix}/${key}`);
    } else {
      if (
        key !== "404.html" &&
        key.endsWith(".html") &&
        prefix.indexOf("/ресурси") === -1 &&
        !prefix.startsWith("ресурси/")
      ) {
        sitemap.push("https://" + path.join(domain, prefix, key));
      }
    }
  }
}

render(tree);

let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

for (const url of sitemap) {
  xml += `
  <url>
    <loc>${url}</loc>
  </url>`;
}

xml += `
</urlset>`;

fs.writeFileSync(`${outputFolder}/sitemap.xml`, xml);
