import type {
  LanguageCode,
  CountryCode,
} from '@shopify/hydrogen/storefront-api-types';

export type Locale = {
  language: LanguageCode;
  country: CountryCode;
  label: string;
  host: string;
  pathPrefix?: string;
};

export const countries: Record<string, Locale> = {
  default: {
    language: 'CS',
    country: 'CZ',
    label: 'Česká Republika (CZK)', // Labels to be shown in the country selector
    host: 'hydrogen.shop', // The host and pathPrefix are used for linking
  },
  EN: {
    language: 'EN',
    country: 'US',
    label: 'Canada (CAD $)',
    host: 'ca.hydrogen.shop',
  },
  'fr-ca': {
    language: 'EN',
    country: 'CA',
    label: 'Canada (Français) (CAD $)',
    host: 'ca.hydrogen.shop',
    pathPrefix: '/fr',
  },
  'en-au': {
    language: 'EN',
    country: 'AU',
    label: 'Australia (AUD $)',
    host: 'hydrogen.au',
  },
};
