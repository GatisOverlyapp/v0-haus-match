# HausMatch - Project Vision & Architecture

## Project Overview

**HausMatch** is a comprehensive fullstack platform designed to be the one-stop destination for prefab, modular, and alternative home buyers. The platform serves as an intelligent matching system that connects home buyers with house manufacturers, providing tools for discovery, visualization, planning, and cost estimation.

### Core Mission
To revolutionize the prefab home buying experience by providing transparency, visualization tools, and comprehensive information that helps buyers make informed decisions about their future homes.

---

## Current State

### Technology Stack
- **Framework**: Next.js 15.2.4 with React 19
- **Database**: Prisma with PostgreSQL
- **Authentication**: NextAuth v4
- **UI Components**: Radix UI with custom Tailwind CSS styling
- **Deployment**: Vercel

### Existing Features
- ✅ Admin CMS for managing users, builders, houses, and blog posts
- ✅ Basic house builder profiles
- ✅ House listings with basic details (size, price, materials, etc.)
- ✅ Image galleries for houses
- ✅ Blog system
- ✅ WebAR model integration (basic implementation)
- ✅ Role-based access control (Administrator, Content Manager)
- ✅ User authentication system

### Database Schema (Current - Prisma)
- `User` - Admin and content manager accounts
- `HouseBuilder` - Manufacturer profiles
- `House` - Individual house models
- `HouseImage` - Image galleries
- `HouseSubcategory` - House variations/subcategories
- `BlogPost` - Blog articles

---

## Core Features & Requirements

### 1. House Manufacturer Profiles

**Purpose**: Showcase prefab house manufacturers and their offerings

**Required Fields**:
- Name
- Website URL
- Location (address, city, country)
- Coordinates (lat/lng for Mapbox integration)
- Main image/logo
- Description
- Contact information
- Service areas (geographic regions they serve)
- Years in business
- Certifications/licenses
- **Extensible**: Schema should allow adding new fields without breaking existing data

**Features**:
- Profile pages with all manufacturer details
- List of all house models from the manufacturer
- Mapbox integration showing manufacturer location
- Filtering by location, service area, certifications

---

### 2. House Models & Listings

**Purpose**: Detailed information about each house model offered by manufacturers

**Required Fields**:
- **Basic Info**:
  - Name
  - Manufacturer (reference to HouseBuilder)
  - Description
  - Category/Type (Prefab, Modular, Tiny House, A-Frame, ADU, Sauna, Off-grid, Container, etc.)
  - Style (Scandinavian, Modern, Rustic, Minimalist, Industrial, etc.)

- **Specifications**:
  - Price (base price)
  - Size (dimensions)
  - Square footage
  - Number of stories
  - Bedrooms
  - Bathrooms
  - Materials used
  - Construction type
  - Energy efficiency rating
  - Certifications (LEED, Passive House, etc.)

- **Location & Availability**:
  - Available regions/countries
  - Delivery options
  - Installation requirements

- **Media**:
  - Main image
  - Image gallery (multiple images)
  - AR 3D model URL (for WebAR viewer)
  - Video tours (optional)

- **Additional Details**:
  - Customization options
  - Lead time
  - Warranty information
  - Financing options

- **Extensibility**: Schema must support adding new fields dynamically (e.g., "solar panel compatibility", "water collection system", etc.)

**Features**:
- Detailed house model pages
- Image galleries with lightbox
- AR 3D model viewer (WebAR integration)
- Comparison tool (compare multiple houses)
- Filtering and search functionality
- Shortlist/save functionality (requires user account)

---

### 3. Visitor/Buyer Profiles

**Purpose**: Allow house buyers to save preferences, shortlist houses, and track their journey

**User Flow**:
1. **Anonymous Browsing**: Visitors can freely browse all houses, manufacturers, and content without registration
2. **Registration**: Optional registration to unlock:
   - Save/shortlist houses
   - Save search preferences
   - Track viewed houses
   - Save favorite manufacturers
   - Access to cost calculator results
   - Personal dashboard

**User Profile Data**:
- Email (for registration)
- Name (optional)
- Location/preferences
- Saved houses (shortlist)
- Saved searches
- Viewing history
- Cost calculator results
- Preferences (style, size, budget, etc.)

**Analytics**: Track user behavior (what houses they viewed, time spent, filters used) for insights

---

### 4. Mapbox Integration

**Purpose**: Visualize house manufacturers and houses on an interactive map

