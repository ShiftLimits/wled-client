import WLEDClient, { WLEDClientSegment } from '../../dist'

const sleep = (timeout:number) => new Promise(res => setTimeout(res, timeout))
async function init() {
	console.log('Running Segments Example...')

	const wled = new WLEDClient('192.168.80.103')
	await wled.isReady
	console.log(`Device ready: version ${wled.info.version}`)
	const max_segments = wled.info.leds.maxSegments
	const n_leds = wled.info.leds.count
	const n_effects = wled.info.effectsCount

	console.log('Clearing all segments...')
	await wled.clearSegments()
	await sleep(2000)

	let effectId = Math.round(Math.random() * n_effects)
	console.log(`Creating new segment spanning the whole strip with effect ${ wled.effects[effectId] }...`)
	await wled.createSegment({ start: 0, stop: n_leds, brightness: 255, effectId })
	await sleep(2000)

	effectId = Math.round(Math.random() * n_effects)
	console.log(`Creating second segment spanning half the strip with effect ${ wled.effects[effectId] }...`)
	await wled.createSegment({ start: Math.floor(n_leds/2), stop: n_leds, brightness: 255, effectId })
	await sleep(2000)

	console.log('Deleting last segment added...')
	await wled.deleteSegment(1)
	await sleep(2000)

	effectId = Math.round(Math.random() * n_effects)
	console.log(`Updating first segment to new effect ${ wled.effects[effectId] }`)
	await wled.updateSegment(0, { effectId })


	console.log('Creating random segments...')

	function randomSegments() {
		const n_segments = Math.round(Math.random() * (max_segments - 1)) + 1
		const n_leds_per_segment = Math.floor(n_leds / n_segments)
		const segments:Partial<WLEDClientSegment>[] = []

		for (let i = 0; i < n_segments; i++) {
			const start = i * n_leds_per_segment
			const stop = start + n_leds_per_segment

			const segment:Partial<WLEDClientSegment> = {
				start,
				stop,
				brightness: Math.round(Math.random() * 255),
				colors:[
					[255,0,0],
					[0,255,0],
					[0,0,255]
				],
				effectId: Math.round(Math.random() * n_effects)
			}
			segments.push(segment)
		}

	// segments.push(...Array.from({ length: max_segments - n_segments }, () => ({ stop: 0 }))) // Fill the remaining segments with delete commands

		wled.setSegments(segments)
		console.log(`Generated ${ n_segments } segments with ${ n_leds_per_segment } LEDs each.`)
	}

	setInterval(randomSegments, 2500)
}

init().catch(console.error)
