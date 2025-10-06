/**
 * This entry file is for esbuild plugin.
 *
 * @module
 */

import { InlineEnum } from './index'

/**
 * Esbuild plugin
 *
 * @example
 * ```ts
 * // esbuild.config.js
 * import { build } from 'esbuild'
 *
 * build({
 *   plugins: [require('unplugin-inline-enum/esbuild')()],
 * })
 * ```
 */
const esbuild = InlineEnum.esbuild as typeof InlineEnum.esbuild
export default esbuild
export { esbuild as 'module.exports' }
