import { WLEDClientOptions, WLEDClientContext } from './types.client'

export const DEFAULT_OPTIONS:WLEDClientOptions = {
	immediate: true,
	websocket: { reconnect: true },
	secure: false,
	host: ''
}

export const DEFAULT_CLIENT_CONTEXT:WLEDClientContext = {
	state: {
		nightlight: {},
		udpSync: {},
		segments: []
	},
	info: {
		leds: {},
		wifi: {},
		fs: {}
	},
	effects: [],
	palettes: [],
	presets: {},
	deviceOptions: {},
	live: {
		leds: false
	},
	config: {
		id: {},
		network: {},
		accessPoint: {},
		wifi: {},
		hardware: {},
		light: {},
		defaults: {},
		interfaces: {},
		overlay: {},
		timers: {},
		ota: {},
		usermods: {}
	}
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
	USERMOD_CRONIXIE: 0x10,
	DISABLE_FILESYSTEM: 0x08,
	DISABLE_HUESYNC: 0x04,
	ENABLE_ADALIGHT: 0x02,
	DISABLE_OTA: 0x01
}

//
// Config

export enum WLEDAPOpenBehavior {
	/** Open AP when there is no WiFi connection after boot */
	NO_CONNECTION_AFTER_BOOT,

	/** Open AP when disconnected from WiFi */
	DISCONNECTED,

	/** Always open the AP */
	AWLAYS,

	/** Never open the AP (not recommended) */
	NEVER
}

export enum WLEDAutoWhiteMode {
	NONE,
	BRIGHTER,
	ACCURATE,
	DUAL
}

export enum WLEDBusColorOrder {
	GRB,
	RGB,
	BRG,
	RBG,
	BGR,
	GBR
}

export enum WLEDBusType {
	WS281x = 22,
	SK6812_RGBW = 30,
	TM1814 = 31,
	KHZ400 = 24,
	WS2801 = 50,
	APA102 = 51,
	LPD8806 = 52,
	P9813 = 53,
	PWM_White = 41,
	PWM_CCT = 42,
	PWM_RGB = 43,
	PWM_RGBW = 44,
	PWM_RGB_CCT = 45,
	DDP_RGB_NETWORK = 80
}

export enum WLEDButtonType {
	DISABLED = 0,
	PUSHBUTTON = 2,
	PUSHBUTTON_INVERTED = 3,
	SWITCH = 4,
	PIR_SENSOR = 5,
	TOUCH = 6,
	ANALOG = 7,
	ANALOG_INVERTED = 8
}

export enum WLEDIRRemoteType {
	REMOTE_DISABLED,
	KEY_24_RGB,
	KEY_24_WITH_CT,
	KEY_40_BLUE,
	KEY_44_RGB,
	KEY_21_RGB,
	KEY_6_BLACK,
	KEY_9_RED,
	JSON_REMOTE
}

export enum WLEDPaletteBlendingMode {
	LINEAR_WRAP_IF_MOVING,
	LINEAR_ALWAYS_WRAP,
	LINEAR_NEVER_WRAP,
	NONE
}

export enum WLEDClockOverlay {
	NONE,
	ANALOG,
	DIGITAL
}

export enum WLEDDMXMode {
	DISABLED,
	SINGLE_RGB,
	SINGLE_DRGB,
	EFFECT,
	MULTI_RGB,
	DIMMER_MULTI_RGB,
	MULTI_RGBW
}
