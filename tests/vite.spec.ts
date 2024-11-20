import path from 'node:path'
import { build } from 'vite'
import { expect, test } from 'vitest'
import UnpluginInlineEnum from '../src/vite'
import type { RollupOutput } from 'rollup'

test('vite', async () => {
  const root = path.resolve(__dirname, 'fixtures')
  const { output } = (await build({
    root,
    build: {
      minify: false,
      rollupOptions: {
        input: [path.resolve(root, 'main.ts')],
      },
      write: false,
    },
    logLevel: 'silent',
    plugins: [
      UnpluginInlineEnum({
        scanDir: path.resolve(__dirname, 'fixtures'),
        scanMode: 'fs',
      }),
    ],
  })) as RollupOutput
  expect(output[0].code).toMatchSnapshot()
})
