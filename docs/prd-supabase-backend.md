# ParkerJoe Supabase Backend - Technical PRD

> **Document Version:** 1.0  
> **Last Updated:** 2026-04-09  
> **Status:** Draft  
> **Owner:** Engineering Team  

---

## Table of Contents

1. [Overview](#1-overview)
2. [Database Schema](#2-database-schema)
3. [Row Level Security (RLS) Policies](#3-row-level-security-rls-policies)
4. [Supabase Auth Configuration](#4-supabase-auth-configuration)
5. [Supabase Storage](#5-supabase-storage)
6. [Edge Functions](#6-edge-functions)
7. [Database Functions & Triggers](#7-database-functions--triggers)
8. [Vector Database (pgvector)](#8-vector-database-pgvector)
9. [Environment Setup](#9-environment-setup)
10. [TypeScript Types](#10-typescript-types)
11. [Migration Strategy](#11-migration-strategy)

---

## 1. Overview

### 1.1 Purpose

This document defines the complete technical specification for the ParkerJoe Supabase backend infrastructure. It covers database schema design, authentication flows, storage configuration, edge functions, and security policies required to support a premium boys' clothing e-commerce platform.

### 1.2 Architecture Principles

| Principle | Implementation |
|-----------|----------------|
| **Security First** | RLS policies on all tables, encrypted data at rest |
| **COPPA Compliance** | Strict data retention, parental consent tracking, audit logs |
| **Scalability** | Vector search for RAG, partitioned tables for high-volume data |
| **Observability** | Comprehensive logging, metrics tracking, error handling |
| **Type Safety** | Full TypeScript coverage with generated database types |

### 1.3 Tech Stack

| Component | Technology |
|-----------|------------|
| Database | PostgreSQL 15+ (Supabase) |
| Vector Extension | pgvector 0.5+ |
| Authentication | Supabase Auth (GoTrue) |
| Storage | Supabase Storage (S3-compatible) |
| Edge Runtime | Deno (Supabase Edge Functions) |
| ORM/Client | @supabase/supabase-js |
| Migrations | Supabase CLI |

---

## 2. Database Schema

### 2.1 Schema Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           PARKERJOE DATABASE SCHEMA                         │
├─────────────────────────────────────────────────────────────────────────────┤
│  CORE TABLES                    │  COPPA TABLES          │  SYSTEM TABLES   │
├─────────────────────────────────┼────────────────────────┼──────────────────┤
│  • customer_profiles            │  • parental_consent_   │  • agent_metrics │
│  • ai_conversations             │    records             │  • data_retention│
│  • product_embeddings           │                        │    _log          │
│  • wishlists                    │                        │                  │
│  • loyalty_transactions         │                        │                  │
│  • ugc_submissions              │                        │                  │
│  • content_queue                │                        │                  │
│  • competitive_intelligence     │                        │                  │
└─────────────────────────────────┴────────────────────────┴──────────────────┘
```

### 2.2 Enable Required Extensions

```sql
-- ============================================
-- EXTENSIONS
-- ============================================

-- Vector support for RAG
CREATE EXTENSION IF NOT EXISTS vector;

-- UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Cryptographic functions for consent verification
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Full-text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- JSON manipulation
CREATE EXTENSION IF NOT EXISTS "jsonb_plperl";
```

### 2.3 Core Tables

#### 2.3.1 customer_profiles

Extended customer data beyond Shopify integration with COPPA compliance flags.

```sql
-- ============================================
-- TABLE: customer_profiles
-- ============================================

CREATE TABLE customer_profiles (
    -- Primary & Foreign Keys
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    shopify_customer_id VARCHAR(255) UNIQUE,
    
    -- Profile Information
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    date_of_birth DATE,
    gender VARCHAR(20) CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
    
    -- Child Information (COPPA Relevant)
    child_count INTEGER DEFAULT 0 CHECK (child_count >= 0),
    children JSONB DEFAULT '[]'::jsonb, -- [{name, age, size_preferences}]
    
    -- Marketing Preferences
    email_opt_in BOOLEAN DEFAULT false,
    sms_opt_in BOOLEAN DEFAULT false,
    marketing_consent_date TIMESTAMPTZ,
    
    -- Loyalty Program
    loyalty_points INTEGER DEFAULT 0 CHECK (loyalty_points >= 0),
    loyalty_tier VARCHAR(20) DEFAULT 'bronze' CHECK (loyalty_tier IN ('bronze', 'silver', 'gold', 'platinum')),
    tier_entry_date TIMESTAMPTZ,
    
    -- COPPA Compliance Fields
    is_minor BOOLEAN DEFAULT false,
    parental_consent_required BOOLEAN DEFAULT false,
    parental_consent_obtained BOOLEAN DEFAULT false,
    consent_record_id UUID,
    coppa_restricted BOOLEAN DEFAULT false, -- Limits data collection if true
    
    -- Account Status
    account_status VARCHAR(20) DEFAULT 'active' CHECK (account_status IN ('active', 'suspended', 'deactivated')),
    email_verified BOOLEAN DEFAULT false,
    phone_verified BOOLEAN DEFAULT false,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_login_at TIMESTAMPTZ,
    
    -- Constraints
    CONSTRAINT valid_children CHECK (jsonb_typeof(children) = 'array')
);

-- Indexes
CREATE INDEX idx_customer_profiles_user_id ON customer_profiles(user_id);
CREATE INDEX idx_customer_profiles_shopify_id ON customer_profiles(shopify_customer_id);
CREATE INDEX idx_customer_profiles_loyalty_tier ON customer_profiles(loyalty_tier);
CREATE INDEX idx_customer_profiles_coppa ON customer_profiles(is_minor, parental_consent_obtained);
CREATE INDEX idx_customer_profiles_children_gin ON customer_profiles USING GIN(children);
```

#### 2.3.2 ai_conversations

Chat logs for AI interactions with automatic 30-day retention per COPPA.

```sql
-- ============================================
-- TABLE: ai_conversations
-- ============================================

CREATE TABLE ai_conversations (
    -- Primary Keys
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Session Information
    session_id VARCHAR(255) NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- Conversation Data
    message_role VARCHAR(20) NOT NULL CHECK (message_role IN ('user', 'assistant', 'system')),
    message_content TEXT NOT NULL,
    message_metadata JSONB DEFAULT '{}'::jsonb, -- {intent, entities, sentiment}
    
    -- AI Model Information
    model_version VARCHAR(50),
    response_tokens INTEGER,
    prompt_tokens INTEGER,
    latency_ms INTEGER,
    
    -- Context
    conversation_context JSONB DEFAULT '{}'::jsonb, -- {products_viewed, cart_items, session_history}
    parent_message_id UUID REFERENCES ai_conversations(id),
    
    -- COPPA Compliance
    is_minor_user BOOLEAN DEFAULT false,
    pii_detected BOOLEAN DEFAULT false,
    pii_redacted_content TEXT,
    
    -- Retention
    retention_until TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 days'),
    purged_at TIMESTAMPTZ,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_retention CHECK (retention_until > created_at)
);

-- Indexes
CREATE INDEX idx_ai_conversations_session_id ON ai_conversations(session_id);
CREATE INDEX idx_ai_conversations_user_id ON ai_conversations(user_id);
CREATE INDEX idx_ai_conversations_retention ON ai_conversations(retention_until) WHERE purged_at IS NULL;
CREATE INDEX idx_ai_conversations_minor ON ai_conversations(is_minor_user) WHERE is_minor_user = true;
CREATE INDEX idx_ai_conversations_created_at ON ai_conversations(created_at DESC);

-- Partial index for active (non-purged) records
CREATE INDEX idx_ai_conversations_active ON ai_conversations(id) WHERE purged_at IS NULL;
```

#### 2.3.3 product_embeddings

Vector embeddings for RAG-based product recommendations.

```sql
-- ============================================
-- TABLE: product_embeddings
-- ============================================

CREATE TABLE product_embeddings (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Product Reference
    product_id VARCHAR(255) NOT NULL UNIQUE,
    shopify_product_id VARCHAR(255),
    sku VARCHAR(100),
    
    -- Embedding Data
    embedding VECTOR(1536), -- OpenAI text-embedding-3-small
    embedding_model VARCHAR(50) DEFAULT 'text-embedding-3-small',
    
    -- Product Content (for context)
    product_name VARCHAR(255) NOT NULL,
    product_description TEXT,
    product_category VARCHAR(100),
    product_tags TEXT[],
    attributes JSONB DEFAULT '{}'::jsonb, -- {color, size_range, material, style}
    
    -- Search Metadata
    search_keywords TSVECTOR,
    popularity_score FLOAT DEFAULT 0,
    
    -- Sync Status
    last_synced_at TIMESTAMPTZ DEFAULT NOW(),
    sync_version INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_product_embeddings_product_id ON product_embeddings(product_id);
CREATE INDEX idx_product_embeddings_vector ON product_embeddings USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX idx_product_embeddings_category ON product_embeddings(product_category);
CREATE INDEX idx_product_embeddings_search ON product_embeddings USING GIN(search_keywords);
CREATE INDEX idx_product_embeddings_active ON product_embeddings(is_active) WHERE is_active = true;
```

#### 2.3.4 wishlists

Customer wishlists with sharing capabilities.

```sql
-- ============================================
-- TABLE: wishlists
-- ============================================

CREATE TABLE wishlists (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Ownership
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Wishlist Details
    name VARCHAR(100) NOT NULL DEFAULT 'My Wishlist',
    description TEXT,
    is_default BOOLEAN DEFAULT false,
    is_public BOOLEAN DEFAULT false,
    share_token VARCHAR(64) UNIQUE, -- For shared wishlist links
    
    -- Event/Registry Support
    event_type VARCHAR(50), -- birthday, holiday, baby_shower, etc.
    event_date DATE,
    registry_mode BOOLEAN DEFAULT false,
    
    -- Metadata
    item_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Wishlist Items ( Junction Table )
CREATE TABLE wishlist_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wishlist_id UUID NOT NULL REFERENCES wishlists(id) ON DELETE CASCADE,
    product_id VARCHAR(255) NOT NULL,
    shopify_product_id VARCHAR(255),
    variant_id VARCHAR(255),
    
    -- Item Details
    product_name VARCHAR(255) NOT NULL,
    product_image_url TEXT,
    price DECIMAL(10, 2),
    compare_at_price DECIMAL(10, 2),
    
    -- Preferences
    desired_size VARCHAR(50),
    desired_color VARCHAR(50),
    priority INTEGER DEFAULT 1 CHECK (priority BETWEEN 1 AND 5),
    notes TEXT,
    
    -- Registry Support
    quantity_desired INTEGER DEFAULT 1,
    quantity_received INTEGER DEFAULT 0,
    
    -- Notification
    notify_on_sale BOOLEAN DEFAULT false,
    notify_on_rest BOOLEAN DEFAULT false,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(wishlist_id, product_id, variant_id)
);

-- Indexes
CREATE INDEX idx_wishlists_user_id ON wishlists(user_id);
CREATE INDEX idx_wishlists_share_token ON wishlists(share_token) WHERE is_public = true;
CREATE INDEX idx_wishlists_event ON wishlists(event_type, event_date);
CREATE INDEX idx_wishlist_items_wishlist_id ON wishlist_items(wishlist_id);
CREATE INDEX idx_wishlist_items_product_id ON wishlist_items(product_id);
```

#### 2.3.5 loyalty_transactions

Points history and loyalty program transactions.

```sql
-- ============================================
-- TABLE: loyalty_transactions
-- ============================================

CREATE TABLE loyalty_transactions (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Transaction Details
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    transaction_type VARCHAR(50) NOT NULL CHECK (transaction_type IN (
        'earn_purchase', 'earn_referral', 'earn_review', 'earn_social_share',
        'redeem_discount', 'redeem_product', 'expire', 'adjustment', 'bonus'
    )),
    
    -- Points
    points_amount INTEGER NOT NULL, -- Positive for earn, negative for redeem
    points_balance_after INTEGER NOT NULL,
    
    -- Source Information
    order_id VARCHAR(255), -- Reference to Shopify order
    order_total DECIMAL(10, 2),
    referral_code VARCHAR(50),
    review_id UUID,
    
    -- Redemption Details
    redemption_value DECIMAL(10, 2), -- Dollar value if redeemed
    discount_code VARCHAR(50), -- Generated discount code
    
    -- Metadata
    description TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    
    -- Expiration
    expires_at TIMESTAMPTZ,
    expired_at TIMESTAMPTZ,
    
    -- Status
    status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'cancelled', 'expired')),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    processed_at TIMESTAMPTZ DEFAULT NOW(),
    processed_by UUID REFERENCES auth.users(id)
);

-- Indexes
CREATE INDEX idx_loyalty_transactions_user_id ON loyalty_transactions(user_id);
CREATE INDEX idx_loyalty_transactions_type ON loyalty_transactions(transaction_type);
CREATE INDEX idx_loyalty_transactions_order_id ON loyalty_transactions(order_id);
CREATE INDEX idx_loyalty_transactions_created_at ON loyalty_transactions(created_at DESC);
CREATE INDEX idx_loyalty_transactions_expires ON loyalty_transactions(expires_at) WHERE expired_at IS NULL;
```

#### 2.3.6 ugc_submissions

User-generated content with consent management.

```sql
-- ============================================
-- TABLE: ugc_submissions
-- ============================================

CREATE TABLE ugc_submissions (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Submitter Information
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    submitter_email VARCHAR(255),
    submitter_name VARCHAR(255),
    is_anonymous BOOLEAN DEFAULT false,
    
    -- Content
    content_type VARCHAR(50) NOT NULL CHECK (content_type IN ('photo', 'video', 'review', 'testimonial')),
    title VARCHAR(255),
    description TEXT,
    
    -- Media
    media_urls TEXT[], -- Array of storage URLs
    thumbnail_url TEXT,
    
    -- Product Association
    product_ids TEXT[], -- Products featured in content
    order_id VARCHAR(255), -- Associated purchase
    
    -- Consent & Rights
    consent_granted BOOLEAN DEFAULT false,
    consent_recorded_at TIMESTAMPTZ,
    consent_ip_address INET,
    usage_rights_granted BOOLEAN DEFAULT false, -- Can we use this in marketing?
    usage_rights_scope VARCHAR(50), -- social, website, email, all
    credit_preference VARCHAR(50), -- full_name, first_name_only, anonymous
    
    -- Moderation
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'featured', 'archived')),
    moderation_notes TEXT,
    moderated_at TIMESTAMPTZ,
    moderated_by UUID REFERENCES auth.users(id),
    
    -- Engagement
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    featured_at TIMESTAMPTZ,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_ugc_submissions_user_id ON ugc_submissions(user_id);
CREATE INDEX idx_ugc_submissions_status ON ugc_submissions(status);
CREATE INDEX idx_ugc_submissions_type ON ugc_submissions(content_type);
CREATE INDEX idx_ugc_submissions_product_ids ON ugc_submissions USING GIN(product_ids);
CREATE INDEX idx_ugc_submissions_featured ON ugc_submissions(is_featured) WHERE is_featured = true;
CREATE INDEX idx_ugc_submissions_consent ON ugc_submissions(consent_granted) WHERE consent_granted = true;
```

#### 2.3.7 content_queue

AI-generated content pending review.

```sql
-- ============================================
-- TABLE: content_queue
-- ============================================

CREATE TABLE content_queue (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Content Details
    content_type VARCHAR(50) NOT NULL CHECK (content_type IN (
        'product_description', 'blog_post', 'social_caption', 
        'email_subject', 'email_body', 'ad_copy', 'meta_description'
    )),
    
    -- Source Information
    source_agent VARCHAR(100) NOT NULL, -- Which AI agent generated this
    source_prompt TEXT,
    source_context JSONB DEFAULT '{}'::jsonb,
    
    -- Generated Content
    generated_title VARCHAR(255),
    generated_content TEXT NOT NULL,
    generated_metadata JSONB DEFAULT '{}'::jsonb, -- {keywords, tone, target_audience}
    
    -- SEO Data
    suggested_keywords TEXT[],
    suggested_meta_title VARCHAR(70),
    suggested_meta_description VARCHAR(160),
    readability_score FLOAT,
    seo_score FLOAT,
    
    -- Review Status
    status VARCHAR(20) DEFAULT 'pending_review' CHECK (status IN (
        'pending_review', 'approved', 'rejected', 'scheduled', 'published', 'archived'
    )),
    priority INTEGER DEFAULT 3 CHECK (priority BETWEEN 1 AND 5),
    
    -- Assignment
    assigned_to UUID REFERENCES auth.users(id),
    due_date DATE,
    
    -- Review Tracking
    review_notes TEXT,
    reviewed_at TIMESTAMPTZ,
    reviewed_by UUID REFERENCES auth.users(id),
    revision_count INTEGER DEFAULT 0,
    
    -- Publishing
    scheduled_publish_at TIMESTAMPTZ,
    published_at TIMESTAMPTZ,
    published_content_id UUID, -- Reference to published content
    
    -- Metrics
    ai_confidence_score FLOAT,
    human_edited BOOLEAN DEFAULT false,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_content_queue_status ON content_queue(status);
CREATE INDEX idx_content_queue_type ON content_queue(content_type);
CREATE INDEX idx_content_queue_priority ON content_queue(priority, created_at);
CREATE INDEX idx_content_queue_assigned ON content_queue(assigned_to, status);
CREATE INDEX idx_content_queue_due_date ON content_queue(due_date) WHERE status = 'pending_review';
CREATE INDEX idx_content_queue_scheduled ON content_queue(scheduled_publish_at) WHERE status = 'scheduled';
```

#### 2.3.8 competitive_intelligence

Trend Scout data for competitive analysis.

```sql
-- ============================================
-- TABLE: competitive_intelligence
-- ============================================

CREATE TABLE competitive_intelligence (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Source Information
    source_type VARCHAR(50) NOT NULL CHECK (source_type IN (
        'competitor_website', 'social_media', 'marketplace', 
        'industry_report', 'news', 'trend_forecast'
    )),
    source_name VARCHAR(255) NOT NULL, -- e.g., "Gap Kids", "Instagram"
    source_url TEXT,
    
    -- Intelligence Data
    data_category VARCHAR(50) NOT NULL CHECK (data_category IN (
        'pricing', 'product_launch', 'marketing_campaign', 
        'trend', 'customer_sentiment', 'inventory', 'promotion'
    )),
    
    title VARCHAR(255) NOT NULL,
    description TEXT,
    raw_data JSONB NOT NULL, -- Original scraped/analyzed data
    
    -- Product Intelligence
    product_category VARCHAR(100),
    price_point_range JSONB, -- {min, max, currency}
    comparable_products TEXT[],
    
    -- Trend Data
    trend_direction VARCHAR(20) CHECK (trend_direction IN ('rising', 'stable', 'declining')),
    trend_velocity FLOAT, -- Speed of trend (0-100)
    season_relevance TEXT[], -- spring, summer, fall, winter, back_to_school
    
    -- Sentiment Analysis
    sentiment_score FLOAT CHECK (sentiment_score BETWEEN -1 AND 1),
    sentiment_volume INTEGER, -- Number of mentions
    key_themes TEXT[],
    
    -- Actionable Insights
    recommended_action VARCHAR(50),
    potential_impact VARCHAR(20) CHECK (potential_impact IN ('low', 'medium', 'high', 'critical')),
    confidence_score FLOAT CHECK (confidence_score BETWEEN 0 AND 1),
    
    -- Status
    status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'reviewed', 'actioned', 'archived')),
    reviewed_by UUID REFERENCES auth.users(id),
    reviewed_at TIMESTAMPTZ,
    
    -- Timestamps
    collected_at TIMESTAMPTZ DEFAULT NOW(),
    valid_until TIMESTAMPTZ, -- Data freshness
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_ci_source_type ON competitive_intelligence(source_type);
CREATE INDEX idx_ci_data_category ON competitive_intelligence(data_category);
CREATE INDEX idx_ci_product_category ON competitive_intelligence(product_category);
CREATE INDEX idx_ci_status ON competitive_intelligence(status);
CREATE INDEX idx_ci_trend_direction ON competitive_intelligence(trend_direction);
CREATE INDEX idx_ci_collected_at ON competitive_intelligence(collected_at DESC);
CREATE INDEX idx_ci_valid_until ON competitive_intelligence(valid_until);
```

#### 2.3.9 agent_metrics

AI performance tracking and observability.

```sql
-- ============================================
-- TABLE: agent_metrics
-- ============================================

CREATE TABLE agent_metrics (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Agent Identification
    agent_name VARCHAR(100) NOT NULL,
    agent_version VARCHAR(50) NOT NULL,
    agent_type VARCHAR(50) NOT NULL CHECK (agent_type IN (
        'stylist', 'content', 'trend_scout', 'inventory', 'customer_service'
    )),
    
    -- Execution Context
    execution_id UUID NOT NULL,
    session_id VARCHAR(255),
    user_id UUID REFERENCES auth.users(id),
    
    -- Timing
    started_at TIMESTAMPTZ NOT NULL,
    completed_at TIMESTAMPTZ,
    duration_ms INTEGER,
    
    -- Performance Metrics
    tokens_input INTEGER,
    tokens_output INTEGER,
    tokens_total INTEGER,
    cost_estimate DECIMAL(10, 6), -- Estimated API cost
    
    -- Success Metrics
    status VARCHAR(20) NOT NULL CHECK (status IN ('running', 'success', 'error', 'timeout', 'cancelled')),
    error_type VARCHAR(50),
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    
    -- Quality Metrics
    response_quality_score FLOAT CHECK (response_quality_score BETWEEN 0 AND 1),
    user_rating INTEGER CHECK (user_rating BETWEEN 1 AND 5),
    was_helpful BOOLEAN,
    
    -- Context
    input_summary TEXT,
    output_summary TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_agent_metrics_agent_name ON agent_metrics(agent_name);
CREATE INDEX idx_agent_metrics_type ON agent_metrics(agent_type);
CREATE INDEX idx_agent_metrics_status ON agent_metrics(status);
CREATE INDEX idx_agent_metrics_user_id ON agent_metrics(user_id);
CREATE INDEX idx_agent_metrics_execution ON agent_metrics(execution_id);
CREATE INDEX idx_agent_metrics_created_at ON agent_metrics(created_at DESC);
CREATE INDEX idx_agent_metrics_session ON agent_metrics(session_id);

-- Partitioning for high-volume data (optional, for production)
-- CREATE TABLE agent_metrics_y2024m04 PARTITION OF agent_metrics
--     FOR VALUES FROM ('2024-04-01') TO ('2024-05-01');
```

### 2.4 COPPA-Specific Tables

#### 2.4.1 parental_consent_records

Consent verification data for minors under 13.

```sql
-- ============================================
-- TABLE: parental_consent_records
-- ============================================

CREATE TABLE parental_consent_records (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Child Information
    child_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    child_name VARCHAR(100),
    child_date_of_birth DATE,
    child_email VARCHAR(255),
    
    -- Parent/Guardian Information
    parent_name VARCHAR(100) NOT NULL,
    parent_email VARCHAR(255) NOT NULL,
    parent_phone VARCHAR(20),
    parent_relationship VARCHAR(50) CHECK (parent_relationship IN ('mother', 'father', 'guardian', 'other')),
    
    -- Consent Method
    consent_method VARCHAR(50) NOT NULL CHECK (consent_method IN (
        'credit_card_verification', 'video_conference', 'signed_form', 
        'digital_signature', 'phone_verification'
    )),
    
    -- Verification Details
    verification_token VARCHAR(255) UNIQUE NOT NULL,
    verification_status VARCHAR(20) DEFAULT 'pending' CHECK (verification_status IN (
        'pending', 'verified', 'rejected', 'expired', 'revoked'
    )),
    
    -- Credit Card Verification (COPPA compliant method)
    cc_last_four VARCHAR(4),
    cc_transaction_id VARCHAR(255),
    cc_verified_at TIMESTAMPTZ,
    
    -- Document Upload
    consent_form_url TEXT,
    id_verification_url TEXT,
    
    -- Consent Scope
    data_collection_approved BOOLEAN DEFAULT false,
    marketing_approved BOOLEAN DEFAULT false,
    photo_sharing_approved BOOLEAN DEFAULT false,
    third_party_sharing_approved BOOLEAN DEFAULT false,
    
    -- Expiration & Renewal
    consent_expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '1 year'),
    renewed_at TIMESTAMPTZ,
    renewed_from UUID REFERENCES parental_consent_records(id),
    
    -- Revocation
    revoked_at TIMESTAMPTZ,
    revoked_reason TEXT,
    revoked_by UUID REFERENCES auth.users(id),
    
    -- Audit Trail
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    verified_at TIMESTAMPTZ,
    
    -- Notification Tracking
    reminder_sent_at TIMESTAMPTZ,
    expiry_notice_sent_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_parental_consent_child_user_id ON parental_consent_records(child_user_id);
CREATE INDEX idx_parental_consent_parent_email ON parental_consent_records(parent_email);
CREATE INDEX idx_parental_consent_token ON parental_consent_records(verification_token);
CREATE INDEX idx_parental_consent_status ON parental_consent_records(verification_status);
CREATE INDEX idx_parental_consent_expires ON parental_consent_records(consent_expires_at);
CREATE INDEX idx_parental_consent_verified ON parental_consent_records(child_user_id, verification_status) 
    WHERE verification_status = 'verified';
```

#### 2.4.2 data_retention_log

Audit trail for all data deletions per COPPA requirements.

```sql
-- ============================================
-- TABLE: data_retention_log
-- ============================================

CREATE TABLE data_retention_log (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Deletion Context
    user_id UUID, -- May be NULL if user was fully deleted
    deletion_trigger VARCHAR(50) NOT NULL CHECK (deletion_trigger IN (
        'user_request', 'retention_expired', 'consent_revoked', 
        'account_deletion', 'coppa_compliance', 'admin_action'
    )),
    
    -- Deleted Data Information
    table_name VARCHAR(100) NOT NULL,
    record_id UUID,
    record_count INTEGER DEFAULT 1,
    
    -- Data Summary (for audit, without PII)
    data_category VARCHAR(50),
    data_age_days INTEGER, -- How old was the data when deleted
    
    -- Deletion Details
    deleted_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_by UUID REFERENCES auth.users(id), -- NULL for automated
    deletion_method VARCHAR(50) DEFAULT 'automatic', -- automatic, manual, api
    
    -- Verification
    verification_hash VARCHAR(64), -- Hash of deleted data for verification
    backup_retained_until TIMESTAMPTZ, -- If applicable per policy
    
    -- COPPA Specific
    coppa_related BOOLEAN DEFAULT false,
    minor_age_at_deletion INTEGER,
    parental_consent_id UUID,
    
    -- Metadata
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_retention_log_user_id ON data_retention_log(user_id);
CREATE INDEX idx_retention_log_trigger ON data_retention_log(deletion_trigger);
CREATE INDEX idx_retention_log_table ON data_retention_log(table_name);
CREATE INDEX idx_retention_log_deleted_at ON data_retention_log(deleted_at);
CREATE INDEX idx_retention_log_coppa ON data_retention_log(coppa_related) WHERE coppa_related = true;
```

---

## 3. Row Level Security (RLS) Policies

### 3.1 Enable RLS on All Tables

```sql
-- ============================================
-- ENABLE RLS ON ALL TABLES
-- ============================================

ALTER TABLE customer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ugc_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitive_intelligence ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE parental_consent_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_retention_log ENABLE ROW LEVEL SECURITY;
```

### 3.2 Helper Functions

```sql
-- ============================================
-- HELPER FUNCTIONS FOR RLS
-- ============================================

-- Check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM auth.users
        WHERE id = auth.uid()
        AND raw_user_meta_data->>'role' = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if current user is staff
CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM auth.users
        WHERE id = auth.uid()
        AND raw_user_meta_data->>'role' IN ('admin', 'staff', 'moderator')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if current user is service role
CREATE OR REPLACE FUNCTION public.is_service_role()
RETURNS BOOLEAN AS $$
BEGIN
    -- Service role key bypasses RLS, this is for edge functions
    RETURN current_setting('request.jwt.claims', true)::json->>'role' = 'service_role';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get customer profile ID for current user
CREATE OR REPLACE FUNCTION public.get_customer_profile_id()
RETURNS UUID AS $$
DECLARE
    profile_id UUID;
BEGIN
    SELECT id INTO profile_id FROM customer_profiles
    WHERE user_id = auth.uid();
    RETURN profile_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 3.3 RLS Policies

#### 3.3.1 customer_profiles

```sql
-- ============================================
-- RLS: customer_profiles
-- ============================================

-- Allow users to view their own profile
CREATE POLICY "Users can view own profile"
    ON customer_profiles FOR SELECT
    USING (user_id = auth.uid() OR is_admin() OR is_staff());

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile"
    ON customer_profiles FOR UPDATE
    USING (user_id = auth.uid() OR is_admin())
    WITH CHECK (user_id = auth.uid() OR is_admin());

-- Allow admins to insert
CREATE POLICY "Admins can insert profiles"
    ON customer_profiles FOR INSERT
    WITH CHECK (is_admin());

-- Allow users to delete their own profile (account deletion)
CREATE POLICY "Users can delete own profile"
    ON customer_profiles FOR DELETE
    USING (user_id = auth.uid() OR is_admin());
```

#### 3.3.2 ai_conversations

```sql
-- ============================================
-- RLS: ai_conversations
-- ============================================

-- Users can view their own conversations
CREATE POLICY "Users can view own conversations"
    ON ai_conversations FOR SELECT
    USING (user_id = auth.uid() OR is_staff());

-- Anyone can insert (for anonymous chats), but user_id must match or be null
CREATE POLICY "Allow conversation inserts"
    ON ai_conversations FOR INSERT
    WITH CHECK (user_id IS NULL OR user_id = auth.uid());

-- Only service role or admin can update (for retention marking)
CREATE POLICY "Only service can update conversations"
    ON ai_conversations FOR UPDATE
    USING (is_admin());

-- Only service role can delete (retention cleanup)
CREATE POLICY "Only service can delete conversations"
    ON ai_conversations FOR DELETE
    USING (is_admin());
```

#### 3.3.3 product_embeddings

```sql
-- ============================================
-- RLS: product_embeddings
-- ============================================

-- Public read access for product search
CREATE POLICY "Product embeddings are public"
    ON product_embeddings FOR SELECT
    TO authenticated, anon
    USING (true);

-- Only service role can modify
CREATE POLICY "Only service can modify embeddings"
    ON product_embeddings FOR ALL
    USING (is_admin())
    WITH CHECK (is_admin());
```

#### 3.3.4 wishlists & wishlist_items

```sql
-- ============================================
-- RLS: wishlists
-- ============================================

-- View: own wishlists OR public wishlists
CREATE POLICY "Users can view own or public wishlists"
    ON wishlists FOR SELECT
    USING (user_id = auth.uid() OR is_public = true OR is_staff());

-- Insert: only own
CREATE POLICY "Users can create own wishlists"
    ON wishlists FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- Update: only own
CREATE POLICY "Users can update own wishlists"
    ON wishlists FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Delete: only own
CREATE POLICY "Users can delete own wishlists"
    ON wishlists FOR DELETE
    USING (user_id = auth.uid());

-- ============================================
-- RLS: wishlist_items
-- ============================================

CREATE POLICY "Users can view wishlist items"
    ON wishlist_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM wishlists 
            WHERE id = wishlist_items.wishlist_id 
            AND (user_id = auth.uid() OR is_public = true)
        ) OR is_staff()
    );

CREATE POLICY "Users can manage own wishlist items"
    ON wishlist_items FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM wishlists 
            WHERE id = wishlist_items.wishlist_id 
            AND user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM wishlists 
            WHERE id = wishlist_items.wishlist_id 
            AND user_id = auth.uid()
        )
    );
```

#### 3.3.5 loyalty_transactions

```sql
-- ============================================
-- RLS: loyalty_transactions
-- ============================================

-- Users can view their own transactions
CREATE POLICY "Users can view own loyalty transactions"
    ON loyalty_transactions FOR SELECT
    USING (user_id = auth.uid() OR is_staff());

-- Only service role or admin can insert/update (system generated)
CREATE POLICY "Only service can create loyalty transactions"
    ON loyalty_transactions FOR INSERT
    WITH CHECK (is_admin());

-- No user updates allowed
CREATE POLICY "No user updates on loyalty transactions"
    ON loyalty_transactions FOR UPDATE
    USING (is_admin());
```

#### 3.3.6 ugc_submissions

```sql
-- ============================================
-- RLS: ugc_submissions
-- ============================================

-- View: own submissions OR approved public submissions
CREATE POLICY "Users can view own or approved UGC"
    ON ugc_submissions FOR SELECT
    USING (
        user_id = auth.uid() 
        OR (status = 'approved' AND consent_granted = true)
        OR is_staff()
    );

-- Insert: authenticated users only
CREATE POLICY "Authenticated users can submit UGC"
    ON ugc_submissions FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

-- Update: own pending submissions only
CREATE POLICY "Users can update own pending UGC"
    ON ugc_submissions FOR UPDATE
    USING (
        (user_id = auth.uid() AND status = 'pending') 
        OR is_staff()
    )
    WITH CHECK (
        (user_id = auth.uid() AND status = 'pending') 
        OR is_staff()
    );

-- Delete: own or admin
CREATE POLICY "Users can delete own UGC"
    ON ugc_submissions FOR DELETE
    USING (user_id = auth.uid() OR is_admin());
```

#### 3.3.7 content_queue

```sql
-- ============================================
-- RLS: content_queue
-- ============================================

-- Staff only access
CREATE POLICY "Content queue staff access"
    ON content_queue FOR ALL
    USING (is_staff())
    WITH CHECK (is_staff());
```

#### 3.3.8 competitive_intelligence

```sql
-- ============================================
-- RLS: competitive_intelligence
-- ============================================

-- Staff only access
CREATE POLICY "Competitive intelligence staff access"
    ON competitive_intelligence FOR ALL
    USING (is_staff())
    WITH CHECK (is_staff());
```

#### 3.3.9 agent_metrics

```sql
-- ============================================
-- RLS: agent_metrics
-- ============================================

-- Staff can view all metrics
CREATE POLICY "Staff can view agent metrics"
    ON agent_metrics FOR SELECT
    USING (is_staff());

-- Service role can insert
CREATE POLICY "Service can insert agent metrics"
    ON agent_metrics FOR INSERT
    WITH CHECK (true); -- Inserted by edge functions with service role
```

#### 3.3.10 parental_consent_records

```sql
-- ============================================
-- RLS: parental_consent_records
-- ============================================

-- Parents can view their consent records
CREATE POLICY "Parents can view own consent records"
    ON parental_consent_records FOR SELECT
    USING (
        child_user_id = auth.uid() 
        OR parent_email = auth.email()
        OR is_staff()
    );

-- Insert: system only (via service role)
CREATE POLICY "System can insert consent records"
    ON parental_consent_records FOR INSERT
    WITH CHECK (true);

-- Update: parents can update pending, staff can update all
CREATE POLICY "Consent record update policy"
    ON parental_consent_records FOR UPDATE
    USING (
        (parent_email = auth.email() AND verification_status = 'pending')
        OR is_staff()
    )
    WITH CHECK (
        (parent_email = auth.email() AND verification_status = 'pending')
        OR is_staff()
    );
```

#### 3.3.11 data_retention_log

```sql
-- ============================================
-- RLS: data_retention_log
-- ============================================

-- Staff only access
CREATE POLICY "Retention log staff access"
    ON data_retention_log FOR SELECT
    USING (is_staff());

-- Service role can insert
CREATE POLICY "Service can insert retention logs"
    ON data_retention_log FOR INSERT
    WITH CHECK (true);
```

---

## 4. Supabase Auth Configuration

### 4.1 Auth Settings (config.toml)

```toml
# ============================================
# supabase/config.toml - Auth Configuration
# ============================================

[auth]
enabled = true
site_url = "https://parkerjoe.com"
additional_redirect_urls = [
    "https://parkerjoe.com/auth/callback",
    "https://parkerjoe.com/wishlist",
    "https://staging.parkerjoe.com/auth/callback",
    "http://localhost:5173/auth/callback"
]
jwt_expiry = 3600  # 1 hour
jwt_refresh_token_expiry = 604800  # 7 days
enable_signup = true
enable_anonymous_sign_ins = false

[auth.email]
enable_signup = true
double_confirm_changes = true
enable_confirmations = true
secure_password_change = true
max_frequency = "1m0s"  # Rate limit: 1 per minute

[auth.sms]
enable_signup = false  # SMS OTP not enabled initially
enable_confirmations = false

[auth.external.google]
enabled = true
client_id = "env(GOOGLE_CLIENT_ID)"
secret = "env(GOOGLE_CLIENT_SECRET)"
redirect_uri = "https://parkerjoe.com/auth/callback"
url = ""

[auth.external.apple]
enabled = true
client_id = "env(APPLE_CLIENT_ID)"
secret = "env(APPLE_SECRET)"
redirect_uri = "https://parkerjoe.com/auth/callback"
url = ""

[auth.mfa]
max_enrolled_factors = 10
max_verified_factors = 3

[auth.mfa.totp]
enroll_enabled = true
verify_enabled = true
```

### 4.2 Email Templates

#### 4.2.1 Confirm Signup

```html
<!-- templates/confirm-signup.html -->
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Confirm Your ParkerJoe Account</title>
    <style>
        body { font-family: 'Inter', sans-serif; color: #1A1A1A; }
        .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
        .logo { text-align: center; margin-bottom: 30px; }
        .button {
            display: inline-block;
            background: #0F1F3C;
            color: #FFFFFF;
            padding: 14px 32px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 500;
        }
        .footer { margin-top: 40px; font-size: 12px; color: #737373; }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">
            <h1 style="font-family: 'Cormorant Garamond', serif; color: #0F1F3C;">ParkerJoe</h1>
        </div>
        
        <h2>Welcome to ParkerJoe!</h2>
        <p>Hi {{ .FirstName }},</p>
        <p>Thank you for creating an account. Please confirm your email address to get started.</p>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="{{ .ConfirmationURL }}" class="button">Confirm Email Address</a>
        </div>
        
        <p>Or copy and paste this link into your browser:</p>
        <p style="word-break: break-all;">{{ .ConfirmationURL }}</p>
        
        <div class="footer">
            <p>If you didn't create this account, you can safely ignore this email.</p>
            <p>© {{ .Year }} ParkerJoe. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
```

#### 4.2.2 Reset Password

```html
<!-- templates/reset-password.html -->
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Reset Your ParkerJoe Password</title>
    <style>
        body { font-family: 'Inter', sans-serif; color: #1A1A1A; }
        .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
        .button {
            display: inline-block;
            background: #0F1F3C;
            color: #FFFFFF;
            padding: 14px 32px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 500;
        }
    </style>
</head>
<body>
    <div class="container">
        <h2 style="font-family: 'Cormorant Garamond', serif; color: #0F1F3C;">Reset Your Password</h2>
        <p>Hi {{ .FirstName }},</p>
        <p>We received a request to reset your password. Click the button below to create a new password:</p>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="{{ .ConfirmationURL }}" class="button">Reset Password</a>
        </div>
        
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, you can safely ignore this email.</p>
    </div>
</body>
</html>
```

### 4.3 Auth Hooks (Webhooks)

```typescript
// supabase/functions/auth-hooks/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface AuthWebhookPayload {
  type: 'USER_CREATED' | 'USER_DELETED' | 'USER_CONFIRMED'
  user: {
    id: string
    email: string
    user_metadata: {
      first_name?: string
      last_name?: string
      is_minor?: boolean
    }
  }
}

serve(async (req) => {
  const payload: AuthWebhookPayload = await req.json()
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  switch (payload.type) {
    case 'USER_CREATED':
      await handleUserCreated(supabase, payload.user)
      break
    case 'USER_CONFIRMED':
      await handleUserConfirmed(supabase, payload.user)
      break
    case 'USER_DELETED':
      await handleUserDeleted(supabase, payload.user)
      break
  }

  return new Response('OK', { status: 200 })
})

async function handleUserCreated(supabase: any, user: any) {
  // Create initial customer profile
  const { error } = await supabase
    .from('customer_profiles')
    .insert({
      user_id: user.id,
      first_name: user.user_metadata?.first_name || '',
      last_name: user.user_metadata?.last_name || '',
      email_verified: false,
      is_minor: user.user_metadata?.is_minor || false,
      parental_consent_required: user.user_metadata?.is_minor || false
    })
  
  if (error) console.error('Error creating profile:', error)
}

async function handleUserConfirmed(supabase: any, user: any) {
  // Update email verified status
  const { error } = await supabase
    .from('customer_profiles')
    .update({ email_verified: true })
    .eq('user_id', user.id)
  
  if (error) console.error('Error updating profile:', error)
  
  // Trigger welcome email via external service
  await fetch('https://api.parkerjoe.com/webhooks/welcome', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: user.id, email: user.email })
  })
}

async function handleUserDeleted(supabase: any, user: any) {
  // Log data retention for audit
  await supabase
    .from('data_retention_log')
    .insert({
      user_id: user.id,
      deletion_trigger: 'account_deletion',
      table_name: 'auth.users',
      data_category: 'user_account',
      notes: 'User account deleted via auth webhook'
    })
}
```

### 4.4 JWT Configuration

```typescript
// lib/supabase/client.ts

import { createClient } from '@supabase/supabase-js'
import { Database } from './database.types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storageKey: 'parkerjoe-auth',
    storage: localStorage,
    flowType: 'pkce' // PKCE for OAuth security
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

// Service role client (server-side only)
export const supabaseAdmin = createClient<Database>(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)
```

---

## 5. Supabase Storage

### 5.1 Bucket Configuration

```sql
-- ============================================
-- STORAGE BUCKETS
-- ============================================

-- UGC Images - Customer photos and videos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'ugc-images',
    'ugc-images',
    false,
    10485760, -- 10MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'video/mp4']
)
ON CONFLICT (id) DO NOTHING;

-- Content Assets - Blog images, marketing materials
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'content-assets',
    'content-assets',
    true,
    20971520, -- 20MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- Document Uploads - Consent forms, ID verification
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'document-uploads',
    'document-uploads',
    false,
    5242880, -- 5MB limit
    ARRAY['application/pdf', 'image/jpeg', 'image/png']
)
ON CONFLICT (id) DO NOTHING;
```

### 5.2 Storage RLS Policies

```sql
-- ============================================
-- STORAGE RLS POLICIES
-- ============================================

-- UGC Images Policies
CREATE POLICY "Users can upload own UGC"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'ugc-images' 
        AND auth.role() = 'authenticated'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

CREATE POLICY "Users can view own UGC"
    ON storage.objects FOR SELECT
    USING (
        bucket_id = 'ugc-images'
        AND (
            (storage.foldername(name))[1] = auth.uid()::text
            OR EXISTS (
                SELECT 1 FROM ugc_submissions 
                WHERE media_urls @> ARRAY[storage.url(name)]
                AND status = 'approved'
            )
        )
    );

CREATE POLICY "Users can delete own UGC"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'ugc-images'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- Content Assets Policies (Public Read)
CREATE POLICY "Content assets public read"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'content-assets');

CREATE POLICY "Staff can manage content assets"
    ON storage.objects FOR ALL
    USING (
        bucket_id = 'content-assets'
        AND EXISTS (
            SELECT 1 FROM auth.users
            WHERE id = auth.uid()
            AND raw_user_meta_data->>'role' IN ('admin', 'staff', 'content_manager')
        )
    );

-- Document Uploads Policies
CREATE POLICY "Users can upload own documents"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'document-uploads'
        AND auth.role() = 'authenticated'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

CREATE POLICY "Users can view own documents"
    ON storage.objects FOR SELECT
    USING (
        bucket_id = 'document-uploads'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

CREATE POLICY "Staff can view all documents"
    ON storage.objects FOR SELECT
    USING (
        bucket_id = 'document-uploads'
        AND EXISTS (
            SELECT 1 FROM auth.users
            WHERE id = auth.uid()
            AND raw_user_meta_data->>'role' IN ('admin', 'staff')
        )
    );
```

### 5.3 Storage Client Configuration

```typescript
// lib/supabase/storage.ts

import { supabase } from './client'

export const storage = {
  // UGC Upload
  async uploadUGC(file: File, fileName: string) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Authentication required')
    
    const path = `${user.id}/${Date.now()}-${fileName}`
    
    const { data, error } = await supabase.storage
      .from('ugc-images')
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type
      })
    
    if (error) throw error
    
    // Get public URL if approved, signed URL otherwise
    const { data: { publicUrl } } = supabase.storage
      .from('ugc-images')
      .getPublicUrl(path)
    
    return { path, publicUrl }
  },

  // Document Upload (consent forms)
  async uploadDocument(file: File, documentType: 'consent' | 'id') {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Authentication required')
    
    const path = `${user.id}/${documentType}-${Date.now()}.pdf`
    
    const { data, error } = await supabase.storage
      .from('document-uploads')
      .upload(path, file, {
        cacheControl: '3600',
        upsert: true,
        contentType: 'application/pdf'
      })
    
    if (error) throw error
    return { path }
  },

  // Get signed URL for private documents
  async getSignedDocumentUrl(path: string, expiresIn: number = 3600) {
    const { data, error } = await supabase.storage
      .from('document-uploads')
      .createSignedUrl(path, expiresIn)
    
    if (error) throw error
    return data.signedUrl
  },

  // Delete file
  async deleteFile(bucket: string, path: string) {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path])
    
    if (error) throw error
  }
}
```

---

## 6. Edge Functions

### 6.1 Project Structure

```
supabase/
├── functions/
│   ├── _shared/
│   │   ├── cors.ts
│   │   ├── supabase.ts
│   │   ├── errors.ts
│   │   └── validators.ts
│   ├── orchestrator/
│   │   └── index.ts
│   ├── agent-handler/
│   │   └── index.ts
│   ├── webhook-handler/
│   │   └── index.ts
│   ├── coppa-cleanup/
│   │   └── index.ts
│   └── import_map.json
└── config.toml
```

### 6.2 Shared Utilities

```typescript
// supabase/functions/_shared/cors.ts

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS'
}

export function handleCors(req: Request) {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  return null
}
```

```typescript
// supabase/functions/_shared/supabase.ts

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'
import type { Database } from './database.types.ts'

export function getSupabaseClient() {
  return createClient<Database>(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )
}

export function getSupabaseAdmin() {
  return createClient<Database>(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}
```

```typescript
// supabase/functions/_shared/errors.ts

export class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code: string = 'INTERNAL_ERROR'
  ) {
    super(message)
    this.name = 'APIError'
  }
}

export function handleError(error: unknown): Response {
  if (error instanceof APIError) {
    return new Response(
      JSON.stringify({ 
        error: error.message, 
        code: error.code 
      }),
      { 
        status: error.statusCode,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
  
  console.error('Unexpected error:', error)
  return new Response(
    JSON.stringify({ 
      error: 'Internal server error', 
      code: 'INTERNAL_ERROR' 
    }),
    { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
```

### 6.3 Orchestrator Function

```typescript
// supabase/functions/orchestrator/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { getSupabaseClient } from '../_shared/supabase.ts'
import { corsHeaders, handleCors } from '../_shared/cors.ts'
import { APIError, handleError } from '../_shared/errors.ts'

interface OrchestratorEvent {
  type: 'chat_message' | 'product_search' | 'wishlist_update' | 
        'loyalty_check' | 'ugc_submit' | 'consent_verify'
  payload: Record<string, unknown>
  userId?: string
  sessionId: string
  timestamp: string
}

const EVENT_HANDLERS: Record<string, string> = {
  'chat_message': 'agent-handler',
  'product_search': 'agent-handler',
  'wishlist_update': 'webhook-handler',
  'loyalty_check': 'webhook-handler',
  'ugc_submit': 'webhook-handler',
  'consent_verify': 'webhook-handler'
}

serve(async (req) => {
  const corsResponse = handleCors(req)
  if (corsResponse) return corsResponse

  try {
    const event: OrchestratorEvent = await req.json()
    
    // Validate event
    if (!event.type || !event.sessionId) {
      throw new APIError('Invalid event structure', 400, 'INVALID_EVENT')
    }

    const supabase = getSupabaseClient()
    
    // Log event receipt
    await supabase.from('agent_metrics').insert({
      agent_name: 'orchestrator',
      agent_version: '1.0.0',
      agent_type: 'customer_service',
      execution_id: crypto.randomUUID(),
      session_id: event.sessionId,
      user_id: event.userId,
      started_at: new Date().toISOString(),
      status: 'running',
      input_summary: JSON.stringify({ event_type: event.type })
    })

    // Route to appropriate handler
    const handler = EVENT_HANDLERS[event.type]
    if (!handler) {
      throw new APIError(`Unknown event type: ${event.type}`, 400, 'UNKNOWN_EVENT_TYPE')
    }

    // Invoke target edge function
    const { data: functionData, error: functionError } = await supabase.functions.invoke(handler, {
      body: event
    })

    if (functionError) {
      throw new APIError(`Handler error: ${functionError.message}`, 502, 'HANDLER_ERROR')
    }

    return new Response(
      JSON.stringify({
        success: true,
        handler,
        result: functionData
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    return handleError(error)
  }
})
```

### 6.4 Agent Handler Function

```typescript
// supabase/functions/agent-handler/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { getSupabaseClient } from '../_shared/supabase.ts'
import { corsHeaders, handleCors } from '../_shared/cors.ts'
import { APIError, handleError } from '../_shared/errors.ts'

interface AgentRequest {
  type: 'chat_message' | 'product_search'
  payload: {
    message?: string
    productQuery?: string
    context?: Record<string, unknown>
  }
  userId?: string
  sessionId: string
}

interface AIResponse {
  response: string
  recommendations?: Array<{
    productId: string
    name: string
    confidence: number
  }>
}

serve(async (req) => {
  const corsResponse = handleCors(req)
  if (corsResponse) return corsResponse

  try {
    const request: AgentRequest = await req.json()
    const supabase = getSupabaseClient()
    
    const executionId = crypto.randomUUID()
    const startedAt = Date.now()

    let aiResponse: AIResponse

    switch (request.type) {
      case 'chat_message':
        aiResponse = await handleChatMessage(supabase, request)
        break
      case 'product_search':
        aiResponse = await handleProductSearch(supabase, request)
        break
      default:
        throw new APIError(`Unknown agent request type: ${request.type}`, 400)
    }

    // Log metrics
    const duration = Date.now() - startedAt
    await supabase.from('agent_metrics').insert({
      agent_name: 'ai-stylist',
      agent_version: '1.0.0',
      agent_type: 'stylist',
      execution_id: executionId,
      session_id: request.sessionId,
      user_id: request.userId,
      started_at: new Date(startedAt).toISOString(),
      completed_at: new Date().toISOString(),
      duration_ms: duration,
      status: 'success',
      input_summary: request.payload.message?.slice(0, 100),
      output_summary: aiResponse.response.slice(0, 100)
    })

    // Store conversation if user is authenticated
    if (request.userId) {
      await supabase.from('ai_conversations').insert({
        session_id: request.sessionId,
        user_id: request.userId,
        message_role: 'user',
        message_content: request.payload.message || request.payload.productQuery || '',
        conversation_context: request.payload.context || {},
        is_minor_user: await checkIsMinor(supabase, request.userId),
        retention_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      })

      await supabase.from('ai_conversations').insert({
        session_id: request.sessionId,
        user_id: request.userId,
        message_role: 'assistant',
        message_content: aiResponse.response,
        message_metadata: { recommendations: aiResponse.recommendations },
        conversation_context: request.payload.context || {},
        is_minor_user: await checkIsMinor(supabase, request.userId),
        retention_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      })
    }

    return new Response(
      JSON.stringify(aiResponse),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return handleError(error)
  }
})

async function handleChatMessage(supabase: any, request: AgentRequest): Promise<AIResponse> {
  // Get relevant products via vector search
  const { data: similarProducts } = await supabase.rpc('search_products', {
    query_embedding: await generateEmbedding(request.payload.message || ''),
    match_threshold: 0.7,
    match_count: 5
  })

  // Call external AI service (OpenAI/Anthropic)
  const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: `You are a helpful assistant for ParkerJoe, a premium boys' clothing store. 
                   Be friendly and professional. Recommend products based on the context provided.`
        },
        {
          role: 'user',
          content: request.payload.message
        }
      ],
      context: {
        products: similarProducts,
        userContext: request.payload.context
      }
    })
  })

  const aiResult = await openaiResponse.json()
  
  return {
    response: aiResult.choices[0].message.content,
    recommendations: similarProducts?.map((p: any) => ({
      productId: p.product_id,
      name: p.product_name,
      confidence: 1 - p.distance
    })) || []
  }
}

async function handleProductSearch(supabase: any, request: AgentRequest): Promise<AIResponse> {
  // Vector search implementation
  const { data: products } = await supabase.rpc('search_products', {
    query_embedding: await generateEmbedding(request.payload.productQuery || ''),
    match_threshold: 0.6,
    match_count: 10
  })

  return {
    response: `Found ${products?.length || 0} products matching your search.`,
    recommendations: products?.map((p: any) => ({
      productId: p.product_id,
      name: p.product_name,
      confidence: 1 - p.distance
    })) || []
  }
}

async function generateEmbedding(text: string): Promise<number[]> {
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      input: text,
      model: 'text-embedding-3-small'
    })
  })

  const result = await response.json()
  return result.data[0].embedding
}

async function checkIsMinor(supabase: any, userId: string): Promise<boolean> {
  const { data } = await supabase
    .from('customer_profiles')
    .select('is_minor')
    .eq('user_id', userId)
    .single()
  
  return data?.is_minor || false
}
```

### 6.5 Webhook Handler Function

```typescript
// supabase/functions/webhook-handler/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { getSupabaseClient } from '../_shared/supabase.ts'
import { corsHeaders, handleCors } from '../_shared/cors.ts'
import { APIError, handleError } from '../_shared/errors.ts'
import { crypto } from 'https://deno.land/std@0.168.0/crypto/mod.ts'

interface WebhookPayload {
  type: 'shopify/order_created' | 'shopify/customer_updated' | 
        'shopify/product_updated' | 'loyalty/calculate' |
        'ugc/submitted' | 'consent/verified'
  data: Record<string, unknown>
}

serve(async (req) => {
  const corsResponse = handleCors(req)
  if (corsResponse) return corsResponse

  try {
    // Verify Shopify webhook signature
    const signature = req.headers.get('X-Shopify-Hmac-SHA256')
    if (signature && !verifyShopifyWebhook(await req.text(), signature)) {
      throw new APIError('Invalid webhook signature', 401, 'INVALID_SIGNATURE')
    }

    const payload: WebhookPayload = await req.json()
    const supabase = getSupabaseClient()

    switch (payload.type) {
      case 'shopify/order_created':
        await handleOrderCreated(supabase, payload.data)
        break
      case 'shopify/customer_updated':
        await handleCustomerUpdated(supabase, payload.data)
        break
      case 'shopify/product_updated':
        await handleProductUpdated(supabase, payload.data)
        break
      case 'loyalty/calculate':
        await handleLoyaltyCalculation(supabase, payload.data)
        break
      case 'ugc/submitted':
        await handleUGCSubmission(supabase, payload.data)
        break
      case 'consent/verified':
        await handleConsentVerified(supabase, payload.data)
        break
      default:
        throw new APIError(`Unknown webhook type: ${payload.type}`, 400)
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return handleError(error)
  }
})

async function handleOrderCreated(supabase: any, data: any) {
  // Calculate loyalty points
  const pointsEarned = Math.floor(data.total_price * 10) // 10 points per dollar
  
  // Get user ID from Shopify customer ID
  const { data: profile } = await supabase
    .from('customer_profiles')
    .select('user_id, loyalty_points')
    .eq('shopify_customer_id', data.customer.id.toString())
    .single()

  if (profile) {
    // Insert transaction
    await supabase.from('loyalty_transactions').insert({
      user_id: profile.user_id,
      transaction_type: 'earn_purchase',
      points_amount: pointsEarned,
      points_balance_after: profile.loyalty_points + pointsEarned,
      order_id: data.id.toString(),
      order_total: data.total_price,
      description: `Points earned from order ${data.name}`
    })

    // Update profile points
    await supabase
      .from('customer_profiles')
      .update({ 
        loyalty_points: profile.loyalty_points + pointsEarned,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', profile.user_id)

    // Check for tier upgrade
    await checkTierUpgrade(supabase, profile.user_id, profile.loyalty_points + pointsEarned)
  }
}

async function handleProductUpdated(supabase: any, data: any) {
  // Generate new embedding for updated product
  const productText = `${data.title} ${data.description} ${data.tags?.join(' ')}`
  
  // Call embedding generation
  const embedding = await generateProductEmbedding(productText)
  
  // Upsert to product_embeddings
  await supabase.from('product_embeddings').upsert({
    product_id: data.id.toString(),
    shopify_product_id: data.id.toString(),
    embedding: embedding,
    product_name: data.title,
    product_description: data.description,
    product_category: data.product_type,
    product_tags: data.tags,
    last_synced_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  })
}

async function checkTierUpgrade(supabase: any, userId: string, totalPoints: number) {
  let newTier = 'bronze'
  if (totalPoints >= 10000) newTier = 'platinum'
  else if (totalPoints >= 5000) newTier = 'gold'
  else if (totalPoints >= 1000) newTier = 'silver'

  const { data: profile } = await supabase
    .from('customer_profiles')
    .select('loyalty_tier')
    .eq('user_id', userId)
    .single()

  if (profile && profile.loyalty_tier !== newTier) {
    await supabase
      .from('customer_profiles')
      .update({
        loyalty_tier: newTier,
        tier_entry_date: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)

    // Trigger tier upgrade notification
    await fetch('https://api.parkerjoe.com/webhooks/tier-upgrade', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, new_tier: newTier })
    })
  }
}

function verifyShopifyWebhook(body: string, signature: string): boolean {
  const secret = Deno.env.get('SHOPIFY_WEBHOOK_SECRET')!
  const hmac = crypto.subtle.signSync(
    'HMAC-SHA256',
    new TextEncoder().encode(secret),
    new TextEncoder().encode(body)
  )
  const computedSignature = btoa(String.fromCharCode(...new Uint8Array(hmac)))
  return computedSignature === signature
}

async function generateProductEmbedding(text: string): Promise<number[]> {
  // Implementation similar to agent-handler
  return []
}

// Stub implementations for other handlers
async function handleCustomerUpdated(supabase: any, data: any) {}
async function handleLoyaltyCalculation(supabase: any, data: any) {}
async function handleUGCSubmission(supabase: any, data: any) {}
async function handleConsentVerified(supabase: any, data: any) {}
```

### 6.6 COPPA Cleanup Function

```typescript
// supabase/functions/coppa-cleanup/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { getSupabaseClient } from '../_shared/supabase.ts'
import { handleError } from '../_shared/errors.ts'

interface CleanupResult {
  conversations_deleted: number
  consent_records_archived: number
  ugc_purged: number
  logs_created: number
}

serve(async (req) => {
  // Only allow scheduled invocations or admin requests
  const authHeader = req.headers.get('Authorization')
  if (!authHeader?.includes(Deno.env.get('CRON_SECRET')!)) {
    return new Response('Unauthorized', { status: 401 })
  }

  try {
    const supabase = getSupabaseClient()
    const results: CleanupResult = {
      conversations_deleted: 0,
      consent_records_archived: 0,
      ugc_purged: 0,
      logs_created: 0
    }

    // 1. Purge expired AI conversations (30-day retention for minors)
    const { data: expiredConversations, error: convError } = await supabase
      .from('ai_conversations')
      .select('id, user_id, is_minor_user')
      .lt('retention_until', new Date().toISOString())
      .is('purged_at', null)

    if (expiredConversations) {
      for (const conv of expiredConversations) {
        // Log deletion
        await supabase.from('data_retention_log').insert({
          user_id: conv.user_id,
          deletion_trigger: 'retention_expired',
          table_name: 'ai_conversations',
          record_id: conv.id,
          data_category: 'chat_history',
          coppa_related: conv.is_minor_user,
          deleted_at: new Date().toISOString(),
          deletion_method: 'automatic'
        })
        results.logs_created++
      }

      // Mark as purged (soft delete, hard delete after backup period)
      const { data: updateData } = await supabase
        .from('ai_conversations')
        .update({ 
          purged_at: new Date().toISOString(),
          message_content: '[REDACTED - RETENTION EXPIRED]',
          pii_redacted_content: null
        })
        .in('id', expiredConversations.map(c => c.id))
        .select()

      results.conversations_deleted = updateData?.length || 0
    }

    // 2. Archive expired parental consent records
    const { data: expiredConsents } = await supabase
      .from('parental_consent_records')
      .select('id, child_user_id')
      .lt('consent_expires_at', new Date().toISOString())
      .eq('verification_status', 'verified')
      .is('revoked_at', null)
      .is('renewed_from', null)

    if (expiredConsents) {
      for (const consent of expiredConsents) {
        // Update child profile to require new consent
        await supabase
          .from('customer_profiles')
          .update({
            parental_consent_obtained: false,
            coppa_restricted: true,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', consent.child_user_id)

        // Send renewal notification
        await fetch('https://api.parkerjoe.com/webhooks/consent-expired', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ consent_id: consent.id })
        })
      }
      results.consent_records_archived = expiredConsents.length
    }

    // 3. Purge UGC without consent
    const { data: unconsentedUGC } = await supabase
      .from('ugc_submissions')
      .select('id, user_id, media_urls')
      .eq('consent_granted', false)
      .lt('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

    if (unconsentedUGC) {
      for (const ugc of unconsentedUGC) {
        // Delete media from storage
        if (ugc.media_urls) {
          for (const url of ugc.media_urls) {
            const path = url.split('/').pop()
            if (path) {
              await supabase.storage.from('ugc-images').remove([path])
            }
          }
        }

        // Log deletion
        await supabase.from('data_retention_log').insert({
          user_id: ugc.user_id,
          deletion_trigger: 'coppa_compliance',
          table_name: 'ugc_submissions',
          record_id: ugc.id,
          data_category: 'user_generated_content',
          coppa_related: true,
          notes: 'Deleted due to missing consent'
        })
      }

      // Delete records
      await supabase
        .from('ugc_submissions')
        .delete()
        .in('id', unconsentedUGC.map(u => u.id))

      results.ugc_purged = unconsentedUGC.length
    }

    return new Response(
      JSON.stringify({
        success: true,
        executed_at: new Date().toISOString(),
        results
      }),
      { headers: { 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return handleError(error)
  }
})
```

---

## 7. Database Functions & Triggers

### 7.1 Auto-Update Timestamps

```sql
-- ============================================
-- FUNCTION: Auto-update updated_at
-- ============================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_customer_profiles_updated_at
    BEFORE UPDATE ON customer_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wishlists_updated_at
    BEFORE UPDATE ON wishlists
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wishlist_items_updated_at
    BEFORE UPDATE ON wishlist_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ugc_submissions_updated_at
    BEFORE UPDATE ON ugc_submissions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_queue_updated_at
    BEFORE UPDATE ON content_queue
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_embeddings_updated_at
    BEFORE UPDATE ON product_embeddings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 7.2 Loyalty Points Calculation

```sql
-- ============================================
-- FUNCTION: Calculate loyalty points for order
-- ============================================

CREATE OR REPLACE FUNCTION public.calculate_loyalty_points(
    order_total DECIMAL,
    user_tier VARCHAR DEFAULT 'bronze'
)
RETURNS INTEGER AS $$
DECLARE
    base_multiplier DECIMAL := 10;
    tier_multiplier DECIMAL := 1;
    points INTEGER;
BEGIN
    -- Tier multipliers
    tier_multiplier := CASE user_tier
        WHEN 'bronze' THEN 1
        WHEN 'silver' THEN 1.25
        WHEN 'gold' THEN 1.5
        WHEN 'platinum' THEN 2
        ELSE 1
    END;
    
    points := FLOOR(order_total * base_multiplier * tier_multiplier);
    RETURN points;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FUNCTION: Process loyalty transaction
-- ============================================

CREATE OR REPLACE FUNCTION public.process_loyalty_transaction()
RETURNS TRIGGER AS $$
DECLARE
    current_points INTEGER;
    user_tier VARCHAR;
BEGIN
    -- Get current balance
    SELECT loyalty_points, loyalty_tier 
    INTO current_points, user_tier
    FROM customer_profiles 
    WHERE user_id = NEW.user_id;
    
    -- Calculate new balance
    NEW.points_balance_after := COALESCE(current_points, 0) + NEW.points_amount;
    
    -- Validate sufficient points for redemption
    IF NEW.points_amount < 0 AND NEW.points_balance_after < 0 THEN
        RAISE EXCEPTION 'Insufficient loyalty points for redemption';
    END IF;
    
    -- Update user profile
    UPDATE customer_profiles 
    SET loyalty_points = NEW.points_balance_after,
        updated_at = NOW()
    WHERE user_id = NEW.user_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER before_loyalty_transaction
    BEFORE INSERT ON loyalty_transactions
    FOR EACH ROW EXECUTE FUNCTION process_loyalty_transaction();
```

### 7.3 Consent Expiration Check

```sql
-- ============================================
-- FUNCTION: Check consent expiration
-- ============================================

CREATE OR REPLACE FUNCTION public.check_consent_expiration()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if consent is expiring within 30 days
    IF NEW.consent_expires_at < NOW() + INTERVAL '30 days' 
       AND NEW.expiry_notice_sent_at IS NULL THEN
        -- Trigger notification (via edge function or webhook)
        PERFORM pg_notify('consent_expiring', json_build_object(
            'consent_id', NEW.id,
            'parent_email', NEW.parent_email,
            'expires_at', NEW.consent_expires_at
        )::text);
        
        NEW.expiry_notice_sent_at := NOW();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_consent_expiration_trigger
    BEFORE UPDATE ON parental_consent_records
    FOR EACH ROW EXECUTE FUNCTION check_consent_expiration();
```

### 7.4 Data Retention Automation

```sql
-- ============================================
-- FUNCTION: Schedule data purging
-- ============================================

CREATE OR REPLACE FUNCTION public.schedule_data_purge()
RETURNS void AS $$
BEGIN
    -- Mark records for purging
    UPDATE ai_conversations
    SET purged_at = NOW()
    WHERE retention_until < NOW()
      AND purged_at IS NULL;
    
    -- Log the purging
    INSERT INTO data_retention_log (
        deletion_trigger,
        table_name,
        record_count,
        deleted_at,
        deletion_method,
        coppa_related
    )
    SELECT 
        'retention_expired',
        'ai_conversations',
        COUNT(*),
        NOW(),
        'automatic',
        true
    FROM ai_conversations
    WHERE purged_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FUNCTION: User account deletion (GDPR/COPPA)
-- ============================================

CREATE OR REPLACE FUNCTION public.delete_user_account(user_id UUID)
RETURNS void AS $$
BEGIN
    -- Log the deletion request
    INSERT INTO data_retention_log (
        user_id,
        deletion_trigger,
        table_name,
        data_category,
        notes
    ) VALUES (
        user_id,
        'user_request',
        'multiple',
        'user_account',
        'Full account deletion initiated'
    );
    
    -- Mark profile as deactivated
    UPDATE customer_profiles
    SET account_status = 'deactivated',
        email_opt_in = false,
        sms_opt_in = false,
        updated_at = NOW()
    WHERE user_id = delete_user_account.user_id;
    
    -- Note: Actual auth.users deletion is handled via auth hook
END;
$$ LANGUAGE plpgsql;
```

### 7.5 Wishlist Item Count Trigger

```sql
-- ============================================
-- FUNCTION: Update wishlist item count
-- ============================================

CREATE OR REPLACE FUNCTION public.update_wishlist_item_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE wishlists 
        SET item_count = item_count + 1,
            updated_at = NOW()
        WHERE id = NEW.wishlist_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE wishlists 
        SET item_count = item_count - 1,
            updated_at = NOW()
        WHERE id = OLD.wishlist_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_wishlist_count_on_insert
    AFTER INSERT ON wishlist_items
    FOR EACH ROW EXECUTE FUNCTION update_wishlist_item_count();

CREATE TRIGGER update_wishlist_count_on_delete
    AFTER DELETE ON wishlist_items
    FOR EACH ROW EXECUTE FUNCTION update_wishlist_item_count();
```

---

## 8. Vector Database (pgvector)

### 8.1 Vector Search Functions

```sql
-- ============================================
-- FUNCTION: Search products by vector similarity
-- ============================================

CREATE OR REPLACE FUNCTION public.search_products(
    query_embedding VECTOR(1536),
    match_threshold FLOAT DEFAULT 0.7,
    match_count INT DEFAULT 10,
    category_filter VARCHAR DEFAULT NULL
)
RETURNS TABLE(
    id UUID,
    product_id VARCHAR,
    product_name VARCHAR,
    product_description TEXT,
    product_category VARCHAR,
    similarity FLOAT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pe.id,
        pe.product_id,
        pe.product_name,
        pe.product_description,
        pe.product_category,
        1 - (pe.embedding <=> query_embedding) AS similarity
    FROM product_embeddings pe
    WHERE pe.is_active = true
      AND (category_filter IS NULL OR pe.product_category = category_filter)
      AND 1 - (pe.embedding <=> query_embedding) > match_threshold
    ORDER BY pe.embedding <=> query_embedding
    LIMIT match_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FUNCTION: Search with hybrid (vector + text)
-- ============================================

CREATE OR REPLACE FUNCTION public.hybrid_product_search(
    query_embedding VECTOR(1536),
    search_query TEXT,
    match_threshold FLOAT DEFAULT 0.6,
    match_count INT DEFAULT 10
)
RETURNS TABLE(
    id UUID,
    product_id VARCHAR,
    product_name VARCHAR,
    similarity FLOAT,
    text_rank FLOAT,
    combined_score FLOAT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pe.id,
        pe.product_id,
        pe.product_name,
        1 - (pe.embedding <=> query_embedding) AS similarity,
        ts_rank(pe.search_keywords, plainto_tsquery('english', search_query)) AS text_rank,
        (
            (1 - (pe.embedding <=> query_embedding)) * 0.7 +
            COALESCE(ts_rank(pe.search_keywords, plainto_tsquery('english', search_query)), 0) * 0.3
        ) AS combined_score
    FROM product_embeddings pe
    WHERE pe.is_active = true
      AND (
          1 - (pe.embedding <=> query_embedding) > match_threshold
          OR pe.search_keywords @@ plainto_tsquery('english', search_query)
      )
    ORDER BY combined_score DESC
    LIMIT match_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FUNCTION: Get similar products
-- ============================================

CREATE OR REPLACE FUNCTION public.get_similar_products(
    product_id_param VARCHAR,
    match_count INT DEFAULT 5
)
RETURNS TABLE(
    id UUID,
    product_id VARCHAR,
    product_name VARCHAR,
    similarity FLOAT
) AS $$
DECLARE
    product_embedding VECTOR(1536);
BEGIN
    -- Get embedding of reference product
    SELECT embedding INTO product_embedding
    FROM product_embeddings
    WHERE product_id = product_id_param;
    
    IF product_embedding IS NULL THEN
        RETURN;
    END IF;
    
    RETURN QUERY
    SELECT 
        pe.id,
        pe.product_id,
        pe.product_name,
        1 - (pe.embedding <=> product_embedding) AS similarity
    FROM product_embeddings pe
    WHERE pe.product_id != product_id_param
      AND pe.is_active = true
    ORDER BY pe.embedding <=> product_embedding
    LIMIT match_count;
END;
$$ LANGUAGE plpgsql;
```

### 8.2 Index Configuration

```sql
-- ============================================
-- VECTOR INDEX OPTIMIZATION
-- ============================================

-- IVFFlat index for approximate nearest neighbor search
-- Lists should be ~sqrt(n) where n is number of vectors
CREATE INDEX idx_product_embeddings_ivfflat 
ON product_embeddings 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100); -- Adjust based on data size

-- For exact search with smaller datasets (<100k)
-- CREATE INDEX idx_product_embeddings_exact 
-- ON product_embeddings 
-- USING hnsw (embedding vector_cosine_ops);

-- Update search_keywords when product data changes
CREATE OR REPLACE FUNCTION public.update_product_search_keywords()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_keywords := 
        setweight(to_tsvector('english', COALESCE(NEW.product_name, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(NEW.product_description, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(array_to_string(NEW.product_tags, ' '), '')), 'C');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_search_keywords
    BEFORE INSERT OR UPDATE ON product_embeddings
    FOR EACH ROW EXECUTE FUNCTION update_product_search_keywords();
```

---

## 9. Environment Setup

### 9.1 Local Development

```bash
# ============================================
# LOCAL DEVELOPMENT SETUP
# ============================================

# 1. Install Supabase CLI
curl -fsSL https://get.supabase.com | bash

# 2. Initialize project
supabase init

# 3. Start local stack
supabase start

# 4. Link to remote project (for staging/prod)
supabase link --project-ref <project-ref>

# 5. Run migrations
supabase db reset

# 6. Seed data
supabase seed apply
```

### 9.2 Environment Variables

```bash
# ============================================
# .env.local (never commit)
# ============================================

# Supabase
SUPABASE_URL=http://localhost:54321
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs...

# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:54322/postgres

# External APIs
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# Shopify
SHOPIFY_STORE_DOMAIN=parkerjoe.myshopify.com
SHOPIFY_ACCESS_TOKEN=shpat_...
SHOPIFY_WEBHOOK_SECRET=...

# Auth
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
APPLE_CLIENT_ID=...
APPLE_SECRET=...

# Security
CRON_SECRET=...
JWT_SECRET=...

# Feature Flags
ENABLE_AI_STYLIST=true
ENABLE_LOYALTY_PROGRAM=true
ENABLE_COPPA_RESTRICTIONS=true
```

### 9.3 Staging Configuration

```toml
# ============================================
# supabase/config.staging.toml
# ============================================

project_id = "parkerjoe-staging"

[api]
enabled = true
port = 54321
schemas = ["public", "storage"]
extra_search_path = ["public", "extensions"]
max_rows = 1000

[db]
port = 54322
shadow_port = 54320
major_version = 15

[db.pooler]
enabled = true
port = 54329
pool_mode = "transaction"
default_pool_size = 20
max_client_conn = 100

[studio]
enabled = true
port = 54323

[inbucket]
enabled = true
port = 54324

[storage]
enabled = true
file_size_limit = "50MiB"

[auth]
site_url = "https://staging.parkerjoe.com"
additional_redirect_urls = [
    "https://staging.parkerjoe.com/auth/callback"
]
```

### 9.4 Production Configuration

```toml
# ============================================
# supabase/config.production.toml
# ============================================

project_id = "parkerjoe-production"

[api]
enabled = true
port = 54321
schemas = ["public", "storage"]
extra_search_path = ["public", "extensions"]
max_rows = 1000

[db]
port = 54322
shadow_port = 54320
major_version = 15

# Production pooler settings
[db.pooler]
enabled = true
port = 54329
pool_mode = "transaction"
default_pool_size = 100
max_client_conn = 500

[studio]
enabled = false  # Disable in production

[inbucket]
enabled = false  # Disable in production

[storage]
enabled = true
file_size_limit = "100MiB"

[auth]
site_url = "https://parkerjoe.com"
additional_redirect_urls = [
    "https://parkerjoe.com/auth/callback",
    "https://www.parkerjoe.com/auth/callback"
]
# Stricter JWT settings
jwt_expiry = 1800  # 30 minutes
jwt_refresh_token_expiry = 259200  # 3 days

[edge_runtime]
enabled = true
policy = "per_worker"
inspector_port = 8083
```

---

## 10. TypeScript Types

### 10.1 Generated Database Types

```typescript
// types/supabase.ts
// Generated via: supabase gen types typescript --project-id <id> > types/supabase.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      customer_profiles: {
        Row: {
          id: string
          user_id: string
          shopify_customer_id: string | null
          first_name: string
          last_name: string
          phone: string | null
          date_of_birth: string | null
          gender: 'male' | 'female' | 'other' | 'prefer_not_to_say' | null
          child_count: number
          children: Json
          email_opt_in: boolean
          sms_opt_in: boolean
          marketing_consent_date: string | null
          loyalty_points: number
          loyalty_tier: 'bronze' | 'silver' | 'gold' | 'platinum'
          tier_entry_date: string | null
          is_minor: boolean
          parental_consent_required: boolean
          parental_consent_obtained: boolean
          consent_record_id: string | null
          coppa_restricted: boolean
          account_status: 'active' | 'suspended' | 'deactivated'
          email_verified: boolean
          phone_verified: boolean
          created_at: string
          updated_at: string
          last_login_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          shopify_customer_id?: string | null
          first_name: string
          last_name: string
          phone?: string | null
          date_of_birth?: string | null
          gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say' | null
          child_count?: number
          children?: Json
          email_opt_in?: boolean
          sms_opt_in?: boolean
          marketing_consent_date?: string | null
          loyalty_points?: number
          loyalty_tier?: 'bronze' | 'silver' | 'gold' | 'platinum'
          tier_entry_date?: string | null
          is_minor?: boolean
          parental_consent_required?: boolean
          parental_consent_obtained?: boolean
          consent_record_id?: string | null
          coppa_restricted?: boolean
          account_status?: 'active' | 'suspended' | 'deactivated'
          email_verified?: boolean
          phone_verified?: boolean
          created_at?: string
          updated_at?: string
          last_login_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          shopify_customer_id?: string | null
          first_name?: string
          last_name?: string
          phone?: string | null
          date_of_birth?: string | null
          gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say' | null
          child_count?: number
          children?: Json
          email_opt_in?: boolean
          sms_opt_in?: boolean
          marketing_consent_date?: string | null
          loyalty_points?: number
          loyalty_tier?: 'bronze' | 'silver' | 'gold' | 'platinum'
          tier_entry_date?: string | null
          is_minor?: boolean
          parental_consent_required?: boolean
          parental_consent_obtained?: boolean
          consent_record_id?: string | null
          coppa_restricted?: boolean
          account_status?: 'active' | 'suspended' | 'deactivated'
          email_verified?: boolean
          phone_verified?: boolean
          created_at?: string
          updated_at?: string
          last_login_at?: string | null
        }
      }
      ai_conversations: {
        Row: {
          id: string
          session_id: string
          user_id: string | null
          message_role: 'user' | 'assistant' | 'system'
          message_content: string
          message_metadata: Json
          model_version: string | null
          response_tokens: number | null
          prompt_tokens: number | null
          latency_ms: number | null
          conversation_context: Json
          parent_message_id: string | null
          is_minor_user: boolean
          pii_detected: boolean
          pii_redacted_content: string | null
          retention_until: string
          purged_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          user_id?: string | null
          message_role: 'user' | 'assistant' | 'system'
          message_content: string
          message_metadata?: Json
          model_version?: string | null
          response_tokens?: number | null
          prompt_tokens?: number | null
          latency_ms?: number | null
          conversation_context?: Json
          parent_message_id?: string | null
          is_minor_user?: boolean
          pii_detected?: boolean
          pii_redacted_content?: string | null
          retention_until?: string
          purged_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          user_id?: string | null
          message_role?: 'user' | 'assistant' | 'system'
          message_content?: string
          message_metadata?: Json
          model_version?: string | null
          response_tokens?: number | null
          prompt_tokens?: number | null
          latency_ms?: number | null
          conversation_context?: Json
          parent_message_id?: string | null
          is_minor_user?: boolean
          pii_detected?: boolean
          pii_redacted_content?: string | null
          retention_until?: string
          purged_at?: string | null
          created_at?: string
        }
      }
      product_embeddings: {
        Row: {
          id: string
          product_id: string
          shopify_product_id: string | null
          sku: string | null
          embedding: string | null  // Vector type
          embedding_model: string
          product_name: string
          product_description: string | null
          product_category: string | null
          product_tags: string[] | null
          attributes: Json
          search_keywords: unknown | null  // tsvector
          popularity_score: number
          last_synced_at: string
          sync_version: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          product_id: string
          shopify_product_id?: string | null
          sku?: string | null
          embedding?: string | null
          embedding_model?: string
          product_name: string
          product_description?: string | null
          product_category?: string | null
          product_tags?: string[] | null
          attributes?: Json
          search_keywords?: unknown | null
          popularity_score?: number
          last_synced_at?: string
          sync_version?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          shopify_product_id?: string | null
          sku?: string | null
          embedding?: string | null
          embedding_model?: string
          product_name?: string
          product_description?: string | null
          product_category?: string | null
          product_tags?: string[] | null
          attributes?: Json
          search_keywords?: unknown | null
          popularity_score?: number
          last_synced_at?: string
          sync_version?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      // ... additional tables follow same pattern
    }
    Functions: {
      search_products: {
        Args: {
          query_embedding: string
          match_threshold: number
          match_count: number
          category_filter?: string
        }
        Returns: {
          id: string
          product_id: string
          product_name: string
          product_description: string
          product_category: string
          similarity: number
        }[]
      }
      hybrid_product_search: {
        Args: {
          query_embedding: string
          search_query: string
          match_threshold: number
          match_count: number
        }
        Returns: {
          id: string
          product_id: string
          product_name: string
          similarity: number
          text_rank: number
          combined_score: number
        }[]
      }
      get_similar_products: {
        Args: {
          product_id_param: string
          match_count: number
        }
        Returns: {
          id: string
          product_id: string
          product_name: string
          similarity: number
        }[]
      }
      calculate_loyalty_points: {
        Args: {
          order_total: number
          user_tier: string
        }
        Returns: number
      }
      is_admin: {
        Args: {}
        Returns: boolean
      }
      is_staff: {
        Args: {}
        Returns: boolean
      }
    }
  }
}

// Helper types for client usage
export type Tables<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Row']

export type Enums<T extends keyof Database['public']['Enums']> = 
  Database['public']['Enums'][T]

// Specific entity types
export type CustomerProfile = Tables<'customer_profiles'>
export type AIConversation = Tables<'ai_conversations'>
export type ProductEmbedding = Tables<'product_embeddings'>
export type Wishlist = Tables<'wishlists'>
export type WishlistItem = Tables<'wishlist_items'>
export type LoyaltyTransaction = Tables<'loyalty_transactions'>
export type UGCSubmission = Tables<'ugc_submissions'>
export type ContentQueue = Tables<'content_queue'>
export type CompetitiveIntelligence = Tables<'competitive_intelligence'>
export type AgentMetrics = Tables<'agent_metrics'>
export type ParentalConsentRecord = Tables<'parental_consent_records'>
export type DataRetentionLog = Tables<'data_retention_log'>
```

### 10.2 Application Types

```typescript
// types/app.ts

import { Database } from './supabase'

// API Response types
export interface APIResponse<T> {
  data: T | null
  error: APIError | null
}

export interface APIError {
  message: string
  code: string
  statusCode: number
}

// Pagination
export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    perPage: number
    total: number
    totalPages: number
  }
}

// Auth types
export interface AuthCredentials {
  email: string
  password: string
}

export interface SignUpData extends AuthCredentials {
  firstName: string
  lastName: string
  isMinor?: boolean
  parentEmail?: string
}

export interface UserSession {
  user: {
    id: string
    email: string
    role: 'customer' | 'staff' | 'admin'
  }
  accessToken: string
  refreshToken: string
  expiresAt: number
}

// Search types
export interface ProductSearchResult {
  id: string
  productId: string
  name: string
  description: string
  category: string
  similarity: number
  imageUrl?: string
  price?: number
}

export interface SearchFilters {
  category?: string
  priceMin?: number
  priceMax?: number
  size?: string
  color?: string
  ageRange?: string
}

// AI types
export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  recommendations?: ProductRecommendation[]
}

export interface ProductRecommendation {
  productId: string
  name: string
  confidence: number
  reason?: string
}

// Loyalty types
export interface LoyaltySummary {
  points: number
  tier: 'bronze' | 'silver' | 'gold' | 'platinum'
  tierProgress: number
  nextTierPoints: number
  lifetimePoints: number
}

export interface LoyaltyTransactionItem {
  id: string
  type: Database['public']['Tables']['loyalty_transactions']['Row']['transaction_type']
  points: number
  balance: number
  description: string
  date: string
}

// Wishlist types
export interface WishlistWithItems extends Database['public']['Tables']['wishlists']['Row'] {
  items: Database['public']['Tables']['wishlist_items']['Row'][]
}

// UGC types
export interface UGCUploadData {
  title: string
  description: string
  files: File[]
  productIds: string[]
  consentGranted: boolean
  usageRightsGranted: boolean
  creditPreference: 'full_name' | 'first_name_only' | 'anonymous'
}

// Consent types
export interface ConsentVerificationData {
  parentName: string
  parentEmail: string
  parentPhone: string
  relationship: 'mother' | 'father' | 'guardian' | 'other'
  method: 'credit_card' | 'digital_signature' | 'video_call'
  documents?: File[]
}
```

---

## 11. Migration Strategy

### 11.1 Migration File Naming

```
supabase/migrations/
├── 00000000000000_initial_schema.sql
├── 20240409120000_add_coppa_tables.sql
├── 20240409123000_add_vector_support.sql
├── 20240409130000_add_loyalty_triggers.sql
├── 20240409133000_add_rls_policies.sql
├── 20240409140000_seed_initial_data.sql
└── 20240409143000_add_performance_indexes.sql
```

### 11.2 Initial Migration Template

```sql
-- ============================================
-- Migration: 00000000000000_initial_schema.sql
-- ============================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create helper functions first
\i ./functions/timestamps.sql
\i ./functions/auth_helpers.sql

-- Create tables in dependency order
\i ./tables/customer_profiles.sql
\i ./tables/parental_consent_records.sql
\i ./tables/ai_conversations.sql
\i ./tables/product_embeddings.sql
\i ./tables/wishlists.sql
\i ./tables/loyalty_transactions.sql
\i ./tables/ugc_submissions.sql
\i ./tables/content_queue.sql
\i ./tables/competitive_intelligence.sql
\i ./tables/agent_metrics.sql
\i ./tables/data_retention_log.sql

-- Create triggers
\i ./triggers/auto_timestamps.sql
\i ./triggers/loyalty_processing.sql
\i ./triggers/consent_checks.sql
\i ./triggers/wishlist_counts.sql

-- Enable RLS and create policies (last)
\i ./policies/enable_rls.sql
\i ./policies/customer_profiles.sql
\i ./policies/ai_conversations.sql
-- ... etc
```

### 11.3 Deployment Script

```bash
#!/bin/bash
# scripts/deploy-migrations.sh

set -e

ENVIRONMENT=${1:-staging}
PROJECT_REF=$([ "$ENVIRONMENT" = "production" ] && echo "parkerjoe-prod" || echo "parkerjoe-staging")

echo "Deploying migrations to $ENVIRONMENT ($PROJECT_REF)..."

# Login (assumes CI/CD has token)
supabase login --token "$SUPABASE_ACCESS_TOKEN"

# Link project
supabase link --project-ref "$PROJECT_REF"

# Push migrations
supabase db push

# Deploy edge functions
echo "Deploying edge functions..."
supabase functions deploy orchestrator --project-ref "$PROJECT_REF"
supabase functions deploy agent-handler --project-ref "$PROJECT_REF"
supabase functions deploy webhook-handler --project-ref "$PROJECT_REF"
supabase functions deploy coppa-cleanup --project-ref "$PROJECT_REF"

# Set secrets
echo "Setting secrets..."
supabase secrets set --project-ref "$PROJECT_REF" \
  OPENAI_API_KEY="$OPENAI_API_KEY" \
  SHOPIFY_ACCESS_TOKEN="$SHOPIFY_ACCESS_TOKEN" \
  CRON_SECRET="$CRON_SECRET"

echo "Deployment complete!"
```

### 11.4 Rollback Strategy

```sql
-- ============================================
-- Rollback Script Template
-- ============================================

-- Always create rollback scripts for risky migrations
-- File: migrations/20240409120000_add_coppa_tables_rollback.sql

-- Reverse order of creation
DROP TABLE IF EXISTS data_retention_log;
DROP TABLE IF EXISTS parental_consent_records;

-- Remove triggers
DROP TRIGGER IF EXISTS check_consent_expiration_trigger ON parental_consent_records;

-- Remove functions
DROP FUNCTION IF EXISTS check_consent_expiration();
```

### 11.5 Seeding Data

```sql
-- ============================================
-- Seed Data
-- ============================================

-- Seed loyalty tiers
INSERT INTO loyalty_tier_benefits (tier, min_points, multiplier, benefits)
VALUES 
    ('bronze', 0, 1.0, '["birthday_discount", "free_shipping_over_50"]'),
    ('silver', 1000, 1.25, '["birthday_discount", "free_shipping", "early_access"]'),
    ('gold', 5000, 1.5, '["birthday_gift", "free_shipping", "early_access", "exclusive_sales"]'),
    ('platinum', 10000, 2.0, '["personal_stylist", "free_returns", "vip_support", "all_benefits"]')
ON CONFLICT (tier) DO NOTHING;

-- Seed test user (development only)
DO $$
BEGIN
    IF current_database() LIKE '%dev%' OR current_database() LIKE '%staging%' THEN
        -- Create test customer
        INSERT INTO customer_profiles (
            user_id, first_name, last_name, email_opt_in, loyalty_points, loyalty_tier
        ) VALUES (
            '00000000-0000-0000-0000-000000000000',
            'Test',
            'User',
            true,
            2500,
            'silver'
        )
        ON CONFLICT (user_id) DO NOTHING;
    END IF;
END $$;
```

---

## Appendix A: Quick Reference

### A.1 Common Queries

```sql
-- Get customer with loyalty info
SELECT * FROM customer_profiles WHERE user_id = '...';

-- Search products
SELECT * FROM search_products(
    '[0.1, 0.2, ...]'::vector, 
    0.7, 
    10
);

-- Get wishlist with items
SELECT w.*, wi.* 
FROM wishlists w
LEFT JOIN wishlist_items wi ON w.id = wi.wishlist_id
WHERE w.user_id = '...';

-- Check consent status
SELECT * FROM parental_consent_records 
WHERE child_user_id = '...' 
AND verification_status = 'verified';
```

### A.2 Edge Function Invocation

```typescript
// Invoke from client
const { data, error } = await supabase.functions.invoke('agent-handler', {
  body: {
    type: 'chat_message',
    payload: { message: 'Looking for summer outfits' },
    sessionId: 'sess_123'
  }
})
```

### A.3 Storage Upload

```typescript
// Upload UGC
const { data, error } = await supabase.storage
  .from('ugc-images')
  .upload(`${userId}/${fileName}`, file)
```

---

## Appendix B: Security Checklist

- [ ] All tables have RLS enabled
- [ ] No `anon` write access to sensitive tables
- [ ] Service role key never exposed to client
- [ ] Webhook signatures verified
- [ ] File upload size limits configured
- [ ] COPPA data retention policies enforced
- [ ] JWT expiry appropriately short
- [ ] MFA enabled for admin accounts
- [ ] Database backups configured
- [ ] Audit logging enabled

---

**END OF DOCUMENT**
