# Technical PRD: Background AI Agents

## Overview

This document specifies the architecture, implementation details, and operational procedures for ParkerJoe's four background AI agents. These agents operate on scheduled triggers or event-based webhooks to automate competitive intelligence, content generation, cart recovery, and social media management.

**Document Version:** 1.0  
**Last Updated:** 2026-04-09  
**Owner:** Engineering Team  
**Stakeholders:** Marketing, Operations, E-commerce

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Agent 1: Trend Scout](#2-agent-1-trend-scout)
3. [Agent 2: Content Engine](#3-agent-2-content-engine)
4. [Agent 3: Cart Whisperer](#4-agent-3-cart-whisperer)
5. [Agent 4: Social Commander](#5-agent-4-social-commander)
6. [Shared Infrastructure](#6-shared-infrastructure)
7. [Human Review Workflows](#7-human-review-workflows)
8. [Security & Compliance](#8-security--compliance)
9. [Monitoring & Observability](#9-monitoring--observability)
10. [Appendix](#10-appendix)

---

## 1. Architecture Overview

### 1.1 System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           PARKERJOE AI AGENT SYSTEM                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │ Trend Scout  │  │   Content    │  │   Cart       │  │    Social    │    │
│  │  (Daily 6AM  │  │   Engine     │  │  Whisperer   │  │  Commander   │    │
│  │      CT)     │  │ (Webhook/    │  │  (Event-     │  │  (Scheduled) │    │
│  │              │  │  Scheduled)  │  │   Driven)    │  │              │    │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘    │
│         │                 │                 │                 │            │
│         └─────────────────┴─────────────────┴─────────────────┘            │
│                                   │                                        │
│                    ┌──────────────┴──────────────┐                         │
│                    │     SHARED INFRASTRUCTURE    │                         │
│                    ├─────────────────────────────┤                         │
│                    │  • Vercel Cron              │                         │
│                    │  • BullMQ Queue             │                         │
│                    │  • Redis                    │                         │
│                    │  • Upstash                  │                         │
│                    │  • Error Handling           │                         │
│                    └──────────────┬──────────────┘                         │
│                                   │                                        │
│                    ┌──────────────┴──────────────┐                         │
│                    │      AI MODEL LAYER         │                         │
│                    ├─────────────────────────────┤                         │
│                    │  • Claude Haiku (Fast)      │                         │
│                    │  • Claude Sonnet (Quality)  │                         │
│                    │  • Custom Embeddings        │                         │
│                    └─────────────────────────────┘                         │
│                                   │                                        │
│         ┌─────────────────────────┼─────────────────────────┐              │
│         │                         │                         │              │
│  ┌──────┴──────┐         ┌──────┴──────┐         ┌──────┴──────┐          │
│  │   HUMAN     │         │  EXTERNAL   │         │  INTERNAL   │          │
│  │   REVIEW    │         │  SERVICES   │         │   DATA      │          │
│  │   QUEUE     │         │             │         │             │          │
│  │  Dashboard  │         │  • Klaviyo  │         │  • Product  │          │
│  │  Approval   │         │  • Scrapers │         │    DB       │          │
│  │  Interface  │         │  • Copyscape│         │  • Cart DB  │          │
│  └─────────────┘         │  • Judge.me │         │  • User DB  │          │
│                          └─────────────┘         └─────────────┘          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Technology Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Scheduling** | Vercel Cron | Trigger scheduled tasks |
| **Queue** | BullMQ + Redis | Job queue management |
| **AI Models** | Claude Haiku/Sonnet | Content generation, analysis |
| **Database** | Upstash Redis | Queue storage, caching |
| **Monitoring** | Vercel Analytics | Performance tracking |
| **Email** | Klaviyo API | Cart recovery, notifications |
| **Scraping** | Playwright + Cheerio | Competitor monitoring |
| **CMS** | Custom Dashboard | Human review interface |

### 1.3 Data Flow

```
Trigger → Queue → Agent Execution → AI Processing → Output → Review → Publish
   │         │           │              │            │         │        │
   │         │           │              │            │         │        └─→ Live
   │         │           │              │            │         └────────→ Pending
   │         │           │              │            └──────────────────→ Storage
   │         │           │              └───────────────────────────────→ Analysis
   │         │           └──────────────────────────────────────────────→ Logic
   │         └──────────────────────────────────────────────────────────→ Job
   └────────────────────────────────────────────────────────────────────→ Event/Cron
```

---

## 2. Agent 1: Trend Scout

### 2.1 Purpose & Objectives

The Trend Scout agent monitors competitor activity, detects fashion trends, and identifies market opportunities for ParkerJoe. It provides actionable intelligence through daily monitoring and weekly comprehensive reports.

**Key Objectives:**
- Track competitor pricing changes in real-time
- Identify new product launches in western wear market
- Detect emerging style trends from social signals
- Highlight stock opportunities and gaps
- Generate weekly intelligence reports

### 2.2 Trigger Configuration

| Trigger Type | Schedule | Description |
|--------------|----------|-------------|
| **Primary** | Daily 6:00 AM CT | Full competitor scan |
| **Event-Based** | Product launch webhook | Immediate competitor analysis |
| **On-Demand** | Admin dashboard | Manual trigger for ad-hoc analysis |

**Vercel Cron Configuration:**
```json
{
  "crons": [
    {
      "path": "/api/agents/trend-scout/daily",
      "schedule": "0 11 * * *"
    }
  ]
}
```

### 2.3 Competitor Configuration

```typescript
// config/competitors.ts
export const MONITORED_COMPETITORS = [
  {
    id: 'boot_barn',
    name: 'Boot Barn',
    baseUrl: 'https://www.bootbarn.com',
    categories: ['western-boots', 'cowboy-hats', 'western-wear'],
    scrapingEnabled: true,
    priority: 'high'
  },
  {
    id: 'cavenders',
    name: 'Cavenders',
    baseUrl: 'https://www.cavenders.com',
    categories: ['boots', 'hats', 'apparel'],
    scrapingEnabled: true,
    priority: 'high'
  },
  {
    id: 'sheplers',
    name: 'Sheplers',
    baseUrl: 'https://www.sheplers.com',
    categories: ['western-wear', 'boots'],
    scrapingEnabled: true,
    priority: 'medium'
  },
  {
    id: 'rod_s_western',
    name: "Rod's Western",
    baseUrl: 'https://www.rods.com',
    categories: ['western-fashion'],
    scrapingEnabled: true,
    priority: 'medium'
  }
] as const;
```

### 2.4 Scraping Logic

```typescript
// agents/trend-scout/scrapers/competitor-scraper.ts
import { chromium } from 'playwright';
import * as cheerio from 'cheerio';

interface ScrapedProduct {
  id: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  category: string;
  imageUrl: string;
  url: string;
  inStock: boolean;
  scrapedAt: Date;
}

export class CompetitorScraper {
  private browser: Browser | null = null;

  async initialize() {
    this.browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
  }

  async scrapeCategory(
    competitorId: string, 
    category: string
  ): Promise<ScrapedProduct[]> {
    if (!this.browser) throw new Error('Browser not initialized');
    
    const competitor = MONITORED_COMPETITORS.find(c => c.id === competitorId);
    if (!competitor) throw new Error(`Unknown competitor: ${competitorId}`);

    const page = await this.browser.newPage();
    const products: ScrapedProduct[] = [];

    try {
      // Navigate with retry logic
      await this.navigateWithRetry(page, `${competitor.baseUrl}/${category}`);
      
      // Wait for product grid
      await page.waitForSelector('[data-testid="product-grid"], .product-list, .products', {
        timeout: 10000
      });

      // Extract product data
      const html = await page.content();
      const $ = cheerio.load(html);

      $('.product-card, .product-item, [data-product]').each((_, el) => {
        const $el = $(el);
        
        const product: ScrapedProduct = {
          id: $el.data('product-id') || $el.find('[data-sku]').data('sku'),
          name: $el.find('.product-name, .product-title').text().trim(),
          brand: $el.find('.brand-name').text().trim(),
          price: this.parsePrice($el.find('.price, .current-price').text()),
          originalPrice: this.parsePrice($el.find('.original-price').text()) || undefined,
          category,
          imageUrl: $el.find('img').attr('src') || '',
          url: $el.find('a').attr('href') || '',
          inStock: !$el.find('.out-of-stock').length,
          scrapedAt: new Date()
        };

        if (product.name && product.price) {
          products.push(product);
        }
      });

    } catch (error) {
      console.error(`Scraping error for ${competitorId}/${category}:`, error);
      throw error;
    } finally {
      await page.close();
    }

    return products;
  }

  private async navigateWithRetry(page: Page, url: string, retries = 3) {
    for (let i = 0; i < retries; i++) {
      try {
        await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
        return;
      } catch (error) {
        if (i === retries - 1) throw error;
        await new Promise(r => setTimeout(r, 1000 * (i + 1)));
      }
    }
  }

  private parsePrice(priceText: string): number {
    const match = priceText.match(/[\d,]+\.?\d*/);
    return match ? parseFloat(match[0].replace(',', '')) : 0;
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}
```

### 2.5 Price Comparison Algorithm

```typescript
// agents/trend-scout/analyzers/price-analyzer.ts

interface PriceComparison {
  ourProductId: string;
  ourPrice: number;
  competitorProductId: string;
  competitorPrice: number;
  priceDifference: number;
  priceDifferencePercent: number;
  recommendation: 'maintain' | 'increase' | 'decrease' | 'review';
  confidence: number;
}

interface PricingChange {
  productId: string;
  productName: string;
  competitor: string;
  oldPrice: number;
  newPrice: number;
  changePercent: number;
  changeType: 'increase' | 'decrease' | 'new';
  detectedAt: Date;
}

export class PriceAnalyzer {
  
  async analyzePriceChanges(
    currentScrape: ScrapedProduct[],
    previousScrape: ScrapedProduct[]
  ): Promise<PricingChange[]> {
    const changes: PricingChange[] = [];
    const previousMap = new Map(previousScrape.map(p => [p.id, p]));

    for (const current of currentScrape) {
      const previous = previousMap.get(current.id);
      
      if (!previous) {
        // New product
        changes.push({
          productId: current.id,
          productName: current.name,
          competitor: current.competitorId,
          oldPrice: 0,
          newPrice: current.price,
          changePercent: 100,
          changeType: 'new',
          detectedAt: new Date()
        });
      } else if (previous.price !== current.price) {
        // Price change
        const changePercent = ((current.price - previous.price) / previous.price) * 100;
        changes.push({
          productId: current.id,
          productName: current.name,
          competitor: current.competitorId,
          oldPrice: previous.price,
          newPrice: current.price,
          changePercent: Math.abs(changePercent),
          changeType: current.price > previous.price ? 'increase' : 'decrease',
          detectedAt: new Date()
        });
      }
    }

    return changes.sort((a, b) => b.changePercent - a.changePercent);
  }

  async compareWithOurProducts(
    competitorProducts: ScrapedProduct[],
    ourProducts: OurProduct[]
  ): Promise<PriceComparison[]> {
    const comparisons: PriceComparison[] = [];

    for (const theirProduct of competitorProducts) {
      // Find matching product using fuzzy matching
      const ourMatch = await this.findMatchingProduct(theirProduct, ourProducts);
      
      if (ourMatch) {
        const diff = theirProduct.price - ourMatch.price;
        const diffPercent = (diff / ourMatch.price) * 100;

        comparisons.push({
          ourProductId: ourMatch.id,
          ourPrice: ourMatch.price,
          competitorProductId: theirProduct.id,
          competitorPrice: theirProduct.price,
          priceDifference: diff,
          priceDifferencePercent: diffPercent,
          recommendation: this.getPriceRecommendation(diffPercent),
          confidence: ourMatch.matchConfidence
        });
      }
    }

    return comparisons;
  }

  private async findMatchingProduct(
    competitorProduct: ScrapedProduct,
    ourProducts: OurProduct[]
  ): Promise<OurProduct | null> {
    // Use embedding similarity for product matching
    const competitorEmbedding = await this.getEmbedding(
      `${competitorProduct.name} ${competitorProduct.brand} ${competitorProduct.category}`
    );

    let bestMatch: OurProduct | null = null;
    let bestScore = 0;

    for (const ourProduct of ourProducts) {
      const ourEmbedding = await this.getEmbedding(
        `${ourProduct.name} ${ourProduct.brand} ${ourProduct.category}`
      );

      const similarity = this.cosineSimilarity(competitorEmbedding, ourEmbedding);
      
      if (similarity > 0.85 && similarity > bestScore) {
        bestScore = similarity;
        bestMatch = { ...ourProduct, matchConfidence: similarity };
      }
    }

    return bestMatch;
  }

  private getPriceRecommendation(diffPercent: number): PriceComparison['recommendation'] {
    if (diffPercent < -15) return 'review';     // Competitor much cheaper
    if (diffPercent < -5) return 'decrease';    // Competitor cheaper
    if (diffPercent > 15) return 'increase';    // We're much cheaper
    return 'maintain';
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return dotProduct / (magnitudeA * magnitudeB);
  }
}
```

### 2.6 Trend Detection Algorithm

```typescript
// agents/trend-scout/analyzers/trend-detector.ts

interface TrendSignal {
  source: 'social' | 'search' | 'competitor' | 'sales';
  keyword: string;
  category: string;
  velocity: number; // mentions/hour growth
  volume: number;   // total mentions
  sentiment: number; // -1 to 1
  timestamp: Date;
}

interface TrendAlert {
  id: string;
  trendName: string;
  category: string;
  confidence: number;
  signals: TrendSignal[];
  relatedProducts: string[];
  predictedPeak: Date;
  recommendation: string;
  detectedAt: Date;
}

export class TrendDetector {
  
  async detectTrends(signals: TrendSignal[]): Promise<TrendAlert[]> {
    // Group signals by category and keyword
    const groupedSignals = this.groupSignals(signals);
    const trends: TrendAlert[] = [];

    for (const [key, groupSignals] of groupedSignals) {
      const trend = await this.analyzeTrendGroup(key, groupSignals);
      if (trend.confidence > 0.7) {
        trends.push(trend);
      }
    }

    return trends.sort((a, b) => b.confidence - a.confidence);
  }

  private groupSignals(signals: TrendSignal[]): Map<string, TrendSignal[]> {
    const groups = new Map<string, TrendSignal[]>();

    for (const signal of signals) {
      const key = `${signal.category}:${signal.keyword.toLowerCase()}`;
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(signal);
    }

    return groups;
  }

  private async analyzeTrendGroup(
    key: string,
    signals: TrendSignal[]
  ): Promise<TrendAlert> {
    const [category, keyword] = key.split(':');
    
    // Calculate trend metrics
    const totalVolume = signals.reduce((sum, s) => sum + s.volume, 0);
    const avgVelocity = signals.reduce((sum, s) => sum + s.velocity, 0) / signals.length;
    const avgSentiment = signals.reduce((sum, s) => sum + s.sentiment, 0) / signals.length;
    
    // Detect velocity acceleration (trend strength)
    const sortedSignals = signals.sort((a, b) => 
      a.timestamp.getTime() - b.timestamp.getTime()
    );
    
    const firstHalf = sortedSignals.slice(0, Math.floor(sortedSignals.length / 2));
    const secondHalf = sortedSignals.slice(Math.floor(sortedSignals.length / 2));
    
    const firstHalfVelocity = firstHalf.reduce((sum, s) => sum + s.velocity, 0) / firstHalf.length;
    const secondHalfVelocity = secondHalf.reduce((sum, s) => sum + s.velocity, 0) / secondHalf.length;
    
    const acceleration = secondHalfVelocity / (firstHalfVelocity || 1);

    // Calculate confidence based on multiple factors
    const confidence = this.calculateConfidence({
      volume: totalVolume,
      velocity: avgVelocity,
      sentiment: avgSentiment,
      acceleration,
      signalDiversity: new Set(signals.map(s => s.source)).size
    });

    // Predict peak using simple linear projection
    const predictedPeak = this.predictPeak(signals, acceleration);

    // Find related products using AI
    const relatedProducts = await this.findRelatedProducts(keyword, category);

    // Generate recommendation using Claude
    const recommendation = await this.generateTrendRecommendation({
      keyword,
      category,
      confidence,
      sentiment: avgSentiment,
      relatedProducts
    });

    return {
      id: `trend-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      trendName: this.formatTrendName(keyword),
      category,
      confidence,
      signals,
      relatedProducts,
      predictedPeak,
      recommendation,
      detectedAt: new Date()
    };
  }

  private calculateConfidence(metrics: {
    volume: number;
    velocity: number;
    sentiment: number;
    acceleration: number;
    signalDiversity: number;
  }): number {
    // Weighted scoring
    const volumeScore = Math.min(metrics.volume / 1000, 1) * 0.25;
    const velocityScore = Math.min(metrics.velocity / 100, 1) * 0.25;
    const sentimentScore = (metrics.sentiment + 1) / 2 * 0.15;
    const accelerationScore = Math.min(Math.max(metrics.acceleration - 1, 0), 2) / 2 * 0.25;
    const diversityScore = metrics.signalDiversity / 4 * 0.10;

    return Math.min(volumeScore + velocityScore + sentimentScore + accelerationScore + diversityScore, 1);
  }

  private async generateTrendRecommendation(context: {
    keyword: string;
    category: string;
    confidence: number;
    sentiment: number;
    relatedProducts: string[];
  }): Promise<string> {
    const prompt = `As a western fashion trend analyst, provide a brief action recommendation for:
    
Trend: "${context.keyword}" in ${context.category}
Confidence: ${(context.confidence * 100).toFixed(1)}%
Sentiment: ${context.sentiment > 0 ? 'Positive' : 'Negative'} (${context.sentiment.toFixed(2)})
Related Products: ${context.relatedProducts.join(', ')}

Provide a 2-3 sentence recommendation on whether to pursue this trend and how.`;

    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 150,
      messages: [{ role: 'user', content: prompt }]
    });

    return response.content[0].text;
  }
}
```

### 2.7 Output Types

```typescript
// agents/trend-scout/types.ts

export interface PricingChange {
  productId: string;
  productName: string;
  competitor: string;
  oldPrice: number;
  newPrice: number;
  changePercent: number;
  changeType: 'increase' | 'decrease' | 'new';
  detectedAt: Date;
  ourComparableProduct?: {
    id: string;
    name: string;
    ourPrice: number;
    priceGap: number;
  };
}

export interface CompetitorProduct {
  id: string;
  name: string;
  brand: string;
  competitor: string;
  category: string;
  price: number;
  originalPrice?: number;
  url: string;
  imageUrl: string;
  inStock: boolean;
  scrapedAt: Date;
  isNew: boolean;
}

export interface TrendAlert {
  id: string;
  trendName: string;
  category: string;
  confidence: number; // 0-1
  signals: TrendSignal[];
  relatedProducts: string[];
  predictedPeak: Date;
  recommendation: string;
  detectedAt: Date;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

export interface StockOpportunity {
  id: string;
  type: 'gap' | 'underpriced' | 'oversold' | 'seasonal';
  description: string;
  category: string;
  estimatedDemand: 'low' | 'medium' | 'high' | 'very-high';
  competitorEvidence: string[];
  suggestedAction: string;
  potentialRevenue: number;
  confidence: number;
}

export interface TrendReport {
  reportId: string;
  generatedAt: Date;
  period: { start: Date; end: Date };
  pricingUpdates: PricingChange[];
  newProducts: CompetitorProduct[];
  trendingStyles: TrendAlert[];
  opportunities: StockOpportunity[];
  summary: {
    totalPriceChanges: number;
    significantPriceDrops: number;
    newCompetitorProducts: number;
    highConfidenceTrends: number;
    actionableOpportunities: number;
  };
}
```

### 2.8 Weekly Report Generation

```typescript
// agents/trend-scout/reports/weekly-report.ts

export async function generateWeeklyReport(): Promise<TrendReport> {
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const now = new Date();

  // Aggregate data from the past week
  const [
    pricingUpdates,
    newProducts,
    trendingStyles,
    opportunities
  ] = await Promise.all([
    getPricingChanges(weekAgo, now),
    getNewCompetitorProducts(weekAgo, now),
    getDetectedTrends(weekAgo, now),
    generateStockOpportunities()
  ]);

  const report: TrendReport = {
    reportId: `trend-report-${now.toISOString().split('T')[0]}`,
    generatedAt: now,
    period: { start: weekAgo, end: now },
    pricingUpdates,
    newProducts,
    trendingStyles,
    opportunities,
    summary: {
      totalPriceChanges: pricingUpdates.length,
      significantPriceDrops: pricingUpdates.filter(p => 
        p.changeType === 'decrease' && p.changePercent > 10
      ).length,
      newCompetitorProducts: newProducts.length,
      highConfidenceTrends: trendingStyles.filter(t => t.confidence > 0.8).length,
      actionableOpportunities: opportunities.filter(o => o.confidence > 0.7).length
    }
  };

  // Store report
  await storeReport(report);

  // Send alert for high-priority items
  await sendPriorityAlerts(report);

  return report;
}

async function sendPriorityAlerts(report: TrendReport): Promise<void> {
  const highPriorityItems = [
    ...report.pricingUpdates.filter(p => p.changeType === 'decrease' && p.changePercent > 20),
    ...report.trendingStyles.filter(t => t.priority === 'urgent'),
    ...report.opportunities.filter(o => o.confidence > 0.9)
  ];

  if (highPriorityItems.length > 0) {
    await sendEmail({
      to: ['merchandising@parkerjoe.com', 'marketing@parkerjoe.com'],
      subject: `🚨 Trend Scout Alert: ${highPriorityItems.length} High-Priority Items Detected`,
      template: 'trend-alert',
      data: { items: highPriorityItems, report }
    });
  }
}
```

### 2.9 API Endpoints

```typescript
// app/api/agents/trend-scout/daily/route.ts
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const jobId = await queueTrendScoutJob('daily-scan');
    
    return NextResponse.json({
      success: true,
      jobId,
      message: 'Daily trend scan queued'
    });
  } catch (error) {
    console.error('Trend Scout Error:', error);
    return NextResponse.json(
      { error: 'Failed to queue trend scan' },
      { status: 500 }
    );
  }
}

// app/api/agents/trend-scout/reports/[id]/route.ts
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const report = await getReportById(params.id);
  
  if (!report) {
    return NextResponse.json({ error: 'Report not found' }, { status: 404 });
  }

  return NextResponse.json(report);
}
```

---

## 3. Agent 2: Content Engine

### 3.1 Purpose & Objectives

The Content Engine generates SEO-optimized content across multiple formats with human review integration. It ensures consistent brand voice while scaling content production.

**Content Types:**
- Product descriptions (150-300 words)
- Instagram captions
- Pinterest descriptions
- Blog articles (500-1500 words)
- Email subject lines

### 3.2 Trigger Configuration

| Trigger Type | Event | Priority |
|--------------|-------|----------|
| **New Product** | Webhook from product management system | High |
| **Scheduled** | Daily content batch generation | Medium |
| **Bulk Upload** | CSV import for seasonal campaigns | High |
| **Manual** | Admin dashboard trigger | On-demand |

**Webhook Configuration:**
```typescript
// app/api/webhooks/products/new/route.ts
export async function POST(request: Request) {
  const payload = await request.json();
  
  // Verify webhook signature
  const signature = request.headers.get('x-webhook-signature');
  if (!verifyWebhookSignature(payload, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const product: Product = payload;

  // Queue content generation jobs
  await Promise.all([
    queueContentJob({
      type: 'product-description',
      productId: product.id,
      priority: 'high'
    }),
    queueContentJob({
      type: 'instagram-caption',
      productId: product.id,
      priority: 'medium'
    }),
    queueContentJob({
      type: 'pinterest-description',
      productId: product.id,
      priority: 'medium'
    })
  ]);

  return NextResponse.json({ queued: true });
}
```

### 3.3 Content Queue Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│                    CONTENT QUEUE WORKFLOW                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
│  │   TRIGGER   │───→│   QUEUE     │───→│  GENERATE   │         │
│  │  (Webhook/  │    │   (BullMQ)  │    │  (Claude)   │         │
│  │  Scheduled) │    │             │    │             │         │
│  └─────────────┘    └─────────────┘    └──────┬──────┘         │
│                                                │                │
│                                                ↓                │
│                                       ┌─────────────┐          │
│                                       │   QUALITY   │          │
│                                       │    CHECK    │          │
│                                       │             │          │
│                                       │ • Copyscape │          │
│                                       │ • Brand Voice│          │
│                                       │ • Readability│          │
│                                       └──────┬──────┘          │
│                                              │                  │
│                         ┌────────────────────┼────────────────┐│
│                         │                    │                ││
│                         ↓                    ↓                ││
│                  ┌─────────────┐      ┌─────────────┐         ││
│                  │   FAILED    │      │    PASSED   │         ││
│                  │             │      │             │         ││
│                  │ • Flag for  │      │ • Queue for │         ││
│                  │   review    │      │   review    │         ││
│                  └─────────────┘      └──────┬──────┘         ││
│                                              │                ││
│                                              ↓                ││
│                                       ┌─────────────┐         ││
│                                       │   HUMAN     │         ││
│                                       │   REVIEW    │         ││
│                                       │   QUEUE     │         ││
│                                       └──────┬──────┘         ││
│                                              │                ││
│                    ┌─────────────────────────┼─────────────────┤│
│                    │                         │                 ││
│                    ↓                         ↓                 ││
│             ┌─────────────┐           ┌─────────────┐          ││
│             │  APPROVED   │           │  REJECTED   │          ││
│             │             │           │             │          ││
│             │ • Schedule  │           │ • Request   │          ││
│             │   publish   │           │   revision  │          ││
│             │ • Store     │           │ • Log       │          ││
│             └─────────────┘           └─────────────┘          ││
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 3.4 Content Generation Logic

```typescript
// agents/content-engine/generators/product-description.ts

interface ProductDescriptionRequest {
  productId: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  attributes: {
    material?: string;
    color?: string;
    style?: string;
    occasion?: string;
    fit?: string;
  };
  targetKeywords: string[];
  tone: 'classic' | 'trendy' | 'luxury' | 'rugged';
}

interface GeneratedContent {
  id: string;
  type: 'product-description';
  content: string;
  metadata: {
    wordCount: number;
    keywordDensity: Record<string, number>;
    readabilityScore: number;
    brandVoiceScore: number;
  };
  status: 'pending_review' | 'approved' | 'rejected';
  generatedAt: Date;
}

export async function generateProductDescription(
  request: ProductDescriptionRequest
): Promise<GeneratedContent> {
  
  const prompt = `Generate a compelling, SEO-optimized product description for ParkerJoe western wear.

PRODUCT INFORMATION:
Name: ${request.name}
Brand: ${request.brand}
Category: ${request.category}
Price: $${request.price}
Attributes: ${JSON.stringify(request.attributes)}

REQUIREMENTS:
- Length: 150-300 words
- Tone: ${request.tone}
- Target keywords: ${request.targetKeywords.join(', ')}
- Include: Material details, styling suggestions, occasion recommendations
- Brand voice: Authentic western heritage, quality craftsmanship, approachable expertise
- SEO: Natural keyword integration, compelling meta description
- Structure: Hook paragraph, features/benefits, styling tips, call-to-action

OUTPUT FORMAT:
Return JSON with:
{
  "description": "The full description text",
  "metaDescription": "155-character meta description",
  "keyFeatures": ["Feature 1", "Feature 2", "Feature 3"],
  "stylingSuggestions": ["Suggestion 1", "Suggestion 2"]
}`;

  const response = await anthropic.messages.create({
    model: 'claude-3-sonnet-20240229',
    max_tokens: 2000,
    temperature: 0.7,
    messages: [{ role: 'user', content: prompt }]
  });

  const parsed = JSON.parse(response.content[0].text);
  
  // Quality checks
  const qualityCheck = await runQualityChecks(parsed.description, {
    minWords: 150,
    maxWords: 300,
    targetKeywords: request.targetKeywords,
    checkPlagiarism: true
  });

  if (!qualityCheck.passed) {
    return {
      id: generateId(),
      type: 'product-description',
      content: parsed.description,
      metadata: {
        wordCount: parsed.description.split(' ').length,
        keywordDensity: qualityCheck.keywordDensity,
        readabilityScore: qualityCheck.readabilityScore,
        brandVoiceScore: 0 // Will be calculated on review
      },
      status: 'pending_review',
      generatedAt: new Date(),
      qualityIssues: qualityCheck.issues
    };
  }

  return {
    id: generateId(),
    type: 'product-description',
    content: parsed.description,
    metadata: {
      wordCount: parsed.description.split(' ').length,
      keywordDensity: qualityCheck.keywordDensity,
      readabilityScore: qualityCheck.readabilityScore,
      brandVoiceScore: qualityCheck.brandVoiceScore
    },
    status: 'pending_review',
    generatedAt: new Date()
  };
}
```

### 3.5 Social Media Content Generation

```typescript
// agents/content-engine/generators/social-content.ts

interface SocialContentRequest {
  productId?: string;
  contentType: 'instagram-caption' | 'pinterest-description' | 'facebook-post';
  context: {
    productName?: string;
    productImage?: string;
    campaign?: string;
    theme?: string;
    season?: string;
  };
  tone: 'inspiring' | 'educational' | 'promotional' | 'community';
}

interface SocialContent {
  id: string;
  platform: string;
  content: string;
  hashtags: string[];
  mentions: string[];
  callToAction: string;
  suggestedImageCaption?: string;
  bestPostTime?: string;
}

export async function generateSocialContent(
  request: SocialContentRequest
): Promise<SocialContent> {
  
  const platformConfig = {
    'instagram-caption': {
      maxLength: 2200,
      hashtagCount: '15-25',
      style: 'Conversational, emoji-friendly, storytelling'
    },
    'pinterest-description': {
      maxLength: 500,
      hashtagCount: '3-5',
      style: 'Search-optimized, keyword-rich, actionable'
    },
    'facebook-post': {
      maxLength: 500,
      hashtagCount: '1-3',
      style: 'Community-focused, shareable, engaging'
    }
  };

  const config = platformConfig[request.contentType];

  const prompt = `Generate ${request.contentType.replace('-', ' ')} for ParkerJoe western wear.

CONTEXT:
${JSON.stringify(request.context, null, 2)}

PLATFORM REQUIREMENTS:
- Max length: ${config.maxLength} characters
- Hashtags: ${config.hashtagCount}
- Style: ${config.style}
- Tone: ${request.tone}

BRAND GUIDELINES:
- Use authentic western language
- Include emojis naturally (max 5)
- Create engaging hooks
- End with clear call-to-action
- Hashtags should include: #ParkerJoe #WesternWear #[ProductCategory]

OUTPUT FORMAT (JSON):
{
  "content": "Main caption text",
  "hashtags": ["tag1", "tag2", ...],
  "mentions": ["@mention1"],
  "callToAction": "Shop now!",
  "altText": "Accessibility description"
}`;

  const response = await anthropic.messages.create({
    model: 'claude-3-haiku-20240307',
    max_tokens: 1500,
    temperature: 0.8,
    messages: [{ role: 'user', content: prompt }]
  });

  return JSON.parse(response.content[0].text);
}
```

### 3.6 Quality Checks

```typescript
// agents/content-engine/quality/checks.ts

interface QualityCheckRequest {
  content: string;
  minWords: number;
  maxWords: number;
  targetKeywords: string[];
  checkPlagiarism: boolean;
}

interface QualityCheckResult {
  passed: boolean;
  issues: string[];
  keywordDensity: Record<string, number>;
  readabilityScore: number;
  brandVoiceScore: number;
  plagiarismScore?: number;
}

export async function runQualityChecks(
  content: string,
  config: QualityCheckRequest
): Promise<QualityCheckResult> {
  const issues: string[] = [];

  // Word count check
  const wordCount = content.split(/\s+/).length;
  if (wordCount < config.minWords) {
    issues.push(`Too short: ${wordCount} words (min: ${config.minWords})`);
  }
  if (wordCount > config.maxWords) {
    issues.push(`Too long: ${wordCount} words (max: ${config.maxWords})`);
  }

  // Keyword density check
  const keywordDensity: Record<string, number> = {};
  const lowerContent = content.toLowerCase();
  
  for (const keyword of config.targetKeywords) {
    const regex = new RegExp(`\\b${keyword.toLowerCase()}\\b`, 'g');
    const matches = lowerContent.match(regex) || [];
    const density = (matches.length / wordCount) * 100;
    keywordDensity[keyword] = density;
    
    if (density < 0.5) {
      issues.push(`Low keyword density for "${keyword}": ${density.toFixed(2)}%`);
    }
    if (density > 3) {
      issues.push(`High keyword density for "${keyword}": ${density.toFixed(2)}%`);
    }
  }

  // Readability score (Flesch Reading Ease)
  const readabilityScore = calculateReadability(content);
  if (readabilityScore < 50) {
    issues.push(`Low readability score: ${readabilityScore.toFixed(1)}`);
  }

  // Brand voice check using embeddings
  const brandVoiceScore = await checkBrandVoice(content);
  if (brandVoiceScore < 0.7) {
    issues.push(`Brand voice mismatch: ${(brandVoiceScore * 100).toFixed(1)}%`);
  }

  // Plagiarism check (Copyscape API)
  let plagiarismScore: number | undefined;
  if (config.checkPlagiarism) {
    plagiarismScore = await checkCopyscape(content);
    if (plagiarismScore > 10) {
      issues.push(`High similarity detected: ${plagiarismScore.toFixed(1)}%`);
    }
  }

  return {
    passed: issues.length === 0,
    issues,
    keywordDensity,
    readabilityScore,
    brandVoiceScore,
    plagiarismScore
  };
}

async function checkCopyscape(content: string): Promise<number> {
  const response = await fetch('https://api.copyscape.com/api/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      u: process.env.COPYSCAPE_USERNAME!,
      k: process.env.COPYSCAPE_API_KEY!,
      o: 'csearch',
      e: 'UTF-8',
      t: content.substring(0, 5000) // Copyscape limit
    })
  });

  const result = await response.text();
  // Parse XML response and return similarity percentage
  const match = result.match(/<allpercentmatch>(\d+)<\/allpercentmatch>/);
  return match ? parseInt(match[1]) : 0;
}

async function checkBrandVoice(content: string): Promise<number> {
  // Compare content embedding against brand voice embeddings
  const contentEmbedding = await getEmbedding(content);
  const brandVoiceEmbedding = await getBrandVoiceEmbedding();
  
  return cosineSimilarity(contentEmbedding, brandVoiceEmbedding);
}
```

### 3.7 Content Output Types

```typescript
// agents/content-engine/types.ts

export type ContentType = 
  | 'product-description'
  | 'instagram-caption'
  | 'pinterest-description'
  | 'blog-article'
  | 'email-subject'
  | 'meta-description';

export interface ContentItem {
  id: string;
  type: ContentType;
  productId?: string;
  content: string;
  metadata: ContentMetadata;
  status: ContentStatus;
  qualityScore: number;
  generatedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  publishedAt?: Date;
  version: number;
}

export interface ContentMetadata {
  wordCount: number;
  characterCount: number;
  keywordDensity: Record<string, number>;
  readabilityScore: number;
  brandVoiceScore: number;
  plagiarismScore?: number;
  seoScore?: number;
}

export type ContentStatus = 
  | 'generating'
  | 'pending_review'
  | 'in_review'
  | 'approved'
  | 'rejected'
  | 'scheduled'
  | 'published'
  | 'archived';

export interface ContentQueue {
  id: string;
  items: ContentItem[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: Date;
  scheduledFor?: Date;
  tags: string[];
}
```

---

## 4. Agent 3: Cart Whisperer

### 4.1 Purpose & Objectives

The Cart Whisperer automates abandoned cart recovery through intelligent, personalized email and SMS sequences. It optimizes recovery rates through behavioral analysis and dynamic discounting.

**Key Objectives:**
- Recover 15-25% of abandoned carts
- Personalize messaging based on customer segment
- Optimize send times based on engagement data
- Prevent over-discounting through smart logic

### 4.2 Trigger Configuration

```typescript
// agents/cart-whisperer/triggers.ts

interface CartAbandonmentEvent {
  cartId: string;
  customerId: string;
  customerEmail: string;
  customerPhone?: string;
  items: CartItem[];
  cartValue: number;
  abandonedAt: Date;
  customerSegment: 'first-time' | 'repeat' | 'vip' | 'at-risk';
  acquisitionChannel: string;
}

export async function handleCartAbandonment(event: CartAbandonmentEvent) {
  // Schedule recovery sequence
  const sequence = generateRecoverySequence(event);
  
  for (const touchpoint of sequence) {
    await scheduleTouchpoint(event.cartId, touchpoint);
  }
}

function generateRecoverySequence(event: CartAbandonmentEvent): Touchpoint[] {
  const baseSequence: Touchpoint[] = [
    { delay: 60, channel: 'email', type: 'gentle_reminder' },
    { delay: 1440, channel: 'email', type: 'social_proof' },
    { delay: 2880, channel: 'email', type: 'incentive' },
    { delay: 4320, channel: 'sms', type: 'final_call' },
    { delay: 10080, channel: 'retargeting', type: 'dynamic_ads' }
  ];

  // Adjust based on customer segment
  if (event.customerSegment === 'vip') {
    // VIPs get faster, more personalized sequence
    baseSequence[0].delay = 30;
    baseSequence[2].type = 'vip_exclusive';
  }

  if (event.customerSegment === 'first-time') {
    // First-time buyers get stronger incentive earlier
    baseSequence[2].delay = 2160; // 36 hours
  }

  return baseSequence;
}
```

### 4.3 Recovery Sequence

| Touchpoint | Timing | Channel | Content Strategy | Discount Logic |
|------------|--------|---------|------------------|----------------|
| **1** | 1 hour | Email #1 | Gentle reminder + cart contents | None |
| **2** | 24 hours | Email #2 | Social proof + reviews | None |
| **3** | 48 hours | Email #3 | Smart discount | Segment-based (see below) |
| **4** | 72 hours | SMS | Short message + direct link | Same discount as Email #3 |
| **5** | 7 days | Retargeting | Dynamic product ads | Previous discount maintained |

### 4.4 Discount Logic

```typescript
// agents/cart-whisperer/discounts.ts

interface DiscountRule {
  segment: CustomerSegment;
  minCartValue: number;
  discountType: 'percentage' | 'fixed' | 'free_shipping';
  discountValue: number;
  maxUses?: number;
  expiryHours: number;
}

const DISCOUNT_RULES: DiscountRule[] = [
  {
    segment: 'first-time',
    minCartValue: 100,
    discountType: 'percentage',
    discountValue: 10,
    expiryHours: 48
  },
  {
    segment: 'first-time',
    minCartValue: 75,
    discountType: 'free_shipping',
    discountValue: 0,
    expiryHours: 48
  },
  {
    segment: 'repeat',
    minCartValue: 50,
    discountType: 'free_shipping',
    discountValue: 0,
    expiryHours: 72
  },
  {
    segment: 'vip',
    minCartValue: 0,
    discountType: 'percentage',
    discountValue: 15,
    expiryHours: 72
  },
  {
    segment: 'at-risk',
    minCartValue: 50,
    discountType: 'percentage',
    discountValue: 20,
    expiryHours: 24
  }
];

export function calculateDiscount(
  cartValue: number,
  segment: CustomerSegment,
  previousDiscounts: Discount[] = []
): Discount | null {
  // Check if customer has already received a discount recently
  const recentDiscount = previousDiscounts.find(
    d => new Date().getTime() - d.createdAt.getTime() < 7 * 24 * 60 * 60 * 1000
  );

  if (recentDiscount) {
    // Don't send another discount within 7 days
    return null;
  }

  // Find applicable rules
  const applicableRules = DISCOUNT_RULES.filter(
    rule => rule.segment === segment && cartValue >= rule.minCartValue
  );

  if (applicableRules.length === 0) return null;

  // Select best discount (highest value for customer)
  const bestRule = applicableRules.sort((a, b) => {
    const valueA = a.discountType === 'percentage' 
      ? cartValue * (a.discountValue / 100) 
      : a.discountType === 'fixed' 
        ? a.discountValue 
        : 10; // Estimated shipping value
    const valueB = b.discountType === 'percentage' 
      ? cartValue * (b.discountValue / 100) 
      : b.discountType === 'fixed' 
        ? b.discountValue 
        : 10;
    return valueB - valueA;
  })[0];

  return {
    code: generateDiscountCode(segment, cartValue),
    type: bestRule.discountType,
    value: bestRule.discountValue,
    expiry: new Date(Date.now() + bestRule.expiryHours * 60 * 60 * 1000),
    appliesTo: 'cart',
    minimumOrder: bestRule.minCartValue
  };
}

function generateDiscountCode(segment: CustomerSegment, cartValue: number): string {
  const prefix = segment.toUpperCase().substring(0, 3);
  const value = Math.floor(cartValue);
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `${prefix}${value}${random}`;
}
```

### 4.5 Klaviyo Integration

```typescript
// agents/cart-whisperer/integrations/klaviyo.ts

interface KlaviyoEmailPayload {
  to: string;
  templateId: string;
  context: {
    cart_items: Array<{
      name: string;
      image: string;
      price: number;
      quantity: number;
      url: string;
    }>;
    cart_total: number;
    cart_url: string;
    discount_code?: string;
    discount_value?: string;
    customer_first_name?: string;
    product_reviews?: Array<{
      rating: number;
      text: string;
      author: string;
    }>;
  };
}

export async function sendRecoveryEmail(
  payload: KlaviyoEmailPayload,
  emailType: 'gentle_reminder' | 'social_proof' | 'incentive' | 'vip_exclusive'
): Promise<void> {
  const templateMap = {
    'gentle_reminder': process.env.KLAVIYO_TEMPLATE_REMINDER,
    'social_proof': process.env.KLAVIYO_TEMPLATE_SOCIAL,
    'incentive': process.env.KLAVIYO_TEMPLATE_INCENTIVE,
    'vip_exclusive': process.env.KLAVIYO_TEMPLATE_VIP
  };

  const response = await fetch('https://a.klaviyo.com/api/track', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Klaviyo-API-Key ${process.env.KLAVIYO_PRIVATE_KEY}`
    },
    body: JSON.stringify({
      token: process.env.KLAVIYO_PUBLIC_KEY,
      event: 'Started Checkout',
      customer_properties: {
        $email: payload.to
      },
      properties: {
        $event_id: `${payload.to}-${Date.now()}`,
        $value: payload.context.cart_total,
        ...payload.context
      }
    })
  });

  if (!response.ok) {
    throw new Error(`Klaviyo API error: ${response.statusText}`);
  }

  // Trigger email flow
  await fetch('https://a.klaviyo.com/api/v1/email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Klaviyo-API-Key ${process.env.KLAVIYO_PRIVATE_KEY}`
    },
    body: JSON.stringify({
      template_id: templateMap[emailType],
      from_email: 'hello@parkerjoe.com',
      from_name: 'ParkerJoe',
      to: [{ email: payload.to }],
      context: payload.context
    })
  });
}

