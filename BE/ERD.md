# GenZaic Creator Hub - Entity Relationship Diagram

## Database Schema Visualization

This document provides a visual representation of the database schema using Mermaid diagrams.

---

## Core Entity Relationships

```mermaid
erDiagram
    users ||--o| storefronts : has
    users ||--o{ products : creates
    users ||--o| kyc_documents : has
    users ||--o{ payouts : requests
    users ||--o{ orders : "sells (as seller)"
    users ||--o{ orders : "buys (as buyer)"
    users ||--o{ reviews : writes
    users ||--o{ notifications : receives
    users ||--o{ sessions : has
    users ||--o{ referrals : "refers (as referrer)"
    users ||--o{ referrals : "referred (as referred)"

    products ||--o{ orders : "purchased in"
    products ||--o{ reviews : receives
    products ||--o{ download_logs : tracked

    orders ||--|| invoices : generates
    orders ||--o{ download_logs : tracks
    orders ||--o| coupon_usages : "uses coupon"

    coupons ||--o{ coupon_usages : "used in"

    storefronts }o--o| storefront_themes : uses

    users {
        uuid id PK
        varchar email UK
        varchar password_hash
        varchar name
        text avatar_url
        enum role
        boolean is_seller
        varchar store_url UK
        enum plan_type
        enum kyc_status
        boolean onboarding_complete
        boolean email_verified
        int followers_count
        int total_products
        int total_sales
        decimal total_revenue
        timestamp created_at
        timestamp updated_at
    }

    storefronts {
        uuid id PK
        uuid user_id FK
        text profile_image_url
        text cover_image_url
        text tagline
        text bio
        uuid theme_id FK
        varchar primary_color
        varchar font_family
        boolean is_published
        enum platform_fee_mode
        varchar contact_email
        varchar contact_phone
        varchar social_instagram
        varchar social_twitter
        timestamp created_at
    }

    products {
        uuid id PK
        uuid user_id FK
        varchar title
        text description
        decimal price
        decimal original_price
        enum category
        enum status
        enum delivery_type
        text file_url
        text external_url
        text thumbnail_url
        int downloads_count
        int sales_count
        decimal revenue_total
        decimal rating_average
        int reviews_count
        boolean is_featured
        timestamp created_at
    }

    orders {
        uuid id PK
        varchar order_number UK
        uuid product_id FK
        uuid seller_id FK
        uuid buyer_id FK
        varchar buyer_email
        varchar buyer_name
        decimal amount
        decimal gst_amount
        decimal platform_fee
        decimal total_amount
        decimal seller_earnings
        enum status
        enum delivery_status
        varchar payment_id
        int download_count
        int max_downloads
        text download_link
        timestamp download_expires_at
        timestamp created_at
    }

    invoices {
        uuid id PK
        varchar invoice_number UK
        uuid order_id FK
        uuid seller_id FK
        varchar seller_name
        varchar buyer_name
        decimal amount
        decimal gst_amount
        decimal total_amount
        text invoice_url
        timestamp created_at
    }

    download_logs {
        uuid id PK
        uuid order_id FK
        uuid product_id FK
        uuid buyer_id FK
        varchar buyer_email
        varchar ip_address
        text user_agent
        timestamp downloaded_at
    }

    kyc_documents {
        uuid id PK
        uuid user_id FK
        varchar pan_number
        text pan_file_url
        varchar account_number
        varchar ifsc_code
        varchar bank_name
        enum penny_drop_status
        enum verification_status
        timestamp verified_at
        timestamp created_at
    }

    payouts {
        uuid id PK
        uuid user_id FK
        varchar payout_number UK
        decimal amount
        enum status
        varchar bank_account_number
        varchar ifsc_code
        varchar utr_number
        decimal processing_fee
        decimal net_amount
        timestamp created_at
        timestamp completed_at
    }

    reviews {
        uuid id PK
        uuid product_id FK
        uuid user_id FK
        uuid order_id FK
        int rating
        varchar title
        text comment
        boolean is_verified_purchase
        boolean is_published
        int helpful_count
        timestamp created_at
    }

    notifications {
        uuid id PK
        uuid user_id FK
        enum type
        varchar title
        text message
        text link_url
        boolean is_read
        jsonb metadata
        timestamp created_at
    }

    sessions {
        uuid id PK
        uuid user_id FK
        varchar token UK
        varchar refresh_token
        varchar ip_address
        timestamp expires_at
        timestamp created_at
    }

    referrals {
        uuid id PK
        uuid referrer_id FK
        uuid referred_id FK
        varchar referral_code
        decimal commission_rate
        decimal commission_earned
        boolean is_active
        timestamp created_at
    }

    coupons {
        uuid id PK
        uuid user_id FK
        varchar code UK
        text description
        varchar discount_type
        decimal discount_value
        decimal min_purchase_amount
        int usage_limit
        int usage_count
        boolean is_active
        timestamp expires_at
        timestamp created_at
    }

    coupon_usages {
        uuid id PK
        uuid coupon_id FK
        uuid order_id FK
        uuid user_id FK
        decimal discount_amount
        timestamp created_at
    }

    storefront_themes {
        uuid id PK
        varchar name
        text thumbnail_url
        varchar primary_color
        text description
        boolean is_premium
        timestamp created_at
    }
```

