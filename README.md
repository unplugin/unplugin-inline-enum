# unplugin-inline-enum [![npm](https://img.shields.io/npm/v/unplugin-inline-enum.svg)](https://npmjs.com/package/unplugin-inline-enum)

[![Unit Test](https://github.com/unplugin/unplugin-inline-enum/actions/workflows/unit-test.yml/badge.svg)](https://github.com/unplugin/unplugin-inline-enum/actions/workflows/unit-test.yml)

Inline enum value to optimize bundle size.

> Working in Progress...

## Installation

```bash
npm i -D unplugin-inline-enum
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

## Credits

Thanks to @xiaoxiangmoe and @yangmingshan for their contributions in the
[PR](https://github.com/vuejs/core/pull/9261).

## Sponsors

<p align="center">
  <a href="https://cdn.jsdelivr.net/gh/sxzz/sponsors/sponsors.svg">
    <img src='https://cdn.jsdelivr.net/gh/sxzz/sponsors/sponsors.svg'/>
  </a>
</p>

## License

[MIT](./LICENSE) License © 2024-PRESENT [三咲智子](https://github.com/sxzz)
