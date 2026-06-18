const SUPABASE_URL = 'https://cjljktituvuamjwksuxg.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNqbGprdGl0dXZ1YW1qd2tzdXhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzczODQzMTcsImV4cCI6MjA5Mjk2MDMxN30.8KToU2sarmrqvcO8cXlhs4vDA1TC-sOMyg4Mm8NCNxI';

export default async function handler(req, res) {
  const { id } = req.query;

  let event = null;
  if (id) {
    try {
      const r = await fetch(
        `${SUPABASE_URL}/rest/v1/events?id=eq.${id}&select=title,tagline,date,time,venue,cover_url,price,is_free,pay_at_door,city`,
        { headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${SUPABASE_ANON}` } }
      );
      const data = await r.json();
      event = data?.[0] ?? null;
    } catch (_) {}
  }

  const title = event?.title ? `${event.title} · Woeva` : 'Woeva';
  const description = event?.tagline || (event?.title ? `Pridaj sa na ${event.title}` : 'Objavuj eventy vo svojom meste.');
  const image = event?.cover_url || 'https://woeva.com/og-image.png';
  const url = `https://woeva.com/share-event${id ? `?id=${id}` : ''}`;

  const days = ['Ne','Po','Ut','St','Št','Pi','So'];
  const months = ['jan','feb','mar','apr','máj','jún','júl','aug','sep','okt','nov','dec'];
  let metaDate = '';
  if (event?.date) {
    const d = new Date(event.date + 'T00:00:00');
    const timeStr = event.time ? ` · ${event.time.slice(0,5)}` : '';
    metaDate = `${days[d.getDay()]}, ${d.getDate()}. ${months[d.getMonth()]}${timeStr}`;
  }

  const isFree = event?.is_free || event?.price === 0;
  const isPayAtDoor = event?.pay_at_door;
  const priceText = isFree ? 'Zadarmo' : isPayAtDoor ? `€${event.price} na mieste` : event?.price ? `€${event.price}` : '';

  const html = `<!DOCTYPE html>
<html lang="sk">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escHtml(title)}</title>
  <link rel="icon" href="/favicon.png" />

  <!-- Open Graph -->
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${escHtml(url)}" />
  <meta property="og:title" content="${escHtml(title)}" />
  <meta property="og:description" content="${escHtml(description)}" />
  <meta property="og:image" content="${escHtml(image)}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:site_name" content="Woeva" />

  <!-- Twitter / X -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escHtml(title)}" />
  <meta name="twitter:description" content="${escHtml(description)}" />
  <meta name="twitter:image" content="${escHtml(image)}" />

  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      min-height: 100svh;
      background: #0a0a09;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      padding: 24px;
    }
    .card {
      width: min(400px, 100%);
      background: #fff;
      border-radius: 24px;
      overflow: hidden;
      box-shadow: 0 24px 64px rgba(0,0,0,0.5);
    }
    .cover {
      width: 100%;
      aspect-ratio: 16/9;
      object-fit: cover;
      background: #1a1a1a;
      display: block;
    }
    .cover-placeholder {
      width: 100%;
      aspect-ratio: 16/9;
      background: linear-gradient(135deg, #B9FF00 0%, #7acc00 100%);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .cover-placeholder img { height: 40px; opacity: 0.6; }
    .content { padding: 20px 20px 24px; }
    .meta { font-size: 12px; font-weight: 600; color: #888; letter-spacing: 0.5px; text-transform: uppercase; margin-bottom: 6px; }
    h1 { font-size: 20px; font-weight: 800; color: #000; letter-spacing: -0.4px; line-height: 1.3; margin-bottom: 6px; }
    .tagline { font-size: 14px; color: #666; line-height: 1.5; margin-bottom: 16px; }
    .detail-row { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
    .detail-row svg { flex-shrink: 0; opacity: 0.45; }
    .detail-text { font-size: 13px; color: #444; }
    .divider { height: 1px; background: #f0f0f0; margin: 16px 0; }
    .btn-open {
      display: block; width: 100%; padding: 16px;
      background: #000; border: none; border-radius: 50px;
      font-size: 16px; font-weight: 700; color: #fff;
      text-align: center; cursor: pointer; text-decoration: none;
      margin-bottom: 10px; transition: opacity 0.15s;
    }
    .btn-open:active { opacity: 0.8; }
    .btn-store {
      display: block; width: 100%; padding: 14px;
      background: transparent; border: 1.5px solid #e0e0e0; border-radius: 50px;
      font-size: 14px; font-weight: 600; color: #444;
      text-align: center; cursor: pointer; text-decoration: none;
      transition: background 0.15s;
    }
    .btn-store:active { background: #f5f5f5; }
  </style>
</head>
<body>
  <div class="card">
    ${event?.cover_url
      ? `<img class="cover" src="${escHtml(event.cover_url)}" alt="${escHtml(event.title ?? '')}" />`
      : `<div class="cover-placeholder"><img src="/LogoWoeva.png" alt="Woeva" /></div>`
    }
    <div class="content">
      ${event ? `
        ${metaDate ? `<div class="meta">${escHtml(metaDate)}</div>` : ''}
        <h1>${escHtml(event.title ?? '')}</h1>
        ${event.tagline ? `<p class="tagline">${escHtml(event.tagline)}</p>` : ''}
        ${event.venue ? `
          <div class="detail-row">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#000"/>
            </svg>
            <span class="detail-text">${escHtml(event.venue)}${event.city ? `, ${escHtml(event.city)}` : ''}</span>
          </div>` : ''}
        ${priceText ? `
          <div class="detail-row">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="#000" stroke-width="2"/>
              <path d="M12 6v6l4 2" stroke="#000" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <span class="detail-text">${escHtml(priceText)}</span>
          </div>` : ''}
      ` : `<h1 style="color:#aaa;font-weight:400;font-size:16px;">Event nenájdený</h1>`}
      <div class="divider"></div>
      <a class="btn-open" href="woeva://event/${escHtml(id ?? '')}">Otvoriť v appke</a>
      <a class="btn-store" href="https://apps.apple.com/sk/app/woeva/id6767314046?l=sk" target="_blank">Stiahnuť Woeva</a>
    </div>
  </div>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
  res.status(200).send(html);
}

function escHtml(str) {
  return String(str ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
