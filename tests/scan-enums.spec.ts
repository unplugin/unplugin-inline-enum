import path from 'node:path'
import { describe, expect, test } from 'vitest'
import { scanEnums, type EnumData } from '../src/core/enum'
import type { OptionsResolved } from '../src/core/options'

describe('scanEnums', () => {
  const scanDir = path.resolve(__dirname, 'enums')
  const options: Omit<OptionsResolved, 'scanMode'> = {
    include: [/\.ts/],
    exclude: [],
    scanDir: path.resolve(__dirname, 'enums'),
    scanPattern: ['**/*.ts', '**/*.tsx'],
  }

  let fsEnums: EnumData
  test('scanMode: fs', () => {
    fsEnums = scanEnums({
      ...options,
      scanMode: 'fs',
    })

    expect({
      ...fsEnums,
      declarations: Object.fromEntries(
        Object.entries(fsEnums.declarations).map(([k, v]) => [
          path.relative(scanDir, k),
          v,
        ]),
      ),
    }).toMatchSnapshot()
  })

  test('scanMode: git', () => {
    const gitEnums = scanEnums({
      ...options,
      scanMode: 'git',
    })
    expect(gitEnums).toEqual(fsEnums)
  })
})
