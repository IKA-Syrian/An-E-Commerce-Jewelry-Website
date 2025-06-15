import React from 'react';
import Hero from '@/components/home/Hero';
import ProductGrid from '@/components/products/ProductGrid';
import CategorySection from '@/components/home/CategorySection';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useProducts } from '@/hooks/useProducts';
import productService, { Product } from '@/services/productService';

const Index = () => {
  const [products, setProducts] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = await productService.getAll({ limit: 20 });
        
        // Handle the new response format (could be an array or pagination object)
        if (Array.isArray(data)) {
          setProducts(data);
        } else if (data && Array.isArray(data.products)) {
          setProducts(data.products);
        } else {
          console.error('Unexpected response format:', data);
          setProducts([]);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Generate featured products from all products (first 4)
  const featuredProducts = React.useMemo(() => {
    if (!Array.isArray(products)) return [];
    return products.slice(0, 4);
  }, [products]);

  // Generate new arrivals (last 8, or sort by createdAt)
  const newArrivals = React.useMemo(() => {
    if (!Array.isArray(products) || !products.length) return [];
    
    // Create a copy to avoid mutating the original array
    const sortedProducts = [...products];
    
    // Sort by createdAt date if available
    sortedProducts.sort((a, b) => {
      if (!a.createdAt || !b.createdAt) return 0;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    
    // Return the first 8 products
    return sortedProducts.slice(0, 8);
  }, [products]);

  // Loading skeleton
  const renderProductSkeleton = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="animate-pulse">
          <div className="bg-gray-200 rounded-lg aspect-square mb-3"></div>
          <div className="h-5 bg-gray-200 rounded w-2/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        </div>
      ))}
    </div>
  );

  return (
    <div>
      <Hero />
      
      {/* Featured Products */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {loading ? (
            <>
              <h2 className="section-title">Featured Collections</h2>
              {renderProductSkeleton()}
            </>
          ) : (
            <ProductGrid 
              products={featuredProducts} 
              title="Featured Collections" 
            />
          )}
          <div className="flex justify-center mt-8">
            <Button asChild variant="outline" className="border-gold text-gold hover:bg-gold hover:text-white">
              <Link to="/shop">View All</Link>
            </Button>
          </div>
        </div>
      </section>
      
      {/* Categories */}
      <CategorySection />
      
      {/* New Arrivals */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {loading ? (
            <>
              <h2 className="section-title">New Arrivals</h2>
              {renderProductSkeleton()}
            </>
          ) : (
            <ProductGrid 
              products={newArrivals} 
              title="New Arrivals" 
            />
          )}
        </div>
      </section>
      
      {/* Brand Story */}
      <section className="py-16 bg-cream">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <img src="https://raw.githubusercontent.com/AhmadMswadeh/Golden-House-Jewelry/refs/heads/main/images/logo.png" alt="Our story" className="rounded-lg shadow-lg" height="250" width="250"/>
            </div>
            <div>
              <h2 className="font-playfair text-3xl md:text-4xl font-bold mb-4">The Golden House Story</h2>
              <p className="mb-4 text-gray-700">
                For over 30 years, Golden House has been creating exquisite jewelry that celebrates life's most precious moments.
                Each piece is meticulously crafted by master artisans who combine traditional techniques with contemporary design.
              </p>
              <p className="mb-6 text-gray-700">
                We source only the highest quality materials, ensuring that each creation not only looks beautiful but stands the test of time.
              </p>
              <Button asChild className="btn-gold">
                <Link to="/about">Learn More</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
