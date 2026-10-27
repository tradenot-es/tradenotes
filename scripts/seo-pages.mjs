// After `vite build`: one dist/<path>/index.html per public page with that page's title,
// description, canonical URL and Open Graph tags (German, the site's default), so
// crawlers and link previews that do not run JavaScript see the right head. The
// server serves the directory index for /<path>; the app itself is unchanged.
import { mkdir, readFile, writeFile } from "node:fs/promises";

const SITE = "https://tradenot.es";
const dist = new URL("../dist/", import.meta.url);
const de = JSON.parse(await readFile(new URL("../src/i18n/locales/de.json", import.meta.url), "utf8"));

const PAGES = [
  { path: "/features", seo: de.features.seo },
  { path: "/warum-trading-journal", seo: de.seo.whyJournal },
  { path: "/hilfe", seo: de.seo.help },
  { path: "/kontakt", seo: de.seo.contact },
  { path: "/status", seo: de.seo.status },
  { path: "/impressum", seo: de.seo.imprint },
  { path: "/datenschutz", seo: de.seo.privacy },
  { path: "/agb", seo: de.seo.terms },
  { path: "/auth", seo: de.seo.auth, noindex: true },
];

const escape = (s) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
const html = await readFile(new URL("index.html", dist), "utf8");

/** Replaces the content of one meta tag; fails loudly if index.html changed shape. */
function setTag(doc, pattern, value) {
  if (!pattern.test(doc)) throw new Error(`seo-pages: ${pattern} not found in index.html`);
  return doc.replace(pattern, (_, before, after) => `${before}${escape(value)}${after}`);
}

for (const page of PAGES) {
  const url = `${SITE}${page.path}`;
  let doc = html;
  doc = setTag(doc, /(<title>)[^<]*(<\/title>)/, page.seo.title);
  doc = setTag(doc, /(<meta name="description" content=")[^"]*(")/, page.seo.description);
  doc = setTag(doc, /(<meta property="og:title" content=")[^"]*(")/, page.seo.title);
  doc = setTag(doc, /(<meta property="og:description" content=")[^"]*(")/, page.seo.description);
  doc = setTag(doc, /(<meta property="og:url" content=")[^"]*(")/, url);
  doc = setTag(doc, /(<meta name="twitter:title" content=")[^"]*(")/, page.seo.title);
  doc = setTag(doc, /(<meta name="twitter:description" content=")[^"]*(")/, page.seo.description);
  doc = setTag(doc, /(<link rel="canonical" href=")[^"]*(")/, url);
  if (page.noindex) doc = doc.replace("</head>", '    <meta name="robots" content="noindex, nofollow" />\n  </head>');
  const dir = new URL(`.${page.path}/`, dist);
  await mkdir(dir, { recursive: true });
  await writeFile(new URL("index.html", dir), doc);
}
console.log(`seo-pages: ${PAGES.length} pages written`);
