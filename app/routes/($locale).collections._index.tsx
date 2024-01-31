import {useLoaderData, Link} from '@remix-run/react';
import {json, type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {Pagination, getPaginationVariables, Image} from '@shopify/hydrogen';
import type {
  CollectionFragment,
  ProductsListFragment,
} from 'storefrontapi.generated';
import VojtikLink from '~/components/custom/VojtikLink';
import Loading from '~/components/Loading';
import {useLanguage} from '~/utils';
import Product from '~/components/Product';
import {ReactElement, useEffect, useState} from 'react';
import {motion, AnimatePresence} from 'framer-motion';
import arrow from '../../public/assets/svgs/arrow.svg';

export async function loader({context, request}: LoaderFunctionArgs) {
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 100,
  });
  const {products} = await context.storefront.query(PRODUCTS_QUERY);

  const {collections} = await context.storefront.query(COLLECTIONS_QUERY, {
    variables: paginationVariables,
  });
  const url = new URL(request.url);
  const data = url.searchParams.get('filters');
  console.log(url, data);
  const filtersUrl: Filter | null = data && JSON.parse(data);
  return json({collections, products, filtersUrl, href: url.href});
}

interface Filter {
  price: {from: number | undefined; to: number | undefined};
  availability: boolean | undefined;
  style: string[] | undefined;
  brand: string[] | undefined;
}

export default function Collections() {
  const {collections, products, filtersUrl, href} =
    useLoaderData<typeof loader>();
  const [filters, setFilters] = useState<Filter>(
    /* {
      price: {from: undefined, to: undefined},
      availability: undefined,
      brand: undefined,
      style: undefined,
    } */ (filtersUrl as Filter) || {
      price: {from: undefined, to: undefined},
      availability: undefined,
      brand: undefined,
      style: undefined,
    },
  );
  function createUrl() {
    const url = new URL(location.href);
    return `${url.origin}${url.pathname}?filters=${encodeURIComponent(
      JSON.stringify(filters),
    )}`;
  }
  useEffect(() => {
    console.log(href);
    const newUrl = createUrl();
    console.log(newUrl);
    if (href !== newUrl) window.history.pushState({id: 1}, 'xd', newUrl);
  }, [filters]);
  const language = useLanguage();
  return (
    <div className="collections">
      <h1>{language.collections}</h1>
      <div className="flex flex-col lg:flex-row">
        <Filters
          filters={filters}
          collections={collections.nodes}
          products={products.nodes}
          setFilters={setFilters}
        />
        <ProductsGrid products={products.nodes} filters={filters} />
      </div>
    </div>
  );
}
function ProductsGrid({
  products,
  filters,
}: {
  products: ProductsListFragment[];
  filters: Filter;
}) {
  const filteredArray = (array1: any[], array2: any[]) =>
    array1.filter((value) => array2.includes(value));
  return (
    <AnimatePresence mode="wait">
      <div className="flex flex-wrap justify-start gap-8">
        {products.map((product, index) => {
          if (filters.brand)
            console.log(
              filteredArray(
                filters.brand,
                product.collections.nodes.map((e) => e.handle),
              ),
            );
          if (filters.price)
            if (
              (filters.price.from &&
                parseInt(product.priceRange.minVariantPrice.amount) <
                  filters.price.from) ||
              (filters.price.to &&
                parseInt(product.priceRange.minVariantPrice.amount) >
                  filters.price.to)
            )
              return null;
          if (filters.style && filters.style.length)
            if (
              !filteredArray(
                filters.style,
                product.collections.nodes.map((e) => e.handle),
              ).length
            )
              return null;
          if (filters.brand && filters.brand.length)
            if (
              !filteredArray(
                filters.brand,
                product.collections.nodes.map((e) => e.handle),
              ).length
            )
              return null;
          if (filters.availability !== undefined)
            if (filters.availability !== product.availableForSale) return null;
          return (
            <motion.div
              layout
              key={product.id}
              initial={{opacity: 0}}
              animate={{opacity: 1}}
              exit={{opacity: 0}}
              transition={{
                duration: 0.5,
                ease: [0, 0.71, 0.2, 1.01],
              }}
            >
              <Product
                key={product.id}
                product={product}
                loading={index < 8 ? 'eager' : undefined}
              />
            </motion.div>
          );
        })}
      </div>
    </AnimatePresence>
  );
}

