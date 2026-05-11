import assert from 'node:assert'
import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { babelParse, getLang, isDts, isTs } from 'ast-kit'
import picomatch from 'picomatch'
import { globSync } from 'tinyglobby'
import type { OptionsResolved } from './options'
import type { Expression, PrivateName } from '@babel/types'

/**
 * Represents the scan options for the enum.
 */
export type ScanOptions = Pick<
  OptionsResolved,
  'scanDir' | 'scanMode' | 'scanPattern'
>

/**
 * Represents a member of an enum.
 */
export interface EnumMember {
  readonly name: string
  readonly value: string | number
}

/**
 * Represents a declaration of an enum.
 */
export interface EnumDeclaration {
  readonly id: string
  readonly range: readonly [start: number, end: number]
  readonly members: ReadonlyArray<EnumMember>
}

/**
 * Represents the data of all enums.
 */
export interface EnumData {
  readonly declarations: {
    readonly [file: string]: ReadonlyArray<EnumDeclaration>
  }
  readonly defines: { readonly [id_key: `${string}.${string}`]: string }
}

/**
 * Evaluates a JavaScript expression and returns the result.
 * @param exp - The expression to evaluate.
 * @returns The evaluated result.
 */
function evaluate(exp: string): string | number {
  return new Function(`return ${exp}`)()
}

/**
 * A function that resolves to a value
 */
type Resolver<T> = () => T

/**
 * Scans the specified directory for enums based on the provided options.
 * @param options - The scan options for the enum.
 * @returns The data of all enums found.
 */
export function scanEnums(options: ScanOptions): EnumData {
  const declarations: { [file: string]: EnumDeclaration[] } =
    Object.create(null)

  const defines: {
    [id_key: `${string}.${string}`]: Resolver<string | number>
  } = Object.create(null)

  // 1. grep for files with exported enum
  const files = scanFiles(options)

  // 2. parse matched files to collect enum info
  for (const file of files) {
    const lang = getLang(file)
    if (!isTs(lang) || isDts(file)) continue

    const content = readFileSync(file, 'utf8')
    const ast = babelParse(content, lang)

    const enumIds: Set<string> = new Set()
    for (const node of ast.body) {
      if (
        node.type === 'ExportNamedDeclaration' &&
        node.declaration &&
        node.declaration.type === 'TSEnumDeclaration'
      ) {
        const decl = node.declaration
        const id = decl.id.name
        if (enumIds.has(id)) {
          throw new Error(
            `not support declaration merging for enum ${id} in ${file}`,
          )
        }
        enumIds.add(id)

        let lastInitialized: Resolver<string | number> = () => -1
        const members: Array<EnumMember> = []

        for (const e of decl.members) {
          const key = e.id.type === 'Identifier' ? e.id.name : e.id.value
          const fullKey = `${id}.${key}` as const
          const saveValue = (resolver: Resolver<string | number>) => {
            // We need allow same name enum in different file.
            // For example: enum ErrorCodes exist in both @vue/compiler-core and @vue/runtime-core
            // But not allow `ErrorCodes.__EXTEND_POINT__` appear in two same name enum
            if (fullKey in defines) {
              throw new Error(`name conflict for enum ${id} in ${file}`)
            }
            members.push({
              name: key,
              get value() {
                return defines[fullKey]()
              },
            })

            let resolved: number | string | undefined
            let resolving = false
            defines[fullKey] = () => {
              if (resolved !== undefined) return resolved
              if (resolving)
                throw new Error(
                  `circular reference evaluating ${fullKey} in ${file}`,
                )
              resolving = true
              resolved = resolver()
              return resolved
            }
          }
          const init = e.initializer
          if (init) {
            const resolveValue = (
              node: Expression | PrivateName,
            ): Resolver<string | number> => {
              assert.ok(typeof node.start === 'number')
              assert.ok(typeof node.end === 'number')

              switch (node.type) {
                case 'NumericLiteral':
                case 'StringLiteral':
                  return () => node.value

                case 'MemberExpression': {
                  const exp = content.slice(
                    node.start,
                    node.end,
                  ) as `${string}.${string}`
                  return () => {
                    if (defines[exp]) return defines[exp]()
                    throw new Error(`unresolved expression ${exp} in ${file}`)
                  }
                }
                case 'Identifier': {
                  const exp = `${id}.${node.name}` as const
                  return () => {
                    if (defines[exp]) return defines[exp]()
                    throw new Error(`unresolved expression ${exp} in ${file}`)
                  }
                }
                case 'BinaryExpression': {
                  const left = resolveValue(node.left)
                  const right = resolveValue(node.right)
                  return () =>
                    evaluate(
                      `${JSON.stringify(left())}${node.operator}${JSON.stringify(right())}`,
                    )
                }
                case 'UnaryExpression': {
                  const arg = resolveValue(node.argument)
                  return () =>
                    evaluate(`${node.operator}${JSON.stringify(arg())}`)
                }
                default:
                  throw new Error(
                    `unhandled expression type ${node.type} in ${file}`,
                  )
              }
            }
            lastInitialized = resolveValue(init)
            saveValue(lastInitialized)
          } else {
            const prev = lastInitialized
            lastInitialized = () => {
              const previous = prev()
              if (typeof previous === 'string')
                throw new Error(`wrong enum initialization sequence in ${file}`)
              return previous + 1
            }
            saveValue(lastInitialized)
          }
        }

        if (!(file in declarations)) {
          declarations[file] = []
        }
        assert.ok(typeof node.start === 'number')
        assert.ok(typeof node.end === 'number')
        declarations[file].push({
          id,
          range: [node.start, node.end],
          members,
        })
      }
    }
  }

  const enumData: EnumData = {
    declarations,
    defines: Object.fromEntries(
      Object.entries(defines).map(([key, value]) => [
        key,
        JSON.stringify(value()),
      ]),
    ),
  }
  return enumData
}

/**
 * Scans the specified directory for files based on the provided options.
 * @param options - The scan options for the files.
 * @returns The list of files found.
 */
export function scanFiles(options: ScanOptions): string[] {
  if (options.scanMode === 'fs') {
    return globSync(options.scanPattern, {
      cwd: options.scanDir,
      expandDirectories: false,
    }).map((file) => path.resolve(options.scanDir, file))
  } else {
    const { stdout, stderr, status } = spawnSync(
      'git',
      ['grep', '--untracked', 'export enum'],
      { cwd: options.scanDir, encoding: 'utf8' },
    )
    if (status !== 0) {
      if (stderr) throw new Error(`git grep failed: ${stderr}`)
      else return []
    }

    const matcher = picomatch(options.scanPattern)
    return [...new Set(stdout.split('\n').map((line) => line.split(':')[0]))]
      .map((file) => path.resolve(options.scanDir, file))
      .filter((file) => matcher(file))
  }
}
