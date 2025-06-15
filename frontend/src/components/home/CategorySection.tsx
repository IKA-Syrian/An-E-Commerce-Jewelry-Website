
import React from 'react';
import { Link } from 'react-router-dom';
import { useCategories } from '@/hooks/useCategories';

const CategorySection = () => {
  const { categories, loading } = useCategories();

  const imageMap = {
    'Earrings': '8b4b6ee2e3e696595a44aa4e7edff636.jpg',
    'Rings': 'abu_alameen_jewelry_1742217921_3590306608519461847_4136712522.jpg',
    'Necklaces': 'abu_alameen_jewelry_1749034597_3647489026556476902_4136712522.jpg',
    'Bracelets': 'abu_alameen_jewelry_1742934717_3596319522854399001_4136712522.jpg',
  };

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="section-title">Shop by Category</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="animate-pulse">
                <div className="h-64 bg-gray-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="section-title">Shop by Category</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
          {categories.map(category => {
            const imageName = imageMap[category.name] || 'default.jpg'; // fallback if category name doesn't match
            return (
              <Link
                key={category.category_id}
                to={`/shop?category=${category.category_id}`}
                className="group relative h-64 overflow-hidden rounded-lg"
              >
                <img
                  src={`/uploads/catagories/${imageName}`}
                  alt={category.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black bg-opacity-30 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
                  <h3 className="font-playfair text-white text-2xl font-medium">
                    {category.name}
                  </h3>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CategorySection;
