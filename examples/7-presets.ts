import { WLEDClient } from '../'
import { sleep, setInitialState } from './common'

async function init() {
	console.log('Running Presets Example...')

	const wled = new WLEDClient('192.168.80.103')
	await wled.isReady
	console.log(`Device ready: version ${wled.info.version}`)

	console.log('Setting initial state...')
	await setInitialState(wled)

	await sleep(1000)

	console.log('Saving a new random preset for future use...')
	await wled.savePreset(244, {
		name: 'Example Preset',
		label: 'EP',
		brightness: Math.round(Math.random() * 255),
		transition: Math.round(Math.random() * 10),
		mainSegment: 0,
		segments: [
			{
				start: 0,
				stop: wled.info.leds.count,
				effectId: 8
			}
		]
	})

	await sleep(1000)

	console.log('Setting some random stuff...')
	await wled.setEffect(0)

	const red = Math.round(Math.random() * 255)
	const green = Math.round(Math.random() * 255)
	const blue = Math.round(Math.random() * 255)
	await wled.setColor([red, green, blue])

	await wled.setBrightness(Math.round(Math.random() * 255))

	await sleep(1000)

	console.log('Saving current state to preset...')
	await wled.saveStateAsPreset(245, { name: 'Example Current State Preset' })

	await sleep(5000)

	console.log('Setting random effects and colors...')
	await wled.setEffect(Math.round(Math.random() * (wled.effects.length-1)))
	await wled.setPalette(Math.round(Math.random() * (wled.palettes.length-1)))

	await sleep(5000)

	console.log('Setting to second saved preset.')
	await wled.setPreset(245)

	await sleep(5000)

	console.log('Setting to first saved preset.')
	await wled.setPreset(244)

	await sleep(5000)

	console.log('Resetting preset and removing examples created...')
	await wled.setPreset(0)
	await wled.deletePreset(244)
	await wled.deletePreset(245)
	await setInitialState(wled)

	wled.disconnect()
}

init().catch(console.error)
