export const NELSON_PAIRS: Array<{ id?: string; title: string; before: string; after: string; beforeAlt: string; afterAlt: string; note: string; tag?: string; details?: Array<{ label: string; note: string; x: number; y: number }> }> = [
  {
    id: 'nelson-kitchen',
    title: 'The kitchen',
    details: [
      { label: 'Deep-navy cabinetry', note: 'Navy cabinetry replaces the dated galley-kitchen finish shown in the earlier photograph.', x: 18, y: 31 },
      { label: 'Waterfall quartz island', note: 'The finished island has a quartz surface continuing down the visible end.', x: 53, y: 80 },
      { label: 'Statement hood', note: 'The dark hood sits above the island cooktop in the finished kitchen.', x: 72, y: 25 },
    ],
    before: '/images/nelson/kitchen-before.webp',
    after: '/images/nelson/kitchen-after.webp',
    beforeAlt: 'Nelson Drive kitchen before: dated galley kitchen with laminate counters',
    afterAlt: 'Nelson Drive kitchen after: deep-navy cabinetry, waterfall quartz island, statement hood',
    note: 'Deep-navy cabinetry, a waterfall quartz island, and a statement hood in the finished kitchen.',
  },
  {
    id: 'nelson-bath',
    title: 'The primary bath',
    details: [
      { label: 'Freestanding tub', note: 'A freestanding soaking tub appears in the completed room.', x: 25, y: 73 },
      { label: 'Glass shower', note: 'The finished walk-in shower is enclosed in glass.', x: 63, y: 43 },
      { label: 'Wood paneling', note: 'Warm wood paneling runs behind the tub.', x: 23, y: 42 },
    ],
    tag: 'During construction',
    before: '/images/nelson/bath-before.webp',
    after: '/images/nelson/bath-after.webp',
    beforeAlt: 'Primary bath during construction: open stud framing and rough plumbing',
    afterAlt: 'Primary bath finished: freestanding soaking tub, glass walk-in shower, warm wood paneling',
    note: 'From exposed framing to a freestanding tub, glass shower, and warm wood paneling.',
  },
  {
    id: 'nelson-living',
    title: 'The living space',
    details: [
      { label: 'Connected kitchen', note: 'The finished photograph shows the kitchen opening onto the staged living and dining areas.', x: 27, y: 49 },
      { label: 'Living and dining', note: 'The staged furniture shows the living and dining areas within the same room.', x: 73, y: 58 },
    ],
    before: '/images/nelson/living-before.webp',
    after: '/images/nelson/living-after.webp',
    beforeAlt: 'Living room before: dark wood paneling and a dropped soffit',
    afterAlt: 'Living room after: one open, staged great room across living, dining, and kitchen',
    note: 'Dark paneling and a dropped soffit give way to an open, staged living, dining, and kitchen area.',
  },
];

export const NELSON_FINISHES: Array<[string, string]> = [
  ['/images/nelson/bath2-after.webp', 'Second bath finished with tub, glass shower, and tile surround'],
  ['/images/nelson/bed-after.webp', 'Staged bedroom with French doors and natural light'],
  ['/images/nelson/office-after.webp', 'Flexible office corner, staged with desk and reading chair'],
];

