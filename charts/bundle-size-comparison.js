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
        "label": "Code Bundle (MB)",
        "data": [
          1.5,
          2.2,
          1.7
        ],
        "backgroundColor": "rgba(75, 192, 192, 0.8)",
        "borderColor": "rgb(75, 192, 192)",
        "borderWidth": 2
      },
      {
        "label": "Translations (MB)",
        "data": [
          6.8,
          7.2,
          6.8
        ],
        "backgroundColor": "rgba(255, 206, 86, 0.8)",
        "borderColor": "rgb(255, 206, 86)",
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
        "text": "Bundle Size: Code vs Translations (lower is better)",
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
      "y": {
        "beginAtZero": true,
        "stacked": true,
        "title": {
          "display": true,
          "text": "MB"
        },
        "grid": {
          "color": "rgba(255, 255, 255, 0.1)"
        }
      },
      "x": {
        "stacked": true,
        "grid": {
          "color": "rgba(255, 255, 255, 0.1)"
        }
      }
    }
  }
};
}
