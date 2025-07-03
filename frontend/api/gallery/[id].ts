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
  <meta property="og:image:secure_url" content="${data.img}" />

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image"/>
  <meta name="twitter:title" content="${data.title}"/>
  <meta name="twitter:description" content="${data.desc}"/>
  <meta name="twitter:image" content="${data.img}"/>
  <meta name="twitter:image:alt" content="${data.title}" />

  <!-- Scrapers should not follow redirects -->
  <meta name="robots" content="noindex, nofollow" />
</head>
<body>
  <script>
    // Immediate redirect for browsers
    window.location.href = "/gallery/client/${data.id}";
  </script>
  <!-- Fallback for browsers without JS -->
  <p>Redirecting to gallery... <a href="/gallery/client/${data.id}">Click here</a></p>
</body>
</html>`;

// Valid image extensions
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

// Check if URL is a direct image
const isDirectImage = (url: string) => {
  try {
    const path = new URL(url).pathname.toLowerCase();
    return IMAGE_EXTENSIONS.some(ext => path.endsWith(ext));
  } catch {
    return false;
  }
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query as { id: string };
  if (!id) return res.status(400).send('Missing gallery id');

  try {
    // 1) Fetch public event metadata
    const eventRes = await fetch(
      `https://cloudgallery.onrender.com/api/events/public/${encodeURIComponent(id)}`
    );
    
    if (!eventRes.ok) {
      return res.status(404).send('Event not found');
    }
    
    const e = await eventRes.json();

    // 2) Fetch cover image list
    let imgUrl = e.coverImageUrl || '';
    let isValidImage = isDirectImage(imgUrl);
    
    try {
      // Only fetch covers if current image is invalid
      if (!isValidImage) {
        const coverRes = await fetch(
          `https://cloudgallery.onrender.com/api/events/eventscover/${encodeURIComponent(id)}`
        );
        
        if (coverRes.ok) {
          const json = await coverRes.json();
          if (Array.isArray(json.covers) && json.covers[0]?.url) {
            imgUrl = json.covers[0].url;
            isValidImage = isDirectImage(imgUrl);
          }
        }
      }
    } catch (covErr) {
      console.error('Cover fetch error:', covErr);
    }

    // 3) Validate and fix image URL
    let finalImageUrl = imgUrl;
    
    // Fix relative URLs
    if (finalImageUrl.startsWith('/')) {
      finalImageUrl = `https://cloudgallery.onrender.com${finalImageUrl}`;
    }
    
    // Verify it's a direct image
    if (!isValidImage) {
      finalImageUrl = 'https://cloud-gallery-psi.vercel.app/default-og.png';
    }
    
    // Add cache buster
    finalImageUrl += finalImageUrl.includes('?') ? '&' : '?';
    finalImageUrl += `ts=${Date.now()}`;

    // 4) Prepare metadata
    const host = process.env.VERCEL_URL ?? 'cloud-gallery-psi.vercel.app';
    const fullUrl = `https://${host}/gallery/${id}`;
    
    const title = e.title || 'Vistora Event';
    let desc = e.description || 'Check out this event on Vistora';
    
    // Truncate description for WhatsApp
    if (desc.length > 160) {
      desc = `${desc.substring(0, 157)}...`;
    }

    // 5) Generate and send OG HTML
    const html = OG_HTML({
      id,
      url: fullUrl,
      title,
      desc,
      img: finalImageUrl
    });

    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Cache-Control', 'public, max-age=300'); // 5 min cache
    return res.status(200).send(html);
  } catch (err) {
    console.error('Unhandled exception:', err);
    return res.status(500).send('Internal Server Error');
  }
}