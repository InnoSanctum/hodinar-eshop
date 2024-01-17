import {useLocation} from '@remix-run/react';
import type {SelectedOption} from '@shopify/hydrogen/storefront-api-types';
import {useState, useEffect, useContext} from 'react';
import {useMemo} from 'react';
import {VojtikContext} from './components/custom/VojtikContext';
import CS from './translations/CS.json';
import EN from './translations/EN.json';
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

export function useLanguage(/* language:I18nLocale */) {
  const [translations, setTranslations] = useState({});
  const {language} = useContext(VojtikContext);
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
    setTranslations(language.language === 'CS' ? CS : EN);
  }, [language.language]);
  return translations;
}