**Features**:
- Display manufacturers based on visitor's location
- Filter manufacturers by distance/radius
- Show service areas
- Cluster markers for multiple manufacturers in same area
- Click markers to see manufacturer details
- Filter by house type, price range, availability
- Integration with house listings (show houses available in selected area)

**Technical Requirements**:
- Mapbox GL JS integration
- Geocoding for addresses
- Reverse geocoding for location-based searches
- Distance calculations
- Responsive map component

---

### 5. Advanced Filtering & Search

**Purpose**: Help buyers find houses matching their exact preferences

**Filter Options**:
- **Type**: Prefab, Modular, Tiny House, A-Frame, ADU, Sauna, Off-grid, Container, etc.
- **Style**: Scandinavian, Modern, Rustic, Minimalist, Industrial, etc.
- **Price Range**: Min/max price
- **Size**: Square footage range
- **Bedrooms/Bathrooms**: Number ranges
- **Location**: Country, region, service area
- **Materials**: Wood, Steel, Concrete, etc.
- **Features**: Energy efficient, Off-grid capable, Customizable, etc.
- **Certifications**: LEED, Passive House, etc.

**Search Features**:
- Full-text search across house names, descriptions, manufacturers
- Natural language query parsing (e.g., "modern tiny house under 50k in Sweden")
- Saved searches
- Search history

---

### 6. Cost Calculator & Transparency

**Purpose**: Show the REAL total cost of buying and building a prefab home

**Problem**: Manufacturers often show only the base house price (e.g., $50k), but the actual cost includes many additional expenses.

**Cost Breakdown**:
- **Base House Price**: From manufacturer
- **Foundation**: Cost estimation based on location, soil type, size
- **Transportation**: Distance-based calculation
- **Installation/Assembly**: Labor costs
- **Utilities/Communications**: 
  - Electrical connection
  - Water/sewer connection
  - Internet/cable
  - Gas (if applicable)
- **Permits**: Building permits, zoning permits
- **Legal Fees**: Lawyers, contracts, title work
- **Site Preparation**: Land clearing, grading
- **Additional Costs**:
  - Land purchase (if not owned)
  - Surveying
  - Inspections
  - Insurance
  - Property taxes (first year)

**Features**:
- Interactive cost calculator form
- Location-based cost estimates
- Save calculator results to user profile
- Comparison: Base price vs. Total cost
- Breakdown visualization (charts/graphs)
- Regional cost variations
- Integration with service provider directory

---

### 7. Service Provider Directory

**Purpose**: One-stop resource for all services needed in the home building process

**Service Categories**:
- **Foundation Contractors**: Find local foundation builders
- **Transportation Services**: House delivery companies
- **Installation Teams**: Assembly/construction crews
- **Utility Companies**: Electrical, water, internet providers
- **Permit Services**: Help with permits and zoning
- **Legal Services**: Real estate lawyers
- **Surveyors**: Land surveying services
- **Inspectors**: Building inspectors
- **Financing**: Loan providers, mortgage brokers

**Features**:
- Directory listing with contact info
- Location-based search
- Reviews/ratings (future)
- Integration with cost calculator
- Service area mapping

---

### 8. CMS (Content Management System)

**Purpose**: Admin interface for managing all platform content

**Current Capabilities**:
- User management (Admin, Content Manager roles)
- Builder profile management
- House listing management
- Blog post management

**Enhanced Requirements**:
- **Dynamic Schema Management**: Ability to add new fields to houses, builders, etc. without code changes
- **Bulk Operations**: Import/export, bulk editing
- **Media Management**: Upload, organize, and manage images/videos
- **AR Model Management**: Upload and manage 3D models for AR viewer
- **Service Provider Management**: Add/edit service providers
- **Analytics Dashboard**: View user behavior, popular houses, search trends
- **Content Versioning**: Track changes, rollback capabilities
- **Rich Text Editor**: For descriptions, blog posts
- **SEO Management**: Meta tags, descriptions, slugs

**Extensibility**:
- Plugin/field system for adding custom fields
- Custom field types (text, number, date, select, multi-select, file, etc.)
- Field validation rules
- Conditional fields (show field X only if field Y has value Z)

---

## Future Features (Roadmap)

### 1. AI Agent for Home Matching

**Vision**: An intelligent AI assistant that guides buyers through the entire home buying process

**Capabilities**:
- **Conversational Interface**: Natural language interaction
- **Personalized Recommendations**: Based on preferences, budget, location
- **Process Guidance**: Step-by-step guidance through buying process
- **Question Answering**: Answer questions about houses, manufacturers, process
- **Preference Learning**: Learn from user interactions to improve recommendations

**Technology**: To be determined (OpenAI, Anthropic, or local LLM)

