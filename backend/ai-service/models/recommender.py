"""
=============================================================================
NovaMart Recommendation Engine (Scikit-Learn)
Module: models/recommender.py
Description: Content-based product recommendation using TF-IDF (Term Frequency-
             Inverse Document Frequency) and Cosine Similarity.
=============================================================================

How this algorithm works (Student Notes):
1. Feature Extraction:
   We combine key textual features of each product (Title + Category + Description).
2. Vectorization (TfidfVectorizer):
   Scikit-Learn converts the text documents into numerical feature vectors.
   Words that are unique and descriptive get higher weights; common English stop
   words ("the", "is", "at") are filtered out automatically.
3. Cosine Similarity:
   We compute the cosine of the angle between two product vectors in multidimensional
   space:
       similarity = (A . B) / (||A|| * ||B||)
   A similarity of 1.0 means identical content, while 0.0 means completely unrelated.
4. Ranking:
   For a given target product, we rank all other products by their cosine similarity score
   in descending order and return the top N recommendations.
"""

from typing import List, Dict, Any, Optional
import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


class ContentBasedRecommender:
    """
    ContentBasedRecommender trains a TF-IDF matrix over product metadata
    and calculates pairwise similarity scores to suggest relevant items.
    """

    def __init__(self):
        # We use standard English stop words and unigram/bigram token ranges
        # to capture combined phrases like 'noise cancelling' or 'stainless steel'
        self.vectorizer = TfidfVectorizer(stop_words="english", ngram_range=(1, 2))
        self.tfidf_matrix = None
        self.products_df: Optional[pd.DataFrame] = None
        self.similarity_matrix = None
        self.is_trained = False

    def _prepare_content_string(self, row: pd.Series) -> str:
        """
        Combines title, category, and description into a single string for vectorization.
        We emphasize the category and title by repeating them to give them higher weight.
        """
        title = str(row.get("name", row.get("title", "")))
        category = str(row.get("category", row.get("categoryName", "")))
        description = str(row.get("description", ""))
        
        # Weighted text combination: Name + Category repeated + Description
        return f"{title} {category} {category} {description}".strip().lower()

    def fit(self, products: List[Dict[str, Any]]):
        """
        Trains the recommender model on the provided list of products.
        
        :param products: List of product dictionaries with keys:
                         'id', 'name'/'title', 'description', 'category', 'price', etc.
        """
        if not products:
            print("[WARN] Recommender.fit called with an empty product list.")
            self.is_trained = False
            return

        # Convert to pandas DataFrame for clean tabular indexing
        self.products_df = pd.DataFrame(products)

        # Standardize ID column
        if "id" not in self.products_df.columns:
            self.products_df["id"] = range(1, len(self.products_df) + 1)

        # Build feature text column
        self.products_df["combined_features"] = self.products_df.apply(
            self._prepare_content_string, axis=1
        )

        # Fit TF-IDF and compute pairwise Cosine Similarity matrix
        self.tfidf_matrix = self.vectorizer.fit_transform(self.products_df["combined_features"])
        self.similarity_matrix = cosine_similarity(self.tfidf_matrix, self.tfidf_matrix)
        self.is_trained = True

        print(f"[INFO] Recommender successfully trained on {len(products)} products.")

    def recommend(self, product_id: int, top_n: int = 4) -> List[Dict[str, Any]]:
        """
        Finds the top N most similar products to the given product_id.
        
        :param product_id: The ID of the currently viewed product
        :param top_n: Number of recommendations to return (default: 4)
        :return: List of recommended product dictionaries with similarity scores
        """
        if not self.is_trained or self.products_df is None or self.products_df.empty:
            print("[WARN] Recommender is not trained yet. Returning empty list.")
            return []

        # Find row index matching the given product_id
        matching_indices = self.products_df.index[self.products_df["id"] == product_id].tolist()
        if not matching_indices:
            print(f"[INFO] Product ID {product_id} not found in catalog. Fallback to top rated/popular.")
            # Fallback: Return first top_n products (excluding product_id if exists)
            fallback_items = self.products_df[self.products_df["id"] != product_id].head(top_n)
            return fallback_items.to_dict(orient="records")

        target_idx = matching_indices[0]

        # Retrieve pairwise similarity scores for this product against all products
        sim_scores = list(enumerate(self.similarity_matrix[target_idx]))

        # Sort products by similarity score in descending order (highest score first)
        sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)

        # Filter out the item itself (similarity will be 1.0 with itself)
        recommendations = []
        for idx, score in sim_scores:
            if idx == target_idx:
                continue
            
            # Fetch product record as dict
            item = self.products_df.iloc[idx].to_dict()
            # Attach the computed AI similarity score rounded to 2 decimals
            item["ai_similarity_score"] = round(float(score), 3)
            recommendations.append(item)

            if len(recommendations) >= top_n:
                break

        return recommendations

    def search_recommend(self, query: str, top_n: int = 5) -> List[Dict[str, Any]]:
        """
        Calculates TF-IDF cosine similarity between a user search query string
        and all catalog products to provide intelligent search recommendations.
        
        :param query: Search terms entered by the user (e.g. 'laptop', 'wireless headphones')
        :param top_n: Maximum recommendations to return
        :return: Ranked products with similarity scores
        """
        if not self.is_trained or self.products_df is None or self.products_df.empty or not query or not query.strip():
            return []

        # Vectorize the query using the existing vocabulary
        query_vec = self.vectorizer.transform([query.strip().lower()])
        
        # Calculate cosine similarity between query and all products
        cosine_similarities = cosine_similarity(query_vec, self.tfidf_matrix).flatten()
        
        # Rank product indices by similarity score descending
        ranked_indices = np.argsort(cosine_similarities)[::-1]
        
        results = []
        for idx in ranked_indices:
            score = float(cosine_similarities[idx])
            # Only include products that have actual semantic/keyword relevance
            if score <= 0.01:
                break
            item = self.products_df.iloc[idx].to_dict()
            item["ai_similarity_score"] = round(score, 3)
            if "title" not in item and "name" in item:
                item["title"] = item["name"]
            if "categoryName" not in item and "category" in item:
                item["categoryName"] = item["category"]
            results.append(item)
            if len(results) >= top_n:
                break
                
        return results
