import {defer, type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {Await, useLoaderData, Link, type MetaFunction} from '@remix-run/react';
import {Suspense, useContext} from 'react';
import {Image, Money} from '@shopify/hydrogen';
import type {
  FeaturedCollectionFragment,
  RecommendedProductsQuery,
} from 'storefrontapi.generated';
import Product from '~/components/Product';
// Import Swiper React components
import {Swiper, SwiperSlide} from 'swiper/react';
import '../styles/swiper.css';
import {
  Navigation,
  Pagination,
  Scrollbar,
  A11y,
  Autoplay,
} from 'swiper/modules';

import clsx from 'clsx';
import Button from '~/components/Button';
import VojtikLink from '../components/custom/VojtikLink';
import {useLanguage} from '~/utils';
import Loading from '~/components/Loading';

export const meta: MetaFunction<typeof loader> = ({data}) => {
  return [{title: 'ATELIÉR PRYIMAK'}];
};

export async function loader({context}: LoaderFunctionArgs) {
  const {storefront} = context;
  const {collections} = await storefront.query(FEATURED_COLLECTION_QUERY);
  const featuredCollection = collections.nodes[0];
  const recommendedProducts = storefront.query(RECOMMENDED_PRODUCTS_QUERY);

  return defer({featuredCollection, recommendedProducts});
}

export default function Homepage() {
  // console.log(useLoca)
  const data = useLoaderData<typeof loader>();
  return (
    <div className="home flex flex-col gap-16">
      <Hero products={data.recommendedProducts} />
      {/* <FeaturedCollection collection={data.featuredCollection} /> */}
      <RecommendedProducts products={data.recommendedProducts} />
    </div>
  );
}

function Hero({products}: {products: Promise<RecommendedProductsQuery>}) {
  const language = useLanguage();
  return (
    <div>
      <Suspense fallback={<Loading />}>
        <Await resolve={products}>
          {({products}) => (
            <Swiper
              modules={[Pagination, Scrollbar, A11y, Autoplay]}
              spaceBetween={50}
              slidesPerView={1}
              className="w-full bg-primary md:bg-transparent"
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
              {products.nodes
                .filter(
                  (product) =>
                    !product.collections.nodes.find(
                      (collection) => collection.title === 'Řemínky',
                    ),
                )
                .map((product) => (
                  <SwiperSlide key={product.id}>
                    <div className="xl:w-3/4 m-auto">
                      <article className="md:grid grid-cols-2 gap-4 md:gap-8 lg:gap-16 h-[80vh] relative">
                        <div className="z-10 md:z-0 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 md:translate-x-0 md:translate-y-0 md:static flex flex-col justify-center items-end gap-8">
                          <span
                            className={clsx(
                              'max-w-lg text-end relative pb-4',
                              "after:content-[''] after:absolute after:w-full after:h-[2px] after:bg-secondary after:left-0 after:rounded-sm after:bottom-0",
                            )}
                          >
                            <h4>{product.title}</h4>
                          </span>
                          <VojtikLink
                            key={product.id}
                            className="recommended-product"
                            to={`/products/${product.handle}`}
                          >
                            <Button>{language.buttons.more}</Button>
                          </VojtikLink>
                        </div>
                        <div>
                          <figure className="h-[80vh]">
                            <Image
                              sizes="(min-width: 45em) 60vw, 50vw"
                              data={product.images.nodes[0]}
                              className="rounded-lg w-full h-full object-cover opacity-50 md:opacity-100"
                            />
                          </figure>
                        </div>
                      </article>
                    </div>
                  </SwiperSlide>
                ))}
            </Swiper>
          )}
        </Await>
      </Suspense>
    </div>
  );
}

function FeaturedCollection({
  collection,
}: {
  collection: FeaturedCollectionFragment;
}) {
  if (!collection) return null;
  const image = collection?.image;
  return (
    <VojtikLink
      className="featured-collection"
      to={`/collections/${collection.handle}`}
    >
      {image && (
        <div className="featured-collection-image">
          <Image data={image} sizes="100vw" />
        </div>
      )}
      <h1>{collection.title}</h1>
    </VojtikLink>
  );
}

export function RecommendedProducts({
  products,
}: {
  products: Promise<RecommendedProductsQuery>;
}) {
  const language = useLanguage();
  return (
    <div className="recommended-products">
      <h2>{language.recommended_products}</h2>
      <Suspense fallback={<Loading />}>
        <Await resolve={products}>
          {({products}) => (
            <div className="flex flex-wrap gap-8 justify-center">
              {products.nodes
                .filter(
                  (product) =>
                    !product.collections.nodes.find(
                      (collection) => collection.title === 'Řemínky',
                    ),
                )
                .map((product) => (
                  <Product product={product} key={product.id} />
                ))}
            </div>
          )}
        </Await>
      </Suspense>
      <br />
    </div>
  );
}

const FEATURED_COLLECTION_QUERY = `#graphql
  fragment FeaturedCollection on Collection {
    id
    title
    image {
      id
      url
      altText
      width
      height
    }
    handle
  }
  query FeaturedCollection($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    collections(first: 1, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...FeaturedCollection
      }
    }
  }
` as const;

export const RECOMMENDED_PRODUCTS_QUERY = `#graphql
  fragment RecommendedProduct on Product {
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
    collections(first: 10) {  # Přidáno pole pro kategorie
    nodes {
      id
      title
      handle
    }}
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
  query RecommendedProducts ($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    products(first: 10, sortKey: UPDATED_AT, reverse: true,
      query: "available_for_sale:true",) {
      nodes {
        ...RecommendedProduct
      }
    }
  }
` as const;
