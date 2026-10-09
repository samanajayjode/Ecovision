#!/usr/bin/env python3
"""
EcoVision Analysis Engine
Processes material properties, vegetable compostability, plastic resin identification,
carbon metrics, and upcycling ideas.
"""

import sys
import json
import math

# Database of Material Benchmarks and Carbon Emission Factors
# Values derived from EPA WARM (Waste Reduction Model) and IPCC life-cycle assessment data.
MATERIAL_PROPERTIES = {
    "plastic_pet_1": {
        "id": "plastic_pet_1",
        "name": "PET / PETE (Polyethylene Terephthalate)",
        "category": "plastic",
        "resin_code": 1,
        "is_plastic": True,
        "is_reusable": True,
        "reusability_rating": "Moderate (Avoid repeated high-heat washing)",
        "recyclability": "Widely Recycled (Curbside)",
        "decomposition_years": 450,
        "co2_factor_per_kg": 2.15,      # kg CO2e saved per kg recycled vs virgin
        "energy_factor_kwh_per_kg": 5.6, # kWh saved per kg recycled
        "water_factor_liters_per_kg": 18.0,
        "bin_type": "Blue Recycling Bin",
        "instructions": [
            "Empty any remaining contents completely",
            "Give a quick rinse with cold or leftover water",
            "Screw the cap back on (caps are now processed with bottles in modern optical sorters)",
            "Do NOT place inside tied plastic bags in curbside bins"
        ],
        "contamination_alerts": [
            "Greasy liquids or chemical containers must be disposed of at hazardous waste points",
            "Do not mix with biodegradable PLA plastics"
        ],
        "upcycling_ideas": [
            {
                "title": "Sub-Irrigation Self-Watering Planter",
                "difficulty": "Easy (10 mins)",
                "summary": "Cut bottle in half, invert top half with a cotton wick into bottom reservoir for low-maintenance herb growing."
            },
            {
                "title": "Drip Irrigation Stake for Garden",
                "difficulty": "Easy (5 mins)",
                "summary": "Puncture 3-4 tiny needle holes in the cap, fill with water, and bury upside down near vegetable roots."
            },
            {
                "title": "Eco-Brick Dense Compactor",
                "difficulty": "Medium (Ongoing)",
                "summary": "Pack clean dry soft plastic wrappers tightly until bottle is solid and rigid; use for modular garden raised beds."
            }
        ]
    },
    "plastic_hdpe_2": {
        "id": "plastic_hdpe_2",
        "name": "HDPE (High-Density Polyethylene)",
        "category": "plastic",
        "resin_code": 2,
        "is_plastic": True,
        "is_reusable": True,
        "reusability_rating": "High (Food grade, durable, heat resistant)",
        "recyclability": "Widely Recycled (Curbside)",
        "decomposition_years": 400,
        "co2_factor_per_kg": 1.95,
        "energy_factor_kwh_per_kg": 6.2,
        "water_factor_liters_per_kg": 22.0,
        "bin_type": "Blue Recycling Bin",
        "instructions": [
            "Rinse residue thoroughly (milk jug or detergent)",
            "Leave plastic cap on",
            "Flatten jug gently to conserve collection truck volume"
        ],
        "contamination_alerts": [
            "Detergent jugs with rubber dispensing valves should have valves removed"
        ],
        "upcycling_ideas": [
            {
                "title": "Ergonomic Garden Soil Scoop",
                "difficulty": "Easy (8 mins)",
                "summary": "Cut diagonally across the bottom while keeping the built-in handle intact to create a durable soil trowel."
            },
            {
                "title": "Hardware / Screw Organizer Totes",
                "difficulty": "Easy (5 mins)",
                "summary": "Cut off top shoulder leaving wide rectangular storage bins for nails, craft items, or seed packets."
            }
        ]
    },
    "plastic_pp_5": {
        "id": "plastic_pp_5",
        "name": "PP (Polypropylene - Yogurt tubs, takeout containers)",
        "category": "plastic",
        "resin_code": 5,
        "is_plastic": True,
        "is_reusable": True,
        "reusability_rating": "High (Dishwasher safe, durable)",
        "recyclability": "Check Locally / Accepted in most urban centers",
        "decomposition_years": 300,
        "co2_factor_per_kg": 1.70,
        "energy_factor_kwh_per_kg": 4.8,
        "water_factor_liters_per_kg": 14.0,
        "bin_type": "Blue Recycling Bin",
        "instructions": [
            "Scrape away food leftovers cleanly",
            "Quick rinse; remove foil or paper heat-seal lids",
            "Stack tubs together to optimize bin space"
        ],
        "contamination_alerts": [
            "Food crusts or grease can spoil an entire plastics batch"
        ],
        "upcycling_ideas": [
            {
                "title": "Indoor Seedling Germination Cup",
                "difficulty": "Easy (3 mins)",
                "summary": "Poke drainage holes in the bottom, fill with potting mix, and start heirloom tomato or pepper seeds."
            },
            {
                "title": "Stackable Pantry Food / Snack Tubs",
                "difficulty": "Immediate",
                "summary": "Use for bulk spices, dried pulses, button sorting, or lunch portioning."
            }
        ]
    },
    "plastic_ldpe_4": {
        "id": "plastic_ldpe_4",
        "name": "LDPE (Low-Density Polyethylene - Plastic film, grocery bags)",
        "category": "plastic",
        "resin_code": 4,
        "is_plastic": True,
        "is_reusable": True,
        "reusability_rating": "Moderate (Reusable multiple times before stretch wear)",
        "recyclability": "Store Drop-Off Only (NEVER curbside)",
        "decomposition_years": 500,
        "co2_factor_per_kg": 1.45,
        "energy_factor_kwh_per_kg": 3.9,
        "water_factor_liters_per_kg": 10.0,
        "bin_type": "Grocery Store Plastic Film Drop-Off Station",
        "instructions": [
            "Ensure bag or film is 100% clean and dry (no moisture)",
            "Do NOT place into curbside recycling; film tangles in facility sorting gears",
            "Bundle all clean soft plastics together inside one bag before drop-off"
        ],
        "contamination_alerts": [
            "Films with metallized lining (like potato chip bags) cannot be recycled with LDPE"
        ],
        "upcycling_ideas": [
            {
                "title": "Weatherproof Plarn (Plastic Yarn)",
                "difficulty": "Medium (25 mins)",
                "summary": "Cut bags into continuous strips and knit or crochet into heavy-duty waterproof mats or tote bags."
            },
            {
                "title": "Protective Shipping Padding",
                "difficulty": "Immediate",
                "summary": "Reuse as cushion fill for fragile postal parcels instead of purchasing synthetic bubble wrap."
            }
        ]
    },
    "vegetables_general": {
        "id": "vegetables_general",
        "name": "Organic Vegetable Scraps & Kitchen Trimmings",
        "category": "vegetable",
        "resin_code": 0,
        "is_plastic": False,
        "is_reusable": True,
        "reusability_rating": "Highest (Nutritive regeneration, broth, composting)",
        "recyclability": "Compostable (Green Bin or Home Pile)",
        "decomposition_years": 0.05, # ~2 to 4 weeks in aerated compost
        "co2_factor_per_kg": 1.85,    # Prevents methane formation in landfill
        "energy_factor_kwh_per_kg": 0.8,
        "water_factor_liters_per_kg": 35.0,
        "bin_type": "Green Organics / Compost Bin",
        "instructions": [
            "Remove any produce barcode stickers, rubber bands, or twist ties",
            "Keep in a counter compost caddy with aerated lid or freeze until collection",
            "Layer with brown carbon materials (dry leaves, shredded cardboard) in home compost"
        ],
        "contamination_alerts": [
            "Never mix in conventional plastic produce bags (only use certified BPI compostable liners)",
            "Avoid adding diseased garden vegetable foliage to domestic compost"
        ],
        "upcycling_ideas": [
            {
                "title": "Simmered Golden Vegetable Umami Stock",
                "difficulty": "Easy (45 mins)",
                "summary": "Keep a freezer bag for onion skins, carrot ends, celery tops, garlic ends, and parsley stems. Simmer with water for 45 mins to produce rich homemade broth."
            },
            {
                "title": "Windowsill Scrap Regrowing Garden",
                "difficulty": "Very Easy (1 week)",
                "summary": "Place scallion root ends, celery bases, or lettuce cores in 1/2 inch of clean water. Fresh green shoots emerge within days!"
            },
            {
                "title": "Enriched Aerobic Compost Soil Builder",
                "difficulty": "Ongoing",
                "summary": "Adds bio-available Nitrogen, Potassium, and active microbiome flora to cultivate pesticide-free garden vegetables."
            }
        ]
    },
    "carrot_tops_scraps": {
        "id": "carrot_tops_scraps",
        "name": "Carrot Tops, Peels & Root Scraps",
        "category": "vegetable",
        "resin_code": 0,
        "is_plastic": False,
        "is_reusable": True,
        "reusability_rating": "Culinary & Garden Reusable",
        "recyclability": "Compostable / 100% Biodegradable",
        "decomposition_years": 0.04,
        "co2_factor_per_kg": 1.90,
        "energy_factor_kwh_per_kg": 0.9,
        "water_factor_liters_per_kg": 40.0,
        "bin_type": "Green Organics Bin / Kitchen Compost",
        "instructions": [
            "Wash any residual topsoil before culinary re-use",
            "If composting, chop tops coarsely to accelerate microbial breakdown",
            "Nitrogen-rich 'Green' component for balanced composting"
        ],
        "contamination_alerts": [
            "Peel produce stickers before placing in compost"
        ],
        "upcycling_ideas": [
            {
                "title": "Zesty Carrot Green Chimichurri / Pesto",
                "difficulty": "Easy (10 mins)",
                "summary": "Blend tender green tops with olive oil, garlic, lemon juice, sunflower seeds, and salt for a vibrant sauce."
            },
            {
                "title": "Regrow Lush Carrot Feather Foliage",
                "difficulty": "Easy (3 days)",
                "summary": "Set root crowns in a shallow saucer with fresh water in sunny spot for decorative fern-like greens."
            },
            {
                "title": "Crispy Baked Carrot Peel Chips",
                "difficulty": "Easy (15 mins)",
                "summary": "Toss clean peels in olive oil and paprika; bake at 190°C (375°F) for 10-12 mins until crispy."
            }
        ]
    },
    "onion_peels_skins": {
        "id": "onion_peels_skins",
        "name": "Onion Skins & Garlic Peels",
        "category": "vegetable",
        "resin_code": 0,
        "is_plastic": False,
        "is_reusable": True,
        "reusability_rating": "Natural Dye & Culinary Stock",
        "recyclability": "Compostable",
        "decomposition_years": 0.05,
        "co2_factor_per_kg": 1.75,
        "energy_factor_kwh_per_kg": 0.7,
        "water_factor_liters_per_kg": 25.0,
        "bin_type": "Green Organics Bin / Home Compost",
        "instructions": [
            "Dry thoroughly if saving for fabric dye or stock",
            "Safe for outdoor compost piles; moderate quantities in worm vermicompost"
        ],
        "contamination_alerts": [
            "Excess raw alliums can irritate vermicompost worms; add in modest balanced quantities"
        ],
        "upcycling_ideas": [
            {
                "title": "Deep Amber Homemade Broth Colorant",
                "difficulty": "Easy (Immediate)",
                "summary": "Yellow and red onion skins impart rich golden color and quercetin antioxidants to soups without any bitterness."
            },
            {
                "title": "Non-Toxic Natural Textile & Easter Egg Dye",
                "difficulty": "Medium (30 mins)",
                "summary": "Boil brown skins in water with a dash of vinegar to create deep terracotta and amber dyes for cotton and wool."
            },
            {
                "title": "Pest-Repellent Plant Mulch",
                "difficulty": "Easy (5 mins)",
                "summary": "Spread dried allium skins around potted plants to deter aphids and fungus gnats naturally."
            }
        ]
    },
    "potato_peels": {
        "id": "potato_peels",
        "name": "Potato Skins & Peels",
        "category": "vegetable",
        "resin_code": 0,
        "is_plastic": False,
        "is_reusable": True,
        "reusability_rating": "Culinary Snack & Potassium Soil Booster",
        "recyclability": "Compostable",
        "decomposition_years": 0.06,
        "co2_factor_per_kg": 1.80,
        "energy_factor_kwh_per_kg": 0.8,
        "water_factor_liters_per_kg": 30.0,
        "bin_type": "Green Organics Bin / Compost",
        "instructions": [
            "Bury under soil or compost layer to prevent light exposure and greening",
            "Rich in Potassium and phosphorus for fruiting plants"
        ],
        "contamination_alerts": [
            "Do not consume green potato skins containing solanine alkaloids"
        ],
        "upcycling_ideas": [
            {
                "title": "Crispy Air-Fried Potato Skin Crackers",
                "difficulty": "Easy (12 mins)",
                "summary": "Toss scrubbed peels with oil, sea salt, and smoked paprika. Roast at 200°C until golden and crispy."
            },
            {
                "title": "Potassium-Rich Banana & Potato Water for Roses",
                "difficulty": "Easy (Overnight)",
                "summary": "Soak skins in water for 24 hours; strain and water indoor plants with mineral-infused hydration."
            }
        ]
    },
    "glass_container": {
        "id": "glass_container",
        "name": "Glass Bottle / Mason Jar",
        "category": "glass",
        "resin_code": 0,
        "is_plastic": False,
        "is_reusable": True,
        "reusability_rating": "Infinite (100% inert, zero chemical leaching)",
        "recyclability": "Infinitely Recyclable without quality degradation",
        "decomposition_years": 1000000,
        "co2_factor_per_kg": 0.85,
        "energy_factor_kwh_per_kg": 1.2,
        "water_factor_liters_per_kg": 15.0,
        "bin_type": "Blue Recycling Bin (or Glass Drop-off igloo)",
        "instructions": [
            "Rinse residue with water",
            "Metal lids can usually be recycled separately with tin/metals",
            "Do NOT break glass before placing in bin"
        ],
        "contamination_alerts": [
            "Pyrex, ceramics, drinking glasses, and window panes have different melting temps and CANNOT mix with container glass"
        ],
        "upcycling_ideas": [
            {
                "title": "Zero-Waste Bulk Pantry Decanter",
                "difficulty": "Immediate",
                "summary": "Store grains, lentils, homemade dressings, or chia seeds with zero plastic exposure."
            },
            {
                "title": "Living Hydroponic Herb Propagation Vessel",
                "difficulty": "Easy (5 mins)",
                "summary": "Fill with water and propagate cuttings of basil, mint, pothos, or rosemary on your window."
            }
        ]
    },
    "aluminum_metal": {
        "id": "aluminum_metal",
        "name": "Aluminum Beverage Can",
        "category": "metal",
        "resin_code": 0,
        "is_plastic": False,
        "is_reusable": True,
        "reusability_rating": "High (Can be remade into new cans within 60 days)",
        "recyclability": "Widely & Profitably Recycled (Saves 95% virgin energy)",
        "decomposition_years": 250,
        "co2_factor_per_kg": 9.13,      # Aluminum yields highest carbon savings of any material!
        "energy_factor_kwh_per_kg": 14.0,
        "water_factor_liters_per_kg": 45.0,
        "bin_type": "Blue Recycling Bin",
        "instructions": [
            "Empty completely (no liquid left)",
            "Light crush is fine, keep clean of food debris",
            "Tab can remain attached"
        ],
        "contamination_alerts": [
            "Do not put paint cans or pressurized aerosol spray cans in standard bin without depressurizing"
        ],
        "upcycling_ideas": [
            {
                "title": "Durable Garden Plant Identifier Stakes",
                "difficulty": "Medium (15 mins)",
                "summary": "Cut strips with safety shears and emboss vegetable names using a ballpoint pen; will never rot or fade in weather."
            },
            {
                "title": "Desk Pencil & Stationery Cup",
                "difficulty": "Easy (10 mins)",
                "summary": "Carefully remove rim with a smooth can opener, sand edges, and paint for desktop organization."
            }
        ]
    },
    "paper_cardboard": {
        "id": "paper_cardboard",
        "name": "Corrugated Cardboard Box",
        "category": "paper",
        "resin_code": 0,
        "is_plastic": False,
        "is_reusable": True,
        "reusability_rating": "High (Reusable for shipping, weed barrier, sheet mulching)",
        "recyclability": "Widely Recycled (5-7 lifecycles)",
        "decomposition_years": 0.5,
        "co2_factor_per_kg": 1.25,
        "energy_factor_kwh_per_kg": 3.2,
        "water_factor_liters_per_kg": 26.0,
        "bin_type": "Blue Recycling Bin / Cardboard Dumpster",
        "instructions": [
            "Flatten box completely to save volume",
            "Remove excessive plastic packing tape or shipping labels",
            "Keep dry (wet fibers decompose and degrade fiber strength)"
        ],
        "contamination_alerts": [
            "Greasy pizza box bottoms should be composted, not recycled with clean paper"
        ],
        "upcycling_ideas": [
            {
                "title": "No-Dig Sheet Mulching Weed Barrier",
                "difficulty": "Easy (20 mins)",
                "summary": "Lay flat unprinted cardboard over grass, soak with water, and top with compost/woodchips to create weed-free garden beds."
            },
            {
                "title": "Carbon 'Brown' Balance for Kitchen Compost",
                "difficulty": "Easy (5 mins)",
                "summary": "Tear or shred plain corrugated cardboard to balance moist vegetable scraps at a 2:1 ratio."
            }
        ]
    },
    "plastic_ps_6": {
        "id": "plastic_ps_6",
        "name": "PS (Polystyrene / Expanded Styrofoam Foam)",
        "category": "plastic",
        "resin_code": 6,
        "is_plastic": True,
        "is_reusable": False,
        "reusability_rating": "Low (Brittle, not suitable for hot food reuse)",
        "recyclability": "Special Drop-off Only (Rarely curbside; check EPS drop-off)",
        "decomposition_years": 500,
        "co2_factor_per_kg": 1.60,
        "energy_factor_kwh_per_kg": 4.1,
        "water_factor_liters_per_kg": 12.0,
        "bin_type": "Designated EPS Foam Drop-Off Station",
        "instructions": [
            "Keep clean and dry (greasy foam takeout containers cannot be recycled)",
            "Do NOT place in standard curbside bin unless your city explicitly accepts EPS",
            "Bundle clean packing blocks for foam drop-off depot"
        ],
        "contamination_alerts": [
            "Food-encrusted foam cannot be mechanically processed and must go to trash"
        ],
        "upcycling_ideas": [
            {
                "title": "Lightweight Planter Pot Drainage Filler",
                "difficulty": "Easy (Immediate)",
                "summary": "Place broken foam peanuts or chunks at the base of heavy garden pots before soil to improve drainage without adding weight."
            }
        ]
    },
    "composite_carton": {
        "id": "composite_carton",
        "name": "Aseptic Tetra Pak Multi-Layer Composite Carton",
        "category": "composite",
        "resin_code": 7,
        "is_plastic": False,
        "is_reusable": True,
        "reusability_rating": "Moderate (Seedling planter or craft container)",
        "recyclability": "Check Locally (Accepted in ~60% of curbside programs with specialized hydro-pulpers)",
        "decomposition_years": 5,
        "co2_factor_per_kg": 1.10,
        "energy_factor_kwh_per_kg": 2.5,
        "water_factor_liters_per_kg": 18.0,
        "bin_type": "Blue Recycling Bin (Carton Stream)",
        "instructions": [
            "Empty completely and give a quick rinse",
            "Push plastic straw inside carton or screw cap back on",
            "Do NOT flatten cartons if your facility uses optical sorters"
        ],
        "contamination_alerts": [
            "Milk or juice residue left inside will sour and spoil bale"
        ],
        "upcycling_ideas": [
            {
                "title": "Waterproof Seed Starter Mini-Greenhouse",
                "difficulty": "Easy (10 mins)",
                "summary": "Cut one side panel off, fill with soil, and sow seeds; foil lining retains moisture and warmth."
            }
        ]
    }
}

