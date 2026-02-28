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
        "label": "http.request_rate",
        "data": [
          183,
          291,
          283,
          312,
          333,
          289,
          223,
          283
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
          66,
          1864,
          3135,
          2836,
          2369,
          2780,
          4771,
          2417
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
          116,
          600,
          600,
          600,
          600,
          600,
          520,
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
          19,
          138,
          113,
          0,
          0,
          75,
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
          44,
          124,
          93,
          70,
          216,
          42
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
        "text": "Load Summary - plain-nuxt",
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
