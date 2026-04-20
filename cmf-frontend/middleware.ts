import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  // A list of all locales that are supported
  locales: ['en', 'cn'],

  // Used when no locale matches
  defaultLocale: 'en',
  
  // Set to false to avoid having the locale in the URL for the default locale
  localePrefix: 'as-needed',

  // Disable automatic locale detection to prevent redirecting to /cn based on browser settings
  localeDetection: false
});

export const config = {
  // Match all pathnames except for
  // - API routes
  // - Static files (_next, images, favicon, etc.)
  matcher: ['/((?!api|_next|.*\\..*).*)']
};
