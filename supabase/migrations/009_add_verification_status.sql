ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS verification_status text
DEFAULT 'pending'
CHECK (verification_status IN ('pending', 'verified', 'rejected'));
