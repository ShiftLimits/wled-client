import type { Options } from 'tsup'

export const tsup:Options = {
	dts: true,
  splitting: true,
  sourcemap: true,
	minify: false,
	outDir: 'dist/node',
	format: ['cjs', 'esm'],
  entryPoints: {
		'wled-client': 'src/index.ts'
	}
}
