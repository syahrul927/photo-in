import { Search, Camera } from "lucide-react";
import Link from "next/link";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link href="/public" className="flex items-center space-x-2">
                <Camera className="w-6 h-6 text-black" />
                <span className="text-xl font-light tracking-wider">Portfolio</span>
              </Link>
              <nav className="hidden md:flex items-center space-x-8">
                <Link href="/public/events" className="text-sm tracking-wide text-gray-600 hover:text-black transition-colors">
                  Events
                </Link>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/public/search" className="p-2 text-gray-600 hover:text-black transition-colors">
                <Search className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>
      
      {/* Footer */}
      <footer className="border-t border-gray-100 bg-white">
        <div className="max-w-screen-xl mx-auto px-4 py-8 text-center">
          <div className="space-y-4 text-sm text-gray-600">
            <p className="text-xs tracking-wider uppercase">Professional Photography Services</p>
            <div className="flex justify-center space-x-6">
              <span className="block">email@photographer.com</span>
              <span className="block">+1 (555) 123-4567</span>
              <span className="block">contact form</span>
            </div>
            <p className="text-xs">© 2024 Photographer Portfolio. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}