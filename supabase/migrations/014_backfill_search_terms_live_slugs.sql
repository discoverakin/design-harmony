-- ============================================
-- Backfill events.search_terms for the live hobby vocabulary
-- Run this in the Supabase SQL Editor, after 013
--
-- WHY
-- Migration 013 covered the eleven slugs that appear in the app's code. The
-- live table uses thirty, none of which overlap the seven slugs in
-- src/data/hobbies.ts. This covers the rest, so keyword search reaches every
-- event rather than the minority whose slug happens to be known to the code.
--
-- Only fills events whose search_terms is still empty: safe to re-run, and it
-- never clobbers keywords a host entered on Create Event.
--
-- DATA HYGIENE — worth doing separately, not assumed here:
--   * `maker-space` (5) and `makerspace` (2) are the same hobby, spelled twice.
--   * `theatre` (1), `acting` (2) and `improv` (4) split one audience.
--   * `ceramics` (4) is what the code calls `pottery`.
--   * `glasswork` (2) overlaps `stained-glass` (5).
-- Merging those is a data decision, so this migration treats each as-is and
-- gives the duplicates matching vocabularies instead.
-- ============================================

with hobby_terms(slug, terms) as (
  values
    ('baking',           '{bread,sourdough,cake,pastry,dessert,cookies,dough,patisserie,oven,food}'::text[]),
    ('drawing',          '{sketch,sketching,pencil,charcoal,illustration,figure,ink,portrait,life}'::text[]),
    ('3d-printing',      '{3d,printer,printing,filament,cad,modeling,prototyping,additive,maker}'::text[]),
    ('painting',         '{paint,acrylic,watercolor,oils,canvas,brush,portrait,landscape,easel}'::text[]),
    ('sewing',           '{stitch,stitching,machine,pattern,garment,tailoring,alterations,fabric,textile}'::text[]),
    ('printmaking',      '{screenprinting,screenprint,linocut,letterpress,etching,block,press,ink,relief}'::text[]),
    ('wine-tasting',     '{wine,tasting,vineyard,sommelier,pairing,vintage,cellar,drinks}'::text[]),
    ('electronics',      '{circuits,soldering,arduino,breadboard,microcontroller,hardware,diy,tinkering}'::text[]),
    ('crochet',          '{yarn,hook,amigurumi,granny,stitch,wool,fiber,handmade}'::text[]),
    ('maker-space',      '{maker,tools,fabrication,laser,cnc,prototyping,woodworking,diy}'::text[]),
    ('makerspace',       '{maker,tools,fabrication,laser,cnc,prototyping,woodworking,diy}'::text[]),
    ('stained-glass',    '{glass,leading,soldering,mosaic,panel,suncatcher,foiling}'::text[]),
    ('quilting',         '{quilt,patchwork,fabric,applique,binding,piecing,sewing,textile}'::text[]),
    ('candle-making',    '{candles,wax,soy,beeswax,wicks,scent,fragrance,pouring}'::text[]),
    ('chocolate-making', '{chocolate,cocoa,truffles,tempering,confectionery,bonbons,dessert}'::text[]),
    ('ceramics',         '{clay,pottery,wheel,throwing,glazing,kiln,handbuilding,stoneware}'::text[]),
    ('improv',           '{comedy,improvisation,acting,performance,theatre,stage,scene,games}'::text[]),
    ('fiber-arts',       '{fiber,felting,wool,yarn,weaving,spinning,dyeing,textile,macrame}'::text[]),
    ('pastry',           '{baking,dessert,croissant,tart,patisserie,laminated,dough,cake}'::text[]),
    ('jewelry-making',   '{jewelry,beading,silversmithing,metalwork,wire,rings,earrings,pendant}'::text[]),
    ('glasswork',        '{glass,blowing,fusing,lampwork,kiln,mosaic,torch}'::text[]),
    ('singing',          '{vocals,voice,choir,harmony,karaoke,music,lessons}'::text[]),
    ('filmmaking',       '{film,video,cinematography,editing,camera,documentary,screenwriting,production}'::text[]),
    ('acting',           '{theatre,drama,performance,stage,scene,monologue,audition,improv}'::text[]),
    ('theatre',          '{theater,drama,acting,stage,performance,play,production}'::text[]),
    ('cocktail-making',  '{cocktails,mixology,bartending,drinks,spirits,shaker,garnish}'::text[]),
    ('robotics',         '{robots,arduino,electronics,coding,programming,engineering,servo,sensors}'::text[]),
    ('sculpture',        '{sculpting,clay,carving,modeling,plaster,stone,form,3d}'::text[]),
    ('floral-design',    '{flowers,floral,bouquet,arranging,ikebana,wreath,botanical,stems}'::text[])
)
update events e
set search_terms = h.terms
from hobby_terms h
where e.hobby_slug = h.slug
  and coalesce(cardinality(e.search_terms), 0) = 0;
