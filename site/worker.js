// Ancient Firelight — private season preview.
// Serves an episode index at / and streams each cut from R2 with Range support.

const EPISODES = [
  { id: "EP01", key: "EP01.mp4", num: "Episode 01",
    title: "What Did Ancient Humans Do at Night?",
    blurb: "The predator story has no study behind it. What's actually there is stranger.",
    len: "11:35" },
  { id: "EP02", key: "EP02.mp4", num: "Episode 02",
    title: "The Hand",
    blurb: "A hand pressed to a wall 67,800 years ago — with the fingertips filed to points.",
    len: "11:03" },
  { id: "EP03", key: "EP03.mp4", num: "Episode 03",
    title: "Boredom",
    blurb: "The oldest drawing we have was made by somebody with nothing to do. That's the whole engine.",
    len: "9:37" },
  { id: "EP04", key: "EP04.mp4", num: "Episode 04",
    title: "The Flute",
    blurb: "One bone, two holes, two irreconcilable stories — and the bone is not taking sides.",
    len: "8:55" },
  { id: "EP05", key: "EP05.mp4", num: "Episode 05",
    title: "The Affair",
    blurb: "Not a conquest. A 7,000-year blending — and you're carrying the evidence right now.",
    len: "10:16" },
  { id: "EP06", key: "EP06.mp4", num: "Episode 06",
    title: "The Worst Mistake",
    blurb: "The 15-hour forager paradise was real, and a mirage. Paradise worked a 42-hour week.",
    len: "8:55" },
];

function page() {
  const cards = EPISODES.map(e => `
    <article class="ep">
      <div class="ephead">
        <span class="num">${e.num}</span>
        <span class="len">${e.len}</span>
      </div>
      <h2>${e.title}</h2>
      <p class="blurb">${e.blurb}</p>
      <div class="frame">
        <video controls playsinline preload="none" src="/${e.id}.mp4"></video>
      </div>
    </article>`).join("");

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Ancient Firelight — Season Preview</title>
<style>
  :root { color-scheme: dark; }
  * { box-sizing: border-box; }
  html, body { margin: 0; }
  body {
    background: #0b0705; color: #f7f1e8;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    padding: 40px 16px 72px;
    background-image: radial-gradient(120% 70% at 50% 0%, #1e120a 0%, #0b0705 55%, #060403 100%);
    background-attachment: fixed;
  }
  .wrap { width: 100%; max-width: 900px; margin: 0 auto; }
  header { text-align: center; margin-bottom: 40px; }
  .brand {
    letter-spacing: 0.18em; text-transform: uppercase;
    font-size: clamp(12px, 2.4vw, 15px); font-weight: 600; color: #f0904a;
  }
  h1 { margin: 10px 0 6px; font-size: clamp(24px, 5vw, 38px); }
  .sub { color: #8a7e6e; font-size: 15px; margin: 0; }
  .ep { margin: 0 0 46px; }
  .ephead {
    display: flex; justify-content: space-between; align-items: baseline;
    border-bottom: 1px solid rgba(240,144,74,0.22); padding-bottom: 7px; margin-bottom: 12px;
  }
  .num { letter-spacing: 0.14em; text-transform: uppercase; font-size: 12.5px; font-weight: 600; color: #c4451f; }
  .len { font-size: 12.5px; color: #8a7e6e; font-variant-numeric: tabular-nums; }
  h2 { margin: 0 0 6px; font-size: clamp(19px, 3.4vw, 25px); }
  .blurb { margin: 0 0 14px; color: #a2968a; font-size: 15px; line-height: 1.5; }
  .frame {
    border: 1px solid rgba(240,144,74,0.24); border-radius: 12px; overflow: hidden;
    box-shadow: 0 0 44px rgba(196,69,31,0.22), 0 14px 44px rgba(0,0,0,0.55); background: #000;
  }
  video { display: block; width: 100%; height: auto; background: #000; }
  footer { text-align: center; color: #6a6058; font-size: 13px; margin-top: 8px; line-height: 1.6; }
</style>
</head>
<body>
  <div class="wrap">
    <header>
      <div class="brand">Ancient Firelight</div>
      <h1>Season Preview</h1>
      <p class="sub">Unreleased cuts, for review. Best with sound on.</p>
    </header>
    ${cards}
    <footer>More episodes appear here as they finish rendering.<br>Private link — please don’t share publicly before launch.</footer>
  </div>
</body>
</html>`;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/" || url.pathname === "/index.html") {
      return new Response(page(), {
        headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-cache" },
      });
    }

    const m = url.pathname.match(/^\/(EP\d{2})\.mp4$/);
    if (m) {
      const ep = EPISODES.find(e => e.id === m[1]);
      if (!ep) return new Response("Not found", { status: 404 });
      if (request.method !== "GET" && request.method !== "HEAD") {
        return new Response("Method Not Allowed", { status: 405 });
      }

      const object = await env.MEDIA.get(ep.key, { range: request.headers, onlyIf: request.headers });
      if (object === null) return new Response("Not found", { status: 404 });

      const headers = new Headers();
      object.writeHttpMetadata(headers);
      headers.set("etag", object.httpEtag);
      headers.set("accept-ranges", "bytes");
      headers.set("content-type", "video/mp4");
      headers.set("cache-control", "public, max-age=86400");

      if (!("body" in object) || object.body === undefined) {
        headers.set("content-length", "0");
        return new Response(null, { status: 304, headers });
      }

      let status = 200;
      const hasRange = request.headers.get("range") !== null;
      if (hasRange && object.range) {
        const offset = object.range.offset ?? 0;
        const length = object.range.length ?? object.size - offset;
        headers.set("content-range", `bytes ${offset}-${offset + length - 1}/${object.size}`);
        headers.set("content-length", String(length));
        status = 206;
      } else {
        headers.set("content-length", String(object.size));
      }

      if (request.method === "HEAD") return new Response(null, { status, headers });
      return new Response(object.body, { status, headers });
    }

    // legacy single-episode path from the first preview link
    if (url.pathname === "/ep01.mp4") {
      return Response.redirect(new URL("/EP01.mp4", url).toString(), 301);
    }

    return new Response("Not found", { status: 404 });
  },
};
