import { ArrowLeft, ArrowRight, Download, Share2, Heart, X } from "lucide-react";
import Link from "next/link";

const photoData = {
  id: 1,
  original: "original-photo.jpg",
  thumbnail: "thumbnail.jpg",
  event: "Sarah & David Wedding",
  eventId: 1,
  date: "March 15, 2024",
  photographer: "Professional Photography",
  dimensions: "3840 x 5760",
  fileSize: "8.4 MB",
  format: "JPEG",
  camera: "Canon EOS R5",
  lens: "50mm f/1.2L",
  settings: "f/1.8 • 1/250 • ISO 100"
};

export default function PhotoDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/50 backdrop-blur-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href={`/public/events/${photoData.eventId}`} className="flex items-center space-x-2 text-sm">
            <ArrowLeft className="w-5 h-5" />
            <span>{photoData.event}</span>
          </Link>
          <div className="flex items-center space-x-4">
            <button className="p-2 hover:bg-white/10 rounded-sm">
              <Share2 className="w-5 h-5" />
            </button>
            <button className="p-2 hover:bg-white/10 rounded-sm">
              <Heart className="w-5 h-5" />
            </button>
            <button className="p-2 hover:bg-white/10 rounded-sm">
              <Download className="w-5 h-5" />
            </button>
            <Link href="/public/events" className="p-2 hover:bg-white/10 rounded-sm">
              <X className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row h-screen">
        {/* Image */}
        <div className="flex-1 flex items-center justify-center pt-16 lg:pt-20 pb-20 lg:pb-0">
          <div className="relative max-w-6xl max-h-full">
            <div className="bg-gray-800 aspect-[3/2] max-h-screen lg:max-h-[calc(100vh-160px)] max-w-full" />
            {/* Navigation Arrows */}
            <button className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/75 rounded-full transition-colors">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <button className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/75 rounded-full transition-colors">
              <ArrowRight className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-96 bg-white text-black overflow-y-auto lg:pb-20">
          <div className="p-6">
            <h1 className="text-2xl font-light tracking-tight mb-2">
              {photoData.event}
            </h1>
            <p className="text-sm text-gray-600 mb-4">{photoData.date}</p>
            
            <div className="grid grid-cols-2 gap-4 text-sm mb-6">
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wide">Dimensions</div>
                <div className="text-black">{photoData.dimensions}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wide">File Size</div>
                <div className="text-black">{photoData.fileSize}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wide">Format</div>
                <div className="text-black">{photoData.format}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wide">Camera</div>
                <div className="text-black">{photoData.camera}</div>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">Settings</div>
                <div className="text-sm text-black font-mono bg-gray-50 p-3 rounded-sm">
                  {photoData.settings}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">Lens</div>
                <div className="text-sm text-black">
                  {photoData.lens}
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6 mb-6">
              <h3 className="text-lg font-light mb-4">More from this event</h3>
              <div className="grid grid-cols-3 gap-2">
                {Array.from({ length: 9 }, (_, i) => i + 1).map((i) => (
                  <Link key={i} href={`/public/photos/${i}`} className="block">
                    <div className="aspect-square bg-gray-200 hover:bg-gray-300 transition-colors rounded-sm" />
                  </Link>
                ))}
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6 space-y-3">
              <button className="w-full px-4 py-3 text-center text-sm tracking-wider border border-gray-300 text-black hover:border-black hover:bg-black hover:text-white transition-all">
                Download Original
              </button>
              <div className="grid grid-cols-2 gap-3">
                <button className="px-4 py-2 text-center text-sm border border-gray-200 text-gray-700 hover:border-gray-400 transition-colors">
                  Small
                </button>
                <button className="px-4 py-2 text-center text-sm border border-gray-200 text-gray-700 hover:border-gray-400 transition-colors">
                  Medium
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}