function parseBrand(string: string): string {
  return string.split('-')[1];
}

function FilterSection({
  name,
  children,
  active,
}: {
  name: string;
  active?: number;
  children: ReactElement;
}) {
  const [isOpen, setOpenState] = useState(false);
  return (
    <div className="p-4 border-t-2 border-secondary flex flex-wrap gap-4 lg:flex-col lg:min-w-56">
      <span
        onClick={() => setOpenState(!isOpen)}
        className="flex justify-between cursor-pointer w-full"
      >
        <h4>
          {name} {active && active > 0 ? `(${active})` : null}
        </h4>
        <img
          style={{transform: `rotate(${isOpen ? -90 : 90}deg)`}}
          className="h-6 transition-all"
          src={arrow}
        />
      </span>
      {isOpen && <>{children}</>}
    </div>
  );
}

function Filters({
  setFilters,
  products,
  collections,
  filters,
}: {
  filters: Filter;
  setFilters: (props: Filter) => void;
  products: ProductsListFragment[];
  collections: CollectionFragment[];
}) {
  const brands = collections.filter((collection) =>
    parseBrand(collection.title),
  );
  const styles = collections.filter(
    (collection) => !parseBrand(collection.title),
  );
  console.log(filters.price);
  function setAvailability(availability: boolean): void {
    filters.availability =
      filters.availability === availability ? undefined : availability;
    setFilters({...filters});
  }
  function setStyle(string: string): void {
    setFilters((prevFilters: Filter) => {
      // Vytvoření kopie stávajícího seznamu stylů nebo inicializace prázdného pole, pokud je undefined
      const currentStyles = prevFilters.style ? [...prevFilters.style] : [];

      // Kontrola, zda již string existuje v poli
      if (currentStyles.includes(string)) {
        // Odebrání stylu, pokud již existuje
        return {
          ...prevFilters,
          style: currentStyles.filter((style) => style !== string),
        };
      } else {
        // Přidání stylu, pokud neexistuje
        return {
          ...prevFilters,
          style: [...currentStyles, string],
        };
      }
    });
  }
  function setBrand(string: string): void {
    setFilters((prevFilters: Filter) => {
      // Vytvoření kopie stávajícího seznamu stylů nebo inicializace prázdného pole, pokud je undefined
      const currentBrands = prevFilters.brand ? [...prevFilters.brand] : [];

      // Kontrola, zda již string existuje v poli
      if (currentBrands.includes(string)) {
        // Odebrání stylu, pokud již existuje
        return {
          ...prevFilters,
          brand: currentBrands.filter((brand) => brand !== string),
        };
      } else {
        // Přidání stylu, pokud neexistuje
        return {
          ...prevFilters,
          brand: [...currentBrands, string],
        };
      }
    });
  }

  const language = useLanguage();
  return (
    <div>
      <div className=" lg:sticky lg:top-20">
        <div className="filter__height overflow-y-scroll">
          <h3>{language.filters.filter}:</h3>
          <FilterSection
            active={filters.availability !== undefined ? 1 : 0}
            name={language.filters.availability}
          >
            <>
              <span>
                <input
                  onChange={() => setAvailability(true)}
                  id="dostupné"
                  type="checkbox"
                  checked={
                    filters.availability === undefined
                      ? false
                      : filters.availability
                  }
                  className="w-4 h-4 rounded focus:ring-blue-500focus:ring-2border-gray-600"
                />
                <label htmlFor="dostupné" className="ms-2 font-medium">
                  {language.filters.avaible}
                </label>
              </span>
              <span>
                <input
                  onChange={() => setAvailability(false)}
                  id="prodané"
                  type="checkbox"
                  checked={
                    filters.availability === undefined
                      ? false
                      : !filters.availability
                  }
                  className="w-4 h-4 rounded focus:ring-blue-500focus:ring-2border-gray-600"
                />
                <label htmlFor="prodané" className="ms-2 font-medium">
                  {language.filters.sold}
                </label>
              </span>
            </>
          </FilterSection>
          <FilterSection
            active={filters.style?.length}
            name={language.filters.style}
          >
            <>
              {styles.map((style, index) => {
                return (
                  <span key={index}>
                    <input
                      onChange={() => setStyle(style.handle)}
                      id={style.handle}
                      type="checkbox"
                      checked={filters.style?.includes(style.handle)}
                      className="w-4 h-4 rounded focus:ring-blue-500focus:ring-2border-gray-600"
                    />
                    <label htmlFor={style.handle} className="ms-2 font-medium">
                      {style.title}
                    </label>
                  </span>
                );
              })}
            </>
          </FilterSection>
          <FilterSection
            name={`${language.filters.price} (${products[0].priceRange.minVariantPrice.currencyCode})`}
          >
            <>
              <input
                name="q"
                placeholder={language.filters.from}
                type="number"
                className="text-primary bg-secondary"
                onChange={(e) => {
                  console.log(e.target.value);
                  filters.price.from = parseInt(e.target.value) || undefined;
                  setFilters({...filters});
                }}
              />
              <input
                name="q"
                placeholder={language.filters.to}
                type="number"
                className="text-primary bg-secondary"
                onChange={(e) => {
                  console.log(e.target.value);
                  filters.price.to = parseInt(e.target.value) || undefined;
                  setFilters({...filters});
                }}
              />
            </>
          </FilterSection>
          <FilterSection
            active={filters.brand?.length}
            name={language.filters.clockwork}
          >
            <>
              {brands.map((brand, index) => {
                return (
                  <span key={index}>
                    <input
                      onChange={() => setBrand(brand.handle)}
                      id={brand.handle}
                      type="checkbox"
                      checked={filters.brand?.includes(brand.handle)}
                      className="w-4 h-4 rounded focus:ring-blue-500focus:ring-2border-gray-600"
                    />
                    <label htmlFor={brand.handle} className="ms-2 font-medium">
                      {parseBrand(brand.title)}
                    </label>
                  </span>
                );
              })}
            </>
          </FilterSection>
        </div>
      </div>
    </div>
  );
}

