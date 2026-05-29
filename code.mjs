import { parseArgv } from "./common.mjs";

import fs from "fs";
import path from "path";

import { bundledLanguages, createHighlighter } from "shiki";

const __filename = new URL(import.meta.url).pathname;
const __dirname = path.dirname(__filename);

const cwd = process.cwd();

const { input, output, title } = parseArgv();

let highlighter = await createHighlighter({
  themes: ["github-dark-default"],
  langs: Object.keys(bundledLanguages),
});

if (fs.existsSync(`${cwd}/докс_розширити_код.js`)) {
  let докс_розширити_код;

  eval(fs.readFileSync(`${cwd}/докс_розширити_код.js`, "utf-8"));

  await докс_розширити_код();
}

let jsonTree = { children: [] };

async function walk(dir, treeNode) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const relPath = path.relative(input, fullPath);
    const filename = path.basename(fullPath);
    if (fs.statSync(fullPath).isDirectory()) {
      const node = { type: "folder", name: filename, children: [] };
      treeNode.children.push(node);
      await walk(fullPath, node);
    } else {
      console.log(fullPath);
      const node = { type: "file", name: filename, path: relPath };
      treeNode.children.push(node);

      const code = fs.readFileSync(fullPath, "utf-8");

      const EXT_MAP = {
        h: "c",
        hh: "cpp",
        hpp: "cpp",
        hxx: "cpp",
        cc: "cpp",
        cxx: "cpp",
        mjs: "javascript",
        cjs: "javascript",
        ts: "typescript",
        tsx: "tsx",
        jsx: "jsx",
        sh: "bash",
        bash: "bash",
        zsh: "bash",
        yml: "yaml",
        ц: "ціль",
        м: "мавка",
      };

      let lang =
        EXT_MAP[path.extname(fullPath).slice(1)] ??
        path.extname(fullPath).slice(1);

      let html;

      if (!highlighter.getLoadedLanguages().includes(lang)) {
        lang = "plaintext";
      }

      html = await highlighter.codeToHtml(code, {
        lang,
        theme: "github-dark-default",
      });

      const outputPath = path.join(output, relPath + ".html");

      fs.mkdirSync(path.dirname(outputPath), { recursive: true });

      fs.writeFileSync(
        outputPath,
        `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>${fullPath}</title>
  <style>
    html, body, pre {
      margin: 0;
      font-family: monospace;
      background: #0d1117;
    }

    .shiki {
      padding: 1rem;
    }
  </style>
</head>
<body>
  ${html}
</body>
</html>`,
      );
    }
  }
}

await walk(input, jsonTree);

const codeTemplate = fs.readFileSync(
  `${__dirname}/templates/code.template.html`,
  "utf-8",
);

const codeOutput = codeTemplate
  .replaceAll("{{PAGE_NAME}}", title)
  .replaceAll("{{TREE}}", JSON.stringify(jsonTree))
  .replaceAll("{{ICONS}}", JSON.stringify({}));

fs.writeFileSync(`${output}/index.html`, codeOutput);
