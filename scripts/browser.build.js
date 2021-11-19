import { build } from 'esbuild'

build({
  entryPoints: ['./src/index.ts'],
  outfile: './dist/browser/wled-client.mjs',
  minify: true,
  bundle: true,
	format: 'esm',
	platform: 'browser'
}).then(() => build({
  entryPoints: ['./src/index.ts'],
  outfile: './dist/browser/wled-client.js',
  minify: true,
  bundle: true,
	format: 'iife',
	platform: 'browser',
	globalName: 'WLEDClient',
	banner: {
		'js': `(function (global, factory) {
			if (typeof exports === 'object' && typeof exports.nodeName !== 'string') {
					// CommonJS
					factory(exports);
			} else {
					// Browser globals
					factory(global);
			}
	}(typeof window !== "undefined" ? window : this, function(global) {`
	},
	footer: {
		'js': `global.WLEDClient = WLEDClient;
	}));`
	}
})).catch(() => process.exit(1))