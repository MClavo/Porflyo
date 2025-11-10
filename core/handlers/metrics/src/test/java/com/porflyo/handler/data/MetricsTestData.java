package com.porflyo.handler.data;

/**
 * Test data constants for Metrics Handler tests.
 */
public final class MetricsTestData {

    private MetricsTestData() {
        // Utility class
    }

    public static final String VALID_PORTFOLIO_ID = "34nLQz9slVUWY1lClbloGKQc7ZJ";
    public static final String ALTERNATIVE_PORTFOLIO_ID = "ABC123";
    public static final String MISMATCHED_PORTFOLIO_ID = "XYZ789";

    public static final String VALID_METRICS_REQUEST_BODY = """
        {
          "portfolioId": "34nLQz9slVUWY1lClbloGKQc7ZJ",
          "activeTimeMs": 47372,
          "tffiMs": 2100,
          "isMobile": false,
          "emailCopied": false,
          "socialClicks": 2,
          "projectMetrics": [
            {
              "id": "773337289",
              "viewTime": 26052,
              "exposures": 6,
              "codeViews": 2,
              "liveViews": 0
            },
            {
              "id": "998414481",
              "viewTime": 4366,
              "exposures": 5,
              "codeViews": 1,
              "liveViews": 2
            }
          ],
          "scrollMetrics": {
            "score": 70,
            "scrollTimeMs": 17643
          },
          "heatmapData": {
            "cols": 64,
            "rows": 137,
            "topCells": {
              "indices": [5401, 5400, 207, 346, 347, 975, 276, 5465, 917, 5397, 795, 345, 6922],
              "values": [35, 31, 29, 24, 21, 19, 18, 18, 17, 17, 16, 15, 15]
            }
          }
        }
        """;

    public static final String MOBILE_METRICS_REQUEST_BODY = """
        {
          "portfolioId": "34nLQz9slVUWY1lClbloGKQc7ZJ",
          "activeTimeMs": 10000,
          "tffiMs": 1500,
          "isMobile": true,
          "emailCopied": true,
          "socialClicks": 3,
          "projectMetrics": [
            {
              "id": "123",
              "viewTime": 5000,
              "exposures": 2,
              "codeViews": 1,
              "liveViews": 1
            }
          ],
          "scrollMetrics": {
            "score": 50,
            "scrollTimeMs": 8000
          },
          "heatmapData": {
            "cols": 32,
            "rows": 100,
            "topCells": {
              "indices": [1, 2, 3],
              "values": [10, 9, 8]
            }
          }
        }
        """;

    public static final String MISMATCHED_PORTFOLIO_REQUEST_BODY = """
        {
          "portfolioId": "XYZ789",
          "activeTimeMs": 10000,
          "tffiMs": 0,
          "isMobile": false,
          "emailCopied": false,
          "socialClicks": 0,
          "projectMetrics": [],
          "scrollMetrics": {"score": 0, "scrollTimeMs": 0},
          "heatmapData": {"cols": 64, "rows": 100, "topCells": {"indices": [], "values": []}}
        }
        """;

    public static final String INVALID_JSON_BODY = "{ invalid json }";

    // Expected values for MOBILE_METRICS_REQUEST_BODY
    public static final int EXPECTED_ACTIVE_TIME = 10000;
    public static final int EXPECTED_EMAIL_COPIES = 1;
    public static final int EXPECTED_SOCIAL_CLICKS = 3;
    public static final int EXPECTED_DESKTOP_VIEWS = 0;
    public static final int EXPECTED_MOBILE_VIEWS = 1;
    
    public static final int EXPECTED_SCROLL_SCORE = 50;
    public static final int EXPECTED_SCROLL_TIME = 8000;
    
    public static final int EXPECTED_VIEW_TIME = 5000;
    public static final int EXPECTED_EXPOSURES = 2;
    public static final int EXPECTED_CODE_VIEWS = 1;
    public static final int EXPECTED_LIVE_VIEWS = 1;
    
    // Test data for MetricsResponseMapper tests
    public static final String TEST_PORTFOLIO_ID = "test-portfolio";
    public static final String EMPTY_PORTFOLIO_ID = "empty-portfolio";
    
    // Enhanced metrics test values
    public static final int ENHANCED_ACTIVE_TIME = 194;
    public static final int ENHANCED_VIEWS = 4;
    public static final int ENHANCED_QUALITY_VISITS = 20;
    public static final int ENHANCED_EMAIL_COPIES = 29;
    public static final int ENHANCED_SOCIAL_CLICKS = 33;
    public static final int ENHANCED_DESKTOP_VIEWS = 39;
    public static final int ENHANCED_MOBILE_VIEWS = 96;
    
    public static final int ENHANCED_SCORE_TOTAL = 6403;
    public static final int ENHANCED_SCROLL_TIME_TOTAL = 12472;
    public static final int ENHANCED_TFFI_SUM_MS = 52249;
    public static final int ENHANCED_TFFI_COUNT = 33;
    
    public static final int ENHANCED_PROJECT_VIEW_TIME = 117505;
    public static final int ENHANCED_PROJECT_EXPOSURES = 287;
    public static final int ENHANCED_PROJECT_CODE_VIEWS = 34;
    public static final int ENHANCED_PROJECT_LIVE_VIEWS = 181;
    
    public static final double ENHANCED_DESKTOP_PCT = 0.8;
    public static final double ENHANCED_MOBILE_PCT = 0.2;
    public static final double ENHANCED_ENGAGEMENT_AVG = 60.0;
    public static final double ENHANCED_AVG_SCROLL_TIME_MS = 1470.0;
    public static final double ENHANCED_AVG_CARD_VIEW_TIME_MS = 2020.0;
    public static final double ENHANCED_TFFI_MEAN_MS = 870.0;
    public static final double ENHANCED_EMAIL_CONVERSION = 0.0949854239371126;
    
    public static final double ENHANCED_Z_VISITS = -0.00572540710680514;
    public static final double ENHANCED_Z_ENGAGEMENT = 0.552345361403626;
    public static final double ENHANCED_Z_TFFI = 0.317976161566564;
}

