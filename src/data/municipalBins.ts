import { MunicipalBinClassification } from '../types';

export const MUNICIPAL_BIN_STANDARDS: MunicipalBinClassification[] = [
  {
    bin_color: 'green',
    color_emoji: '🟢',
    color_name: 'Green',
    waste_category: 'Organic / Wet Waste',
    primary_examples: 'Food leftovers, vegetable peels, garden clippings',
    final_destination: 'Composting & Bio-gas plants',
  },
  {
    bin_color: 'blue',
    color_emoji: '🔵',
    color_name: 'Blue',
    waste_category: 'Recyclable / Dry Waste',
    primary_examples: 'Clean paper, plastics, glass jars, tin cans',
    final_destination: 'Material Recycling Facilities',
  },
  {
    bin_color: 'red',
    color_emoji: '🔴',
    color_name: 'Red',
    waste_category: 'Hazardous / Sanitary',
    primary_examples: 'Chemicals, paints, wrapped sanitary napkins',
    final_destination: 'Safe Incineration / Secure disposal',
  },
  {
    bin_color: 'black',
    color_emoji: '⚫',
    color_name: 'Black / Grey',
    waste_category: 'Special Care E-Waste / General',
    primary_examples: 'Batteries, bulbs, expired medications, mixed refuse',
    final_destination: 'Authorized e-waste recycling / Landfill',
  },
];

export function resolveMunicipalBin(
  category?: string,
  name?: string,
  binType?: string
): MunicipalBinClassification {
  const lowerName = (name || '').toLowerCase();
  const lowerCat = (category || '').toLowerCase();
  const lowerBin = (binType || '').toLowerCase();

  // 1. Red: Hazardous / Sanitary
  if (
    lowerName.includes('chemical') ||
    lowerName.includes('paint') ||
    lowerName.includes('sanitary') ||
    lowerName.includes('napkin') ||
    lowerName.includes('solvent') ||
    lowerName.includes('pesticide') ||
    lowerName.includes('needle') ||
    lowerName.includes('bandage') ||
    lowerName.includes('diaper') ||
    lowerCat.includes('hazard') ||
    lowerBin.includes('hazard') ||
    lowerBin.includes('red')
  ) {
    return {
      ...MUNICIPAL_BIN_STANDARDS[2],
      assigned_reason:
        'Contains hazardous chemical compounds or bio-sanitary material requiring high-temperature secure disposal.',
    };
  }

  // 2. Black / Grey: Special Care E-Waste / General
  if (
    lowerName.includes('battery') ||
    lowerName.includes('bulb') ||
    lowerName.includes('tube') ||
    lowerName.includes('cfl') ||
    lowerName.includes('medication') ||
    lowerName.includes('pill') ||
    lowerName.includes('electronic') ||
    lowerName.includes('phone') ||
    lowerName.includes('wire') ||
    lowerName.includes('charger') ||
    lowerName.includes('refuse') ||
    lowerName.includes('styrofoam') ||
    lowerName.includes('ceramic') ||
    lowerCat.includes('e-waste') ||
    lowerCat.includes('electronic') ||
    lowerBin.includes('black') ||
    lowerBin.includes('grey') ||
    lowerBin.includes('e-waste')
  ) {
    return {
      ...MUNICIPAL_BIN_STANDARDS[3],
      assigned_reason:
        'Requires specialized electronic de-manufacturing depot or engineered landfill segregation.',
    };
  }

  // 3. Green: Organic / Wet Waste
  if (
    lowerCat === 'vegetable' ||
    lowerCat.includes('organic') ||
    lowerCat.includes('food') ||
    lowerCat.includes('compost') ||
    lowerName.includes('carrot') ||
    lowerName.includes('peel') ||
    lowerName.includes('vegetable') ||
    lowerName.includes('fruit') ||
    lowerName.includes('food') ||
    lowerName.includes('scrap') ||
    lowerName.includes('leftover') ||
    lowerName.includes('garden') ||
    lowerName.includes('clipping') ||
    lowerName.includes('coffee') ||
    lowerName.includes('tea') ||
    lowerName.includes('lettuce') ||
    lowerName.includes('apple') ||
    lowerName.includes('banana') ||
    lowerBin.includes('green') ||
    lowerBin.includes('organic') ||
    lowerBin.includes('compost')
  ) {
    return {
      ...MUNICIPAL_BIN_STANDARDS[0],
      assigned_reason:
        'Biodegradable wet biomass optimal for aerobic industrial composting and bio-gas anaerobic digesters.',
    };
  }

  // 4. Default to Blue: Recyclable / Dry Waste (paper, plastic, glass, metal, cans)
  return {
    ...MUNICIPAL_BIN_STANDARDS[1],
    assigned_reason:
      'Clean dry packaging material ready for automated optical sorting and mechanical recycling facilities.',
  };
}
