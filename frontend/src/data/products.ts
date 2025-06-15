
import { Product } from "../types/product";

export const products: Product[] = [
  {
    id: "1",
    name: "Diamond Solitaire Ring",
    description: "This exquisite diamond solitaire ring features a stunning 1-carat round brilliant cut diamond set in 18K yellow gold. The classic four-prong setting allows maximum light to enter the diamond, enhancing its natural brilliance and fire. Perfect as an engagement ring or a milestone celebration piece.",
    shortDescription: "Classic 1-carat diamond set in 18K gold",
    price: 4999,
    images: [
      "/placeholder.svg",
      "/placeholder.svg",
      "/placeholder.svg"
    ],
    category: "rings",
    featured: true,
    new: false,
    material: "18K Gold, Diamond",
    weight: "3.5g",
    dimensions: "Band width: 2mm"
  },
  {
    id: "2",
    name: "Golden Pearl Necklace",
    description: "This elegant necklace features a lustrous South Sea golden pearl pendant suspended from a delicate 18K gold chain. The 11mm pearl exhibits a warm, rich golden hue with excellent luster and surface quality. The simple design allows the natural beauty of this rare pearl to take center stage.",
    shortDescription: "Luxurious South Sea pearl on 18K gold chain",
    price: 2499,
    images: [
      "/placeholder.svg",
      "/placeholder.svg",
      "/placeholder.svg"
    ],
    category: "necklaces",
    featured: true,
    new: true,
    material: "18K Gold, South Sea Pearl",
    weight: "5.2g",
    dimensions: "Chain length: 18 inches, Pearl diameter: 11mm"
  },
  {
    id: "3",
    name: "Twisted Gold Hoop Earrings",
    description: "These sophisticated twisted hoop earrings are crafted from 14K gold with a unique spiral design that catches and reflects light beautifully. The secure snap-back closure ensures comfortable all-day wear. These versatile earrings transition effortlessly from day to evening wear.",
    shortDescription: "Elegant twisted design in 14K gold",
    price: 899,
    images: [
      "/placeholder.svg",
      "/placeholder.svg",
      "/placeholder.svg"
    ],
    category: "earrings",
    featured: true,
    new: false,
    material: "14K Gold",
    weight: "4g (pair)",
    dimensions: "Diameter: 30mm"
  },
  {
    id: "4",
    name: "Sapphire Tennis Bracelet",
    description: "This stunning tennis bracelet features 25 deep blue sapphires alternating with small brilliant-cut diamonds, all set in 18K white gold. The secure box clasp includes an additional safety catch for peace of mind. The rich blue color of the sapphires creates a striking and elegant look.",
    shortDescription: "Alternating sapphires and diamonds in white gold",
    price: 3799,
    images: [
      "/placeholder.svg",
      "/placeholder.svg",
      "/placeholder.svg"
    ],
    category: "bracelets",
    featured: false,
    new: true,
    material: "18K White Gold, Sapphire, Diamond",
    weight: "12.5g",
    dimensions: "Length: 7 inches"
  },
  {
    id: "5",
    name: "Rose Gold Chain Bracelet",
    description: "This delicate yet durable bracelet is crafted from 14K rose gold with interlinking oval and round links. The warm pink hue of the rose gold flatters all skin tones. Adjustable to two lengths with a secure lobster clasp, this bracelet can be worn alone or stacked with other bracelets.",
    shortDescription: "Delicate chain design in warm rose gold",
    price: 599,
    images: [
      "/placeholder.svg",
      "/placeholder.svg",
      "/placeholder.svg"
    ],
    category: "bracelets",
    featured: false,
    new: false,
    material: "14K Rose Gold",
    weight: "2.8g",
    dimensions: "Length: 6-7 inches (adjustable)"
  },
  {
    id: "6",
    name: "Gold Bamboo Bangle",
    description: "Inspired by the strength and flexibility of bamboo, this 18K gold bangle features a textured surface mimicking bamboo segments. The hinged design allows for easy wearing while maintaining a continuous appearance. This substantial piece makes a bold statement worn alone or as part of a stack.",
    shortDescription: "Bold textured bangle with bamboo-inspired design",
    price: 2299,
    images: [
      "/placeholder.svg",
      "/placeholder.svg",
      "/placeholder.svg"
    ],
    category: "bracelets",
    featured: true,
    new: false,
    material: "18K Gold",
    weight: "22g",
    dimensions: "Inner diameter: 65mm, Width: 10mm"
  }
];

export const categories = [
  { id: "rings", name: "Rings" },
  { id: "necklaces", name: "Necklaces" },
  { id: "earrings", name: "Earrings" },
  { id: "bracelets", name: "Bracelets" },
];

export const getFeaturedProducts = (): Product[] => {
  return products.filter(product => product.featured);
};

export const getNewArrivals = (): Product[] => {
  return products.filter(product => product.new);
};

export const getProductById = (id: string): Product | undefined => {
  return products.find(product => product.id === id);
};

export const getProductsByCategory = (category: string): Product[] => {
  return products.filter(product => product.category === category);
};
