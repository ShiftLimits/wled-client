import { WLEDClient } from "wled-client"

export async function setInitialState(wled:WLEDClient) {
	await wled.clearSegments()
	return wled.updateState({
		on: true,
		brightness: 255,
		mainSegmentId: 0,
		segments: [
			{
				effectId: 0,
				colors: [[255,255,255]],
				start: 0,
				stop: wled.info.leds.count
			}
		]
	})
}

export const sleep = (timeout:number) => new Promise(res => setTimeout(res, timeout))

/** Toggles the device, waits 2 seconds, then toggles it back. */
export async function toggleExample(wled:WLEDClient) {
	await wled.toggle()
	await sleep(2000)
	await wled.toggle()
}