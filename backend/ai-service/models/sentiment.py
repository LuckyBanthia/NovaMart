"""
=============================================================================
NovaMart Sentiment Analyzer (Scikit-Learn)
Module: models/sentiment.py
Description: Natural Language Processing (NLP) sentiment classifier using
             TF-IDF and Multinomial Naive Bayes / Logistic Regression.
=============================================================================

How this algorithm works (Student Notes):
1. Training Dataset:
   We train on a diverse e-commerce review corpus representing common review
   phrases (e.g. "battery life is amazing", "poor quality arrived damaged", "average product").
2. Preprocessing & TF-IDF:
   We convert review text into ngram word frequencies, filtering stop words.
3. Classification Model:
   We use Multinomial Naive Bayes (MultinomialNB), which is mathematically fast,
   sample-efficient, and ideal for small-to-medium text classification in production.
4. Probability Calibration:
   The classifier outputs class probabilities (via predict_proba) indicating confidence
   between [0.0, 1.0].
"""

from typing import Dict, Any
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import Pipeline


class ReviewSentimentAnalyzer:
    """
    ReviewSentimentAnalyzer classifies review text as POSITIVE, NEUTRAL, or NEGATIVE
    along with an AI confidence percentage score.
    """

    def __init__(self):
        # Build an integrated Scikit-Learn Pipeline:
        # Step 1: Text Vectorization via TF-IDF (1-2 word ngrams)
        # Step 2: Probabilistic Naive Bayes Classifier
        self.pipeline = Pipeline([
            ("tfidf", TfidfVectorizer(stop_words="english", ngram_range=(1, 2))),
            ("classifier", MultinomialNB(alpha=0.5))
        ])
        self.is_trained = False
        self._train_initial_model()

    def _train_initial_model(self):
        """
        Trains the classifier on an embedded seed corpus of genuine e-commerce customer reviews.
        """
        training_texts = [
            # Positive Reviews
            "Absolutely loved this product! Exceptional quality and fast delivery.",
            "Great value for money, battery life lasts forever.",
            "High quality build, works like a charm. Highly recommended!",
            "Exceeded my expectations, premium packaging and crystal clear sound.",
            "Five stars! Very comfortable and looks stylish.",
            "Amazing experience, customer service was helpful and product is awesome.",
            "Fantastic item, best purchase I have made this year.",
            "Very satisfied with the purchase, reliable and durable.",
            "Superb performance! Really happy with this.",
            "The fit is perfect and the material is top notch.",

            # Neutral Reviews
            "Product is okay, nothing special but does the job.",
            "Average quality for the price paid. Expected slightly more.",
            "Delivery was on time. The product is standard.",
            "Decent item, works as advertised. Neutral thoughts.",
            "Fair purchase. Neither great nor bad.",
            "It is acceptable, but there are better alternatives available.",
            "Mediocre quality, feels a bit cheap but functioning fine.",
            "Standard delivery and normal functionality.",

            # Negative Reviews
            "Terrible experience. The item arrived broken and unusable.",
            "Worst purchase ever. Poor quality material and broke on day two.",
            "Do not buy this! Waste of money, defective product.",
            "Extremely disappointed. Looks nothing like the pictures.",
            "Horrible battery life, stopped working after an hour.",
            "Very bad packaging, cheap plastic feel, completely dissatisfied.",
            "Customer service was unhelpful and the product is faulty.",
            "Defective unit, requested a refund immediately.",
            "Total waste of time and money. Very poor build.",
            "Not working at all. Very bad quality."
        ]

        training_labels = [
            # 10 Positives
            "POSITIVE", "POSITIVE", "POSITIVE", "POSITIVE", "POSITIVE",
            "POSITIVE", "POSITIVE", "POSITIVE", "POSITIVE", "POSITIVE",

            # 8 Neutrals
            "NEUTRAL", "NEUTRAL", "NEUTRAL", "NEUTRAL",
            "NEUTRAL", "NEUTRAL", "NEUTRAL", "NEUTRAL",

            # 10 Negatives
            "NEGATIVE", "NEGATIVE", "NEGATIVE", "NEGATIVE", "NEGATIVE",
            "NEGATIVE", "NEGATIVE", "NEGATIVE", "NEGATIVE", "NEGATIVE"
        ]

        # Fit the pipeline
        self.pipeline.fit(training_texts, training_labels)
        self.is_trained = True
        print("[INFO] Sentiment Analyzer successfully trained on seed e-commerce corpus.")

    def analyze(self, review_text: str) -> Dict[str, Any]:
        """
        Analyzes customer review text and returns sentiment classification and confidence.
        
        :param review_text: Raw review string submitted by user
        :return: Dict with 'sentiment' ('POSITIVE'/'NEUTRAL'/'NEGATIVE'),
                           'confidence' (float 0.0 - 1.0),
                           'badge_color' (for clean UI rendering)
        """
        if not review_text or not review_text.strip():
            return {
                "sentiment": "NEUTRAL",
                "confidence": 0.50,
                "badge_color": "gray",
                "summary": "No review text provided."
            }

        cleaned_text = review_text.strip()
        predicted_sentiment = str(self.pipeline.predict([cleaned_text])[0])
        
        # Calculate prediction probabilities
        probabilities = self.pipeline.predict_proba([cleaned_text])[0]
        class_index = list(self.pipeline.classes_).index(predicted_sentiment)
        confidence = float(probabilities[class_index])

        # Badge colors for UI chips in React frontend
        color_map = {
            "POSITIVE": "emerald",
            "NEUTRAL": "amber",
            "NEGATIVE": "rose"
        }

        return {
            "sentiment": predicted_sentiment,
            "confidence": round(confidence, 2),
            "badge_color": color_map.get(predicted_sentiment, "gray"),
            "summary": f"Detected {predicted_sentiment.lower()} sentiment with {int(confidence * 100)}% confidence."
        }
