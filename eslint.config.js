const { sxzz } = require('@sxzz/eslint-config')
module.exports = sxzz([
  {
    files: ['README.md/*.ts'],
    rules: {
      'import/no-mutable-exports': 'off',
    },
  },
])
