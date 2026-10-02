# 🛒 NovaMart — Cloud-Native Distributed Microservices & AI Platform

[![Java 17](https://img.shields.io/badge/Java-17%2B-orange?logo=openjdk)](https://openjdk.org/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.3.4-brightgreen?logo=springboot)](https://spring.io/projects/spring-boot)
[![Spring Cloud](https://img.shields.io/badge/Spring_Cloud-2023.0.3-green?logo=spring)](https://spring.io/projects/spring-cloud)
[![Python](https://img.shields.io/badge/Python-3.10%2B-blue?logo=python)](https://www.python.org/)
[![Scikit-Learn](https://img.shields.io/badge/Scikit--Learn-1.4%2B-F7931E?logo=scikitlearn)](https://scikit-learn.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)

**NovaMart** is an enterprise-grade, polyglot e-commerce platform built on a **distributed microservices architecture**. It features **5 Java Spring Boot microservices** coordinating through **Netflix Eureka Service Discovery** and **Spring Cloud API Gateway**, a dedicated **Python Scikit-Learn Machine Learning microservice** for real-time recommendations and NLP sentiment analysis, and a modern **React (Vite + Tailwind CSS)** storefront and administrative portal.

---

## 📑 Table of Contents
- [System Architecture](#-system-architecture)
- [Microservices & Port Allocation](#-microservices--port-allocation)
- [Core Business Capabilities](#-core-business-capabilities)
- [Machine Learning Engine (Scikit-Learn)](#-machine-learning-engine-scikit-learn)
- [Project Directory Structure](#-project-directory-structure)
- [API Reference](#-api-reference)
- [Quick Start Guide](#-quick-start-guide)
- [Demo Credentials](#-demo-credentials)
- [Code Quality & Debugging Guidelines](#-code-quality--debugging-guidelines)

---

## 🏛️ System Architecture

```mermaid
flowchart TD
    Client["💻 React Storefront & Admin Portal\n(Port 5173)"] -->|HTTP / REST| Gateway["🚪 Spring Cloud API Gateway\n(Port 8080)"]

    subgraph "Service Discovery & Governance"
        Eureka["📡 Netflix Eureka Discovery Server\n(Port 8761)"]
        Gateway -.->|Heartbeat / Registry| Eureka
    end

    subgraph "Spring Boot Core Services"
        Gateway -->|/api/auth/**| UserSvc["👤 User & Auth Service\n(Port 8081)\n• JWT RS256/HS256\n• Role Authorization"]
        Gateway -->|/api/products/**\n/api/admin/products/**| ProdSvc["📦 Product & Inventory Service\n(Port 8082)\n• Catalog & Categories\n• Thread-Safe Stock Stepper"]
        Gateway -->|/api/orders/**\n/api/admin/orders/**| OrderSvc["💳 Order & Payment Service\n(Port 8083)\n• Digital Invoice Generation\n• Cancellations & Returns"]

        UserSvc -.->|Register| Eureka
        ProdSvc -.->|Register| Eureka
        OrderSvc -.->|Register| Eureka

        OrderSvc -->|OpenFeign RPC\n(Stock Deduction & Restock Rollback)| ProdSvc
    end

    subgraph "Python Data Science Microservice"
        Gateway -->|/api/ai/**| AISvc["🤖 Scikit-Learn AI Microservice\n(Port 8084)\n• TF-IDF Semantic Search\n• Cosine Similarity Recommendations\n• Naive Bayes Sentiment Analysis"]
        AISvc -->|Catalog Ingestion| ProdSvc
    end
```

---

## 🔌 Microservices & Port Allocation

| Service Name | Technology Stack | Port | Key Responsibilities |
|---|---|---|---|
| **`discovery-service`** | Spring Cloud Netflix Eureka | `8761` | Central service registry, instance health monitoring, and dynamic routing lookup. |
| **`gateway-service`** | Spring Cloud Gateway | `8080` | Unified platform reverse proxy, path-based routing, JWT bearer forwarding, and global CORS policies. |
| **`user-service`** | Spring Boot 3, Spring Security, JWT, JPA | `8081` | User registration, credential authentication, BCrypt hashing, and stateless JWT token issuance. |
| **`product-service`** | Spring Boot 3, Spring Data JPA, H2 Database | `8082` | Product catalog, multi-category taxonomy, admin stock stepper, and atomic inventory mutations. |
| **`order-service`** | Spring Boot 3, OpenFeign, JPA, H2 Database | `8083` | Order processing, payment simulation, digital receipts, pre-shipment cancellations, and post-delivery refunds. |
| **`ai-service`** | Python 3, FastAPI, Scikit-Learn, Pandas | `8084` | TF-IDF semantic query matching, sub-45ms cosine similarity product recommendations, and NLP review sentiment. |
| **`frontend`** | React 18, Vite, Tailwind CSS, Lucide Icons | `5173` | Responsive customer storefront, predictive search dropdown, and executive administrative dashboard. |

---

## 💡 Core Business Capabilities

### 1. Robust Distributed Order Lifecycle & Automated Restock Rollback
* **Customer Pre-Shipping Cancellation**: Customers can cancel orders in `PLACED`, `CONFIRMED`, or `PROCESSING` states. The system automatically marks payment as `REFUNDED` and invokes **OpenFeign RPC** to replenish inventory units in `product-service`.
* **Post-Delivery Return & Refund**: Delivered orders (`DELIVERED`) can initiate a return request (`RETURN_REQUESTED`). Administrators review and approve the return in the Admin Dashboard, which executes payment payout and automatically restores warehouse stock.
* **Race-Condition-Free Stock Operations**: All stock deduction and increment operations use synchronized locks and transactional isolation to prevent overselling across concurrent checkouts.

### 2. Live Predictive Search & Synonym Matching
* **Interactive Navbar Dropdown**: Typing any query triggers a debounced live search query to the Scikit-Learn microservice (`/api/ai/search`).
* **Semantic Expansion**: Recognizes e-commerce intent and synonyms (e.g., searching `"laptop"` or `"notebook"` instantly matches the *"UltraBook Zenith M3 OLED"* with similarity percentages).
* **Trending Chips**: Quick 1-click discovery tags for popular categories when the search bar is focused.

### 3. Administrator Operations Control Center
* **Inline Stock Stepper**: Increment (`+1`), decrement (`-1`), quick restock (`+10`), or direct numeric input with automatic live persistence.
* **Order Status Management**: Interactive dropdown allowing administrators to update order status (`PLACED` → `CONFIRMED` → `PROCESSING` → `SHIPPED` → `DELIVERED`).
* **Instant Digital Invoices**: Printable official tax receipt with unique order numbers (`NM-YYYYMMDD-XXXX`), tax breakdown, recipient details, and line item receipts.

---

## 🧠 Machine Learning Engine (Scikit-Learn)

All artificial intelligence and data science workloads are decoupled into `backend/ai-service`, strictly following Scikit-Learn best practices:

```
backend/ai-service/
├── main.py                     # FastAPI application & REST routing (/api/ai/**)
├── requirements.txt            # Python dependencies (scikit-learn, pandas, numpy, uvicorn)
└── models/
    ├── recommender.py          # TF-IDF Vectorizer + Cosine Similarity recommendation engine
    ├── sentiment.py            # Scikit-Learn Pipeline (TfidfVectorizer + MultinomialNB)
    └── category_predictor.py   # Logistic Regression catalog classifier
```

### 1. Content-Based Recommendation Engine (`models/recommender.py`)
- **Mathematical Principle**: Combines product titles, categories, and descriptions into text bags. Applies `TfidfVectorizer(ngram_range=(1, 2), stop_words='english')` to construct a sparse term-document matrix.
- **Similarity Scoring**: Computes pairwise Cosine Similarity:
  $$\text{Similarity}(A, B) = \frac{A \cdot B}{\|A\| \|B\|}$$
- **Latency Benchmark**: Sub-45ms inference time, serving similarity percentages directly in the customer UI.

### 2. Customer Review Sentiment Analyzer (`models/sentiment.py`)
- **Pipeline Architecture**: `Pipeline([('tfidf', TfidfVectorizer()), ('classifier', MultinomialNB(alpha=0.5))])`
- **Output**: Categorizes feedback into `POSITIVE`, `NEUTRAL`, or `NEGATIVE` along with calibrated prediction confidence probabilities.

---

## 📂 Project Directory Structure

```
novamart/
├── README.md                           # Master platform documentation
├── .gitignore                          # Comprehensive multi-language ignore rules
├── backend/
│   ├── pom.xml                         # Maven multi-module parent POM
│   ├── start-all.ps1                   # Master automated microservices startup script
│   ├── stop-all.ps1                    # Master graceful shutdown script
│   ├── common-lib/                     # Shared DTOs, Enums, ApiResponse, & JwtUtils
│   ├── discovery-service/              # Eureka Service Registry (Port 8761)
│   ├── gateway-service/                # Spring Cloud API Gateway (Port 8080)
│   ├── user-service/                   # Authentication & User Management (Port 8081)
│   ├── product-service/                # Catalog, Inventory, & Admin Products (Port 8082)
│   ├── order-service/                  # Orders, Payments, Refunds, & Feign Client (Port 8083)
│   └── ai-service/                     # Python Scikit-Learn ML Microservice (Port 8084)
│       ├── main.py
│       ├── requirements.txt
│       └── models/
│           ├── recommender.py
│           ├── sentiment.py
│           └── category_predictor.py
└── frontend/                           # React 18 + Vite + Tailwind CSS Storefront
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── App.jsx                     # Top-level dynamic viewport & layout
        ├── api/api.js                  # Axios client configured for Gateway routes
        ├── components/
        │   ├── common/Navbar.jsx       # Header with live AI predictive search dropdown
        │   └── customer/CartDrawer.jsx # Slide-out shopping bag
        └── pages/
            ├── admin/AdminDashboard.jsx     # Executive inventory & refund management
            ├── customer/HomePage.jsx        # Landing spotlight & department grid
            ├── customer/ProductListingPage.jsx # Multi-faceted filtering & search
            ├── customer/ProductDetailPage.jsx  # Specifications & Scikit-Learn recommendations
            └── customer/MyOrdersPage.jsx       # Order tracking, cancellations, returns & receipts
```

---

## 📡 API Reference

All requests pass through the Spring Cloud API Gateway at `http://localhost:8080`.

### 1. Authentication Service (`/api/auth/**`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|:---:|
| `POST` | `/api/auth/register` | Register new customer account | No |
| `POST` | `/api/auth/login` | Authenticate credentials and receive Bearer JWT | No |
| `GET` | `/api/auth/me` | Fetch profile details of authenticated user | Yes |

### 2. Product Catalog Service (`/api/products/**` & `/api/admin/products/**`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|:---:|
| `GET` | `/api/products` | Browse catalog with query, category, and price bounds | No |
| `GET` | `/api/products/{id}` | Get detailed product specifications | No |
| `GET` | `/api/products/featured` | Spotlight items showcased on home banner | No |
| `POST` | `/api/admin/products` | Admin: Create new product | Admin |
| `PUT` | `/api/admin/products/{id}` | Admin: Update product details & specifications | Admin |
| `PATCH` | `/api/admin/products/{id}/stock` | Admin: Rapid inventory update (`{"quantity": N}` or `{"delta": N}`) | Admin |
| `DELETE` | `/api/admin/products/{id}` | Admin: Delete product from catalog | Admin |

### 3. Order Processing Service (`/api/orders/**` & `/api/admin/orders/**`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|:---:|
| `POST` | `/api/orders` | Place order, deduct inventory via Feign, settle payment | Optional |
| `GET` | `/api/orders/my-orders` | Retrieve authenticated customer purchase history | Yes |
| `GET` | `/api/orders/{orderNumber}/receipt` | Fetch verified digital tax invoice | No |
| `POST` | `/api/orders/{id}/cancel` | Cancel order before shipment & restore inventory | Optional |
| `POST` | `/api/orders/{id}/return` | Submit Return & Refund request for delivered order | Optional |
| `GET` | `/api/admin/orders` | Admin: Fetch all platform orders | Admin |
| `PATCH` | `/api/admin/orders/{id}/status` | Admin: Update status (`DELIVERED`, `SHIPPED`, etc.) | Admin |
| `POST` | `/api/admin/orders/{id}/refund` | Admin: Approve return and execute refund payout | Admin |

### 4. Scikit-Learn AI Service (`/api/ai/**`)
| Method | Endpoint | Description | Algorithm |
|---|---|---|---|
| `GET` | `/api/ai/search?q={query}` | Predictive query matching & recommendation | TF-IDF + Cosine Similarity |
| `GET` | `/api/ai/recommendations/{id}` | Related products based on item specifications | Cosine Similarity Matrix |
| `POST` | `/api/ai/analyze-sentiment` | Review text sentiment classification | Multinomial Naive Bayes |
| `POST` | `/api/ai/predict-category` | Automated product department prediction | Logistic Regression |

---

## 🚀 Quick Start Guide

### System Prerequisites
* **Java**: JDK 17 or higher
* **Maven**: 3.8+ (or use included `./mvnw.cmd` / `./mvnw`)
* **Python**: 3.10+ (with `pip`)
* **Node.js**: 18+ and `npm`

---

### Method A: One-Click Automated Startup (Windows PowerShell)

1. Open PowerShell in `backend/`:
   ```powershell
   ./start-all.ps1
   ```
   *This starts Eureka (8761), User (8081), Product (8082), Order (8083), AI (8084), and Gateway (8080) in the required sequence.*

2. Start the Frontend in `frontend/`:
   ```bash
   npm install
   npm run dev
   ```

3. Open **`http://localhost:5173`** in your browser.

4. To stop all backend services cleanly at any time:
   ```powershell
   ./stop-all.ps1
   ```

---

### Method B: Manual Startup (Any OS / Linux / macOS)

<details>
<summary>Click to view step-by-step commands</summary>

#### Step 1: Build Java Modules
```bash
cd backend
./mvnw clean package -DskipTests
```

#### Step 2: Start Discovery Server (Port 8761)
```bash
java -jar discovery-service/target/discovery-service-1.0.0.jar
```
*(Wait ~8 seconds for Eureka to initialize)*

#### Step 3: Start Core Services
```bash
# Terminal 1: User Service (Port 8081)
java -jar user-service/target/user-service-1.0.0.jar

# Terminal 2: Product Service (Port 8082)
java -jar product-service/target/product-service-1.0.0.jar

# Terminal 3: Order Service (Port 8083)
java -jar order-service/target/order-service-1.0.0.jar
```

#### Step 4: Start Python AI Microservice (Port 8084)
```bash
cd backend/ai-service
pip install -r requirements.txt
python main.py
```

#### Step 5: Start API Gateway (Port 8080)
```bash
java -jar gateway-service/target/gateway-service-1.0.0.jar
```

#### Step 6: Start Frontend (Port 5173)
```bash
cd frontend
npm install
npm run dev
```

</details>

---

## 👥 Demo Credentials

The platform initializes with pre-seeded accounts:

| Role | Email | Password | Access Level |
|---|---|---|---|
| **Customer** | `customer@novamart.com` | `Customer@123` | Storefront browsing, cart, order placement, returns, and digital receipts |
| **Administrator** | `admin@novamart.com` | `Admin@123` | High-privilege Operations Control, live stock stepper, refunds approval |

---

## 🛠️ Code Quality & Debugging Guidelines

- **Strict Separation of Concerns**: Java Spring Boot strictly owns core transactional business logic, relational entities, authentication, and inter-service Feign contracts; Python is exclusively dedicated to Scikit-Learn data science algorithms.
- **Zero Monolithic Dependencies**: Microservices communicate strictly over network boundaries via HTTP/REST and OpenFeign RPC.
- **Comprehensive Inline Documentation**: Every controller, service method, and Python model includes student- and engineer-friendly comments outlining debugging strategies, architectural context, and error recovery flows.
- **Fail-Safe Fallbacks**: The AI microservice features self-healing fallback catalogs to ensure zero storefront downtime even during upstream restarts.

---

## 📄 License
This project is open-source under the [MIT License](LICENSE).
