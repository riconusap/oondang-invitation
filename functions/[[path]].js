export async function onRequest(context) {
  const { request, env, next } = context;

  // Hanya proses untuk method GET
  if (request.method !== 'GET') {
    return next();
  }

  const url = new URL(request.url);
  
  // Abaikan request untuk file statis (berakhiran ekstensi selain .html)
  // agar fungsi ini tidak boros dieksekusi saat meload gambar, css, js, dll.
  if (url.pathname.includes('.') && !url.pathname.endsWith('.html')) {
    return next();
  }

  // Ambil response asli (berisi index.html bawaan)
  const response = await next();

  // Jika response gagal (misal 404), kembalikan saja
  if (!response.ok) {
    return response;
  }

  // Pastikan yang kita ubah hanyalah file HTML
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('text/html')) {
    return response;
  }

  const host = request.headers.get('host') || '';
  const parts = host.split('.');
  
  let subdomain = null;
  // Cek jika menggunakan custom domain dengan subdomain (contoh: agus.undangan.com)
  if (parts.length >= 3) {
    subdomain = parts[0];
  } else if (parts.length === 2 && host.includes('localhost')) {
    // Berguna jika ditest secara lokal (misal: agus.localhost:8788)
    subdomain = parts[0]; 
  }

  // Jika ada subdomain valid dan variabel environment diset
  if (subdomain && subdomain !== 'www' && env.VITE_SUPABASE_URL && env.VITE_SUPABASE_ANON_KEY) {
    try {
      const supabaseUrl = env.VITE_SUPABASE_URL;
      const supabaseKey = env.VITE_SUPABASE_ANON_KEY;
      
      // Ambil data undangan dari Supabase menggunakan REST API
      const supaRes = await fetch(`${supabaseUrl}/rest/v1/invitations?select=customTexts,customImages&subdomain=eq.${subdomain}`, {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        }
      });

      if (supaRes.ok) {
        const data = await supaRes.json();
        
        // Jika data undangan ditemukan
        if (data && data.length > 0) {
          const invitation = data[0];
          const texts = invitation.customTexts || {};
          const images = invitation.customImages || {};
          
          const groom = texts.groomName || 'Pria';
          const bride = texts.brideName || 'Wanita';
          const subtitle = texts.coverSubtitle || 'Undangan Pernikahan';
          
          const title = `${groom} & ${bride} - Undangan Pernikahan`;
          const description = `${subtitle} ${groom} dan ${bride}. Mari hadir dan berikan doa restu Anda!`;
          const image = images.cover_bg || 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200&auto=format&fit=crop';

          // Gunakan HTMLRewriter bawaan Cloudflare untuk mengubah Meta Tag secara langsung di Edge!
          return new HTMLRewriter()
            .on('title', {
              element(element) { element.setInnerContent(title); }
            })
            .on('meta[name="title"]', {
              element(element) { element.setAttribute('content', title); }
            })
            .on('meta[property="og:title"]', {
              element(element) { element.setAttribute('content', title); }
            })
            .on('meta[property="twitter:title"]', {
              element(element) { element.setAttribute('content', title); }
            })
            .on('meta[name="description"]', {
              element(element) { element.setAttribute('content', description); }
            })
            .on('meta[property="og:description"]', {
              element(element) { element.setAttribute('content', description); }
            })
            .on('meta[property="twitter:description"]', {
              element(element) { element.setAttribute('content', description); }
            })
            .on('meta[property="og:image"]', {
              element(element) { element.setAttribute('content', image); }
            })
            .on('meta[property="twitter:image"]', {
              element(element) { element.setAttribute('content', image); }
            })
            .transform(response);
        }
      }
    } catch (err) {
      console.error("Error processing dynamic OG tags in Cloudflare Edge:", err);
    }
  }

  // Jika gagal, atau tidak ada subdomain, kirim HTML statis bawaan
  return response;
}
