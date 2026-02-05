CREATE TABLE IF NOT EXISTS invoice_emissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_id UUID REFERENCES invoice_configs(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status TEXT CHECK (status IN ('pending', 'processing', 'awaiting_confirmation', 'success', 'error', 'cancelled')) DEFAULT 'pending',
  government_response JSONB,
  pdf_url TEXT,
  email_sent BOOLEAN DEFAULT false,
  error_message TEXT,
  emitted_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE invoice_emissions ENABLE ROW LEVEL SECURITY;
