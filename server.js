import express from 'express';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 80;

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

let supabase = null;
if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
} else {
  console.warn("WARNING: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be provided for dynamic OG tags.");
}

const distPath = path.join(__dirname, 'dist');
const indexPath = path.join(distPath, 'index.html');

let baseHtml = '';
try {
  baseHtml = fs.readFileSync(indexPath, 'utf8');
} catch (err) {
  console.error("Could not read index.html, ensure the app is built.", err);
  process.exit(1);
}

const replaceMetaTags = (html, metadata) => {
  let modifiedHtml = html;
  
  if (metadata.title) {
    modifiedHtml = modifiedHtml.replace(/<title>.*?<\/title>/, `<title>${metadata.title}</title>`);
    modifiedHtml = modifiedHtml.replace(/<meta name="title" content=".*?" \/>/, `<meta name="title" content="${metadata.title}" />`);
    modifiedHtml = modifiedHtml.replace(/<meta property="og:title" content=".*?" \/>/, `<meta property="og:title" content="${metadata.title}" />`);
    modifiedHtml = modifiedHtml.replace(/<meta property="twitter:title" content=".*?" \/>/, `<meta property="twitter:title" content="${metadata.title}" />`);
  }
  
  if (metadata.description) {
    modifiedHtml = modifiedHtml.replace(/<meta name="description" content=".*?" \/>/, `<meta name="description" content="${metadata.description}" />`);
    modifiedHtml = modifiedHtml.replace(/<meta property="og:description" content=".*?" \/>/, `<meta property="og:description" content="${metadata.description}" />`);
    modifiedHtml = modifiedHtml.replace(/<meta property="twitter:description" content=".*?" \/>/, `<meta property="twitter:description" content="${metadata.description}" />`);
  }
  
  if (metadata.image) {
    modifiedHtml = modifiedHtml.replace(/<meta property="og:image" content=".*?" \/>/, `<meta property="og:image" content="${metadata.image}" />`);
    modifiedHtml = modifiedHtml.replace(/<meta property="twitter:image" content=".*?" \/>/, `<meta property="twitter:image" content="${metadata.image}" />`);
  }
  
  return modifiedHtml;
};

app.use(express.static(distPath, { index: false }));

app.get('*', async (req, res) => {
  let htmlToSend = baseHtml;
  
  try {
    const host = req.get('host') || '';
    const parts = host.split('.');
    
    let subdomain = null;
    if (parts.length >= 3) {
      subdomain = parts[0];
    }
    
    if (subdomain && subdomain !== 'www' && supabase) {
      const { data, error } = await supabase
        .from('invitations')
        .select('customTexts, customImages')
        .eq('id', subdomain)
        .single();
        
      if (!error && data) {
        const texts = data.customTexts || {};
        const images = data.customImages || {};
        
        const groom = texts.groomName || 'Pria';
        const bride = texts.brideName || 'Wanita';
        const subtitle = texts.coverSubtitle || 'Undangan Pernikahan';
        
        const title = `${groom} & ${bride} - Undangan Pernikahan`;
        const description = `${subtitle} ${groom} dan ${bride}. Mari hadir dan berikan doa restu Anda!`;
        const image = images.cover_bg || 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200&auto=format&fit=crop';
        
        htmlToSend = replaceMetaTags(baseHtml, { title, description, image });
      }
    }
  } catch (err) {
    console.error("Error processing dynamic OG tags:", err);
  }

  res.send(htmlToSend);
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
