export const onRequest = async () => {
  const body = [
    "User-agent: *",
    "Disallow: /admin/",
    "Allow: /",
    "",
    "Sitemap: https://1lifecoverage.com/sitemap.xml",
    "",
  ].join("\n");

  return new Response(body, {
    status: 200,
    headers: {
      "content-type": "text/plain; charset=utf-8",
      // Keep it reasonably cacheable; crawlers re-fetch periodically.
      "cache-control": "public, max-age=14400, must-revalidate",
    },
  });
};
