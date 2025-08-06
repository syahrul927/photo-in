import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Instagram, Mail, MapPin, Phone, Camera, ChevronDown, Sparkles, Heart, Star } from "lucide-react";

export default function PublicGalleryPage() {
  const galleryItems = [
    { id: 1, category: "Wedding", title: "Sarah & Michael", date: "June 2024" },
    { id: 2, category: "Portrait", title: "Emma's Graduation", date: "May 2024" },
    { id: 3, category: "Nature", title: "Sunset Valley", date: "July 2024" },
    { id: 4, category: "Wedding", title: "David & Lisa", date: "April 2024" },
    { id: 5, category: "Family", title: "The Johnsons", date: "June 2024" },
    { id: 6, category: "Event", title: "Corporate Gala", date: "May 2024" },
    { id: 7, category: "Portrait", title: "Business Headshots", date: "July 2024" },
    { id: 8, category: "Wedding", title: "Alex & Jamie", date: "March 2024" },
    { id: 9, category: "Architecture", title: "Modern Villa", date: "February 2024" },
  ];

  const services = [
    {
      title: "Wedding Photography",
      description: "Capture your special day with timeless, emotional moments",
      icon: "💍",
    },
    {
      title: "Portrait Sessions",
      description: "Professional portraits that reflect your personality",
      icon: "👤",
    },
    {
      title: "Event Coverage",
      description: "Complete event documentation from start to finish",
      icon: "📸",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-stone-100">
      {/* Header */}
      <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Camera className="w-8 h-8 text-amber-600" />
              <span className="text-xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                Elegant Studios
              </span>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#gallery" className="text-stone-700 hover:text-amber-600 transition-colors">Gallery</a>
              <a href="#services" className="text-stone-700 hover:text-amber-600 transition-colors">Services</a>
              <a href="#contact" className="text-stone-700 hover:text-amber-600 transition-colors">Contact</a>
            </nav>
            <Button className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white">
              Book Now
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-transparent z-10" />
        
        {/* Background Image */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-100 via-stone-200 to-orange-100" />

        <div className="relative z-20 text-center px-4 max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 mb-6 border">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span className="text-sm font-medium text-stone-700">Professional Photography Services</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-stone-900 mb-6 leading-tight">
            <span className="bg-gradient-to-r from-stone-800 to-stone-600 bg-clip-text text-transparent">
              Capture Life&apos;s
            </span>
            <br />
            <span className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
              Beautiful Moments
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-stone-700 mb-8 max-w-2xl mx-auto leading-relaxed">
            Professional photography that tells your unique story through stunning visuals and artistic vision
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white text-lg px-8 py-6 rounded-full">
              View Gallery
            </Button>
            <Button size="lg" variant="outline" className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 text-lg px-8 py-6 rounded-full">
              Get Quote
            </Button>
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
          <ChevronDown className="w-8 h-8 text-stone-600/60" />
        </div>
      </section>

      {/* Features Section */}
      <section id="services" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-amber-600 font-semibold text-sm uppercase tracking-wider">Our Services</span>
            <h2 className="text-4xl font-bold text-stone-900 mt-2 mb-4">What We Capture</h2>
            <p className="text-xl text-stone-600 max-w-2xl mx-auto">
              Every moment deserves to be remembered professionally
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {services.map((service) => (
              <Card key={service.title} className="group hover:shadow-lg transition-all duration-300 border-stone-200">
                <CardContent className="p-8 text-center">
                  <div className="text-4xl mb-4">{service.icon}</div>
                  <h3 className="text-xl font-semibold text-stone-900 mb-2">{service.title}</h3>
                  <p className="text-stone-600 leading-relaxed">{service.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section id="gallery" className="py-20 bg-stone-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-amber-600 font-semibold text-sm uppercase tracking-wider">Portfolio</span>
            <h2 className="text-4xl font-bold text-stone-900 mt-2 mb-4">Latest Work</h2>
            <p className="text-xl text-stone-600 max-w-2xl mx-auto">
              Explore our recent projects and get inspired for your special moment
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {galleryItems.map((item) => (
              <div key={item.id} className="group relative overflow-hidden rounded-xl bg-stone-100 aspect-[4/5]">
                {/* Placeholder Image */}
                <div className="absolute inset-0 bg-gradient-to-br from-stone-200 via-stone-300 to-stone-400" />
                
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute inset-x-0 bottom-0 p-6 text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    <span className="text-sm font-medium text-amber-300">{item.category}</span>
                    <h3 className="text-xl font-semibold mt-1">{item.title}</h3>
                    <p className="text-sm text-stone-300 mt-1">{item.date}</p>
                  </div>
                </div>
                
                {/* View Icon */}
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Heart className="w-5 h-5 text-amber-600" />
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button size="lg" variant="outline" className="border-stone-300 text-stone-700 hover:bg-stone-100 px-8 py-3">
              Load More Photos
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-r from-amber-600 to-orange-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">500+</div>
              <div className="text-amber-100">Happy Clients</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">1000+</div>
              <div className="text-amber-100">Photos Delivered</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">50+</div>
              <div className="text-amber-100">Events Covered</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">5★</div>
              <div className="text-amber-100">Average Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-12">
            <Star className="w-12 h-12 text-amber-600 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-stone-900 mb-4">
              Ready to Capture Your Special Moments?
            </h2>
            <p className="text-xl text-stone-600 mb-8 max-w-2xl mx-auto">
              Let&apos;s create something beautiful together. Every moment deserves to be remembered professionally.
            </p>
            <Button size="lg" className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white text-lg px-8 py-6 rounded-full">
              Start Your Journey
            </Button>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-stone-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <span className="text-amber-600 font-semibold text-sm uppercase tracking-wider">Get In Touch</span>
              <h2 className="text-4xl font-bold text-stone-900 mt-2 mb-6">Ready When You Are</h2>
              <p className="text-xl text-stone-600 mb-8">
                Let&apos;s discuss how we can bring your vision to life. Every project starts with a conversation.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="bg-amber-100 rounded-full p-3">
                    <Mail className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-stone-900">Email</div>
                    <div className="text-stone-600">hello@elegantstudios.com</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="bg-amber-100 rounded-full p-3">
                    <Phone className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-stone-900">Phone</div>
                    <div className="text-stone-600">+1 (555) 123-4567</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="bg-amber-100 rounded-full p-3">
                    <MapPin className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-stone-900">Location</div>
                    <div className="text-stone-600">New York, NY</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-8">
              <h3 className="text-2xl font-semibold text-stone-900 mb-6">Send Message</h3>
              <form className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">Name</label>
                  <input type="text" className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">Email</label>
                  <input type="email" className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">Message</label>
                  <textarea rows={4} className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500" placeholder="Tell me about your project..."></textarea>
                </div>
                <Button type="submit" className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white py-3">
                  Send Message
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-stone-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Camera className="w-6 h-6 text-amber-500" />
              <span className="text-lg font-semibold">Elegant Studios</span>
            </div>
            
            <div className="flex items-center space-x-6">
              <a href="#" className="text-stone-400 hover:text-white transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-stone-400 hover:text-white transition-colors">
                Facebook
              </a>
              <a href="#" className="text-stone-400 hover:text-white transition-colors">
                Twitter
              </a>
            </div>
          </div>
          
          <div className="border-t border-stone-800 mt-8 pt-8 text-center text-stone-400">
            <p>&copy; 2024 Elegant Studios. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}