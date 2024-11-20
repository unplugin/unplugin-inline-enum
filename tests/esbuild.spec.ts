import path from 'node:path'
import { build } from 'esbuild'
import { expect, test } from 'vitest'
import UnpluginInlineEnum from '../src/esbuild'

test('esbuild', async () => {
  const result = await build({
    entryPoints: [path.resolve(__dirname, 'fixtures/main.ts')],
    bundle: true,
    write: false,
    format: 'esm',
    plugins: [
      UnpluginInlineEnum({
        scanDir: path.resolve(__dirname, 'fixtures'),
        scanMode: 'fs',
      }),
    ],
  })
  expect(result.outputFiles[0].text).toMatchSnapshot()
})
