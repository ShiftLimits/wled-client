import WLEDClient from '../../dist'
import { sleep, toggleExample } from '../common'

async function init() {
	console.log('Running WebSocket Example...')
	const wled = new WLEDClient('192.168.80.103')
	await wled.isReady

	wled.on('update:state', () => {
		console.log('WLED State Updated')
	})

	wled.on('live', ({ leds, n }) => {
		console.log('Got live event. LED count:', leds.length)
	})

	console.log('Starting live stream')
	await wled.startLiveStream()

	await sleep(2500)

	console.log('Stopping live stream')
	await wled.stopLiveStream()

	await sleep(1000)
	console.log('Disconnecting from WebSocket...')
	wled.disconnect()
	await sleep(1000)

	console.log('Running toggle example via JSON...')
	await toggleExample(wled)

	await sleep(1000)

	console.log('Reconnecting to WebSocket...')
	await wled.connect()

	await sleep(1000)

	console.log('New client with WebSockets disabled from the start...')
	const wled_json = new WLEDClient({
		host: '192.168.80.103',
		websocket: false
	})
	await wled_json.isReady
	console.log(`Device ready: version ${wled_json.info.version}`)

	console.log('Setting initial state...')
	await wled_json.updateState({
		on: true,
		brightness: 255
	})

	await sleep(1000)

	console.log('Running toggle example...')
	await toggleExample(wled_json)

	await sleep(1000)

	wled.disconnect()
}

init()
