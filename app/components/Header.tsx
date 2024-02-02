import {Await, useMatches} from '@remix-run/react';
import {Suspense, useContext, useEffect, useState} from 'react';
import type {HeaderQuery} from 'storefrontapi.generated';
import type {LayoutProps} from './Layout';
import {useRootLoaderData} from '~/root';
import cart from '../../public/assets/svgs/cart.svg';
import search from '../../public/assets/svgs/search.svg';
import user from '../../public/assets/svgs/user.svg';
import phone from '../../public/assets/svgs/phone.svg';
import {Image} from '@shopify/hydrogen';
import {VojtikContext} from './custom/VojtikContext';
import VojtikNavLink from './custom/VojtikNavLink';
// import '/node_modules/flag-icons/css/flag-icons.min.css';
// import "../styles/flags.css";
import CZ from '../../public/assets/flags/4x3/cz.svg';
import EN from '../../public/assets/flags/4x3/us.svg';
import EU from '../../public/assets/flags/4x3/eu.svg';
import {useLanguage} from '~/utils';
import arrow from '../../public/assets/svgs/arrowBlack.svg';
import Button from './Button';
import clsx from 'clsx';

type HeaderProps = Pick<LayoutProps, 'header' | 'cart' | 'isLoggedIn'>;

type Viewport = 'desktop' | 'mobile';

export const languages: I18nLocale[] = [
  {
    country: 'CZ',
    language: 'CS',
    pathPrefix: '/',
  },
  {
    country: 'US',
    language: 'CS',
    pathPrefix: '/cz-UDS',
  },
  {
    country: 'FR',
    language: 'CS',
    pathPrefix: '/cz-EUR',
  },
  {
    country: 'US',
    language: 'EN',
    pathPrefix: '/en-US',
  },
  {
    country: 'CZ',
    language: 'EN',
    pathPrefix: '/en-CZK',
  },
  {
    country: 'FR',
    language: 'EN',
    pathPrefix: '/en-EUR',
  },
];

function LanguagesList({
  languages,
  activeLanguage,
}: {
  languages: I18nLocale[];
  activeLanguage: I18nLocale;
}) {
  const [isOpen, setOpenState] = useState(false); // const flags = {CS, EN};
  const [selectedLanguage, setLanguage] = useState<string>(
    activeLanguage.language,
  );
  const [selectedCurrency, setCurrency] = useState<string>(
    activeLanguage.country,
  );
  const [url, setUrl] = useState('');
  function findUrl() {
    for (let i = 0; i < languages.length; i++) {
      const language = languages[i];
      if (
        language.country === selectedCurrency &&
        language.language === selectedLanguage
      )
        return language.pathPrefix;
    }
    return '';
  }
  useEffect(() => {
    console.log(findUrl());
    setUrl(findUrl());
  }, [selectedLanguage, selectedCurrency]);

  const languageList = {
    EN: {
      name: 'English',
      icon: EN,
    },
    CS: {
      name: 'Čeština',
      icon: CZ,
    },
  };
  const currencyList = {
    CZ: {
      name: 'CZK',
      icon: CZ,
    },
    FR: {
      name: 'EUR',
      icon: EU,
    },
    US: {
      name: 'USD',
      icon: EN,
    },
  };
  const languageText = useLanguage();
  return (
    <div className="relative">
      <span
        onClick={() => setOpenState(!isOpen)}
        className="flex gap-2 items-center bg-secondary text-primary p-2 py-1 rounded-md cursor-pointer"
      >
        <img className="h-4" src={languageList[activeLanguage.language].icon} />
        <span className="hidden xl:inline">
          {languageList[activeLanguage.language].name}
        </span>{' '}
        | {currencyList[activeLanguage.country].name}
        <img
          style={{transform: `rotate(${isOpen ? -90 : 90}deg)`}}
          className="h-4 transition-all"
          src={arrow}
        />
      </span>
      {isOpen && (
        <div
          className="fixed top-0 left-0 w-full h-screen"
          onClick={() => setOpenState(false)}
        ></div>
      )}
      {isOpen && (
        <div className="min-w-full bg-secondary text-primary p-2 py-1 rounded-md absolute translate-y-4 flex flex-col gap-2">
          <div>
            <h4>{languageText.language}</h4>
            <span className="flex gap-4">
              {Object.keys(languageList).map((key, index) => {
                return (
                  <span
                    className={clsx(
                      'cursor-pointer transition-all',
                      selectedLanguage === key && 'scale-125 drop-shadow-lg',
                    )}
                    key={index}
                    onClick={() => setLanguage(key)}
                    key={index}
                  >
                    <img className="h-5" src={languageList[key].icon} />
                  </span>
                );
              })}
            </span>
          </div>
          <div>
            <h4>{languageText.currency}</h4>
            <span className="flex gap-4">
              {Object.keys(currencyList).map((key, index) => {
                return (
                  <span
                    className={clsx(
                      'cursor-pointer transition-all',
                      selectedCurrency === key && 'scale-125 drop-shadow-lg',
                    )}
                    key={index}
                    onClick={() => setCurrency(key)}
                  >
                    <img className="h-5" src={currencyList[key].icon} />
                  </span>
                );
              })}
            </span>
          </div>
          <a href={url} className="p-2 py-1 rounded-md bg-tertiary m-auto">
            {languageText.buttons.apply}
          </a>
        </div>
      )}
    </div>
  );
  return (
    <div className="flex gap-4 flex-wrap">
      {languages.map((language) => {
        if (language.language === activeLanguage.language) return null;
        return (
          <a
            className="hover:underline"
            key={language.pathPrefix}
            href={language.pathPrefix || '/'}
          >
            <img className="h-4" src={flags[language.language]} />
          </a>
        );
      })}
    </div>
  );
}
export function Header({header, isLoggedIn, cart}: HeaderProps) {
  const {shop, menu} = header;
  return (
    <header className="header backdrop-blur-2xl bg-primary/50 text-secondary z-20 relative">
      <VojtikNavLink prefetch="intent" to={'/'} style={activeLinkStyle} end>
        <span className="flex items-center gap-4 font-title">
          <Image
            src={shop.brand?.logo?.image?.url}
            sizes="1rem"
            width={27}
            className="h-8 w-[27px]"
          />
          <strong className="self-center sm:text-2xl font-semibold whitespace-nowrap text-tertiary hidden sm:block">
            {shop.name}
          </strong>
        </span>
      </VojtikNavLink>
      <HeaderMenu
        menu={menu}
        viewport="desktop"
        primaryDomainUrl={header.shop.primaryDomain.url}
      />
      <HeaderCtas isLoggedIn={isLoggedIn} cart={cart} />
    </header>
  );
}

