import WLEDClient from '../../dist'

async function init() {
	console.log('Running Basic Example...')

	const wled = new WLEDClient('192.168.80.103')
	await wled.isReady

	console.log('Beginning effects rotation...')
	let effect_id = 0
	const rotateEffect = () => {
		console.log(`Updating effect to ${ wled.effects[effect_id] }`)
		wled.setEffect(effect_id)
		effect_id = (effect_id + 1) % wled.effects.length
	}

	let effect_rotator = setInterval(rotateEffect, 2500)
	rotateEffect()

	console.log('Beginning color rotation...')
	let palette_id = 0
	const rotatePalette = () => {
		console.log(`Updating palette to ${ wled.palettes[palette_id] }`)
		wled.setPalette(palette_id)
		palette_id = (palette_id + 1) % wled.palettes.length
	}

	let palette_rotator = setInterval(rotatePalette, 1000)
	rotatePalette()
}

init().catch(console.error)
