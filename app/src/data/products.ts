export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  memberPrice?: number;
  description: string;
  features: string[];
  images: string[];
  sizes: string[];
  colors: { name: string; hex: string }[];
  inStock: boolean;
  rating: number;
  reviewCount: number;
  tags: string[];
  exclusive?: boolean;
  pointsMultiplier?: number;
}

export const products: Product[] = [
  // ==========================================
  // APPAREL (15+ items)
  // ==========================================
  {
    id: "polo-classic",
    name: "Classic Polo Shirt",
    brand: "ParkerJoe",
    category: "apparel",
    price: 48,
    memberPrice: 42,
    description: "Timeless polo shirt crafted from premium pique cotton. Features a comfortable fit with a three-button placket and classic collar. Perfect for school, family gatherings, or weekend outings.",
    features: [
      "100% premium pique cotton",
      "Reinforced collar and cuffs",
      "Three-button placket",
      "Tagless for comfort",
      "Pre-shrunk fabric"
    ],
    images: ["/products/polo-classic-1.jpg", "/products/polo-classic-2.jpg"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    colors: [
      { name: "Navy", hex: "#1e3a5f" },
      { name: "White", hex: "#ffffff" },
      { name: "Red", hex: "#c41e3a" },
      { name: "Light Blue", hex: "#87ceeb" },
      { name: "Forest Green", hex: "#228b22" }
    ],
    inStock: true,
    rating: 4.7,
    reviewCount: 324,
    tags: ["polo", "classic", "cotton", "school"]
  },
  {
    id: "oxford-button-down",
    name: "Oxford Button Down",
    brand: "ParkerJoe",
    category: "apparel",
    price: 68,
    memberPrice: 58,
    description: "Sharp and sophisticated oxford button-down shirt. The perfect foundation for dressy occasions or smart-casual looks. Breathable fabric with a crisp finish that stays polished all day.",
    features: [
      "Premium oxford cloth weave",
      "Button-down collar",
      "Chest pocket",
      "Wrinkle-resistant finish",
      "Adjustable button cuffs"
    ],
    images: ["/products/oxford-shirt-1.jpg", "/products/oxford-shirt-2.jpg"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    colors: [
      { name: "White", hex: "#ffffff" },
      { name: "Light Blue", hex: "#add8e6" },
      { name: "Pink", hex: "#ffb6c1" }
    ],
    inStock: true,
    rating: 4.8,
    reviewCount: 256,
    tags: ["oxford", "button-down", "formal", "school uniform"]
  },
  {
    id: "chino-shorts",
    name: "Chino Shorts",
    brand: "ParkerJoe",
    category: "apparel",
    price: 42,
    memberPrice: 36,
    description: "Versatile chino shorts that transition seamlessly from school to play. Classic styling with a comfortable fit and durable construction that withstands active days.",
    features: [
      "Soft cotton twill fabric",
      "Adjustable waistband",
      "Front and back pockets",
      "Belt loops included",
      "Reinforced seams"
    ],
    images: ["/products/chino-shorts-1.jpg", "/products/chino-shorts-2.jpg"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    colors: [
      { name: "Khaki", hex: "#c3b091" },
      { name: "Navy", hex: "#1e3a5f" },
      { name: "Red", hex: "#dc143c" }
    ],
    inStock: true,
    rating: 4.6,
    reviewCount: 198,
    tags: ["shorts", "chino", "casual", "summer"]
  },
  {
    id: "pleated-dress-pants",
    name: "Pleated Dress Pants",
    brand: "ParkerJoe",
    category: "apparel",
    price: 72,
    memberPrice: 62,
    description: "Elegant pleated dress pants for formal occasions and school events. Traditional styling meets modern comfort with an adjustable waist for growing boys.",
    features: [
      "Polyester-rayon blend",
      "Classic pleated front",
      "Adjustable waistband",
      "Cuffed hem option",
      "Wrinkle-resistant"
    ],
    images: ["/products/dress-pants-1.jpg", "/products/dress-pants-2.jpg"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    colors: [
      { name: "Navy", hex: "#1e3a5f" },
      { name: "Gray", hex: "#808080" }
    ],
    inStock: true,
    rating: 4.5,
    reviewCount: 145,
    tags: ["pants", "dress", "formal", "pleated"]
  },
  {
    id: "casual-tshirt",
    name: "Casual T-Shirt",
    brand: "ParkerJoe",
    category: "apparel",
    price: 28,
    memberPrice: 24,
    description: "Everyday essential t-shirt with fun prints and graphics. Soft, breathable cotton keeps kids comfortable during playtime while expressing their personality.",
    features: [
      "100% ring-spun cotton",
      "Reinforced shoulder seams",
      "Tagless neck label",
      "Pre-shrunk fabric",
      "Fun graphic prints"
    ],
    images: ["/products/casual-tshirt-1.jpg", "/products/casual-tshirt-2.jpg"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    colors: [
      { name: "White", hex: "#ffffff" },
      { name: "Black", hex: "#000000" },
      { name: "Royal Blue", hex: "#4169e1" },
      { name: "Heather Gray", hex: "#b0b0b0" }
    ],
    inStock: true,
    rating: 4.6,
    reviewCount: 412,
    tags: ["t-shirt", "casual", "prints", "everyday"]
  },
  {
    id: "henley-shirt",
    name: "Henley Shirt",
    brand: "ParkerJoe",
    category: "apparel",
    price: 38,
    memberPrice: 32,
    description: "Long-sleeve henley shirt combining comfort and style. The button placket adds a touch of sophistication to this casual wardrobe staple.",
    features: [
      "Soft cotton jersey",
      "Three-button placket",
      "Long sleeves with cuffs",
      "Curved hem",
      "Thermal knit option"
    ],
    images: ["/products/henley-1.jpg", "/products/henley-2.jpg"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    colors: [
      { name: "Charcoal", hex: "#36454f" },
      { name: "Burgundy", hex: "#800020" },
      { name: "Olive", hex: "#808000" },
      { name: "Navy", hex: "#1e3a5f" }
    ],
    inStock: true,
    rating: 4.7,
    reviewCount: 178,
    tags: ["henley", "long-sleeve", "casual", "layering"]
  },
  {
    id: "cardigan-sweater",
    name: "Cardigan Sweater",
    brand: "ParkerJoe",
    category: "apparel",
    price: 78,
    memberPrice: 68,
    description: "Classic button-front cardigan perfect for layering. Soft knit construction provides warmth without bulk, making it ideal for school uniforms or dressy occasions.",
    features: [
      "Cotton-acrylic blend",
      "V-neck design",
      "Button front closure",
      "Ribbed cuffs and hem",
      "Easy care machine washable"
    ],
    images: ["/products/cardigan-1.jpg", "/products/cardigan-2.jpg"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    colors: [
      { name: "Navy", hex: "#1e3a5f" },
      { name: "Gray", hex: "#808080" },
      { name: "Burgundy", hex: "#800020" }
    ],
    inStock: true,
    rating: 4.8,
    reviewCount: 134,
    tags: ["cardigan", "sweater", "layering", "school"]
  },
  {
    id: "denim-jeans",
    name: "Denim Jeans",
    brand: "ParkerJoe",
    category: "apparel",
    price: 58,
    memberPrice: 50,
    description: "Durable dark wash denim jeans built for active kids. Classic five-pocket styling with an adjustable waistband for the perfect fit as they grow.",
    features: [
      "Premium denim cotton",
      "Dark wash finish",
      "Five-pocket styling",
      "Adjustable waistband",
      "Reinforced knees"
    ],
    images: ["/products/denim-jeans-1.jpg", "/products/denim-jeans-2.jpg"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    colors: [
      { name: "Dark Wash", hex: "#2c3e50" },
      { name: "Medium Wash", hex: "#5d6d7e" }
    ],
    inStock: true,
    rating: 4.7,
    reviewCount: 289,
    tags: ["jeans", "denim", "casual", "everyday"]
  },
  {
    id: "cargo-shorts",
    name: "Cargo Shorts",
    brand: "ParkerJoe",
    category: "apparel",
    price: 45,
    memberPrice: 38,
    description: "Adventure-ready cargo shorts with plenty of pockets for treasures. Rugged construction and comfortable fit for outdoor exploration and everyday play.",
    features: [
      "Durable cotton canvas",
      "Multiple cargo pockets",
      "Adjustable waistband",
      "Belt loops included",
      "Rip-resistant fabric"
    ],
    images: ["/products/cargo-shorts-1.jpg", "/products/cargo-shorts-2.jpg"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    colors: [
      { name: "Olive", hex: "#808000" },
      { name: "Khaki", hex: "#c3b091" },
      { name: "Navy", hex: "#1e3a5f" }
    ],
    inStock: true,
    rating: 4.6,
    reviewCount: 156,
    tags: ["cargo", "shorts", "outdoor", "pockets"]
  },
  {
    id: "swim-trunks",
    name: "Swim Trunks",
    brand: "ParkerJoe",
    category: "apparel",
    price: 35,
    memberPrice: 30,
    description: "Fun and functional swim trunks for pool days and beach adventures. Quick-drying fabric with mesh lining and playful patterns kids will love.",
    features: [
      "Quick-dry polyester",
      "Mesh inner lining",
      "Elastic waist with drawstring",
      "Side pockets",
      "UPF 50+ sun protection"
    ],
    images: ["/products/swim-trunks-1.jpg", "/products/swim-trunks-2.jpg"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    colors: [
      { name: "Navy Stripes", hex: "#1e3a5f" },
      { name: "Tropical Print", hex: "#ff6b35" },
      { name: "Camo Green", hex: "#4a5d23" },
      { name: "Red Sharks", hex: "#dc143c" }
    ],
    inStock: true,
    rating: 4.8,
    reviewCount: 203,
    tags: ["swim", "beach", "summer", "trunks"]
  },
  {
    id: "pajama-set",
    name: "Pajama Set",
    brand: "ParkerJoe",
    category: "apparel",
    price: 48,
    memberPrice: 42,
    description: "Cozy two-piece pajama set in classic plaid patterns. Soft, breathable fabric ensures a comfortable night's sleep with a touch of traditional charm.",
    features: [
      "100% soft cotton flannel",
      "Two-piece set",
      "Button-front top",
      "Elastic waist pants",
      "Classic plaid patterns"
    ],
    images: ["/products/pajama-set-1.jpg", "/products/pajama-set-2.jpg"],
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: [
      { name: "Red Plaid", hex: "#b22222" },
      { name: "Blue Plaid", hex: "#4682b4" },
      { name: "Green Plaid", hex: "#228b22" }
    ],
    inStock: true,
    rating: 4.9,
    reviewCount: 167,
    tags: ["pajamas", "sleepwear", "plaid", "cozy"]
  },
  {
    id: "vneck-sweater",
    name: "V-Neck Sweater",
    brand: "ParkerJoe",
    category: "apparel",
    price: 62,
    memberPrice: 54,
    description: "Classic V-neck sweater perfect for layering over collared shirts. Soft knit construction with ribbed trim for a polished, preppy look.",
    features: [
      "Cotton-cashmere blend",
      "Classic V-neck",
      "Ribbed cuffs and hem",
      "Lightweight warmth",
      "Easy care"
    ],
    images: ["/products/vneck-sweater-1.jpg", "/products/vneck-sweater-2.jpg"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    colors: [
      { name: "Navy", hex: "#1e3a5f" },
      { name: "Gray", hex: "#808080" },
      { name: "Burgundy", hex: "#800020" },
      { name: "Forest Green", hex: "#228b22" }
    ],
    inStock: true,
    rating: 4.7,
    reviewCount: 142,
    tags: ["sweater", "v-neck", "layering", "school"]
  },
  {
    id: "hooded-sweatshirt",
    name: "Hooded Sweatshirt",
    brand: "ParkerJoe",
    category: "apparel",
    price: 55,
    memberPrice: 48,
    description: "Classic hoodie for everyday comfort and casual style. Soft fleece interior with a kangaroo pocket and adjustable drawstring hood.",
    features: [
      "Cotton-polyester fleece",
      "Adjustable drawstring hood",
      "Kangaroo front pocket",
      "Ribbed cuffs and hem",
      "Tagless comfort"
    ],
    images: ["/products/hoodie-1.jpg", "/products/hoodie-2.jpg"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    colors: [
      { name: "Navy", hex: "#1e3a5f" },
      { name: "Gray", hex: "#808080" },
      { name: "Black", hex: "#000000" },
      { name: "Red", hex: "#dc143c" }
    ],
    inStock: true,
    rating: 4.8,
    reviewCount: 378,
    tags: ["hoodie", "sweatshirt", "casual", "fleece"]
  },
  {
    id: "track-pants",
    name: "Track Pants",
    brand: "ParkerJoe",
    category: "apparel",
    price: 42,
    memberPrice: 36,
    description: "Athletic track pants for sports practice or casual wear. Comfortable fit with zippered pockets and breathable fabric that moves with active kids.",
    features: [
      "Moisture-wicking fabric",
      "Elastic waist with drawstring",
      "Zippered side pockets",
      "Tapered leg design",
      "Reflective accents"
    ],
    images: ["/products/track-pants-1.jpg", "/products/track-pants-2.jpg"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    colors: [
      { name: "Black", hex: "#000000" },
      { name: "Navy", hex: "#1e3a5f" },
      { name: "Gray", hex: "#808080" }
    ],
    inStock: true,
    rating: 4.6,
    reviewCount: 195,
    tags: ["pants", "athletic", "sports", "active"]
  },
  {
    id: "linen-shirt",
    name: "Linen Shirt",
    brand: "ParkerJoe",
    category: "apparel",
    price: 68,
    memberPrice: 58,
    description: "Breathable linen shirt from our summer collection. Lightweight and airy with a relaxed fit, perfect for warm weather occasions and vacation style.",
    features: [
      "100% premium linen",
      "Breathable weave",
      "Button-down collar",
      "Chest pocket",
      "Relaxed summer fit"
    ],
    images: ["/products/linen-shirt-1.jpg", "/products/linen-shirt-2.jpg"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    colors: [
      { name: "White", hex: "#ffffff" },
      { name: "Light Blue", hex: "#add8e6" },
      { name: "Sand", hex: "#c2b280" },
      { name: "Sage", hex: "#9dc183" }
    ],
    inStock: true,
    rating: 4.7,
    reviewCount: 89,
    tags: ["linen", "summer", "beach", "breathable"]
  },

  // ==========================================
  // SHOES (10+ items)
  // ==========================================
  {
    id: "leather-loafers",
    name: "Classic Leather Loafers",
    brand: "ParkerJoe",
    category: "shoes",
    price: 98,
    memberPrice: 85,
    description: "Timeless leather loafers for dressy occasions and school uniforms. Premium construction with cushioned insoles for all-day comfort.",
    features: [
      "Genuine leather upper",
      "Cushioned memory foam insole",
      "Slip-on design",
      "Durable rubber outsole",
      "Classic penny loafer style"
    ],
    images: ["/products/loafers-1.jpg", "/products/loafers-2.jpg"],
    sizes: ["11", "12", "13", "1", "2", "3", "4", "5", "6"],
    colors: [
      { name: "Brown", hex: "#8b4513" },
      { name: "Black", hex: "#000000" }
    ],
    inStock: true,
    rating: 4.8,
    reviewCount: 234,
    tags: ["loafers", "leather", "dress", "formal"]
  },
  {
    id: "boat-shoes",
    name: "Boat Shoes",
    brand: "ParkerJoe",
    category: "shoes",
    price: 78,
    memberPrice: 68,
    description: "Classic boat shoes for preppy summer style. Non-marking soles and water-resistant leather make them perfect for dockside adventures.",
    features: [
      "Water-resistant leather",
      "Non-marking rubber sole",
      "360-degree lacing",
      "Cushioned footbed",
      "Handsewn moccasin construction"
    ],
    images: ["/products/boat-shoes-1.jpg", "/products/boat-shoes-2.jpg"],
    sizes: ["11", "12", "13", "1", "2", "3", "4", "5", "6"],
    colors: [
      { name: "Navy", hex: "#1e3a5f" },
      { name: "Brown", hex: "#8b4513" },
      { name: "Tan", hex: "#d2b48c" }
    ],
    inStock: true,
    rating: 4.7,
    reviewCount: 178,
    tags: ["boat shoes", "summer", "casual", "preppy"]
  },
  {
    id: "canvas-sneakers",
    name: "Canvas Sneakers",
    brand: "ParkerJoe",
    category: "shoes",
    price: 55,
    memberPrice: 48,
    description: "Versatile canvas sneakers for everyday adventures. Clean, classic design that pairs with everything from jeans to shorts.",
    features: [
      "Durable canvas upper",
      "Padded collar and tongue",
      "Rubber vulcanized outsole",
      "Lace-up closure",
      "Removable insole"
    ],
    images: ["/products/canvas-sneakers-1.jpg", "/products/canvas-sneakers-2.jpg"],
    sizes: ["11", "12", "13", "1", "2", "3", "4", "5", "6"],
    colors: [
      { name: "White", hex: "#ffffff" },
      { name: "Navy", hex: "#1e3a5f" },
      { name: "Red", hex: "#dc143c" },
      { name: "Black", hex: "#000000" }
    ],
    inStock: true,
    rating: 4.6,
    reviewCount: 312,
    tags: ["sneakers", "canvas", "casual", "everyday"]
  },
  {
    id: "dress-oxford",
    name: "Dress Oxford",
    brand: "ParkerJoe",
    category: "shoes",
    price: 125,
    memberPrice: 110,
    description: "Elegant dress oxfords for the most formal occasions. Premium polished leather with classic closed-lace construction for a sophisticated look.",
    features: [
      "Premium calfskin leather",
      "Closed-lace oxford style",
      "Leather sole",
      "Cushioned insole",
      "Hand-polished finish"
    ],
    images: ["/products/oxford-1.jpg", "/products/oxford-2.jpg"],
    sizes: ["11", "12", "13", "1", "2", "3", "4", "5", "6"],
    colors: [
      { name: "Black", hex: "#000000" },
      { name: "Brown", hex: "#8b4513" }
    ],
    inStock: true,
    rating: 4.9,
    reviewCount: 156,
    tags: ["oxford", "dress", "formal", "leather"]
  },
  {
    id: "sandals",
    name: "Sandals",
    brand: "ParkerJoe",
    category: "shoes",
    price: 38,
    memberPrice: 32,
    description: "Comfortable leather sandals for warm weather. Adjustable straps and cushioned footbed provide all-day comfort for summer adventures.",
    features: [
      "Genuine leather straps",
      "Adjustable buckle closure",
      "Contoured cushioned footbed",
      "Flexible rubber outsole",
      "Breathable design"
    ],
    images: ["/products/sandals-1.jpg", "/products/sandals-2.jpg"],
    sizes: ["11", "12", "13", "1", "2", "3", "4", "5", "6"],
    colors: [
      { name: "Brown", hex: "#8b4513" },
      { name: "Tan", hex: "#d2b48c" }
    ],
    inStock: true,
    rating: 4.5,
    reviewCount: 134,
    tags: ["sandals", "summer", "leather", "casual"]
  },
  {
    id: "athletic-sneakers",
    name: "Athletic Sneakers",
    brand: "ParkerJoe",
    category: "shoes",
    price: 68,
    memberPrice: 58,
    description: "Performance running shoes designed for active kids. Lightweight cushioning and breathable mesh keep feet comfortable during sports and play.",
    features: [
      "Breathable mesh upper",
      "Lightweight EVA cushioning",
      "Durable rubber outsole",
      "Padded collar and tongue",
      "Lace-up closure"
    ],
    images: ["/products/athletic-sneakers-1.jpg", "/products/athletic-sneakers-2.jpg"],
    sizes: ["11", "12", "13", "1", "2", "3", "4", "5", "6"],
    colors: [
      { name: "Black/Gray", hex: "#2c3e50" },
      { name: "Navy/White", hex: "#1e3a5f" },
      { name: "Red/Black", hex: "#dc143c" }
    ],
    inStock: true,
    rating: 4.7,
    reviewCount: 267,
    tags: ["sneakers", "athletic", "running", "sports"]
  },
  {
    id: "chelsea-boots",
    name: "Chelsea Boots",
    brand: "ParkerJoe",
    category: "shoes",
    price: 145,
    memberPrice: 125,
    description: "Stylish suede Chelsea boots for dressy-casual occasions. Elastic side panels and pull tabs make them easy to slip on and off.",
    features: [
      "Premium suede leather",
      "Elastic side gores",
      "Leather lining",
      "Durable rubber sole",
      "Pull tab at heel"
    ],
    images: ["/products/chelsea-boots-1.jpg", "/products/chelsea-boots-2.jpg"],
    sizes: ["11", "12", "13", "1", "2", "3", "4", "5", "6"],
    colors: [
      { name: "Tan Suede", hex: "#d2b48c" },
      { name: "Navy Suede", hex: "#2c3e50" },
      { name: "Gray Suede", hex: "#808080" }
    ],
    inStock: true,
    rating: 4.8,
    reviewCount: 112,
    tags: ["boots", "chelsea", "suede", "dressy"]
  },
  {
    id: "high-top-sneakers",
    name: "High-Top Sneakers",
    brand: "ParkerJoe",
    category: "shoes",
    price: 72,
    memberPrice: 62,
    description: "Retro-inspired high-top canvas sneakers. Classic basketball style with ankle support and timeless appeal.",
    features: [
      "Durable canvas upper",
      "High-top ankle support",
      "Rubber toe cap",
      "Padded collar",
      "Vulcanized rubber sole"
    ],
    images: ["/products/high-tops-1.jpg", "/products/high-tops-2.jpg"],
    sizes: ["11", "12", "13", "1", "2", "3", "4", "5", "6"],
    colors: [
      { name: "Black", hex: "#000000" },
      { name: "White", hex: "#ffffff" },
      { name: "Navy", hex: "#1e3a5f" },
      { name: "Red", hex: "#dc143c" }
    ],
    inStock: true,
    rating: 4.6,
    reviewCount: 189,
    tags: ["sneakers", "high-top", "canvas", "casual"]
  },
  {
    id: "slip-on-shoes",
    name: "Slip-On Shoes",
    brand: "ParkerJoe",
    category: "shoes",
    price: 48,
    memberPrice: 42,
    description: "Easy-on, easy-off slip-on shoes for busy mornings. Comfortable elastic goring and padded insoles make these a go-to casual choice.",
    features: [
      "Canvas upper",
      "Elastic side goring",
      "Slip-on design",
      "Padded footbed",
      "Rubber outsole"
    ],
    images: ["/products/slip-ons-1.jpg", "/products/slip-ons-2.jpg"],
    sizes: ["11", "12", "13", "1", "2", "3", "4", "5", "6"],
    colors: [
      { name: "Navy", hex: "#1e3a5f" },
      { name: "Gray", hex: "#808080" },
      { name: "Black", hex: "#000000" }
    ],
    inStock: true,
    rating: 4.5,
    reviewCount: 223,
    tags: ["slip-on", "casual", "easy", "everyday"]
  },
  {
    id: "rain-boots",
    name: "Rain Boots",
    brand: "ParkerJoe",
    category: "shoes",
    price: 58,
    memberPrice: 50,
    description: "Waterproof rain boots for puddle-jumping adventures. Durable rubber construction with comfortable lining keeps feet dry and happy.",
    features: [
      "100% waterproof rubber",
      "Cotton lining",
      "Pull handles for easy on/off",
      "Non-slip tread",
      "Matte or glossy finish"
    ],
    images: ["/products/rain-boots-1.jpg", "/products/rain-boots-2.jpg"],
    sizes: ["11", "12", "13", "1", "2", "3", "4", "5", "6"],
    colors: [
      { name: "Navy", hex: "#1e3a5f" },
      { name: "Red", hex: "#dc143c" },
      { name: "Yellow", hex: "#ffd700" },
      { name: "Green", hex: "#228b22" }
    ],
    inStock: true,
    rating: 4.7,
    reviewCount: 156,
    tags: ["boots", "rain", "waterproof", "outdoor"]
  },

  // ==========================================
  // ACCESSORIES (15+ items)
  // ==========================================
  {
    id: "leather-belt",
    name: "Leather Belt",
    brand: "ParkerJoe",
    category: "accessories",
    price: 45,
    memberPrice: 38,
    description: "Premium reversible leather belt with classic buckle. Two colors in one belt make it versatile for any outfit.",
    features: [
      "Genuine leather",
      "Reversible design (two colors)",
      "Classic metal buckle",
      "Adjustable fit",
      "Durable stitching"
    ],
    images: ["/products/leather-belt-1.jpg", "/products/leather-belt-2.jpg"],
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Brown/Black", hex: "#8b4513" },
      { name: "Tan/Navy", hex: "#d2b48c" }
    ],
    inStock: true,
    rating: 4.6,
    reviewCount: 178,
    tags: ["belt", "leather", "reversible", "accessory"]
  },
  {
    id: "silk-bow-tie",
    name: "Silk Bow Tie",
    brand: "ParkerJoe",
    category: "accessories",
    price: 35,
    memberPrice: 30,
    description: "Handcrafted silk bow tie for special occasions. Pre-tied for convenience with adjustable neck strap for the perfect fit.",
    features: [
      "100% silk fabric",
      "Pre-tied design",
      "Adjustable neck strap",
      "Metal hook closure",
      "Classic butterfly shape"
    ],
    images: ["/products/bow-tie-1.jpg", "/products/bow-tie-2.jpg"],
    sizes: ["One Size"],
    colors: [
      { name: "Black", hex: "#000000" },
      { name: "Navy", hex: "#1e3a5f" },
      { name: "Burgundy", hex: "#800020" },
      { name: "Red", hex: "#dc143c" }
    ],
    inStock: true,
    rating: 4.8,
    reviewCount: 134,
    tags: ["bow tie", "silk", "formal", "special occasion"]
  },
  {
    id: "neck-tie",
    name: "Neck Tie",
    brand: "ParkerJoe",
    category: "accessories",
    price: 42,
    memberPrice: 36,
    description: "Classic neck tie in various patterns and solids. Quality silk-blend construction with proper length and width for boys.",
    features: [
      "Silk-polyester blend",
      "Standard width",
      "Proper length for boys",
      "Self-tie design",
      "Slip-resistant lining"
    ],
    images: ["/products/neck-tie-1.jpg", "/products/neck-tie-2.jpg"],
    sizes: ["One Size"],
    colors: [
      { name: "Navy Stripe", hex: "#1e3a5f" },
      { name: "Red Solid", hex: "#dc143c" },
      { name: "Burgundy Solid", hex: "#800020" },
      { name: "Gray Pattern", hex: "#808080" }
    ],
    inStock: true,
    rating: 4.7,
    reviewCount: 156,
    tags: ["tie", "necktie", "formal", "school"]
  },
  {
    id: "baseball-cap",
    name: "Baseball Cap",
    brand: "ParkerJoe",
    category: "accessories",
    price: 28,
    memberPrice: 24,
    description: "Classic baseball cap with embroidered ParkerJoe logo. Adjustable back closure and pre-curved brim for everyday sun protection.",
    features: [
      "Cotton twill fabric",
      "Embroidered logo",
      "Adjustable strap closure",
      "Pre-curved brim",
      "Breathable eyelets"
    ],
    images: ["/products/baseball-cap-1.jpg", "/products/baseball-cap-2.jpg"],
    sizes: ["One Size"],
    colors: [
      { name: "Navy", hex: "#1e3a5f" },
      { name: "Red", hex: "#dc143c" },
      { name: "Gray", hex: "#808080" },
      { name: "Black", hex: "#000000" }
    ],
    inStock: true,
    rating: 4.6,
    reviewCount: 245,
    tags: ["cap", "hat", "casual", "sun protection"]
  },
  {
    id: "dress-socks-pack",
    name: "Dress Socks (3-pack)",
    brand: "ParkerJoe",
    category: "accessories",
    price: 22,
    memberPrice: 18,
    description: "Three-pack of dress socks in coordinating colors. Soft cotton blend with comfortable stretch for all-day wear with dress shoes.",
    features: [
      "Cotton-nylon blend",
      "Reinforced toe and heel",
      "Comfortable stretch",
      "Crew length",
      "Three coordinating pairs"
    ],
    images: ["/products/dress-socks-1.jpg", "/products/dress-socks-2.jpg"],
    sizes: ["S", "M", "L"],
    colors: [
      { name: "Assorted", hex: "#808080" },
      { name: "Navy Pack", hex: "#1e3a5f" },
      { name: "Black Pack", hex: "#000000" }
    ],
    inStock: true,
    rating: 4.5,
    reviewCount: 312,
    tags: ["socks", "dress", "essentials", "pack"]
  },
  {
    id: "suspenders",
    name: "Suspenders",
    brand: "ParkerJoe",
    category: "accessories",
    price: 38,
    memberPrice: 32,
    description: "Classic Y-back suspenders for a dapper look. Adjustable length with durable clips that attach securely to pants.",
    features: [
      "Elastic straps",
      "Y-back design",
      "Adjustable length",
      "Strong metal clips",
      "Crosspatch leather detail"
    ],
    images: ["/products/suspenders-1.jpg", "/products/suspenders-2.jpg"],
    sizes: ["One Size"],
    colors: [
      { name: "Navy", hex: "#1e3a5f" },
      { name: "Red", hex: "#dc143c" },
      { name: "Black", hex: "#000000" },
      { name: "Burgundy", hex: "#800020" }
    ],
    inStock: true,
    rating: 4.7,
    reviewCount: 98,
    tags: ["suspenders", "formal", "vintage", "dress"]
  },
  {
    id: "leather-wallet",
    name: "Leather Wallet",
    brand: "ParkerJoe",
    category: "accessories",
    price: 48,
    memberPrice: 42,
    description: "Genuine leather wallet that can be personalized with initials. Compact bifold design with multiple card slots and bill compartment.",
    features: [
      "Genuine leather",
      "Bifold design",
      "Multiple card slots",
      "Bill compartment",
      "Optional personalization"
    ],
    images: ["/products/wallet-1.jpg", "/products/wallet-2.jpg"],
    sizes: ["One Size"],
    colors: [
      { name: "Brown", hex: "#8b4513" },
      { name: "Black", hex: "#000000" },
      { name: "Tan", hex: "#d2b48c" }
    ],
    inStock: true,
    rating: 4.8,
    reviewCount: 167,
    tags: ["wallet", "leather", "personalized", "gift"]
  },
  {
    id: "sunglasses",
    name: "Sunglasses",
    brand: "ParkerJoe",
    category: "accessories",
    price: 68,
    memberPrice: 58,
    description: "Stylish sunglasses with full UV protection. Durable frames designed for active kids with shatter-resistant lenses.",
    features: [
      "100% UV400 protection",
      "Shatter-resistant lenses",
      "Durable plastic frames",
      "Flexible spring hinges",
      "Includes carrying case"
    ],
    images: ["/products/sunglasses-1.jpg", "/products/sunglasses-2.jpg"],
    sizes: ["One Size"],
    colors: [
      { name: "Black", hex: "#000000" },
      { name: "Tortoise", hex: "#8b4513" },
      { name: "Navy", hex: "#1e3a5f" }
    ],
    inStock: true,
    rating: 4.7,
    reviewCount: 134,
    tags: ["sunglasses", "uv protection", "summer", "accessory"]
  },
  {
    id: "backpack",
    name: "Backpack",
    brand: "ParkerJoe",
    category: "accessories",
    price: 88,
    memberPrice: 75,
    description: "Durable school backpack with plenty of compartments. Padded laptop sleeve and comfortable shoulder straps for all-day carrying.",
    features: [
      "Durable canvas material",
      "Padded laptop compartment",
      "Multiple pockets",
      "Padded shoulder straps",
      "Water bottle holder"
    ],
    images: ["/products/backpack-1.jpg", "/products/backpack-2.jpg"],
    sizes: ["One Size"],
    colors: [
      { name: "Navy", hex: "#1e3a5f" },
      { name: "Gray", hex: "#808080" },
      { name: "Olive", hex: "#808000" }
    ],
    inStock: true,
    rating: 4.8,
    reviewCount: 289,
    tags: ["backpack", "school", "bag", "essentials"]
  },
  {
    id: "classic-watch",
    name: "Watch",
    brand: "ParkerJoe",
    category: "accessories",
    price: 125,
    memberPrice: 110,
    description: "Classic analog watch with timeless styling. Water-resistant construction with easy-to-read dial and genuine leather band.",
    features: [
      "Analog quartz movement",
      "Stainless steel case",
      "Genuine leather band",
      "Water resistant",
      "Easy-to-read dial"
    ],
    images: ["/products/watch-1.jpg", "/products/watch-2.jpg"],
    sizes: ["One Size"],
    colors: [
      { name: "Brown Band", hex: "#8b4513" },
      { name: "Black Band", hex: "#000000" },
      { name: "Navy Band", hex: "#1e3a5f" }
    ],
    inStock: true,
    rating: 4.9,
    reviewCount: 78,
    tags: ["watch", "timepiece", "classic", "gift"]
  },
  {
    id: "pocket-square",
    name: "Pocket Square",
    brand: "ParkerJoe",
    category: "accessories",
    price: 25,
    memberPrice: 22,
    description: "Elegant silk pocket square to complete any formal look. Various folds create different styles for weddings, parties, or special events.",
    features: [
      "100% silk",
      "Hand-rolled edges",
      "Classic square size",
      "Multiple folding options",
      "Coordinating colors available"
    ],
    images: ["/products/pocket-square-1.jpg", "/products/pocket-square-2.jpg"],
    sizes: ["One Size"],
    colors: [
      { name: "White", hex: "#ffffff" },
      { name: "Navy", hex: "#1e3a5f" },
      { name: "Burgundy", hex: "#800020" },
      { name: "Gold", hex: "#ffd700" }
    ],
    inStock: true,
    rating: 4.6,
    reviewCount: 56,
    tags: ["pocket square", "silk", "formal", "wedding"]
  },
  {
    id: "winter-scarf",
    name: "Scarf",
    brand: "ParkerJoe",
    category: "accessories",
    price: 35,
    memberPrice: 30,
    description: "Warm winter scarf in soft acrylic knit. Classic styling that pairs with any coat for cold weather comfort.",
    features: [
      "Soft acrylic knit",
      "Classic length",
      "Fringe ends",
      "Lightweight warmth",
      "Easy care"
    ],
    images: ["/products/scarf-1.jpg", "/products/scarf-2.jpg"],
    sizes: ["One Size"],
    colors: [
      { name: "Navy", hex: "#1e3a5f" },
      { name: "Gray", hex: "#808080" },
      { name: "Red", hex: "#dc143c" },
      { name: "Black", hex: "#000000" }
    ],
    inStock: true,
    rating: 4.5,
    reviewCount: 89,
    tags: ["scarf", "winter", "warm", "accessory"]
  },
  {
    id: "leather-gloves",
    name: "Gloves",
    brand: "ParkerJoe",
    category: "accessories",
    price: 32,
    memberPrice: 28,
    description: "Genuine leather gloves for dressy winter occasions. Soft lining provides warmth while maintaining a sophisticated look.",
    features: [
      "Genuine leather exterior",
      "Soft fleece lining",
      "Stitched details",
      "Snug wrist fit",
      "Dress style"
    ],
    images: ["/products/gloves-1.jpg", "/products/gloves-2.jpg"],
    sizes: ["S", "M", "L"],
    colors: [
      { name: "Brown", hex: "#8b4513" },
      { name: "Black", hex: "#000000" }
    ],
    inStock: true,
    rating: 4.7,
    reviewCount: 67,
    tags: ["gloves", "leather", "winter", "formal"]
  },
  {
    id: "winter-hat",
    name: "Winter Hat",
    brand: "ParkerJoe",
    category: "accessories",
    price: 28,
    memberPrice: 24,
    description: "Cozy knit beanie for cold weather. Soft, stretchy fabric with a classic cuffed design and subtle logo patch.",
    features: [
      "Soft acrylic knit",
      "Stretchy fit",
      "Cuffed design",
      "Warm fleece lining",
      "Logo patch detail"
    ],
    images: ["/products/winter-hat-1.jpg", "/products/winter-hat-2.jpg"],
    sizes: ["One Size"],
    colors: [
      { name: "Navy", hex: "#1e3a5f" },
      { name: "Gray", hex: "#808080" },
      { name: "Black", hex: "#000000" },
      { name: "Red", hex: "#dc143c" }
    ],
    inStock: true,
    rating: 4.6,
    reviewCount: 112,
    tags: ["hat", "beanie", "winter", "warm"]
  },
  {
    id: "tie-bar",
    name: "Tie Bar",
    brand: "ParkerJoe",
    category: "accessories",
    price: 22,
    memberPrice: 19,
    description: "Classic tie bar to keep neckwear in place. Simple, elegant design in gold or silver finish adds a polished touch.",
    features: [
      "Metal construction",
      "Clip closure",
      "Gold or silver finish",
      "Standard 2-inch length",
      "Engravable surface"
    ],
    images: ["/products/tie-bar-1.jpg", "/products/tie-bar-2.jpg"],
    sizes: ["One Size"],
    colors: [
      { name: "Gold", hex: "#ffd700" },
      { name: "Silver", hex: "#c0c0c0" }
    ],
    inStock: true,
    rating: 4.5,
    reviewCount: 45,
    tags: ["tie bar", "formal", "accessory", "wedding"]
  },

  // ==========================================
  // DRESSWEAR (8+ items)
  // ==========================================
  {
    id: "blazer",
    name: "Blazer",
    brand: "ParkerJoe",
    category: "dresswear",
    price: 165,
    memberPrice: 145,
    description: "Sharp blazer for dressy occasions and school events. Tailored fit with quality construction for a polished, sophisticated look.",
    features: [
      "Polyester-rayon blend",
      "Fully lined interior",
      "Two-button closure",
      "Chest welt pocket",
      "Front flap pockets"
    ],
    images: ["/products/blazer-1.jpg", "/products/blazer-2.jpg"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    colors: [
      { name: "Navy", hex: "#1e3a5f" },
      { name: "Gray", hex: "#808080" }
    ],
    inStock: true,
    rating: 4.8,
    reviewCount: 156,
    tags: ["blazer", "jacket", "formal", "school"]
  },
  {
    id: "suit-set",
    name: "Suit Set",
    brand: "ParkerJoe",
    category: "dresswear",
    price: 245,
    memberPrice: 215,
    description: "Complete two-piece suit set including jacket and matching trousers. Perfect for weddings, religious ceremonies, and formal events.",
    features: [
      "Two-piece complete outfit",
      "Single-breasted jacket",
      "Flat front pants",
      "Adjustable waist",
      "Matching tie included"
    ],
    images: ["/products/suit-set-1.jpg", "/products/suit-set-2.jpg"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    colors: [
      { name: "Navy", hex: "#1e3a5f" },
      { name: "Charcoal", hex: "#36454f" },
      { name: "Black", hex: "#000000" }
    ],
    inStock: true,
    rating: 4.9,
    reviewCount: 203,
    tags: ["suit", "formal", "wedding", "complete"]
  },
  {
    id: "dress-vest",
    name: "Dress Vest",
    brand: "ParkerJoe",
    category: "dresswear",
    price: 65,
    memberPrice: 56,
    description: "Formal dress vest perfect for three-piece suit looks or wearing separately. Adjustable back strap for a custom fit.",
    features: [
      "Polyester fabric",
      "V-neckline",
      "Five-button front",
      "Adjustable back strap",
      "Fully lined"
    ],
    images: ["/products/vest-1.jpg", "/products/vest-2.jpg"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    colors: [
      { name: "Navy", hex: "#1e3a5f" },
      { name: "Black", hex: "#000000" },
      { name: "Gray", hex: "#808080" }
    ],
    inStock: true,
    rating: 4.7,
    reviewCount: 134,
    tags: ["vest", "formal", "three-piece", "dress"]
  },
  {
    id: "dress-shirt-white",
    name: "Dress Shirt",
    brand: "ParkerJoe",
    category: "dresswear",
    price: 58,
    memberPrice: 50,
    description: "Crisp white dress shirt essential for formal occasions. Quality cotton with a smooth finish and wrinkle-resistant treatment.",
    features: [
      "Premium cotton poplin",
      "Spread collar",
      "French cuff option",
      "Wrinkle-resistant",
      "Shirttail hem"
    ],
    images: ["/products/dress-shirt-1.jpg", "/products/dress-shirt-2.jpg"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    colors: [
      { name: "White", hex: "#ffffff" },
      { name: "Light Blue", hex: "#add8e6" }
    ],
    inStock: true,
    rating: 4.8,
    reviewCount: 267,
    tags: ["shirt", "dress", "formal", "white"]
  },
  {
    id: "tuxedo-set",
    name: "Tuxedo Set",
    brand: "ParkerJoe",
    category: "dresswear",
    price: 295,
    memberPrice: 265,
    description: "Complete tuxedo set for the most special occasions. Includes jacket with satin lapels, trousers, bow tie, and cummerbund.",
    features: [
      "Complete four-piece set",
      "Satin notch lapels",
      "Satin stripe trousers",
      "Pre-tied bow tie",
      "Matching cummerbund"
    ],
    images: ["/products/tuxedo-1.jpg", "/products/tuxedo-2.jpg"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    colors: [
      { name: "Black", hex: "#000000" }
    ],
    inStock: true,
    rating: 4.9,
    reviewCount: 89,
    tags: ["tuxedo", "formal", "black tie", "special occasion"]
  },
  {
    id: "communion-outfit",
    name: "Communion Outfit",
    brand: "ParkerJoe",
    category: "dresswear",
    price: 185,
    memberPrice: 165,
    description: "Special religious occasion outfit for First Communion. Traditional styling with quality details for this important milestone.",
    features: [
      "White complete outfit",
      "Satin trim details",
      "Religious occasion appropriate",
      "Includes accessories",
      "Traditional styling"
    ],
    images: ["/products/communion-1.jpg", "/products/communion-2.jpg"],
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: [
      { name: "White", hex: "#ffffff" }
    ],
    inStock: true,
    rating: 4.9,
    reviewCount: 67,
    tags: ["communion", "religious", "formal", "white"]
  },
  {
    id: "page-boy-suit",
    name: "Page Boy Suit",
    brand: "ParkerJoe",
    category: "dresswear",
    price: 225,
    memberPrice: 195,
    description: "Charming page boy suit for weddings. Complete outfit designed for the youngest members of the wedding party.",
    features: [
      "Three-piece set",
      "Miniature suit styling",
      "Wedding appropriate",
      "Adjustable fit",
      "Matching accessories"
    ],
    images: ["/products/page-boy-1.jpg", "/products/page-boy-2.jpg"],
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: [
      { name: "Navy", hex: "#1e3a5f" },
      { name: "Gray", hex: "#808080" },
      { name: "Black", hex: "#000000" }
    ],
    inStock: true,
    rating: 4.8,
    reviewCount: 112,
    tags: ["page boy", "wedding", "formal", "ceremony"]
  },
  {
    id: "christening-gown",
    name: "Christening Gown",
    brand: "ParkerJoe",
    category: "dresswear",
    price: 165,
    memberPrice: 145,
    description: "Traditional christening gown for this sacred ceremony. Delicate details and heirloom quality construction.",
    features: [
      "Traditional white gown",
      "Delicate embroidery",
      "Heirloom quality",
      "Includes bonnet",
      "Cotton and lace details"
    ],
    images: ["/products/christening-1.jpg", "/products/christening-2.jpg"],
    sizes: ["0-3M", "3-6M", "6-12M"],
    colors: [
      { name: "White", hex: "#ffffff" }
    ],
    inStock: true,
    rating: 4.9,
    reviewCount: 45,
    tags: ["christening", "religious", "traditional", "ceremony"]
  },

  // ==========================================
  // WESTERN (5+ items)
  // ==========================================
  {
    id: "western-boots",
    name: "Western Boots",
    brand: "ParkerJoe",
    category: "western",
    price: 145,
    memberPrice: 125,
    description: "Authentic cowboy boots with traditional western styling. Quality leather construction with decorative stitching for the young cowboy.",
    features: [
      "Genuine leather upper",
      "Traditional cowboy styling",
      "Decorative stitching",
      "Leather sole",
      "Pull tabs for easy on"
    ],
    images: ["/products/western-boots-1.jpg", "/products/western-boots-2.jpg"],
    sizes: ["11", "12", "13", "1", "2", "3", "4", "5", "6"],
    colors: [
      { name: "Tan", hex: "#d2b48c" },
      { name: "Brown", hex: "#8b4513" },
      { name: "Black", hex: "#000000" }
    ],
    inStock: true,
    rating: 4.8,
    reviewCount: 156,
    tags: ["boots", "western", "cowboy", "leather"]
  },
  {
    id: "western-shirt",
    name: "Western Shirt",
    brand: "ParkerJoe",
    category: "western",
    price: 68,
    memberPrice: 58,
    description: "Classic plaid western shirt with pearl snap buttons. Traditional styling for country events or everyday cowboy flair.",
    features: [
      "Cotton flannel fabric",
      "Pearl snap buttons",
      "Western yokes",
      "Snap cuffs",
      "Pointed collar"
    ],
    images: ["/products/western-shirt-1.jpg", "/products/western-shirt-2.jpg"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    colors: [
      { name: "Red Plaid", hex: "#b22222" },
      { name: "Blue Plaid", hex: "#4682b4" },
      { name: "Green Plaid", hex: "#228b22" }
    ],
    inStock: true,
    rating: 4.7,
    reviewCount: 134,
    tags: ["shirt", "western", "plaid", "cowboy"]
  },
  {
    id: "western-belt",
    name: "Belt with Buckle",
    brand: "ParkerJoe",
    category: "western",
    price: 55,
    memberPrice: 48,
    description: "Western leather belt with decorative engraved buckle. Classic cowboy styling for completing the western look.",
    features: [
      "Genuine leather belt",
      "Engraved metal buckle",
      "Western styling",
      "Adjustable fit",
      "Embossed details"
    ],
    images: ["/products/western-belt-1.jpg", "/products/western-belt-2.jpg"],
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Brown", hex: "#8b4513" },
      { name: "Black", hex: "#000000" },
      { name: "Tan", hex: "#d2b48c" }
    ],
    inStock: true,
    rating: 4.6,
    reviewCount: 89,
    tags: ["belt", "western", "buckle", "cowboy"]
  },
  {
    id: "western-hat",
    name: "Western Hat",
    brand: "ParkerJoe",
    category: "western",
    price: 48,
    memberPrice: 42,
    description: "Traditional felt western hat for the complete cowboy look. Durable construction with classic cattleman crown styling.",
    features: [
      "Wool felt construction",
      "Classic cattleman crown",
      "Shapeable brim",
      "Inner sweatband",
      "Decorative hatband"
    ],
    images: ["/products/western-hat-1.jpg", "/products/western-hat-2.jpg"],
    sizes: ["S", "M", "L"],
    colors: [
      { name: "Tan", hex: "#d2b48c" },
      { name: "Black", hex: "#000000" },
      { name: "Brown", hex: "#8b4513" }
    ],
    inStock: true,
    rating: 4.8,
    reviewCount: 112,
    tags: ["hat", "western", "cowboy", "felt"]
  },
  {
    id: "bolo-tie",
    name: "Bolo Tie",
    brand: "ParkerJoe",
    category: "western",
    price: 38,
    memberPrice: 32,
    description: "Authentic western bolo tie with decorative silver-tone tips. Slide adjustment for perfect positioning.",
    features: [
      "Leather cord",
      "Silver-tone tips",
      "Slide adjustment",
      "Western styling",
      "Decorative centerpiece"
    ],
    images: ["/products/bolo-tie-1.jpg", "/products/bolo-tie-2.jpg"],
    sizes: ["One Size"],
    colors: [
      { name: "Silver", hex: "#c0c0c0" },
      { name: "Turquoise", hex: "#40e0d0" },
      { name: "Black", hex: "#000000" }
    ],
    inStock: true,
    rating: 4.5,
    reviewCount: 67,
    tags: ["bolo tie", "western", "accessory", "cowboy"]
  }
];

// Helper functions
export const getProductById = (id: string): Product | undefined => {
  return products.find((p) => p.id === id);
};

export const getProductsByCategory = (category: string): Product[] => {
  return products.filter((p) => p.category === category);
};

export const getProductsByTag = (tag: string): Product[] => {
  return products.filter((p) => p.tags.includes(tag));
};

export const getInStockProducts = (): Product[] => {
  return products.filter((p) => p.inStock);
};

export const getExclusiveProducts = (): Product[] => {
  return products.filter((p) => p.exclusive);
};

export const getProductsByPriceRange = (min: number, max: number): Product[] => {
  return products.filter((p) => p.price >= min && p.price <= max);
};

export const getRelatedProducts = (productId: string, limit: number = 4): Product[] => {
  const product = getProductById(productId);
  if (!product) return [];
  
  return products
    .filter((p) => p.id !== productId && p.category === product.category)
    .slice(0, limit);
};

export const categories = [
  { id: "apparel", name: "Apparel", icon: "Shirt", count: 15 },
  { id: "shoes", name: "Shoes", icon: "Footprints", count: 10 },
  { id: "accessories", name: "Accessories", icon: "Glasses", count: 15 },
  { id: "dresswear", name: "Dresswear", icon: "User", count: 8 },
  { id: "western", name: "Western", icon: "Star", count: 5 }
] as const;

export const popularTags = [
  "formal",
  "casual",
  "school",
  "wedding",
  "summer",
  "winter",
  "leather",
  "cotton"
];
