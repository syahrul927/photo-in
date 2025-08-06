import Link from "next/link";
import { Download, Share2, Heart, Grid3X3 } from "lucide-react";

const eventData = {
  id: 1,
  name: "Sarah & David Wedding",
  date: "March 15, 2024",
  location: "Central Park, New York",
  photographer: "Professional Photography",
  count: 247,
  description: "A beautiful spring wedding captured in the heart of New York City. The couple's special day was filled with love, laughter, and memorable moments against the backdrop of Central Park's iconic landscapes.",
  highlights: ["Ceremony", "First Dance", "Sunset Portraits", "Reception"]
};

const photos = Array.from({ length: 247 }, (_, i) => ({
  id: i + 1,
  url: `/wedding-1-${i + 1}.jpg`,
  alt: "Wedding photo",
  aspect: i % 3 === 0 ? "aspect-[4/5]" : i % 2 === 0 ? "aspect-square" : "aspect-[3/4]"
}));

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="min-h-screen">
      {/* Event Header */}
      <section className="py-12 md:py-24">
        <div className="max-w-screen-xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            <div>
              <div className="text-sm text-gray-500 mb-2 tracking-wide font-light">
                {eventData.date}
              </div>
              <h1 className="text-4xl md:text-5xl font-light tracking-tighter text-black mb-4">
                {eventData.name}
              </h1>
              <p className="text-gray-600 mb-6 leading-relaxed">
                {eventData.description}
              </p>
              <div className="flex flex-wrap gap-2 mb-6">
                {eventData.highlights.map((highlight) => (
                  <span key={highlight} className="px-3 py-1 text-xs tracking-wide border border-gray-300 text-gray-600">
                    {highlight}
                  </span>
                ))}
              </div>
              <div className="flex items-center space-x-6">
                <button className="flex items-center space-x-2 text-sm text-gray-600 hover:text-black transition-colors">
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </button>
                <button className="flex items-center space-x-2 text-sm text-gray-600 hover:text-black transition-colors">
                  <Share2 className="w-4 h-4" />
                  <span>Share</span>
                </button>
                <button className="flex items-center space-x-2 text-sm text-gray-600 hover:text-black transition-colors">
                  <Heart className="w-4 h-4" />
                  <span>Save</span>
                </button>
              </div>
            </div>
            <div>
              <div className="aspect-[4/3] bg-gray-200 rounded-sm" />
            </div>
          </div>
        </div>
      </section>

      {/* Photo Grid */}
      <section className="py-12 border-t border-gray-100">
        <div className="max-w-screen-xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-light tracking-tighter text-black">
                {eventData.count} Photos
              </h2>
              <p className="text-sm text-gray-600 tracking-wide">Full coverage of the event</p>
            </div>
            <button className="flex items-center space-x-2 text-sm text-gray-600 hover:text-black transition-colors">
              <Grid3X3 className="w-4 h-4" />
              <span>View all</span>
            </button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-1 md:gap-2">
            {photos.slice(0, 50).map((photo) => (
              <Link key={photo.id} href={`/public/photos/${photo.id}?event=${id}`}>
                <div className="group cursor-pointer">
                  <div className={`${photo.aspect} bg-gray-200 group-hover:opacity-90 transition-opacity rounded-sm`} />
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-12">
            <button className="px-8 py-3 text-sm tracking-wider border border-black text-black hover:bg-black hover:text-white transition-colors">
              View All {eventData.count} Photos
            </button>
          </div>
        </div>
      </section>

      {/* Related Events */}
      <section className="py-12 border-t border-gray-100">
        <div className="max-w-screen-xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-light tracking-tighter text-black mb-8">
            More Events
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[2, 3, 4, 5].map((id) => (
              <Link key={id} href={`/public/events/${id}`} className="group">
                <div className="space-y-2">
                  <div className="aspect-[3/2] bg-gray-200 group-hover:opacity-90 transition-opacity rounded-sm" />
                  <h3 className="text-sm font-light text-black">Event Name {id}</h3>
                  <p className="text-xs text-gray-500 tracking-wide">March 2024</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}