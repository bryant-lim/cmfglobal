const { createStrapi } = require('@strapi/strapi');
const path = require('path');

async function test() {
  const appDir = path.join(__dirname, '..');
  const distDir = path.join(appDir, 'dist');
  const app = await createStrapi({ appDir, distDir }).load();
  
  const profileController = strapi.controller('api::profile.profile');
  
  // Mock context
  const mockCtx = {
    state: {
      user: null
    },
    request: {
      header: {
        authorization: ''
      }
    },
    unauthorized(msg) {
      console.error('unauthorized:', msg);
      return { error: 'unauthorized', message: msg };
    },
    badRequest(msg) {
      console.error('badRequest:', msg);
      return { error: 'badRequest', message: msg };
    }
  };

  // Fetch admin user
  const adminUser = await strapi.query('plugin::users-permissions.user').findOne({
    where: { email: 'admin@cmfglobal.com' },
    populate: ['role']
  });
  
  if (!adminUser) {
    console.error('Admin user not found!');
    process.exit(1);
  }
  
  const token = strapi.plugin('users-permissions').service('jwt').issue({ id: adminUser.id });
  mockCtx.request.header.authorization = `Bearer ${token}`;
  
  console.log('--- TESTING PENDING APPROVALS CONTROLLER METHOD ---');
  const result = await profileController.pendingApprovals(mockCtx);
  console.log('Result:', JSON.stringify(result, null, 2));
  
  process.exit(0);
}

test().catch(err => {
  console.error(err);
  process.exit(1);
});
