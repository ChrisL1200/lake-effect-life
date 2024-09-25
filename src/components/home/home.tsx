import React from 'react';
import { Carousel, Typography, Button, Card } from "@material-tailwind/react";
import SearchBar from '../common/SearchBar.tsx';

const Home: React.FC = () => {
    const images = [{
        src: "/images/groupedItems/great-lakes-mens-t-shirt.jpg",
        alt: "Lake Apparel 1"
    }, {
        src: "/images/groupedItems/great-lakes-mens-t-shirt.jpg",
        alt: "Lake Apparel 2"
    }, {
        src: "/images/groupedItems/great-lakes-mens-t-shirt.jpg",
        alt: "Lake Apparel 3"
    }, {
        src: "/images/groupedItems/great-lakes-mens-t-shirt.jpg",
        alt: "Lake Apparel 4"
    }];

    return (
        <div className="flex min-h-screen w-full flex-col items-center justify-center p-4">
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
                            className="object-cover w-full h-[400px]"
                        />
                    ))}
                </Carousel>
            </Card>

            <Typography variant="h2" color="blue-gray" className="mb-8 text-center">
                Find Your Style by the Water
            </Typography>

                <div className="w-full">
                    <SearchBar></SearchBar>
                </div>
        </div>
    );
};

export default Home;
