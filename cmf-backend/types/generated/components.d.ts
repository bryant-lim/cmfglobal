import type { Schema, Struct } from '@strapi/strapi';

export interface EventsPriceTier extends Struct.ComponentSchema {
  collectionName: 'components_events_price_tiers';
  info: {
    description: 'Pricing tiers for events (e.g. Super Early Bird)';
    displayName: 'Price Tier';
  };
  attributes: {
    deadline: Schema.Attribute.DateTime &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: false;
        };
      }>;
    endDateTime: Schema.Attribute.DateTime &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: false;
        };
      }>;
    priceCny: Schema.Attribute.Decimal &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: false;
        };
      }>;
    priceUsd: Schema.Attribute.Decimal &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: false;
        };
      }>;
    startDateTime: Schema.Attribute.DateTime &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: false;
        };
      }>;
    tierName: Schema.Attribute.String & Schema.Attribute.Required;
    tierNameZh: Schema.Attribute.String;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'events.price-tier': EventsPriceTier;
    }
  }
}
