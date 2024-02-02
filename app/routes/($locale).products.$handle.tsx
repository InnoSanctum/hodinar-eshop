import {Suspense} from 'react';
import {defer, redirect, type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {
  Await,
  Link,
  useLoaderData,
  type MetaFunction,
  type FetcherWithComponents,
} from '@remix-run/react';
import type {
  ProductFragment,
  ProductVariantsQuery,
  ProductVariantFragment,
} from 'storefrontapi.generated';

import {
  Image,
  Money,
  VariantSelector,
  type VariantOption,
  getSelectedProductOptions,
  CartForm,
} from '@shopify/hydrogen';
import type {
  CartLineInput,
  SelectedOption,
} from '@shopify/hydrogen/storefront-api-types';
import {getVariantUrl, useLanguage} from '~/utils';
import '../styles/normalize.css';

import LightGallery from 'lightgallery/react';

// import styles
import 'lightgallery/css/lightgallery.css';
import 'lightgallery/css/lg-zoom.css';
import 'lightgallery/css/lg-thumbnail.css';

// If you want you can use SCSS instead of css
// import 'lightgallery/scss/lightgallery.scss';
// import 'lightgallery/scss/lg-zoom.scss';

// import plugins if you need
import lgThumbnail from 'lightgallery/plugins/thumbnail';
import lgZoom from 'lightgallery/plugins/zoom';
import {useWindowSize} from '@uidotdev/usehooks';

import {Swiper, SwiperSlide} from 'swiper/react';
import '../styles/swiper.css';
import {
  Navigation,
  Pagination,
  Scrollbar,
  A11y,
  Autoplay,
} from 'swiper/modules';
import Button from '~/components/Button';
import {RecommendedProducts} from './($locale)._index';
import VojtikLink from '~/components/custom/VojtikLink';
import ReactPlayer from 'react-player/lazy';
import delivery from '../../public/assets/svgs/fast-delivery.svg';

export const meta: MetaFunction<typeof loader> = ({data}) => {
  return [{title: `Ateliér Pryimak | ${data?.product.title ?? ''}`}];
};

export async function loader({params, request, context}: LoaderFunctionArgs) {
  const {handle} = params;
  const {storefront} = context;
  const selectedOptions = getSelectedProductOptions(request).filter(
    (option) =>
      // Filter out Shopify predictive search query params
      !option.name.startsWith('_sid') &&
      !option.name.startsWith('_pos') &&
      !option.name.startsWith('_psq') &&
      !option.name.startsWith('_ss') &&
      !option.name.startsWith('_v') &&
      // Filter out third party tracking params
      !option.name.startsWith('fbclid'),
  );

  if (!handle) {
    throw new Error('Expected product handle to be defined');
  }

  // await the query for the critical product data
  const {product} = await storefront.query(PRODUCT_QUERY, {
    variables: {handle, selectedOptions},
  });
  const {collection: recommendedProducts} = await storefront.query(
    RECOMMENDED_PRODUCTS_QUERY,
    {
      variables: {handle: product?.collections.edges[0]?.node.handle || ''},
    },
  );

  if (!product?.id) {
    throw new Response(null, {status: 404});
  }
  const filteredRecommendedProducts =
    recommendedProducts?.products.nodes.filter(
      (recommendedProduct) => recommendedProduct.id != product.id,
    );

  // const recommendedRandomProducts = await storefront.query(
  //   RECOMMENDED_RANDOM_PRODUCTS_QUERY,
  //   {variables: {first: 4 - (filteredRecommendedProducts?.length || 0)}},
  // );
  const firstVariant = product.variants.nodes[0];
  const firstVariantIsDefault = Boolean(
    firstVariant.selectedOptions.find(
      (option: SelectedOption) =>
        option.name === 'Title' && option.value === 'Default Title',
    ),
  );

  if (firstVariantIsDefault) {
    product.selectedVariant = firstVariant;
  } else {
    // if no selected variant was returned from the selected options,
    // we redirect to the first variant's url with it's selected options applied
    if (!product.selectedVariant) {
      throw redirectToFirstVariant({product, request});
    }
  }

  // In order to show which variants are available in the UI, we need to query
  // all of them. But there might be a *lot*, so instead separate the variants
  // into it's own separate query that is deferred. So there's a brief moment
  // where variant options might show as available when they're not, but after
  // this deffered query resolves, the UI will update.
  const variants = storefront.query(VARIANTS_QUERY, {
    variables: {handle},
  });

  return defer({
    product,
    variants,
    recommendedProducts: {products: {nodes: filteredRecommendedProducts}},
  });
}

function redirectToFirstVariant({
  product,
  request,
}: {
  product: ProductFragment;
  request: Request;
}) {
  const url = new URL(request.url);
  const firstVariant = product.variants.nodes[0];

  return redirect(
    getVariantUrl({
      pathname: url.pathname,
      handle: product.handle,
      selectedOptions: firstVariant.selectedOptions,
      searchParams: new URLSearchParams(url.search),
    }),
    {
      status: 302,
    },
  );
}

export default function Product() {
  const {product, variants, recommendedProducts} =
    useLoaderData<typeof loader>();
  const {selectedVariant} = product;
  const size = useWindowSize();

  return (
    <div className="flex flex-col gap-8">
      <div className="product">
        {size.width && size.width >= 720 ? (
          <div className=' flex flex-col gap-4"'>
            <LightGallery
              speed={500}
              plugins={[lgThumbnail, lgZoom]}
              elementClassNames=" flex flex-col gap-4"
            >
              {product.media.edges.map((image, i) => {
                if (image.node.mediaContentType === 'VIDEO') return null;
                return (
                  <a key={i} href={image.node.image.url}>
                    <ProductImage image={image} />
                  </a>
                );
              })}
            </LightGallery>
            {product.media.edges.map((image, i) => {
              return (
                <div key={i}>
                  <ProductVideo image={image} />
                </div>
              );
            })}
          </div>
        ) : (
          <Swiper
            modules={[Pagination, Scrollbar, A11y, Autoplay]}
            spaceBetween={50}
            slidesPerView={1}
            className="w-full mb-8"
            navigation
            loop
            speed={1500}
            autoplay={{delay: 5000}}
            pagination={{clickable: true}}
            style={
              {
                '--swiper-pagination-color': '#fff',
                '--swiper-navigation-color': '#fff',
              } as any
            }
          >
            {product.media.edges.map((image, i) => (
              <SwiperSlide key={i}>
                <ProductImage image={image} />
                <div className="h-full flex items-center">
                  <ProductVideo image={image} />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        )}
        <ProductMain
          selectedVariant={selectedVariant}
          product={product}
          variants={variants}
        />
      </div>
      {recommendedProducts?.products?.nodes?.length ? (
        <RecommendedProducts products={recommendedProducts} />
      ) : null}
    </div>
  );
}

function ProductVideo({image}: {image: ProductVariantFragment['image']}) {
  if (!image) {
    return <div className="product-image" />;
  }
  if (image?.node?.mediaContentType === 'VIDEO')
    return (
      <div>
        <ReactPlayer
          url={image?.node?.sources[0].url}
          width="640"
          height="360"
          controls
        />
      </div>
    );
  return null;
}

function ProductImage({image}: {image: ProductVariantFragment['image']}) {
  if (!image) {
    return <div className="product-image" />;
  }
  if (image?.node?.mediaContentType === 'IMAGE')
    return (
      <div className="product-image">
        <Image
          alt={image?.node?.altText || 'Product Image'}
          aspectRatio="1/1"
          data={image.node.image}
          key={image.node.image.id}
          loading="lazy"
          className="object-cover"
          sizes="(min-width: 45em) 50vw, 100vw"
        />
      </div>
    );
  return null;
}

function Delivery() {
  const date = new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 14);
  const language = useLanguage();
  return (
    <div>
      <span className="text-lg">1-2 {language.week}</span>
      <br />
      <span>{language.shipping}:</span>
      <time>
        {' '}
        {date.getUTCDate()}.{date.getUTCMonth() + 1}.{date.getUTCFullYear()}
      </time>
    </div>
  );
}

function ProductMain({
  selectedVariant,
  product,
  variants,
}: {
  product: ProductFragment;
  selectedVariant: ProductFragment['selectedVariant'];
  variants: Promise<ProductVariantsQuery>;
}) {
  const {title, descriptionHtml} = product;
  const language = useLanguage();
  return (
    <div className="product-main">
      <h1>{title}</h1>
      <ProductPrice selectedVariant={selectedVariant} />
      <br />
      <Suspense
        fallback={
          <ProductForm
            product={product}
            selectedVariant={selectedVariant}
            variants={[]}
          />
        }
      >
        <Delivery />
        <Await
          errorElement="There was a problem loading product variants"
          resolve={variants}
        >
          {(data) => (
            <ProductForm
              product={product}
              selectedVariant={selectedVariant}
              variants={data.product?.variants.nodes || []}
            />
          )}
        </Await>
      </Suspense>
      <br />
      <VojtikLink to={'/policies/shipping-policy'}>
        <span className=" flex flex-wrap gap-3">
          <img src={delivery} className="h-6" />
          {language.shippingOptions}
        </span>
      </VojtikLink>
      <br />
      <h4>
        <strong>{language.description}</strong>
      </h4>
      <div
        className="text"
        dangerouslySetInnerHTML={{__html: descriptionHtml}}
      />
      <br />
    </div>
  );
}

function ProductPrice({
  selectedVariant,
}: {
  selectedVariant: ProductFragment['selectedVariant'];
}) {
  const language = useLanguage();
  return (
    <div className="product-price">
      {selectedVariant?.compareAtPrice ? (
        <>
          <p>{language.sale}</p>
          <br />
          <div className="product-price-on-sale">
            {selectedVariant ? <Money data={selectedVariant.price} /> : null}
            <s>
              <Money data={selectedVariant.compareAtPrice} />
            </s>
          </div>
        </>
      ) : (
        selectedVariant?.price && <Money data={selectedVariant?.price} />
      )}
    </div>
  );
}

function ProductForm({
  product,
  selectedVariant,
  variants,
}: {
  product: ProductFragment;
  selectedVariant: ProductFragment['selectedVariant'];
  variants: Array<ProductVariantFragment>;
}) {
  const language = useLanguage();
  return (
    <div className="product-form">
      <VariantSelector
        handle={product.handle}
        options={product.options}
        variants={variants}
      >
        {({option}) => <ProductOptions key={option.name} option={option} />}
      </VariantSelector>
      <br />
      <AddToCartButton
        disabled={!selectedVariant || !selectedVariant.availableForSale}
        onClick={() => {
          window.location.href = window.location.href + '#cart-aside';
        }}
        lines={
          selectedVariant
            ? [
                {
                  merchandiseId: selectedVariant.id,
                  quantity: 1,
                },
              ]
            : []
        }
      >
        {selectedVariant?.availableForSale
          ? language.buttons.basket
          : language.buttons.sold}
      </AddToCartButton>
    </div>
  );
}

function ProductOptions({option}: {option: VariantOption}) {
  return (
    <div className="product-options" key={option.name}>
      <h5>{option.name}</h5>
      <div className="product-options-grid">
        {option.values.map(({value, isAvailable, isActive, to}) => {
          return (
            <Link
              className="product-options-item"
              key={option.name + value}
              prefetch="intent"
              preventScrollReset
              replace
              to={to}
              style={{
                border: isActive ? '1px solid white' : '1px solid transparent',
                opacity: isAvailable ? 1 : 0.3,
              }}
            >
              {value}
            </Link>
          );
        })}
      </div>
      <br />
    </div>
  );
}

function AddToCartButton({
  analytics,
  children,
  disabled,
  lines,
  onClick,
}: {
  analytics?: unknown;
  children: React.ReactNode;
  disabled?: boolean;
  lines: CartLineInput[];
  onClick?: () => void;
}) {
  return (
    <CartForm route="/cart" inputs={{lines}} action={CartForm.ACTIONS.LinesAdd}>
      {(fetcher: FetcherWithComponents<any>) => (
        <>
          <input
            name="analytics"
            type="hidden"
            value={JSON.stringify(analytics)}
          />
          <button
            type="submit"
            onClick={onClick}
            disabled={disabled ?? fetcher.state !== 'idle'}
          >
            <Button>{children}</Button>
          </button>
        </>
      )}
    </CartForm>
  );
}

const PRODUCT_VARIANT_FRAGMENT = `#graphql
  fragment ProductVariant on ProductVariant {
    availableForSale
    compareAtPrice {
      amount
      currencyCode
    }
    id
    
    image {
      __typename
      id
      url
      altText
      width
      height
    }
    price {
      amount
      currencyCode
    }
    product {
      title
      handle
    }
    selectedOptions {
      name
      value
    }
    sku
    title
    unitPrice {
      amount
      currencyCode
    }
  }
` as const;

const PRODUCT_FRAGMENT = `#graphql
  fragment Product on Product {
    id
    title
    vendor
    handle
    descriptionHtml
    description
    collections(first: 10){
      edges{
        node{
          title
          handle
        }
      }
    }
    
    media(first: 10) {
      edges {
        node { 
          mediaContentType
          ... on MediaImage {
            alt
            image {
              id
              url
              altText
              width
              height
            }
          }
          ... on Video {
            id
            previewImage {
              url
            }
            sources {
              format
              height
              mimeType
              url
              width
            }
          }
        }
      }
    }

    options {
      name
      values
    }
    selectedVariant: variantBySelectedOptions(selectedOptions: $selectedOptions) {
      ...ProductVariant
    }
    variants(first: 1) {
      nodes {
        ...ProductVariant
      }
    }
    seo {
      description
      title
    }
  }
  ${PRODUCT_VARIANT_FRAGMENT}
` as const;

const PRODUCT_QUERY = `#graphql
  query Product(
    $country: CountryCode
    $handle: String!
    $language: LanguageCode
    $selectedOptions: [SelectedOptionInput!]!
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      ...Product
    }
  }
  ${PRODUCT_FRAGMENT}
` as const;

const PRODUCT_VARIANTS_FRAGMENT = `#graphql
  fragment ProductVariants on Product {
    variants(first: 250) {
      nodes {
        ...ProductVariant
      }
    }
  }
  ${PRODUCT_VARIANT_FRAGMENT}
` as const;

const VARIANTS_QUERY = `#graphql
  ${PRODUCT_VARIANTS_FRAGMENT}
  query ProductVariants(
    $country: CountryCode
    $language: LanguageCode
    $handle: String!
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      ...ProductVariants
    }
  }
` as const;

const RECOMMENDED_PRODUCTS_QUERY = `#graphql
  fragment RecommendedProductCollection on Product {
    id
    title
    description
    handle
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    images(first: 2) {
      nodes {
        id
        url
        altText
        width
        height
      }
    }
  }

  query RecommendedProductCollection($country: CountryCode, $language: LanguageCode, $handle: String!)
    @inContext(country: $country, language: $language) {
      collection(handle: $handle) {
      products(first: 4, sortKey: BEST_SELLING, reverse: true) {
        nodes {
          ...RecommendedProductCollection
        }
      }
    }
  }
` as const;
