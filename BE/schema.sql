-- GenZaic Creator Hub - PostgreSQL Database Schema
-- Digital Product Marketplace Platform
-- Version: 1.0.0
-- Last Updated: 2025-12-30

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- ENUMS
-- ============================================================================

CREATE TYPE user_role AS ENUM ('buyer', 'seller', 'admin');
CREATE TYPE kyc_status AS ENUM ('not_submitted', 'pending', 'verified', 'rejected');
CREATE TYPE plan_type AS ENUM ('creator', 'startup', 'enterprise');
CREATE TYPE product_status AS ENUM ('draft', 'published', 'archived');
CREATE TYPE product_category AS ENUM ('ebook', 'template', 'app', 'course', 'graphics', 'audio', 'other');
CREATE TYPE delivery_type AS ENUM ('download', 'external_link', 'manual');
CREATE TYPE order_status AS ENUM ('pending', 'completed', 'refunded', 'failed');
CREATE TYPE delivery_status AS ENUM ('pending', 'delivered');
CREATE TYPE payout_status AS ENUM ('pending', 'processing', 'completed', 'failed');
CREATE TYPE penny_drop_status AS ENUM ('pending', 'success', 'failed');
CREATE TYPE platform_fee_mode AS ENUM ('seller', 'buyer');
CREATE TYPE notification_type AS ENUM ('order', 'payout', 'kyc', 'system', 'product');

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    role user_role DEFAULT 'buyer' NOT NULL,
    is_seller BOOLEAN DEFAULT FALSE,
    store_url VARCHAR(100) UNIQUE, -- Custom store URL slug (only for sellers)
    plan_type plan_type DEFAULT 'creator',
    kyc_status kyc_status DEFAULT 'not_submitted',
    onboarding_complete BOOLEAN DEFAULT FALSE,
    email_verified BOOLEAN DEFAULT FALSE,
    email_verification_token VARCHAR(255),
    email_verification_expires_at TIMESTAMP,
    password_reset_token VARCHAR(255),
    password_reset_expires_at TIMESTAMP,
    followers_count INTEGER DEFAULT 0,
    total_products INTEGER DEFAULT 0,
    total_sales INTEGER DEFAULT 0,
    total_revenue DECIMAL(10, 2) DEFAULT 0.00,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP
);

-- Storefront Settings Table
CREATE TABLE storefronts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    profile_image_url TEXT,
    cover_image_url TEXT,
    tagline TEXT,
    bio TEXT,
    theme_id UUID,
    primary_color VARCHAR(7) DEFAULT '#6366f1', -- Hex color code
    font_family VARCHAR(100) DEFAULT 'Inter',
    is_published BOOLEAN DEFAULT FALSE,
    platform_fee_mode platform_fee_mode DEFAULT 'buyer',
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20),
    contact_whatsapp VARCHAR(20),
    social_instagram VARCHAR(255),
    social_twitter VARCHAR(255),
    social_youtube VARCHAR(255),
    social_website VARCHAR(255),
    custom_css TEXT,
    custom_domain VARCHAR(255),
    seo_title VARCHAR(255),
    seo_description TEXT,
    seo_keywords TEXT,
    analytics_id VARCHAR(100), -- Google Analytics ID
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Storefront Themes Table
CREATE TABLE storefront_themes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    thumbnail_url TEXT NOT NULL,
    primary_color VARCHAR(7) NOT NULL,
    description TEXT,
    is_premium BOOLEAN DEFAULT FALSE,
    css_template TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products Table
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    short_description VARCHAR(500),
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    original_price DECIMAL(10, 2), -- For showing discounts
    currency VARCHAR(3) DEFAULT 'INR',
    category product_category DEFAULT 'other',
    status product_status DEFAULT 'draft',
    delivery_type delivery_type DEFAULT 'download',
    file_url TEXT, -- S3/Cloud storage URL for download type
    file_size_mb DECIMAL(10, 2),
    external_url TEXT, -- For external_link delivery type
    thumbnail_url TEXT,
    preview_images TEXT[], -- Array of image URLs
    demo_url TEXT, -- Preview/demo link
    seo_title VARCHAR(255),
    seo_description TEXT,
    seo_keywords TEXT,
    downloads_count INTEGER DEFAULT 0,
    views_count INTEGER DEFAULT 0,
    sales_count INTEGER DEFAULT 0,
    revenue_total DECIMAL(10, 2) DEFAULT 0.00,
    rating_average DECIMAL(3, 2) DEFAULT 0.00 CHECK (rating_average >= 0 AND rating_average <= 5),
    reviews_count INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    max_downloads_per_purchase INTEGER DEFAULT 5,
    download_expiry_days INTEGER DEFAULT 7,
    seller_contact_email VARCHAR(255), -- For manual delivery
    seller_contact_phone VARCHAR(20),
    seller_contact_whatsapp VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    published_at TIMESTAMP
);

