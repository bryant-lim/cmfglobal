const { createStrapi } = require('@strapi/strapi');
const path = require('path');

function deduceCountryFromPhone(phone, currency) {
  if (!phone) {
    return currency === 'CNY' ? 'China' : null;
  }
  const cleanPhone = phone.trim().replace(/[\s()-]/g, '');
  
  if (cleanPhone.startsWith('+86') || cleanPhone.startsWith('86')) return 'China';
  if (cleanPhone.startsWith('+60') || cleanPhone.startsWith('60') || cleanPhone.startsWith('01')) return 'Malaysia';
  if (cleanPhone.startsWith('+65') || cleanPhone.startsWith('65')) return 'Singapore';
  if (cleanPhone.startsWith('+852') || cleanPhone.startsWith('852')) return 'Hong Kong';
  if (cleanPhone.startsWith('+886') || cleanPhone.startsWith('886')) return 'Taiwan';
  if (cleanPhone.startsWith('+853') || cleanPhone.startsWith('853')) return 'Macao';
  if (cleanPhone.startsWith('+61') || cleanPhone.startsWith('61')) return 'Australia';
  if (cleanPhone.startsWith('+44') || cleanPhone.startsWith('44')) return 'United Kingdom';
  if (cleanPhone.startsWith('+1') || cleanPhone.startsWith('1')) return 'United States';
  
  // Chinese mobile numbers are 11 digits starting with 1
  if (/^1\d{10}$/.test(cleanPhone)) return 'China';
  // Singapore mobile numbers are 8 digits starting with 8 or 9
  if (/^[89]\d{7}$/.test(cleanPhone)) return 'Singapore';
  
  return currency === 'CNY' ? 'China' : null;
}

async function test() {
  const appDir = '/Users/bryantlim/Documents/chillor-repo/cmfglobal/cmf-backend';
  const distDir = path.join(appDir, 'dist');
  const app = await createStrapi({ appDir, distDir }).load();
  
  try {
    const start = new Date(new Date().getFullYear(), 0, 1);
    const end = new Date();
    
    const ticketOrders = (await strapi.db.query('api::order.order').findMany({
      where: {
        orderStatus: 'paid',
        type: 'ticket',
        updatedAt: { $gte: start.toISOString(), $lte: end.toISOString() }
      },
      populate: {
        event: true,
        attendees: true,
        user: {
          populate: {
            profile: true
          }
        }
      }
    })) || [];

    const ticketBuyerEmails = ticketOrders.map(o => o.buyerEmail).filter(Boolean);
    const userProfiles = await strapi.query('plugin::users-permissions.user').findMany({
      where: { email: { $in: ticketBuyerEmails } },
      populate: ['profile']
    });

    const emailToCountryMap = new Map();
    (userProfiles || []).forEach(u => {
      if (u.email && u.profile && u.profile.country) {
        emailToCountryMap.set(u.email.toLowerCase(), u.profile.country);
      }
    });

    console.log(`\nFound ${ticketOrders.length} ticket orders within period.`);
    
    ticketOrders.forEach(o => {
      let enrollment = o.enrollmentData;
      if (typeof enrollment === 'string') {
        try { enrollment = JSON.parse(enrollment); } catch(e) {}
      }

      let billingAddress = o.buyerBillingAddress;
      if (typeof billingAddress === 'string') {
        try { billingAddress = JSON.parse(billingAddress); } catch(e) {}
      }

      const profile = o.user && o.user.profile;
      const phone = o.buyerPhone || (enrollment && enrollment.attendees && enrollment.attendees[0] && enrollment.attendees[0].phone);
      
      const ticketCountry = (billingAddress && billingAddress.country) || 
                            (enrollment && enrollment.country) || 
                            (profile && profile.country) || 
                            emailToCountryMap.get(o.buyerEmail && o.buyerEmail.toLowerCase()) || 
                            deduceCountryFromPhone(phone, o.currency) ||
                            'N/A';
      
      console.log(`Order #${o.id} (${o.buyerEmail}): phone=${phone}, currency=${o.currency} => RESOLVED COUNTRY: ${ticketCountry}`);
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