---

## Table Relationships Summary

### One-to-One Relationships

| Parent | Child | Description |
|--------|-------|-------------|
| users | storefronts | Each seller has one storefront |
| users | kyc_documents | Each user has one KYC record |
| orders | invoices | Each order generates one invoice |

### One-to-Many Relationships

| Parent | Child | Description |
|--------|-------|-------------|
| users | products | Seller creates many products |
| users | orders (seller) | Seller receives many orders |
| users | orders (buyer) | Buyer places many orders |
| users | payouts | User requests many payouts |
| users | reviews | User writes many reviews |
| users | notifications | User receives many notifications |
| users | sessions | User has many sessions |
| products | orders | Product sold in many orders |
| products | reviews | Product has many reviews |
| products | download_logs | Product tracked in many downloads |
| orders | download_logs | Order has many downloads |
| coupons | coupon_usages | Coupon used many times |

### Many-to-One Relationships

| Child | Parent | Description |
|-------|--------|-------------|
| storefronts | storefront_themes | Many storefronts use one theme |
| coupon_usages | orders | Many coupon usages for different orders |

---

## Data Flow Diagrams

### Order Creation Flow

```mermaid
flowchart TD
    A[User Selects Product] --> B{User Logged In?}
    B -->|Yes| C[Fetch User Details]
    B -->|No| D[Collect Buyer Info]
    C --> E[Calculate Amounts]
    D --> E
    E --> F[Create Order Record<br/>status: pending]
    F --> G[Initiate Payment Gateway]
    G --> H{Payment Success?}
    H -->|Yes| I[Update Order<br/>status: completed]
    H -->|No| J[Update Order<br/>status: failed]
    I --> K[Trigger: Update Product Stats]
    K --> L[Generate Invoice]
    L --> M{Delivery Type?}
    M -->|Download| N[Generate Secure Download Link]
    M -->|External| O[Store External URL]
    M -->|Manual| P[Notify Seller for Manual Delivery]
    N --> Q[Send Confirmation Email]
    O --> Q
    P --> Q
    Q --> R[Create Notifications]
```

### Payout Request Flow

```mermaid
flowchart TD
    A[Seller Requests Payout] --> B{KYC Verified?}
    B -->|No| C[Redirect to KYC Page]
    B -->|Yes| D[Calculate Available Balance]
    D --> E{Balance >= Min Amount?}
    E -->|No| F[Show Error: Minimum ₹500]
    E -->|Yes| G[Create Payout Record<br/>status: pending]
    G --> H[Admin Reviews Request]
    H --> I{Approved?}
    I -->|No| J[Update status: failed<br/>Add rejection reason]
    I -->|Yes| K[Update status: processing]
    K --> L[Initiate Bank Transfer]
    L --> M{Transfer Success?}
    M -->|No| N[Update status: failed<br/>Log error]
    M -->|Yes| O[Update status: completed<br/>Store UTR number]
    O --> P[Send Confirmation Email]
    P --> Q[Create Notification]
```

### Download Flow

```mermaid
flowchart TD
    A[User Clicks Download] --> B[Verify Order Ownership]
    B --> C{Order Verified?}
    C -->|No| D[Show 403 Forbidden]
    C -->|Yes| E{Download Link Expired?}
    E -->|Yes| F[Show Expiry Message]
    E -->|No| G{Max Downloads Reached?}
    G -->|Yes| H[Show Download Limit Message]
    G -->|No| I[Generate Signed URL]
    I --> J[Create Download Log Entry]
    J --> K[Trigger: Increment Download Count]
    K --> L[Serve File from S3]
```

### Review Submission Flow

```mermaid
flowchart TD
    A[User Submits Review] --> B{User Purchased Product?}
    B -->|No| C[Show Error: Purchase Required]
    B -->|Yes| D{Already Reviewed?}
    D -->|Yes| E[Update Existing Review]
    D -->|No| F[Create New Review]
    E --> G[Trigger: Recalculate Product Rating]
    F --> G
    G --> H[Update Product Stats:<br/>rating_average<br/>reviews_count]
    H --> I[Send Notification to Seller]
```

---

## Key Database Triggers

### 1. Auto-Update Timestamps

```mermaid
graph LR
    A[User Updates Record] --> B[update_updated_at_column]
    B --> C[Set updated_at = NOW]
    C --> D[Save Record]
```

