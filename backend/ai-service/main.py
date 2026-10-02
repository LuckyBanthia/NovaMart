"""
=============================================================================
NovaMart AI Microservice
Port: 8084
Technology: Python, FastAPI, Scikit-Learn (TF-IDF, Cosine Similarity, Naive Bayes)
=============================================================================

This microservice provides intelligent AI/ML capabilities for NovaMart:
1. Content-Based Product Recommendations (Scikit-Learn TF-IDF + Cosine Similarity)
2. Review Sentiment Analysis (Scikit-Learn Multinomial Naive Bayes)
3. Automated Product Categorization (Scikit-Learn Logistic Regression)

Architecture Note:
- Core business logic (Auth, Catalog, Orders, Payments) is in Java Spring Boot.
- This Python service is dedicated exclusively to Scikit-Learn AI/ML workloads.
- Accessible directly on port 8084 or through the Spring Cloud API Gateway (port 8080)
  at the path prefix: /api/ai/**
=============================================================================
"""

import logging
from typing import List, Dict, Any, Optional
import requests
from fastapi import FastAPI, Query, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import uvicorn

# Local Scikit-Learn Model Imports
from models.recommender import ContentBasedRecommender
from models.sentiment import ReviewSentimentAnalyzer
from models.category_predictor import CategoryPredictor

# Configure structured logging for debugging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] (NovaMart AI) %(message)s"
)
logger = logging.getLogger(__name__)

# Initialize FastAPI application
app = FastAPI(
    title="NovaMart AI Microservice",
    description="Dedicated Scikit-Learn Machine Learning Service for Product Recommendations & Sentiment Analysis",
    version="1.0.0"
)

# Configure Cross-Origin Resource Sharing (CORS)
# Allows requests from React Frontend (5173) and API Gateway (8080)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:8080", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Instantiate Machine Learning Models
recommender = ContentBasedRecommender()
sentiment_analyzer = ReviewSentimentAnalyzer()
category_predictor = CategoryPredictor()

# Default seed catalog (guarantees recommendations work even before Product-Service database is synced)
FALLBACK_CATALOG = [
    {
        "id": 1,
        "name": "Nova Pro Wireless Headphones",
        "description": "Premium noise-cancelling over-ear headphones with 40-hour battery life and spatial audio.",
        "category": "Electronics",
        "price": 199.99,
        "rating": 4.8,
        "imageUrl": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80"
    },
    {
        "id": 2,
        "name": "Ultra-Slim 4K OLED Smart TV 55\"",
        "description": "Stunning 4K OLED HDR display with AI-enhanced processor and Dolby Atmos sound.",
        "category": "Electronics",
        "price": 1299.99,
        "rating": 4.9,
        "imageUrl": "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600&auto=format&fit=crop&q=80"
    },
    {
        "id": 3,
        "name": "Ergonomic Mechanical Keyboard",
        "description": "Custom mechanical keyboard with hot-swappable switches, RGB backlighting, and USB-C.",
        "category": "Electronics",
        "price": 129.99,
        "rating": 4.7,
        "imageUrl": "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80"
    },
    {
        "id": 4,
        "name": "Classic Minimalist Chrono Watch",
        "description": "Sleek stainless steel timepiece with sapphire crystal glass and genuine Italian leather strap.",
        "category": "Fashion",
        "price": 189.99,
        "rating": 4.6,
        "imageUrl": "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=600&auto=format&fit=crop&q=80"
    },
    {
        "id": 5,
        "name": "Urban Waterproof Commuter Backpack",
        "description": "Ergonomic laptop backpack with weatherproof fabric, anti-theft zipper, and USB charging port.",
        "category": "Fashion",
        "price": 79.99,
        "rating": 4.7,
        "imageUrl": "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80"
    },
    {
        "id": 6,
        "name": "Smart Touch Air Fryer 5.8 Qt",
        "description": "Rapid air circulation technology with digital touchscreen presets for healthy oil-free cooking.",
        "category": "Home & Kitchen",
        "price": 119.99,
        "rating": 4.8,
        "imageUrl": "https://images.unsplash.com/photo-1585515320310-259814833e62?w=600&auto=format&fit=crop&q=80"
    },
    {
        "id": 7,
        "name": "Barista Espresso Machine with Steam Wand",
        "description": "Commercial-grade 15-bar Italian pump espresso maker with precision milk frother.",
        "category": "Home & Kitchen",
        "price": 349.99,
        "rating": 4.9,
        "imageUrl": "https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?w=600&auto=format&fit=crop&q=80"
    },
    {
        "id": 8,
        "name": "Clean Architecture & Design Patterns",
        "description": "Mastering software craftsmanship, scalable microservices architecture, and clean code principles.",
        "category": "Books",
        "price": 44.99,
        "rating": 4.9,
        "imageUrl": "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80"
    },
    {
        "id": 9,
        "name": "Adjustable Cast Iron Dumbbell Set 50 lbs",
        "description": "Heavy-duty dumbbell pair with quick-adjust dial mechanism and textured ergonomic grip.",
        "category": "Fitness",
        "price": 249.99,
        "rating": 4.8,
        "imageUrl": "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=600&auto=format&fit=crop&q=80"
    }
]


# ==============================================================================
# Pydantic Request / Response DTO Schemas
# ==============================================================================

class SentimentRequest(BaseModel):
    """Payload for submitting a review text to be evaluated by Scikit-Learn"""
    text: str = Field(..., min_length=2, description="Customer review text content", example="Great quality and fast shipping!")


