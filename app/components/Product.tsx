import { Link } from '@remix-run/react'
import { Image, Money } from '@shopify/hydrogen'
import React, { useState } from 'react'
import type {
    ProductFragment, RecommendedProductFragment, RecommendedProductsQuery
} from 'storefrontapi.generated';
import { AnimatePresence, motion } from "framer-motion";
import { Fade } from "react-awesome-reveal";
import Button from './Button';

export default function Product({ product }: { product: RecommendedProductFragment }) {
    const [isHovered, setHover] = useState<boolean>(false);
    function cutText(text: string, len: number): string {
        if (text.length <= len) return text;
        let out = "";
        let n = 0;
        let wordIndex = 0;
        let words = text.split(" ");
        while (true) {
            if (n >= len) break;
            if (wordIndex) out += " ";
            for (let i = 0; i < words[wordIndex].length; i++) {
                const letter = words[wordIndex][i];
                out += letter;
                n++;
            }
            wordIndex++;
        }
        return out + "...";
    }

    return (
        <AnimatePresence key={product.id}>
            <div className="w-full max-w-sm rounded-lg shadow bg-primary transition-all hover:drop-shadow-2xl hover:z-10 hover:-translate-y-2 overflow-hidden">
                <div className="hover:bg-secondary/5 transition-all">
                    <div className="relative">
                        <div className="p-4 m-auto">
                            <Image
                                data={product.images.nodes[0]}
                                aspectRatio="1/1"
                                sizes="(min-width: 45em) 20vw, 50vw"
                            />
                        </div>
                        <div className="absolute top-0 w-full">
                            {isHovered && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{
                                        duration: 0.5,
                                        ease: [0, 0.71, 0.2, 1.01],
                                    }}
                                >
                                    <div className="p-4 m-auto">
                                        <Image
                                            data={product.images.nodes[1]}
                                            aspectRatio="1/1"
                                            sizes="(min-width: 45em) 20vw, 50vw"
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </div>
                        <div
                            className="hover__catcher absolute w-full h-full top-0"
                            onMouseEnter={() => setHover(true)}
                            onMouseLeave={() => setHover(false)}
                        ></div>
                    </div>
                    <div className="px-5 pb-5">
                        <Link
                            key={product.id}
                            className="recommended-product"
                            to={`/products/${product.handle}`}
                        >
                            <h4>{product.title}</h4>
                        </Link>
                        <p className="mb-4 font-thin ">
                            {cutText(product.description, 100)}
                        </p>
                        <div className="mb-4 ">
                            <Money data={product.priceRange.minVariantPrice} />
                        </div>

                        <Link
                            key={product.id}
                            className="recommended-product"
                            to={`/products/${product.handle}`}
                        >
                            <Button>Více</Button>
                        </Link>
                    </div>
                </div>
            </div>
        </AnimatePresence>
    );
    return (
        <Link
            key={product.id}
            className="recommended-product"
            to={`/products/${product.handle}`}
        >
            <Image
                data={product.images.nodes[0]}
                aspectRatio="1/1"
                sizes="(min-width: 45em) 20vw, 50vw"
            />
            <h4>{product.title}</h4>
            <small>
                <Money data={product.priceRange.minVariantPrice} />
            </small>
        </Link>
    )
}
