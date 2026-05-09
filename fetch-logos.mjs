/**
 * fetch-logos.mjs
 * Downloads one logo per company from logo.dev and stores it in
 * Supabase Storage, then writes the public URL back to companies.logo_url.
 *
 * Usage:
 *   SUPABASE_SERVICE_KEY=<service_role_key> node fetch-logos.mjs
 */

const SUPABASE_URL      = 'https://lprekbijqpbczqtlyvko.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_nX4-QRSQZyU3ObYf06Rwdg_4yNhqrpk';
const SERVICE_KEY       = process.env.SUPABASE_SERVICE_KEY;
const LOGO_DEV_TOKEN    = 'pk_YUTdNtwORiWmi0THyjTe2A';
const BUCKET            = 'company-logos';

if ( !SERVICE_KEY ) {
  console.error( 'Set SUPABASE_SERVICE_KEY=<your service role key> before running.' );
  process.exit( 1 );
}

function getDomain( url ) {
  if ( !url ) return '';
  try {
    const full = url.startsWith( 'http' ) ? url : 'https://' + url;
    return new URL( full ).hostname.replace( /^www\./, '' );
  } catch { return ''; }
}

async function fetchCompanies() {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/companies?select=id,startup_name,website`,
    {
      headers: {
        apikey:        SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
    }
  );
  if ( !res.ok ) throw new Error( `Failed to fetch companies: ${res.status}` );
  return res.json();
}

async function downloadLogo( domain ) {
  const url = `https://img.logo.dev/${domain}?token=${LOGO_DEV_TOKEN}&size=64&format=png`;
  const res = await fetch( url );
  if ( !res.ok ) throw new Error( `logo.dev returned ${res.status} for ${domain}` );
  return { buffer: await res.arrayBuffer(), contentType: res.headers.get( 'content-type' ) || 'image/png' };
}

async function uploadToStorage( filename, buffer, contentType ) {
  const res = await fetch(
    `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${filename}`,
    {
      method:  'POST',
      headers: {
        Authorization:  `Bearer ${SERVICE_KEY}`,
        'Content-Type': contentType,
        'x-upsert':     'true',
      },
      body: buffer,
    }
  );
  if ( !res.ok ) {
    const body = await res.text();
    throw new Error( `Storage upload failed for ${filename}: ${res.status} ${body}` );
  }
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${filename}`;
}

async function updateLogoUrl( id, logoUrl ) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/companies?id=eq.${id}`,
    {
      method:  'PATCH',
      headers: {
        apikey:         SERVICE_KEY,
        Authorization:  `Bearer ${SERVICE_KEY}`,
        'Content-Type': 'application/json',
        Prefer:         'return=minimal',
      },
      body: JSON.stringify( { logo_url: logoUrl } ),
    }
  );
  if ( !res.ok ) throw new Error( `DB update failed for id=${id}: ${res.status}` );
}

async function main() {
  const companies = await fetchCompanies();
  console.log( `Found ${companies.length} companies.\n` );

  for ( const co of companies ) {
    const domain = getDomain( co.website );
    if ( !domain ) {
      console.log( `  ⚠  ${co.startup_name}: no website, skipping` );
      continue;
    }

    process.stdout.write( `  ${co.startup_name} (${domain}) … ` );
    try {
      const { buffer, contentType } = await downloadLogo( domain );
      const ext      = contentType.includes( 'png' ) ? 'png' : 'webp';
      const filename = `${co.id}.${ext}`;
      const publicUrl = await uploadToStorage( filename, buffer, contentType );
      await updateLogoUrl( co.id, publicUrl );
      console.log( `✓  ${publicUrl}` );
    } catch ( err ) {
      console.log( `✗  ${err.message}` );
    }
  }

  console.log( '\nDone.' );
}

main();
