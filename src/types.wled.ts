import { WLEDNightlightMode, WLEDLiveDataOverride } from './constants'
import { RGBColor, RGBWColor } from './types'
import { PartialDeep } from 'type-fest'

//
// Segment Interfaces
//

export interface WLEDSegmentSendOnly {
	/** Zero-indexed ID of the segment. May be omitted, in that case the ID will be inferred from the order of the segment objects in the seg array. */
	id:number

	/** Individual LED control. */
	i:number|[number,number,number][]
}

export interface WLEDSegment {
	/**
	 * LED index that the segment starts at.
	 * @type {number} 0 to `info.leds.count`-1
	 */
	start:number

	/**
	 * LED the segment stops at, not included in range. If stop is set to a lower or equal value than start (setting to `0` is recommended), the segment is invalidated and deleted.
	 * @type {number} 0 to `info.leds.count`
	 */
	stop:number

	/**
	 * Length of the segment (`stop` - `start`). `stop` has preference, so if it is included, `len` is ignored.
	 * @type {number} 0 to info.leds.count
	 */
	len:number

	/**
	 * Grouping - how many consecutive LEDs of the same segment will be grouped to the same color.
	 * @type {number} 0 to 255
	 */
	grp:number

	/**
	 * Spacing - how many LEDs are turned off and skipped between each group.
	 * @type {number} 0 to 255
	 */
	spc:number

	/** Array that has up to 3 color arrays as elements, the primary, secondary (background) and tertiary colors of the segment. Each color is an array of 3 or 4 bytes, which represent an RGB(W) color. */
	col:(RGBColor|RGBWColor)[]

	/**
	 * ID of the effect on the individual segment.
	 * @type {number} 0 to `info.fxcount`-1
	 */
	fx:number

	/**
	 * Relative effect speed
	 * @type {number} 0 to 255
	 */
	sx:number

	/**
	 * Effect intensity
	 * @type {number} 0 to 255
	 */
	ix:number

	/**
	 * ID of the color palette on the individual segment.
	 * @type {number} 0 to `info.palcount`-1
	 */
	pal:number

	/**
	 * `true` if the segment is selected. Selected segments will have their state (color/FX) updated by APIs that don't support segments (currently any API except this JSON API).
	 *
	 * If no segment is selected, the first segment (id: `0`) will behave as if selected. WLED will report the state of the first (lowest id) segment that is selected to APIs (UDP sync, HTTP, MQTT, Blynk...).
	 */
	sel:boolean

	/** Reverses the segment, causing animations to change direction. */
	rev:boolean

	/** Turns on and off the individual segment. */
	on:boolean

	/** Sets the brightness of the individual segment. */
	bri:number

	/** Mirrors the individual segment. */
	mi:boolean

	/** Loxone RGB value for primary color. Each color (RRR,GGG,BBB) is specified in the range from 0 to 100%. */
	lx:number

	/** Loxone RGB value for secondary color. Each color (RRR,GGG,BBB) is specified in the range from 0 to 100%. */
	ly:number
}

//
// Playlist Interfaces
//

export interface WLEDPlaylist {
	/** Array of preset ID integers to be applied in order. */
	ps:number[]

	/** Array of time each preset should be kept, in tenths of seconds. If only one integer is supplied, all presets will be kept for that time. Defaults to 10 seconds if not provided. */
	dur:number[]

	/** Array of time each preset should transition to the next one, in tenths of seconds. If only one integer is supplied, all presets will transition for that time. Defaults to the current transition time if not provided. */
	transition:number|number[]

	/** How many times the entire playlist should cycle before finishing. Set to `0` for an indefinite cycle. Default to indefinite if not provided. */
	repeat:number

	/** Single preset ID to apply after the playlist finished. Has no effect when an indefinite cycle is set. If not provided, the light will stay on the last preset of the playlist. */
	end:number
}

//
// State Interfaces
//

export interface WLEDStateSendOnly {
	/** Transition time for the current API call only. */
	tt:number

	udpn: {
		/** Don't send a UDP Sync broadcast packet for the current API call only. */
		nn:boolean
	}

