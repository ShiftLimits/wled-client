import { WLEDClient, WLEDNightlightMode } from '../../'

import { sleep, toggleExample } from '../common'

async function init() {
	console.log('Running Basic Example...')

	const wled = new WLEDClient('192.168.80.103')
	await wled.isReady
	console.log(`Device ready: version ${wled.info.version}`)

	console.log('Setting initial state...')
	await wled.updateState({
		on: true,
		brightness: 255
	})

	await sleep(1000)

	console.log('Activating nightlight for 1 minute. Should stay on for 1 minute while fading to dark.')
	await wled.nightlight.enable({
		targetBrightness: 0,
		mode: WLEDNightlightMode.FADE,
		duration: 1
	})

	console.log('Listening for brightness...')
	await new Promise(res => {
		wled.on('update:state', (state) => {
			console.log(`New brightness: ${ state.brightness }`)
			if (state.on == false) {
				console.log('Device turned off.')
				res(undefined)
			}
		})
	})

	wled.disconnect()
}

init().catch(console.error)
