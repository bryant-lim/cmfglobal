
export default async ({ strapi }) => {
  console.log('🚀 INITIATING UNIVERSAL IDENTITY SWEEP...');

  // 1. Fetch all membership records
  const records = await strapi.db.query('api::membership-record.membership-record').findMany({
    populate: ['membership_type']
  });

  console.log(`📦 Updating ${records.length} card labels...`);

  for (const record of records) {
    // Determine the correct name based on the relationship
    const correctName = record.membership_type?.name || 'Standard Member';
    
    await strapi.db.query('api::membership-record.membership-record').update({
      where: { id: record.id },
      data: { name: correctName }
    });
  }

  // 2. Force the Admin UI Configuration again (Just to be triple sure)
  try {
    const coreStore = strapi.store({ 
      type: 'plugin', 
      name: 'content-manager', 
      key: 'configuration_content_types::api::membership-record.membership-record' 
    });
    const config = await coreStore.get();
    if (config) {
      config.settings.mainField = 'name';
      config.settings.defaultSortBy = 'createdAt';
      await coreStore.set({ value: config });
      console.log('✅ Admin View Config: Primary Header set to "name"');
    }
  } catch (err) {
    console.error('⚠️ Admin Config Warning:', err.message);
  }

  console.log('🏁 SWEEP COMPLETE. REFRESH ADMIN NOW.');
};
