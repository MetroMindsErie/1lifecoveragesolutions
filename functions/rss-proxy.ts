const ALLOWED_HOSTS = new Set(["insurancejournal.com", "www.insurancejournal.com"]);

function isAllowed(url: URL) {
  if (!ALLOWED_HOSTS.has(url.hostname)) return false;
  return true;
}

export async function onRequestGet({ request }: { request: Request }) {
  const { searchParams } = new URL(request.url);
  const target = searchParams.get("url");

  if (!target) {
    return new Response("Missing url", { status: 400 });
  }

  let targetUrl: URL;
  try {
    targetUrl = new URL(target);
  } catch {
    return new Response("Invalid url", { status: 400 });
  }

  if (!isAllowed(targetUrl)) {
    return new Response("Forbidden", { status: 403 });
  }

  const upstream = await fetch(targetUrl.toString(), {
    headers: {
      "User-Agent": "1lifecoverage-rss-proxy/1.0",
      "Accept": "application/rss+xml, application/xml;q=0.9, */*;q=0.8",
    },
  });

  const body = await upstream.text();

  return new Response(body, {
    status: upstream.status,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=300",
    },
  });
}
