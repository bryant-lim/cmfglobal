const { createStrapi } = require('@strapi/strapi');
const path = require('path');

async function test() {
  const appDir = path.join(__dirname, '..');
  const distDir = path.join(appDir, 'dist');
  const app = await createStrapi({ appDir, distDir }).load();
  
  console.log('--- DIAGNOSING PENDING APPROVALS ---');
  
  // Let's count all records
  const allRecords = await strapi.db.query('api::membership-record.membership-record').findMany({
    populate: ['profile']
  });
  console.log(`Total membership records in database: ${allRecords.length}`);
  
  const pendingRecords = allRecords.filter(r => r.membershipStatus === 'pending_approval');
  console.log(`Pending approval membership records: ${pendingRecords.length}`);
  
  const activeRecords = allRecords.filter(r => r.membershipStatus === 'active');
  console.log(`Active membership records: ${activeRecords.length}`);
  
  const expiredRecords = allRecords.filter(r => r.membershipStatus === 'expired');
  console.log(`Expired membership records: ${expiredRecords.length}`);
  
  process.exit(0);
}

test().catch(err => {
  console.error(err);
  process.exit(1);
});
