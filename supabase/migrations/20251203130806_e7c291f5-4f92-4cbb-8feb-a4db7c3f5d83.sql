-- Seed comprehensive challenges covering all hobby categories
INSERT INTO public.challenges (title, description, category, duration_minutes, difficulty, type, points, is_active) VALUES
-- Music challenges (Daily)
('Morning Melody', 'Create a simple melody using just 4 notes', 'music', 10, 'beginner', 'daily', 15, true),
('Rhythm Practice', 'Practice a basic drum beat for 15 minutes', 'music', 15, 'beginner', 'daily', 20, true),
('Chord Progression', 'Learn and practice a new chord progression', 'music', 20, 'moderate', 'daily', 30, true),
('Song Cover', 'Record a cover of your favorite song verse', 'music', 30, 'moderate', 'daily', 45, true),
('Improvisation Session', 'Freestyle jam for 20 minutes', 'music', 20, 'expert', 'daily', 50, true),

-- Art challenges (Daily)
('Quick Sketch', 'Draw a 5-minute gesture sketch of an object', 'art', 5, 'beginner', 'daily', 10, true),
('Color Study', 'Create a color palette inspired by nature', 'art', 15, 'beginner', 'daily', 20, true),
('Portrait Practice', 'Draw a self-portrait using any medium', 'art', 25, 'moderate', 'daily', 35, true),
('Abstract Expression', 'Create an abstract piece expressing an emotion', 'art', 30, 'moderate', 'daily', 40, true),
('Digital Art Challenge', 'Create a digital illustration from scratch', 'art', 45, 'expert', 'daily', 60, true),

-- Writing challenges (Daily)
('Morning Pages', 'Write 3 pages of stream-of-consciousness', 'writing', 15, 'beginner', 'daily', 20, true),
('Haiku Creation', 'Write 5 haikus about your day', 'writing', 10, 'beginner', 'daily', 15, true),
('Flash Fiction', 'Write a complete story in 500 words', 'writing', 25, 'moderate', 'daily', 35, true),
('Poetry Workshop', 'Write a poem using a specific form', 'writing', 20, 'moderate', 'daily', 30, true),
('Character Development', 'Create a detailed character profile', 'writing', 30, 'expert', 'daily', 45, true),

-- Dance challenges (Daily)
('Stretch Routine', 'Complete a 10-minute dance warm-up', 'dance', 10, 'beginner', 'daily', 15, true),
('Basic Steps', 'Learn 5 basic dance steps', 'dance', 15, 'beginner', 'daily', 20, true),
('Choreography Practice', 'Practice a 30-second choreography', 'dance', 20, 'moderate', 'daily', 30, true),
('Freestyle Session', 'Dance freestyle to 3 different songs', 'dance', 25, 'moderate', 'daily', 35, true),
('Full Routine', 'Perform a complete dance routine', 'dance', 30, 'expert', 'daily', 50, true),

-- Coding challenges (Daily)
('Code Kata', 'Solve a simple algorithm problem', 'coding', 15, 'beginner', 'daily', 20, true),
('Bug Hunt', 'Debug a piece of code', 'coding', 20, 'beginner', 'daily', 25, true),
('Feature Build', 'Build a small feature from scratch', 'coding', 30, 'moderate', 'daily', 40, true),
('Code Review', 'Review and refactor existing code', 'coding', 25, 'moderate', 'daily', 35, true),
('System Design', 'Design a simple system architecture', 'coding', 45, 'expert', 'daily', 60, true),

-- Photography challenges (Daily)
('Light Study', 'Capture 5 photos focusing on natural light', 'photography', 15, 'beginner', 'daily', 20, true),
('Macro Shot', 'Take close-up photos of small objects', 'photography', 20, 'beginner', 'daily', 25, true),
('Street Photography', 'Capture candid moments in public', 'photography', 30, 'moderate', 'daily', 40, true),
('Portrait Session', 'Take portrait photos with proper lighting', 'photography', 25, 'moderate', 'daily', 35, true),
('Photo Essay', 'Create a 10-photo story series', 'photography', 45, 'expert', 'daily', 55, true),