def calculate_carbon_metrics(material_data, estimated_weight_grams=80):
    """
    Calculates carbon, energy, water, and equivalent human metrics.
    """
    weight_kg = estimated_weight_grams / 1000.0
    
    co2_factor = material_data.get("co2_factor_per_kg", 1.5)
    energy_factor = material_data.get("energy_factor_kwh_per_kg", 3.0)
    water_factor = material_data.get("water_factor_liters_per_kg", 20.0)
    
    co2_saved_kg = round(weight_kg * co2_factor, 3)
    energy_saved_kwh = round(weight_kg * energy_factor, 3)
    water_saved_liters = round(weight_kg * water_factor, 2)
    
    # 1 kg CO2e is approximately equal to 2.47 miles driven by an average passenger car (EPA factor ~0.404 kg/mile)
    car_miles = round(co2_saved_kg / 0.404, 2)
    
    # An average urban mature tree absorbs ~0.06 kg CO2 per day
    tree_days = round(co2_saved_kg / 0.06, 1)
    
    # For vegetables/organics: Methane impact
    is_organic = material_data.get("category") == "vegetable"
    methane_avoided_kg = round(co2_saved_kg * 0.42, 3) if is_organic else 0.0
    
    return {
        "estimated_weight_grams": estimated_weight_grams,
        "co2_saved_kg": co2_saved_kg,
        "methane_avoided_kg": methane_avoided_kg,
        "energy_saved_kwh": energy_saved_kwh,
        "water_saved_liters": water_saved_liters,
        "car_miles_equivalent": car_miles,
        "tree_absorption_days": tree_days,
        "decomposition_years": material_data.get("decomposition_years", 50)
    }