export async function sendRecoverySMS(
  phone: string,
  cartUrl: string,
  discountCode?: string
): Promise<void> {
  const message = discountCode 
    ? `Don't forget your western wear! Complete your order with code ${discountCode}: ${cartUrl}`
    : `Your cart is waiting! Complete your ParkerJoe order: ${cartUrl}`;

  await fetch('https://a.klaviyo.com/api/sms-send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Klaviyo-API-Key ${process.env.KLAVIYO_PRIVATE_KEY}`
    },
    body: JSON.stringify({
      phone,
      body: message,
      from: process.env.KLAVIYO_SMS_SENDER_ID
    })
  });
}
```

### 4.6 Email Content Generation

```typescript
// agents/cart-whisperer/content/generator.ts

interface EmailContentRequest {
  emailType: 'gentle_reminder' | 'social_proof' | 'incentive' | 'vip_exclusive';
  customer: {
    firstName?: string;
    segment: CustomerSegment;
    previousPurchases: number;
  };
  cart: {
    items: CartItem[];
    total: number;
    abandonedAt: Date;
  };
  discount?: Discount;
}

export async function generateEmailContent(
  request: EmailContentRequest
): Promise<EmailContent> {
  
  const prompts = {
    'gentle_reminder': `Write a gentle, friendly email reminder about an abandoned cart at ParkerJoe western wear store.
    
Customer: ${request.customer.firstName || 'Valued Customer'}
Cart Value: $${request.cart.total}
Items: ${request.cart.items.map(i => i.name).join(', ')}
Time Since Abandonment: ${Math.floor((Date.now() - request.cart.abandonedAt.getTime()) / 60000)} minutes

Tone: Helpful, not pushy. Mention the items they left behind. Include styling suggestions.`,

    'social_proof': `Write an email featuring social proof for abandoned cart recovery at ParkerJoe.

Customer: ${request.customer.firstName || 'Valued Customer'}
Products: ${request.cart.items.map(i => i.name).join(', ')}

Include: Recent 5-star reviews for these products, popularity indicators ("50+ people viewed this today"), and urgency without being aggressive.`,

    'incentive': `Write an incentive email offering a discount for completing an abandoned purchase.

Customer: ${request.customer.firstName || 'Valued Customer'}
Cart Value: $${request.cart.total}
Discount: ${request.discount?.type === 'percentage' ? `${request.discount.value}% off` : request.discount?.type === 'free_shipping' ? 'Free shipping' : `$${request.discount?.value} off`}
Code: ${request.discount?.code}
Expiry: ${request.discount?.expiry.toLocaleDateString()}

Tone: Grateful, exclusive feeling. Emphasize limited time.`,

    'vip_exclusive': `Write a VIP-exclusive email for abandoned cart recovery at ParkerJoe.

Customer: ${request.customer.firstName || 'VIP Member'}
Status: VIP Customer (${request.customer.previousPurchases} previous purchases)
Cart Value: $${request.cart.total}
Exclusive Offer: ${request.discount?.type === 'percentage' ? `${request.discount.value}% off` : 'Special offer'}

Tone: Exclusive, appreciative, premium. Make them feel valued.`
  };

  const response = await anthropic.messages.create({
    model: 'claude-3-haiku-20240307',
    max_tokens: 800,
    temperature: 0.7,
    messages: [{ 
      role: 'user', 
      content: prompts[request.emailType] 
    }]
  });

  const content = response.content[0].text;

  // Extract subject line and body
  const lines = content.split('\n');
  const subjectLine = lines.find(l => l.toLowerCase().includes('subject:'))?.replace(/subject:/i, '').trim() || 
    'Your ParkerJoe cart is waiting';
  const body = content.replace(/subject:.*/i, '').trim();

  return {
    subjectLine,
    body,
    preheaderText: generatePreheader(request),
    callToAction: 'Complete Your Purchase'
  };
}
```

### 4.7 Cart Recovery Output Types

```typescript
// agents/cart-whisperer/types.ts