	/** ID of the preset slot to save to. */
	psave:number

	/** ID of the preset to delete. */
	pdel:number

	/** Sets flag includeBri */
	ib:boolean

	/** Sets flag segmentBounds */
	sb:boolean

	/** Build new state when saving preset. */
	o:boolean

	/** If set to `true` in a JSON POST command, the response will contain the full JSON state object. */
	v:boolean

	/** If set to `true`, device will reboot immediately. */
	rb:boolean

	/** Set module time to unix timestamp. */
	time:number

	seg:WLEDSegmentSendOnly[]

	/** Set playlist. */
	playlist:WLEDPlaylist
}

export interface WLEDStateReceiveOnly {
	/** Error flag that may be set when some issues are encountered in WLED. */
	error:string,

	nightlight:{
		/** Remaining nightlight duration in seconds, `-1` if not active. */
		rem:number
	}
}

export interface WLEDPresetCycleState {
	min:number
	max:number
	time:number
}

export interface WLEDNightlightState {
	/** Whether or not nightlight is currently active. */
	on:boolean

	/**
	 * Duration of the nightlight in minutes.
	 * @type {number} 1 to 255
	 */
	dur:number

	/**
	 * If `true`, the light will gradually dim over the course of the nightlight duration. If `false`, it will instantly turn to the target brightness once the duration has elapsed.
	 * @deprecated Will be removed in 0.13, use `mode` instead
	 */
	fade:boolean

	/**
	 * Nightlight mode
	 * @type {WLEDNightlightMode} 0: Instant, 1: Fade, 2: Color fade, 3: Sunrise
	 */
	mode:WLEDNightlightMode

	/**
	 * Target brightness of the nightlight
	 * @type {number} 0 to 255
	 */
	tbri:number
}

export interface WLEDExchangeableState {
	/** Device's current power state. */
	on:boolean

	/**
	 * Device's current brightness.
	 * @type {number} Between 0 and 255.
	 */
	bri:number

	/** Device's current transition time. */
	transition:number

	/** ID of the device's current preset. */
	ps:number

	/** ID of the device's current playlist. */
	pl:number

	/**
	 * Preset Cycle state object.
	 * @deprecated Will be removed in 0.13, use playlists instead
	 */
	ccnf:WLEDPresetCycleState

	/** Nightlight feature state object. */
	nl:WLEDNightlightState

	/** UDP Sync state object. */
	udpn: {
		/** Send UDP Sync broadcast packet on state change. */
		send:boolean

		/** Receive UDP Sync broadcast packets. */
		recv:boolean
	}

	/**
	 * Live data override.
	 * @type {WLEDLiveDataOverride} 0: Off, 1: Override until data ends, 2: Override until reboot
	 */
	lor:WLEDLiveDataOverride

	/**
	 * ID of the main segment.
	 * @type {number} 0 to `info.leds.maxseg`-1
	 */
	mainseg:number

	/**
	 * Array of segments.
	 */
	seg:WLEDSegment[]
}

export type WLEDUpdatableState = PartialDeep<WLEDExchangeableState & WLEDStateSendOnly>
export type WLEDState = WLEDExchangeableState & WLEDStateReceiveOnly

//
// Info Interfaces
//

export interface WLEDInfoLEDs {
	/**
	 * Total number of LEDs.
	 * @type {number} 1 to 1200
	 */
	count:number

	/**
	 * Current frames per second.
	 * @type {number} 0 to 255
	 */
	fps:number

	/** `true` if LEDs are 4-channel (RGBW). */
	rgbw:boolean

	/** `true` if a white channel slider should be displayed. */
	wv:boolean

	/**
	 * One or more LED strip pins.
	 * @deprecated Will be removed in 0.13
	 */
	pin:[number]&number[]

	/**
	 * Current LED power usage in milliamps as determined by the ABL. `0` if ABL is disabled.
	 * @type {number} 0 to 65000
	 */
	pwr:number

	/**
	 * Maximum power budget in milliamps for the ABL. `0` if ABL is disabled.
	 * @type {number} 0 to 65000
	 */
	maxpwr:number

