-- Migration Rollback: 001_initial_schema
-- Description: Rollback initial database schema
-- Created: 2025-12-30

BEGIN;

-- Drop views
DROP VIEW IF EXISTS product_analytics;
DROP VIEW IF EXISTS seller_dashboard_stats;

-- Drop triggers
DROP TRIGGER IF EXISTS trigger_update_product_rating ON reviews;
DROP TRIGGER IF EXISTS trigger_update_download_count ON download_logs;
DROP TRIGGER IF EXISTS trigger_update_product_stats ON orders;
DROP TRIGGER IF EXISTS update_sessions_updated_at ON sessions;
DROP TRIGGER IF EXISTS update_reviews_updated_at ON reviews;
DROP TRIGGER IF EXISTS update_kyc_documents_updated_at ON kyc_documents;
DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
DROP TRIGGER IF EXISTS update_storefronts_updated_at ON storefronts;
DROP TRIGGER IF EXISTS update_users_updated_at ON users;

-- Drop functions
DROP FUNCTION IF EXISTS update_product_rating();
DROP FUNCTION IF EXISTS update_download_count();
DROP FUNCTION IF EXISTS update_product_stats_on_order();
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Drop tables (in reverse order of dependencies)
DROP TABLE IF EXISTS activity_logs;
DROP TABLE IF EXISTS platform_settings;
DROP TABLE IF EXISTS coupon_usages;
DROP TABLE IF EXISTS coupons;
DROP TABLE IF EXISTS referrals;
DROP TABLE IF EXISTS sessions;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS payouts;
DROP TABLE IF EXISTS kyc_documents;
DROP TABLE IF EXISTS download_logs;
DROP TABLE IF EXISTS invoices;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS storefront_themes;
DROP TABLE IF EXISTS storefronts;
DROP TABLE IF EXISTS users;

-- Drop enums
DROP TYPE IF EXISTS notification_type;
DROP TYPE IF EXISTS platform_fee_mode;
DROP TYPE IF EXISTS penny_drop_status;
DROP TYPE IF EXISTS payout_status;
DROP TYPE IF EXISTS delivery_status;
DROP TYPE IF EXISTS order_status;
DROP TYPE IF EXISTS delivery_type;
DROP TYPE IF EXISTS product_category;
DROP TYPE IF EXISTS product_status;
DROP TYPE IF EXISTS plan_type;
DROP TYPE IF EXISTS kyc_status;
DROP TYPE IF EXISTS user_role;

COMMIT;