**Integration Points**:
- House database for recommendations
- Cost calculator for budget analysis
- GIS system for land compatibility
- AR viewer for visualization suggestions

---

### 2. GIS System Integration

**Purpose**: Determine if a prefab home can be built on a specific plot of land

**Features**:
- **Land Analysis**: 
  - Zoning regulations check
  - Building code compliance
  - Setback requirements
  - Utility availability
  - Soil analysis
  - Topography assessment
  - Flood zone checking
- **Compatibility Scoring**: Rate how suitable a house is for a specific plot
- **Visualization**: Overlay house footprint on land plot
- **Report Generation**: Detailed compatibility report

**Technical Requirements**:
- GIS API integration (e.g., Google Maps Platform, ArcGIS, or specialized services)
- Zoning data access
- Building code database
- Address/coordinate geocoding

---

### 3. Augmented Reality (AR) Integration

**Purpose**: Allow users to visualize houses on their actual land using AR

**Current State**: Basic WebAR model integration exists

**Enhanced Features**:
- **AR Placement**: Place house models on real-world land using phone camera
- **Scale Accuracy**: Properly scaled models
- **Multiple Views**: Walk around, view from different angles
- **Model Library**: AR-ready 3D models for all houses
- **Screenshot/Share**: Capture AR views to share
- **Measurement Tools**: Measure distances, check fit
- **Integration with GIS**: Use GIS data to show accurate placement

**Technical Stack**:
- WebAR (8th Wall, AR.js, or similar)
- 3D model format: GLTF/GLB
- Model hosting and optimization

---

### 4. Loan Compatibility Checker

**Purpose**: Help buyers understand financing options and loan eligibility

**Features**:
- **Loan Calculator**: Calculate monthly payments, interest
- **Eligibility Check**: Based on income, credit, down payment
- **Lender Matching**: Connect with suitable lenders
- **Prefab-Specific Loans**: Information about specialized financing for prefab homes
- **Comparison**: Compare different loan options
- **Documentation Guide**: What documents are needed

**Integration**:
- Cost calculator (total cost affects loan amount)
- User profile (save loan scenarios)
- Lender directory

---

## Data Models (Prisma Schema)

### Core Models

The following models need to be added or extended in the Prisma schema to support the full vision:

