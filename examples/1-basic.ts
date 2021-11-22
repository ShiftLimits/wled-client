import { WLEDClient } from '../'

import { sleep, toggleExample, setInitialState } from './common';

async function init() {
	console.log('Running Basic Example...')

	const wled = new WLEDClient('192.168.80.103')
	await wled.isReady
	console.log(`Device ready: version ${wled.info.version}`)

	console.log('Setting initial state...')
	await setInitialState(wled)

	await sleep(1000)

	console.log('Running toggle example...')
	await toggleExample(wled)

	wled.disconnect()
}

init().catch(console.error)