export interface RecoverySequence {
  cartId: string;
  customerId: string;
  touchpoints: ScheduledTouchpoint[];
  status: 'active' | 'completed' | 'converted' | 'cancelled';
  startedAt: Date;
  convertedAt?: Date;
  revenueRecovered?: number;
}

export interface ScheduledTouchpoint {
  id: string;
  sequenceId: string;
  type: 'email' | 'sms' | 'retargeting';
  subtype: string;
  scheduledFor: Date;
  status: 'scheduled' | 'sent' | 'delivered' | 'opened' | 'clicked' | 'converted' | 'failed';
  content?: EmailContent | SMSContent;
  discount?: Discount;
  sentAt?: Date;
  metrics?: {
    opened?: boolean;
    openTime?: Date;
    clicked?: boolean;
    clickTime?: Date;
    converted?: boolean;
    conversionTime?: Date;
  };
}

export interface EmailContent {
  subjectLine: string;
  body: string;
  preheaderText: string;
  callToAction: string;
}

export interface SMSContent {
  body: string;
  shortUrl: string;
}

export interface Discount {
  code: string;
  type: 'percentage' | 'fixed' | 'free_shipping';
  value: number;
  expiry: Date;
  appliesTo: 'cart' | 'item' | 'category';
  minimumOrder: number;
}

