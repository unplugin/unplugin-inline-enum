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
export default unplugin.rollup
