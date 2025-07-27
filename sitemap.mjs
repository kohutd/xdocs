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

// Read ignore file
const ignoreFilePath = path.join(inputFolder, ".xdocssitemapignore");
let ignoreRules = new Set();

if (fs.existsSync(ignoreFilePath)) {
  const content = fs.readFileSync(ignoreFilePath, "utf-8");
  ignoreRules = new Set(
    content
      .split("\n")
      .map(line => line.trim())
      .filter(line => line && !line.startsWith("#")) // Remove empty and comment lines
  );
}

// Helper to check if a path should be ignored
function isIgnored(relativePath) {
  for (const rule of ignoreRules) {
    if (
      relativePath === rule ||                  // Exact match
      relativePath.startsWith(rule + "/") ||    // Directory match
      relativePath.endsWith(rule)               // File pattern match
    ) {
      return true;
    }
  }
  return false;
}

const tree = { children: {} };

function walk(dir, parent, relativePath = "") {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const relPath = path.join(relativePath, file);
    if (isIgnored(relPath)) continue;

    const stats = fs.statSync(fullPath);

    if (stats.isDirectory()) {
      const node = { children: {} };
      parent.children[file] = node;
      walk(fullPath, node, relPath);
    } else {
      parent.children[file] = null;
    }
  }

  return parent;
}

walk(inputFolder, tree);

const sitemap = [];

function render(node, prefix = "", absolutePath = inputFolder) {
  for (const [key, value] of Object.entries(node.children)) {
    const currentPath = prefix ? `${prefix}/${key}` : key;
    const fullPath = path.join(absolutePath, key);

    if (value) {
      render(value, currentPath, fullPath);
    } else {
      if (
        key !== "404.html" &&
        key.endsWith(".html") &&
        !currentPath.includes("/ресурси") &&
        !currentPath.startsWith("ресурси/") &&
        !isIgnored(currentPath)
      ) {
        const stat = fs.statSync(fullPath);
        sitemap.push({
          url: "https://" + path.join(domain, currentPath),
          lastmod: stat.mtime.toISOString()
        });
      }
    }
  }
}

render(tree);

let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

for (const { url, lastmod } of sitemap) {
  xml += `
  <url>
    <loc>${url}</loc>
    <lastmod>${lastmod}</lastmod>
  </url>`;
}

xml += `
</urlset>`;

fs.writeFileSync(`${outputFolder}/sitemap.xml`, xml);
