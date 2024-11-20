import path from 'node:path'
import { rollupBuild, RollupEsbuildPlugin } from '@vue-macros/test-utils'
import { expect, test } from 'vitest'
import UnpluginInlineEnum from '../src/rollup'

test('rollup', async () => {
  const result = await rollupBuild(
    path.resolve(__dirname, 'fixtures/main.ts'),
    [
      UnpluginInlineEnum({
        scanDir: path.resolve(__dirname, 'fixtures'),
        scanMode: 'fs',
      }),
      RollupEsbuildPlugin(),
      {
        name: 'test:mod-options',
        options(options) {
          options.treeshake = 'smallest'
        },
      },
    ],
  )
  expect(result).toMatchSnapshot()
})
