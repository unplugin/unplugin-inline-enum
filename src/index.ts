/**
 * This entry file is for main InlineEnum.
 * @module
 */

import { withMagicString } from 'rolldown-string'
import { createUnplugin, type UnpluginInstance } from 'unplugin'
import ReplacePlugin from 'unplugin-replace'
import { scanEnums } from './core/enum'
import { resolveOptions, type Options } from './core/options'

/**
 * The main unplugin instance.
 */
const InlineEnum: UnpluginInstance<Options | undefined, true> = createUnplugin<
  Options | undefined,
  true
>((rawOptions = {}, meta) => {
  const options = resolveOptions(rawOptions)
  const { declarations, defines } = scanEnums(options)

  const replacePlugin = Object.assign(
    ReplacePlugin.raw(
      {
        include: options.include,
        exclude: options.exclude,
        values: defines,
        ...options.replaceOptions,
      },
      meta,
    ),
    { name: 'unplugin-inline-enum:replace' },
  )

  const name = 'unplugin-inline-enum'
  return [
    {
      name,
      enforce: options.enforce,

      transform: {
        filter: {
          id: {
            include: options.include,
            exclude: options.exclude,
          },
        },
        handler: withMagicString((s, id) => {
          if (!(id in declarations)) return

          for (const declaration of declarations[id]) {
            const {
              range: [start, end],
              id,
              members,
            } = declaration
            // For numeric members with duplicate values, only the last one
            // gets a reverse mapping to avoid duplicate keys in the object literal.
            // This matches TypeScript's runtime behavior where later assignments overwrite earlier ones.
            const lastForValue = new Map<number, string>()
            for (const { name, value } of members) {
              if (typeof value === 'number') {
                lastForValue.set(value, name)
              }
            }
            s.update(
              start,
              end,
              `export const ${id} = {${members
                .flatMap(({ name, value }) => {
                  const forwardMapping = `${JSON.stringify(name)}: ${JSON.stringify(value)}`
                  const reverseMapping = `${JSON.stringify(value.toString())}: ${JSON.stringify(name)}`

                  // see https://www.typescriptlang.org/docs/handbook/enums.html#reverse-mappings
                  return typeof value === 'string'
                    ? [
                        forwardMapping,
                        // string enum members do not get a reverse mapping generated at all
                      ]
                    : lastForValue.get(value) === name
                      ? [
                          forwardMapping,
                          // numeric enum members get a reverse mapping (last wins)
                          reverseMapping,
                        ]
                      : [forwardMapping]
                })
                .join(',\n')}}`,
            )
          }
        }),
      },
    },
    replacePlugin,
  ]
})

export { InlineEnum, resolveOptions, type Options }
