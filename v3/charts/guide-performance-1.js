export default {
  "type": "doughnut",
  "data": {
    "labels": [
      "@nuxtjs/i18n v10.6 (1,292 MB)",
      "i18n-micro (997 MB)"
    ],
    "datasets": [
      {
        "data": [
          1292,
          997
        ],
        "backgroundColor": [
          "rgba(255, 99, 132, 0.8)",
          "rgba(46, 204, 113, 0.8)"
        ],
        "borderColor": [
          "rgb(255, 99, 132)",
          "rgb(46, 204, 113)"
        ],
        "borderWidth": 2
      }
    ]
  },
  "options": {
    "plugins": {
      "title": {
        "display": true,
        "text": "Peak RSS During Build (MB)",
        "font": {
          "size": 16
        }
      },
      "legend": {
        "position": "bottom"
      }
    }
  }
}
