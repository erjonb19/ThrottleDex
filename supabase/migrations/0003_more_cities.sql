-- Six more car cities (decided Oct 18, 2026). Each shows as "coming soon" on the
-- site and app until its first curator is approved. Safe to run more than once.
insert into metros (slug, name, areas) values
  ('la', 'Los Angeles', array['Westside','Central LA','San Fernando Valley','San Gabriel Valley','South Bay','Long Beach','Orange County','Inland Empire','Ventura County','Mobile (comes to you)']),
  ('miami', 'Miami and South Florida', array['Miami','Miami Beach','Doral','Hialeah','Fort Lauderdale','Broward','Palm Beach','Mobile (comes to you)']),
  ('atlanta', 'Atlanta', array['Intown','Buckhead','Decatur','Marietta','Alpharetta','Gwinnett','South Metro','Mobile (comes to you)']),
  ('dfw', 'Dallas–Fort Worth', array['Dallas','Fort Worth','Arlington','Plano','Frisco','Irving','Mid-Cities','Denton','Mobile (comes to you)']),
  ('chicago', 'Chicago', array['North Side','South Side','West Side','North Shore','Northwest Suburbs','West Suburbs','South Suburbs','Northwest Indiana','Mobile (comes to you)']),
  ('detroit', 'Metro Detroit', array['Detroit','Dearborn','Oakland County','Macomb County','Downriver','Ann Arbor','Mobile (comes to you)'])
on conflict (slug) do nothing;
