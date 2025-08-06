import { Button } from "@/components/ui/button";
import { SlidersHorizontal } from "lucide-react";
import Link from "next/link";

const events = [
  {
    id: 1,
    name: "Sarah & David Wedding",
    date: "2024-03-15",
    count: 247,
    cover: "wedding-1",
    category: "wedding",
  },
  {
    id: 2,
    name: "Corporate Headshots",
    date: "2024-03-10",
    count: 89,
    cover: "studio-1",
    category: "portrait",
  },
  {
    id: 3,
    name: "Emma's 30th Birthday",
    date: "2024-03-05",
    count: 156,
    cover: "party-1",
    category: "party",
  },
  {
    id: 4,
    name: "Family Portraits",
    date: "2024-02-28",
    count: 134,
    cover: "family-1",
    category: "family",
  },
  {
    id: 5,
    name: "Graduation Ceremony",
    date: "2024-02-25",
    count: 298,
    cover: "graduation-1",
    category: "event",
  },
  {
    id: 6,
    name: "Baby Shower",
    date: "2024-02-20",
    count: 67,
    cover: "baby-1",
    category: "family",
  },
  {
    id: 7,
    name: "Restaurant Interior",
    date: "2024-02-18",
    count: 45,
    cover: "interior-1",
    category: "commercial",
  },
  {
    id: 8,
    name: "Music Festival",
    date: "2024-02-15",
    count: 512,
    cover: "festival-1",
    category: "event",
  },
  {
    id: 9,
    name: "Fashion Shoot",
    date: "2024-02-12",
    count: 234,
    cover: "fashion-1",
    category: "commercial",
  },
  {
    id: 10,
    name: "Team Building",
    date: "2024-02-10",
    count: 178,
    cover: "team-1",
    category: "corporate",
  },
  {
    id: 11,
    name: "Engagement Session",
    date: "2024-02-08",
    count: 89,
    cover: "engagement-1",
    category: "wedding",
  },
  {
    id: 12,
    name: "Reception Party",
    date: "2024-02-05",
    count: 367,
    cover: "reception-1",
    category: "wedding",
  },
];

const _categories = [
  "All",
  "Wedding",
  "Portrait",
  "Event",
  "Family",
  "Commercial",
  "Corporate",
];

export default function EventsPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="py-12 md:py-24">
        <div className="mx-auto max-w-screen-xl px-4">
          <div className="mb-12 text-center">
            <h1 className="mb-4 text-4xl font-light tracking-tighter text-black md:text-5xl">
              Events
            </h1>
            <p className="tracking-wide text-gray-600">
              Complete photography coverage for your special moments
            </p>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="border-y border-gray-100">
        <div className="mx-auto max-w-screen-xl px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <button className="border-b-2 border-black pb-1 text-sm text-black">
                All
              </button>
              <button className="border-b-2 border-transparent pb-1 text-sm text-gray-600 transition-colors hover:border-black hover:text-black">
                Wedding
              </button>
              <button className="border-b-2 border-transparent pb-1 text-sm text-gray-600 transition-colors hover:border-black hover:text-black">
                Portrait
              </button>
              <button className="border-b-2 border-transparent pb-1 text-sm text-gray-600 transition-colors hover:border-black hover:text-black">
                Event
              </button>
              <button className="border-b-2 border-transparent pb-1 text-sm text-gray-600 transition-colors hover:border-black hover:text-black">
                Family
              </button>
              <button className="border-b-2 border-transparent pb-1 text-sm text-gray-600 transition-colors hover:border-black hover:text-black">
                Corporate
              </button>
            </div>
            <button className="flex items-center space-x-1 text-sm text-gray-600 hover:text-black">
              <SlidersHorizontal className="h-4 w-4" />
              <span>Filter</span>
            </button>
          </div>
        </div>
      </section>

      {/* Events Grid */}
      <section className="py-12">
        <div className="mx-auto max-w-screen-xl px-4">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {events.map((event) => (
              <Link
                key={event.id}
                href={`/public/events/${event.id}`}
                className="group"
              >
                <div className="space-y-3">
                  <div className="relative overflow-hidden rounded-sm">
                    <div className="aspect-[3/2] bg-gray-200 transition-colors group-hover:bg-gray-300" />
                    <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/5" />
                    <div className="absolute top-3 right-3 rounded-sm bg-white/90 px-2 py-1 text-xs text-black">
                      {event.count} photos
                    </div>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-light text-black transition-colors group-hover:text-gray-700">
                      {event.name}
                    </h3>
                    <p className="text-xs tracking-wide text-gray-500">
                      {event.date} • {event.count} photos
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Load More */}
          <div className="mt-12 text-center">
            <Button variant="outline" size="lg">
              Load More
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
