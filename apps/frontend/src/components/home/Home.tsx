import React from "react";
import { Carousel, Typography, Card } from "@material-tailwind/react";
import SearchBar from "../common/SearchBar.tsx";
import { useNavigate } from "react-router-dom";

const Home: React.FC = () => {
  const navigate = useNavigate();
  const images = [
    {
      src: "/images/groupedItems/great-lakes-mens-t-shirt.jpg",
      alt: "Lake Apparel 1",
    },
    {
      src: "/images/groupedItems/bills-t-shirt.jpg",
      alt: "Lake Apparel 2",
    },
    {
      src: "/images/groupedItems/great-lakes-mens-navy-t-shirt.jpg",
      alt: "Lake Apparel 3",
    },
    {
      src: "/images/groupedItems/great-lakes-mens-white-t-shirt.jpg",
      alt: "Lake Apparel 4",
    },
  ];

  const featuredCollections = [
    {
      title: "Men's Essentials",
      description: "Core pieces cut for daily wear with elevated texture and structure.",
      image: "/images/groupedItems/great-lakes-mens-t-shirt.jpg",
      gender: "Men",
      type: "T-Shirt",
    },
    {
      title: "Women's Studio Edit",
      description: "Soft drape, clean lines, and versatile tones for layered styling.",
      image: "/images/groupedItems/great-lakes-mens-white-t-shirt.jpg",
      gender: "Women",
      type: "Tank Top",
    },
    {
      title: "Outer Layers",
      description: "Transitional jackets and fleece-backed pieces for lake weather shifts.",
      image: "/images/groupedItems/great-lakes-mens-navy-t-shirt.jpg",
      gender: "Men",
      type: "Jacket",
    },
  ];

  const editorialNotes = [
    {
      title: "Shoreline Mornings",
      copy: "Neutral palettes and lightweight texture designed for cool starts and warm finishes.",
    },
    {
      title: "City Evenings",
      copy: "Minimal branding and structured silhouettes that move cleanly from day to night.",
    },
    {
      title: "Built to Repeat",
      copy: "High-rotation staples made to hold shape, color, and comfort over time.",
    },
  ];

  const handleCollectionClick = (gender: string, type: string) => {
    const query = new URLSearchParams({ gender, type });
    navigate(`/search?${query.toString()}`);
  };

  return (
    <div className="flex w-full flex-col items-center justify-center bg-white p-2 sm:p-4">
      <div className="mb-2 w-full">
        <SearchBar></SearchBar>
      </div>

      <Card className="mb-8 w-full overflow-hidden border border-gray-200 shadow-xl lg:w-5/6">
        <Carousel className="rounded-xl" autoplay autoplayDelay={3000} loop>
          {images.map((image) => (
            <img
              src={image.src}
              alt={image.alt}
              key={image.alt}
              className="h-[340px] w-full object-cover sm:h-[420px]"
            />
          ))}
        </Carousel>
      </Card>

      <Typography variant="h2" color="blue-gray" className="mb-3 text-center text-2xl sm:text-4xl">
        Refined Lakewear for Everyday Movement
      </Typography>
      <p className="mb-10 max-w-3xl text-center text-sm text-gray-700 sm:text-base">
        Premium fabrics, precise cuts, and understated details inspired by shoreline mornings and city nights.
      </p>

      <section className="mb-12 grid w-full max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <article className="rounded-xl border border-gray-200 bg-gray-50 p-5">
          <h3 className="mb-2 text-lg font-semibold text-gray-900">Tailored Fit</h3>
          <p className="text-sm text-gray-700">Modern silhouettes engineered for layering and all-day wear.</p>
        </article>
        <article className="rounded-xl border border-gray-200 bg-gray-50 p-5">
          <h3 className="mb-2 text-lg font-semibold text-gray-900">Premium Materials</h3>
          <p className="text-sm text-gray-700">Soft-hand cotton blends and durable stitching built to last.</p>
        </article>
        <article className="rounded-xl border border-gray-200 bg-gray-50 p-5">
          <h3 className="mb-2 text-lg font-semibold text-gray-900">Limited Drops</h3>
          <p className="text-sm text-gray-700">Curated seasonal capsules with low-volume releases.</p>
        </article>
      </section>

      <section className="mb-12 w-full max-w-6xl">
        <div className="mb-5 flex items-end justify-between">
          <h2 className="text-2xl font-semibold text-gray-900">Featured Collections</h2>
          <button
            type="button"
            className="text-sm font-medium text-gray-700 underline underline-offset-4 hover:text-black"
            onClick={() => navigate("/search")}
          >
            View all
          </button>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {featuredCollections.map((collection) => (
            <article
              key={collection.title}
              className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
            >
              <img
                src={collection.image}
                alt={collection.title}
                className="h-52 w-full object-cover"
              />
              <div className="p-4">
                <h3 className="mb-2 text-lg font-semibold text-gray-900">{collection.title}</h3>
                <p className="mb-4 text-sm text-gray-700">{collection.description}</p>
                <button
                  type="button"
                  className="rounded border border-black px-3 py-2 text-sm font-medium text-black transition-colors hover:bg-black hover:text-white"
                  onClick={() => handleCollectionClick(collection.gender, collection.type)}
                >
                  Shop {collection.type}
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mb-12 w-full max-w-6xl rounded-2xl border border-gray-200 bg-gray-50 p-6 md:p-8">
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <h2 className="mb-3 text-2xl font-semibold text-gray-900">The Lake Effect Standard</h2>
            <p className="mb-4 text-sm leading-6 text-gray-700">
              We design around longevity: balanced weight, clean finishing, and everyday versatility.
              Every piece is intended to work across seasons and across settings.
            </p>
            <p className="text-sm leading-6 text-gray-700">
              Our direction blends waterfront calm with city structure, giving you elevated staples
              that feel natural without trying hard.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <p className="text-xs uppercase tracking-wide text-gray-500">Fabric Focus</p>
              <p className="mt-2 text-sm font-medium text-gray-900">Midweight combed cotton blends</p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <p className="text-xs uppercase tracking-wide text-gray-500">Fit Philosophy</p>
              <p className="mt-2 text-sm font-medium text-gray-900">Relaxed structure, precise drape</p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <p className="text-xs uppercase tracking-wide text-gray-500">Release Model</p>
              <p className="mt-2 text-sm font-medium text-gray-900">Low-volume seasonal capsules</p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <p className="text-xs uppercase tracking-wide text-gray-500">Design Detail</p>
              <p className="mt-2 text-sm font-medium text-gray-900">Understated graphics and trims</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-6 w-full max-w-6xl">
        <h2 className="mb-5 text-2xl font-semibold text-gray-900">Journal</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {editorialNotes.map((note) => (
            <article key={note.title} className="rounded-xl border border-gray-200 bg-white p-5">
              <h3 className="mb-2 text-lg font-semibold text-gray-900">{note.title}</h3>
              <p className="text-sm leading-6 text-gray-700">{note.copy}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
