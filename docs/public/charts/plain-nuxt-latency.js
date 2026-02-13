// Auto-generated Chart.js config
export default function() {
  return {
  "type": "line",
  "data": {
    "labels": [
      "0s",
      "10s",
      "20s",
      "30s",
      "40s",
      "50s",
      "60s",
      "70s"
    ],
    "datasets": [
      {
        "label": "P95 Latency (ms)",
        "data": [
          8,
          805,
          1864,
          2417,
          2417,
          2417,
          2417,
          2417
        ],
        "borderColor": "rgb(75, 192, 192)",
        "backgroundColor": "rgba(75, 192, 192, 0.2)",
        "borderWidth": 3,
        "tension": 0.3,
        "fill": true,
        "pointRadius": 5,
        "pointHoverRadius": 8
      }
    ]
  },
  "options": {
    "responsive": true,
    "maintainAspectRatio": false,
    "plugins": {
      "title": {
        "display": true,
        "text": "Response Time P95 - plain-nuxt",
        "font": {
          "size": 16,
          "weight": "bold"
        }
      },
      "legend": {
        "position": "bottom",
        "labels": {
          "usePointStyle": true
        }
      }
    },
    "scales": {
      "x": {
        "display": true,
        "title": {
          "display": true,
          "text": "Time"
        },
        "grid": {
          "color": "rgba(255, 255, 255, 0.1)"
        }
      },
      "y": {
        "display": true,
        "title": {
          "display": true,
          "text": "Latency (ms)"
        },
        "grid": {
          "color": "rgba(255, 255, 255, 0.1)"
        },
        "min": 0
      }
    }
  }
};
}
