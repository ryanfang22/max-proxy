// Vercel Serverless Function: MAX API CORS Proxy
export default async function handler(req, res) {
  let target = req.query.url || req.url?.replace(/^\/api\/proxy\/?/, "");

  if (req.method === "OPTIONS") {
    setCors(res);
    return res.status(204).end();
  }

  try {
    target = decodeURIComponent(target || "");
  } catch (e) {}

  if (!target || !/^https?:\/\/max-api\.maicoin\.com\//i.test(target)) {
    setCors(res);
    return res.status(403).send("Only max-api.maicoin.com is allowed");
  }

  try {
    const upstream = await fetch(target, { method: "GET" });

    setCors(res);
    res.setHeader("content-type", upstream.headers.get("content-type") || "application/json");
    res.status(upstream.status);
    const buf = Buffer.from(await upstream.arrayBuffer());
    return res.send(buf);
  } catch (err) {
    setCors(res);
    return res.status(502).send("Upstream fetch error: " + (err?.message || err));
  }
}

function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
}
