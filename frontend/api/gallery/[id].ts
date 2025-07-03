// api/gallery/[id].ts
import { VercelRequest, VercelResponse } from '@vercel/node';

const OG_HTML = (data: {
  id: string;
  url: string;
  title: string;
  desc: string;
  img: string;
}) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <title>${data.title}</title>

  <!-- Open Graph tags -->
  <meta property="og:type" content="website"/>
  <meta property="og:url" content="${data.url}"/>
  <meta property="og:title" content="${data.title}"/>
  <meta property="og:description" content="${data.desc}"/>
  <meta property="og:image" content="${data.img}"/>
  <meta property="og:image:width" content="1200"/>
  <meta property="og:image:height" content="630"/>
  <meta property="og:image:type" content="image/jpeg"/>

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image"/>
  <meta name="twitter:title" content="${data.title}"/>
  <meta name="twitter:description" content="${data.desc}"/>
  <meta name="twitter:image" content="${data.img}"/>
  <meta name="twitter:image:alt" content="${data.title} cover image"/>

  <!-- WhatsApp specific -->
  <meta property="og:image:secure_url" content="${data.img}" />
  
  <!-- Browser redirect: scrapers will ignore this -->
  <meta http-equiv="refresh" content="0;url=/gallery/client/${data.id}" />
  <style>
    body { 
      margin:0; 
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      background: #fafafa;
    }
    .card {
      max-width: 800px;
      margin: 0 auto;
      background: white;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      border-radius: 8px;
      overflow: hidden;
    }
    .cover-container {
      height: 420px;
      overflow: hidden;
      background: #f0f0f0;
    }
    .cover {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .content {
      padding: 24px;
      text-align: center;
    }
    h1 {
      margin: 0 0 16px;
      font-size: 28px;
      color: #333;
      line-height: 1.3;
    }
    .desc {
      color: #666;
      font-size: 18px;
      line-height: 1.5;
      margin: 0;
    }
    .footer {
      padding: 16px;
      text-align: center;
      color: #999;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="cover-container">
      <img src="${data.img}" alt="Event cover" class="cover"/>
    </div>
    <div class="content">
      <h1>${data.title}</h1>
      <p class="desc">${data.desc}</p>
    </div>
  </div>
  <div class="footer">
    <a href="/gallery/client/${data.id}">View full gallery →</a>
  </div>
</body>
</html>`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query as { id: string };
  if (!id) return res.status(400).send('Missing gallery id');

  try {
    // 1) Fetch public event metadata
    const eventRes = await fetch(
      `https://captus-backend.onrender.com/api/events/public/${encodeURIComponent(id)}`
    );
    if (!eventRes.ok) return res.status(404).send('Event not found');
    const e = await eventRes.json();

    // 2) Fetch cover image list (keep your existing logic)
    let imgUrl = e.coverImageUrl || '';
    try {
      const coverRes = await fetch(
        `https://captus-backend.onrender.com/api/events/eventscover/${encodeURIComponent(id)}`
      );
      if (coverRes.ok) {
        const json = await coverRes.json();
        if (Array.isArray(json.covers) && json.covers[0]?.url) {
          imgUrl = json.covers[0].url;
        }
      }
    } catch (covErr) {
      console.error('Cover fetch error:', covErr);
    }

    // 3) Ensure absolute URL for images
    if (imgUrl && !imgUrl.startsWith('http')) {
      imgUrl = `https://captus-backend.onrender.com${imgUrl.startsWith('/') ? imgUrl : '/' + imgUrl}`;
    }

    // 4) Fallback image URL
    if (!imgUrl) {
      imgUrl = 'https://https://cloud-gallery-psi.vercel.app/default-og.png';
    }

    // 5) Add cache-buster to prevent stale images
    const cacheBuster = `?ts=${Date.now()}`;
    imgUrl += (imgUrl.includes('?') ? '&' : '?') + cacheBuster;

    // 6) Truncate description for WhatsApp (160 char limit)
    const maxDescLength = 160;
    const cleanDesc = e.description
      ? (e.description.length > maxDescLength 
          ? `${e.description.substring(0, maxDescLength)}...` 
          : e.description)
      : 'Check out this event on Captus';

    // 7) Build full share URL
    const host = process.env.VERCEL_URL ?? 'https://cloud-gallery-psi.vercel.app';
    const fullUrl = `https://${host}/gallery/${id}`;

    // 8) Generate and send OG HTML
    const html = OG_HTML({
      id,
      url: fullUrl,
      title: e.title || 'Captus Event',
      desc: cleanDesc,
      img: imgUrl
    });

    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 24h
    return res.status(200).send(html);
  } catch (err) {
    console.error('Unhandled exception:', err);
    return res.status(500).send('Internal Server Error');
  }
}