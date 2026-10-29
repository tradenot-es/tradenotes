/**
 * Who runs this instance. Used by the legal pages and the contact page; the texts themselves
 * live in the language files under "legal" and get these values filled in.
 */
export const operator = {
  name: "nevs84",
  email: "info@tradenot.es",
  // date of the current version of the privacy policy and terms (shown as "last updated")
  legalUpdated: "2026-10-29",
  // public source code (AGPL): shown in the footer once set. Stays null while the repo is private,
  // a link to a private repo would only show visitors a 404.
  sourceUrl: null as string | null, // "https://github.com/tradenot-es/tradenotes"
};
