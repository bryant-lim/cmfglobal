export default {
  routes: [
    {
      method: 'GET',
      path: '/profiles/me',
      handler: 'api::profile.profile.me',
      config: { }
    },
    {
      method: 'PUT',
      path: '/profiles/update-me',
      handler: 'api::profile.profile.updateMe',
      config: { }
    },
    {
      method: 'GET',
      path: '/profiles/directory',
      handler: 'api::profile.profile.directory',
      config: { auth: false }
    },
    {
      method: 'POST',
      path: '/profiles/register-member',
      handler: 'api::profile.profile.registerPublicMember',
      config: { auth: false }
    },
    {
      method: 'GET',
      path: '/profiles/testLogin',
      handler: 'api::profile.profile.testLogin',
      config: { auth: false }
    }
  ]
};
