const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1339';

// Map frontend locale codes to Strapi locale codes
const mapLocale = (locale: string) => {
  if (locale === 'cn') return 'zh-Hans';
  return locale; // 'en' -> 'en'
};

export const getFullImageUrl = (url: string | null | undefined) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${STRAPI_URL}${url}`;
};

export async function getActiveMembers(locale: string = 'en') {
  try {
    const strapiLocale = mapLocale(locale);
    const res = await fetch(`${STRAPI_URL}/api/membership-assignments?locale=${strapiLocale}&populate[member]=*&populate[membershipType]=*&populate[portraitPhoto]=*&filters[status][$eq]=active`, {
      cache: 'no-store'
    });
    
    if (!res.ok) throw new Error('Failed to fetch members');
    
    const json = await res.json();
    return json.data;
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function getMemberships(locale: string = 'en') {
  const url = `${STRAPI_URL}/api/membership-types?populate[category][populate]=*&populate[photo][populate]=*`;
  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) {
      const errorText = await res.text();
      console.error(`Fetch error ${res.status}: ${errorText}`);
      throw new Error(`Failed to fetch memberships: ${res.status}`);
    }
    const json = await res.json();
    return json.data;
  } catch (error) {
    console.error('API Error:', error);
    return [];
  }
}

export async function getMembershipByDocumentId(documentId: string, locale: string = 'en') {
  try {
    const res = await fetch(`${STRAPI_URL}/api/membership-types/${documentId}?populate=*`, { cache: 'no-store' });
    const json = await res.json();
    return json.data;
  } catch (error) {
    console.error('Failed to fetch membership details:', error);
    return null;
  }
}

export async function getPaymentSettings() {
  try {
    const res = await fetch(`${STRAPI_URL}/api/payment-setting`, { cache: 'no-store' });
    const json = await res.json();
    return json.data || { adminTaxPercentage: 0 };
  } catch (error) {
    console.error('Failed to fetch payment settings:', error);
    return { adminTaxPercentage: 0 };
  }
}

export async function getEvents(locale: string = 'en') {
  try {
    const res = await fetch(`${STRAPI_URL}/api/events?populate[tiers][populate]=*&populate[photo][populate]=*`, {
      cache: 'no-store'
    });
    if (!res.ok) throw new Error('Failed to fetch events');
    const json = await res.json();
    return json.data;
  } catch (error) {
    console.error(error);
    return [];
  }
}
