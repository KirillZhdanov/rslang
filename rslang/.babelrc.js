module.exports = {
  "presets": [
    ["@babel/preset-env", {
      "exclude": ["transform-async-to-generator", "transform-regenerator"]
    }]
  ],
  "plugins": [
    ["module:fast-async", { "spec": true }],
  ]
}