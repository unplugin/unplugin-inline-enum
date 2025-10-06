/**
 * This entry file is for Rolldown plugin.
 *
 * @module
 */

import { InlineEnum } from './index'

/**
 * Rolldown plugin
 *
 * @example
 * ```ts
 * // rolldown.config.js
 * import InlineEnum from 'unplugin-inline-enum/rolldown'
 *
 * export default {
 *   plugins: [InlineEnum()],
 * }
 * ```
 */
const rolldown = InlineEnum.rolldown as typeof InlineEnum.rolldown
export default rolldown
export { rolldown as 'module.exports' }