-- Orders Table
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(50) UNIQUE NOT NULL, -- Format: ORD-YYYYMMDD-XXXX
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    seller_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    buyer_id UUID REFERENCES users(id) ON DELETE SET NULL, -- Nullable for guest checkout
    buyer_email VARCHAR(255) NOT NULL,
    buyer_name VARCHAR(255) NOT NULL,
    buyer_phone VARCHAR(20),
    buyer_gstin VARCHAR(15), -- GST Identification Number for businesses
    buyer_address TEXT,
    amount DECIMAL(10, 2) NOT NULL, -- Base product price
    gst_amount DECIMAL(10, 2) DEFAULT 0.00, -- 18% GST
    platform_fee DECIMAL(10, 2) DEFAULT 0.00, -- 10% platform fee
    total_amount DECIMAL(10, 2) NOT NULL, -- Final amount paid
    seller_earnings DECIMAL(10, 2) NOT NULL, -- Amount seller receives
    currency VARCHAR(3) DEFAULT 'INR',
    status order_status DEFAULT 'pending',
    delivery_status delivery_status DEFAULT 'pending',
    delivery_type delivery_type NOT NULL,
    external_url TEXT,
    payment_method VARCHAR(50), -- razorpay, stripe, etc.
    payment_id VARCHAR(255), -- Payment gateway transaction ID
    payment_signature VARCHAR(255),
    download_count INTEGER DEFAULT 0,
    max_downloads INTEGER DEFAULT 5,
    download_link TEXT, -- Secure download link
    download_expires_at TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    refunded_at TIMESTAMP,
    refund_reason TEXT
);

-- Invoices Table
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_number VARCHAR(50) UNIQUE NOT NULL, -- Format: GENZAIC/YYYY/NNNNN
    order_id UUID UNIQUE NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
    seller_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    seller_name VARCHAR(255) NOT NULL,
    seller_email VARCHAR(255) NOT NULL,
    seller_gstin VARCHAR(15),
    seller_address TEXT,
    buyer_name VARCHAR(255) NOT NULL,
    buyer_email VARCHAR(255) NOT NULL,
    buyer_gstin VARCHAR(15),
    buyer_address TEXT,
    product_title VARCHAR(255) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    gst_amount DECIMAL(10, 2) NOT NULL,
    platform_fee DECIMAL(10, 2) DEFAULT 0.00,
    total_amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    invoice_url TEXT, -- PDF URL
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Download Logs Table
CREATE TABLE download_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    buyer_id UUID REFERENCES users(id) ON DELETE SET NULL,
    buyer_email VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45), -- IPv6 compatible
    user_agent TEXT,
    download_url TEXT,
    downloaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- KYC Documents Table
CREATE TABLE kyc_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    pan_number VARCHAR(10), -- PAN card number
    pan_file_url TEXT,
    aadhaar_number VARCHAR(12), -- Aadhaar number (encrypted)
    aadhaar_file_url TEXT,
    account_holder_name VARCHAR(255),
    account_number VARCHAR(50),
    ifsc_code VARCHAR(11),
    bank_name VARCHAR(255),
    branch_name VARCHAR(255),
    penny_drop_status penny_drop_status DEFAULT 'pending',
    verification_status kyc_status DEFAULT 'pending',
    verified_at TIMESTAMP,
    rejection_reason TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payouts Table
