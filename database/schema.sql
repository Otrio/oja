-- Create custom types
CREATE TYPE unit_type AS ENUM ('unit', 'pack', 'carton');

-- Create products table
CREATE TABLE products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    name TEXT NOT NULL,
    category TEXT,
    description TEXT,
    units_per_pack INTEGER DEFAULT 1,
    units_per_carton INTEGER DEFAULT 1,
    unit_buying_price DECIMAL(10,2),
    pack_buying_price DECIMAL(10,2),
    carton_buying_price DECIMAL(10,2),
    unit_selling_price DECIMAL(10,2),
    pack_selling_price DECIMAL(10,2),
    carton_selling_price DECIMAL(10,2),
    current_stock INTEGER DEFAULT 0,
    minimum_stock INTEGER DEFAULT 0,
    image_url TEXT,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    CONSTRAINT positive_units CHECK (units_per_pack > 0 AND units_per_carton > 0),
    CONSTRAINT positive_prices CHECK (
        unit_buying_price >= 0 AND
        pack_buying_price >= 0 AND
        carton_buying_price >= 0 AND
        unit_selling_price >= 0 AND
        pack_selling_price >= 0 AND
        carton_selling_price >= 0
    )
);

-- Create sales table
CREATE TABLE sales (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    date DATE DEFAULT CURRENT_DATE,
    units INTEGER DEFAULT 0,
    packs INTEGER DEFAULT 0,
    cartons INTEGER DEFAULT 0,
    total_units_sold INTEGER NOT NULL,
    price_per_unit DECIMAL(10,2),
    price_per_pack DECIMAL(10,2),
    price_per_carton DECIMAL(10,2),
    total_price DECIMAL(10,2) NOT NULL,
    profit DECIMAL(10,2),
    notes TEXT,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    CONSTRAINT positive_quantities CHECK (
        units >= 0 AND
        packs >= 0 AND
        cartons >= 0 AND
        total_units_sold > 0
    ),
    CONSTRAINT positive_sale_prices CHECK (
        price_per_unit >= 0 AND
        price_per_pack >= 0 AND
        price_per_carton >= 0 AND
        total_price > 0
    )
);

-- Create purchases table
CREATE TABLE purchases (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    date DATE DEFAULT CURRENT_DATE,
    units INTEGER DEFAULT 0,
    packs INTEGER DEFAULT 0,
    cartons INTEGER DEFAULT 0,
    total_units_bought INTEGER NOT NULL,
    price_per_unit DECIMAL(10,2),
    price_per_pack DECIMAL(10,2),
    price_per_carton DECIMAL(10,2),
    total_price DECIMAL(10,2) NOT NULL,
    supplier TEXT,
    notes TEXT,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    CONSTRAINT positive_quantities CHECK (
        units >= 0 AND
        packs >= 0 AND
        cartons >= 0 AND
        total_units_bought > 0
    ),
    CONSTRAINT positive_purchase_prices CHECK (
        price_per_unit >= 0 AND
        price_per_pack >= 0 AND
        price_per_carton >= 0 AND
        total_price > 0
    )
);

-- Create indexes for better query performance
CREATE INDEX idx_products_user ON products(user_id);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_sales_user ON sales(user_id);
CREATE INDEX idx_sales_product ON sales(product_id);
CREATE INDEX idx_sales_date ON sales(date);
CREATE INDEX idx_purchases_user ON purchases(user_id);
CREATE INDEX idx_purchases_product ON purchases(product_id);
CREATE INDEX idx_purchases_date ON purchases(date);

-- Create batches table to persist per-product batch records
CREATE TABLE batches (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    packs INTEGER DEFAULT 0,
    cartons INTEGER DEFAULT 0,
    units INTEGER DEFAULT 0,
    units_added INTEGER NOT NULL,
    remaining_units INTEGER NOT NULL,
    cost_per_unit DECIMAL(10,2),
    cost_per_pack DECIMAL(10,2),
    selling_per_unit DECIMAL(10,2),
    selling_per_pack DECIMAL(10,2),
    notes TEXT,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    CONSTRAINT positive_batch_quantities CHECK (packs >= 0 AND cartons >= 0 AND units >= 0 AND units_added > 0 AND remaining_units >= 0)
);

CREATE INDEX idx_batches_product ON batches(product_id);
CREATE INDEX idx_batches_user ON batches(user_id);

-- RLS for batches
ALTER TABLE batches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own batches"
    ON batches FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own batches"
    ON batches FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own batches"
    ON batches FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own batches"
    ON batches FOR DELETE
    USING (auth.uid() = user_id);


-- Create an updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers to update the updated_at column
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_sales_updated_at
    BEFORE UPDATE ON sales
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_purchases_updated_at
    BEFORE UPDATE ON purchases
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

-- Row Level Security Policies
-- Products RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own products"
    ON products FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own products"
    ON products FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own products"
    ON products FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own products"
    ON products FOR DELETE
    USING (auth.uid() = user_id);

-- Sales RLS
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own sales"
    ON sales FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sales"
    ON sales FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sales"
    ON sales FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sales"
    ON sales FOR DELETE
    USING (auth.uid() = user_id);

-- Purchases RLS
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own purchases"
    ON purchases FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own purchases"
    ON purchases FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own purchases"
    ON purchases FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own purchases"
    ON purchases FOR DELETE
    USING (auth.uid() = user_id);

-- Create a function to calculate total units
CREATE OR REPLACE FUNCTION calculate_total_units(
    units INTEGER,
    packs INTEGER,
    cartons INTEGER,
    units_per_pack INTEGER,
    units_per_carton INTEGER
) RETURNS INTEGER AS $$
BEGIN
    RETURN (
        COALESCE(units, 0) +
        (COALESCE(packs, 0) * COALESCE(units_per_pack, 1)) +
        (COALESCE(cartons, 0) * COALESCE(units_per_carton, 1))
    );
END;
$$ LANGUAGE plpgsql;