-- Fitness challenges (Daily)
('Morning Stretch', 'Complete a 10-minute stretching routine', 'fitness', 10, 'beginner', 'daily', 15, true),
('Cardio Burst', '15 minutes of high-intensity cardio', 'fitness', 15, 'beginner', 'daily', 20, true),
('Strength Training', 'Complete a bodyweight workout', 'fitness', 25, 'moderate', 'daily', 35, true),
('Yoga Flow', 'Practice a 30-minute yoga session', 'fitness', 30, 'moderate', 'daily', 40, true),
('HIIT Challenge', 'Complete an intense HIIT workout', 'fitness', 20, 'expert', 'daily', 45, true),

-- Cooking challenges (Daily)
('Quick Breakfast', 'Make a healthy breakfast in 15 minutes', 'cooking', 15, 'beginner', 'daily', 20, true),
('New Ingredient', 'Cook with an ingredient you have never used', 'cooking', 30, 'beginner', 'daily', 30, true),
('Cultural Cuisine', 'Prepare a dish from another culture', 'cooking', 45, 'moderate', 'daily', 45, true),
('Plating Art', 'Create a restaurant-style plated dish', 'cooking', 35, 'moderate', 'daily', 40, true),
('Full Course', 'Prepare a complete 3-course meal', 'cooking', 60, 'expert', 'daily', 70, true),

-- Gaming challenges (Daily)
('Speed Run', 'Complete a game level as fast as possible', 'gaming', 15, 'beginner', 'daily', 20, true),
('No-Damage Run', 'Complete a level without taking damage', 'gaming', 20, 'moderate', 'daily', 30, true),
('Strategy Master', 'Win a strategy game match', 'gaming', 30, 'moderate', 'daily', 35, true),
('Hardcore Mode', 'Play on the highest difficulty setting', 'gaming', 25, 'expert', 'daily', 45, true),
('Achievement Hunt', 'Unlock 3 new achievements', 'gaming', 45, 'expert', 'daily', 50, true),

-- Design challenges (Daily)
('Icon Design', 'Create a simple app icon', 'design', 15, 'beginner', 'daily', 20, true),
('Color Palette', 'Design a cohesive color palette', 'design', 10, 'beginner', 'daily', 15, true),
('Logo Sketch', 'Sketch 5 logo concepts', 'design', 25, 'moderate', 'daily', 35, true),
('UI Component', 'Design a reusable UI component', 'design', 30, 'moderate', 'daily', 40, true),
('Full Page Design', 'Design a complete landing page', 'design', 45, 'expert', 'daily', 55, true),

-- Weekly challenges across categories
('Music Album Review', 'Listen to and review a full album', 'music', 60, 'moderate', 'weekly', 80, true),
('Art Series', 'Create 7 related artworks in a week', 'art', 120, 'expert', 'weekly', 150, true),
('Short Story', 'Write a 3000-word short story', 'writing', 180, 'expert', 'weekly', 200, true),
('Dance Video', 'Create and film a 2-minute dance routine', 'dance', 90, 'expert', 'weekly', 120, true),
('Build an App', 'Build a small functional application', 'coding', 300, 'expert', 'weekly', 250, true),
('Photo Portfolio', 'Create a 20-photo portfolio', 'photography', 120, 'expert', 'weekly', 140, true),
('Fitness Week', 'Complete daily workouts for 7 days', 'fitness', 210, 'moderate', 'weekly', 180, true),
('Meal Prep', 'Plan and prepare meals for the week', 'cooking', 180, 'moderate', 'weekly', 160, true),
('Gaming Marathon', 'Complete a full game story mode', 'gaming', 300, 'moderate', 'weekly', 200, true),
('Brand Identity', 'Design a complete brand identity', 'design', 240, 'expert', 'weekly', 220, true);