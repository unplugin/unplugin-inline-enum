/**
 * This entry file is for Rollup plugin.
 *
 * @module
 */

import { InlineEnum } from './index'

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
const rollup = InlineEnum.rollup as typeof InlineEnum.rollup
export default rollup
export { rollup as 'module.exports' }