**Applies to:** users, storefronts, products, orders, kyc_documents, reviews, sessions

---

### 2. Update Product Stats on Order

```mermaid
graph TD
    A[Order Status → completed] --> B[update_product_stats_on_order]
    B --> C[Increment products.sales_count]
    B --> D[Add to products.revenue_total]
    B --> E[Increment users.total_sales]
    B --> F[Add to users.total_revenue]
```

---

### 3. Track Downloads

```mermaid
graph TD
    A[New Download Log Created] --> B[update_download_count]
    B --> C[Increment orders.download_count]
    B --> D[Increment products.downloads_count]
```

---

### 4. Update Product Rating

```mermaid
graph TD
    A[Review Added/Updated] --> B[update_product_rating]
    B --> C[Calculate AVG of all ratings]
    B --> D[Update products.rating_average]
    B --> E[Update products.reviews_count]
```

---

## Database Indexes Strategy

### Users Table
```
Primary: id (UUID)
Unique: email, store_url
Indexes: role, created_at
```

### Products Table
```
Primary: id (UUID)
Foreign: user_id
Indexes: status, category, created_at, price, sales_count, rating_average
Partial Index: is_featured (WHERE is_featured = TRUE)
```

### Orders Table
```
Primary: id (UUID)
Unique: order_number
Foreign: product_id, seller_id, buyer_id
Indexes: buyer_email, status, created_at, payment_id
```

### Performance Considerations
- All foreign keys are automatically indexed
- Timestamp columns used for sorting are indexed DESC
- Boolean flags used in WHERE clauses have partial indexes
- Composite indexes can be added for specific query patterns

---

## Views for Reporting

### seller_dashboard_stats View

```sql
SELECT
  user_id,
  total_products,
  total_orders,
  total_revenue,
  revenue_last_30_days,
  orders_last_7_days
FROM seller_dashboard_stats
WHERE user_id = '...';
```

### product_analytics View

```sql
SELECT
  id,
  title,
  sales_count,
  revenue_total,
  conversion_rate,
  rating_average
FROM product_analytics
WHERE user_id = '...'
ORDER BY conversion_rate DESC;
```

---

## Enums Reference

| Enum Type | Values |
|-----------|--------|
| user_role | buyer, seller, admin |
| kyc_status | not_submitted, pending, verified, rejected |
| plan_type | creator, startup, enterprise |
| product_status | draft, published, archived |
| product_category | ebook, template, app, course, graphics, audio, other |
| delivery_type | download, external_link, manual |
| order_status | pending, completed, refunded, failed |
| delivery_status | pending, delivered |
| payout_status | pending, processing, completed, failed |
| platform_fee_mode | seller, buyer |
| notification_type | order, payout, kyc, system, product |

---

## Important Constraints

### Check Constraints

```sql
-- Products
price >= 0
rating_average >= 0 AND rating_average <= 5

-- Payouts
amount > 0

-- Reviews
rating >= 1 AND rating <= 5

-- Coupons
discount_value > 0
discount_type IN ('percentage', 'fixed')
```

### Unique Constraints

```sql
-- Users
UNIQUE(email)
UNIQUE(store_url)

-- Products
None (one seller can have products with same title)

-- Orders
UNIQUE(order_number)

-- Reviews
UNIQUE(product_id, user_id, order_id)
```

---

## Data Retention Policy

| Table | Retention | Notes |
|-------|-----------|-------|
| users | Permanent | Soft delete (is_active = false) |
| products | Permanent | Archive (status = 'archived') |
| orders | Permanent | Required for tax compliance |
| invoices | 7 years | Indian tax law requirement |
| download_logs | 1 year | For analytics and audit |
| sessions | 30 days | Auto-cleanup expired sessions |
| notifications | 90 days | Archive old notifications |
| activity_logs | 1 year | For security audit |

---

## Security Considerations

### Sensitive Data

| Field | Protection |
|-------|------------|
| users.password_hash | Bcrypt with salt >= 10 |
| kyc_documents.aadhaar_number | AES-256 encryption |
| kyc_documents.account_number | Masked in logs |
| sessions.token | SHA-256 hash |
| orders.payment_signature | Never logged |

### Access Control

```sql
-- Example: Seller can only access their own data
SELECT * FROM products
WHERE user_id = current_user_id;

-- Example: Buyer can only access their own orders
SELECT * FROM orders
WHERE buyer_id = current_user_id;
```

---

## Monitoring Queries

### Find Slow Queries

```sql
SELECT pid, now() - pg_stat_activity.query_start AS duration, query
FROM pg_stat_activity
WHERE state = 'active'
ORDER BY duration DESC;
```

### Check Table Sizes

```sql
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Index Usage

```sql
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;
```

---

**Diagram Version:** 1.0.0
**Last Updated:** 2025-12-30
**Compatible with:** PostgreSQL 14+
