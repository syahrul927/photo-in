import { Search } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const searchResults = Array.from({ length: 24 }, (_, i) => ({
  id: i + 1,
  event: "Sarah & David Wedding",
  date: "March 15, 2024",
  aspect:
    i % 5 === 0
      ? "aspect-[4/5]"
      : i % 3 === 0
        ? "aspect-square"
        : "aspect-[3/4]",
}));

const popularSearches = [
  "wedding",
  "portrait",
  "birthday",
  "family",
  "urban",
  "nature",
  "studio",
  "ceremony",
  "reception",
  "group",
];
const categories = [
  "wedding",
  "portrait",
  "event",
  "family",
  "commercial",
  "corporate",
  "graduation",
  "party",
];

export default function SearchPage() {
  return (
    <div className="min-h-screen">
      {/* Search Header */}
      <section className="py-12 md:py-24">
        <div className="mx-auto max-w-screen-xl px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="mb-4 text-4xl font-light tracking-tighter text-black md:text-5xl">
              Search
            </h1>
            <p className="mb-8 tracking-wide text-gray-600">
              Find the perfect photo from any of our events
            </p>
            <div className="relative">
              <Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <Input
                type="search"
                placeholder="Search photos, events, locations..."
                className="w-full border-black bg-transparent py-6 pl-12 pr-4 text-lg text-black placeholder-gray-500 focus:border-black"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="border-y border-gray-100">
        <div className="mx-auto max-w-screen-xl px-4 py-6">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <span className="text-sm tracking-wide text-gray-500 uppercase">
              Categories
            </span>
            {categories.map((category) => (
              <Button
                key={category}
                variant="ghost"
                size="sm"
                className="border-b-2 border-transparent text-sm text-gray-600 hover:border-black hover:text-black"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Searches */}
      <section className="py-12">
        <div className="mx-auto max-w-screen-xl px-4">
          <h2 className="mb-4 text-sm tracking-wide text-gray-500 uppercase">
            Popular searches
          </h2>
          <div className="mb-12 flex flex-wrap gap-3">
            {popularSearches.map((term) => (
              <Link
                key={term}
                href="/public/search"
                className="border border-gray-200 px-4 py-2 text-sm text-gray-600 transition-colors hover:border-gray-400 hover:text-black"
              >
                {term}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Search Results Grid */}
      <section className="py-12">
        <div className="mx-auto max-w-screen-xl px-4">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-2xl font-light tracking-tighter text-black md:text-3xl">
              Recent Photos
            </h2>
            <div className="text-sm text-gray-600">2,456 photos found</div>
          </div>

          <div className="grid grid-cols-2 gap-1 md:grid-cols-3 md:gap-2 lg:grid-cols-4 xl:grid-cols-6">
            {searchResults.map((photo) => (
              <Link key={photo.id} href={`/public/photos/${photo.id}`}>
                <div className="group cursor-pointer">
                  <div
                    className={`${photo.aspect} rounded-sm bg-gray-200 transition-colors group-hover:bg-gray-300`}
                  />
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Button variant="outline" size="lg" className="border-black tracking-wider">
              Load More Results
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
