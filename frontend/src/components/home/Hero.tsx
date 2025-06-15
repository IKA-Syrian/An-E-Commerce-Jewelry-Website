
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Hero = () => {
  return (
    <div className="relative h-[80vh] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(https://raw.githubusercontent.com/AhmadMswadeh/Golden-House-Jewelry/refs/heads/main/images/slider1.jpg)` }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 text-center text-white max-w-3xl px-6">
        <h1 className="font-playfair text-4xl md:text-5xl lg:text-6xl font-bold mb-4 animate-fade-in">
          Timeless Elegance in Gold
        </h1>
        <p className="text-lg md:text-xl mb-8 opacity-90 max-w-xl mx-auto">
          Exquisite jewelry crafted with precision and passion, 
          designed to celebrate life's most precious moments.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button asChild className="btn-gold px-8 py-6" size="lg">
            <Link to="/shop">Shop Collections</Link>
          </Button>
          <Button asChild variant="outline" className="border-white text-white hover:bg-white hover:text-black" size="lg">
            <Link to="/about">Our Story</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Hero;
