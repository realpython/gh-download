/**
 * Per-site branding, picked by the GitHub account in the `url` query
 * parameter: a github.com/realjs/... link gets the RealJS page. Anything
 * else gets Real Python, which is also what the static index.html shows
 * before this runs.
 */
export const BRANDS = {
  realpython: {
    slug: "realpython",
    name: "Real Python",
    title: "RP Materials Downloader",
    tagline: "Fetch source code for Real Python tutorials",
    logo: "https://files.realpython.com/media/realpython-primary-logo.c88c8ebecac9.png",
    favicon: "https://cdn.realpython.com/static/favicon.68cbf4197b0c.png",
    materialsUrl: "https://github.com/realpython/materials",
    siteUrl: "https://realpython.com",
    siteLabel: "Visit realpython.com »",
    supportUrl: "https://support.realpython.com/contact/",
  },
  realjs: {
    slug: "realjs",
    name: "RealJS",
    title: "RealJS Materials Downloader",
    tagline: "Fetch source code for RealJS tutorials",
    // The wordmark is white on the site's dark navbar, so the page needs
    // a dark-on-light copy too
    logo: "assets/realjs/logo-light.svg",
    logoDark: "assets/realjs/logo-dark.svg",
    favicon: "assets/realjs/favicon.png",
    materialsUrl: "https://github.com/realjs/materials",
    siteUrl: "https://realjs.com",
    siteLabel: "Visit realjs.com »",
    supportUrl: "https://realjs.com/contact/",
  },
};

export const DEFAULT_BRAND = BRANDS.realpython;

/**
 * @param {string|null} materialUrl the `url` query parameter
 * @returns {object} an entry of BRANDS
 */
export function brandForUrl(materialUrl) {
  let org;
  try {
    org = new URL(materialUrl).pathname.split("/").filter(Boolean)[0];
  } catch (e) {
    return DEFAULT_BRAND;
  }
  return BRANDS[org?.toLowerCase()] ?? DEFAULT_BRAND;
}

/**
 * Restyle the page for `brand`. index.html carries Real Python's copy, so
 * this only matters for the other brands, but it's safe to run for all.
 * @param {Document} doc
 * @param {object} brand an entry of BRANDS
 */
export function applyBrand(doc, brand) {
  doc.documentElement.dataset.brand = brand.slug;
  doc.title = brand.title;
  doc
    .querySelector('meta[name="description"]')
    ?.setAttribute("content", `Download ${brand.name} Tutorial Materials`);
  doc.querySelector('meta[name="author"]')?.setAttribute("content", brand.name);
  doc.querySelector('link[rel="icon"]')?.setAttribute("href", brand.favicon);

  const logo = doc.getElementById("logo");
  const dark = doc.defaultView?.matchMedia?.("(prefers-color-scheme: dark)");
  const setLogo = () => {
    logo.src = (dark?.matches && brand.logoDark) || brand.logo;
  };
  setLogo();
  dark?.addEventListener?.("change", setLogo);
  logo.alt = brand.name;
  doc.getElementById("tagline").textContent = brand.tagline;
  doc.getElementById("src-code").href = brand.materialsUrl;

  const siteLink = doc.getElementById("back-to-rp");
  siteLink.href = brand.siteUrl;
  siteLink.textContent = brand.siteLabel;
  doc.getElementById("support").href = brand.supportUrl;
}