export function HeaderMenu({
  menu,
  primaryDomainUrl,
  viewport,
}: {
  menu: HeaderProps['header']['menu'];
  primaryDomainUrl: HeaderQuery['shop']['primaryDomain']['url'];
  viewport: Viewport;
}) {
  const {publicStoreDomain} = useRootLoaderData();
  const className = `header-menu-${viewport}`;
  const language = useLanguage();
  function closeAside(event: React.MouseEvent<HTMLAnchorElement>) {
    if (viewport === 'mobile') {
      event.preventDefault();
      window.location.href = event.currentTarget.href;
    }
  }

  return (
    <nav className={className} role="navigation">
      {viewport === 'mobile' && (
        <VojtikNavLink
          end
          onClick={closeAside}
          prefetch="intent"
          style={activeLinkStyle}
          to={'/'}
        >
          {language.home}
        </VojtikNavLink>
      )}
      {(menu || FALLBACK_HEADER_MENU).items.map((item) => {
        if (!item.url) return null;

        // if the url is internal, we strip the domain
        const url =
          item.url.includes('myshopify.com') ||
          item.url.includes(publicStoreDomain) ||
          item.url.includes(primaryDomainUrl)
            ? new URL(item.url).pathname
            : item.url;
        return (
          <VojtikNavLink
            className="header-menu-item text-secondary"
            end
            key={item.id}
            onClick={closeAside}
            prefetch="intent"
            style={activeLinkStyle}
            to={url}
          >
            {item.title}
          </VojtikNavLink>
        );
      })}
    </nav>
  );
}

function HeaderCtas({
  isLoggedIn,
  cart,
}: Pick<HeaderProps, 'isLoggedIn' | 'cart'>) {
  const context = useContext(VojtikContext);
  return (
    <nav className="header-ctas" role="navigation">
      <HeaderMenuMobileToggle />
      <div className="hidden md:block">
        <Call />
      </div>
      <LanguagesList languages={languages} activeLanguage={context.language} />
      <VojtikNavLink prefetch="intent" to={'/account'} style={activeLinkStyle}>
        {isLoggedIn ? 'Account' : <img src={user} className="h-4" />}
      </VojtikNavLink>
      <SearchToggle />
      <CartToggle cart={cart} />
    </nav>
  );
}

function HeaderMenuMobileToggle() {
  return (
    <a className="header-menu-mobile-toggle" href="#mobile-menu-aside">
      <h3>☰</h3>
    </a>
  );
}

function SearchToggle() {
  return (
    <a href="#search-aside">
      <img src={search} className="h-4" />
    </a>
  );
}

function CartBadge({count}: {count: number}) {
  return (
    <a href="#cart-aside" className="inline-flex gap-2 items-center">
      <img src={cart} className="h-4" /> {count}
    </a>
  );
}

function CartToggle({cart}: Pick<HeaderProps, 'cart'>) {
  return (
    <Suspense fallback={<CartBadge count={0} />}>
      <Await resolve={cart}>
        {(cart) => {
          if (!cart) return <CartBadge count={0} />;
          return <CartBadge count={cart.totalQuantity || 0} />;
        }}
      </Await>
    </Suspense>
  );
}

const FALLBACK_HEADER_MENU = {
  id: 'gid://shopify/Menu/199655587896',
  items: [
    {
      id: 'gid://shopify/MenuItem/461609500728',
      resourceId: null,
      tags: [],
      title: 'Collections',
      type: 'HTTP',
      url: '/collections',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609533496',
      resourceId: null,
      tags: [],
      title: 'Blog',
      type: 'HTTP',
      url: '/blogs/journal',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609566264',
      resourceId: null,
      tags: [],
      title: 'Policies',
      type: 'HTTP',
      url: '/policies',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609599032',
      resourceId: 'gid://shopify/Page/92591030328',
      tags: [],
      title: 'About',
      type: 'PAGE',
      url: '/pages/about',
      items: [],
    },
  ],
};

export function Call() {
  const number = '+420 608 211 665';
  const language = useLanguage();
  return (
    <a href={`tel:${number}`} className="h-8 flex gap-2 items-center">
      <p className="hidden lg:block">{language.help}</p>
      <img src={phone} className="h-6" />
      <p>{number}</p>
    </a>
  );
}

function activeLinkStyle({
  isActive,
  isPending,
}: {
  isActive: boolean;
  isPending: boolean;
}) {
  return {
    fontWeight: isActive ? 'bold' : undefined,
    color: isPending ? 'grey' : 'white',
  };
}
