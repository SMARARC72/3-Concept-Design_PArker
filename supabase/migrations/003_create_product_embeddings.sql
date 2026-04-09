-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Product Embeddings Table for RAG
CREATE TABLE IF NOT EXISTS product_embeddings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shopify_product_id bigint UNIQUE NOT NULL,
  product_handle text NOT NULL,
  title text NOT NULL,
  description text,
  embedding vector(1536),
  product_data jsonb,
  category text,
  tags text[],
  price decimal(10,2),
  available boolean DEFAULT true,
  updated_at timestamptz DEFAULT now()
);

-- Vector similarity index
CREATE INDEX IF NOT EXISTS idx_product_embeddings_vector 
  ON product_embeddings 
  USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Other indexes
CREATE INDEX IF NOT EXISTS idx_product_embeddings_category ON product_embeddings(category);
CREATE INDEX IF NOT EXISTS idx_product_embeddings_available ON product_embeddings(available);

-- Enable RLS (public read)
ALTER TABLE product_embeddings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view product embeddings"
  ON product_embeddings FOR SELECT
  USING (true);
