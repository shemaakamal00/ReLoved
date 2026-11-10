-- Kunder kan loggga in med Google. Vi sparar deras Google ID i databasen.

-- Googles unika id för kontot. Kunden känns igen på det, aldrig på enbart e-post
ALTER TABLE users ADD COLUMN IF NOT EXISTS google_sub TEXT UNIQUE;

-- Ett google konto har inget lösenord hos oss.
ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;

-- Varje konto måste logga in på minst ett sätt
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_login_method_check;
ALTER TABLE users ADD CONSTRAINT users_login_method_check
    CHECK (password_hash IS NOT NULL OR google_sub IS NOT NULL);

-- Ordrar kopplas till kontot med user_id. Äldre ordrar från vanliga konton matchades på e-post. Koppas en gång
UPDATE orders o
SET user_id = u.id
FROM users u
WHERE o.user_id IS NULL
  AND u.google_sub IS NULL
  AND lower(o.email) = lower(u.email);
