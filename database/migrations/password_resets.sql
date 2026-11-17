-- Engångslänkar för återställning av lösenord
CREATE TABLE IF NOT EXISTS password_resets (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS password_resets_user_idx ON password_resets(user_id);

-- Bara servern, med service nyckeln får läsa och skriva 
ALTER TABLE password_resets ENABLE ROW LEVEL SECURITY;

-- Samma e-postadress får inte finnas två gånger, oavsett stora och små bokstäver
CREATE UNIQUE INDEX IF NOT EXISTS users_email_lower_key ON users (lower(email));