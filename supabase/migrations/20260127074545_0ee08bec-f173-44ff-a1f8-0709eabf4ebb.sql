-- Update existing NULL values to 'Trader' as fallback
UPDATE public.profiles SET first_name = 'Trader' WHERE first_name IS NULL OR TRIM(first_name) = '';

-- Add NOT NULL constraint with default value
ALTER TABLE public.profiles ALTER COLUMN first_name SET DEFAULT 'Trader';
ALTER TABLE public.profiles ALTER COLUMN first_name SET NOT NULL;

-- Add check constraint to ensure non-empty first name
ALTER TABLE public.profiles ADD CONSTRAINT profiles_first_name_not_empty CHECK (char_length(TRIM(first_name)) >= 1);

-- Add length constraint for security
ALTER TABLE public.profiles ADD CONSTRAINT profiles_first_name_max_length CHECK (char_length(first_name) <= 100);