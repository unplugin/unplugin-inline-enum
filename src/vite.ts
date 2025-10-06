/**
 * This entry file is for Vite plugin.
 *
 * @module
 */

import { InlineEnum } from './index'

/**
 * Vite plugin
 *
 * @example
 * ```ts
 * // vite.config.ts
 * import InlineEnum from 'unplugin-inline-enum/vite'
 *
 * export default defineConfig({
 *   plugins: [InlineEnum()],
 * })
 * ```
 */
const vite = InlineEnum.vite as typeof InlineEnum.vite
export default vite
export { vite as 'module.exports' }