def analyze_item(material_key=None, custom_notes="", estimated_weight=None):
    """
    Looks up or matches material properties and calculates comprehensive analysis.
    """
    if not material_key or material_key not in MATERIAL_PROPERTIES:
        # Fallback to intelligent classification based on keywords
        key_lower = (material_key or custom_notes or "").lower()
        if any(w in key_lower for w in ["carrot", "vegetable", "onion", "potato", "peel", "organic", "scraps", "leaf", "celery", "food", "compost"]):
            if "carrot" in key_lower:
                material_key = "carrot_tops_scraps"
            elif "onion" in key_lower or "garlic" in key_lower:
                material_key = "onion_peels_skins"
            elif "potato" in key_lower:
                material_key = "potato_peels"
            else:
                material_key = "vegetables_general"
        elif any(w in key_lower for w in ["pet", "water bottle", "soda", "drink bottle", "#1"]):
            material_key = "plastic_pet_1"
        elif any(w in key_lower for w in ["hdpe", "milk jug", "detergent", "shampoo", "#2"]):
            material_key = "plastic_hdpe_2"
        elif any(w in key_lower for w in ["pp", "yogurt", "tub", "takeout", "#5"]):
            material_key = "plastic_pp_5"
        elif any(w in key_lower for w in ["film", "bag", "wrapper", "ldpe", "#4"]):
            material_key = "plastic_ldpe_4"
        elif any(w in key_lower for w in ["glass", "jar", "mason", "wine bottle"]):
            material_key = "glass_container"
        elif any(w in key_lower for w in ["aluminum", "can", "tin", "soda can", "metal"]):
            material_key = "aluminum_metal"
        elif any(w in key_lower for w in ["cardboard", "box", "paper"]):
            material_key = "paper_cardboard"
        else:
            material_key = "plastic_pet_1" # standard default
            
    base = MATERIAL_PROPERTIES[material_key]
    
    # Default weights by category
    if estimated_weight is None or estimated_weight <= 0:
        if base["category"] == "plastic":
            estimated_weight = 32 # ~32g for water bottle
        elif base["category"] == "vegetable":
            estimated_weight = 120 # ~120g typical kitchen scrap portion
        elif base["category"] == "glass":
            estimated_weight = 280
        elif base["category"] == "metal":
            estimated_weight = 15
        elif base["category"] == "paper":
            estimated_weight = 150
        else:
            estimated_weight = 50

    metrics = calculate_carbon_metrics(base, estimated_weight)
    
    return {
        "status": "success",
        "item": base,
        "metrics": metrics,
        "is_plastic": base["is_plastic"],
        "is_reusable": base["is_reusable"],
        "reusability_rating": base["reusability_rating"],
        "category": base["category"],
        "resin_code": base.get("resin_code", 0),
        "decomposition_display": f"{base['decomposition_years']} years" if base['decomposition_years'] >= 1 else f"{int(base['decomposition_years'] * 52)} weeks in compost",
        "action_guide": base.get("upcycling_ideas", [])
    }

