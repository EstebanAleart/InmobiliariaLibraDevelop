-- Create properties table
CREATE TABLE IF NOT EXISTS properties (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  square_meters DECIMAL(10, 2) NOT NULL,
  rental_price DECIMAL(10, 2) NOT NULL,
  expenses DECIMAL(10, 2),
  custom_services TEXT[] DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create rooms table (ambientes)
CREATE TABLE IF NOT EXISTS rooms (
  id SERIAL PRIMARY KEY,
  property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create property images table
CREATE TABLE IF NOT EXISTS property_images (
  id SERIAL PRIMARY KEY,
  property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  cloudinary_url TEXT NOT NULL,
  cloudinary_public_id VARCHAR(255) NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create services table
CREATE TABLE IF NOT EXISTS services (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create property_services junction table
CREATE TABLE IF NOT EXISTS property_services (
  property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  service_id INTEGER NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  PRIMARY KEY (property_id, service_id)
);

-- Insert default services
INSERT INTO services (name) VALUES 
  ('Luz'),
  ('Agua'),
  ('Gas'),
  ('Internet'),
  ('Cable'),
  ('Calefacción'),
  ('Aire Acondicionado'),
  ('Portero'),
  ('Seguridad 24hs')
ON CONFLICT (name) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_rooms_property_id ON rooms(property_id);
CREATE INDEX IF NOT EXISTS idx_property_images_property_id ON property_images(property_id);
CREATE INDEX IF NOT EXISTS idx_property_services_property_id ON property_services(property_id);
