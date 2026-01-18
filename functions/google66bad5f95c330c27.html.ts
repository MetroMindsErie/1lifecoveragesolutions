const VERIFICATION_FILENAME = "google66bad5f95c330c27.html";

export const onRequest = async () => {
  // Google accepts the verification string in the response body.
  const body = `google-site-verification: ${VERIFICATION_FILENAME}\n`;

  return new Response(body, {
    status: 200,
    headers: {
      // Google asks for an HTML file; serving the required text with HTML content-type is fine.
      "content-type": "text/html; charset=utf-8",
      "cache-control": "public, max-age=300, must-revalidate",
    },
  });
};