export type CustomerSegment = 'first-time' | 'repeat' | 'vip' | 'at-risk';

export interface CartRecoveryAnalytics {
  period: { start: Date; end: Date };
  totalAbandoned: number;
  sequencesStarted: number;
  emailsSent: number;
  emailsOpened: number;
  emailsClicked: number;
  conversions: number;
  revenueRecovered: number;
  averageDiscountUsed: number;
  conversionBySegment: Record<CustomerSegment, number>;
  conversionByTouchpoint: Record<string, number>;
}
```

---

## 5. Agent 4: Social Commander

### 5.1 Purpose & Objectives

The Social Commander automates social media content scheduling, publishing, and UGC curation across multiple platforms while maintaining brand consistency and community engagement.

**Supported Platforms:**
- Instagram (Feed + Stories + Reels)
- Facebook (Page + Groups)
- TikTok
- Pinterest

### 5.2 Posting Schedule

| Day | Theme | Content Types | Optimal Times (CT) |
|-----|-------|---------------|-------------------|
| **Monday** | New Arrivals | Product showcases, collection launches | 11:00 AM, 7:00 PM |
| **Tuesday** | Styling Tips | How-to guides, outfit inspiration, tutorials | 10:00 AM, 6:00 PM |
| **Wednesday** | UGC Reshare | Customer photos, reviews, community highlights | 12:00 PM, 8:00 PM |
| **Thursday** | Behind-the-Scenes | Founder stories, production process, team | 11:00 AM, 5:00 PM |
| **Friday** | Weekend Inspiration | Lifestyle content, event previews | 10:00 AM, 7:00 PM |
| **Saturday** | Promotions | Sales, limited-time offers, bundles | 11:00 AM, 4:00 PM |
| **Sunday** | Community | Polls, Q&A, appreciation posts | 2:00 PM, 8:00 PM |

### 5.3 Trigger Configuration

```typescript
// agents/social-commander/scheduler.ts

