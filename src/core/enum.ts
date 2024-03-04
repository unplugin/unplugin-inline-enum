import path from 'node:path'
import assert from 'node:assert'
import { readFileSync } from 'node:fs'
import { execaSync } from 'execa'
import { babelParse, getLang, isTs } from 'ast-kit'
import fg from 'fast-glob'
import picomatch from 'picomatch'
import type { Expression, PrivateName } from '@babel/types'
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
    const lang = getLang(file)
    if (!isTs(lang)) continue

    const content = readFileSync(file, 'utf-8')
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

        let lastInitialized: string | number | undefined
        const members: Array<EnumMember> = []

        for (let i = 0; i < decl.members.length; i++) {
          const e = decl.members[i]
          const key = e.id.type === 'Identifier' ? e.id.name : e.id.value
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
            if (
              init.type === 'StringLiteral' ||
              init.type === 'NumericLiteral'
            ) {
              value = init.value
            }
            // e.g. 1 << 2
            else if (init.type === 'BinaryExpression') {
              const resolveValue = (node: Expression | PrivateName) => {
                assert.ok(typeof node.start === 'number')
                assert.ok(typeof node.end === 'number')
                if (
                  node.type === 'NumericLiteral' ||
                  node.type === 'StringLiteral'
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
            } else if (init.type === 'UnaryExpression') {
              if (
                init.argument.type === 'StringLiteral' ||
                init.argument.type === 'NumericLiteral'
              ) {
                const exp = `${init.operator}${init.argument.value}`
                value = evaluate(exp)
              } else {
                throw new Error(
                  `unhandled UnaryExpression argument type ${init.argument.type} in ${file}`,
                )
              }
            } else {
              throw new Error(
                `unhandled initializer type ${init.type} for ${fullKey} in ${file}`,
              )
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
    return fg.sync(options.scanPattern, {
      cwd: options.scanDir,
      absolute: true,
    })
  } else {
    const { stdout, stderr, exitCode } = execaSync(
      'git',
      ['grep', '--untracked', 'export enum'],
      {
        cwd: options.scanDir,
        reject: false,
      },
    )
    if (exitCode !== 0) {
      if (stderr) throw new Error(`git grep failed: ${stderr}`)
      else return []
    }

    const matcher = picomatch(options.scanPattern)
    return [...new Set(stdout.split('\n').map((line) => line.split(':')[0]))]
      .map((file) => path.resolve(options.scanDir, file))
      .filter((file) => matcher(file))
  }
}
