import process from 'node:process'
import type { FilterPattern } from 'unplugin'

/**
 * Represents the options for the plugin.
 */
export interface Options {
  include?: FilterPattern
  exclude?: FilterPattern
  enforce?: 'pre' | 'post' | undefined
  /**
   * The mode used to scan for enum files.
   * @default 'fs'
   */
  scanMode?: 'git' | 'fs'
  /**
   * The directory to scan for enum files.
   * @default process.cwd()
   */
  scanDir?: string
  /**
   * The pattern used to match enum files.
   * @default '**\/*.{cts,mts,ts,tsx}'
   */
  scanPattern?: string | string[]
}

type Overwrite<T, U> = Pick<T, Exclude<keyof T, keyof U>> & U

/**
 * Represents the resolved options for the plugin.
 */
export type OptionsResolved = Overwrite<
  Required<Options>,
  Pick<Options, 'enforce'>
>

/**
 * Resolves the options for the plugin.
 * @param options - The options to resolve.
 * @returns The resolved options.
 */
export function resolveOptions(options: Options): OptionsResolved {
  return {
    include: options.include || [/\.[cm]?[jt]sx?$/],
    exclude: options.exclude || [/node_modules/, /\.d\.[cm]?ts$/],
    enforce: 'enforce' in options ? options.enforce : 'pre',

    scanMode: options.scanMode || 'fs',
    scanDir: options.scanDir || process.cwd(),
    scanPattern: options.scanPattern || '**/*.{cts,mts,ts,tsx}',
  }
}
