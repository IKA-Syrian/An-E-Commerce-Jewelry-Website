
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const About = () => {
  return (
    <div>
      {/* Hero Section */}
      <div className="relative h-[50vh] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(https://raw.githubusercontent.com/AhmadMswadeh/Golden-House-Jewelry/refs/heads/main/images/slider2.jpg)` }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        </div>
        
        <div className="relative z-10 text-center text-white max-w-3xl px-6">
          <h1 className="font-playfair text-4xl md:text-5xl font-bold mb-4">Our Story</h1>
          <p className="text-xl">
            Crafting luxury jewelry with passion and precision since 1992
          </p>
        </div>
      </div>

      {/* Our Story */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="section-title">The Golden House Journey</h2>
            <div className="prose prose-lg mx-auto">
              <p className="mb-4">
                Golden House was founded in 1998 by master goldsmith Elizabeth Chambers with a simple vision: 
                to create jewelry that combines outstanding craftsmanship, timeless design, and the highest quality materials.
              </p>
              <p className="mb-4">
                What began as a small workshop in San Francisco has grown into a respected name in fine jewelry, 
                but our core principles remain unchanged. Each piece is still crafted with the same attention to detail 
                and commitment to excellence that defined our very first creations.
              </p>
              <p>
                Today, our team of skilled artisans continue to push the boundaries of jewelry design, 
                creating pieces that will be treasured for generations to come.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Craftsmanship */}
      <section className="py-16 bg-cream">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <img src="https://raw.githubusercontent.com/AhmadMswadeh/Golden-House-Jewelry/refs/heads/main/images/logo.png" alt="Craftsmanship" className="rounded-lg shadow-lg" height="250" width="250"/>
            </div>
            <div>
              <h2 className="font-playfair text-3xl font-bold mb-6">Unparalleled Craftsmanship</h2>
              <p className="mb-4 text-gray-700">
                Every Golden House piece begins its journey as a carefully considered design, brought to life by our team of 
                master craftspeople who combine traditional techniques with modern technology.
              </p>
              <p className="mb-4 text-gray-700">
                We select only the finest materials - ethically sourced gemstones and precious metals of the highest quality. 
                Each piece undergoes rigorous quality control to ensure it meets our exacting standards before it bears the 
                Golden House name.
              </p>
              <p className="text-gray-700">
                This dedication to quality means that when you purchase a Golden House piece, you're not just buying jewelry - 
                you're investing in a future heirloom.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="section-title">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
            <div className="text-center p-6">
              <div className="mb-4 h-16 flex items-center justify-center">
                <div className="bg-gold/10 h-16 w-16 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <h3 className="font-playfair text-xl font-bold mb-2">Quality</h3>
              <p className="text-gray-600">
                We never compromise on materials or craftsmanship, ensuring each piece will stand the test of time.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="mb-4 h-16 flex items-center justify-center">
                <div className="bg-gold/10 h-16 w-16 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
              </div>
              <h3 className="font-playfair text-xl font-bold mb-2">Sustainability</h3>
              <p className="text-gray-600">
                We're committed to ethical sourcing and environmentally responsible practices throughout our supply chain.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="mb-4 h-16 flex items-center justify-center">
                <div className="bg-gold/10 h-16 w-16 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
              </div>
              <h3 className="font-playfair text-xl font-bold mb-2">Community</h3>
              <p className="text-gray-600">
                We believe in giving back and supporting the communities where we work and source our materials.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gold text-white text-center">
        <div className="container mx-auto px-4 max-w-2xl">
          <h2 className="font-playfair text-3xl md:text-4xl font-bold mb-4">Experience Golden House</h2>
          <p className="text-lg mb-8">
            Explore our collections and discover the perfect piece to commemorate your special moments.
          </p>
          <Button asChild variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-gold" size="lg">
            <Link to="/shop">Shop Collections</Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default About;