CREATE TABLE payouts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    payout_number VARCHAR(50) UNIQUE NOT NULL, -- Format: PAYOUT-YYYYMMDD-XXXX
    amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
    currency VARCHAR(3) DEFAULT 'INR',
    status payout_status DEFAULT 'pending',
    bank_account_number VARCHAR(50),
    ifsc_code VARCHAR(11),
    account_holder_name VARCHAR(255),
    utr_number VARCHAR(50), -- Unique Transaction Reference
    transaction_id VARCHAR(255), -- Payment gateway transaction ID
    processing_fee DECIMAL(10, 2) DEFAULT 0.00,
    net_amount DECIMAL(10, 2), -- Amount after processing fees
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP,
    completed_at TIMESTAMP,
    failed_reason TEXT
);

-- Reviews Table
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255),
    comment TEXT,
    is_verified_purchase BOOLEAN DEFAULT TRUE,
    is_published BOOLEAN DEFAULT TRUE,
    helpful_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(product_id, user_id, order_id) -- One review per product per order
);

-- Notifications Table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type notification_type NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    link_url TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    metadata JSONB, -- Additional data as JSON
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP
);

-- Sessions Table (for authentication)
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    refresh_token VARCHAR(255),
    ip_address VARCHAR(45),
    user_agent TEXT,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Referrals Table (for affiliate/referral program)
CREATE TABLE referrals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    referrer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    referred_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    referral_code VARCHAR(50) NOT NULL,
    commission_rate DECIMAL(5, 2) DEFAULT 5.00, -- Percentage
    commission_earned DECIMAL(10, 2) DEFAULT 0.00,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(referrer_id, referred_id)
);

-- Coupons Table
CREATE TABLE coupons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE, -- NULL for platform-wide coupons
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value DECIMAL(10, 2) NOT NULL CHECK (discount_value > 0),
    min_purchase_amount DECIMAL(10, 2) DEFAULT 0.00,
    max_discount_amount DECIMAL(10, 2),
    usage_limit INTEGER, -- NULL for unlimited
    usage_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    starts_at TIMESTAMP,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Coupon Usage Table
CREATE TABLE coupon_usages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    coupon_id UUID NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    discount_amount DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Platform Settings Table
CREATE TABLE platform_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Activity Logs Table (Audit Trail)
CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50), -- e.g., 'product', 'order', 'user'
    entity_id UUID,
    ip_address VARCHAR(45),
    user_agent TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Users indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_store_url ON users(store_url);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_created_at ON users(created_at);

-- Products indexes
CREATE INDEX idx_products_user_id ON products(user_id);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_created_at ON products(created_at DESC);
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_products_featured ON products(is_featured) WHERE is_featured = TRUE;
CREATE INDEX idx_products_sales_count ON products(sales_count DESC);
CREATE INDEX idx_products_rating ON products(rating_average DESC);

-- Orders indexes
CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_orders_product_id ON orders(product_id);
CREATE INDEX idx_orders_seller_id ON orders(seller_id);
CREATE INDEX idx_orders_buyer_id ON orders(buyer_id);
CREATE INDEX idx_orders_buyer_email ON orders(buyer_email);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_orders_payment_id ON orders(payment_id);

-- Invoices indexes
CREATE INDEX idx_invoices_invoice_number ON invoices(invoice_number);
CREATE INDEX idx_invoices_order_id ON invoices(order_id);
CREATE INDEX idx_invoices_seller_id ON invoices(seller_id);

-- Download Logs indexes
CREATE INDEX idx_download_logs_order_id ON download_logs(order_id);
CREATE INDEX idx_download_logs_product_id ON download_logs(product_id);
CREATE INDEX idx_download_logs_buyer_id ON download_logs(buyer_id);
CREATE INDEX idx_download_logs_downloaded_at ON download_logs(downloaded_at DESC);

-- Payouts indexes
CREATE INDEX idx_payouts_user_id ON payouts(user_id);
CREATE INDEX idx_payouts_status ON payouts(status);
CREATE INDEX idx_payouts_created_at ON payouts(created_at DESC);

