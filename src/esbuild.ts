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
const esbuild = unplugin.esbuild as typeof unplugin.esbuild
export default esbuild
export { esbuild as 'module.exports' }
