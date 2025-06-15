import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Search, ShoppingCart, ChevronRight, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuthContext } from '@/context/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const { itemCount } = useCart();
  const { user, isAuthenticated, logout } = useAuthContext();
  const isMobile = useIsMobile();
  const [scrolled, setScrolled] = useState(false);
  const [goldPrice, setGoldPrice] = useState(2350.75);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    // No need to navigate away - AuthContext will handle redirect if needed
  };

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled ? 'bg-white/95 backdrop-blur-sm shadow-sm' : 'bg-transparent'
      }`}
    >
      {/* Gold Price Ticker */}
      <div className="bg-gold text-white text-sm py-1 px-4 text-center">
        <span className="animate-shimmer bg-gradient-to-r from-gold-dark via-gold-light to-gold-dark inline-block text-transparent bg-clip-text">
          Today's Gold Price: ${goldPrice.toFixed(2)} per oz
        </span>
      </div>

      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Mobile Menu */}
          {isMobile && (
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px]">
                <nav className="flex flex-col space-y-4 mt-8">
                  <Link to="/" className="flex items-center py-2 font-playfair text-lg hover:text-gold transition-colors">
                    Home <ChevronRight className="ml-2 h-4 w-4" />
                  </Link>
                  <Link to="/shop" className="flex items-center py-2 font-playfair text-lg hover:text-gold transition-colors">
                    Shop <ChevronRight className="ml-2 h-4 w-4" />
                  </Link>
                  <Link to="/about" className="flex items-center py-2 font-playfair text-lg hover:text-gold transition-colors">
                    About Us <ChevronRight className="ml-2 h-4 w-4" />
                  </Link>
                  <Link to="/contact" className="flex items-center py-2 font-playfair text-lg hover:text-gold transition-colors">
                    Contact <ChevronRight className="ml-2 h-4 w-4" />
                  </Link>
                  <div className="border-t my-4"></div>
                  
                  {isAuthenticated ? (
                    <>
                      <Link to="/dashboard" className="flex items-center py-2 font-playfair text-lg hover:text-gold transition-colors">
                        Dashboard <ChevronRight className="ml-2 h-4 w-4" />
                      </Link>
                      <Link to="/profile" className="flex items-center py-2 font-playfair text-lg hover:text-gold transition-colors">
                        Profile <ChevronRight className="ml-2 h-4 w-4" />
                      </Link>
                      <button 
                        onClick={handleLogout}
                        className="flex items-center py-2 font-playfair text-lg hover:text-gold transition-colors text-left w-full"
                      >
                        Logout <LogOut className="ml-2 h-4 w-4" />
                      </button>
                    </>
                  ) : (
                    <Link to="/login" className="flex items-center py-2 font-playfair text-lg hover:text-gold transition-colors">
                      Login <ChevronRight className="ml-2 h-4 w-4" />
                    </Link>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          )}

          {/* Logo */}
          <div className="flex-1 flex items-center justify-center md:justify-start">
            <Link to="/" className="font-playfair font-bold text-xl md:text-2xl">
              GOLDEN HOUSE
            </Link>
          </div>

          {/* Desktop Navigation */}
          {!isMobile && (
            <nav className="hidden md:flex space-x-8">
              <Link to="/" className="font-medium hover:text-gold transition-colors">Home</Link>
              <Link to="/shop" className="font-medium hover:text-gold transition-colors">Shop</Link>
              <Link to="/about" className="font-medium hover:text-gold transition-colors">About Us</Link>
              <Link to="/contact" className="font-medium hover:text-gold transition-colors">Contact</Link>
            </nav>
          )}

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {!isMobile && (
              <>
                <Button variant="ghost" size="icon">
                  <Search className="h-5 w-5" />
                </Button>
                
                {isAuthenticated ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="rounded-full">
                        <User className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>
                        {user?.first_name} {user?.last_name}
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/dashboard" className="w-full cursor-pointer">Dashboard</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/profile" className="w-full cursor-pointer">Profile</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/orders" className="w-full cursor-pointer">Orders</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/addresses" className="w-full cursor-pointer">Addresses</Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer">
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Logout</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Link to="/login" className="font-medium hover:text-gold transition-colors">Login</Link>
                )}
              </>
            )}
            <Link to="/cart" className="relative">
              <Button variant="ghost" size="icon">
                <ShoppingCart className="h-5 w-5" />
              </Button>
              {itemCount > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center bg-gold">
                  {itemCount}
                </Badge>
              )}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
