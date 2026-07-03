import { readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { execFileSync } from "child_process";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const mdPath = join(root, "docs/barakova-learning-guide.md");
const htmlPath = join(root, "docs/barakova-learning-guide.html");
const pdfPath = join(root, "docs/barakova-learning-guide.pdf");
const chromePath =
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const markdown = readFileSync(mdPath, "utf8");

const html = `<!DOCTYPE html>
<html lang="bg">
<head>
  <meta charset="utf-8" />
  <title>Barakova Luxury Travel — Технически учебник</title>
  <style>
    @page { margin: 18mm 14mm; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      line-height: 1.55;
      color: #2d2a26;
      font-size: 11pt;
      max-width: 100%;
    }
    h1 { font-size: 22pt; border-bottom: 2px solid #c8a96a; padding-bottom: 0.3em; }
    h2 { font-size: 16pt; margin-top: 1.6em; color: #7a6652; page-break-after: avoid; }
    h3 { font-size: 13pt; margin-top: 1.2em; page-break-after: avoid; }
    h4 { font-size: 11.5pt; }
    pre, code {
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      font-size: 9pt;
    }
    pre {
      background: #f8f3ec;
      border: 1px solid #e8dcc8;
      border-radius: 6px;
      padding: 0.8em 1em;
      overflow-x: auto;
      white-space: pre-wrap;
      word-break: break-word;
      page-break-inside: avoid;
    }
    code { background: #f8f3ec; padding: 0.1em 0.3em; border-radius: 3px; }
    pre code { background: none; padding: 0; }
    table { border-collapse: collapse; width: 100%; margin: 1em 0; font-size: 10pt; }
    th, td { border: 1px solid #e8dcc8; padding: 0.45em 0.6em; text-align: left; }
    th { background: #f8f3ec; }
    blockquote {
      border-left: 4px solid #c8a96a;
      margin: 1em 0;
      padding: 0.2em 1em;
      color: #555;
    }
    hr { border: none; border-top: 1px solid #e8dcc8; margin: 2em 0; }
    a { color: #7a6652; }
    ul, ol { padding-left: 1.4em; }
    li { margin: 0.25em 0; }
  </style>
</head>
<body>
${simpleMarkdownToHtml(markdown)}
</body>
</html>`;

writeFileSync(htmlPath, html, "utf8");

execFileSync(chromePath, [
  "--headless=new",
  "--disable-gpu",
  "--no-sandbox",
  `--print-to-pdf=${pdfPath}`,
  htmlPath,
]);

console.log(`Created ${pdfPath}`);

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function simpleMarkdownToHtml(md) {
  const lines = md.split("\n");
  const output = [];
  let inCode = false;
  let codeLang = "";
  let inList = false;
  let listType = "ul";

  const closeList = () => {
    if (inList) {
      output.push(`</${listType}>`);
      inList = false;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith("```")) {
      if (!inCode) {
        closeList();
        codeLang = line.slice(3).trim();
        inCode = true;
        output.push(`<pre><code class="language-${escapeHtml(codeLang)}">`);
      } else {
        inCode = false;
        output.push("</code></pre>");
      }
      continue;
    }

    if (inCode) {
      output.push(escapeHtml(line));
      continue;
    }

    if (line.startsWith("# ")) {
      closeList();
      output.push(`<h1>${inline(line.slice(2))}</h1>`);
      continue;
    }
    if (line.startsWith("## ")) {
      closeList();
      output.push(`<h2>${inline(line.slice(3))}</h2>`);
      continue;
    }
    if (line.startsWith("### ")) {
      closeList();
      output.push(`<h3>${inline(line.slice(4))}</h3>`);
      continue;
    }
    if (line.startsWith("#### ")) {
      closeList();
      output.push(`<h4>${inline(line.slice(5))}</h4>`);
      continue;
    }

    if (line.trim() === "---") {
      closeList();
      output.push("<hr />");
      continue;
    }

    if (line.startsWith("> ")) {
      closeList();
      output.push(`<blockquote><p>${inline(line.slice(2))}</p></blockquote>`);
      continue;
    }

    if (/^\|.+\|$/.test(line.trim()) && line.includes("|")) {
      closeList();
      const cells = line
        .trim()
        .slice(1, -1)
        .split("|")
        .map((cell) => cell.trim());
      if (cells.every((cell) => /^-+$/.test(cell))) {
        continue;
      }
      const nextIsHeader = i > 0 && /^\|.+\|$/.test(lines[i - 1]?.trim() ?? "");
      const tag = nextIsHeader && /^\|[-| :]+\|$/.test(lines[i + 1]?.trim() ?? "") ? "th" : "td";
      if (tag === "th" || (i > 0 && /^\|[-| :]+\|$/.test(lines[i - 1]?.trim() ?? ""))) {
        if (tag === "th" && !output[output.length - 1]?.endsWith("</tr>")) {
          if (!output[output.length - 1]?.includes("<table>")) {
            output.push("<table><tbody>");
          }
        }
      }
      if (i + 1 < lines.length && /^\|[-| :]+\|$/.test(lines[i + 1]?.trim() ?? "")) {
        output.push("<table><thead><tr>");
        output.push(cells.map((cell) => `<th>${inline(cell)}</th>`).join(""));
        output.push("</tr></thead><tbody>");
        i += 1;
        continue;
      }
      if (!output[output.length - 1]?.includes("<tbody>") && !output[output.length - 1]?.includes("<table>")) {
        output.push("<table><tbody>");
      }
      output.push("<tr>");
      output.push(cells.map((cell) => `<td>${inline(cell)}</td>`).join(""));
      output.push("</tr>");
      if (i + 1 >= lines.length || !/^\|.+\|$/.test(lines[i + 1]?.trim() ?? "")) {
        output.push("</tbody></table>");
      }
      continue;
    }

    if (/^[-*] /.test(line)) {
      if (!inList || listType !== "ul") {
        closeList();
        output.push("<ul>");
        inList = true;
        listType = "ul";
      }
      output.push(`<li>${inline(line.slice(2))}</li>`);
      continue;
    }

    if (/^\d+\. /.test(line)) {
      if (!inList || listType !== "ol") {
        closeList();
        output.push("<ol>");
        inList = true;
        listType = "ol";
      }
      output.push(`<li>${inline(line.replace(/^\d+\.\s/, ""))}</li>`);
      continue;
    }

    if (line.trim() === "") {
      closeList();
      continue;
    }

    closeList();
    output.push(`<p>${inline(line)}</p>`);
  }

  closeList();
  if (inCode) {
    output.push("</code></pre>");
  }

  return output.join("\n");
}

function inline(text) {
  return escapeHtml(text)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
}
