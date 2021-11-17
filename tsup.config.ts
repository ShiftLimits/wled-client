import type { Options } from 'tsup'

export const tsup:Options = {
	dts: true,
  splitting: true,
  sourcemap: true,
	minify: true,
	format: ['cjs', 'esm'],
	globalName: 'WLEDClient',
  entryPoints: [
		'src/index.ts'
	]
}
