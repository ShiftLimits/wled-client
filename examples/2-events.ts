import { WLEDClient } from '../'
import { sleep, toggleExample, setInitialState } from './common';

function init() {
	console.log('Running Events Example...')

	const wled = new WLEDClient('192.168.80.103')
	wled.on('ready', () => {
		console.log(`Device ready: version ${wled.info.version}`)

		wled.on('update:state', () => {
			console.log('WLED State Updated')
		})

		console.log('Setting initial state...')
		setInitialState(wled)
		.then(() => sleep(1000))
		.then(() => {
			console.log('Running toggle example...')
			return toggleExample(wled)
		})
		.then(() => wled.disconnect())
		.catch(console.error) // Make sure you add catch to your promises!
	})
}

init()
