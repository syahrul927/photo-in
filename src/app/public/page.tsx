import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function PublicHomePage() {
  const featuredEvents = [
    { id: 1, name: "Emma & James Wedding", image: "/wedding-1.jpg", count: 156, date: "March 2024" },
    { id: 2, name: "Corporate Headshots", image: "/studio-1.jpg", count: 89, date: "February 2024" },
    { id: 3, name: "Birthday Celebration", image: "/party-1.jpg", count: 234, date: "January 2024" },
  ];

  const recentPhotos = Array.from({ length: 20 }, (_, i) => ({
    id: i + 1,
    image: `/photo-${i + 1}.jpg`,
    event: "Various Events",
    aspect: i % 3 === 0 ? "aspect-[4/5]" : i % 2 === 0 ? "aspect-square" : "aspect-[3/4]"
  }));

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white">
        <div className="text-center max-w-4xl mx-auto px-4">
          <h1 className="text-6xl md:text-8xl font-light tracking-tighter text-black mb-4">
            Photography
          </h1>
          <p className="text-xl text-gray-600 mb-8 tracking-wide">
            Professional photos for every moment
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/public/events">
              <Button variant="outline" size="lg" className="border-black tracking-wider hover:bg-black hover:text-white">
                Browse Events
              </Button>
            </Link>
            <Link href="/public/search">
              <Button variant="ghost" size="lg" className="text-gray-600 hover:text-black">
                Search Photos
              </Button>
            </Link>
          </div>
        </div>
        
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-px h-16 bg-gray-300 mx-auto"></div>
        </div>
      </section>

      {/* Featured Events */}
      <section className="py-12 md:py-24">
        <div className="max-w-screen-xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-light tracking-normal mb-8 text-black">
            Featured Events
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {featuredEvents.map((event) => (
              <Link key={event.id} href={`/public/events/${event.id}`}>
                <div className="group cursor-pointer">
                  <div className="relative overflow-hidden">
                    <div className="aspect-[3/2] bg-gray-200 group-hover:opacity-90 transition-opacity"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="absolute bottom-4 left-4 text-white">
                      <h3 className="text-xl font-light mb-1">{event.name}</h3>
                      <p className="text-sm text-gray-200">{event.count} photos • {event.date}</p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Photos Grid */}
      <section className="py-12 md:py-24 border-t border-gray-100">
        <div className="max-w-screen-xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-light tracking-normal mb-8 text-black">
            Recent Photos
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-1 md:gap-2">
            {recentPhotos.map((photo) => (
              <Link key={photo.id} href={`/public/photos/${photo.id}`}>
                <div className="relative group cursor-pointer overflow-hidden">
                  <div className={`${photo.aspect} bg-gray-200 group-hover:scale-105 transition-transform duration-300`}></div>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300"></div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 md:py-24 border-t border-gray-100">
        <div className="max-w-screen-xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <div className="text-3xl font-light text-black">1,247</div>
              <div className="text-sm text-gray-600 tracking-wide">Photos</div>
            </div>
            <div>
              <div className="text-3xl font-light text-black">23</div>
              <div className="text-sm text-gray-600 tracking-wide">Events</div>
            </div>
            <div>
              <div className="text-3xl font-light text-black">89</div>
              <div className="text-sm text-gray-600 tracking-wide">Happy Clients</div>
            </div>
            <div>
              <div className="text-3xl font-light text-black">2</div>
              <div className="text-sm text-gray-600 tracking-wide">Years</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}