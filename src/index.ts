import { createUnplugin } from 'unplugin'
import { createFilter } from '@rollup/pluginutils'
import MagicString from 'magic-string'
import ReplacePlugin from 'unplugin-replace'
import { type Options, resolveOption } from './core/options'
import { scanEnums } from './core/enum'

export default createUnplugin<Options | undefined, true>(
  (rawOptions = {}, meta) => {
    const options = resolveOption(rawOptions)
    const filter = createFilter(options.include, options.exclude)

    const { declarations, defines } = scanEnums(options)

    const replacePlugin = ReplacePlugin.raw(
      {
        include: options.include,
        exclude: options.exclude,
        values: defines,
      },
      meta,
    )

    const name = 'unplugin-inline-enum'
    return [
      replacePlugin,
      {
        name,
        enforce: options.enforce,

        transformInclude(id) {
          return filter(id)
        },

        transform(code, id) {
          let s: MagicString | undefined

          if (id in declarations) {
            s ||= new MagicString(code)
            for (const declaration of declarations[id]) {
              const {
                range: [start, end],
                id,
                members,
              } = declaration
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
                      : [
                          forwardMapping,
                          // other enum members should support enum reverse mapping
                          reverseMapping,
                        ]
                  })
                  .join(',\n')}}`,
              )
            }
          }

          if (s) {
            return {
              code: s.toString(),
              map: s.generateMap(),
            }
          }
        },
      },
    ]
  },
)
