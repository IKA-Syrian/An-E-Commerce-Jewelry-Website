import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductGrid from '@/components/products/ProductGrid';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';
import { useCategories } from '@/hooks/useCategories';
import { useProducts } from '@/hooks/useProducts';
import { Product } from '@/services/productService';
import { Category } from '@/services/categoryService';

const Shop = () => {
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');
  const [activeCategory, setActiveCategory] = useState<string | null>(categoryParam);
  
  // Fetch categories and products from API
  const { categories, loading: categoriesLoading } = useCategories();
  const { products, loading: productsLoading } = useProducts();
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (products) {
      if (activeCategory) {
        setFilteredProducts(
          products.filter(p => 
            p.category_id !== null && 
            p.category_id !== undefined && 
            p.category_id.toString() === activeCategory
          )
        );
      } else {
        setFilteredProducts(products);
      }
    }
  }, [activeCategory, products]);

  useEffect(() => {
    setActiveCategory(categoryParam);
  }, [categoryParam]);

  // Show loading state when data is being fetched
  if (categoriesLoading || productsLoading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-10 w-1/3 bg-gray-200 rounded mb-5"></div>
          <div className="h-6 w-1/4 bg-gray-200 rounded mb-8"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Find a category by ID with null check
  const findCategoryById = (categoryId: string | null) => {
    if (!categoryId || !categories) return null;
    return categories.find(c => c.category_id?.toString() === categoryId);
  };

  return (
    <div>
      {/* Page Header */}
      <div className="bg-gray-100 py-10">
        <div className="container mx-auto px-4">
          <h1 className="font-playfair text-3xl md:text-4xl font-bold text-center">
            {activeCategory 
              ? findCategoryById(activeCategory)?.name || 'Shop' 
              : 'All Jewelry'}
          </h1>
          <div className="flex justify-center mt-4">
            <nav className="flex" aria-label="Breadcrumb">
              <ol className="inline-flex items-center space-x-1 md:space-x-3">
                <li className="inline-flex items-center">
                  <a href="/" className="text-sm text-gray-700 hover:text-gold">
                    Home
                  </a>
                </li>
                <li>
                  <div className="flex items-center">
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                    <span className="ml-1 text-sm font-medium text-gray-700 md:ml-2">Shop</span>
                  </div>
                </li>
                {activeCategory && (
                  <li>
                    <div className="flex items-center">
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                      <span className="ml-1 text-sm font-medium text-gray-700 md:ml-2">
                        {findCategoryById(activeCategory)?.name}
                      </span>
                    </div>
                  </li>
                )}
              </ol>
            </nav>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Category filters */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          <Button
            variant={!activeCategory ? "default" : "outline"}
            onClick={() => setActiveCategory(null)}
            className={!activeCategory ? "bg-gold hover:bg-gold-dark" : ""}
          >
            All
          </Button>
          {categories?.filter(c => c.category_id !== null && c.category_id !== undefined).map(category => (
            <Button
              key={category.category_id}
              variant={activeCategory === category.category_id.toString() ? "default" : "outline"}
              onClick={() => setActiveCategory(category.category_id.toString())}
              className={activeCategory === category.category_id.toString() ? "bg-gold hover:bg-gold-dark" : ""}
            >
              {category.name}
            </Button>
          ))}
        </div>

        {/* Products */}
        <ProductGrid products={filteredProducts} />
      </div>
    </div>
  );
};

export default Shop;
