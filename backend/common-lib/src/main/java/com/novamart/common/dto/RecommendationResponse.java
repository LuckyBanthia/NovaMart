package com.novamart.common.dto;

/**
 * Encapsulates an AI-generated product recommendation computed by
 * the Python Scikit-learn microservice.
 */
public class RecommendationResponse {
    private Long productId;
    private String title;
    private Double similarityScore;
    private String reason;

    public RecommendationResponse() {
    }

    public RecommendationResponse(Long productId, String title, Double similarityScore, String reason) {
        this.productId = productId;
        this.title = title;
        this.similarityScore = similarityScore;
        this.reason = reason;
    }

    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public Double getSimilarityScore() {
        return similarityScore;
    }

    public void setSimilarityScore(Double similarityScore) {
        this.similarityScore = similarityScore;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}
