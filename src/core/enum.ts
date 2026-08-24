import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import picomatch from 'picomatch'
import { globSync } from 'tinyglobby'
import {
  langFromPath,
  parse,
  sourceTypeFromPath,
  type Expression,
  type PrivateIdentifier,
} from 'yuku-parser'
import type { OptionsResolved } from './options'

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
 * Scans the specified directory for enums based on the provided options.
 * @param options - The scan options for the enum.
 * @returns The data of all enums found.
 */
export function scanEnums(options: ScanOptions): EnumData {
  const declarations: { [file: string]: EnumDeclaration[] } =
    Object.create(null)

  const defines: { [id_key: `${string}.${string}`]: string } =
    Object.create(null)

  // 1. grep for files with exported enum
  const files = scanFiles(options)

  // 2. parse matched files to collect enum info
  for (const file of files) {
    const lang = langFromPath(file)
    if (lang !== 'ts' && lang !== 'tsx') continue

    const content = readFileSync(file, 'utf8')
    const result = parse(content, {
      lang,
      preserveParens: false,
      sourceType: sourceTypeFromPath(file),
    })
    const parseError = result.diagnostics.find(
      ({ severity }) => severity === 'error',
    )
    if (parseError) {
      throw new SyntaxError(
        `${parseError.message} at offset ${parseError.start} in ${file}`,
      )
    }

    const enumIds: Set<string> = new Set()
    for (const node of result.program.body) {
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

        let lastInitialized: string | number | undefined
        const members: Array<EnumMember> = []

        for (const e of decl.body.members) {
          let key: string
          if (e.id.type === 'Identifier') {
            key = e.id.name
          } else if (e.id.type === 'Literal') {
            key = e.id.value
          } else {
            throw new Error(
              `unhandled enum member name type ${e.id.type} in ${file}`,
            )
          }
          const fullKey = `${id}.${key}` as const
          const saveValue = (value: string | number) => {
            // We need allow same name enum in different file.
            // For example: enum ErrorCodes exist in both @vue/compiler-core and @vue/runtime-core
            // But not allow `ErrorCodes.__EXTEND_POINT__` appear in two same name enum
            if (fullKey in defines) {
              throw new Error(`name conflict for enum ${id} in ${file}`)
            }
            members.push({
              name: key,
              value,
            })
            defines[fullKey] = JSON.stringify(value)
          }
          const init = e.initializer
          if (init) {
            let value: string | number
            switch (init.type) {
              case 'Literal': {
                if (
                  typeof init.value !== 'string' &&
                  typeof init.value !== 'number'
                ) {
                  throw new TypeError(
                    `unhandled initializer value ${String(init.value)} for ${fullKey} in ${file}`,
                  )
                }
                value = init.value

                break
              }
              case 'BinaryExpression': {
                const resolveValue = (node: Expression | PrivateIdentifier) => {
                  if (
                    node.type === 'Literal' &&
                    (typeof node.value === 'number' ||
                      typeof node.value === 'string')
                  ) {
                    return node.value
                  } else if (node.type === 'MemberExpression') {
                    const exp = content.slice(
                      node.start,
                      node.end,
                    ) as `${string}.${string}`
                    if (!(exp in defines)) {
                      throw new Error(
                        `unhandled enum initialization expression ${exp} in ${file}`,
                      )
                    }
                    return defines[exp]
                  } else {
                    throw new Error(
                      `unhandled BinaryExpression operand type ${node.type} in ${file}`,
                    )
                  }
                }
                const exp = `${resolveValue(init.left)}${
                  init.operator
                }${resolveValue(init.right)}`
                value = evaluate(exp)

                break
              }
              case 'UnaryExpression': {
                if (
                  init.argument.type === 'Literal' &&
                  (typeof init.argument.value === 'string' ||
                    typeof init.argument.value === 'number')
                ) {
                  const exp = `${init.operator}${init.argument.value}`
                  value = evaluate(exp)
                } else {
                  throw new Error(
                    `unhandled UnaryExpression argument type ${init.argument.type} in ${file}`,
                  )
                }

                break
              }
              default: {
                throw new Error(
                  `unhandled initializer type ${init.type} for ${fullKey} in ${file}`,
                )
              }
            }
            lastInitialized = value
            saveValue(lastInitialized)
          } else if (lastInitialized === undefined) {
            // first initialized
            lastInitialized = 0
            saveValue(lastInitialized)
          } else if (typeof lastInitialized === 'number') {
            lastInitialized++
            saveValue(lastInitialized)
          } else {
            // should not happen
            throw new TypeError(`wrong enum initialization sequence in ${file}`)
          }
        }

        if (!(file in declarations)) {
          declarations[file] = []
        }
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
    defines,
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
    return [...new Set(stdout.split('\n').map((line) => line.split(':', 1)[0]))]
      .map((file) => path.resolve(options.scanDir, file))
      .filter((file) => matcher(file))
  }
}
