-- Shoppens admin loggar in med GitHub. 
ALTER TABLE users ADD COLUMN IF NOT EXISTS github_id BIGINT UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS github_login TEXT;

-- Admin sparas utan e-post
ALTER TABLE users ALTER COLUMN email DROP NOT NULL;

-- Man måste logga in på minst ett sätt
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_login_method_check;
ALTER TABLE users ADD CONSTRAINT users_login_method_check
    CHECK (password_hash IS NOT NULL OR google_sub IS NOT NULL OR github_id IS NOT NULL);

-- Admin kontot är bara GitHub, gamla admins med lösenord bara blir kunder
UPDATE users SET role = 'customer' WHERE role = 'admin' AND github_id IS NULL;
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_admin_needs_github_check;
ALTER TABLE users ADD CONSTRAINT users_admin_needs_github_check
  CHECK (role <> 'admin' OR github_id IS NOT NULL);