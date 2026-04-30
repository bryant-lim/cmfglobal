export default {
  register({ strapi }) {
    const userCT = strapi.contentType('plugin::users-permissions.user');
    if (userCT) {
      userCT.attributes.mustChangePassword = {
        type: 'boolean',
        default: false,
      };
    }
  },

  async bootstrap({ strapi }) {
    // 🔐 PERMISSION SYNC: Ensure Authenticated & Public roles have correct permissions
    try {
      const actions = [
        'plugin::upload.content-api.upload',
        'plugin::upload.content-api.destroy',
        'api::profile.profile.me',
        'api::profile.profile.updateMe',
        'api::profile.profile.directory',
        'api::profile.profile.registerPublicMember',
        'api::profile.profile.testLogin',
        'api::global-setting.global-setting.find',
        'api::order.order.myOrders',
        'api::order.order.downloadInvoice',
        'api::order.order.clearPasswordFlag'
      ];
      
      const roleTypes = ['authenticated', 'public'];
      for (const type of roleTypes) {
        const role = await strapi.db.query('plugin::users-permissions.role').findOne({
          where: { type }
        });
        
        if (role) {
          for (const action of actions) {
            const existing = await strapi.db.query('plugin::users-permissions.permission').findOne({
              where: { role: role.id, action }
            });
            if (!existing) {
              await strapi.db.query('plugin::users-permissions.permission').create({
                data: { role: role.id, action }
              });
              console.log(`🔐 [${type.toUpperCase()}] Granted ${action}`);
            }
          }
        }
      }
    } catch (err: any) {
      console.log('⚠️ Permission Sync Error:', err.message);
    }

    console.log('🚀 [BOOTSTRAP] CMF Global Services: READY');
  },
};