#### `HouseBuilder` (Manufacturers) - Extend existing
```prisma
model HouseBuilder {
  id              String   @id @default(cuid())
  name            String
  website         String?
  description     String?  @db.Text
  location        String?
  latitude        Float?
  longitude       Float?
  mainImage       String?
  contactEmail    String?
  contactPhone    String?
  serviceAreas    String[] // Array of countries/regions
  yearsInBusiness Int?
  certifications  String[] // Array of certifications
  metadata        Json?    // For extensible custom fields
  houses          House[]
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

#### `House` - Extend existing
```prisma
model House {
  id                 String            @id @default(cuid())
  builderId          String
  builder            HouseBuilder      @relation(fields: [builderId], references: [id], onDelete: Cascade)
  name               String
  description        String?           @db.Text
  category           String?          // Prefab, Modular, Tiny House, etc.
  style              String?           // Scandinavian, Modern, etc.
  basePrice          Float?
  size               String?           // Dimensions
  squareFootage      Int?
  stories            Int?
  bedrooms           Int?
  bathrooms          Int?
  materials          String[]          // Array of materials
  constructionType   String?
  energyRating       String?
  certifications     String[]
  availableRegions   String[]
  deliveryOptions    String[]
  mainImage          String?
  arModelUrl         String?
  customizationOptions String[]
  leadTime           String?
  warranty           String?
  financingOptions   String[]
  metadata           Json?             // For extensible custom fields
  images             HouseImage[]
  subcategories      HouseSubcategory[]
  shortlists         Shortlist[]
  viewingHistory     ViewingHistory[]
  costCalculatorResults CostCalculatorResult[]
  createdAt          DateTime          @default(now())
  updatedAt          DateTime          @updatedAt
}
```

#### `HouseImage` - Existing (keep as is)
```prisma
model HouseImage {
  id        String   @id @default(cuid())
  houseId   String
  house     House    @relation(fields: [houseId], references: [id], onDelete: Cascade)
  url       String
  alt       String?
  order     Int      @default(0)
  createdAt DateTime @default(now())
}
```

#### `HouseSubcategory` - Existing (keep as is)
```prisma
model HouseSubcategory {
  id          String   @id @default(cuid())
  houseId     String
  house       House    @relation(fields: [houseId], references: [id], onDelete: Cascade)
  name        String
  description String?  @db.Text
  image       String?
  createdAt   DateTime @default(now())
}
```

#### `Buyer` (Buyers/Visitors) - New model
```prisma
model Buyer {
  id                    String                @id @default(cuid())
  email                 String                @unique
  name                  String?
  location              String?
  preferences           Json?                 // Saved preferences
  shortlists            Shortlist[]
  savedSearches         SavedSearch[]
  viewingHistory        ViewingHistory[]
  costCalculatorResults CostCalculatorResult[]
  createdAt             DateTime              @default(now())
  updatedAt             DateTime              @updatedAt
}
```

#### `Shortlist` - New model
```prisma
model Shortlist {
  id        String   @id @default(cuid())
  buyerId   String
  buyer     Buyer    @relation(fields: [buyerId], references: [id], onDelete: Cascade)
  houseId   String
  house     House    @relation(fields: [houseId], references: [id], onDelete: Cascade)
  notes     String?  @db.Text
  createdAt DateTime @default(now())
  
  @@unique([buyerId, houseId])
}
```

#### `SavedSearch` - New model
```prisma
model SavedSearch {
  id        String   @id @default(cuid())
  buyerId   String
  buyer     Buyer    @relation(fields: [buyerId], references: [id], onDelete: Cascade)
  name      String   // User-given name for the search
  filters   Json     // Saved filter criteria
  createdAt DateTime @default(now())
}
```

#### `ViewingHistory` - New model
```prisma
model ViewingHistory {
  id        String   @id @default(cuid())
  buyerId   String?
  buyer     Buyer?   @relation(fields: [buyerId], references: [id], onDelete: Cascade)
  houseId   String
  house     House    @relation(fields: [houseId], references: [id], onDelete: Cascade)
  sessionId String?  // For anonymous tracking
  viewedAt  DateTime @default(now())
  timeSpent Int?     // Seconds
}
```

#### `ServiceProvider` - New model
```prisma
model ServiceProvider {
  id           String   @id @default(cuid())
  name         String
  category     String   // Foundation, Transportation, Legal, etc.
  description  String?  @db.Text
  location     String?
  latitude     Float?
  longitude    Float?
  contactEmail String?
  contactPhone String?
  website      String?
  serviceAreas String[]
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}
```

#### `CostCalculatorResult` - New model
```prisma
model CostCalculatorResult {
  id                String   @id @default(cuid())
  buyerId           String?
  buyer             Buyer?   @relation(fields: [buyerId], references: [id], onDelete: Cascade)
  houseId           String
  house             House    @relation(fields: [houseId], references: [id], onDelete: Cascade)
  location          String
  basePrice         Float
  foundationCost    Float
  transportationCost Float
  installationCost  Float
  utilitiesCost     Float
  permitsCost       Float
  legalCost         Float
  sitePrepCost      Float
  otherCosts        Float
  totalCost         Float
  breakdown         Json     // Detailed breakdown
  createdAt         DateTime @default(now())
}
```

#### `User` (Admin/CMS) - Existing (keep as is)
```prisma
model User {
  id        String    @id @default(cuid())
  email     String    @unique
  name      String?
  password  String
  role      String    @default("CONTENT_MANAGER") // ADMINISTRATOR, CONTENT_MANAGER
  image     String?
  blogPosts BlogPost[]
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
}
```

#### `BlogPost` - Existing (keep as is)
```prisma
model BlogPost {
  id           String   @id @default(cuid())
  title        String
  slug         String   @unique
  content      String   @db.Text
  excerpt      String?  @db.Text
  featuredImage String?
  published    Boolean  @default(false)
  publishedAt  DateTime?
  authorId     String?
  author       User?    @relation(fields: [authorId], references: [id])
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}
```

**Note**: The existing `User` model is used for admin/CMS users. A separate `Buyer` model is defined above for visitor/buyer accounts to keep the concerns separated.

---

## API Structure

### Public APIs (No Authentication Required)
- `GET /api/houses` - List all houses (with filters)
- `GET /api/houses/[id]` - Get house details
- `GET /api/manufacturers` - List all manufacturers
- `GET /api/manufacturers/[id]` - Get manufacturer details
- `GET /api/search` - Search houses and manufacturers
- `GET /api/blog` - List blog posts
- `GET /api/blog/[slug]` - Get blog post
- `POST /api/cost-calculator` - Calculate costs (anonymous allowed)

### Authenticated User APIs
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - Login
- `GET /api/users/me` - Get current user
- `POST /api/shortlists` - Add to shortlist
- `DELETE /api/shortlists/[id]` - Remove from shortlist
- `GET /api/shortlists` - Get user's shortlist
- `POST /api/saved-searches` - Save search
- `GET /api/saved-searches` - Get saved searches
- `POST /api/cost-calculator/save` - Save calculator result

### Admin APIs (CMS)
- `GET /api/admin/users` - List admin users
- `POST /api/admin/users` - Create admin user
- `PUT /api/admin/users/[id]` - Update admin user
- `DELETE /api/admin/users/[id]` - Delete admin user
- `GET /api/admin/manufacturers` - List manufacturers
- `POST /api/admin/manufacturers` - Create manufacturer
- `PUT /api/admin/manufacturers/[id]` - Update manufacturer
- `DELETE /api/admin/manufacturers/[id]` - Delete manufacturer
- `GET /api/admin/houses` - List houses
- `POST /api/admin/houses` - Create house
- `PUT /api/admin/houses/[id]` - Update house
- `DELETE /api/admin/houses/[id]` - Delete house
- `POST /api/admin/houses/[id]/images` - Upload house images
- `GET /api/admin/service-providers` - List service providers
- `POST /api/admin/service-providers` - Create service provider
- `PUT /api/admin/service-providers/[id]` - Update service provider
- `DELETE /api/admin/service-providers/[id]` - Delete service provider
- `GET /api/admin/analytics` - Get analytics data

---

## Technical Architecture

### Frontend
- **Framework**: Next.js 15 (App Router)
- **UI Library**: Radix UI components
- **Styling**: Tailwind CSS
- **State Management**: React hooks, server components
- **Forms**: React Hook Form with Zod validation
- **Maps**: Mapbox GL JS
- **AR**: WebAR (8th Wall or similar)

### Backend
- **API Routes**: Next.js API routes
- **Database**: Prisma with PostgreSQL
- **Authentication**: NextAuth v4 (for admin and buyer users)
- **File Storage**: To be determined (Vercel Blob, AWS S3, or similar)

### Third-Party Integrations
- **Mapbox**: Maps and geocoding
- **GIS Services**: To be determined
- **AR Platform**: WebAR service
- **AI/LLM**: To be determined (for AI agent)
- **Email**: For notifications (to be determined)

---

## Development Priorities

### Phase 1: Foundation (Current → Next)
1. ✅ Basic CMS structure
2. ✅ Authentication system
3. 🔄 Enhanced house and manufacturer models (extend Prisma schema)
4. 🔄 Image gallery system
5. 🔄 Basic filtering and search
6. 🔄 Buyer/user registration system

### Phase 2: Core Features
1. Mapbox integration
2. Visitor/user registration system
3. Shortlist functionality
4. Enhanced search with natural language
5. Cost calculator
6. Service provider directory

### Phase 3: Advanced Features
1. AR viewer enhancements
2. GIS system integration
3. Loan compatibility checker
4. Analytics dashboard
5. Advanced filtering UI

### Phase 4: AI & Intelligence
1. AI agent implementation
2. Personalized recommendations
3. Smart matching algorithm
4. Process guidance system

---

## Key Design Principles

1. **Extensibility First**: Schema and CMS must support adding new fields without breaking changes
2. **User-Centric**: Anonymous browsing allowed, registration for enhanced features
3. **Transparency**: Show real costs, not just base prices
4. **Visualization**: AR, maps, and rich media for better understanding
5. **Performance**: Fast loading, optimized images, efficient queries
6. **Mobile-First**: Responsive design, mobile AR support
7. **Accessibility**: WCAG compliance, keyboard navigation, screen reader support

---

## Notes for Development

- Always check this document when starting new features
- When adding new fields to houses/manufacturers, use the `metadata` JSON field for extensibility
- Keep user experience smooth - don't require registration unless necessary
- Focus on transparency in pricing and costs
- Ensure all features work on mobile devices
- Test AR features on actual mobile devices
- Consider SEO for all public pages
- Maintain backward compatibility when possible

---

## Questions & Decisions Needed

1. **File Storage**: Where to store images and AR models? (Vercel Blob, AWS S3, Cloudinary?)
2. **GIS Provider**: Which GIS service to use? (Google Maps Platform, ArcGIS, Mapbox?)
3. **AR Platform**: Which WebAR solution? (8th Wall, AR.js, custom?)
4. **Email Service**: For notifications and password resets? (SendGrid, Resend, AWS SES?)
5. **Analytics**: Which analytics platform? (Vercel Analytics, Google Analytics, custom?)

---

**Last Updated**: 2024-12-XX

