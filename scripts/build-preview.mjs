#!/usr/bin/env node
/**
 * Builds the standalone homepage preview (preview/out/index.html):
 * compiles the shared interaction modules with tsc to CommonJS, bundles them
 * with a tiny CommonJS wrapper (no npm needed), and inlines CSS + JS into the
 * template. The Next.js app imports the same modules directly.
 */
import { execSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync, rmSync } from "node:fs";
import { dirname, resolve, relative, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const out = resolve(root, "preview/out");
const cjs = resolve(out, "cjs");
rmSync(cjs, { recursive: true, force: true });
mkdirSync(cjs, { recursive: true });

const tsconfig = {
  compilerOptions: {
    target: "ES2019",
    module: "commonjs",
    rootDir: root,
    outDir: cjs,
    strict: true,
    lib: ["ES2020", "DOM", "DOM.Iterable"],
    skipLibCheck: true,
    removeComments: true,
    resolveJsonModule: true,
    esModuleInterop: true,
    types: [],
  },
  files: [resolve(root, "preview/entry.ts")],
};
writeFileSync(resolve(out, "tsconfig.preview.json"), JSON.stringify(tsconfig, null, 2));
execSync(`tsc -p ${resolve(out, "tsconfig.preview.json")}`, { stdio: "inherit", cwd: root });

// collect compiled files
const files = [];
const walk = (d) => {
  for (const f of readdirSync(d)) {
    const p = join(d, f);
    if (statSync(p).isDirectory()) walk(p);
    else if (p.endsWith(".js") || p.endsWith(".json")) files.push(p);
  }
};
walk(cjs);

const modules = files
  .map((p) => {
    const id = relative(cjs, p).replace(/\\/g, "/").replace(/\.js$/, "");
    const raw = readFileSync(p, "utf8");
    const code = p.endsWith(".json") ? `module.exports = ${raw};` : raw;
    return `  ${JSON.stringify(id)}: function (module, exports, require) {\n${code}\n  },`;
  })
  .join("\n");

const js = `(function () {
var modules = {
${modules}
};
var cache = {};
function resolvePath(from, spec) {
  var base = from.split("/"); base.pop();
  spec.split("/").forEach(function (part) { if (part === "..") base.pop(); else if (part !== ".") base.push(part); });
  return base.join("/");
}
function load(id) {
  if (cache[id]) return cache[id].exports;
  var fn = modules[id]; if (!fn) throw new Error("module not found: " + id);
  var module = { exports: {} }; cache[id] = module;
  fn(module, module.exports, function (spec) { return load(resolvePath(id, spec)); });
  return module.exports;
}
load("preview/entry");
})();`;

const css = readFileSync(resolve(root, "src/styles/site.css"), "utf8");
const dict = JSON.parse(readFileSync(resolve(root, "src/content/i18n.json"), "utf8"));
const ar = (k) => (dict[k] ? dict[k].ar : k);
// Fill the Arabic default into every data-t element and attribute so the page is right before JS runs.
const tpl = readFileSync(resolve(root, "preview/template.html"), "utf8")
  .replace(/(<([a-z0-9]+)\b[^>]*\bdata-t="([^"]+)"[^>]*>)(<\/\2>)/g, (m, open, tag, key, close) => open + ar(key) + close)
  .replace(/data-t-aria="([^"]+)"/g, (m, key) => `data-t-aria="${key}" aria-label="${ar(key)}"`)
  .replace(/data-t-title="([^"]+)"/g, (m, key) => `data-t-title="${key}" title="${ar(key)}"`);
const html = tpl.replace("{{CSS}}", () => css).replace("{{JS}}", () => js);
writeFileSync(resolve(out, "index.html"), html);
// Artifact variant: the claude.ai artifact host supplies the document skeleton,
// so emit only the head tags (title/meta/link/style) followed by the body content.
const head = tpl.match(/<head>([\s\S]*?)<\/head>/)[1]
  .replace(/<meta charset[^>]*>\s*/i, "")
  .replace(/<meta name="viewport"[^>]*>\s*/i, "")
  .replace("<title>", '<meta name="claude:viewport-fit-sides" content="cover">\n<title>');
const bodyInner = tpl.match(/<body>([\s\S]*?)<\/body>/)[1];
const artifact = (head + bodyInner).replace("{{CSS}}", () => css).replace("{{JS}}", () => js);
writeFileSync(resolve(out, "artifact.html"), artifact.trim() + "\n");
console.log(`preview written: ${resolve(out, "index.html")} (${(html.length / 1024).toFixed(0)} KB)`);
