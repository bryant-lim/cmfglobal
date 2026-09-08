const { createStrapi } = require('@strapi/strapi');
const path = require('path');

async function test() {
  const appDir = '/Users/bryantlim/Documents/chillor-repo/cmfglobal/cmf-backend';
  const distDir = path.join(appDir, 'dist');
  const app = await createStrapi({ appDir, distDir }).load();
  
  try {
    const orders = await strapi.db.query('api::order.order').findMany({
      where: {
        type: 'ticket'
      },
      populate: {
        event: true,
        attendees: true,
        user: {
          populate: {
            profile: true
          }
        }
      },
      limit: 10
    });
    
    console.log('\n--- Sample Ticket Orders in Database ---');
    orders.forEach((o, i) => {
      console.log(`\nOrder #${i+1}:`);
      console.log(`ID: ${o.id}`);
      console.log(`Email: ${o.buyerEmail}`);
      console.log(`buyerBillingAddress type:`, typeof o.buyerBillingAddress, o.buyerBillingAddress);
      console.log(`enrollmentData type:`, typeof o.enrollmentData, o.enrollmentData);
      console.log(`User Profile Country:`, o.user?.profile?.country);
    });
  } catch (err) {
    console.error('❌ Request failed:', err.message);
  }
  
  process.exit(0);
}

test().catch(err => {
  console.error(err);
  process.exit(1);
});
