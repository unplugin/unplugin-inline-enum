/**
 * This entry file is for webpack plugin.
 *
 * @module
 */

import { InlineEnum } from './index'

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
const webpack = InlineEnum.webpack as typeof InlineEnum.webpack
export default webpack
export { webpack as 'module.exports' }
