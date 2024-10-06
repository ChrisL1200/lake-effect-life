import React from 'react';
import { Carousel, Typography, Card } from "@material-tailwind/react";
import SearchBar from '../common/SearchBar.tsx';

const Home: React.FC = () => {
    const images = [{
        src: "/images/groupedItems/great-lakes-mens-t-shirt.jpg",
        alt: "Lake Apparel 1"
    }, {
        src: "/images/groupedItems/bills-t-shirt.jpg",
        alt: "Lake Apparel 2"
    }, {
        src: "/images/groupedItems/great-lakes-mens-navy-t-shirt.jpg",
        alt: "Lake Apparel 3"
    }, {
        src: "/images/groupedItems/great-lakes-mens-white-t-shirt.jpg",
        alt: "Lake Apparel 4"
    }];

    return (
        <div className="flex w-full flex-col items-center justify-center p-4">
            <div className="w-full mb-2">
                <SearchBar></SearchBar>
            </div>
            <Card className="w-full lg:w-2/3 mb-8 shadow-xl">
                <Carousel
                    className="rounded-xl"
                    autoplay
                    autoplayDelay={3000}
                    loop
                >
                    {images.map(image => (
                        <img
                            src={image.src}
                            alt={image.alt}
                            key={image.alt}
                            className="object-cover w-full max-h-96"
                        />
                    ))}
                </Carousel>
            </Card>

            <Typography variant="h2" color="blue-gray" className="mb-8 text-center">
                Find Your Style by the Water
            </Typography>
        </div>
    );
};

export default Home;
