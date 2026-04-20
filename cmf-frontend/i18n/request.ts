import {getRequestConfig} from 'next-intl/server';

export default getRequestConfig(async ({requestLocale}) => {
  // This will typically be one of `[en, cn]`
  let locale = await requestLocale;

  // Ensure that a valid locale is used
  if (!locale || !['en', 'cn'].includes(locale)) {
    locale = 'en';
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default
  };
});