class SentimentResponse(BaseModel):
    """Response containing classification result and confidence score"""
    sentiment: str = Field(..., description="Classification: POSITIVE, NEUTRAL, or NEGATIVE")
    confidence: float = Field(..., description="Prediction probability confidence between 0.0 and 1.0")
    badge_color: str = Field(..., description="Recommended UI color token (emerald, amber, rose)")
    summary: str


class CategoryPredictRequest(BaseModel):
    """Payload for predicting product category"""
    title: str = Field(..., description="Product title/name")
    description: str = Field("", description="Optional product description")


class HealthResponse(BaseModel):
    status: str
    service: str
    framework: str
    version: str
    items_indexed: int


# ==============================================================================
# Startup Event: Train / Initialize Models
# ==============================================================================

@app.on_event("startup")
def on_startup():
    """
    Initializes and trains the Scikit-Learn recommender engine upon server launch.
    Attempts to fetch live catalog from Product Service (port 8082).
    If Product Service is not yet ready, falls back to the default catalog.
    """
    logger.info("Initializing NovaMart AI Microservice (Port 8084)...")
    try:
        # Attempt to reach Spring Boot Product Service
        resp = requests.get("http://localhost:8082/api/products", timeout=3.0)
        if resp.status_code == 200:
            res_json = resp.json()
            products_data = res_json.get("data") if isinstance(res_json, dict) else res_json
            if isinstance(products_data, list) and len(products_data) > 0:
                recommender.fit(products_data)
                logger.info(f"Loaded {len(products_data)} products directly from Product Service (Port 8082).")
                return
    except Exception as e:
        logger.info(f"Product Service not reachable at startup ({e}). Training on fallback catalog.")

    # Fallback to local catalog
    recommender.fit(FALLBACK_CATALOG)


# ==============================================================================
# API Endpoints
# ==============================================================================

@app.get("/api/ai/health", response_model=HealthResponse, tags=["Health"])
def health_check():
    """
    Microservice health check endpoint.
    Used by Gateway and DevOps monitoring.
    """
    count = len(recommender.products_df) if recommender.products_df is not None else 0
    return {
        "status": "UP",
        "service": "ai-service",
        "framework": "scikit-learn",
        "version": "1.0.0",
        "items_indexed": count
    }


@app.get("/api/ai/recommendations/{product_id}", tags=["Recommendations"])
def get_recommendations_by_path(product_id: int, limit: int = Query(4, ge=1, le=12)):
    """
    Returns AI-recommended products related to the target product ID.
    Uses TF-IDF feature extraction and Scikit-Learn Cosine Similarity.
    """
    recommendations = recommender.recommend(product_id=product_id, top_n=limit)
    return recommendations


@app.get("/api/ai/recommendations", tags=["Recommendations"])
def get_recommendations_by_query(productId: Optional[int] = None, limit: int = Query(4, ge=1, le=12)):
    """
    Query parameter alias for recommendations (supports ?productId=1).
    """
    if productId is None:
        # Fallback to top items
        return FALLBACK_CATALOG[:limit]
    return recommender.recommend(product_id=productId, top_n=limit)


@app.post("/api/ai/analyze-sentiment", response_model=SentimentResponse, tags=["NLP Sentiment"])
def analyze_sentiment(payload: SentimentRequest):
    """
    Evaluates product review text and returns POSITIVE / NEUTRAL / NEGATIVE sentiment
    computed via Scikit-Learn Multinomial Naive Bayes.
    """
    result = sentiment_analyzer.analyze(payload.text)
    return result


@app.post("/api/ai/predict-category", tags=["Catalog Intelligence"])
def predict_category(payload: CategoryPredictRequest):
    """
    Predicts product category using Scikit-Learn Logistic Regression.
    """
    result = category_predictor.predict(payload.title, payload.description)
    return result


@app.get("/api/ai/search", tags=["Recommendations"])
def search_ai(q: str = Query(..., min_length=1, description="User search query"), limit: int = Query(5, ge=1, le=12)):
    """
    Intelligent Search & Recommendation:
    Calculates Scikit-Learn TF-IDF vector similarity between user's search text
    and all catalog products. Returns ranked matching items with similarity scores.
    """
    results = recommender.search_recommend(query=q, top_n=limit)
    return results


@app.post("/api/ai/sync-catalog", tags=["Maintenance"])
def sync_catalog():
    """
    Triggers a live re-indexing of the recommender model from the Spring Boot Product Service.
    """
    try:
        resp = requests.get("http://localhost:8082/api/products", timeout=5.0)
        if resp.status_code == 200:
            res_json = resp.json()
            products_data = res_json.get("data") if isinstance(res_json, dict) else res_json
            if isinstance(products_data, list) and len(products_data) > 0:
                recommender.fit(products_data)
                return {"message": f"Successfully re-indexed {len(products_data)} products.", "count": len(products_data)}
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Failed to fetch products from Product Service (Port 8082)"
        )
    except Exception as e:
        logger.error(f"Catalog sync failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Catalog sync error: {str(e)}"
        )


# ==============================================================================
# Direct Execution Entry Point
# ==============================================================================
if __name__ == "__main__":
    # Runs the microservice on standard port 8084
    logger.info("Starting NovaMart AI Service on port 8084...")
    uvicorn.run("main:app", host="0.0.0.0", port=8084, reload=False)
