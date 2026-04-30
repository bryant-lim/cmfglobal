
const { createStrapi } = require('@strapi/strapi');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

async function migrate() {
  const appDir = path.join(__dirname, '..');
  const distDir = path.join(appDir, 'dist');
  const app = await createStrapi({ appDir, distDir }).load();
  
  console.log('--- RESUMING MIGRATION ---');

  // 1. Get Award Mapping
  const awards = await strapi.entityService.findMany('api::membership-type.membership-type', {
    fields: ['id', 'documentId', 'name']
  });
  
  const awardMap = {};
  awards.forEach(a => {
    awardMap[a.name] = a.documentId;
  });

  const defaultPassword = 'CMFGC@2026!@';
  const usersPath = path.join(__dirname, '../public/uploads/users (1).csv');
  const transPath = path.join(__dirname, '../public/uploads/transactions-1777433540.csv');

  // Load existing profiles
  console.log('Loading existing profiles...');
  const existingProfiles = await strapi.entityService.findMany('api::profile.profile', {
    fields: ['email', 'documentId']
  });
  const processedUsers = new Map();
  existingProfiles.forEach(p => processedUsers.set(p.email.toLowerCase(), p.documentId));

  // Load existing membership records to avoid duplicates
  console.log('Loading existing membership records...');
  const existingRecords = await strapi.entityService.findMany('api::membership-record.membership-record', {
    fields: ['validFrom'],
    populate: { 
      profile: { fields: ['email'] },
      membership_type: { fields: ['name'] }
    }
  });
  const recordKey = (email, type, date) => `${email.toLowerCase()}|${type}|${new Date(date).getTime()}`;
  const seenRecords = new Set();
  existingRecords.forEach(r => {
    if (r.profile && r.membership_type) {
      seenRecords.add(recordKey(r.profile.email, r.membership_type.name, r.validFrom));
    }
  });

  // 3. IMPORT USERS
  console.log('Checking Users...');
  const users = [];
  await new Promise((resolve) => {
    fs.createReadStream(usersPath).pipe(csv()).on('data', (data) => users.push(data)).on('end', resolve);
  });

  let newUserCount = 0;
  for (const row of users) {
    const email = row['E-mail']?.trim().toLowerCase();
    if (!email || processedUsers.has(email)) continue;

    try {
      let passport = row['ID / Passport']?.trim();
      if (!passport || passport === 'TBA') passport = `TEMP-${email.split('@')[0]}-ID`;
      let income = parseFloat((row['Past Year Income (USD)'] || '0').replace(/[^0-9.]/g, '')) || 0;
      let memberId = row['Membership Number']?.trim() || `CMF-M${Math.floor(100000 + Math.random() * 900000)}`;

      const newUser = await strapi.plugins['users-permissions'].services.user.add({
        username: email, email: email, password: defaultPassword, confirmed: true, role: 1
      });

      const profile = await strapi.entityService.create('api::profile.profile', {
        data: {
          firstName: row['First Name'] || 'Member',
          lastName: row['Last Name'] || '',
          chineseName: row['Chinese Name'] || '',
          email: email,
          phone: row['Contact No'] || `N/A-${Math.random()}`,
          companyName: row['Company'] || 'N/A',
          designation: row['Position'] || 'N/A',
          passportNo: passport,
          pastYearIncome: income,
          country: row['Billing country'] || 'Thailand',
          memberId: memberId,
          gender: row['Gender']?.toLowerCase() === 'female' ? 'Female' : 'Male',
          tShirtSize: (['S', 'M', 'L', 'XL', 'XXL'].includes(row['Shirt Size'])) ? row['Shirt Size'] : 'L',
          user: newUser.id
        }
      });
      processedUsers.set(email, profile.documentId);
      newUserCount++;
    } catch (err) {
      console.error(`Failed to import user ${email}:`, err.message);
    }
  }
  console.log(`Created ${newUserCount} new users.`);

  // 4. IMPORT TRANSACTIONS
  console.log('Importing Transactions...');
  const transactions = [];
  await new Promise((resolve) => {
    fs.createReadStream(transPath).pipe(csv()).on('data', (data) => transactions.push(data)).on('end', resolve);
  });

  let transCount = 0;
  for (const row of transactions) {
    const email = row['user_email']?.trim().toLowerCase();
    const awardName = row['product_name']?.trim();
    const regDate = row['created_at'];
    
    if (!email || !processedUsers.has(email)) continue;
    if (seenRecords.has(recordKey(email, awardName, regDate))) continue;
    
    const awardDocId = awardMap[awardName];
    if (!awardDocId) continue;

    try {
      const expiresAt = row['expires_at'] ? new Date(row['expires_at']) : null;
      const status = (expiresAt && expiresAt < new Date()) ? 'expired' : 'active';

      await strapi.entityService.create('api::membership-record.membership-record', {
        data: {
          name: awardName,
          membership_type: awardDocId,
          profile: processedUsers.get(email),
          validUntil: expiresAt,
          validFrom: regDate ? new Date(regDate) : new Date(),
          membershipStatus: status
        }
      });
      transCount++;
      if (transCount % 50 === 0) {
        console.log(`Progress: ${transCount} new records created...`);
        await new Promise(r => setTimeout(r, 100)); // Throttling to prevent EADDRNOTAVAIL
      }
    } catch (err) {
      console.error(`Failed to import transaction for ${email}:`, err.message);
    }
  }

  console.log(`Imported ${transCount} new membership records.`);
  console.log('--- MIGRATION COMPLETE ---');
  process.exit(0);
}

migrate();
