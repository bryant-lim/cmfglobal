
async function run() {
  try {
    const user = await strapi.query('plugin::users-permissions.user').findOne({
      orderBy: { createdAt: 'desc' },
      populate: ['role']
    });

    if (!user) {
      console.log('❌ NO USERS FOUND');
      return;
    }

    console.log('✅ LATEST USER FOUND:');
    console.log('- Email:', user.email);
    console.log('- Username:', user.username);
    console.log('- Confirmed:', user.confirmed);
    console.log('- Blocked:', user.blocked);
    console.log('- Role:', user.role?.name);
    console.log('- Created At:', user.createdAt);

    process.exit(0);
  } catch (err) {
    console.error('❌ ERROR:', err.message);
    process.exit(1);
  }
}

run();
