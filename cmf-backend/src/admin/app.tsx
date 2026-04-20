import type { StrapiApp } from '@strapi/strapi/admin';

export default {
  config: {
    locales: [],
    tutorials: false,
    notifications: { release: false },
  },
  bootstrap(app: StrapiApp) {
    // Inject a custom external link into the main sidebar
    // We use a high-order function to hook into the menu
    (app as any).addMenuLink({
      to: `${window.location.origin.replace('1339', '3003')}/en/admin/auth-bridge?secret=CMF_ADMIN_SECRET_2026_!`,
      icon: () => '📊',
      intlLabel: {
        id: 'analytics',
        defaultMessage: 'Reports & Analytics',
      },
      Component: () => null, // Just a link
    });
  },
};
