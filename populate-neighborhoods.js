#!/usr/bin/env node
// Run once to populate the `neighborhood` column in Supabase.
// Requires Node 18+ (native fetch).
//
// Usage:
//   node populate-neighborhoods.js <SERVICE_ROLE_KEY>
//
// Get your service role key from:
//   Supabase Dashboard → Project Settings → API → service_role (secret)

const SUPABASE_URL = 'https://lprekbijqpbczqtlyvko.supabase.co';
const SERVICE_KEY  = process.argv[2];

if ( !SERVICE_KEY ) {
  console.error( 'Usage: node populate-neighborhoods.js <SERVICE_ROLE_KEY>' );
  process.exit( 1 );
}

const NEIGHBORHOODS = [
  { name: 'Salt Lake City',     lat: 40.761, lon: -111.891 },
  { name: 'SL County South',    lat: 40.570, lon: -111.890 },
  { name: 'Point of Mountain',  lat: 40.420, lon: -111.900 },
  { name: 'Utah County',        lat: 40.234, lon: -111.659 },
  { name: 'Park City',          lat: 40.646, lon: -111.498 },
  { name: 'Ogden',              lat: 41.223, lon: -111.974 },
  { name: 'Davis County',       lat: 40.970, lon: -111.890 },
  { name: 'St. George',         lat: 37.097, lon: -113.568 },
];

function nearestNeighborhood( lat, lon ) {
  let best = NEIGHBORHOODS[ 0 ].name;
  let bestDist = Infinity;
  for ( const n of NEIGHBORHOODS ) {
    const dlat = lat - n.lat;
    const dlon = ( lon - n.lon ) * Math.cos( lat * Math.PI / 180 );
    const d = dlat * dlat + dlon * dlon;
    if ( d < bestDist ) { bestDist = d; best = n.name; }
  }
  return best;
}

const headers = {
  'apikey':        SERVICE_KEY,
  'Authorization': `Bearer ${SERVICE_KEY}`,
  'Content-Type':  'application/json',
  'Prefer':        'return=minimal',
};

async function main() {
  // Fetch all companies with coordinates
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/companies?select=id,latitude,longitude&limit=10000`,
    { headers: { 'apikey': SERVICE_KEY, 'Authorization': `Bearer ${SERVICE_KEY}` } }
  );
  if ( !res.ok ) {
    console.error( 'Fetch failed:', res.status, await res.text() );
    process.exit( 1 );
  }
  const companies = await res.json();
  console.log( `Fetched ${companies.length} companies` );

  let updated = 0, skipped = 0;
  for ( const co of companies ) {
    if ( co.latitude == null || co.longitude == null ) { skipped++; continue; }
    const neighborhood = nearestNeighborhood( co.latitude, co.longitude );
    const patch = await fetch(
      `${SUPABASE_URL}/rest/v1/companies?id=eq.${co.id}`,
      { method: 'PATCH', headers, body: JSON.stringify( { neighborhood } ) }
    );
    if ( !patch.ok ) {
      console.error( `Failed to update ${co.id}:`, patch.status, await patch.text() );
    } else {
      updated++;
    }
  }
  console.log( `Done. Updated: ${updated}, skipped (no coords): ${skipped}` );
}

main().catch( e => { console.error( e ); process.exit( 1 ); } );
