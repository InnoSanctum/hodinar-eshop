import {useLocation, useMatches} from '@remix-run/react';
import type {SelectedOption} from '@shopify/hydrogen/storefront-api-types';
import {useState, useEffect, useContext} from 'react';
import {useMemo} from 'react';
import {VojtikContext} from './components/custom/VojtikContext';
// import CS from './translations/cs.json';
// import EN from './translations/en.json';
import {Locale, countries} from './data';
import {languages} from './components/Header';
export function useVariantUrl(
  handle: string,
  selectedOptions: SelectedOption[],
) {
  const {pathname} = useLocation();

  return useMemo(() => {
    return getVariantUrl({
      handle,
      pathname,
      searchParams: new URLSearchParams(),
      selectedOptions,
    });
  }, [handle, selectedOptions, pathname]);
}

export function getVariantUrl({
  handle,
  pathname,
  searchParams,
  selectedOptions,
}: {
  handle: string;
  pathname: string;
  searchParams: URLSearchParams;
  selectedOptions: SelectedOption[];
}) {
  const match = /(\/[a-zA-Z]{2}-[a-zA-Z]{2}\/)/g.exec(pathname);
  const isLocalePathname = match && match.length > 0;

  const path = isLocalePathname
    ? `${match![0]}products/${handle}`
    : `/products/${handle}`;

  selectedOptions.forEach((option) => {
    searchParams.set(option.name, option.value);
  });

  const searchString = searchParams.toString();

  return path + (searchString ? '?' + searchParams.toString() : '');
}

const CS = {
  "buttons": {
    "more": "Více",
    "previous": "Předchozí",
    "basket": "Přidat do košíku",
    "sold": "Vyprodáno",
    "search": "Hledat",
    "all_results": "View all results for ",
    "apply": "Aplikovat",
    "checkout": "Pokračujte k pokladně"
  },
  "totals": "Soušty",
  "collections":"Kolekce",
  "subtotal": "Mezisoučet",
  "description": "Popis",
  "results":"Žádné výsledky, zkuste to jinak.",
  "recommended_products": "Doporučené produkty",
  "copyright": "Všechna práva vyhrazena.",
  "load": "Načíst",
  "register":"Registrace",
  "login":"Přihlášení",
  "email":"Email",
  "password":"Heslo",
  "password2":"Zadejte heslo znovu",
  "password3":"Zapomenuté heslo"
}
const EN = {
  "buttons": {
    "more": "More",
    "previous": "Previous",
    "basket": "Add to Basket",
    "sold": "Sold Out",
    "search": "Search",
    "all_results": "View all results for ",
    "apply": "Apply",
    "checkout": "Proceed to Checkout"
  },
  "totals": "Totals",
  "collections": "Collections",
  "subtotal": "Subtotal",
  "description": "Description",
  "results": "No results, try a different search.",
  "recommended_products": "Recommended Products",
  "copyright": "All rights reserved.",
  "load": "Load",
  "register": "Registration",
  "login": "Login",
  "email": "Email",
  "password": "Password",
  "password2": "Enter Password Again",
  "password3": "Forgotten Password"
}


export function useLanguage(/* language:I18nLocale */): Language {
  const [translations, setTranslations] = useState<Language>(CS);
  const {
    language: {language},
  } = useContext(VojtikContext);
  useEffect(() => {
    console.log(language);
    // Dynamicky importuje požadovaný jazykový soubor
    // import(`./translations/${language.language}.json`)
    //   .then((module) => {
    //     setTranslations(module.default);
    //     console.log("module",module.default)
    //   })
    //   .catch(() => {
    //     console.error(
    //       `Could not load translations for language: ${language.language}`,
    //     );
    //   });
    setTranslations(language === 'CS' ? CS : EN);
  }, [language]);
  return translations;
}
export interface Language {
  buttons: Buttons;
  totals: string;
  subtotal: string;
  description: string;
  recommended_products: string;
  results: string;
  load: string;
  copyright: string;
  collections: string;
  register: string;
  login: string;
  email: string;
  password: string;
  password2: string;
  password3: string;
}

export interface Buttons {
  more: string;
  previous: string;
  basket: string;
  sold: string;
  search: string;
  all_results: string;
  apply: string;
  checkout: string;
}

export function usePrefixPathWithLocale(path: string): string {
  const [root] = useMatches();
  const selectedLocale = root.data.selectedLocale;

  return selectedLocale
    ? `${selectedLocale.pathPrefix}${path.startsWith('/') ? path : '/' + path}`
    : path;
}
export function getLocaleFromRequest(request: Request): I18nLocale {
  const url = new URL(request.url);
  const firstPathPart = url.pathname.split('/')[1]?.toUpperCase() ?? '';
  console.log('firstPathPart', firstPathPart);

  for (let i = 0; i < languages.length; i++) {
    if (firstPathPart === languages[i].language) return languages[i];
  }
  return languages[0];
}
