-- ============================================
-- Add hobby_slug column to events table
-- Links events to hobbies for the hobby detail booking flow
-- ============================================

alter table events add column hobby_slug text;

create index idx_events_hobby_slug on events(hobby_slug);

-- ============================================
-- Update existing seed events with matching hobby slugs
-- ============================================
update events set hobby_slug = 'arts-crafts'  where title = 'Outdoor Sketch Walk';
update events set hobby_slug = 'fitness'      where title = '5K Morning Run';
update events set hobby_slug = 'music'        where title = 'Jazz Appreciation Night';
update events set hobby_slug = 'cooking'      where title = 'Recipe Swap Potluck';
update events set hobby_slug = 'gaming'       where title = 'Board Game Marathon';
update events set hobby_slug = 'yoga'         where title = 'Sunrise Yoga in the Park';
update events set hobby_slug = 'photography'  where title = 'Street Photography Walk';
update events set hobby_slug = 'dance'        where title = 'Beginner Salsa Night';
