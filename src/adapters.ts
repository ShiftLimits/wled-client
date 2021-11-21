import { WLEDClientState, WLEDClientInfo, WLEDClientUpdatableState } from './types.client'
import { deepCloneTransform } from './utils'

const key_regexes = {}
function keyTransformer(transform_map:{[key:string]:any}) {
	return (key:string, value:any, path?:string):[string, any] => {
		const current_key_path = ((path ? path+'.' : '')+key)//.replaceAll(/\[[0-9]+\]/g, '[]') 

		const transform_map_key = Object.keys(transform_map).find((transform_key) => {
			if (!key_regexes[transform_key]) key_regexes[transform_key] = new RegExp('^'+(transform_key).replaceAll('.', '\\.').replaceAll('*', '[^_]+')+'$', 'm')
			return !!current_key_path.match(key_regexes[transform_key])
		})
		const transformed_key_path = transform_map_key ? transform_map[transform_map_key] : key

		let split_path = transformed_key_path.split('.')
		let transformed_key = split_path[split_path.length-1]
		return [transformed_key||key, value]
	}
}

//
// Info Adapters

const WLED_TO_CLIENT_INFO_MAP = {
	'ver': 'version',
	'vid': 'buildId',
	'leds': 'leds',
	'leds.count': 'leds.count',
	'leds.fps': 'leds.fps',
	'leds.rgbw': 'leds.rgbw',
	'leds.wv': 'leds.whiteValueInput',
	'leds.pin': 'leds.pin',
	'leds.pwr': 'leds.currentPower',
	'leds.maxpwr': 'leds.maxPower',
	'leds.maxseg': 'leds.maxSegments',
	'str': 'str',
	'name': 'name',
	'udpport': 'udpPort',
	'live': 'live',
	'lm': 'liveSource',
	'lip': 'liveIp',
	'ws': 'wsConnectedCount',
	'fxcount': 'effectsCount',
	'palcount': 'palettesCount',
	'wifi': 'wifi',
	'wifi.bssid': 'wifi.bssid',
	'wifi.rssi': 'wifi.rssi',
	'wifi.signal': 'wifi.signal',
	'wifi.channel': 'wifi.channel',
	'fs': 'fs',
	'fs.u': 'fs.used',
	'fs.t': 'fs.total',
	'fs.pmt': 'fs.presetsModifiedTime',
	'ndc': 'discoveredDevicesCount',
	'arch': 'arch',
	'core': 'core',
	'freeheap': 'freeheap',
	'uptime': 'uptime',
	'opt': 'opt',
	'brand': 'brand',
	'product': 'product',
	'mac': 'mac',
}
const CLIENT_TO_WLED_INFO_MAP = Object.fromEntries(
	Object.entries(WLED_TO_CLIENT_INFO_MAP).map(([key, value]) => [value, key]) // Flip key/value of above constant
)

const wledToClientInfoTransformer = keyTransformer(WLED_TO_CLIENT_INFO_MAP)
const clientToWLEDInfoTransformer = keyTransformer(CLIENT_TO_WLED_INFO_MAP)

export function wledToClientInfo(info:{}):WLEDClientInfo {
	return deepCloneTransform(info, wledToClientInfoTransformer) as WLEDClientInfo
}

export function clientToWLEDInfo(info:Partial<WLEDClientInfo>):{} {
	return deepCloneTransform(info, clientToWLEDInfoTransformer)
}

//
// State Adapters

const WLED_TO_CLIENT_STATE_MAP = {
	'on': 'on',
	'bri': 'brightness',
	'transition': 'transition',
	'tt': 'temporaryTransition',
	'ps': 'presetId',
	'psave': 'psave',
	'pl': 'playlistId',
	'ccnf': 'presetCycle',
	'ccnf.min': 'presetCycle.min',
	'ccnf.max': 'presetCycle.max',
	'ccnf.time': 'presetCycle.time',
	'nl': 'nightlight',
	'nl.on': 'nightlight.on',
	'nl.dur': 'nightlight.duration',
	'nl.fade': 'nightlight.fade',
	'nl.mode': 'nightlight.mode',
	'nl.tbri': 'nightlight.targetBrightness',
	'nl.rem': 'nightlight.remaining',
	'udpn': 'udpSync',
	'udpn.send': 'udpSync.send',
	'udpn.recv': 'udpSync.receive',
	'udpn.nn': 'udpSync.noSync',
	'lor': 'liveDataOverride',
	'mainseg': 'mainSegmentId',
	'seg': 'segments',
	'seg.*.id': 'segments.*.id',
	'seg.*.start': 'segments.*.start',
	'seg.*.stop': 'segments.*.stop',
	'seg.*.len': 'segments.*.length',
	'seg.*.grp': 'segments.*.grouping',
	'seg.*.spc': 'segments.*.spacing',
	'seg.*.col': 'segments.*.colors',
	'seg.*.fx': 'segments.*.effectId',
	'seg.*.sx': 'segments.*.effectSpeed',
	'seg.*.ix': 'segments.*.effectIntensity',
	'seg.*.pal': 'segments.*.paletteId',
	'seg.*.sel': 'segments.*.selected',
	'seg.*.rev': 'segments.*.reverse',
	'seg.*.on': 'segments.*.on',
	'seg.*.bri': 'segments.*.brightness',
	'seg.*.mi': 'segments.*.mirror',
	'seg.*.lx': 'segments.*.loxonePrimaryColor',
	'seg.*.ly': 'segments.*.loxoneSecondaryColor',
	'playlist': 'playlist',
	'playlist.ps': 'playlist.presets',
	'playlist.dur': 'playlist.durations',
	'playlist.transition': 'playlist.transition',
	'playlist.repeat': 'playlist.repeat',
	'playlist.end': 'playlist.end',
	'v': 'returnFullState',
	'rb': 'reboot',
	'time': 'time',
	'str': 'syncToggleReceive'
}
const CLIENT_TO_WLED_STATE_MAP = Object.fromEntries(
	Object.entries(WLED_TO_CLIENT_STATE_MAP).map(([key, value]) => [value, key]) // Flip key/value of above constant
)

const wledToClientStateTransformer = keyTransformer(WLED_TO_CLIENT_STATE_MAP)
const clientToWLEDStateTransformer = keyTransformer(CLIENT_TO_WLED_STATE_MAP)

export function wledToClientState(state:{}):WLEDClientState {
	return deepCloneTransform(state, wledToClientStateTransformer) as WLEDClientState
}

export function clientToWLEDState(state:Partial<WLEDClientState|WLEDClientUpdatableState>):{} {
	return deepCloneTransform(state, clientToWLEDStateTransformer)
}