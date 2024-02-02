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

const CS: Language = {
  buttons: {
    more: 'Více',
    previous: 'Předchozí',
    basket: 'Přidat do košíku',
    sold: 'Vyprodáno',
    search: 'Hledat',
    all_results: 'View all results for ',
    apply: 'Aplikovat',
    checkout: 'Pokračujte k pokladně',
    remove: 'Odstranit',
  },
  cart: {
    text: 'Vypadá to, že jste ještě nic nepřidali, pojďme začít!',
    continue: 'Pokračovat v nákupu',
    checkout: 'Pokračujte k pokladně',
  },
  filters: {
    availability: 'Dostupnost',
    clockwork: 'Strojek',
    from: 'Od',
    to: 'Do',
    price: 'Cena',
    style: 'Styl',
    filter: 'Filtry',
    avaible: 'Skladem',
    sold: 'Prodáno',
  },
  totals: 'Součty',
  collections: 'Kolekce',
  subtotal: 'Mezisoučet',
  description: 'Popis',
  results: 'Žádné výsledky, zkuste to jinak.',
  recommended_products: 'Doporučené produkty',
  copyright: 'Všechna práva vyhrazena.',
  load: 'Načíst',
  register: 'Registrace',
  login: 'Přihlášení',
  email: 'Email',
  password: 'Heslo',
  password2: 'Zadejte heslo znovu',
  password3: 'Zapomenuté heslo',
  discount: 'Sleva/y',
  discount_code: 'Slevový kód',
  quantity: 'Množství',
  help: 'Potřebujete poradit?',
  home: 'Domů',
  sale: 'Sleva',
  currency: 'Měna',
  language: 'Jazyk',
};
const EN: Language = {
  buttons: {
    more: 'More',
    previous: 'Previous',
    basket: 'Add to Basket',
    sold: 'Sold Out',
    search: 'Search',
    all_results: 'View all results for ',
    apply: 'Apply',
    checkout: 'Proceed to Checkout',
    remove: 'Remove',
  },
  cart: {
    text: "Looks like you haven't added anything yet, let's get you started!",
    continue: 'Continue shopping',
    checkout: 'Continue to Checkout',
  },
  filters: {
    availability: 'Availability',
    clockwork: 'Clockwork',
    from: 'From',
    to: 'To',
    price: 'Price',
    style: 'Style',
    filter: 'Filters',
    avaible: 'Avaible',
    sold: 'Sold',
  },
  currency: 'Currency',
  language: 'Language',
  totals: 'Totals',
  collections: 'Collections',
  subtotal: 'Subtotal',
  description: 'Description',
  results: 'No results, try a different search.',
  recommended_products: 'Recommended Products',
  copyright: 'All rights reserved.',
  load: 'Load',
  register: 'Registration',
  login: 'Login',
  email: 'Email',
  password: 'Password',
  password2: 'Enter Password Again',
  password3: 'Forgotten Password',
  discount: 'Discount(s)',
  discount_code: 'Discount code',
  quantity: 'Quantity',
  help: 'Do you need advice?',
  home: 'Home',
  sale: 'Sale',
};

export function useLanguage(/* language:I18nLocale */): Language {
  const [translations, setTranslations] = useState<Language>(CS);
  const {
    language: {language},
  } = useContext(VojtikContext);
  useEffect(() => {
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
  cart: Cart;
  filters: Filters;
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
  discount: string;
  discount_code: string;
  quantity: string;
  help: string;
  home: string;
  sale: string;
  language: string;
  currency: string;
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
  remove: string;
}
interface Cart {
  text: string;
  continue: string;
  checkout: string;
}
interface Filters {
  availability: string;
  style: string;
  price: string;
  clockwork: string;
  from: string;
  to: string;
  filter: string;
  avaible: string;
  sold: string;
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
  for (let i = 0; i < languages.length; i++) {
    if (
      firstPathPart === languages[i].pathPrefix.toUpperCase().replace('/', '')
    )
      return languages[i];
  }
  return languages[0];
}
