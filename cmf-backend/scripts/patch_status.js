
const { createStrapi } = require('@strapi/strapi');
const path = require('path');

async function patchStatus() {
  const appDir = path.join(__dirname, '..');
  const distDir = path.join(appDir, 'dist');
  const app = await createStrapi({ appDir, distDir }).load();
  
  console.log('--- PATCHING MEMBERSHIP STATUSES ---');

  const records = await strapi.entityService.findMany('api::membership-record.membership-record', {
    filters: {
      membershipStatus: 'pending_approval'
    }
  });

  console.log(`Found ${records.length} records with 'pending_approval' status.`);

  const now = new Date();
  let count = 0;

  for (const record of records) {
    const expiresAt = record.validUntil ? new Date(record.validUntil) : null;
    const newStatus = (expiresAt && expiresAt < now) ? 'expired' : 'active';

    await strapi.entityService.update('api::membership-record.membership-record', record.id, {
      data: { membershipStatus: newStatus }
    });

    count++;
    if (count % 50 === 0) console.log(`Patched ${count}/${records.length} records...`);
  }

  console.log(`--- PATCH COMPLETE: ${count} records updated ---`);
  process.exit(0);
}

patchStatus();
