export async function onRequest(context) {
  const { request, env, next } = context;

  if (request.method !== 'GET') {
    return next();
  }

  const url = new URL(request.url);
  
  if (url.pathname.includes('.') && !url.pathname.endsWith('.html')) {
    return next();
  }

  const response = await next();

  if (!response.ok) {
    return response;
  }

  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('text/html')) {
    return response;
  }

  // Gunakan url.hostname (lebih aman dari request.headers)
  const hostname = url.hostname;
  const parts = hostname.split('.');
  
  let subdomain = null;
  if (parts.length >= 3) {
    subdomain = parts[0];
  } else if (parts.length === 2 && hostname.includes('localhost')) {
    subdomain = parts[0]; 
  }

  // Debugging: Log untuk mempermudah pengecekan di Cloudflare "Real-time Logs"
  console.log("Hostname:", hostname);
  console.log("Subdomain detected:", subdomain);
  console.log("Has Supabase URL?", !!env.VITE_SUPABASE_URL);
  console.log("Has Supabase Key?", !!env.VITE_SUPABASE_ANON_KEY);

  if (subdomain && subdomain !== 'www' && env.VITE_SUPABASE_URL && env.VITE_SUPABASE_ANON_KEY) {
    try {
      const supabaseUrl = env.VITE_SUPABASE_URL;
      const supabaseKey = env.VITE_SUPABASE_ANON_KEY;
      
      const supaRes = await fetch(`${supabaseUrl}/rest/v1/invitations?select=customTexts,customImages&subdomain=eq.${subdomain}`, {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        }
      });

      console.log("Supabase Status:", supaRes.status);

      if (supaRes.ok) {
        const data = await supaRes.json();
        
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

          console.log("Replacing tags for:", title);

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

  return response;
}