function CollectionsGrid({collections}: {collections: CollectionFragment[]}) {
  return (
    <div className="collections-grid">
      {collections.map((collection, index) => (
        <CollectionItem
          key={collection.id}
          collection={collection}
          index={index}
        />
      ))}
    </div>
  );
}

function CollectionItem({
  collection,
  index,
}: {
  collection: CollectionFragment;
  index: number;
}) {
  return (
    <VojtikLink
      className="collection-item"
      key={collection.id}
      to={`/collections/${collection.handle}`}
      prefetch="intent"
    >
      {collection?.image && (
        <Image
          alt={collection.image.altText || collection.title}
          aspectRatio="1/1"
          data={collection.image}
          className="object-cover"
          loading={index < 3 ? 'eager' : undefined}
        />
      )}
      <h5>{collection.title}</h5>
    </VojtikLink>
  );
}

const PRODUCTS_QUERY = `#graphql
  fragment ProductsList on Product {
    id
    title
    description
    handle
    availableForSale
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
    collections(first: 10) {  # Přidáno pole pro kategorie
    nodes {
      id
      title
      handle
    }
  }
  }
  query ProductsList ($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    products(first: 200, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...ProductsList
      }
    }
  }
` as const;

const COLLECTIONS_QUERY = `#graphql
  fragment Collection on Collection {
    id
    title
    handle
    image {
      id
      url
      altText
      width
      height
    }
  }
  query StoreCollections(
    $country: CountryCode
    $endCursor: String
    $first: Int
    $language: LanguageCode
    $last: Int
    $startCursor: String
  ) @inContext(country: $country, language: $language) {
    collections(
      first: $first,
      last: $last,
      before: $startCursor,
      after: $endCursor
    ) {
      nodes {
        ...Collection
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
` as const;