def get_recycling_database():
    """Returns the comprehensive recycling & vegetable database."""
    items_list = []
    for key, data in MATERIAL_PROPERTIES.items():
        sample_metrics = calculate_carbon_metrics(data, 100) # per 100g standard benchmark
        items_list.append({
            **data,
            "benchmark_100g_co2_saved": sample_metrics["co2_saved_kg"],
            "benchmark_100g_energy_kwh": sample_metrics["energy_saved_kwh"],
            "benchmark_100g_water_liters": sample_metrics["water_saved_liters"]
        })
    return items_list

# Machine Learning Waste Classes
ML_CLASSES = [
    "PET (#1)",
    "HDPE (#2)",
    "LDPE (#4)",
    "PP (#5)",
    "Veggie Scrap",
    "Glass Jar",
    "Aluminum Can",
    "Cardboard"
]

def train_model_optimization(hyperparams=None):
    """
    Simulates / computes model training across epochs, demonstrating overfitting
    under naive conditions and regularization-driven generalization under anti-overfitting controls.
    """
    if hyperparams is None:
        hyperparams = {}

    epochs = int(hyperparams.get("epochs", 20))
    epochs = max(5, min(40, epochs))
    learning_rate = float(hyperparams.get("learningRate", 0.001))
    weight_decay = float(hyperparams.get("weightDecay", 0.005))
    dropout_rate = float(hyperparams.get("dropoutRate", 0.35))
    label_smoothing = float(hyperparams.get("labelSmoothing", 0.1))
    data_augmentation = bool(hyperparams.get("dataAugmentation", True))
    aug_intensity = hyperparams.get("augmentationIntensity", "medium")
    early_stopping = bool(hyperparams.get("earlyStopping", True))
    patience = int(hyperparams.get("earlyStoppingPatience", 4))
    temp_scaling = float(hyperparams.get("temperatureScaling", 1.3))
    backbone = hyperparams.get("backbone", "EfficientNet-B2")

    # Assess regularization strength
    reg_score = 0.0
    reg_score += min(1.0, dropout_rate / 0.4) * 0.35
    reg_score += min(1.0, weight_decay / 0.005) * 0.25
    reg_score += (0.25 if data_augmentation else 0.0)
    if data_augmentation and aug_intensity in ["medium", "high"]:
        reg_score += 0.05
    reg_score += min(1.0, label_smoothing / 0.1) * 0.10

    # Determine if configuration causes overfitting
    is_overfitted_config = (dropout_rate < 0.1 and weight_decay < 0.001 and not data_augmentation)

    history = []
    best_val_loss = float("inf")
    best_epoch = 1
    patience_counter = 0
    early_stopped = False

    curr_train_loss = 1.95
    curr_val_loss = 1.98
    curr_train_acc = 22.0
    curr_val_acc = 21.0

    for ep in range(1, epochs + 1):
        lr_factor = 0.5 * (1.0 + math.cos(math.pi * (ep - 1) / max(1, epochs)))
        current_lr = round(learning_rate * lr_factor, 6)

        # Training loss step
        if is_overfitted_config:
            # Overfitted model rapidly memorizes training set
            train_loss_decay = 0.68 + (0.01 * ep)
            curr_train_loss = max(0.015, curr_train_loss * 0.72)
            curr_train_acc = min(99.4, curr_train_acc + (100.0 - curr_train_acc) * 0.38)

            # Validation loss diverges after epoch 5
            if ep <= 5:
                curr_val_loss = max(0.48, curr_val_loss * 0.78)
                curr_val_acc = min(71.0, curr_val_acc + (73.0 - curr_val_acc) * 0.30)
            else:
                # Validation loss balloons upwards (classic U-curve overfitting)
                curr_val_loss = round(curr_val_loss + 0.065 + (ep * 0.008), 3)
                curr_val_acc = max(64.0, curr_val_acc - (0.4 + (ep * 0.05)))
        else:
            # Regularized training: steady convergence with controlled generalization gap
            damping = 0.80 - (reg_score * 0.08)
            curr_train_loss = max(0.12, curr_train_loss * damping)
            target_train_acc = 96.5 + (reg_score * 1.5)
            curr_train_acc = min(target_train_acc, curr_train_acc + (target_train_acc - curr_train_acc) * 0.28)

            # Validation loss smoothly follows training loss
            val_damping = 0.82 - (reg_score * 0.06)
            curr_val_loss = max(0.14, curr_val_loss * val_damping)
            target_val_acc = 94.0 + (reg_score * 3.0)
            curr_val_acc = min(target_val_acc, curr_val_acc + (target_val_acc - curr_val_acc) * 0.26)

        # Record metrics
        ep_train_loss = round(curr_train_loss, 3)
        ep_val_loss = round(curr_val_loss, 3)
        ep_train_acc = round(curr_train_acc, 1)
        ep_val_acc = round(curr_val_acc, 1)
        gap = round(ep_train_acc - ep_val_acc, 1)

        is_ep_overfitting = (gap > 10.0 or (ep > 5 and ep_val_loss > ep_train_loss * 2.2))

        history.append({
            "epoch": ep,
            "trainLoss": ep_train_loss,
            "valLoss": ep_val_loss,
            "trainAcc": ep_train_acc,
            "valAcc": ep_val_acc,
            "learningRate": current_lr,
            "isOverfitting": is_ep_overfitting
        })

        if ep_val_loss < best_val_loss:
            best_val_loss = ep_val_loss
            best_epoch = ep
            patience_counter = 0
        else:
            patience_counter += 1
            if early_stopping and patience_counter >= patience and is_overfitted_config:
                early_stopped = True
                break

    final_train_acc = history[-1]["trainAcc"]
    final_val_acc = history[-1]["valAcc"]
    gen_gap = round(final_train_acc - final_val_acc, 1)

    # Build 8x8 Confusion Matrix
    confusion_matrix = []
    class_metrics = []
    
    for i, actual in enumerate(ML_CLASSES):
        # Base true positive rate depends on regularized vs overfit
        if is_overfitted_config:
            # Overfit model confuses similar polymers and food scraps
            base_tp = 66.0 if "HDPE" in actual or "PP" in actual else (72.0 if "PET" in actual else 70.0)
        else:
            base_tp = min(98.5, 93.0 + (reg_score * 4.0))

        remaining = 100.0 - base_tp
        samples = 120

        tp_count = int(samples * (base_tp / 100.0))
        
        # Calculate confusions
        for j, pred in enumerate(ML_CLASSES):
            if i == j:
                pct = round(base_tp, 1)
                cnt = tp_count
            else:
                # Plausible confusions
                is_plastic_pair = ("PET" in actual or "HDPE" in actual or "PP" in actual) and ("PET" in pred or "HDPE" in pred or "PP" in pred)
                if is_plastic_pair and is_overfitted_config:
                    pct = round(remaining * 0.45, 1)
                else:
                    pct = round(remaining / 7.0, 1)
                cnt = int(samples * (pct / 100.0))

            confusion_matrix.append({
                "actual": actual,
                "predicted": pred,
                "count": cnt,
                "percentage": pct
            })

        precision = round(base_tp / 100.0 * 0.98, 3)
        recall = round(base_tp / 100.0, 3)
        f1 = round(2 * (precision * recall) / max(0.001, (precision + recall)), 3)

        risk = "Critical" if is_overfitted_config else ("Low" if reg_score > 0.6 else "Moderate")
        if not is_overfitted_config and final_val_acc >= 94.0:
            risk = "Cured"

        class_metrics.append({
            "className": actual,
            "precision": round(precision * 100, 1),
            "recall": round(recall * 100, 1),
            "f1Score": round(f1 * 100, 1),
            "sampleCount": samples,
            "overfittingRisk": risk
        })

    # Diagnosis report
    if gen_gap > 18.0:
        model_state = "overfitted_baseline"
        diagnosis = {
            "isOverfitting": True,
            "gapSeverity": "Critical",
            "explanation": f"Significant generalization gap of +{gen_gap}% detected! The model has memorized high-frequency training pixel patterns but fails on unseen validation packaging. Validation loss diverged.",
            "recommendation": "Enable Data Augmentation (rotations, random cutout), increase Dropout to 0.35+, add L2 Weight Decay (0.005), and activate Label Smoothing (0.10) to force feature invariance."
        }
    elif gen_gap > 6.0:
        model_state = "well_regularized"
        diagnosis = {
            "isOverfitting": False,
            "gapSeverity": "Moderate",
            "explanation": f"Mild gap of +{gen_gap}%. Model demonstrates acceptable generalizability with minor boundary overlap between HDPE (#2) and PP (#5).",
            "recommendation": "Fine-tune with slight label smoothing (0.10) and Cosine Annealing learning rate to reach 96%+ validation accuracy."
        }
    else:
        model_state = "well_regularized" if dropout_rate <= 0.4 else "aggressive_regularized"
        diagnosis = {
            "isOverfitting": False,
            "gapSeverity": "Healthy / Regularized",
            "explanation": f"Optimal convergence achieved! Generalization gap is tightly constrained to +{gen_gap}%, with validation accuracy at {final_val_acc}%. Cross-entropy loss stabilized without divergence.",
            "recommendation": "Model is fully calibrated and ready for high-accuracy production scanning."
        }

    return {
        "status": "success",
        "modelState": model_state,
        "trainAccuracy": final_train_acc,
        "valAccuracy": final_val_acc,
        "generalizationGap": gen_gap,
        "bestEpoch": best_epoch,
        "earlyStopped": early_stopped,
        "history": history,
        "confusionMatrix": confusion_matrix,
        "classMetrics": class_metrics,
        "hyperparameters": {
            "epochs": epochs,
            "learningRate": learning_rate,
            "weightDecay": weight_decay,
            "dropoutRate": dropout_rate,
            "labelSmoothing": label_smoothing,
            "dataAugmentation": data_augmentation,
            "augmentationIntensity": aug_intensity,
            "earlyStopping": early_stopping,
            "earlyStoppingPatience": patience,
            "temperatureScaling": temp_scaling,
            "backbone": backbone
        },
        "timestamp": "2026-09-02T11:24:00Z",
        "checkpointId": f"ckpt-{backbone.lower()}-{int(final_val_acc * 10)}",
        "overfittingDiagnosis": diagnosis
    }

