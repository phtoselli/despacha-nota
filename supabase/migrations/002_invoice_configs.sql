CREATE TABLE IF NOT EXISTS invoice_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  status TEXT CHECK (status IN ('ready', 'pending_info', 'sent')) DEFAULT 'pending_info',
  auto_send_enabled BOOLEAN DEFAULT false,
  send_day INTEGER CHECK (send_day BETWEEN 1 AND 28),
  recipient_name TEXT,
  recipient_document_encrypted TEXT,
  recipient_email TEXT,
  service_description TEXT,
  amount DECIMAL(10,2),
  email_enabled BOOLEAN DEFAULT false,
  email_to TEXT,
  email_subject TEXT,
  email_body_template TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE invoice_configs ENABLE ROW LEVEL SECURITY;
