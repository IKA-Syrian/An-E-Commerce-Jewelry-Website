import React from 'react';
import { Link } from 'react-router-dom';
import { useCategories } from '@/hooks/useCategories';
import { useSocialMedia } from '@/hooks/useSocialMedia';
import { useSiteContentByKey } from '@/hooks/useSiteContent';

// Social media platform icon map
const socialIcons: {[key: string]: JSX.Element} = {
  facebook: (
    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
    </svg>
  ),
  instagram: (
    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
    </svg>
  ),
  pinterest: (
    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 0c-6.627 0-12 5.372-12 12 0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146 1.124.347 2.317.535 3.554.535 6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z" />
    </svg>
  ),
  twitter: (
    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
    </svg>
  ),
  youtube: (
    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path fillRule="evenodd" d="M19.812 5.418c.861.23 1.538.907 1.768 1.768C21.998 8.746 22 12 22 12s0 3.255-.418 4.814a2.504 2.504 0 0 1-1.768 1.768c-1.56.419-7.814.419-7.814.419s-6.255 0-7.814-.419a2.505 2.505 0 0 1-1.768-1.768C2 15.255 2 12 2 12s0-3.255.417-4.814a2.507 2.507 0 0 1 1.768-1.768C5.744 5 11.998 5 11.998 5s6.255 0 7.814.418ZM15.194 12 10 15V9l5.194 3Z" clipRule="evenodd" />
    </svg>
  ),
  linkedin: (
    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  )
};

const Footer = () => {
  // Fetch data
  const { categories, loading: categoriesLoading } = useCategories();
  const { socialLinks, loading: socialLinksLoading } = useSocialMedia();
  const { content: footerTagline } = useSiteContentByKey('footer_tagline');
  const { content: companyName } = useSiteContentByKey('company_name');

  // Filter categories for shop links (only show up to 4)
  const shopCategories = categories?.filter(c => c.category_id !== null && c.category_id !== undefined)
    .slice(0, 4) || [];

  // Get company name
  const brandName = companyName?.content_value || 'Golden House';
  
  // Get tagline
  const tagline = footerTagline?.content_value || 
    'Exquisite jewelry crafted with passion and precision, celebrating life\'s precious moments.';

  // Filter active social links
  const activeSocialLinks = socialLinks?.filter(link => link.is_active) || [];

  return (
    <footer className="bg-gray-50 pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-1">
            <Link to="/" className="font-playfair font-bold text-2xl text-gold">
              {brandName}
            </Link>
            <p className="mt-4 text-gray-600">
              {tagline}
            </p>
          </div>

          {/* Shop Links */}
          <div className="col-span-1">
            <h3 className="font-playfair text-lg font-medium mb-4">Shop</h3>
            <ul className="space-y-2">
              {categoriesLoading ? (
                // Loading skeleton
                <>
                  {[1, 2, 3, 4].map(i => (
                    <li key={i} className="h-4 bg-gray-200 rounded w-24 mb-2 animate-pulse"></li>
                  ))}
                </>
              ) : (
                // Shop categories
                <>
                  {shopCategories.map(category => (
                    <li key={category.category_id}>
                      <Link 
                        to={`/shop?category=${category.category_id}`} 
                        className="text-gray-600 hover:text-gold transition-colors"
                      >
                        {category.name}
                      </Link>
                    </li>
                  ))}
                  <li>
                    <Link to="/shop" className="text-gray-600 hover:text-gold transition-colors font-medium">
                      View All
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Company */}
          <div className="col-span-1">
            <h3 className="font-playfair text-lg font-medium mb-4">Company</h3>
            <ul className="space-y-2">
              <li><Link to="/about" className="text-gray-600 hover:text-gold transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="text-gray-600 hover:text-gold transition-colors">Contact</Link></li>
              <li><Link to="/faq" className="text-gray-600 hover:text-gold transition-colors">FAQ</Link></li>
              <li><Link to="/gold-prices" className="text-gray-600 hover:text-gold transition-colors">Gold Prices</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="col-span-1">
            <h3 className="font-playfair text-lg font-medium mb-4">Customer Service</h3>
            <ul className="space-y-2">
              <li><Link to="/shipping" className="text-gray-600 hover:text-gold transition-colors">Shipping Policy</Link></li>
              <li><Link to="/returns" className="text-gray-600 hover:text-gold transition-colors">Returns & Exchanges</Link></li>
              <li><Link to="/privacy" className="text-gray-600 hover:text-gold transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-gray-600 hover:text-gold transition-colors">Terms & Conditions</Link></li>
            </ul>
          </div>
        </div>

        {/* Newsletter and Social*/}
        <div className="border-t border-gray-200 pt-8 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm mb-4 md:mb-0">
              &copy; {new Date().getFullYear()} {brandName}. All rights reserved.
            </p>
            <div className="flex space-x-6">
              {socialLinksLoading ? (
                // Loading skeleton
                <>
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-6 w-6 bg-gray-200 rounded-full animate-pulse"></div>
                  ))}
                </>
              ) : (
                // Social media links
                <>
                  {activeSocialLinks.map(link => (
                    <a 
                      key={link.link_id} 
                      href={link.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-gray-500 hover:text-gold transition-colors"
                    >
                      <span className="sr-only">{link.platform_name}</span>
                      {/* Use matching icon from map or default icon */}
                      {socialIcons[link.platform_name.toLowerCase()] || (
                        <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path fillRule="evenodd" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" clipRule="evenodd" />
                        </svg>
                      )}
                    </a>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
