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
      "70s",
      "80s"
    ],
    "datasets": [
      {
        "label": "http.request_rate",
        "data": [
          67,
          257,
          206,
          200,
          274,
          284,
          283,
          77,
          170
        ],
        "borderColor": "rgb(255, 159, 64)",
        "backgroundColor": "rgba(255, 159, 64, 0.1)",
        "borderWidth": 2,
        "tension": 0.3,
        "yAxisID": "y1",
        "pointRadius": 4,
        "pointHoverRadius": 6
      },
      {
        "label": "http.response_time.p95",
        "data": [
          107,
          3464,
          4317,
          8521,
          4584,
          4231,
          3985,
          539,
          4147
        ],
        "borderColor": "rgb(75, 192, 192)",
        "backgroundColor": "rgba(75, 192, 192, 0.1)",
        "borderWidth": 2,
        "tension": 0.3,
        "yAxisID": "y2",
        "pointRadius": 4,
        "pointHoverRadius": 6
      },
      {
        "label": "vusers.created",
        "data": [
          74,
          600,
          597,
          602,
          601,
          600,
          562,
          0,
          0
        ],
        "borderColor": "rgb(153, 102, 255)",
        "backgroundColor": "rgba(153, 102, 255, 0.1)",
        "borderWidth": 2,
        "tension": 0.3,
        "yAxisID": "y",
        "pointRadius": 4,
        "pointHoverRadius": 6
      },
      {
        "label": "vusers.active",
        "data": [
          31,
          321,
          144,
          0,
          0,
          4,
          0,
          0,
          0
        ],
        "borderColor": "rgb(46, 204, 113)",
        "backgroundColor": "rgba(46, 204, 113, 0.1)",
        "borderWidth": 2,
        "tension": 0.3,
        "yAxisID": "y",
        "pointRadius": 4,
        "pointHoverRadius": 6
      },
      {
        "label": "vusers.failed",
        "data": [
          0,
          0,
          248,
          441,
          369,
          281,
          281,
          0,
          85
        ],
        "borderColor": "rgb(255, 99, 132)",
        "backgroundColor": "rgba(255, 99, 132, 0.1)",
        "borderWidth": 2,
        "tension": 0.3,
        "yAxisID": "y",
        "pointRadius": 4,
        "pointHoverRadius": 6
      }
    ]
  },
  "options": {
    "responsive": true,
    "maintainAspectRatio": false,
    "interaction": {
      "mode": "index",
      "intersect": false
    },
    "plugins": {
      "title": {
        "display": true,
        "text": "Load Summary - i18n-micro",
        "font": {
          "size": 16,
          "weight": "bold"
        }
      },
      "legend": {
        "position": "bottom",
        "labels": {
          "usePointStyle": true,
          "padding": 15
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
        "type": "linear",
        "display": true,
        "position": "left",
        "title": {
          "display": true,
          "text": "VUsers"
        },
        "grid": {
          "color": "rgba(255, 255, 255, 0.1)"
        },
        "min": 0
      },
      "y1": {
        "type": "linear",
        "display": true,
        "position": "right",
        "title": {
          "display": true,
          "text": "req/s"
        },
        "grid": {
          "drawOnChartArea": false
        },
        "min": 0
      },
      "y2": {
        "type": "linear",
        "display": true,
        "position": "right",
        "title": {
          "display": true,
          "text": "ms"
        },
        "grid": {
          "drawOnChartArea": false
        },
        "min": 0
      }
    }
  }
};
}
