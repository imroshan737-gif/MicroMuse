-- Create enum types
CREATE TYPE public.app_role AS ENUM ('admin', 'user');
CREATE TYPE public.challenge_category AS ENUM ('music', 'art', 'writing', 'dance', 'coding', 'photography', 'fitness', 'cooking', 'gaming', 'design');
CREATE TYPE public.difficulty_level AS ENUM ('beginner', 'moderate', 'expert');
CREATE TYPE public.challenge_type AS ENUM ('daily', 'weekly', 'personal');
CREATE TYPE public.user_status AS ENUM ('online', 'away', 'busy', 'offline');

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  username TEXT UNIQUE,
  avatar_url TEXT,
  bio TEXT,
  mood TEXT,
  location TEXT,
  is_profile_public BOOLEAN DEFAULT true,
  user_status user_status DEFAULT 'offline',
  two_factor_enabled BOOLEAN DEFAULT false,
  profile_completion INTEGER DEFAULT 0,
  total_points INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  total_sessions INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- User roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Hobbies master table
CREATE TABLE public.hobbies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  icon TEXT,
  emoji TEXT,
  popularity_count INTEGER DEFAULT 0,
  is_trending BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- User hobbies junction table
CREATE TABLE public.user_hobbies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  hobby_id UUID REFERENCES public.hobbies(id) ON DELETE CASCADE NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, hobby_id)
);

-- Challenges table
CREATE TABLE public.challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category challenge_category NOT NULL,
  difficulty difficulty_level NOT NULL,
  type challenge_type NOT NULL,
  points INTEGER DEFAULT 10,
  duration_minutes INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- User challenges (participation tracking)
CREATE TABLE public.user_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  challenge_id UUID REFERENCES public.challenges(id) ON DELETE CASCADE NOT NULL,
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  score INTEGER,
  is_completed BOOLEAN DEFAULT false,
  submission_url TEXT,
  UNIQUE(user_id, challenge_id, started_at)
);

-- Achievements table
CREATE TABLE public.achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  badge_url TEXT,
  requirement_type TEXT NOT NULL,
  requirement_value INTEGER NOT NULL,
  points INTEGER DEFAULT 50,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- User achievements
CREATE TABLE public.user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  achievement_id UUID REFERENCES public.achievements(id) ON DELETE CASCADE NOT NULL,
  earned_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- User activity tracking for heatmap
CREATE TABLE public.user_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  activity_date DATE NOT NULL,
  sessions_count INTEGER DEFAULT 0,
  points_earned INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, activity_date)
);

-- Notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hobbies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_hobbies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS Policies for profiles
CREATE POLICY "Users can view all public profiles"
  ON public.profiles FOR SELECT
  USING (is_profile_public = true OR auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- RLS Policies for user_roles
CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for hobbies
CREATE POLICY "Anyone can view hobbies"
  ON public.hobbies FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage hobbies"
  ON public.hobbies FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for user_hobbies
CREATE POLICY "Users can view own hobbies"
  ON public.user_hobbies FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own hobbies"
  ON public.user_hobbies FOR ALL
  USING (auth.uid() = user_id);

-- RLS Policies for challenges
CREATE POLICY "Anyone can view active challenges"
  ON public.challenges FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage challenges"
  ON public.challenges FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for user_challenges
CREATE POLICY "Users can view own challenge progress"
  ON public.user_challenges FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own challenge progress"
  ON public.user_challenges FOR ALL
  USING (auth.uid() = user_id);

-- RLS Policies for achievements
CREATE POLICY "Anyone can view achievements"
  ON public.achievements FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for user_achievements
CREATE POLICY "Users can view own achievements"
  ON public.user_achievements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert achievements"
  ON public.user_achievements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for user_activity
CREATE POLICY "Users can view own activity"
  ON public.user_activity FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own activity"
  ON public.user_activity FOR ALL
  USING (auth.uid() = user_id);

-- RLS Policies for notifications
CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- Trigger function to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, username)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    LOWER(SPLIT_PART(NEW.email, '@', 1))
  );
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger to update profile updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Insert initial hobbies data
INSERT INTO public.hobbies (name, category, emoji, icon) VALUES
  ('Singing', 'Music', '🎤', 'Music'),
  ('Guitar', 'Music', '🎸', 'Music'),
  ('Piano', 'Music', '🎹', 'Music'),
  ('DJing', 'Music', '🎧', 'Music'),
  ('Drumming', 'Music', '🥁', 'Music'),
  ('Painting', 'Art', '🎨', 'Palette'),
  ('Drawing', 'Art', '✏️', 'PenTool'),
  ('Sculpture', 'Art', '🗿', 'Palette'),
  ('Digital Art', 'Art', '💻', 'Palette'),
  ('Creative Writing', 'Writing', '✍️', 'PenTool'),
  ('Poetry', 'Writing', '📝', 'PenTool'),
  ('Blogging', 'Writing', '📰', 'PenTool'),
  ('Novel Writing', 'Writing', '📚', 'PenTool'),
  ('Hip Hop Dance', 'Dance', '💃', 'Music'),
  ('Ballet', 'Dance', '🩰', 'Music'),
  ('Contemporary Dance', 'Dance', '🕺', 'Music'),
  ('Salsa', 'Dance', '💃', 'Music'),
  ('Web Development', 'Coding', '💻', 'Code'),
  ('Mobile Apps', 'Coding', '📱', 'Smartphone'),
  ('Game Development', 'Coding', '🎮', 'Gamepad2'),
  ('Machine Learning', 'Coding', '🤖', 'Brain'),
  ('Data Science', 'Coding', '📊', 'BarChart'),
  ('Portrait Photography', 'Photography', '📷', 'Camera'),
  ('Landscape Photography', 'Photography', '🏞️', 'Camera'),
  ('Street Photography', 'Photography', '🌆', 'Camera'),
  ('Yoga', 'Fitness', '🧘', 'Heart'),
  ('Running', 'Fitness', '🏃', 'Flame'),
  ('Weight Training', 'Fitness', '🏋️', 'Dumbbell'),
  ('Cycling', 'Fitness', '🚴', 'Bike'),
  ('Swimming', 'Fitness', '🏊', 'Waves'),
  ('Baking', 'Cooking', '🍰', 'UtensilsCrossed'),
  ('International Cuisine', 'Cooking', '🍜', 'UtensilsCrossed'),
  ('Vegan Cooking', 'Cooking', '🥗', 'Leaf'),
  ('PC Gaming', 'Gaming', '🖥️', 'Gamepad2'),
  ('Console Gaming', 'Gaming', '🎮', 'Gamepad2'),
  ('Mobile Gaming', 'Gaming', '📱', 'Smartphone'),
  ('Graphic Design', 'Design', '🎨', 'Palette'),
  ('UI/UX Design', 'Design', '📐', 'Figma'),
  ('3D Modeling', 'Design', '🎭', 'Box'),
  ('Animation', 'Design', '🎬', 'Film');

-- Insert sample challenges
INSERT INTO public.challenges (title, description, category, difficulty, type, points, duration_minutes) VALUES
  ('Morning Melody', 'Record a 60-second melody using your voice or instrument', 'music', 'beginner', 'daily', 10, 5),
  ('Code Sprint', 'Solve 3 coding problems in 30 minutes', 'coding', 'moderate', 'daily', 20, 30),
  ('Quick Sketch', 'Draw a portrait in under 10 minutes', 'art', 'beginner', 'daily', 10, 10),
  ('Dance Routine', 'Create a 30-second dance video', 'dance', 'moderate', 'daily', 15, 15),
  ('Weekly Photography Series', 'Take 7 photos around one theme', 'photography', 'expert', 'weekly', 50, 300),
  ('30-Day Fitness Challenge', 'Complete daily workout plan', 'fitness', 'expert', 'personal', 100, 1800);

-- Insert sample achievements
INSERT INTO public.achievements (name, description, icon, requirement_type, requirement_value, points) VALUES
  ('First Steps', 'Complete your first session', 'Star', 'sessions', 1, 10),
  ('Week Warrior', 'Maintain 7-day streak', 'Flame', 'streak', 7, 50),
  ('Century Club', 'Complete 100 sessions', 'Trophy', 'sessions', 100, 200),
  ('Point Master', 'Earn 1000 points', 'Award', 'points', 1000, 150);