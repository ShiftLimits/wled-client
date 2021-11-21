import { WLEDClient } from '../'

export const sleep = (timeout:number) => new Promise(res => setTimeout(res, timeout))

/** Toggles the device, waits 2 seconds, then toggles it back. */
export async function toggleExample(wled:WLEDClient) {
	await wled.toggle()
	await sleep(2000)
	await wled.toggle()
}