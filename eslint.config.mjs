import { sxzz } from '@sxzz/eslint-config'
export default sxzz([
  {
    files: ['README.md/*.ts'],
    rules: {
      'import/no-mutable-exports': 'off',
    },
  },
])
