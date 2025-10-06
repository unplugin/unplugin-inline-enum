import path from 'node:path'
import { rolldownBuild } from '@sxzz/test-utils'
import Oxc from 'unplugin-oxc/rolldown'
import { expect, test } from 'vitest'
import UnpluginInlineEnum from '../src/rolldown'

test('rolldown', async () => {
  const { snapshot } = await rolldownBuild(
    path.resolve(__dirname, 'fixtures/main.ts'),
    [
      UnpluginInlineEnum({
        scanDir: path.resolve(__dirname, 'fixtures'),
        scanMode: 'fs',
      }),
      Oxc(),
    ],
    {},
    { minify: 'dce-only' },
  )
  expect(snapshot).toMatchSnapshot()
})
