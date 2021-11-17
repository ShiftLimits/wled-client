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
