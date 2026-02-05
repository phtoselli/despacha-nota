-- User Settings policies
CREATE POLICY "Users can view own settings"
  ON user_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings"
  ON user_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings"
  ON user_settings FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Invoice Configs policies
CREATE POLICY "Users can view own invoice configs"
  ON invoice_configs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own invoice configs"
  ON invoice_configs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own invoice configs"
  ON invoice_configs FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own invoice configs"
  ON invoice_configs FOR DELETE
  USING (auth.uid() = user_id);

-- Invoice Emissions policies
CREATE POLICY "Users can view own emissions"
  ON invoice_emissions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own emissions"
  ON invoice_emissions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own emissions"
  ON invoice_emissions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
