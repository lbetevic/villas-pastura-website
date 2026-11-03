CREATE TABLE checkout_sessions (
  id TEXT PRIMARY KEY,
  quote_payload_json TEXT NOT NULL,
  language TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'submitted', 'expired')),
  tracking_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  submitted_at TEXT
);

CREATE INDEX idx_checkout_sessions_expires_at ON checkout_sessions(expires_at);

CREATE TABLE booking_requests (
  id TEXT PRIMARY KEY,
  checkout_id TEXT NOT NULL UNIQUE REFERENCES checkout_sessions(id),
  idempotency_key TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'received' CHECK (status IN ('received', 'reviewed', 'closed')),
  guest_json TEXT NOT NULL,
  stay_json TEXT NOT NULL,
  offer_json TEXT NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('pay_by_link', 'bank_transfer')),
  terms_version TEXT NOT NULL,
  privacy_version TEXT NOT NULL,
  marketing_accepted INTEGER NOT NULL DEFAULT 0 CHECK (marketing_accepted IN (0, 1)),
  consented_at TEXT NOT NULL,
  email_status TEXT NOT NULL DEFAULT 'pending' CHECK (email_status IN ('pending', 'sent', 'partial', 'failed', 'pending_configuration')),
  email_updated_at TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX idx_booking_requests_created_at ON booking_requests(created_at);
