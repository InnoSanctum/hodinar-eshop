import { defer, type LoaderFunctionArgs } from '@shopify/remix-oxygen';
import { Await, useLoaderData, Link, type MetaFunction } from '@remix-run/react';
import { Suspense } from 'react';
import { Image, Money } from '@shopify/hydrogen';
import type {
  FeaturedCollectionFragment,
  RecommendedProductsQuery,
} from 'storefrontapi.generated';
import Product from '~/components/Product';
import { Swiper, SwiperSlide } from "swiper/react";
import {
  Navigation,
  Pagination,
  Scrollbar,
  A11y,
  Autoplay,
} from "swiper/modules";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";

export const meta: MetaFunction = () => {
  return [{ title: 'ATELIÉR PRYIMAK' }];
};

export async function loader({ context }: LoaderFunctionArgs) {
  const { storefront } = context;
  const { collections } = await storefront.query(FEATURED_COLLECTION_QUERY);
  const featuredCollection = collections.nodes[0];
  const recommendedProducts = storefront.query(RECOMMENDED_PRODUCTS_QUERY);

  return defer({ featuredCollection, recommendedProducts });
}

export default function Homepage() {
  const data = useLoaderData<typeof loader>();
  return (
    <div className="home">
      <Hero />
      <FeaturedCollection collection={data.featuredCollection} />
      <RecommendedProducts products={data.recommendedProducts} />
    </div>
  );
}

function Hero() {
  return <div>
    <Swiper
      modules={[Navigation, Pagination, Scrollbar, A11y, Autoplay]}
      spaceBetween={50}
      slidesPerView={1}
      className="w-full"
      navigation
      loop
      speed={1500}
      autoplay={{ delay: 5000 }}
      pagination={{ clickable: true }}
      style={
        {
          "--swiper-pagination-color": "#fff",
          "--swiper-navigation-color": "#fff",
        } as any
      }
    >
      {slice.items.map((item, i) => {
        return (
          <SwiperSlide key={i}>
            <div className="xl:w-3/4 m-auto">
              <article className="md:grid grid-cols-2 gap-4 md:gap-8 lg:gap-16 h-[80vh] relative">
                <div className="z-10 md:z-0 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 md:translate-x-0 md:translate-y-0 md:static flex flex-col justify-center items-end gap-8">
                  <span
                    className={clsx(
                      "max-w-lg text-end relative pb-4",
                      prismic.isFilled.link(item.button_link) &&
                      "after:content-[''] after:absolute after:w-full after:h-[2px] after:bg-secondary after:left-0 after:rounded-sm after:bottom-0"
                    )}
                  >
                    <PrismicRichText field={item.text} />
                  </span>
                  <PrismicNextLink field={item.button_link}>
                    <Button>{item.button_text}</Button>
                  </PrismicNextLink>
                </div>
                <div>
                  <figure className="h-[80vh]">
                    <PrismicNextImage
                      field={item.image.Medium}
                      className="rounded-lg w-full h-full object-cover opacity-30 md:opacity-100"
                    />
                  </figure>
                </div>
              </article>
            </div>
          </SwiperSlide>
        );
      })}
    </Swiper>
  </div>
}

function FeaturedCollection({
  collection,
}: {
  collection: FeaturedCollectionFragment;
}) {
  if (!collection) return null;
  const image = collection?.image;
  return (
    <Link
      className="featured-collection"
      to={`/collections/${collection.handle}`}
    >
      {image && (
        <div className="featured-collection-image">
          <Image data={image} sizes="100vw" />
        </div>
      )}
      <h1>{collection.title}</h1>
    </Link>
  );
}

function RecommendedProducts({
  products,
}: {
  products: Promise<RecommendedProductsQuery>;
}) {
  return (
    <div className="recommended-products">
      <h2>Doporučené produkty</h2>
      <Suspense fallback={<div>Loading...</div>}>
        <Await resolve={products}>
          {({ products }) => (
            <div className="recommended-products-grid">
              {products.nodes.map((product) => (
                <Product product={product} />
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

const RECOMMENDED_PRODUCTS_QUERY = `#graphql
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
    products(first: 4, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...RecommendedProduct
      }
    }
  }
` as const;