interface ScheduledPost {
  id: string;
  platform: Platform;
  contentType: 'feed' | 'story' | 'reel' | 'pin';
  scheduledFor: Date;
  status: 'draft' | 'pending_review' | 'approved' | 'scheduled' | 'published' | 'failed';
  content: SocialContent;
  media: MediaAsset[];
  hashtags: string[];
  mentions: string[];
  crossPostTo?: Platform[];
}

type Platform = 'instagram' | 'facebook' | 'tiktok' | 'pinterest';

export async function generateWeeklySchedule(
  weekStart: Date
): Promise<ScheduledPost[]> {
  const schedule: ScheduledPost[] = [];

  for (let day = 0; day < 7; day++) {
    const currentDate = new Date(weekStart);
    currentDate.setDate(currentDate.getDate() + day);
    
    const theme = getDailyTheme(day);
    const slots = getOptimalTimes(day);

    for (const slot of slots) {
      const postTime = new Date(currentDate);
      postTime.setHours(slot.hour, slot.minute);

      const post = await generatePostForSlot(theme, postTime, slot.platforms);
      schedule.push(post);
    }
  }

  return schedule;
}

function getDailyTheme(day: number): DailyTheme {
  const themes = [
    { name: 'New Arrivals', contentTypes: ['product', 'collection'] },
    { name: 'Styling Tips', contentTypes: ['tutorial', 'inspiration'] },
    { name: 'UGC Reshare', contentTypes: ['customer', 'review'] },
    { name: 'Behind-the-Scenes', contentTypes: ['story', 'process'] },
    { name: 'Weekend Inspiration', contentTypes: ['lifestyle', 'event'] },
    { name: 'Promotions', contentTypes: ['sale', 'offer'] },
    { name: 'Community', contentTypes: ['engagement', 'appreciation'] }
  ];
  return themes[day];
}
```

### 5.4 Content Generation by Theme

```typescript
// agents/social-commander/content/generator.ts

