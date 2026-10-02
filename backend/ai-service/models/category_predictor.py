"""
=============================================================================
NovaMart Category Predictor (Scikit-Learn)
Module: models/category_predictor.py
Description: Automated categorization of products based on title & description
             using TF-IDF Vectorization and Logistic Regression.
=============================================================================

How this algorithm works (Student Notes):
1. Input: Product Title + Description (e.g., "Wireless noise cancelling headphones")
2. Feature Representation:
   TF-IDF converts the text into a feature vector weighted by word significance.
3. Classification Model:
   Multinomial Logistic Regression maps the text vector across categorical targets
   (Electronics, Fashion, Home & Kitchen, Books, Fitness).
4. Practical Application:
   Helps sellers and admins auto-tag products during catalog creation!
"""

from typing import Dict, Any
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline


class CategoryPredictor:
    """
    Predicts product category from descriptive text.
    """

    def __init__(self):
        self.pipeline = Pipeline([
            ("tfidf", TfidfVectorizer(stop_words="english", ngram_range=(1, 2))),
            ("classifier", LogisticRegression(max_iter=200, C=1.0))
        ])
        self.is_trained = False
        self._train_initial_model()

    def _train_initial_model(self):
        """
        Trains on exemplary products across 5 core e-commerce categories.
        """
        texts = [
            # Electronics
            "Wireless Bluetooth noise cancelling over ear headphones 40hr battery",
            "4K Ultra HD smart LED TV Dolby Atmos HDR10 display",
            "Mechanical gaming keyboard RGB backlit mechanical switches USB-C",
            "Fast wireless charger Qi certified pad for smartphones",
            "Apple iPad Pro 11-inch M2 chip Liquid Retina display 128GB",

            # Fashion & Apparel
            "Men's slim fit cotton casual button down oxford shirt",
            "Women's high waist stretch skinny denim jeans dark blue",
            "Waterproof lightweight running shoes breathable athletic sneakers",
            "Classic leather bi-fold wallet for men with RFID blocking",
            "Winter warm fleece jacket full zip outdoor coat",

            # Home & Kitchen
            "Stainless steel non-stick cooking pot saucepan with glass lid",
            "Memory foam cooling pillow ergonomic neck support for sleeping",
            "Smart air fryer digital touchscreen 8 presets oil-less cooker",
            "Ceramic coffee mug set 4-pack microwave dishwasher safe",
            "Robot vacuum cleaner automatic self-charging strong suction",

            # Books & Stationery
            "Clean Code A Handbook of Agile Software Craftsmanship Robert Martin",
            "Designing Data-Intensive Applications The Big Ideas Martin Kleppmann",
            "Hardcover bullet journal dotted grid notebook with pen holder",
            "Atomic Habits An Easy and Proven Way to Build Good Habits James Clear",
            "Fountain pen fine nib smooth writing ink calligraphy pen",

            # Fitness & Sports
            "Adjustable dumbbell set for home gym strength training weight lifting",
            "Extra thick yoga mat non-slip workout exercise fitness mat",
            "Stainless steel vacuum insulated water bottle 32oz leak proof",
            "Resistance bands set workout bands for physical therapy stretching",
            "Speed jump rope adjustable steel wire skipping rope for cardio"
        ]

        labels = [
            "Electronics", "Electronics", "Electronics", "Electronics", "Electronics",
            "Fashion", "Fashion", "Fashion", "Fashion", "Fashion",
            "Home & Kitchen", "Home & Kitchen", "Home & Kitchen", "Home & Kitchen", "Home & Kitchen",
            "Books", "Books", "Books", "Books", "Books",
            "Fitness", "Fitness", "Fitness", "Fitness", "Fitness"
        ]

        self.pipeline.fit(texts, labels)
        self.is_trained = True
        print("[INFO] Category Predictor successfully trained on 5 categories.")

    def predict(self, title: str, description: str = "") -> Dict[str, Any]:
        """
        Predicts the product category given title and description.
        """
        combined = f"{title} {description}".strip()
        if not combined:
            return {"category": "General", "confidence": 0.0}

        predicted = str(self.pipeline.predict([combined])[0])
        probs = self.pipeline.predict_proba([combined])[0]
        idx = list(self.pipeline.classes_).index(predicted)
        confidence = float(probs[idx])

        return {
            "predicted_category": predicted,
            "confidence": round(confidence, 2)
        }
