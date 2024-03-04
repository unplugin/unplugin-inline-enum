/**
 * This entry file is for webpack plugin.
 *
 * @module
 */

import unplugin from './index'

/**
 * Webpack plugin
 *
 * @example
 * ```ts
 * // webpack.config.js
 * module.exports = {
 *  plugins: [require('unplugin-inline-enum/webpack')()],
 * }
 * ```
 */
export default unplugin.webpack
