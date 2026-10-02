import sys
from models.recommender import ContentBasedRecommender
from models.sentiment import ReviewSentimentAnalyzer
from models.category_predictor import CategoryPredictor

print("1. Testing Sentiment Analyzer...")
sentiment = ReviewSentimentAnalyzer()
res_sent = sentiment.analyze("The build quality is incredible! Best headphones ever.")
print("Sentiment Result:", res_sent)
assert res_sent["sentiment"] == "POSITIVE"

res_neg = sentiment.analyze("Horrible experience. Arrived broken.")
print("Negative Sentiment Result:", res_neg)
assert res_neg["sentiment"] == "NEGATIVE"

print("2. Testing Category Predictor...")
cat_pred = CategoryPredictor()
res_cat = cat_pred.predict("Wireless Noise-Cancelling Headphones", "Bluetooth over ear headset")
print("Category Prediction:", res_cat)
assert res_cat["predicted_category"] == "Electronics"

print("3. Testing Recommender...")
recommender = ContentBasedRecommender()
catalog = [
    {"id": 1, "name": "Sony Noise Cancelling Headphones", "category": "Electronics", "description": "Over ear wireless bluetooth headset with 30hr battery."},
    {"id": 2, "name": "Bose QuietComfort Earbuds", "category": "Electronics", "description": "True wireless earbuds with spatial audio and deep bass."},
    {"id": 3, "name": "Cotton Slim Fit Shirt", "category": "Fashion", "description": "Men's casual long sleeve oxford dress shirt."},
    {"id": 4, "name": "Stainless Steel Espresso Maker", "category": "Home & Kitchen", "description": "15 bar pump commercial Italian coffee machine."}
]
recommender.fit(catalog)
recs = recommender.recommend(product_id=1, top_n=2)
print("Recommended for Product 1 (Sony Headphones):")
for r in recs:
    print(f" - ID: {r['id']} | {r['name']} | Similarity: {r.get('ai_similarity_score')}")

# Product 2 (Bose Earbuds) should be the #1 recommendation for Sony Headphones
assert recs[0]["id"] == 2
print("All Scikit-Learn ML tests PASSED successfully!")
