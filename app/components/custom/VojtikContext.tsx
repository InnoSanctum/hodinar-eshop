import {createContext} from 'react';
import type {
  LanguageCode,
  CountryCode,
} from '@shopify/hydrogen/storefront-api-types';

export type I18nLocale = {
  language: LanguageCode;
  country: CountryCode;
  pathPrefix: string;
};

interface Context {
  language: I18nLocale;
}

export const VojtikContext = createContext<Context>({
  language: {language: 'CS', country: 'CZ', pathPrefix: '/CS-CZ'},
});
