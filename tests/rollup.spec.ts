import path from 'node:path'
import { rollupBuild } from '@sxzz/test-utils'
import Oxc from 'unplugin-oxc/rollup'
import { expect, test } from 'vitest'
import UnpluginInlineEnum from '../src/rollup'

test('rollup', async () => {
  const { snapshot } = await rollupBuild(
    path.resolve(__dirname, 'fixtures/main.ts'),
    [
      UnpluginInlineEnum({
        scanDir: path.resolve(__dirname, 'fixtures'),
        scanMode: 'fs',
      }),
      Oxc(),
      {
        name: 'test:mod-options',
        options(options) {
          options.treeshake = 'smallest'
        },
      },
    ],
  )
  expect(snapshot).toMatchSnapshot()
})
