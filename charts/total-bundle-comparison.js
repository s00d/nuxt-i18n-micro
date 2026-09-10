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
        "label": "Total Bundle (MB)",
        "data": [
          8.3,
          9.4,
          8.5
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
        "text": "Total Deployable Output (lower is better)",
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
          "text": "MB"
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