interface PostGenerationRequest {
  theme: string;
  platforms: Platform[];
  contentType: string;
  scheduledFor: Date;
  season?: string;
  campaign?: string;
}

export async function generateSocialPost(
  request: PostGenerationRequest
): Promise<Record<Platform, SocialContent>> {
  
  const platformConfigs: Record<Platform, PlatformConfig> = {
    instagram: {
      maxCaptionLength: 2200,
      hashtagCount: 15,
      idealCaptionLength: 150,
      emojiUsage: 'moderate',
      ctaStyle: 'engagement'
    },
    facebook: {
      maxCaptionLength: 63206,
      hashtagCount: 3,
      idealCaptionLength: 80,
      emojiUsage: 'minimal',
      ctaStyle: 'click'
    },
    tiktok: {
      maxCaptionLength: 2200,
      hashtagCount: 4,
      idealCaptionLength: 100,
      emojiUsage: 'heavy',
      ctaStyle: 'engagement'
    },
    pinterest: {
      maxCaptionLength: 500,
      hashtagCount: 5,
      idealCaptionLength: 200,
      emojiUsage: 'minimal',
      ctaStyle: 'save'
    }
  };

  const posts: Partial<Record<Platform, SocialContent>> = {};

  for (const platform of request.platforms) {
    const config = platformConfigs[platform];
    
    const prompt = `Generate a ${platform} post for ParkerJoe western wear.

Theme: ${request.theme}
Scheduled: ${request.scheduledFor.toLocaleDateString()}
${request.season ? `Season: ${request.season}` : ''}
${request.campaign ? `Campaign: ${request.campaign}` : ''}

PLATFORM REQUIREMENTS:
- Platform: ${platform}
- Max caption length: ${config.maxCaptionLength}
- Recommended hashtags: ${config.hashtagCount}
- Ideal caption length: ${config.idealCaptionLength} characters
- Emoji usage: ${config.emojiUsage}
- Call-to-action style: ${config.ctaStyle}

CONTENT GUIDELINES:
- Authentic western voice
- Engaging hook in first 125 characters
- Use relevant western wear hashtags
- Include brand hashtag #ParkerJoe
- End with clear CTA

OUTPUT (JSON):
{
  "caption": "Full caption text",
  "hashtags": ["tag1", "tag2", ...],
  "mentions": [],
  "callToAction": "Shop the look! Link in bio.",
  "suggestedAltText": "Accessibility description",
  "engagementPrompt": "Question to drive comments"
}`;

    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 1000,
      temperature: 0.8,
      messages: [{ role: 'user', content: prompt }]
    });

    posts[platform] = JSON.parse(response.content[0].text);
  }

  return posts as Record<Platform, SocialContent>;
}
```

### 5.5 UGC Pipeline

```typescript
// agents/social-commander/ugc/pipeline.ts

interface UGCSubmission {
  id: string;
  source: 'judgeme' | 'upload' | 'hashtag' | 'mention';
  customerEmail: string;
  customerName: string;
  customerAge?: number;
  images: string[];
  video?: string;
  caption: string;
  productTags: string[];
  submittedAt: Date;
  consentStatus: 'pending' | 'granted' | 'denied' | 'expired';
  moderationStatus: 'pending' | 'approved' | 'rejected' | 'flagged';
  coppaCompliant: boolean;
}

export class UGCPipeline {
  
  async processSubmission(submission: UGCSubmission): Promise<void> {
    // Step 1: COPPA Compliance Check
    const coppaCheck = await this.checkCOPPA(submission);
    if (!coppaCheck.compliant) {
      await this.flagForManualReview(submission, 'coppa_concern');
      return;
    }

    // Step 2: Consent Verification
    if (submission.consentStatus !== 'granted') {
      await this.requestConsent(submission);
      return;
    }

    // Step 3: AI Moderation
    const moderationResult = await this.moderateContent(submission);
    if (moderationResult.flags.length > 0) {
      await this.flagForManualReview(submission, moderationResult.flags);
      return;
    }

    // Step 4: Add to Review Queue
    await this.addToReviewQueue(submission);
  }

  private async checkCOPPA(submission: UGCSubmission): Promise<{ compliant: boolean }> {
    // If customer appears to be under 13, require parental consent
    if (submission.customerAge && submission.customerAge < 13) {
      return { compliant: false };
    }

    // AI-based age estimation from image (if available)
    if (submission.images.length > 0) {
      const ageEstimate = await this.estimateAge(submission.images[0]);
      if (ageEstimate < 13) {
        return { compliant: false };
      }
    }

    return { compliant: true };
  }

  private async moderateContent(submission: UGCSubmission): Promise<ModerationResult> {
    const flags: string[] = [];

    // Check images for inappropriate content
    for (const image of submission.images) {
      const imageCheck = await this.checkImageContent(image);
      if (imageCheck.inappropriate) {
        flags.push('inappropriate_image');
      }
      if (!imageCheck.onBrand) {
        flags.push('off_brand');
      }
    }

    // Check caption for brand safety
    const captionCheck = await this.checkCaption(submission.caption);
    if (captionCheck.sentiment < -0.5) {
      flags.push('negative_sentiment');
    }
    if (captionCheck.hasProfanity) {
      flags.push('profanity');
    }

    // Verify product relevance
    const relevanceCheck = await this.checkProductRelevance(
      submission.caption, 
      submission.productTags
    );
    if (relevanceCheck.score < 0.6) {
      flags.push('low_relevance');
    }

    return { flags };
  }

  private async requestConsent(submission: UGCSubmission): Promise<void> {
    // Send consent request email
    await sendEmail({
      to: submission.customerEmail,
      template: 'ugc-consent-request',
      data: {
        customerName: submission.customerName,
        submissionId: submission.id,
        consentUrl: `${process.env.APP_URL}/ugc/consent/${submission.id}`,
        previewImage: submission.images[0]
      }
    });
  }
}
```

### 5.6 Platform Publishing

```typescript
// agents/social-commander/publishers/index.ts

export async function publishPost(post: ScheduledPost): Promise<void> {
  const publishers: Record<Platform, Publisher> = {
    instagram: new InstagramPublisher(),
    facebook: new FacebookPublisher(),
    tiktok: new TikTokPublisher(),
    pinterest: new PinterestPublisher()
  };

  const publisher = publishers[post.platform];
  
  try {
    await publisher.publish(post);
    await updatePostStatus(post.id, 'published');
  } catch (error) {
    console.error(`Failed to publish to ${post.platform}:`, error);
    await updatePostStatus(post.id, 'failed', error.message);
    throw error;
  }
}

