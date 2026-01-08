-- GenZaic Creator Hub - Seed Data
-- Sample data for development and testing
-- Version: 1.0.0
-- Last Updated: 2025-12-30

BEGIN;

-- ============================================================================
-- PLATFORM SETTINGS
-- ============================================================================

INSERT INTO platform_settings (key, value, description, is_public) VALUES
('platform_name', 'GenZaic Creator Hub', 'Platform name', true),
('platform_email', 'support@genzaic.com', 'Platform support email', true),
('platform_fee_percentage', '10', 'Platform fee percentage', false),
('gst_percentage', '18', 'GST percentage for India', false),
('default_download_limit', '5', 'Default number of downloads per purchase', false),
('download_expiry_days', '7', 'Number of days before download link expires', false),
('min_payout_amount', '500', 'Minimum payout amount in INR', false),
('razorpay_key_id', 'rzp_test_xxxxxx', 'Razorpay API Key ID', false),
('smtp_host', 'smtp.gmail.com', 'SMTP host for emails', false),
('smtp_port', '587', 'SMTP port', false),
('s3_bucket_name', 'genzaic-products', 'AWS S3 bucket for file storage', false),
('max_file_size_mb', '500', 'Maximum file upload size in MB', true);

-- ============================================================================
-- STOREFRONT THEMES
-- ============================================================================

