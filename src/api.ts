/**
 * This entry file is for exposing the core API.
 *
 * @module
 */

export {
  scanEnums,
  scanFiles,
  type EnumData,
  type EnumDeclaration,
  type EnumMember,
  type ScanOptions,
} from './core/enum'

export { resolveOptions, type Options } from './core/options'
