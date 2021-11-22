import { WLEDClientOptions } from './types.client'

export const DEFAULT_OPTIONS:WLEDClientOptions = {
	websocket: { reconnect: true },
	secure: false,
	host: ''
}

export enum WLEDEndpoints {
	HTTP = 'win',
	JSON = 'json',
	WS = 'ws'
}

export enum WLEDNightlightMode {
	INSTANT,
	FADE,
	COLOR_FADE,
	SUNRISE
}

export enum WLEDLiveDataOverride {
	OFF,
	UNTIL_END,
	UNTIL_REBOOT
}

export const WLEDDeviceOptionMasks = {
	DEBUG: 0x80,
	DISABLE_ALEXA: 0x40,
	DISABLE_BLYNK: 0x20,
	DISABLE_CRONIXIE: 0x10,
	DISABLE_FILESYSTEM: 0x08,
	DISABLE_HUESYNC: 0x04,
	ENABLE_ADALIGHT: 0x02,
	DISABLE_OTA: 0x01
}
