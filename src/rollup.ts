/**
 * This entry file is for Rollup plugin.
 *
 * @module
 */

import unplugin from './index'

/**
 * Rollup plugin
 *
 * @example
 * ```ts
 * // rollup.config.js
 * import InlineEnum from 'unplugin-inline-enum/rollup'
 *
 * export default {
 *   plugins: [InlineEnum()],
 * }
 * ```
 */
const rollup = unplugin.rollup
export default rollup
export { rollup as 'module.exports' }
