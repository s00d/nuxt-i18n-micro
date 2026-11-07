export default {
  "type": "bar",
  "data": {
    "labels": [
      "Build Time (s)",
      "Peak RSS (GB)",
      "Code Bundle (MB)",
      "Artillery RPS"
    ],
    "datasets": [
      {
        "label": "@nuxtjs/i18n v10.6",
        "data": [
          8.2,
          1.3,
          1.9,
          126
        ],
        "backgroundColor": "rgba(255, 99, 132, 0.8)",
        "borderColor": "rgb(255, 99, 132)",
        "borderWidth": 2
      },
      {
        "label": "i18n-micro",
        "data": [
          5.0,
          1.0,
          1.4,
          230
        ],
        "backgroundColor": "rgba(46, 204, 113, 0.8)",
        "borderColor": "rgb(46, 204, 113)",
        "borderWidth": 2
      }
    ]
  },
  "options": {
    "plugins": {
      "title": {
        "display": true,
        "text": "Performance Metrics Comparison",
        "font": {
          "size": 16
        }
      },
      "legend": {
        "position": "bottom"
      }
    },
    "scales": {
      "y": {
        "beginAtZero": true
      }
    }
  }
}
