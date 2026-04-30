export default {
  routes: [
    {
      method: 'POST',
      path: '/orders/checkout',
      handler: 'api::order.order.checkout',
      config: { auth: false }
    },
    {
      method: 'POST',
      path: '/orders/enroll',
      handler: 'api::order.order.enroll',
      config: { auth: false }
    },
    {
      method: 'POST',
      path: '/orders/ticket-checkout',
      handler: 'api::order.order.ticketCheckout',
      config: { auth: false }
    },
    {
      method: 'GET',
      path: '/orders/confirm',
      handler: 'api::order.order.confirm',
      config: {
        auth: false,
      },
    },
    {
      method: 'POST',
      path: '/orders/webhook',
      handler: 'api::order.order.webhook',
      config: {
        auth: false,
      },
    },
    {
      method: 'GET',
      path: '/orders/ticket/:attendeeId/pdf',
      handler: 'api::order.order.downloadTicket',
      config: { auth: false }
    },
    {
      method: 'GET',
      path: '/orders/my-orders',
      handler: 'api::order.order.myOrders',
      config: { }
    },
    {
      method: 'GET',
      path: '/orders/:id/download-invoice',
      handler: 'api::order.order.downloadInvoice',
      config: { auth: false }
    },
    {
      method: 'GET',
      path: '/orders/report',
      handler: 'api::order.order.report',
      config: { auth: false }
    },
    {
      method: 'POST',
      path: '/orders/admin-bridge',
      handler: 'api::order.order.adminBridge',
      config: { auth: false }
    },
    {
      method: 'POST',
      path: '/orders/clear-password-flag',
      handler: 'api::order.order.clearPasswordFlag',
      config: { }
    },
  ],
};
