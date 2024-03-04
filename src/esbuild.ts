/**
 * This entry file is for esbuild plugin.
 *
 * @module
 */

import unplugin from './index'

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
export default unplugin.esbuild
