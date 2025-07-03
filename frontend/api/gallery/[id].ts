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
  <meta property="og:type"        content="website"/>
  <meta property="og:url"         content="${data.url}"/>
  <meta property="og:title"       content="${data.title}"/>
  <meta property="og:description" content="${data.desc}"/>
  <meta property="og:image"       content="${data.img}"/>
  <meta property="og:image:width" content="1200"/>
  <meta property="og:image:height"content="630"/>
  <!-- Twitter Card -->
  <meta name="twitter:card"        content="summary_large_image"/>
  <meta name="twitter:title"       content="${data.title}"/>
  <meta name="twitter:description" content="${data.desc}"/>
  <meta name="twitter:image"       content="${data.img}"/>
  <!-- Browser redirect: scrapers will ignore this -->
  <meta http-equiv="refresh" content="0;url=/gallery/client/${data.id}" />
  <style>
    body { margin:0; font-family: sans-serif; text-align: center; }
    .cover { width: 100%; max-height: 60vh; object-fit: cover; }
    .content { padding: 1rem; }
    h1 { margin: 1rem 0 0.5rem; font-size: 2rem; }
    p  { margin: 0 0 1rem; color: #555; }
  </style>
</head>
<body>
  <img src="${data.img}" alt="Event cover" class="cover"/>
  <div class="content">
    <h1>${data.title}</h1>
    <p>${data.desc}</p>
  </div>
  <!-- Fallback link if redirect doesn’t work -->
  <p><a href="/gallery/client/${data.id}">Continue to gallery →</a></p>
</body>
</html>`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query as { id: string };
  if (!id) return res.status(400).send('Missing gallery id');

  try {
    // 1) Fetch public event metadata
    const eventRes = await fetch(
      `https://cloudgallery.onrender.com/api/events/public/${encodeURIComponent(id)}`
    );
    if (!eventRes.ok) return res.status(404).send('Event not found');
    const e = await eventRes.json();

    // 2) Fetch cover image list
    let imgUrl = e.coverImageUrl || '';
    try {
      const coverRes = await fetch(
        `https://cloudgallery.onrender.com/api/events/eventscover/${encodeURIComponent(id)}`
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

    // 3) Fallback image URL
    if (!imgUrl) {
      imgUrl = 'https://cloud-gallery-psi.vercel.app/default-og.png';
    }

    // 4) Build full share URL
    const host = process.env.VERCEL_URL ?? 'cloud-gallery-psi.vercel.app';
    const fullUrl = `https://${host}/gallery/${id}`;

    // 5) Generate and send OG HTML
    const html = OG_HTML({
      id,
      url:  fullUrl,
      title: e.title       || 'Captus Event',
      desc:  e.description || 'Check out this event on Captus',
      img:   imgUrl
    });

    res.setHeader('Content-Type', 'text/html');
    return res.status(200).send(html);
  } catch (err) {
    console.error('Unhandled exception:', err);
    return res.status(500).send('Internal Server Error');
  }
}