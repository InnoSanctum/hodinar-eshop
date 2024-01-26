import {Await, useMatches} from '@remix-run/react';
import {Suspense, useContext} from 'react';
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
import CS from '../../public/assets/flags/4x3/cz.svg';
import EN from '../../public/assets/flags/4x3/us.svg';

type HeaderProps = Pick<LayoutProps, 'header' | 'cart' | 'isLoggedIn'>;

type Viewport = 'desktop' | 'mobile';

export const languages: I18nLocale[] = [
  {
    country: 'CZ',
    language: 'CS',
    pathPrefix: '',
  },
  {
    country: 'US',
    language: 'EN',
    pathPrefix: '/en',
  },
];

function LanguagesList({
  languages,
  activeLanguage,
}: {
  languages: I18nLocale[];
  activeLanguage: I18nLocale;
}) {


  const flags = {CS, EN};
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
            sizes=" 1rem"
            className="h-8"
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
          Home
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
      <div className='hidden md:block'><Call /></div>
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
  return (
    <a href={`tel:${number}`} className='h-8 flex gap-2 items-center'>
      <img src={phone} className='h-6' /><p className='hidden lg:block'>Potřebujete poradit?</p>
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
