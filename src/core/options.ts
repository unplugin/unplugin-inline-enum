import process from 'node:process'
import type { FilterPattern } from '@rollup/pluginutils'

export interface Options {
  include?: FilterPattern
  exclude?: FilterPattern
  enforce?: 'pre' | 'post' | undefined
  scanMode?: 'git' | 'fs'
  /**
   * @default process.cwd()
   */
  scanDir?: string
  /**
   * @default '**\/*.{cts,mts,ts,tsx}'
   */
  scanPattern?: string | string[]
}

type Overwrite<T, U> = Pick<T, Exclude<keyof T, keyof U>> & U

export type OptionsResolved = Overwrite<
  Required<Options>,
  Pick<Options, 'enforce'>
>

export function resolveOption(options: Options): OptionsResolved {
  return {
    include: options.include || [/\.[cm]?[jt]sx?$/],
    exclude: options.exclude || [/node_modules/],
    enforce: 'enforce' in options ? options.enforce : 'pre',

    scanMode: options.scanMode || 'fs',
    scanDir: options.scanDir || process.cwd(),
    scanPattern: options.scanPattern || '**/*.{cts,mts,ts,tsx}',
  }
}
