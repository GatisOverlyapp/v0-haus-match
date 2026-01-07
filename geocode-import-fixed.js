import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

// Add your Google Maps API key here
const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

// Simple CSV parser (no external dependency needed)
function parseCSV(content) {
  const lines = content.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  
  return lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim());
    const obj = {};
    headers.forEach((header, i) => {
      obj[header] = values[i];
    });
    return obj;
  });
}

async function geocodeAddress(city, state, country) {
  const address = `${city}, ${state}, ${country}`;
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_MAPS_API_KEY}`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status === 'OK' && data.results[0]) {
      const result = data.results[0];
      return {
        latitude: result.geometry.location.lat,
        longitude: result.geometry.location.lng,
        fullAddress: result.formatted_address,
        placeId: result.place_id
      };
    }
  } catch (error) {
    console.error(`Error geocoding ${address}:`, error);
  }
  
  return null;
}

async function importManufacturers() {
  console.log('📍 Starting manufacturer import with geocoding...\n');
  
  // Read CSV file
  const csvContent = fs.readFileSync('manufacturers_import.csv', 'utf-8');
  const records = parseCSV(csvContent);
  
  let imported = 0;
  let failed = 0;
  
  for (const record of records) {
    try {
      // Geocode the address
      console.log(`Geocoding: ${record.name} in ${record.city}, ${record.state}...`);
      const geoData = await geocodeAddress(record.city, record.state, record.country);
      
      // Wait 200ms to avoid hitting rate limits
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Create manufacturer in database
      const manufacturer = await prisma.manufacturer.create({
        data: {
          name: record.name,
          slug: record.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          description: record.description,
          city: record.city,
          state: record.state,
          country: record.country,
          website: record.website,
          tags: record.tags.split(',').map(tag => tag.trim()),
          latitude: geoData?.latitude,
          longitude: geoData?.longitude,
          address: geoData?.fullAddress,
          verified: false,
          featured: false,
        }
      });
      
      imported++;
      console.log(`✅ Imported: ${manufacturer.name}`);
      if (geoData) {
        console.log(`   📍 Location: ${geoData.latitude}, ${geoData.longitude}`);
      } else {
        console.log(`   ⚠️  Could not geocode address`);
      }
      console.log('');
      
    } catch (error) {
      failed++;
      console.error(`❌ Failed to import ${record.name}:`, error.message);
      console.log('');
    }
  }
  
  console.log('\n🎉 Import complete!');
  console.log(`✅ Successfully imported: ${imported}`);
  console.log(`❌ Failed: ${failed}`);
}

// Run the import
importManufacturers()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
