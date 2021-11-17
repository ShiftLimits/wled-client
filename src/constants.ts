import { WLEDClientOptions } from './types.client'

export const DEFAULT_OPTIONS:WLEDClientOptions = {
	websocket: true,
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
