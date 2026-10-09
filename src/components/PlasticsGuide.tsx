import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  Search,
  Filter,
  Recycle,
  Sprout,
  AlertTriangle,
  Info,
  Clock,
  Sparkles,
  CheckCircle2,
  Trash2,
  Layers,
  Zap,
  Package,
} from 'lucide-react';

interface WasteItemGuide {
  id: string;
  name: string;
  category: 'plastic' | 'organic' | 'paper' | 'glass_metal' | 'hazardous' | 'ewaste';
  categoryLabel: string;
  binColor: 'green' | 'blue' | 'red' | 'black';
  binColorName: string;
  binCategory: string;
  binEmoji: string;
  recyclabilityScore: number;
  recyclabilityStatus: string;
  curbsideAcceptance: 'Curbside Staple' | 'Store / Drop-Off' | 'Specialty Facility' | 'Trash Only';
  commonUses: string;
  prepProtocol: string;
  decompositionTime: string;
  destination: string;
  environmentalTip: string;
  resinCode?: number;
}

const ALL_WASTE_ITEMS: WasteItemGuide[] = [
  // --- 1. PLASTICS & POLYMERS ---
  {
    id: 'p-1',
    name: 'PET / PETE (#1) Polyethylene Terephthalate',
    category: 'plastic',
    categoryLabel: 'Plastic Polymer',
    resinCode: 1,
    binColor: 'blue',
    binColorName: 'Blue',
    binCategory: 'Dry Recyclables',
    binEmoji: '🔵',
    recyclabilityScore: 96,
    recyclabilityStatus: 'Widely Recycled Curbside',
    curbsideAcceptance: 'Curbside Staple',
    commonUses: 'Water bottles, soda bottles, salad dressing bottles, berry punnets.',
    prepProtocol: 'Empty all liquids. Quick water swirl. Leave cap on. Place loose in bin (never bagged).',
    decompositionTime: '450 years',
    destination: 'Processed into polyester fleece jackets, tote bags, and new food-grade bottles.',
    environmentalTip: 'Infinitely recyclable if cleanly sorted; avoid exposing to high temperatures to prevent antimony leaching.',
  },
  {
    id: 'p-2',
    name: 'HDPE (#2) High-Density Polyethylene',
    category: 'plastic',
    categoryLabel: 'Plastic Polymer',
    resinCode: 2,
    binColor: 'blue',
    binColorName: 'Blue',
    binCategory: 'Dry Recyclables',
    binEmoji: '🔵',
    recyclabilityScore: 94,
    recyclabilityStatus: 'High Market Demand',
    curbsideAcceptance: 'Curbside Staple',
    commonUses: 'Milk jugs, detergent tubs, shampoo containers, bleach bottles.',
    prepProtocol: 'Rinse out soap or dairy film. Caps may stay screwed on. Flattening saves truck emissions.',
    decompositionTime: '100–300 years',
    destination: 'Pelletized into plastic lumber, outdoor playground sets, and drainage pipes.',
    environmentalTip: 'One of the safest, most stable polymers with minimal chemical migration into food or groundwater.',
  },
  {
    id: 'p-3',
    name: 'PVC (#3) Polyvinyl Chloride',
    category: 'plastic',
    categoryLabel: 'Plastic Polymer',
    resinCode: 3,
    binColor: 'black',
    binColorName: 'Black / Grey',
    binCategory: 'General / Construction',
    binEmoji: '⚫',
    recyclabilityScore: 18,
    recyclabilityStatus: 'Hazardous to Recycled Batches',
    curbsideAcceptance: 'Specialty Facility',
    commonUses: 'Plumbing conduits, vinyl siding, blister pill packaging, shower curtains.',
    prepProtocol: 'Do NOT place into standard curbside recycling. Transport to municipal construction depot.',
    decompositionTime: '500+ years',
    destination: 'Mechanical downcycling into industrial pipe collars or secure landfill.',
    environmentalTip: 'Releases harmful dioxins and hydrochloric acid when incinerated. Minimize single-use vinyl purchases.',
  },
  {
    id: 'p-4',
    name: 'LDPE (#4) Low-Density Polyethylene',
    category: 'plastic',
    categoryLabel: 'Plastic Polymer',
    resinCode: 4,
    binColor: 'blue',
    binColorName: 'Blue',
    binCategory: 'Soft Plastics Drop-off',
    binEmoji: '🔵',
    recyclabilityScore: 62,
    recyclabilityStatus: 'Supermarket Takeback Only',
    curbsideAcceptance: 'Store / Drop-Off',
    commonUses: 'Bread bags, bubble wrap, dry cleaning bags, six-pack beverage rings.',
    prepProtocol: 'Must be completely dry and clean. Collect inside one bag and take to supermarket soft plastic bins.',
    decompositionTime: '50–200 years',
    destination: 'Reprocessed into composite decking planks, agricultural film, and trash can liners.',
    environmentalTip: 'Never toss loose soft plastic bags in curbside bins — they wrap around MRF sorting drums and shut down plants.',
  },
  {
    id: 'p-5',
    name: 'PP (#5) Polypropylene',
    category: 'plastic',
    categoryLabel: 'Plastic Polymer',
    resinCode: 5,
    binColor: 'blue',
    binColorName: 'Blue',
    binCategory: 'Dry Recyclables',
    binEmoji: '🔵',
    recyclabilityScore: 88,
    recyclabilityStatus: 'Accepted in Modern Facilities',
    curbsideAcceptance: 'Curbside Staple',
    commonUses: 'Yogurt tubs, margarine containers, medicine bottles, reusable lunch boxes.',
    prepProtocol: 'Scrape food residues cleanly with a spatula. Dishwasher safe for repeated domestic food reuse.',
    decompositionTime: '20–30 years',
    destination: 'Molded into auto battery cases, heavy-duty brooms, storage bins, and bicycle racks.',
    environmentalTip: 'Very heat resistant and inert. Excellent candidate for repeated upcycling before eventual recycling.',
  },
  {
    id: 'p-6',
    name: 'PS (#6) Polystyrene / Styrofoam',
    category: 'plastic',
    categoryLabel: 'Plastic Polymer',
    resinCode: 6,
    binColor: 'black',
    binColorName: 'Black / Grey',
    binCategory: 'General Non-Recyclable',
    binEmoji: '⚫',
    recyclabilityScore: 10,
    recyclabilityStatus: 'Contaminant in Curbside Streams',
    curbsideAcceptance: 'Trash Only',
    commonUses: 'Styrofoam coffee cups, takeout clamshells, white electronic packaging foam blocks.',
    prepProtocol: 'Place directly in black general refuse bin. If unsoiled packaging block, check for dedicated EPS foam drop-offs.',
    decompositionTime: '500+ years',
    destination: 'Engineered landfill containment or thermal waste-to-energy recovery.',
    environmentalTip: 'Leaches styrene monomer into hot greasy liquids. 95% air by volume, making shipping economics prohibitive.',
  },
  {
    id: 'p-7',
    name: 'OTHER (#7) Polycarbonate & Multi-Layer Laminates',
    category: 'plastic',
    categoryLabel: 'Plastic Polymer',
    resinCode: 7,
    binColor: 'black',
    binColorName: 'Black / Grey',
    binCategory: 'General Waste',
    binEmoji: '⚫',
    recyclabilityScore: 15,
    recyclabilityStatus: 'Non-Standard Polymer',
    curbsideAcceptance: 'Trash Only',
    commonUses: 'Layered foil chip packets, baby bottles, optical discs, PLA corn bioplastics.',
    prepProtocol: 'Standard #7 chips and composite pouches go to black bin. Certified industrial compostable PLA must go to commercial compost.',
    decompositionTime: '1,000 years',
    destination: 'Landfill disposal; certified PLA goes to aerobic municipal industrial composting reactors.',
    environmentalTip: 'Never mix PLA corn plastics with PET #1 bottles; even 0.1% PLA contaminates an entire recycled PET bale.',
  },

  // --- 2. ORGANIC & VEGETABLE BIOMASS ---
  {
    id: 'o-1',
    name: 'Vegetable & Fruit Peels (Carrot, Banana, Citrus, Potato)',
    category: 'organic',
    categoryLabel: 'Organic Biomass',
    binColor: 'green',
    binColorName: 'Green',
    binCategory: 'Wet / Organic Waste',
    binEmoji: '🟢',
    recyclabilityScore: 98,
    recyclabilityStatus: '100% Biodegradable & Compostable',
    curbsideAcceptance: 'Curbside Staple',
    commonUses: 'Kitchen cooking waste, fruit rinds, vegetable trimmings.',
    prepProtocol: 'Place directly loose into green compost bin or home worm farm. Remove plastic PLU stickers first.',
    decompositionTime: '2 to 8 weeks',
    destination: 'Nutrient-rich humic compost for organic agriculture or anaerobic bio-methane electricity generator.',
    environmentalTip: 'Prevents potent methane formation in anaerobic landfills. 1 kg of food diverted avoids ~1.9 kg CO₂e greenhouse gas.',
  },
  {
    id: 'o-2',
    name: 'Coffee Grounds & Paper Tea Bags',
    category: 'organic',
    categoryLabel: 'Organic Biomass',
    binColor: 'green',
    binColorName: 'Green',
    binCategory: 'Wet / Organic Waste',
    binEmoji: '🟢',
    recyclabilityScore: 97,
    recyclabilityStatus: 'Nitrogen-Rich Compost Additive',
    curbsideAcceptance: 'Curbside Staple',
    commonUses: 'Espresso pucks, drip coffee grounds, herbal unbleached tea bags.',
    prepProtocol: 'Ensure tea bag strings and tags have no plastic staples or synthetic nylon mesh before composting.',
    decompositionTime: '1 to 3 weeks',
    destination: 'Soil conditioner; repels garden pests and balances nitrogen/carbon ratios in municipal compost piles.',
    environmentalTip: 'Excellent natural odor neutralizer and soil amendment high in potassium and phosphorus.',
  },
  {
    id: 'o-3',
    name: 'Cooked Food Leftovers, Rice, Bread & Pasta',
    category: 'organic',
    categoryLabel: 'Organic Biomass',
    binColor: 'green',
    binColorName: 'Green',
    binCategory: 'Wet / Organic Waste',
    binEmoji: '🟢',
    recyclabilityScore: 95,
    recyclabilityStatus: 'Municipal Organics (FOGO)',
    curbsideAcceptance: 'Curbside Staple',
    commonUses: 'Stale bread, table scraps, cooked grains, sauces, vegetable stews.',
    prepProtocol: 'Collect in a breathable kitchen counter caddy. Wrap in single-ply newspaper or certified BPI compostable liner.',
    decompositionTime: '2 to 4 weeks',
    destination: 'Municipal industrial windrow composting systems reaching 60°C to destroy pathogens.',
    environmentalTip: 'Plan meals carefully to minimize waste; in municipal FOGO bins, table scraps transform into community fertilizer.',
  },
  {
    id: 'o-4',
    name: 'Garden Clippings, Dry Leaves & Twigs',
    category: 'organic',
    categoryLabel: 'Organic Biomass',
    binColor: 'green',
    binColorName: 'Green',
    binCategory: 'Wet / Organic Waste',
    binEmoji: '🟢',
    recyclabilityScore: 96,
    recyclabilityStatus: 'Carbon-Rich Biomass',
    curbsideAcceptance: 'Curbside Staple',
    commonUses: 'Lawn mower grass clippings, pruned branches, fallen autumn foliage.',
    prepProtocol: 'Place loose into green bin. Cut large branches under 50cm. Do NOT tie with plastic twine.',
    decompositionTime: '1 to 6 months',
    destination: 'Municipal bulk mulch and soil erosion control cover for urban parks.',
    environmentalTip: 'Leaves and branches represent the essential carbon brown layer to balance wet green food waste.',
  },

  // --- 3. PAPER & CARDBOARD ---
  {
    id: 'pc-1',
    name: 'Corrugated Shipping Boxes & Kraft Cartons',
    category: 'paper',
    categoryLabel: 'Paper & Cardboard',
    binColor: 'blue',
    binColorName: 'Blue',
    binCategory: 'Dry Recyclables',
    binEmoji: '🔵',
    recyclabilityScore: 95,
    recyclabilityStatus: 'Highest Market Commodity Value',
    curbsideAcceptance: 'Curbside Staple',
    commonUses: 'E-commerce shipping boxes, appliance cartons, cereal boxes.',
    prepProtocol: 'Remove plastic bubble wrap. Flatten boxes completely to maximize collection bin space.',
    decompositionTime: '2 to 5 months',
    destination: 'Repulped at paper mills to manufacture new cardboard boxes and paper packaging up to 7 cycles.',
    environmentalTip: 'Recycling 1 ton of cardboard saves 17 mature trees, 7,000 gallons of water, and 4,000 kWh of energy.',
  },
  {
    id: 'pc-2',
    name: 'Office Paper, Envelopes & Notebooks',
    category: 'paper',
    categoryLabel: 'Paper & Cardboard',
    binColor: 'blue',
    binColorName: 'Blue',
    binCategory: 'Dry Recyclables',
    binEmoji: '🔵',
    recyclabilityScore: 92,
    recyclabilityStatus: 'Widely Recycled',
    curbsideAcceptance: 'Curbside Staple',
    commonUses: 'Printer paper, mail, bills, unlaminated brochures, lined notebook pages.',
    prepProtocol: 'Keep paper dry. Window envelope plastic film and staples are removed automatically during mill pulping.',
    decompositionTime: '2 to 6 weeks',
    destination: 'De-inked and bleached into tissue paper, toilet rolls, and new recycled stationery.',
    environmentalTip: 'Never shred paper unless legally required for confidentiality; shredded paper fibers are too short to recycle.',
  },
  {
    id: 'pc-3',
    name: 'Greasy Takeout Pizza Boxes',
    category: 'paper',
    categoryLabel: 'Composite Paper',
    binColor: 'green',
    binColorName: 'Green or Black',
    binCategory: 'Soiled Paper vs Clean Lid',
    binEmoji: '🟢',
    recyclabilityScore: 50,
    recyclabilityStatus: 'Split Stream Protocol',
    curbsideAcceptance: 'Curbside Staple',
    commonUses: 'Hot food delivery pizza packaging.',
    prepProtocol: 'Tear in half: Clean unsoiled top goes to Blue Bin. Greasy, cheese-stained bottom goes to Green Organics Bin.',
    decompositionTime: '2 months',
    destination: 'Clean half repulped into cardboard; greasy half composted into municipal farm soil.',
    environmentalTip: 'Food oil cannot be separated from paper fibers during repulping and causes entire paper batches to be discarded.',
  },
  {
    id: 'pc-4',
    name: 'Aseptic Beverage Cartons (Tetra Pak)',
    category: 'paper',
    categoryLabel: 'Composite Packaging',
    binColor: 'blue',
    binColorName: 'Blue',
    binCategory: 'Dry Recyclables',
    binEmoji: '🔵',
    recyclabilityScore: 78,
    recyclabilityStatus: 'Specialized Hydrapulping',
    curbsideAcceptance: 'Curbside Staple',
    commonUses: 'Soy milk, almond milk, chicken broth, shelf-stable juice boxes.',
    prepProtocol: 'Empty completely. Push plastic straw inside or screw cap back on. Flatten flat.',
    decompositionTime: '5 years',
    destination: 'High-consistency hydrapulpers extract paper fibers for paperboard; poly-aluminum film made into roof tiles.',
    environmentalTip: '75% paperboard by weight with ultra-thin aluminum foil and polyethylene barrier layers.',
  },

  // --- 4. GLASS & METALS ---
  {
    id: 'gm-1',
    name: 'Aluminum Beverage Cans',
    category: 'glass_metal',
    categoryLabel: 'Metals & Alloys',
    binColor: 'blue',
    binColorName: 'Blue',
    binCategory: 'Dry Recyclables',
    binEmoji: '🔵',
    recyclabilityScore: 99,
    recyclabilityStatus: 'Closed-Loop Circular Champion',
    curbsideAcceptance: 'Curbside Staple',
    commonUses: 'Soda cans, beer cans, sparkling water cans, energy drinks.',
    prepProtocol: 'Rinse with leftover water. Keep tab attached. Do NOT crush if your municipality uses optical sorters.',
    decompositionTime: '200–500 years',
    destination: 'Melted at 660°C and re-manufactured back on retail shelves as a new beverage can in 60 days.',
    environmentalTip: 'Recycling aluminum uses 95% less energy than smelting raw bauxite ore. Truly infinitely recyclable.',
  },
  {
    id: 'gm-2',
    name: 'Steel & Tin Food Cans',
    category: 'glass_metal',
    categoryLabel: 'Metals & Alloys',
    binColor: 'blue',
    binColorName: 'Blue',
    binCategory: 'Dry Recyclables',
    binEmoji: '🔵',
    recyclabilityScore: 97,
    recyclabilityStatus: 'Easily Sorted with Magnets',
    curbsideAcceptance: 'Curbside Staple',
    commonUses: 'Soup cans, canned beans, pet food cans, tomato paste tins.',
    prepProtocol: 'Swirl rinse with water. Place detached lid inside can and crimp rim slightly to protect sorters.',
    decompositionTime: '50–100 years',
    destination: 'Melted in basic oxygen electric arc furnaces into structural steel beams, cars, and new cans.',
    environmentalTip: 'Magnetic recovery makes steel the most reliably sorted recyclable item at municipal MRF facilities.',
  },
  {
    id: 'gm-3',
    name: 'Clear, Green & Amber Glass Bottles & Jars',
    category: 'glass_metal',
    categoryLabel: 'Glass & Silica',
    binColor: 'blue',
    binColorName: 'Blue',
    binCategory: 'Dry Recyclables',
    binEmoji: '🔵',
    recyclabilityScore: 98,
    recyclabilityStatus: '100% Infinitely Recyclable',
    curbsideAcceptance: 'Curbside Staple',
    commonUses: 'Pasta sauce jars, jam jars, wine bottles, olive oil bottles.',
    prepProtocol: 'Rinse cleanly. Metal twist lids can be left loose in the blue bin or screwed on.',
    decompositionTime: '1,000,000+ years',
    destination: 'Crushed into cullet, melted at glass furnaces to make new jars, or used as roadbed aggregate.',
    environmentalTip: 'Glass never degrades in chemical quality regardless of how many times it is melted and remolded.',
  },
  {
    id: 'gm-4',
    name: 'Clean Aluminum Baking Foil & Pie Tins',
    category: 'glass_metal',
    categoryLabel: 'Metals & Alloys',
    binColor: 'blue',
    binColorName: 'Blue',
    binCategory: 'Dry Recyclables',
    binEmoji: '🔵',
    recyclabilityScore: 90,
    recyclabilityStatus: 'High Scrap Metal Value',
    curbsideAcceptance: 'Curbside Staple',
    commonUses: 'Oven foil sheets, disposable pie pans, takeout food trays.',
    prepProtocol: 'Wipe off barbecue grease or cheese crumbs. Ball up multiple pieces into a ball at least 5cm wide.',
    decompositionTime: '400 years',
    destination: 'Secondary aluminum foundries for industrial cast alloy automotive components.',
    environmentalTip: 'Small flat foil shreds fall through sorting screen grates; balling it into a tennis-ball size prevents loss.',
  },

  // --- 5. HAZARDOUS, SANITARY & MEDICAL ---
  {
    id: 'h-1',
    name: 'Household Batteries (AA, AAA, 9V, Button Cells)',
    category: 'hazardous',
    categoryLabel: 'Hazardous Waste',
    binColor: 'red',
    binColorName: 'Red or Drop-off',
    binCategory: 'Hazardous / Chemical',
    binEmoji: '🔴',
    recyclabilityScore: 92,
    recyclabilityStatus: 'Specialty Collection Station',
    curbsideAcceptance: 'Specialty Facility',
    commonUses: 'Remote controls, wall clocks, flashlights, wireless mice.',
    prepProtocol: 'Tape battery terminal ends with clear sticky tape to prevent short circuits and fire risk. Take to depot.',
    decompositionTime: '100 years',
    destination: 'Pyrometallurgical and hydrometallurgical recovery of zinc, manganese, nickel, and steel.',
    environmentalTip: 'NEVER put batteries in curbside recycling or trash. Crushed batteries spark truck fires and leach heavy metals.',
  },
  {
    id: 'h-2',
    name: 'Household Paint Cans & Wood Stains',
    category: 'hazardous',
    categoryLabel: 'Hazardous Waste',
    binColor: 'red',
    binColorName: 'Red',
    binCategory: 'Hazardous / Chemical',
    binEmoji: '🔴',
    recyclabilityScore: 80,
    recyclabilityStatus: 'Municipal Chemical Round-Up',
    curbsideAcceptance: 'Specialty Facility',
    commonUses: 'Acrylic paints, oil-based stains, primers, clear wood lacquers.',
    prepProtocol: 'If liquid remains, seal lid tightly and transport to hazardous waste depot. If bone dry, steel can may be recycled.',
    decompositionTime: 'Indefinite',
    destination: 'Latex paint is blended into recycled community paint; oil bases used as fuel in cement kilns.',
    environmentalTip: 'Pouring paint down household sinks or storm drains poisons aquatic ecosystems and municipal sewage bacteria.',
  },
  {
    id: 'h-3',
    name: 'Sanitary Waste, Diapers & Medical Dressings',
    category: 'hazardous',
    categoryLabel: 'Sanitary Waste',
    binColor: 'red',
    binColorName: 'Red or Black',
    binCategory: 'Sanitary / Biohazard',
    binEmoji: '🔴',
    recyclabilityScore: 0,
    recyclabilityStatus: 'Non-Recyclable Biohazard',
    curbsideAcceptance: 'Trash Only',
    commonUses: 'Baby diapers, feminine hygiene products, bandages, cotton swabs.',
    prepProtocol: 'Wrap securely in newspaper or sanitary disposal pouch before placing into red/black bin.',
    decompositionTime: '450–500 years',
    destination: 'High-temperature thermal incineration at licensed medical waste facilities or lined sanitary landfill.',
    environmentalTip: 'Never flush down toilets — causes fatbergs and sewer blockages. High-temperature destruction eliminates biological pathogens.',
  },

  // --- 6. E-WASTE & ELECTRONICS ---
  {
    id: 'e-1',
    name: 'Smartphones, Tablets & Circuit Boards',
    category: 'ewaste',
    categoryLabel: 'Electronic E-Waste',
    binColor: 'black',
    binColorName: 'Black / E-Waste Station',
    binCategory: 'Specialty E-Waste',
    binEmoji: '⚫',
    recyclabilityScore: 94,
    recyclabilityStatus: 'Precious Metals Recovery',
    curbsideAcceptance: 'Specialty Facility',
    commonUses: 'Old mobile phones, computer motherboards, tablets, handheld game consoles.',
    prepProtocol: 'Perform factory reset to wipe data. Remove SIM & microSD. Take to certified e-waste drop-off counter.',
    decompositionTime: '1,000+ years',
    destination: 'Smelters recover gold, silver, palladium, copper, and cobalt for re-entry into electronics manufacturing.',
    environmentalTip: '1 ton of circuit boards contains 40 to 800 times more gold than 1 ton of mined gold ore.',
  },
  {
    id: 'e-2',
    name: 'Power Cables, USB Cords & Copper Wiring',
    category: 'ewaste',
    categoryLabel: 'Electronic E-Waste',
    binColor: 'black',
    binColorName: 'Black / E-Waste Station',
    binCategory: 'Specialty E-Waste',
    binEmoji: '⚫',
    recyclabilityScore: 92,
    recyclabilityStatus: 'High Scrap Copper Value',
    curbsideAcceptance: 'Specialty Facility',
    commonUses: 'Lightning cords, USB-C chargers, extension cords, computer power supplies.',
    prepProtocol: 'Do not toss in curbside bin (they tangle equipment). Gather and deliver to electronics drop-off box.',
    decompositionTime: '500 years',
    destination: 'Stripped into raw copper granules and PVC insulation beads for electrical infrastructure.',
    environmentalTip: 'Known as "tanglers" in recycling facilities — cables wrap around conveyor shafts causing costly operational shutdowns.',
  },
  {
    id: 'e-3',
    name: 'Compact Fluorescent Lamps (CFLs) & Fluorescent Tubes',
    category: 'ewaste',
    categoryLabel: 'Hazardous E-Waste',
    binColor: 'red',
    binColorName: 'Red or Depot',
    binCategory: 'Hazardous E-Waste',
    binEmoji: '🔴',
    recyclabilityScore: 89,
    recyclabilityStatus: 'Mercury Recovery Program',
    curbsideAcceptance: 'Specialty Facility',
    commonUses: 'Spiral CFL lightbulbs, long commercial ceiling tubes.',
    prepProtocol: 'Handle gently without breaking. Wrap in bubble sleeve and take to retail hardware takeback kiosk.',
    decompositionTime: 'Indefinite',
    destination: 'Vacuum distillation captures toxic mercury; glass and aluminum end caps are cleaned and recycled.',
    environmentalTip: 'Each CFL bulb contains 4mg of toxic mercury vapor. Never break or throw in household trash cans.',
  },
];