INSERT INTO storefront_themes (name, thumbnail_url, primary_color, description, is_premium) VALUES
('Modern', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300', '#6366f1', 'Clean and modern design with purple accents', false),
('Ocean', 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=300', '#0ea5e9', 'Calming blue ocean theme', false),
('Sunset', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300', '#f97316', 'Warm sunset gradient theme', false),
('Forest', 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=300', '#10b981', 'Natural green forest theme', false),
('Midnight', 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=300', '#1e293b', 'Dark elegant midnight theme', true),
('Coral', 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=300', '#ec4899', 'Vibrant coral pink theme', true);

-- ============================================================================
-- SAMPLE USERS
-- ============================================================================

-- Password for all test users: "password123" (bcrypt hashed)
-- Hash: $2a$10$8K1p/a0dL3.pBq3bU5pPxeKXXJTKLQ6YzYZvYvYvYvYvYvYvYvYvY (placeholder - use actual bcrypt)

-- Admin User
INSERT INTO users (id, email, password_hash, name, avatar_url, role, is_seller, store_url, kyc_status, onboarding_complete, email_verified, plan_type, is_active) VALUES
('11111111-1111-1111-1111-111111111111', 'admin@genzaic.com', '$2a$10$placeholder_hash', 'Admin User', 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin', 'admin', true, 'admin', 'verified', true, true, 'enterprise', true);

-- Seller Users
INSERT INTO users (id, email, password_hash, name, avatar_url, role, is_seller, store_url, kyc_status, onboarding_complete, email_verified, plan_type, followers_count, total_products, total_sales, total_revenue) VALUES
('22222222-2222-2222-2222-222222222222', 'sarah@example.com', '$2a$10$placeholder_hash', 'Sarah Johnson', 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah', 'seller', true, 'sarah-designs', 'verified', true, true, 'creator', 1523, 12, 89, 45600.00),
('33333333-3333-3333-3333-333333333333', 'alex@example.com', '$2a$10$placeholder_hash', 'Alex Chen', 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex', 'seller', true, 'alex-templates', 'verified', true, true, 'startup', 2341, 8, 134, 89200.00),
('44444444-4444-4444-4444-444444444444', 'priya@example.com', '$2a$10$placeholder_hash', 'Priya Sharma', 'https://api.dicebear.com/7.x/avataaars/svg?seed=priya', 'seller', true, 'priya-courses', 'pending', true, true, 'creator', 892, 5, 56, 28000.00),
('55555555-5555-5555-5555-555555555555', 'david@example.com', '$2a$10$placeholder_hash', 'David Miller', 'https://api.dicebear.com/7.x/avataaars/svg?seed=david', 'seller', true, 'david-ebooks', 'not_submitted', true, true, 'creator', 445, 3, 23, 11500.00);

-- Buyer Users
INSERT INTO users (id, email, password_hash, name, avatar_url, role, is_seller, onboarding_complete, email_verified) VALUES
('66666666-6666-6666-6666-666666666666', 'john@example.com', '$2a$10$placeholder_hash', 'John Doe', 'https://api.dicebear.com/7.x/avataaars/svg?seed=john', 'buyer', false, true, true),
('77777777-7777-7777-7777-777777777777', 'emma@example.com', '$2a$10$placeholder_hash', 'Emma Wilson', 'https://api.dicebear.com/7.x/avataaars/svg?seed=emma', 'buyer', false, true, true),
('88888888-8888-8888-8888-888888888888', 'raj@example.com', '$2a$10$placeholder_hash', 'Raj Patel', 'https://api.dicebear.com/7.x/avataaars/svg?seed=raj', 'buyer', false, true, true);

-- ============================================================================
-- STOREFRONTS
-- ============================================================================

INSERT INTO storefronts (user_id, profile_image_url, cover_image_url, tagline, bio, theme_id, primary_color, is_published, platform_fee_mode, contact_email, social_instagram, social_twitter, social_website, seo_title, seo_description) VALUES
('22222222-2222-2222-2222-222222222222',
 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=1200',
 'Beautiful UI/UX Templates & Resources',
 'Hi! I am Sarah, a passionate UI/UX designer creating modern, clean templates for designers and developers. All my templates are carefully crafted with attention to detail.',
 (SELECT id FROM storefront_themes WHERE name = 'Modern' LIMIT 1),
 '#6366f1',
 true,
 'buyer',
 'sarah@example.com',
 'https://instagram.com/sarahdesigns',
 'https://twitter.com/sarahdesigns',
 'https://sarahdesigns.com',
 'Sarah Johnson - Premium UI/UX Templates',
 'High-quality UI/UX templates, design systems, and resources for modern web applications'
),
('33333333-3333-3333-3333-333333333333',
 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex',
 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200',
 'Professional Notion & Excel Templates',
 'Welcome! I create productivity templates for Notion, Excel, and Google Sheets. Boost your workflow with my battle-tested templates.',
 (SELECT id FROM storefront_themes WHERE name = 'Ocean' LIMIT 1),
 '#0ea5e9',
 true,
 'seller',
 'alex@example.com',
 'https://instagram.com/alextemplates',
 'https://twitter.com/alextemplates',
 NULL,
 'Alex Chen - Productivity Templates',
 'Notion templates, Excel spreadsheets, and productivity tools for professionals'
),
('44444444-4444-4444-4444-444444444444',
 'https://api.dicebear.com/7.x/avataaars/svg?seed=priya',
 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200',
 'Learn Digital Marketing & Growth',
 'Digital marketing expert with 8+ years of experience. I teach practical, results-driven courses on SEO, social media marketing, and growth hacking.',
 (SELECT id FROM storefront_themes WHERE name = 'Sunset' LIMIT 1),
 '#f97316',
 true,
 'buyer',
 'priya@example.com',
 NULL,
 'https://twitter.com/priyamarketing',
 'https://priyasharma.in',
 'Priya Sharma - Digital Marketing Courses',
 'Learn digital marketing, SEO, social media marketing from industry expert'
);

-- ============================================================================
-- PRODUCTS
-- ============================================================================

-- Sarah's Products (UI/UX Templates)
INSERT INTO products (id, user_id, title, description, short_description, price, original_price, category, status, delivery_type, file_url, thumbnail_url, seo_title, seo_keywords, downloads_count, views_count, sales_count, revenue_total, rating_average, reviews_count, is_featured) VALUES
('p1111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222',
 'SaaS Dashboard UI Kit - Figma',
 'Complete SaaS dashboard UI kit with 50+ screens, components library, and design system. Includes light/dark mode, responsive layouts, and ready-to-use components. Perfect for SaaS applications, admin panels, and analytics dashboards.',
 'Professional SaaS dashboard with 50+ screens and components',
 2499.00, 3999.00, 'template', 'published', 'download',
 'https://s3.example.com/products/saas-dashboard-kit.fig',
 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400',
 'SaaS Dashboard UI Kit Figma Template',
 'saas dashboard, figma template, ui kit, admin panel',
 156, 2341, 45, 112455.00, 4.8, 12, true
),
('p2222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222',
 'E-commerce Mobile App Template',
 'Modern e-commerce mobile app template with beautiful product pages, cart, checkout flow, and user profiles. Includes 40+ screens optimized for iOS and Android.',
 'E-commerce mobile app with 40+ screens',
 1999.00, NULL, 'template', 'published', 'download',
 'https://s3.example.com/products/ecommerce-app.fig',
 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400',
 'E-commerce Mobile App UI Template',
 'mobile app, ecommerce, ui template, figma',
 89, 1567, 32, 63968.00, 4.9, 8, false
),
('p3333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222',
 'Landing Page Design Pack',
 'Collection of 15 stunning landing page designs for different industries. Fully customizable in Figma with organized layers and design system.',
 '15 landing page designs for multiple industries',
 1499.00, NULL, 'template', 'published', 'download',
 'https://s3.example.com/products/landing-pages.fig',
 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400',
 'Landing Page Design Pack - 15 Templates',
 'landing page, figma, website design, templates',
 45, 892, 12, 17988.00, 4.7, 3, false
);

-- Alex's Products (Notion/Excel Templates)
INSERT INTO products (id, user_id, title, description, short_description, price, original_price, category, status, delivery_type, external_url, thumbnail_url, seo_title, seo_keywords, downloads_count, views_count, sales_count, revenue_total, rating_average, reviews_count, is_featured) VALUES
('p4444444-4444-4444-4444-444444444444', '33333333-3333-3333-3333-333333333333',
 'Complete Business OS - Notion Template',
 'All-in-one business operating system for Notion. Includes project management, CRM, finance tracker, HR management, and knowledge base. Perfect for startups and small businesses.',
 'All-in-one business OS for Notion',
 3499.00, 4999.00, 'template', 'published', 'external_link',
 'https://notion.so/templates/business-os-clone',
 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=400',
 'Business OS Notion Template',
 'notion template, business, project management, crm',
 234, 3456, 78, 272922.00, 4.9, 24, true
),
('p5555555-5555-5555-5555-555555555555', '33333333-3333-3333-3333-333333333333',
 'Content Creator Dashboard - Notion',
 'Track your content calendar, analytics, brand deals, and income all in one place. Built for YouTubers, bloggers, and social media creators.',
 'Content calendar and analytics for creators',
 1299.00, NULL, 'template', 'published', 'external_link',
 'https://notion.so/templates/creator-dashboard',
 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400',
 'Content Creator Notion Dashboard',
 'notion, content creator, social media, analytics',
 167, 2234, 56, 72744.00, 4.8, 18, true
);

-- Priya's Products (Courses)
INSERT INTO products (id, user_id, title, description, short_description, price, original_price, category, status, delivery_type, file_url, thumbnail_url, seo_title, seo_keywords, downloads_count, views_count, sales_count, revenue_total, rating_average, reviews_count, seller_contact_email, is_featured) VALUES
('p6666666-6666-6666-6666-666666666666', '44444444-4444-4444-4444-444444444444',
 'SEO Mastery Course 2025',
 'Complete SEO course covering keyword research, on-page optimization, link building, and technical SEO. Includes 50+ video lessons, worksheets, and templates. Updated for 2025 algorithms.',
 'Complete SEO course with 50+ lessons',
 4999.00, 7999.00, 'course', 'published', 'manual',
 NULL,
 'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=400',
 'SEO Mastery Course 2025 - Complete Guide',
 'seo course, digital marketing, seo training',
 89, 1456, 34, 169966.00, 4.9, 11, 'priya@example.com', true
),
('p7777777-7777-7777-7777-777777777777', '44444444-4444-4444-4444-444444444444',
 'Instagram Growth Blueprint',
 'Learn how to grow your Instagram from 0 to 10K followers organically. Step-by-step strategies, content templates, and growth hacks.',
 'Grow Instagram to 10K followers organically',
 2499.00, NULL, 'course', 'published', 'manual',
 NULL,
 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=400',
 'Instagram Growth Blueprint Course',
 'instagram marketing, social media, growth hacking',
 45, 789, 22, 54978.00, 4.7, 7, 'priya@example.com', false
);

-- ============================================================================
-- KYC DOCUMENTS
-- ============================================================================

INSERT INTO kyc_documents (user_id, pan_number, pan_file_url, account_holder_name, account_number, ifsc_code, bank_name, branch_name, penny_drop_status, verification_status, verified_at) VALUES
('22222222-2222-2222-2222-222222222222', 'ABCDE1234F', 'https://s3.example.com/kyc/sarah-pan.pdf', 'Sarah Johnson', '1234567890', 'SBIN0001234', 'State Bank of India', 'Mumbai Main', 'success', 'verified', '2024-12-15 10:30:00'),
('33333333-3333-3333-3333-333333333333', 'FGHIJ5678K', 'https://s3.example.com/kyc/alex-pan.pdf', 'Alex Chen', '9876543210', 'HDFC0002345', 'HDFC Bank', 'Bangalore Koramangala', 'success', 'verified', '2024-12-20 14:20:00'),
('44444444-4444-4444-4444-444444444444', 'KLMNO9012P', 'https://s3.example.com/kyc/priya-pan.pdf', 'Priya Sharma', '5555666677', 'ICIC0003456', 'ICICI Bank', 'Delhi Connaught Place', 'pending', 'pending', NULL);

-- ============================================================================
-- SAMPLE ORDERS
-- ============================================================================

INSERT INTO orders (id, order_number, product_id, seller_id, buyer_id, buyer_email, buyer_name, buyer_phone, amount, gst_amount, platform_fee, total_amount, seller_earnings, status, delivery_status, delivery_type, payment_method, payment_id, download_count, max_downloads, download_link, download_expires_at, created_at, completed_at) VALUES
('o1111111-1111-1111-1111-111111111111', 'ORD-20251220-0001', 'p1111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', '66666666-6666-6666-6666-666666666666', 'john@example.com', 'John Doe', '+919876543210', 2499.00, 449.82, 249.90, 3198.72, 2249.10, 'completed', 'delivered', 'download', 'razorpay', 'pay_abc123xyz', 3, 5, 'https://download.genzaic.com/secure/o1111111', '2025-01-06 00:00:00', '2024-12-20 10:30:00', '2024-12-20 10:31:00'),

('o2222222-2222-2222-2222-222222222222', 'ORD-20251222-0002', 'p4444444-4444-4444-4444-444444444444', '33333333-3333-3333-3333-333333333333', '77777777-7777-7777-7777-777777777777', 'emma@example.com', 'Emma Wilson', NULL, 3499.00, 629.82, 349.90, 4478.72, 3149.10, 'completed', 'delivered', 'external_link', 'razorpay', 'pay_def456uvw', 1, 5, NULL, NULL, '2024-12-22 15:45:00', '2024-12-22 15:46:00'),

('o3333333-3333-3333-3333-333333333333', 'ORD-20251225-0003', 'p6666666-6666-6666-6666-666666666666', '44444444-4444-4444-4444-444444444444', '88888888-8888-8888-8888-888888888888', 'raj@example.com', 'Raj Patel', '+919123456789', 4999.00, 899.82, 499.90, 6398.72, 4499.10, 'completed', 'pending', 'manual', 'razorpay', 'pay_ghi789rst', 0, 5, NULL, NULL, '2024-12-25 09:20:00', '2024-12-25 09:21:00');

-- ============================================================================
-- INVOICES
-- ============================================================================

INSERT INTO invoices (invoice_number, order_id, seller_id, seller_name, seller_email, buyer_name, buyer_email, product_title, amount, gst_amount, platform_fee, total_amount, invoice_url, created_at) VALUES
('GENZAIC/2024/00001', 'o1111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'Sarah Johnson', 'sarah@example.com', 'John Doe', 'john@example.com', 'SaaS Dashboard UI Kit - Figma', 2499.00, 449.82, 249.90, 3198.72, 'https://invoices.genzaic.com/GENZAIC-2024-00001.pdf', '2024-12-20 10:31:00'),

('GENZAIC/2024/00002', 'o2222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', 'Alex Chen', 'alex@example.com', 'Emma Wilson', 'emma@example.com', 'Complete Business OS - Notion Template', 3499.00, 629.82, 349.90, 4478.72, 'https://invoices.genzaic.com/GENZAIC-2024-00002.pdf', '2024-12-22 15:46:00'),

('GENZAIC/2024/00003', 'o3333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444', 'Priya Sharma', 'priya@example.com', 'Raj Patel', 'raj@example.com', 'SEO Mastery Course 2025', 4999.00, 899.82, 499.90, 6398.72, 'https://invoices.genzaic.com/GENZAIC-2024-00003.pdf', '2024-12-25 09:21:00');

-- ============================================================================
-- DOWNLOAD LOGS
-- ============================================================================

INSERT INTO download_logs (order_id, product_id, buyer_id, buyer_email, ip_address, user_agent, downloaded_at) VALUES
('o1111111-1111-1111-1111-111111111111', 'p1111111-1111-1111-1111-111111111111', '66666666-6666-6666-6666-666666666666', 'john@example.com', '103.45.67.89', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', '2024-12-20 11:00:00'),
('o1111111-1111-1111-1111-111111111111', 'p1111111-1111-1111-1111-111111111111', '66666666-6666-6666-6666-666666666666', 'john@example.com', '103.45.67.89', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', '2024-12-21 09:30:00'),
('o1111111-1111-1111-1111-111111111111', 'p1111111-1111-1111-1111-111111111111', '66666666-6666-6666-6666-666666666666', 'john@example.com', '103.45.67.90', 'Mozilla/5.0 (Macintosh; Intel Mac OS X)', '2024-12-22 14:15:00');

-- ============================================================================
-- REVIEWS
-- ============================================================================

INSERT INTO reviews (product_id, user_id, order_id, rating, title, comment, is_verified_purchase, is_published, helpful_count, created_at) VALUES
('p1111111-1111-1111-1111-111111111111', '66666666-6666-6666-6666-666666666666', 'o1111111-1111-1111-1111-111111111111', 5, 'Excellent quality!', 'This dashboard kit is amazing! Very well organized with great components. Saved me weeks of work. Highly recommended!', true, true, 8, '2024-12-21 10:00:00'),

('p4444444-4444-4444-4444-444444444444', '77777777-7777-7777-7777-777777777777', 'o2222222-2222-2222-2222-222222222222', 5, 'Perfect for my business', 'The Notion template is exactly what I needed. Everything is well structured and easy to customize. Worth every penny!', true, true, 12, '2024-12-23 11:30:00'),

('p6666666-6666-6666-6666-666666666666', '88888888-8888-8888-8888-888888888888', 4, 'Great content', 'Very informative course with practical examples. Would have given 5 stars if it had more case studies. Still highly recommend!', true, true, 5, '2024-12-26 16:45:00');

-- ============================================================================
-- PAYOUTS
-- ============================================================================

INSERT INTO payouts (user_id, payout_number, amount, status, bank_account_number, ifsc_code, account_holder_name, utr_number, processing_fee, net_amount, created_at, processed_at, completed_at) VALUES
('22222222-2222-2222-2222-222222222222', 'PAYOUT-20241221-0001', 25000.00, 'completed', '1234567890', 'SBIN0001234', 'Sarah Johnson', 'UTR2024122112345', 250.00, 24750.00, '2024-12-21 09:00:00', '2024-12-21 10:00:00', '2024-12-21 15:30:00'),

('33333333-3333-3333-3333-333333333333', 'PAYOUT-20241228-0002', 35000.00, 'processing', '9876543210', 'HDFC0002345', 'Alex Chen', NULL, 350.00, 34650.00, '2024-12-28 10:00:00', '2024-12-28 11:00:00', NULL),

('44444444-4444-4444-4444-444444444444', 'PAYOUT-20241229-0003', 15000.00, 'pending', NULL, NULL, NULL, NULL, 150.00, 14850.00, '2024-12-29 14:00:00', NULL, NULL);

-- ============================================================================
-- NOTIFICATIONS
-- ============================================================================

INSERT INTO notifications (user_id, type, title, message, link_url, is_read, created_at) VALUES
('22222222-2222-2222-2222-222222222222', 'order', 'New Order!', 'You received a new order for "SaaS Dashboard UI Kit"', '/dashboard/sales', true, '2024-12-20 10:31:00'),
('22222222-2222-2222-2222-222222222222', 'payout', 'Payout Completed', 'Your payout of ₹24,750 has been transferred to your account', '/dashboard/payouts', true, '2024-12-21 15:30:00'),
('66666666-6666-6666-6666-666666666666', 'order', 'Purchase Successful', 'Your purchase of "SaaS Dashboard UI Kit" is complete. Download now!', '/my-purchases', true, '2024-12-20 10:31:00'),
('33333333-3333-3333-3333-333333333333', 'order', 'New Order!', 'You received a new order for "Complete Business OS - Notion Template"', '/dashboard/sales', false, '2024-12-22 15:46:00'),
('44444444-4444-4444-4444-444444444444', 'kyc', 'KYC Under Review', 'Your KYC documents are being verified. You will be notified once approved.', '/dashboard/kyc', false, '2024-12-23 12:00:00');

-- ============================================================================
-- COUPONS
-- ============================================================================

INSERT INTO coupons (user_id, code, description, discount_type, discount_value, min_purchase_amount, max_discount_amount, usage_limit, usage_count, is_active, starts_at, expires_at) VALUES
('22222222-2222-2222-2222-222222222222', 'NEWYEAR25', 'New Year 2025 Sale - 25% off', 'percentage', 25.00, 1000.00, 1000.00, 100, 15, true, '2025-01-01 00:00:00', '2025-01-15 23:59:59'),
(NULL, 'WELCOME500', 'Welcome discount for new users', 'fixed', 500.00, 2000.00, NULL, NULL, 234, true, '2024-01-01 00:00:00', '2025-12-31 23:59:59'),
('33333333-3333-3333-3333-333333333333', 'NOTION50', '₹50 off on Notion templates', 'fixed', 50.00, 500.00, NULL, 50, 23, true, '2024-12-01 00:00:00', '2025-01-31 23:59:59');

COMMIT;
