#!/usr/bin/env node

import fs from "fs";
import path from "path";
import hljs from "./libraries/highlight.js";
import markdownIt from "./libraries/markdown-it.js";
import child_process from "node:child_process";

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

const md = markdownIt({
  html: true,
  highlight: (str, lang) => {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return `<pre><div class="XDocsCodeWrapper"><code class="hljs">${hljs.highlight(str, {
          language: lang,
          ignoreIllegals: true
        }).value}</code></div></pre>`;
      } catch (__) {
      }
    }
    return `<pre><div class="XDocsCodeWrapper"><code class="hljs">${md.utils.escapeHtml(str)}</code></div></pre>`;
  }
});

const documentationFileText = fs.readFileSync(`${inputFolder}/документація.json`, "utf8");
const documentationFile = JSON.parse(documentationFileText);

const pageTemplateText = fs.readFileSync(`${__dirname}/templates/page.template.html`, "utf8");
const navigationTemplateText = fs.readFileSync(`${__dirname}/templates/navigation.template.html`, "utf8");
const navigationItemLinkTemplateText = fs.readFileSync(`${__dirname}/templates/navigation_item_link.template.html`, "utf8");
const navigationItemSubmenuTemplateText = fs.readFileSync(`${__dirname}/templates/navigation_item_submenu.template.html`, "utf8");
const navigationItemSubmenuLinkTemplateText = fs.readFileSync(`${__dirname}/templates/navigation_item_submenu_link.template.html`, "utf8");
const searchTemplateText = fs.readFileSync(`${__dirname}/templates/search.template.html`, "utf8");

function renderPageTemplate(
  {
    icon,
    iconSize,
    favicon,
    title,
    head,
    navigation,
    content,
    scripts,
    prevUrl,
    nextUrl,
    urlPrefix,
    searchIframeUrl
  } = {}
) {
  return pageTemplateText
    .replaceAll("{{PAGE_ICON}}", icon ? `<div class="XDocsPageIcon"><img height="${iconSize}px" src="${icon}" alt=""></div>` : "")
    .replaceAll("{{PAGE_ICON_SIZE}}", `${iconSize}px`)
    .replaceAll("{{PAGE_FAVICON}}", favicon)
    .replaceAll("{{PAGE_TITLE}}", title)
    .replaceAll("{{PAGE_HEAD}}", head)
    .replaceAll("{{PAGE_NAVIGATION}}", navigation)
    .replaceAll("{{PAGE_CONTENT}}", content)
    .replaceAll("{{PAGE_SCRIPTS}}", scripts)
    .replaceAll("{{PAGE_PREV_BUTTON}}", prevUrl ? `<a data-is-prev="true" href="${prevUrl}">Відступ</>` : "")
    .replaceAll("{{PAGE_NEXT_BUTTON}}", nextUrl ? `<a data-is-next="true" href="${nextUrl}">Наступ</>` : "")
    .replaceAll("{{PAGE_SEARCH_IFRAME_URL}}", searchIframeUrl)
    .replaceAll("{{PAGE_URL_PREFIX}}", urlPrefix);
}

function renderNavigationTemplate({ logoUrl, logoImage, links, footerImage, footerText } = {}) {
  return navigationTemplateText
    .replaceAll("{{PAGE_NAVIGATION_LOGO_URL}}", logoUrl)
    .replaceAll("{{PAGE_NAVIGATION_LOGO_IMAGE}}", logoImage)
    .replaceAll("{{PAGE_NAVIGATION_LINKS}}", links)
    .replaceAll("{{PAGE_NAVIGATION_FOOTER_IMAGE}}", footerImage)
    .replaceAll("{{PAGE_NAVIGATION_FOOTER_TEXT}}", footerText);
}

function renderNavigationItemLinkTemplate({ name, url, active } = {}) {
  return navigationItemLinkTemplateText
    .replaceAll("{{PAGE_NAVIGATION_ITEM_LINK_NAME}}", name)
    .replaceAll("{{PAGE_NAVIGATION_ITEM_LINK_URL}}", url)
    .replaceAll("{{PAGE_NAVIGATION_ITEM_LINK_ACTIVE_CLASS}}", active ? "active" : "");
}

function renderNavigationItemSubmenuTemplate({ name, items, expanded } = {}) {
  return navigationItemSubmenuTemplateText
    .replaceAll("{{PAGE_NAVIGATION_ITEM_SUBMENU_NAME}}", name)
    .replaceAll("{{PAGE_NAVIGATION_ITEM_SUBMENU_ITEMS}}", items)
    .replaceAll("{{PAGE_NAVIGATION_ITEM_SUBMENU_EXPANDED}}", expanded ? "true" : "false");
}

function renderNavigationItemSubmenuLinkTemplate({ name, url, active } = {}) {
  return navigationItemSubmenuLinkTemplateText
    .replaceAll("{{PAGE_NAVIGATION_ITEM_SUBMENU_LINK_NAME}}", name)
    .replaceAll("{{PAGE_NAVIGATION_ITEM_SUBMENU_LINK_URL}}", url)
    .replaceAll("{{PAGE_NAVIGATION_ITEM_SUBMENU_LINK_ACTIVE_CLASS}}", active ? "active" : "");
}

fs.mkdirSync(outputFolder, { recursive: true });
fs.mkdirSync(`${outputFolder}/ресурси`, { recursive: true });