const CATEGORY_TABS = [
  { id: 'all', label: 'All Items & Waste Types', count: ALL_WASTE_ITEMS.length },
  { id: 'organic', label: '🟢 Organic & Vegetable', count: ALL_WASTE_ITEMS.filter((i) => i.category === 'organic').length },
  { id: 'plastic', label: '🔵 Plastics (#1 - #7)', count: ALL_WASTE_ITEMS.filter((i) => i.category === 'plastic').length },
  { id: 'paper', label: '🔵 Paper & Cardboard', count: ALL_WASTE_ITEMS.filter((i) => i.category === 'paper').length },
  { id: 'glass_metal', label: '🔵 Glass & Metals', count: ALL_WASTE_ITEMS.filter((i) => i.category === 'glass_metal').length },
  { id: 'hazardous', label: '🔴 Hazardous & Sanitary', count: ALL_WASTE_ITEMS.filter((i) => i.category === 'hazardous').length },
  { id: 'ewaste', label: '⚫ E-Waste & Specialty', count: ALL_WASTE_ITEMS.filter((i) => i.category === 'ewaste').length },
];

export const PlasticsGuide: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedBinFilter, setSelectedBinFilter] = useState<'all' | 'green' | 'blue' | 'red' | 'black'>('all');

  const filteredItems = useMemo(() => {
    return ALL_WASTE_ITEMS.filter((item) => {
      // Category filter
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }
      // Bin color filter
      if (selectedBinFilter !== 'all' && item.binColor !== selectedBinFilter) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(query);
        const matchesUses = item.commonUses.toLowerCase().includes(query);
        const matchesCategory = item.categoryLabel.toLowerCase().includes(query);
        const matchesProtocol = item.prepProtocol.toLowerCase().includes(query);
        return matchesName || matchesUses || matchesCategory || matchesProtocol;
      }
      return true;
    });
  }, [selectedCategory, selectedBinFilter, searchQuery]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Banner */}
      <div className="bg-[#4F7942] text-white rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-xs">
        {/* Geometric Balance circles background */}
        <div className="hidden sm:flex absolute -right-6 -bottom-6 w-48 h-48 border-4 border-white/20 rounded-full items-center justify-center pointer-events-none">
          <div className="w-32 h-32 border-2 border-white/30 rounded-full rotate-45 flex items-center justify-center">
            <div className="w-16 h-16 border border-white/40 rounded-full"></div>
          </div>
        </div>

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-white text-[10px] font-bold uppercase tracking-widest mb-3 border border-white/20">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Complete Municipal Waste &amp; Material Directory</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-['Space_Grotesk']">
            All Items &amp; Waste Types Reference
          </h2>
          <p className="text-white/85 text-xs sm:text-sm mt-2 leading-relaxed">
            Search, filter, and inspect every waste material stream: from organic vegetable biomass and paper packaging to #1–#7 polymer plastics, metals, glass, household chemicals, and electronic e-waste.
          </p>

          {/* Quick Stats Ticker */}
          <div className="flex flex-wrap items-center gap-2.5 mt-4 pt-3 border-t border-white/20 text-xs text-white/90">
            <span className="font-semibold">🟢 Green Bin: Organic Biomass</span>
            <span>&middot;</span>
            <span className="font-semibold">🔵 Blue Bin: Recyclables</span>
            <span>&middot;</span>
            <span className="font-semibold">🔴 Red Bin: Hazardous</span>
            <span>&middot;</span>
            <span className="font-semibold">⚫ Black Bin: E-Waste &amp; Landfill</span>
          </div>
        </div>
      </div>

      {/* Search Bar & Municipal Bin Quick Filters */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#DDE3D9] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-[#7A8A7A] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search any waste item (e.g. carrot peel, PET bottle, pizza box, foil, battery, yogurt tub)..."
              className="w-full bg-[#F4F7F2] border border-[#DDE3D9] rounded-2xl pl-10 pr-4 py-2.5 text-xs text-[#1A241A] placeholder:text-[#7A8A7A] focus:outline-none focus:border-[#4F7942] focus:bg-white transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-[#7A8A7A] hover:text-[#1A241A] font-bold cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Municipal Bin Stream Filter Buttons */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto shrink-0 flex-wrap">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#7A8A7A] mr-1 hidden lg:inline">
              Bin Stream:
            </span>
            <button
              onClick={() => setSelectedBinFilter('all')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                selectedBinFilter === 'all'
                  ? 'bg-[#1A241A] text-white shadow-2xs'
                  : 'bg-[#F4F7F2] text-[#5C6B5C] border border-[#DDE3D9] hover:border-[#1A241A]'
              }`}
            >
              All Bins
            </button>
            <button
              onClick={() => setSelectedBinFilter('green')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                selectedBinFilter === 'green'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'bg-emerald-50 text-emerald-900 border border-emerald-200 hover:border-emerald-500'
              }`}
            >
              <span>🟢</span>
              <span>Green</span>
            </button>
            <button
              onClick={() => setSelectedBinFilter('blue')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                selectedBinFilter === 'blue'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-blue-50 text-blue-900 border border-blue-200 hover:border-blue-500'
              }`}
            >
              <span>🔵</span>
              <span>Blue</span>
            </button>
            <button
              onClick={() => setSelectedBinFilter('red')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                selectedBinFilter === 'red'
                  ? 'bg-rose-600 text-white shadow-2xs'
                  : 'bg-rose-50 text-rose-900 border border-rose-200 hover:border-rose-500'
              }`}
            >
              <span>🔴</span>
              <span>Red</span>
            </button>
            <button
              onClick={() => setSelectedBinFilter('black')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                selectedBinFilter === 'black'
                  ? 'bg-stone-800 text-white shadow-2xs'
                  : 'bg-stone-100 text-stone-900 border border-stone-300 hover:border-stone-800'
              }`}
            >
              <span>⚫</span>
              <span>Black</span>
            </button>
          </div>
        </div>

        {/* Category Pills Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pt-2 border-t border-[#DDE3D9]">
          {CATEGORY_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedCategory(tab.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                selectedCategory === tab.id
                  ? 'bg-[#4F7942] text-white shadow-xs'
                  : 'bg-[#F4F7F2] text-[#5C6B5C] border border-[#DDE3D9] hover:bg-[#E8EDE6] hover:text-[#1A241A]'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  selectedCategory === tab.id ? 'bg-white/25 text-white' : 'bg-white text-[#7A8A7A]'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Waste Items */}
      {filteredItems.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-[#DDE3D9] text-center space-y-3">
          <Package className="w-10 h-10 text-[#7A8A7A] mx-auto opacity-50" />
          <h3 className="font-bold text-base text-[#1A241A]">No Matching Waste Items Found</h3>
          <p className="text-xs text-[#5C6B5C] max-w-md mx-auto">
            No waste items matched &quot;{searchQuery}&quot;. Try searching for general terms like &quot;peel&quot;, &quot;bottle&quot;, &quot;paper&quot;, &quot;can&quot;, or reset your filters.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              setSelectedBinFilter('all');
            }}
            className="px-4 py-2 bg-[#4F7942] text-white text-xs font-bold rounded-full cursor-pointer hover:bg-[#3D5E34] transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl p-6 border border-[#DDE3D9] flex flex-col justify-between shadow-xs hover:border-[#4F7942] transition-all relative overflow-hidden group"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-3.5">
                  <div className="flex items-start gap-3">
                    {item.resinCode ? (
                      <div className="w-10 h-10 rounded-2xl bg-[#1A241A] text-white flex items-center justify-center font-bold text-sm shadow-xs font-['Space_Grotesk'] shrink-0">
                        #{item.resinCode}
                      </div>
                    ) : item.category === 'organic' ? (
                      <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center justify-center shrink-0">
                        <Sprout className="w-5 h-5 text-emerald-700" />
                      </div>
                    ) : item.category === 'paper' ? (
                      <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-800 border border-sky-300 flex items-center justify-center shrink-0">
                        <Package className="w-5 h-5 text-sky-700" />
                      </div>
                    ) : item.category === 'hazardous' ? (
                      <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-800 border border-rose-300 flex items-center justify-center shrink-0">
                        <AlertTriangle className="w-5 h-5 text-rose-700" />
                      </div>
                    ) : item.category === 'ewaste' ? (
                      <div className="w-10 h-10 rounded-2xl bg-stone-800 text-white flex items-center justify-center shrink-0">
                        <Zap className="w-5 h-5 text-amber-400" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-800 border border-blue-300 flex items-center justify-center shrink-0">
                        <Recycle className="w-5 h-5 text-blue-700" />
                      </div>
                    )}

                    <div>
                      <h4 className="font-bold text-sm text-[#1A241A] tracking-tight leading-snug line-clamp-2">
                        {item.name}
                      </h4>
                      <span className="text-[11px] text-[#7A8A7A] block mt-0.5">
                        {item.categoryLabel}
                      </span>
                    </div>
                  </div>

                  {/* Curbside Acceptance Badge */}
                  <span
                    className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 border ${
                      item.curbsideAcceptance === 'Curbside Staple'
                        ? 'bg-[#E8EDE6] text-[#4F7942] border-[#DDE3D9]'
                        : item.curbsideAcceptance === 'Store / Drop-Off'
                        ? 'bg-amber-50 text-amber-900 border-amber-200'
                        : item.curbsideAcceptance === 'Specialty Facility'
                        ? 'bg-purple-50 text-purple-900 border-purple-200'
                        : 'bg-rose-50 text-rose-900 border-rose-200'
                    }`}
                  >
                    {item.curbsideAcceptance}
                  </span>
                </div>

                {/* Designated Municipal Bin Stream Pill */}
                <div
                  className={`mb-3.5 px-3 py-2 rounded-2xl border flex items-center justify-between text-xs font-semibold ${
                    item.binColor === 'green'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                      : item.binColor === 'blue'
                      ? 'bg-blue-50 border-blue-200 text-blue-950'
                      : item.binColor === 'red'
                      ? 'bg-rose-50 border-rose-200 text-rose-950'
                      : 'bg-stone-100 border-stone-300 text-stone-900'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{item.binEmoji}</span>
                    <div>
                      <span className="block font-bold leading-tight">
                        {item.binColorName} Bin
                      </span>
                      <span className="text-[10px] opacity-80 block">{item.binCategory}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold tracking-wider block opacity-70">
                      Score
                    </span>
                    <span className="font-bold text-xs">{item.recyclabilityScore}/100</span>
                  </div>
                </div>

                {/* Content Details */}
                <div className="space-y-2.5 text-xs mb-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#7A8A7A] block mb-0.5">
                      Common Items &amp; Forms
                    </span>
                    <p className="text-[#5C6B5C] leading-relaxed text-[11px]">{item.commonUses}</p>
                  </div>

                  <div className="bg-[#F4F7F2] p-2.5 rounded-xl border border-[#DDE3D9]">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#4F7942] block mb-0.5">
                      Preparation Protocol
                    </span>
                    <p className="text-[#1A241A] font-medium leading-relaxed text-[11px]">
                      {item.prepProtocol}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-[#5C6B5C] pt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#7A8A7A]" />
                      <span>Degradation:</span>
                      <strong className="text-[#1A241A] font-semibold">
                        {item.decompositionTime}
                      </strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* Environmental Footer */}
              <div className="pt-3 border-t border-[#DDE3D9] text-[11px] text-[#5C6B5C] flex items-start gap-2">
                <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[#4F7942]" />
                <span className="leading-tight line-clamp-2">{item.environmentalTip}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
