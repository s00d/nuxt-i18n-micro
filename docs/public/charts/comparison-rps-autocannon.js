// Auto-generated Chart.js config
export default function() {
  return {
  "type": "bar",
  "data": {
    "labels": [
      "plain-nuxt",
      "i18n-v10",
      "i18n-micro"
    ],
    "datasets": [
      {
        "label": "Requests per Second",
        "data": [
          161,
          12,
          178
        ],
        "backgroundColor": [
          "rgb(75, 192, 192)",
          "rgb(255, 99, 132)",
          "rgb(46, 204, 113)"
        ],
        "borderColor": [
          "rgb(75, 192, 192)",
          "rgb(255, 99, 132)",
          "rgb(46, 204, 113)"
        ],
        "borderWidth": 2
      }
    ]
  },
  "options": {
    "responsive": true,
    "maintainAspectRatio": false,
    "plugins": {
      "title": {
        "display": true,
        "text": "Requests per Second - Autocannon (higher is better)",
        "font": {
          "size": 16,
          "weight": "bold"
        }
      },
      "legend": {
        "display": false
      }
    },
    "scales": {
      "y": {
        "beginAtZero": true,
        "title": {
          "display": true,
          "text": "RPS"
        },
        "grid": {
          "color": "rgba(255, 255, 255, 0.1)"
        }
      },
      "x": {
        "grid": {
          "color": "rgba(255, 255, 255, 0.1)"
        }
      }
    }
  }
};
}
