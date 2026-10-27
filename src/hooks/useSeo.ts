import { useEffect } from "react";

const SITE = "https://tradenot.es";
const OG_LOCALES: Record<string, string> = { de: "de_DE", en: "en_US", es: "es_ES", fr: "fr_FR", it: "it_IT", nl: "nl_NL" };

interface Seo {
  title: string;
  description: string;
  /** path of this page, e.g. "/features"; becomes the canonical URL */
  path: string;
  language: string;
  /** schema.org objects, rendered as JSON-LD */
  structuredData?: object[];
}

function setMeta(selector: string, attr: "name" | "property", key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  const previous = el.content;
  el.content = content;
  return () => {
    el!.content = previous;
  };
}

/**
 * Per-page title, description, canonical URL, Open Graph/Twitter tags and JSON-LD.
 * index.html holds the home page defaults; they are restored when the page unmounts.
 */
export function useSeo({ title, description, path, language, structuredData = [] }: Seo) {
  const data = JSON.stringify(structuredData);
  useEffect(() => {
    const url = `${SITE}${path}`;
    const previousTitle = document.title;
    document.title = title;
    const restore = [
      setMeta('meta[name="description"]', "name", "description", description),
      setMeta('meta[property="og:title"]', "property", "og:title", title),
      setMeta('meta[property="og:description"]', "property", "og:description", description),
      setMeta('meta[property="og:url"]', "property", "og:url", url),
      setMeta('meta[property="og:locale"]', "property", "og:locale", OG_LOCALES[language.slice(0, 2)] ?? "en_US"),
      setMeta('meta[name="twitter:title"]', "name", "twitter:title", title),
      setMeta('meta[name="twitter:description"]', "name", "twitter:description", description),
    ];

    const canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    const previousCanonical = canonical?.href;
    if (canonical) canonical.href = url;

    const scripts = (JSON.parse(data) as object[]).map((obj) => {
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.text = JSON.stringify(obj);
      document.head.appendChild(script);
      return script;
    });

    document.documentElement.lang = language.slice(0, 2);
    return () => {
      document.title = previousTitle;
      restore.forEach((r) => r());
      if (canonical && previousCanonical) canonical.href = previousCanonical;
      scripts.forEach((s) => s.remove());
    };
  }, [title, description, path, language, data]);
}
