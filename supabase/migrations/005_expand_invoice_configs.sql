-- Prestador (Emissor)
ALTER TABLE invoice_configs ADD COLUMN IF NOT EXISTS prestador_cnpj TEXT;
ALTER TABLE invoice_configs ADD COLUMN IF NOT EXISTS prestador_razao_social TEXT;
ALTER TABLE invoice_configs ADD COLUMN IF NOT EXISTS prestador_inscricao_municipal TEXT;
ALTER TABLE invoice_configs ADD COLUMN IF NOT EXISTS prestador_codigo_municipio TEXT;
ALTER TABLE invoice_configs ADD COLUMN IF NOT EXISTS natureza_operacao INTEGER DEFAULT 1;
ALTER TABLE invoice_configs ADD COLUMN IF NOT EXISTS optante_simples_nacional BOOLEAN DEFAULT false;
ALTER TABLE invoice_configs ADD COLUMN IF NOT EXISTS regime_especial_tributacao INTEGER;

-- Tomador (Contratante) - endereco
ALTER TABLE invoice_configs ADD COLUMN IF NOT EXISTS tomador_telefone TEXT;
ALTER TABLE invoice_configs ADD COLUMN IF NOT EXISTS tomador_logradouro TEXT;
ALTER TABLE invoice_configs ADD COLUMN IF NOT EXISTS tomador_numero TEXT;
ALTER TABLE invoice_configs ADD COLUMN IF NOT EXISTS tomador_complemento TEXT;
ALTER TABLE invoice_configs ADD COLUMN IF NOT EXISTS tomador_bairro TEXT;
ALTER TABLE invoice_configs ADD COLUMN IF NOT EXISTS tomador_codigo_municipio TEXT;
ALTER TABLE invoice_configs ADD COLUMN IF NOT EXISTS tomador_uf TEXT;
ALTER TABLE invoice_configs ADD COLUMN IF NOT EXISTS tomador_cep TEXT;

-- Servico
ALTER TABLE invoice_configs ADD COLUMN IF NOT EXISTS servico_aliquota_iss DECIMAL(5,2);
ALTER TABLE invoice_configs ADD COLUMN IF NOT EXISTS servico_iss_retido BOOLEAN DEFAULT false;
ALTER TABLE invoice_configs ADD COLUMN IF NOT EXISTS servico_item_lista_servico TEXT;
ALTER TABLE invoice_configs ADD COLUMN IF NOT EXISTS servico_codigo_cnae TEXT;
ALTER TABLE invoice_configs ADD COLUMN IF NOT EXISTS servico_codigo_tributacao_municipio TEXT;
ALTER TABLE invoice_configs ADD COLUMN IF NOT EXISTS servico_valor_deducoes DECIMAL(10,2);
ALTER TABLE invoice_configs ADD COLUMN IF NOT EXISTS servico_codigo_municipio_prestacao TEXT;
