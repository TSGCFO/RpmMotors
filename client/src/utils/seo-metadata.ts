interface PageMetadata {
  title: string;
  description: string;
  keywords: string;
}

export const pageMetadata: Record<string, PageMetadata> = {
  home: {
    title: "RPM Auto: Luxury & Exotic Cars Dealer | Vaughan ON | 50+ Premium Vehicles",
    description: "Discover 50+ luxury vehicles at RPM Auto Vaughan. Ferrari, Lamborghini, Porsche & more. Expert financing, trade-ins welcome. Call (647) 550-9590 for exclusive deals!",
    keywords: "luxury cars dealer Vaughan, exotic cars Toronto, premium vehicles, Ferrari dealer, Lamborghini, Porsche, BMW M, Mercedes AMG, car financing, trade-in"
  },
  inventory: {
    title: "Luxury Car Inventory | 50+ Premium Vehicles | RPM Auto Vaughan",
    description: "Browse 50+ hand-selected luxury vehicles. Latest inventory updated daily. Competitive pricing, certified pre-owned options. Schedule test drive: (647) 550-9590",
    keywords: "luxury car inventory, exotic cars for sale, premium vehicles Vaughan, certified pre-owned, sports cars, SUVs, test drive"
  },
  services: {
    title: "Premium Auto Services | Financing, Trade-ins, Warranties | RPM Auto",
    description: "Complete luxury car services: Custom financing from 4.99%, competitive trade-ins, extended warranties, vehicle sourcing. Expert team with 10+ years experience.",
    keywords: "car financing Vaughan, trade-in value, extended warranty, vehicle sourcing, consignment, luxury car services"
  },
  about: {
    title: "About RPM Auto | 10+ Years of Excellence | Luxury Car Experts",
    description: "Family-owned luxury dealership since 2013. 500+ satisfied customers, A+ BBB rating. Meet our certified team. Visit our Vaughan showroom by appointment.",
    keywords: "about RPM Auto, luxury car dealership, Vaughan auto dealer, family owned, certified team, customer testimonials"
  },
  contact: {
    title: "Contact RPM Auto Vaughan | Directions, Hours | (647) 550-9590",
    description: "Visit RPM Auto in Vaughan. Open Mon-Sat, Sunday by appointment. Quick responses guaranteed. Get directions, book appointments, or call (647) 550-9590.",
    keywords: "contact RPM Auto, dealership hours, directions Vaughan, book appointment, phone number, email, location"
  },
  gallery: {
    title: "Luxury Car Gallery | 100+ Photos | RPM Auto Showroom & Inventory",
    description: "View 100+ high-resolution photos of our luxury vehicles and showroom. Virtual tour available. See our current inventory in stunning detail.",
    keywords: "luxury car photos, vehicle gallery, showroom tour, car pictures, exotic car images"
  }
};

// Category-specific metadata
export const categoryMetadata: Record<string, PageMetadata> = {
  'sports-cars': {
    title: "Sports Cars for Sale | Porsche, Ferrari, McLaren | RPM Auto",
    description: "Premium sports cars in stock. 0-60 in under 4 seconds. Porsche 911, Ferrari 488, McLaren 720S & more. Financing available. Test drive today!",
    keywords: "sports cars for sale, Porsche 911, Ferrari 488, McLaren 720S, high performance, track cars"
  },
  'luxury-sedans': {
    title: "Luxury Sedans | Mercedes S-Class, BMW 7 Series | RPM Auto",
    description: "Executive sedans with cutting-edge technology. Mercedes S-Class, BMW 7 Series, Audi A8. Comfort meets performance. Lease options available.",
    keywords: "luxury sedans, Mercedes S-Class, BMW 7 Series, Audi A8, executive cars, comfortable sedans"
  },
  'suvs-crossovers': {
    title: "Luxury SUVs & Crossovers | Range Rover, Bentley, Porsche | RPM Auto",
    description: "Premium SUVs combining luxury & capability. Range Rover, Bentley Bentayga, Porsche Cayenne in stock. 7-seater options. All-weather performance.",
    keywords: "luxury SUV, Range Rover, Bentley Bentayga, Porsche Cayenne, 7 seater SUV, crossover"
  },
  'exotic-collection': {
    title: "Exotic Cars Collection | Ultra-Rare Supercars | RPM Auto",
    description: "Exclusive exotic vehicles for discerning collectors. Limited editions, one-of-a-kind builds. Lamborghini, Ferrari, Bugatti. Investment-grade automobiles.",
    keywords: "exotic cars, supercars, Lamborghini, Bugatti, rare cars, collector vehicles, limited edition"
  }
};