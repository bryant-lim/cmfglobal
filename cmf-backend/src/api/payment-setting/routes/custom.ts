export default {
  routes: [
    {
      method: 'GET',
      path: '/payment-setting',
      handler: 'api::payment-setting.payment-setting.find',
      config: {
        auth: false,
      },
    },
  ],
};