-- Reviews indexes
CREATE INDEX idx_reviews_product_id ON reviews(product_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_reviews_created_at ON reviews(created_at DESC);

-- Notifications indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- Sessions indexes
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_token ON sessions(token);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_storefronts_updated_at BEFORE UPDATE ON storefronts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_kyc_documents_updated_at BEFORE UPDATE ON kyc_documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update product stats when order is completed
CREATE OR REPLACE FUNCTION update_product_stats_on_order()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
        UPDATE products
        SET
            sales_count = sales_count + 1,
            revenue_total = revenue_total + NEW.amount
        WHERE id = NEW.product_id;

        UPDATE users
        SET
            total_sales = total_sales + 1,
            total_revenue = total_revenue + NEW.seller_earnings
        WHERE id = NEW.seller_id;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_update_product_stats
AFTER INSERT OR UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION update_product_stats_on_order();

-- Function to update download count
CREATE OR REPLACE FUNCTION update_download_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE orders
    SET download_count = download_count + 1
    WHERE id = NEW.order_id;

    UPDATE products
    SET downloads_count = downloads_count + 1
    WHERE id = NEW.product_id;

    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_update_download_count
AFTER INSERT ON download_logs
FOR EACH ROW
EXECUTE FUNCTION update_download_count();

-- Function to update product rating when review is added/updated
CREATE OR REPLACE FUNCTION update_product_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE products
    SET
        rating_average = (SELECT AVG(rating)::DECIMAL(3,2) FROM reviews WHERE product_id = NEW.product_id AND is_published = TRUE),
        reviews_count = (SELECT COUNT(*) FROM reviews WHERE product_id = NEW.product_id AND is_published = TRUE)
    WHERE id = NEW.product_id;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_update_product_rating
AFTER INSERT OR UPDATE ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_product_rating();

-- ============================================================================
-- VIEWS
-- ============================================================================

-- View for seller dashboard stats
CREATE OR REPLACE VIEW seller_dashboard_stats AS
SELECT
    u.id as user_id,
    u.name,
    u.store_url,
    COUNT(DISTINCT p.id) as total_products,
    COUNT(DISTINCT CASE WHEN o.status = 'completed' THEN o.id END) as total_orders,
    COALESCE(SUM(CASE WHEN o.status = 'completed' THEN o.seller_earnings ELSE 0 END), 0) as total_revenue,
    COALESCE(SUM(CASE WHEN o.status = 'completed' AND o.created_at >= CURRENT_DATE - INTERVAL '30 days' THEN o.seller_earnings ELSE 0 END), 0) as revenue_last_30_days,
    COUNT(DISTINCT CASE WHEN o.status = 'completed' AND o.created_at >= CURRENT_DATE - INTERVAL '7 days' THEN o.id END) as orders_last_7_days
FROM users u
LEFT JOIN products p ON u.id = p.user_id
LEFT JOIN orders o ON p.id = o.product_id
WHERE u.is_seller = TRUE
GROUP BY u.id, u.name, u.store_url;

-- View for product analytics
CREATE OR REPLACE VIEW product_analytics AS
SELECT
    p.id,
    p.title,
    p.user_id,
    u.name as seller_name,
    p.price,
    p.sales_count,
    p.revenue_total,
    p.downloads_count,
    p.views_count,
    p.rating_average,
    p.reviews_count,
    COALESCE(p.sales_count::DECIMAL / NULLIF(p.views_count, 0) * 100, 0)::DECIMAL(5,2) as conversion_rate
FROM products p
JOIN users u ON p.user_id = u.id;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE users IS 'User accounts - buyers, sellers, and admins';
COMMENT ON TABLE storefronts IS 'Customizable storefront settings for sellers';
COMMENT ON TABLE products IS 'Digital products catalog';
COMMENT ON TABLE orders IS 'Transaction records for product purchases';
COMMENT ON TABLE invoices IS 'GST-compliant invoices for orders';
COMMENT ON TABLE download_logs IS 'Track product downloads per order';
COMMENT ON TABLE kyc_documents IS 'KYC verification documents for payouts';
COMMENT ON TABLE payouts IS 'Seller earnings withdrawal requests';
COMMENT ON TABLE reviews IS 'Product reviews and ratings';
COMMENT ON TABLE notifications IS 'User notifications';
COMMENT ON TABLE sessions IS 'User authentication sessions';
COMMENT ON TABLE referrals IS 'Affiliate/referral program tracking';
COMMENT ON TABLE coupons IS 'Discount coupons';
COMMENT ON TABLE platform_settings IS 'Platform-wide configuration settings';
COMMENT ON TABLE activity_logs IS 'Audit trail for all user actions';
