# Manufacturer Data Import Scripts

## Setup

1. **Install dependencies:**
```bash
npm install csv-parse node-fetch cheerio
```

2. **Make sure your Prisma schema has these fields:**
```prisma
model Manufacturer {
  id          String   @id @default(cuid())
  name        String
  slug        String   @unique
  description String   @db.Text
  
  // Location
  address     String?
  city        String
  state       String?
  country     String
  latitude    Float?
  longitude   Float?
  
  // Contact
  website     String
  logoUrl     String?
  
  // Tags
  tags        String[]
  
  // Meta
  verified    Boolean  @default(false)
  featured    Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

3. **Update database:**
```bash
npx prisma db push
```

## Usage

### Step 1: Import Manufacturers with Geocoding

This script reads the CSV, geocodes addresses, and imports to database:

```bash
node geocode-import.js
```

**What it does:**
- Reads `manufacturers_import.csv`
- For each manufacturer:
  - Geocodes the city/state using Google Maps API
  - Gets latitude, longitude, and full formatted address
  - Imports to database
  - Waits 200ms between requests (to avoid rate limits)

**Rate limits:**
- Google Maps Geocoding: 50 requests per second
- With 200ms delay, you'll process ~5 per second
- 286 manufacturers = ~60 seconds total

**Output:**
```
📍 Starting manufacturer import with geocoding...

Geocoding: Timbercraft Tiny Homes in Guntersville, AL...
✅ Imported: Timbercraft Tiny Homes
   📍 Location: 34.3581, -86.2947

...

🎉 Import complete!
✅ Successfully imported: 286
❌ Failed: 0
```

### Step 2: Scrape Logos

This script fetches logos for all manufacturers:

```bash
node scrape-logos.js
```

**What it does:**
- Finds all manufacturers without logos
- Tries 3 methods in order:
  1. **Clearbit Logo API** (free, fast, reliable)
  2. **Website scraping** (looks for logo images on site)
  3. **Google Favicon** (fallback, low-res but always works)
- Updates database with logo URLs
- Waits 500ms between requests

**Time estimate:**
- 286 manufacturers × 0.5 seconds = ~2-3 minutes

**Output:**
```
🎨 Starting logo scraper...

Found 286 manufacturers without logos

Processing: Timbercraft Tiny Homes
  ✅ Found logo via Clearbit
  💾 Saved: https://logo.clearbit.com/timbercrafttinyhomes.com

Processing: California Tiny House
  ⚠️  Using favicon as fallback
  💾 Saved: https://www.google.com/s2/favicons?domain=californiatinyhouse.com&sz=128

...

🎉 Logo scraping complete!
✅ Updated: 280
❌ Failed: 6
```

## Environment Variables

Make sure these are in your `.env`:

```bash
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here
DATABASE_URL=your_database_url_here
```

## Troubleshooting

### "Cannot find module" errors
Install missing dependencies:
```bash
npm install csv-parse node-fetch cheerio
```

### Geocoding fails
- Check your Google Maps API key is valid
- Make sure Geocoding API is enabled in Google Cloud Console
- Check you haven't hit rate limits (50/second)

### Logo scraping fails
- Some websites block scrapers (that's okay, fallback kicks in)
- Clearbit may not have all logos (expected)
- Google favicon always works as last resort

## Advanced: Customize

### Add more manufacturer data fields

Edit `geocode-import.js` and add to the create statement:
```javascript
email: record.email,
phone: record.phone,
yearFounded: parseInt(record.yearFounded),
```

### Change scraping delay

In `scrape-logos.js`, adjust this line:
```javascript
await new Promise(resolve => setTimeout(resolve, 500)); // Change 500 to desired ms
```

### Add custom logo selectors

In `scrape-logos.js`, add to the `selectors` array:
```javascript
const selectors = [
  'img.logo',
  'img.your-custom-selector', // Add here
  // ...
];
```

## Next Steps

After importing:

1. **View in your app:** Create a manufacturers page to display the data
2. **Add to map:** Use latitude/longitude to show pins
3. **Filter by tags:** Use the tags field for search/filtering
4. **Enrich data:** Manually add photos, contact info, model listings
5. **Verify data:** Check addresses are accurate, fix any errors

## Cost Estimate

- **Google Maps Geocoding:** Free for first 40,000 requests/month
- **Clearbit Logo API:** Free, no limits
- **Total cost for 286 manufacturers:** $0