fs.cpSync(`${__dirname}/ядро`, `${outputFolder}/ресурси/ядро`, { recursive: true });
fs.cpSync(`${themeFolder}/ресурси`, `${outputFolder}/ресурси/тема`, { recursive: true });
if (fs.existsSync(`${themeFolder}/ресурси/тема.scss`)) {
  child_process.execSync(`sass ${themeFolder}/ресурси/тема.scss ${outputFolder}/ресурси/тема/тема.css`, { stdio: "inherit" });
  fs.rmSync(`${outputFolder}/ресурси/тема/тема.scss`, { force: true });
}

const pageHeadStyles = [
  "ресурси/ядро/highlight-atom-one-dark.css",
  "ресурси/тема/тема.css"
];
const pageHeadScripts = [];
const pageBodyScripts = [
  "ресурси/ядро/ядро.js",
  "ресурси/тема/тема.js"
];

function countSlashes(str) {
  return str.split("/").length - 1;
}

function repeatString(str, count) {
  return new Array(count).fill(str).join("");
}

let searchData = [];

let currentPageData = undefined;

function renderPage(page, prevPage, nextPage) {
  const pageIcon = page["іконка"];
  const pageName = page["назва"];
  const pageFile = `${inputFolder}/${page["файл"]}`;
  const pageOut = `${outputFolder}/${page["вихід"]}`;

  currentPageData = {};
  currentPageData.page = page;
  currentPageData.prevPage = prevPage;
  currentPageData.nextPage = nextPage;
  currentPageData.pageName = pageName;
  currentPageData.pageFile = pageFile;
  currentPageData.pageOut = pageOut;

  fs.mkdirSync(path.dirname(pageOut), { recursive: true });

  const pageMarkdownContent = fs.readFileSync(pageFile, "utf8");
  const pageHtmlContent = md.render(pageMarkdownContent);

  searchData.push({
    title: pageName,
    content: pageMarkdownContent,
    path: page["вихід"]
  });

  currentPageData.pageMarkdownContent = pageMarkdownContent;
  currentPageData.pageHtmlContent = pageHtmlContent;

  const urlPrefix = `${repeatString(".", countSlashes(page["вихід"]) + 1)}/`;

  const headStyles = pageHeadStyles.map((style) => `<link rel="stylesheet" href="${urlPrefix}${style}">`).join("\n");
  const headScripts = pageHeadScripts.map((script) => `<script src="${urlPrefix}${script}"></script>`).join("\n");
  const bodyScripts = pageBodyScripts.map((script) => `<script src="${urlPrefix}${script}"></script>`).join("\n");

  const renderedNavigation = renderNavigationTemplate({
    logoUrl: documentationFile["головна"],
    logoImage: urlPrefix + documentationFile["логотип"],
    links: documentationFile["сторінки"].map((documentationPage) => {
      if (documentationPage["сторінки"]) {
        const submenuLinks = documentationPage["сторінки"].map((documentationSubpage) => {
          return renderNavigationItemSubmenuLinkTemplate({
            name: documentationSubpage["назва"],
            url: `${urlPrefix}${documentationSubpage["вихід"]}`,
            active: documentationSubpage["назва"] === pageName
          });
        }).join("\n");
        return renderNavigationItemSubmenuTemplate({
          name: documentationPage["назва"],
          items: submenuLinks,
          expanded: documentationPage["сторінки"].some((documentationSubpage) => documentationSubpage["назва"] === pageName)
        });
      } else {
        return renderNavigationItemLinkTemplate({
          name: documentationPage["назва"],
          url: `${urlPrefix}${documentationPage["вихід"]}`,
          active: documentationPage["назва"] === pageName
        });
      }
    }).join("\n"),
    footerImage: urlPrefix + documentationFile["іконка_підпису"],
    footerText: documentationFile["підпис"]
  });

  const renderedPage = renderPageTemplate({
    icon: pageIcon ? urlPrefix + pageIcon : undefined,
    iconSize: page["висота_іконки"] ? page["висота_іконки"] : 50,
    favicon: urlPrefix + documentationFile["логотип"],
    title: `${pageName} | ${documentationFile["назва"]}`,
    head: headStyles + headScripts,
    navigation: renderedNavigation,
    content: pageHtmlContent,
    scripts: bodyScripts,
    prevUrl: prevPage ? `${urlPrefix}${prevPage["вихід"]}` : "",
    nextUrl: nextPage ? `${urlPrefix}${nextPage["вихід"]}` : "",
    urlPrefix: urlPrefix,
    searchIframeUrl: urlPrefix + "ресурси/search.html"
  });

  fs.writeFileSync(pageOut, renderedPage);
}

if (fs.existsSync(`${themeFolder}/розширити.js`)) {
  eval(fs.readFileSync(`${themeFolder}/розширити.js`, "utf8"));
}

documentationFile["сторінки"].flatMap((page) => {
  if (page["сторінки"]) {
    return page["сторінки"];
  } else {
    return page;
  }
}).forEach((page, index, array) => {
  renderPage(page, array[index - 1], array[index + 1]);
});

function renderSearch() {
  const searchTemplate = searchTemplateText
    .replaceAll("{{PAGE_SEARCH_DATA}}", JSON.stringify(searchData).replaceAll("\\", "\\\\").replaceAll("\"", "\\\""));
  fs.writeFileSync(`${outputFolder}/ресурси/search.html`, searchTemplate);
}

renderSearch();