	/** Maximum number of segments supported by this version. */
	maxseg:number
}

export interface WLEDInfo {
	/** Device's WLED version name. */
	ver:string

	/** Device's WLED build ID. (YYMMDDB, B = daily build index) */
	vid:number

	/** The producer/vendor of the light. Always `WLED` for standard installations. */
	brand:string

	/** The product name. Always `FOSS` for standard installations. */
	product:string

	/** Device's individual name. Intended for display in lists and titles. */
	name:string

	/** Name of the platform. */
	arch:string

	/** Version of the underlying (Arduino core) SDK. */
	core:string

	/** Bytes of heap memory (RAM) currently available. Problematic if more than `10k`. */
	freeheap:number

	/** Time since the last boot/reset in seconds. */
	uptime:number

	/** The hexadecimal hardware MAC address of the device. Lowercase and without colons. */
	mac:string

	/** The UDP port for realtime packets and WLED broadcast. */
	udpport:number

	/** Info on the device's physical LED setup. */
	leds:WLEDInfoLEDs

	/** If `true`, the software is currently receiving realtime data via UDP or E1.31. */
	live:boolean

	/** Source of the realtime data. */
	lm:string

	/** IP of the realtime data source.  */
	lip:string

	/**
	 * Number of other WLED devices discovered on the network. `-1` if Node discovery disabled.
	 * @type {number} -1 to 255
	 */
	ndc:number

	/**
	 * Current number of WebSocket clients connected to the device.
	 * @type {number} -1 to 8
	 */
	ws:number

	/** Number of effects available on the device. */
	fxcount:number

	/** Number of color palettes available on the device. */
	palcount:number

	/** Info on the device's WiFi connection. */
	wifi:{
		/** Basic service set identifier of the currently connected network. */
		bssid:string

		/** Received signal strength indicator. */
		rssi:number

		/**
		 * Relative signal quality of the current connection.
		 * @type {number} 0 to 100
		 */
		signal:number

		/**
		 * The current WiFi channel.
		 * @type {number} 1 to 14
		 */
		channel:number
	}

	/** Info about the embedded LittleFS filesystem. */
	fs:{
		/** Estimate of used filesystem space in kilobytes. */
		u:number

		/** Total filesystem size in kilobytes. */
		t:number

		/** Unix timestamp for the last modification to the `presets.json` file. Not accurate after boot or after using `/edit`. */
		pmt:number
	}

	/** If `true`, an UI with only a single button for toggling sync should toggle receive+send, otherwise send only. */
	str:boolean

	/** Bit field of options that WLED is configured with. */
	opt:number

	/**
	 * Version of LwIP. `1` or `2` on ESP8266, `0` (does not apply) on ESP32.
	 * @deprecated Will be removed in 0.14
	 */
	lwip:0|1|2
}

export type WLEDEffects = string[]
export type WLEDPalettes = string[]

//
// Live Interface
//

export interface WLEDLive {
	/** List of color values from every `n`th LED attached to the device. */
	leds:string[]

	/** If the number of LEDs is more than device's supported number of live LEDs, then WLED will send every `n`th LED. */
	n:number
}

//
// Presets
//

export interface WLEDPreset {
	/**
	 * Name
	 */
	n:string

	/**
	 * Quick load label
	 */
	ql:string

	/**
	 * Device's power state
	 */
	on:boolean

	/**
	 * Brightness
	 */
	bri:number

	/**
	 * Transition time
	 */
	transition:number

	/**
	 * Main segment ID
	 */
	mainseg:number

	/**
	 * Segments configuration
	 */
	segments:WLEDSegment[]
}

export type WLEDPresets = { [key:number]: WLEDPreset } // WLED returns an object from the presets file

export interface WLEDContext {
	/** WLED state object. */
	state:WLEDState
	/** WLED info object */
	info: WLEDInfo
	/** List of effects available on the device. */
	effects:WLEDEffects
	/** List of color palettes available on the device. */
	palettes:WLEDPalettes
}
