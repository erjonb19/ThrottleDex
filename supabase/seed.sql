-- Reference data only. No curators or vendors are seeded; those come from real people.

insert into metros (slug, name, areas) values
  ('nyc', 'NYC Metro', array['Manhattan','Brooklyn','Queens','Bronx','Staten Island','Long Island','Westchester','Hudson Valley','North Jersey','Mobile (comes to you)'])
on conflict (slug) do nothing;

insert into categories (slug, group_name, name, purpose, position) values
  ('ppf',          'Paint and protection', 'PPF, tint, wrap',                 'Film and tint on a new car, color change wraps', 10),
  ('lot-paint',    'Paint and protection', 'Lot paint, spot repair',          'Bumper scuffs and small spots done in the driveway, not a full respray', 20),
  ('body-premium', 'Paint and protection', 'Body shop, premium',              'Collision and paint on cars where the match has to be perfect', 30),
  ('body-budget',  'Paint and protection', 'Body shop, budget',               'Honest work on an everyday car at an everyday price', 40),
  ('undercoating', 'Paint and protection', 'Rust proofing, undercoating',     'Fluid Film or Woolwax before salt season', 50),
  ('pdr',          'Dents, wheels, glass', 'Paintless dent removal',          'Door dings and hail without repainting', 60),
  ('wheel-repair', 'Dents, wheels, glass', 'Wheel repair',                    'Curb rash and bent rims, ideally mobile', 70),
  ('tires',        'Dents, wheels, glass', 'Wheel and tire shop',             'Mounting, balancing, alignment, the odd sizes', 80),
  ('glass',        'Dents, wheels, glass', 'Glass and windshield',            'Chip repair and replacement with the right ADAS recalibration', 90),
  ('mech-enthusiast', 'Mechanics',         'Independent mechanic, enthusiast','German and performance cars, the shop you trust with a weekend car', 100),
  ('mech-everyday','Mechanics',            'Mechanic, everyday cars',         'Fair hourly rate for a normal commuter', 110),
  ('nys-inspection','Mechanics',           'NYS inspection station',          'Annual inspection without invented failures', 120),
  ('ppi',          'Mechanics',            'Pre-purchase inspection',         'A real look at a used car before money changes hands', 130),
  ('flatbed',      'Mechanics',            'Flatbed, towing',                 'Moving a car that cannot or should not be driven', 140),
  ('detailer',     'Detailing and interior','Mobile detailer',                'Comes to the house, handles paint correction too', 150),
  ('interior',     'Detailing and interior','Interior and upholstery',        'Leather repair, re-dye, seat and headliner work', 160),
  ('electronics',  'Detailing and interior','Electronics install',            'Dash cams, radar detectors, audio, hardwired right', 170),
  ('dv-appraiser', 'Buying, selling, paperwork','Diminished value appraiser', 'After an insurance repair, what the car is now worth less', 180),
  ('ticket-lawyer','Buying, selling, paperwork','Traffic ticket lawyer',      'Speeding and moving violations in NY and NJ', 190),
  ('insurance',    'Buying, selling, paperwork','Insurance broker, independent','Shops across carriers; collector policies too', 200),
  ('buyer',        'Buying, selling, paperwork','Dealer who buys anything',   'A quick, fair offer when someone needs out of a car', 210),
  ('financing',    'Buying, selling, paperwork','Financing',                  'Credit union or specialty lender for used and enthusiast cars', 220),
  ('photographer', 'The scene',            'Photographer',                    'Listing photos for an auction, or just a new car', 230),
  ('track',        'The scene',            'Track day instructor',            'First HPDE at Lime Rock, NJMP, or Palmer, done safely', 240),
  ('events',       'The scene',            'Events and club contact',         'Who is running the meet, the cruise, the show this weekend', 250),
  ('storage',      'The scene',            'Storage',                         'Climate-controlled, insured, near the house', 260),
  ('shipping',     'The scene',            'Long-haul shipping',              'Cross-country transport', 270)
on conflict (slug) do nothing;
