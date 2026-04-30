
const { createStrapi } = require('@strapi/strapi');
const path = require('path');

async function patch() {
  const appDir = path.join(__dirname, '..');
  const distDir = path.join(appDir, 'dist');
  const app = await createStrapi({ appDir, distDir }).load();
  
  console.log('--- PATCHING RECORD NAMES ---');

  const records = await strapi.entityService.findMany('api::membership-record.membership-record', {
    populate: { membership_type: { fields: ['name'] } }
  });

  console.log(`Found ${records.length} records to patch.`);

  let count = 0;
  for (const record of records) {
    if (record.membership_type && record.membership_type.name) {
      await strapi.entityService.update('api::membership-record.membership-record', record.id, {
        data: { name: record.membership_type.name }
      });
      count++;
      if (count % 50 === 0) console.log(`Patched ${count}/${records.length} records...`);
    }
  }

  console.log('--- PATCH COMPLETE ---');
  process.exit(0);
}

patch();