def main():
    if len(sys.argv) > 1 and sys.argv[1] == "--database":
        print(json.dumps(get_recycling_database(), indent=2))
        return

    if len(sys.argv) > 1 and sys.argv[1] == "--train":
        hyperparams = {}
        if len(sys.argv) > 2:
            try:
                hyperparams = json.loads(sys.argv[2])
            except Exception:
                pass
        result = train_model_optimization(hyperparams)
        print(json.dumps(result, indent=2))
        return

    # Read from stdin or CLI arguments
    try:
        input_data = {}
        if not sys.stdin.isatty():
            content = sys.stdin.read().strip()
            if content:
                input_data = json.loads(content)
        elif len(sys.argv) > 1:
            input_data = json.loads(sys.argv[1])
            
        action = input_data.get("action")
        if action == "train":
            result = train_model_optimization(input_data.get("hyperparameters"))
            print(json.dumps(result, indent=2))
            return

        material_key = input_data.get("material_key")
        notes = input_data.get("notes", "")
        weight = input_data.get("weight")
        
        result = analyze_item(material_key, notes, weight)
        print(json.dumps(result, indent=2))
    except Exception as e:
        error_result = {
            "status": "error",
            "message": str(e),
            "fallback": analyze_item("plastic_pet_1")
        }
        print(json.dumps(error_result, indent=2))

if __name__ == "__main__":
    main()

