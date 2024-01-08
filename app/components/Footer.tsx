import {Link, NavLink} from '@remix-run/react';
import { Image } from '@shopify/hydrogen';
import type {FooterQuery, HeaderQuery} from 'storefrontapi.generated';
import {useRootLoaderData} from '~/root';

export function Footer({
  menu,
  shop,
}: FooterQuery & {shop: HeaderQuery['shop']}) {
  return (<footer className="rounded-lg shadow bg-secondary/10 p-4 mt-auto">
  <div className="w-full max-w-screen-xl mx-auto p-4 md:py-8">
    <div className="flex items-center justify-center sm:justify-between flex-wrap gap-8">
      <Link
        to="/"
        className="flex items-center space-x-3 rtl:space-x-reverse"
      >
        <span className="flex items-center gap-4 font-title self-center text-2xl font-semibold whitespace-nowrap text-tertiary">
        <Image src={shop.brand?.logo?.image?.url} sizes='1rem' className='h-8' />
          {shop.name}
        </span>
      </Link>
      {menu && shop?.primaryDomain?.url && (
        <FooterMenu menu={menu} primaryDomainUrl={shop.primaryDomain.url} />
      )}
      {menu && shop?.primaryDomain?.url && (
        <FooterMenu menu={menu} primaryDomainUrl={shop.primaryDomain.url} />
      )}
      {/* <ul className="flex flex-wrap items-center mb-6 text-sm font-medium sm:mb-0  gap-4">
        {settings.data.socials.map((item, i) => (
          <li key={i}>
            <PrismicNextLink field={item.link}>
              <PrismicNextImage field={item.icon} className="h-8 w-8 p-2" />
            </PrismicNextLink>
          </li>
        ))}
      </ul> */}
    </div>
    <hr className="my-6 border-gray-200 sm:mx-auto  lg:my-8" />
    <span className="block text-sm sm:text-center ">
      © {new Date().getFullYear()}{" "}
      <Link to="/" className="hover:underline">
        {shop.name}
      </Link>
      . All Rights Reserved.
    </span>
  </div>
</footer>
    
  );
}

function FooterMenu({
  menu,
  primaryDomainUrl,
}: {
  menu: FooterQuery['menu'];
  primaryDomainUrl: HeaderQuery['shop']['primaryDomain']['url'];
}) {
  const {publicStoreDomain} = useRootLoaderData();

  return (
    <nav className="footer-menu" role="navigation">
      {(menu || FALLBACK_FOOTER_MENU).items.map((item) => {
        if (!item.url) return null;
        // if the url is internal, we strip the domain
        const url =
          item.url.includes('myshopify.com') ||
          item.url.includes(publicStoreDomain) ||
          item.url.includes(primaryDomainUrl)
            ? new URL(item.url).pathname
            : item.url;
        const isExternal = !url.startsWith('/');
        return isExternal ? (
          <a href={url} key={item.id} rel="noopener noreferrer" target="_blank">
            {item.title}
          </a>
        ) : (
          <NavLink
            end
            key={item.id}
            prefetch="intent"
            style={activeLinkStyle}
            to={url}
          >
            {item.title}
          </NavLink>
        );
      })}
    </nav>
  );
}

const FALLBACK_FOOTER_MENU = {
  id: 'gid://shopify/Menu/199655620664',
  items: [
    {
      id: 'gid://shopify/MenuItem/461633060920',
      resourceId: 'gid://shopify/ShopPolicy/23358046264',
      tags: [],
      title: 'Privacy Policy',
      type: 'SHOP_POLICY',
      url: '/policies/privacy-policy',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461633093688',
      resourceId: 'gid://shopify/ShopPolicy/23358013496',
      tags: [],
      title: 'Refund Policy',
      type: 'SHOP_POLICY',
      url: '/policies/refund-policy',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461633126456',
      resourceId: 'gid://shopify/ShopPolicy/23358111800',
      tags: [],
      title: 'Shipping Policy',
      type: 'SHOP_POLICY',
      url: '/policies/shipping-policy',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461633159224',
      resourceId: 'gid://shopify/ShopPolicy/23358079032',
      tags: [],
      title: 'Terms of Service',
      type: 'SHOP_POLICY',
      url: '/policies/terms-of-service',
      items: [],
    },
  ],
};

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
