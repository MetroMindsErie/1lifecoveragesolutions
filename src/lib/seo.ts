type JsonLd = Record<string, any> | Array<Record<string, any>>;

export function absUrl(path: string) {
  const base = (import.meta as any).env?.VITE_SITE_URL || window.location.origin;
  if (path.startsWith("http")) return path;
  return `${base}${path.startsWith("/") ? "" : "/"}${path}`;
}

function ensureMeta(nameOrProperty: { name?: string; property?: string }) {
  const selector = nameOrProperty.name
    ? `meta[name="${nameOrProperty.name}"]`
    : `meta[property="${nameOrProperty.property}"]`;
  let el = document.head.querySelector(selector) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    if (nameOrProperty.name) el.setAttribute("name", nameOrProperty.name);
    if (nameOrProperty.property) el.setAttribute("property", nameOrProperty.property);
    document.head.appendChild(el);
  }
  return el;
}

function ensureLink(rel: string) {
  let el = document.head.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  return el;
}

export function setHead({
  title,
  description,
  canonicalPath,
  ogImage,
  noindex,
  jsonLd,
}: {
  title: string;
  description?: string;
  canonicalPath?: string;
  ogImage?: string;
  noindex?: boolean;
  jsonLd?: JsonLd;
}) {
  const SITE = "1Life Coverage Solutions";
  const resolvedCanonical = absUrl(canonicalPath || window.location.pathname);

  // Title
  document.title = `${title} | ${SITE}`;

  // Basic meta
  if (description) {
    ensureMeta({ name: "description" }).setAttribute("content", description);
  }

  // Robots
  if (noindex) {
    ensureMeta({ name: "robots" }).setAttribute("content", "noindex,nofollow");
  } else {
    // Default: index
    ensureMeta({ name: "robots" }).setAttribute("content", "index,follow");
  }

  // Canonical
  ensureLink("canonical").setAttribute("href", resolvedCanonical);

  // Open Graph
  ensureMeta({ property: "og:site_name" }).setAttribute("content", SITE);
  ensureMeta({ property: "og:title" }).setAttribute("content", `${title} | ${SITE}`);
  if (description) ensureMeta({ property: "og:description" }).setAttribute("content", description);
  ensureMeta({ property: "og:url" }).setAttribute("content", resolvedCanonical);
  ensureMeta({ property: "og:type" }).setAttribute("content", "website");
  if (ogImage) ensureMeta({ property: "og:image" }).setAttribute("content", absUrl(ogImage));

  // Twitter
  const twitterCard = ogImage ? "summary_large_image" : "summary";
  ensureMeta({ name: "twitter:card" }).setAttribute("content", twitterCard);
  ensureMeta({ name: "twitter:title" }).setAttribute("content", title);
  if (description) ensureMeta({ name: "twitter:description" }).setAttribute("content", description);
  if (ogImage) ensureMeta({ name: "twitter:image" }).setAttribute("content", absUrl(ogImage));

  // JSON-LD (dedupe)
  document.head.querySelectorAll('script[data-seo-jsonld="1"]').forEach((n) => n.remove());
  if (jsonLd) {
    const s = document.createElement("script");
    s.type = "application/ld+json";
    s.setAttribute("data-seo-jsonld", "1");
    s.textContent = JSON.stringify(jsonLd);
    document.head.appendChild(s);
  }
}

export function buildInsuranceAgencyJsonLd({
  canonicalPath,
}: {
  canonicalPath?: string;
}): JsonLd {
  const url = absUrl(canonicalPath || window.location.pathname);
  return {
    "@context": "https://schema.org",
    "@type": "InsuranceAgency",
    name: "1Life Coverage Solutions",
    url,
  };
}
