// Support both the new `@tailwindcss/postcss` package and the older `tailwindcss` package.
let tailwindPlugin
try {
  // Preferred new package
  tailwindPlugin = require('@tailwindcss/postcss')
} catch (e) {
  // Fallback to the classic tailwindcss package
  tailwindPlugin = require('tailwindcss')
}

module.exports = {
  plugins: [tailwindPlugin, require('autoprefixer')],
}
