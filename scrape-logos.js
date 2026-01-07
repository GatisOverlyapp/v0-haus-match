import { PrismaClient } from '@prisma/client';
import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

const prisma = new PrismaClient();

// Method 1: Try Clearbit Logo API (free, no API key needed)
async function getClearbitLogo(website) {
  try {
    const domain = new URL(website).hostname;
    const logoUrl = `https://logo.clearbit.com/${domain}`;
    
    // Check if logo exists
    const response = await fetch(logoUrl, { method: 'HEAD' });
    if (response.ok) {
      return logoUrl;
    }
  } catch (error) {
    // Ignore errors
  }
  return null;
}

// Method 2: Scrape logo from website
async function scrapeLogo(website) {
  try {
    const response = await fetch(website, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    if (!response.ok) return null;
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    // Try different common logo selectors
    const selectors = [
      'img.logo',
      'img#logo',
      'img[alt*="logo" i]',
      '.logo img',
      '#logo img',
      'header img',
      '.header-logo img',
      '.site-logo img',
      'a.logo img',
      '[class*="logo"] img'
    ];
    
    for (const selector of selectors) {
      const img = $(selector).first();
      if (img.length) {
        let src = img.attr('src');
        if (src) {
          // Handle relative URLs
          if (src.startsWith('//')) {
            src = 'https:' + src;
          } else if (src.startsWith('/')) {
            const url = new URL(website);
            src = url.origin + src;
          } else if (!src.startsWith('http')) {
            src = new URL(src, website).href;
          }
          return src;
        }
      }
    }
  } catch (error) {
    console.error(`Error scraping ${website}:`, error.message);
  }
  
  return null;
}

// Method 3: Use Google's favicon service as fallback
function getGoogleFavicon(website) {
  try {
    const domain = new URL(website).hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
  } catch {
    return null;
  }
}

async function updateManufacturerLogos() {
  console.log('🎨 Starting logo scraper...\n');
  
  // Get all manufacturers without logos
  const manufacturers = await prisma.manufacturer.findMany({
    where: {
      OR: [
        { logoUrl: null },
        { logoUrl: '' }
      ]
    },
    select: {
      id: true,
      name: true,
      website: true
    }
  });
  
  console.log(`Found ${manufacturers.length} manufacturers without logos\n`);
  
  let updated = 0;
  let failed = 0;
  
  for (const manufacturer of manufacturers) {
    console.log(`Processing: ${manufacturer.name}`);
    
    try {
      let logoUrl = null;
      
      // Try Clearbit first (fastest, most reliable)
      logoUrl = await getClearbitLogo(manufacturer.website);
      if (logoUrl) {
        console.log(`  ✅ Found logo via Clearbit`);
      } else {
        // Try scraping the website
        logoUrl = await scrapeLogo(manufacturer.website);
        if (logoUrl) {
          console.log(`  ✅ Found logo via scraping`);
        } else {
          // Fallback to Google favicon
          logoUrl = getGoogleFavicon(manufacturer.website);
          console.log(`  ⚠️  Using favicon as fallback`);
        }
      }
      
      // Update database
      if (logoUrl) {
        await prisma.manufacturer.update({
          where: { id: manufacturer.id },
          data: { logoUrl }
        });
        updated++;
        console.log(`  💾 Saved: ${logoUrl}\n`);
      }
      
      // Rate limiting - wait 500ms between requests
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      failed++;
      console.error(`  ❌ Failed:`, error.message, '\n');
    }
  }
  
  console.log('\n🎉 Logo scraping complete!');
  console.log(`✅ Updated: ${updated}`);
  console.log(`❌ Failed: ${failed}`);
}

// Run the scraper
updateManufacturerLogos()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