// Instagram Publisher
class InstagramPublisher implements Publisher {
  async publish(post: ScheduledPost): Promise<void> {
    const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
    
    // Upload media
    const mediaId = await this.uploadMedia(post.media[0], accessToken);
    
    // Publish with caption
    await fetch(`https://graph.facebook.com/v18.0/${mediaId}/publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        caption: this.formatCaption(post),
        access_token: accessToken
      })
    });
  }

  private formatCaption(post: ScheduledPost): string {
    return `${post.content.caption}\n\n${post.hashtags.join(' ')}`;
  }
}
```

### 5.7 Social Commander Output Types

```typescript
// agents/social-commander/types.ts

export interface ScheduledPost {
  id: string;
  platform: Platform;
  contentType: 'feed' | 'story' | 'reel' | 'pin' | 'carousel';
  scheduledFor: Date;
  publishedAt?: Date;
  status: PostStatus;
  content: SocialContent;
  media: MediaAsset[];
  hashtags: string[];
  mentions: string[];
  tags: string[];
  campaign?: string;
  utmParams?: Record<string, string>;
  engagement?: PostEngagement;
}

export interface SocialContent {
  caption: string;
  hashtags: string[];
  mentions: string[];
  callToAction: string;
  altText?: string;
  engagementPrompt?: string;
}

export interface MediaAsset {
  id: string;
  type: 'image' | 'video';
  url: string;
  thumbnailUrl?: string;
  dimensions: { width: number; height: number };
  fileSize: number;
  altText?: string;
}

export interface PostEngagement {
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  reach: number;
  impressions: number;
  clicks: number;
}

export type PostStatus = 
  | 'draft'
  | 'pending_review'
  | 'approved'
  | 'scheduled'
  | 'publishing'
  | 'published'
  | 'failed'
  | 'archived';

export type Platform = 'instagram' | 'facebook' | 'tiktok' | 'pinterest';

export interface UGCSubmission {
  id: string;
  source: 'judgeme' | 'upload' | 'hashtag' | 'mention';
  customer: {
    email: string;
    name: string;
    age?: number;
  };
  content: {
    images: string[];
    video?: string;
    caption: string;
    productTags: string[];
  };
  submittedAt: Date;
  consent: {
    status: 'pending' | 'granted' | 'denied' | 'expired';
    grantedAt?: Date;
    expiresAt?: Date;
  };
  moderation: {
    aiStatus: 'pending' | 'approved' | 'flagged';
    humanStatus: 'pending' | 'approved' | 'rejected';
    flags: string[];
    reviewedBy?: string;
    reviewedAt?: Date;
  };
  coppaCompliant: boolean;
}
```

---

## 6. Shared Infrastructure

### 6.1 Queue Management (BullMQ)

```typescript
// infrastructure/queue/index.ts
import { Queue, Worker, Job } from 'bullmq';
import IORedis from 'ioredis';

const redis = new IORedis(process.env.REDIS_URL!, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false
});

// Agent-specific queues
export const queues = {
  trendScout: new Queue('trend-scout', { connection: redis }),
  contentEngine: new Queue('content-engine', { connection: redis }),
  cartWhisperer: new Queue('cart-whisperer', { connection: redis }),
  socialCommander: new Queue('social-commander', { connection: redis }),
  reviewQueue: new Queue('human-review', { connection: redis })
};

// Job types by agent
export interface JobPayloads {
  'trend-scout': {
    'daily-scan': { type: 'full' | 'quick' };
    'competitor-check': { competitorId: string };
    'report-generate': { period: 'daily' | 'weekly' };
  };
  'content-engine': {
    'generate-description': { productId: string; priority: Priority };
    'generate-social': { productId: string; platforms: Platform[] };
    'bulk-generate': { productIds: string[] };
  };
  'cart-whisperer': {
    'recovery-sequence': { cartId: string; event: CartAbandonmentEvent };
    'send-touchpoint': { touchpointId: string };
    'process-conversion': { cartId: string; orderId: string };
  };
  'social-commander': {
    'publish-post': { postId: string };
    'schedule-week': { weekStart: Date };
    'process-ugc': { submissionId: string };
  };
}

// Queue job function
export async function queueJob<T extends keyof JobPayloads, K extends keyof JobPayloads[T]>(
  queue: T,
  jobType: K,
  payload: JobPayloads[T][K],
  options?: { priority?: number; delay?: number; attempts?: number }
): Promise<string> {
  const job = await queues[queue].add(jobType as string, payload, {
    priority: options?.priority,
    delay: options?.delay,
    attempts: options?.attempts || 3,
    backoff: {
      type: 'exponential',
      delay: 2000
    }
  });

  return job.id!;
}
```

### 6.2 Error Handling

```typescript
// infrastructure/error/handler.ts

interface ErrorContext {
  agent: string;
  jobId: string;
  jobType: string;
  payload: unknown;
  timestamp: Date;
}

export class AgentErrorHandler {
  async handleError(error: Error, context: ErrorContext): Promise<void> {
    // Log error
    await this.logError(error, context);

    // Determine error severity
    const severity = this.classifyError(error);

    switch (severity) {
      case 'retryable':
        await this.scheduleRetry(context);
        break;
      case 'critical':
        await this.alertTeam(error, context);
        await this.pauseQueue(context.agent);
        break;
      case 'data_error':
        await this.flagForManualReview(context);
        break;
      case 'external_service':
        await this.handleExternalServiceError(error, context);
        break;
    }
  }

  private classifyError(error: Error): ErrorSeverity {
    // Network errors
    if (error.message.includes('ETIMEDOUT') || 
        error.message.includes('ECONNREFUSED')) {
      return 'retryable';
    }

    // API rate limits
    if (error.message.includes('rate limit') || 
        error.status === 429) {
      return 'retryable';
    }

    // API authentication
    if (error.status === 401 || error.status === 403) {
      return 'critical';
    }

    // Data validation errors
    if (error.name === 'ValidationError') {
      return 'data_error';
    }

    // External service errors
    if (error.message.includes('Klaviyo') || 
        error.message.includes('Copyscape')) {
      return 'external_service';
    }

    return 'retryable';
  }

  private async alertTeam(error: Error, context: ErrorContext): Promise<void> {
    await sendSlackAlert({
      channel: '#engineering-alerts',
      text: `🚨 Agent Error: ${context.agent}`,
      attachments: [{
        color: 'danger',
        fields: [
          { title: 'Job ID', value: context.jobId, short: true },
          { title: 'Job Type', value: context.jobType, short: true },
          { title: 'Error', value: error.message },
          { title: 'Time', value: context.timestamp.toISOString() }
        ]
      }]
    });
  }
}
```

### 6.3 Monitoring & Cost Tracking

```typescript
// infrastructure/monitoring/tracker.ts

interface AgentMetrics {
  agent: string;
  period: { start: Date; end: Date };
  jobsCompleted: number;
  jobsFailed: number;
  averageExecutionTime: number;
  tokensConsumed: {
    input: number;
    output: number;
    total: number;
  };
  costEstimate: number;
  externalAPICalls: Record<string, number>;
}

export class AgentMonitor {
  async trackExecution<T>(
    agent: string,
    jobType: string,
    fn: () => Promise<T>
  ): Promise<T> {
    const startTime = Date.now();
    const startTokens = await this.getTokenCount();

    try {
      const result = await fn();
      
      const executionTime = Date.now() - startTime;
      const endTokens = await this.getTokenCount();

      await this.recordMetrics({
        agent,
        jobType,
        executionTime,
        tokens: endTokens - startTokens,
        status: 'success'
      });

      return result;
    } catch (error) {
      await this.recordMetrics({
        agent,
        jobType,
        executionTime: Date.now() - startTime,
        status: 'failed',
        error: error.message
      });
      throw error;
    }
  }

  async getCostReport(period: { start: Date; end: Date }): Promise<CostReport> {
    const metrics = await this.getMetricsForPeriod(period);

    // Claude pricing (as of 2026)
    const claudePricing = {
      'claude-3-haiku': { input: 0.25, output: 1.25 }, // per 1M tokens
      'claude-3-sonnet': { input: 3.00, output: 15.00 }
    };

    let totalCost = 0;
    const agentCosts: Record<string, number> = {};

    for (const metric of metrics) {
      const model = this.getAgentModel(metric.agent);
      const pricing = claudePricing[model];
      
      const cost = (
        (metric.tokensConsumed.input / 1000000) * pricing.input +
        (metric.tokensConsumed.output / 1000000) * pricing.output
      );

      totalCost += cost;
      agentCosts[metric.agent] = (agentCosts[metric.agent] || 0) + cost;
    }

    return {
      period,
      totalCost,
      agentCosts,
      budgetRemaining: MONTHLY_BUDGET - totalCost,
      projectedMonthly: this.projectMonthlyCost(totalCost, period)
    };
  }
}
```

### 6.4 Vercel Cron Configuration

```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/agents/trend-scout/daily",
      "schedule": "0 11 * * *"
    },
    {
      "path": "/api/agents/trend-scout/weekly-report",
      "schedule": "0 12 * * 1"
    },
    {
      "path": "/api/agents/social-commander/schedule-week",
      "schedule": "0 9 * * 0"
    },
    {
      "path": "/api/agents/cart-whisperer/process-queue",
      "schedule": "*/15 * * * *"
    },
    {
      "path": "/api/agents/content-engine/daily-batch",
      "schedule": "0 2 * * *"
    }
  ]
}
```

---

## 7. Human Review Workflows

### 7.1 Review Queue Dashboard

```typescript
// app/dashboard/review/queue/types.ts

interface ReviewQueueItem {
  id: string;
  type: 'content' | 'ugc' | 'trend' | 'social';
  status: 'pending' | 'in_review' | 'approved' | 'rejected' | 'needs_revision';
  content: {
    preview: string;
    fullData: unknown;
    aiGenerated: boolean;
    aiConfidence?: number;
  };
  metadata: {
    createdAt: Date;
    agent: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    tags: string[];
  };
  assignedTo?: string;
  reviewedAt?: Date;
  reviewNotes?: string;
}

interface ReviewAction {
  type: 'approve' | 'reject' | 'request_revision' | 'schedule';
  itemId: string;
  reviewerId: string;
  notes?: string;
  scheduledFor?: Date;
  edits?: Partial<ReviewQueueItem['content']>;
}
```

### 7.2 Review Interface API

```typescript
// app/api/review/queue/route.ts

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  const filters = {
    type: searchParams.get('type'),
    status: searchParams.get('status') || 'pending',
    priority: searchParams.get('priority'),
    assignedTo: searchParams.get('assignedTo'),
    agent: searchParams.get('agent')
  };

  const items = await getReviewQueueItems(filters);

  return NextResponse.json({
    items,
    total: items.length,
    filters
  });
}

export async function POST(request: Request) {
  const action: ReviewAction = await request.json();

  // Validate reviewer permissions
  const hasPermission = await checkReviewerPermissions(
    action.reviewerId,
    action.type
  );

  if (!hasPermission) {
    return NextResponse.json(
      { error: 'Insufficient permissions' },
      { status: 403 }
    );
  }

  // Process action
  switch (action.type) {
    case 'approve':
      await approveItem(action.itemId, action.reviewerId, action.notes);
      break;
    case 'reject':
      await rejectItem(action.itemId, action.reviewerId, action.notes);
      break;
    case 'request_revision':
      await requestRevision(action.itemId, action.reviewerId, action.notes);
      break;
    case 'schedule':
      await scheduleItem(action.itemId, action.scheduledFor!, action.reviewerId);
      break;
  }

  return NextResponse.json({ success: true });
}

// app/api/review/queue/[id]/edit/route.ts
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { edits, reviewerId } = await request.json();

  const item = await getReviewItem(params.id);
  if (!item) {
    return NextResponse.json({ error: 'Item not found' }, { status: 404 });
  }

  // Apply edits and save
  const updatedContent = await applyEdits(item, edits, reviewerId);

  return NextResponse.json({
    success: true,
    item: updatedContent
  });
}
```

### 7.3 Review Workflow States

```
┌─────────────────────────────────────────────────────────────────┐
│                    REVIEW WORKFLOW STATES                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   ┌──────────┐     ┌──────────┐     ┌──────────┐               │
│   │  AGENT   │────→│  QUEUED  │────→│ PENDING  │               │
│   │ GENERATES│     │          │     │ REVIEW   │               │
│   └──────────┘     └──────────┘     └────┬─────┘               │
│                                          │                      │
│                    ┌─────────────────────┼─────────────────┐   │
│                    │                     │                 │   │
│                    ↓                     ↓                 ↓   │
│             ┌──────────┐          ┌──────────┐      ┌─────────┐│
│             │ASSIGNED  │          │  EDITED  │      │REJECTED ││
│             │(claimed) │          │ (in prog)│      │         ││
│             └────┬─────┘          └────┬─────┘      └────┬────┘│
│                  │                     │                 │     │
│                  └─────────────────────┼─────────────────┘     │
│                                        │                       │
│                                        ↓                       │
│                                 ┌──────────┐                   │
│                                 │ APPROVED │                   │
│                                 │          │                   │
│                                 └────┬─────┘                   │
│                                      │                         │
│                    ┌─────────────────┼─────────────────┐       │
│                    │                 │                 │       │
│                    ↓                 ↓                 ↓       │
│             ┌──────────┐      ┌──────────┐      ┌──────────┐   │
│             │SCHEDULED │      │ PUBLISHED│      │ ARCHIVED │   │
│             │          │      │          │      │          │   │
│             └──────────┘      └──────────┘      └──────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 8. Security & Compliance

### 8.1 Authentication & Authorization

```typescript
// security/auth.ts

interface AgentAuthConfig {
  apiKey: string;
  allowedIPs?: string[];
  rateLimit: {
    requests: number;
    window: number; // seconds
  };
}

export async function verifyAgentRequest(
  request: Request,
  agent: string
): Promise<boolean> {
  // Check API key
  const apiKey = request.headers.get('x-agent-api-key');
  if (!apiKey || !await verifyApiKey(apiKey, agent)) {
    return false;
  }

  // Check IP whitelist (if configured)
  const clientIP = request.headers.get('x-forwarded-for') || 
    request.headers.get('x-real-ip');
  if (!await verifyIP(clientIP, agent)) {
    return false;
  }

  // Check rate limit
  if (!await checkRateLimit(apiKey, agent)) {
    return false;
  }

  return true;
}
```

### 8.2 Data Protection

```typescript
// security/data-protection.ts

// PII redaction for logs
export function redactPII(data: unknown): unknown {
  if (typeof data === 'string') {
    return data
      .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL]')
      .replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[SSN]')
      .replace(/\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, '[CARD]');
  }

  if (Array.isArray(data)) {
    return data.map(redactPII);
  }

  if (typeof data === 'object' && data !== null) {
    return Object.fromEntries(
      Object.entries(data).map(([key, value]) => [
        key,
        sensitiveFields.includes(key) ? '[REDACTED]' : redactPII(value)
      ])
    );
  }

  return data;
}

const sensitiveFields = [
  'password', 'token', 'apiKey', 'secret', 
  'creditCard', 'ssn', 'phone', 'email'
];
```

### 8.3 Compliance Requirements

| Regulation | Agent | Requirements |
|------------|-------|--------------|
| **COPPA** | Social Commander | Age verification for UGC, parental consent for <13 |
| **CAN-SPAM** | Cart Whisperer | Unsubscribe links, physical address, clear sender |
| **GDPR** | All | Data retention limits, right to deletion, consent tracking |
| **TCPA** | Cart Whisperer | SMS opt-in consent, quiet hours (8 AM - 9 PM) |

---

## 9. Monitoring & Observability

### 9.1 Metrics Dashboard

```typescript
// monitoring/metrics.ts

interface AgentDashboard {
  agents: {
    [agentName: string]: {
      health: 'healthy' | 'degraded' | 'down';
      jobsLast24h: number;
      successRate: number;
      avgExecutionTime: number;
      queueDepth: number;
      errorsLast24h: number;
    };
  };
  costs: {
    daily: number;
    monthly: number;
    budgetRemaining: number;
    byAgent: Record<string, number>;
  };
  alerts: Array<{
    severity: 'info' | 'warning' | 'critical';
    message: string;
    agent: string;
    timestamp: Date;
  }>;
}
```

### 9.2 Alerting Rules

| Condition | Severity | Action |
|-----------|----------|--------|
| Success rate < 90% | Warning | Slack notification |
| Success rate < 75% | Critical | Page on-call, pause queue |
| Queue depth > 1000 | Warning | Scale workers |
| Cost > daily budget | Warning | Notify finance |
| External API down | Critical | Failover to backup |
| PII detected in logs | Critical | Immediate escalation |

---

## 10. Appendix

### 10.1 Environment Variables

```bash
# AI/ML
ANTHROPIC_API_KEY=sk-ant-...

# Database
REDIS_URL=redis://...
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...

# External Services
KLAVIYO_PRIVATE_KEY=pk_...
KLAVIYO_PUBLIC_KEY=...
COPYSCAPE_USERNAME=...
COPYSCAPE_API_KEY=...

# Social Media
INSTAGRAM_ACCESS_TOKEN=...
FACEBOOK_ACCESS_TOKEN=...
PINTEREST_ACCESS_TOKEN=...
TIKTOK_ACCESS_TOKEN=...

# Security
CRON_SECRET=...
AGENT_API_KEY=...
WEBHOOK_SECRET=...

# Monitoring
SENTRY_DSN=...
LOG_LEVEL=info
```

### 10.2 File Structure

```
agents/
├── trend-scout/
│   ├── scrapers/
│   │   ├── competitor-scraper.ts
│   │   └── social-monitor.ts
│   ├── analyzers/
│   │   ├── price-analyzer.ts
│   │   └── trend-detector.ts
│   ├── reports/
│   │   └── weekly-report.ts
│   ├── types.ts
│   └── index.ts
├── content-engine/
│   ├── generators/
│   │   ├── product-description.ts
│   │   ├── social-content.ts
│   │   └── blog-article.ts
│   ├── quality/
│   │   └── checks.ts
│   ├── types.ts
│   └── index.ts
├── cart-whisperer/
│   ├── integrations/
│   │   └── klaviyo.ts
│   ├── content/
│   │   └── generator.ts
│   ├── discounts.ts
│   ├── types.ts
│   └── index.ts
├── social-commander/
│   ├── content/
│   │   └── generator.ts
│   ├── publishers/
│   │   ├── instagram.ts
│   │   ├── facebook.ts
│   │   ├── tiktok.ts
│   │   └── pinterest.ts
│   ├── ugc/
│   │   └── pipeline.ts
│   ├── scheduler.ts
│   ├── types.ts
│   └── index.ts
infrastructure/
├── queue/
│   └── index.ts
├── error/
│   └── handler.ts
├── monitoring/
│   └── tracker.ts
└── security/
    ├── auth.ts
    └── data-protection.ts
app/
├── api/
│   ├── agents/
│   │   ├── trend-scout/
│   │   ├── content-engine/
│   │   ├── cart-whisperer/
│   │   └── social-commander/
│   ├── webhooks/
│   │   └── products/
│   └── review/
│       └── queue/
└── dashboard/
    └── review/
```

### 10.3 Glossary

| Term | Definition |
|------|------------|
| **Agent** | An automated background service that performs specific tasks |
| **BullMQ** | Redis-based queue system for job processing |
| **COPPA** | Children's Online Privacy Protection Act |
| **UGC** | User-Generated Content |
| **Vercel Cron** | Scheduled function execution on Vercel platform |
| **Webhook** | HTTP callback triggered by events |
| **Embedding** | Vector representation of text for similarity comparison |

---

*End of Technical PRD*
