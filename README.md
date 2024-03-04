# unplugin-inline-enum [![npm](https://img.shields.io/npm/v/unplugin-inline-enum.svg)](https://npmjs.com/package/unplugin-inline-enum) [![jsr](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fjsr-api.sxzz.moe%2Fversion%2F%40unplugin%2Finline-enum&query=version&prefix=v&label=jsr&color=%23f7df1e)](https://jsr.io/@unplugin/inline-enum)

[![Unit Test](https://github.com/unplugin/unplugin-inline-enum/actions/workflows/unit-test.yml/badge.svg)](https://github.com/unplugin/unplugin-inline-enum/actions/workflows/unit-test.yml)

Inline enum values to optimize bundle size.

## Features

- 🚀 Inline enum values to reduce the size of the bundle.
- 🧹 Simplify generated enums in JavaScript.

```ts
export enum TestEnum {
  a = 1,
  b = 'foo',
}
console.log(TestEnum.a, TestEnum.b)

// before
export let TestEnum
;(function (TestEnum) {
  TestEnum[(TestEnum.a = 1)] = 'a'
  TestEnum.b = 'foo'
})(TestEnum || (TestEnum = {}))

console.log(TestEnum.a, TestEnum.b)

// after
const TestEnum = {
  a: 1,
  '1': 'a',
  b: 'foo',
}
console.log(1, 'foo')
```

## Installation

```bash
# npm
npm i -D unplugin-inline-enum

# jsr
npx jsr add -D @unplugin/inline-enum
```

<details>
<summary>Vite</summary><br>

```ts
// vite.config.ts
import InlineEnum from 'unplugin-inline-enum/vite'

export default defineConfig({
  plugins: [InlineEnum()],
})
```

<br></details>

<details>
<summary>Rollup</summary><br>

```ts
// rollup.config.js
import InlineEnum from 'unplugin-inline-enum/rollup'

export default {
  plugins: [InlineEnum()],
}
```

<br></details>

<details>
<summary>esbuild</summary><br>

```ts
// esbuild.config.js
import { build } from 'esbuild'

build({
  plugins: [require('unplugin-inline-enum/esbuild')()],
})
```

<br></details>

<details>
<summary>Webpack</summary><br>

```ts
// webpack.config.js
module.exports = {
  /* ... */
  plugins: [require('unplugin-inline-enum/webpack')()],
}
```

<br></details>

## Options

Refer to [docs](https://jsr.io/@unplugin/inline-enum/doc/api/~/Options).

## Credits

Thanks to [@xiaoxiangmoe](https://github.com/xiaoxiangmoe) and
[@yangmingshan](https://github.com/yangmingshan) for their contributions in the
[PR](https://github.com/vuejs/core/pull/9261).

## Sponsors

<p align="center">
  <a href="https://cdn.jsdelivr.net/gh/sxzz/sponsors/sponsors.svg">
    <img src='https://cdn.jsdelivr.net/gh/sxzz/sponsors/sponsors.svg'/>
  </a>
</p>

## License

[MIT](./LICENSE) License © 2024-PRESENT [三咲智子](https://github.com/sxzz)
