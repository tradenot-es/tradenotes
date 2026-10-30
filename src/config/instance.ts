/**
 * Settings of the running installation: the official tradenot.es or a self-hosted one. The
 * server writes them into every page as <meta name="tn-instance"> (server/src/index.ts), because
 * the frontend is built once into the Docker image and has to work for both. In development
 * (Vite serves the page) VITE_SELF_HOSTED=true switches to the self-hosted look.
 */
interface Instance {
  /** self-hosted: no landing, marketing or legal pages, no newsletter, contact or feedback mail */
  selfHosted: boolean;
  /** a mail server is set up (confirmation and reset mails can be sent) */
  mail: boolean;
  version: string;
}

function read(): Instance {
  const fallback: Instance = { selfHosted: import.meta.env.VITE_SELF_HOSTED === "true", mail: true, version: "dev" };
  const content = typeof document !== "undefined" ? document.querySelector('meta[name="tn-instance"]')?.getAttribute("content") : null;
  if (!content) return fallback;
  try {
    return { ...fallback, ...JSON.parse(content) };
  } catch {
    return fallback;
  }
}

export const instance = read();
