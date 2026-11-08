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
        "label": "Avg",
        "data": [
          1744,
          758,
          41
        ],
        "backgroundColor": "rgba(75, 192, 192, 0.8)",
        "borderColor": "rgb(75, 192, 192)",
        "borderWidth": 1
      },
      {
        "label": "P50",
        "data": [
          608,
          87,
          29
        ],
        "backgroundColor": "rgba(255, 206, 86, 0.8)",
        "borderColor": "rgb(255, 206, 86)",
        "borderWidth": 1
      },
      {
        "label": "P95",
        "data": [
          11585,
          6074,
          102
        ],
        "backgroundColor": "rgba(255, 159, 64, 0.8)",
        "borderColor": "rgb(255, 159, 64)",
        "borderWidth": 1
      },
      {
        "label": "P99",
        "data": [
          12475,
          6428,
          238
        ],
        "backgroundColor": "rgba(255, 99, 132, 0.8)",
        "borderColor": "rgb(255, 99, 132)",
        "borderWidth": 1
      }
    ]
  },
  "options": {
    "responsive": true,
    "maintainAspectRatio": false,
    "plugins": {
      "title": {
        "display": true,
        "text": "Latency Percentiles (lower is better)",
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
        "title": {
          "display": true,
          "text": "Latency (ms)"
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
