
export default async ({ strapi }) => {
  console.log('🚀 Starting Membership Migration Sweep...');

  // 1. Fetch all profiles with legacy membership data
  const profiles = await strapi.db.query('api::profile.profile').findMany({
    populate: ['membership_type', 'user', 'wallet_records']
  });

  console.log(`🔍 Found ${profiles.length} profiles to check.`);

  for (const profile of profiles) {
    if (profile.membership_type && profile.memberId) {
      // 2. Check if this specific membership is already in the wallet
      const alreadyInWallet = profile.wallet_records?.some(r => 
        r.memberId === profile.memberId && 
        r.membership_type?.id === profile.membership_type.id
      );

      if (!alreadyInWallet) {
        console.log(`📦 Migrating legacy membership for: ${profile.firstName} (${profile.memberId})`);
        
        try {
          await strapi.db.query('api::membership-record.membership-record').create({
            data: {
              tierName: profile.membership_type.name,
              memberId: profile.memberId,
              validUntil: profile.validUntil,
              membershipStatus: profile.membershipStatus || 'active',
              membership_type: profile.membership_type.id,
              user: profile.user?.id,
              profile: profile.id
            }
          });
          console.log(`✅ Success for ${profile.firstName}`);
        } catch (err) {
          console.error(`❌ Failed migrating ${profile.firstName}:`, err.message);
        }
      } else {
        console.log(`⏭️ ${profile.firstName} already has this card in their wallet.`);
      }
    }
  }

  console.log('🏁 Migration Sweep Complete.');
};
