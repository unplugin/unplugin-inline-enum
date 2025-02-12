/**
 * This entry file is for Vite plugin.
 *
 * @module
 */

import unplugin from './index'

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
const vite = unplugin.vite
export default vite
export { vite as 'module.exports' }
