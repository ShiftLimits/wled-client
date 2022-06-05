import { WLEDClientState, WLEDClientInfo, WLEDClientUpdatableState, WLEDClientPresets, WLEDClientDeviceOptions, WLEDClientLightCapabilities, WLEDClientConfig, WLEDClientUpdatableConfig } from './types.client';
import { deepCloneTransform } from './utils'
import { WLEDPresets, WLEDInfo, WLEDConfig } from './types.wled';
import { WLEDDeviceOptionMasks, WLEDLightCapabilityMasks } from './constants'

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
// Device Capabilities

export function wledToClientLightCapabilities(options:number):WLEDClientLightCapabilities {
	return {
		cct: !!(options & WLEDLightCapabilityMasks.CCT),
		white: !!(options & WLEDLightCapabilityMasks.WHITE),
		rgb: !!(options & WLEDLightCapabilityMasks.RGB)
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
	'leds.cct': 'leds.cct',
	'leds.wv': 'leds.whiteValueInput',
	'leds.lc': 'leds.lightCapabilities',
	'leds.seglc': 'leds.segmentLightCapabilities',
	'leds.pwr': 'leds.currentPower',
	'leds.maxpwr': 'leds.maxPower',
	'leds.maxseg': 'leds.maxSegments',
	'str': 'syncToggleReceive',
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
	'wifi.txPower': 'wifi.txPower',
	'wifi.sleep': 'wifi.sleep',
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
	'opt': 'options',
	'resetReason': 'resetReason',
	'resetReason0': 'resetReason0',
	'resetReason1': 'resetReason1',
	'brand': 'brand',
	'product': 'product',
	'mac': 'mac'
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
	'error': 'error',
	'on': 'on',
	'bri': 'brightness',
	'transition': 'transition',
	'tt': 'temporaryTransition',
	'ps': 'presetId',
	'n': 'name',
	'psave': 'savePresetId',
	'pdel': 'deletePresetId',
	'ib': 'includeBrightness',
	'sb': 'segmentBounds',
	'o': 'overwriteState',
	'ql': 'label',
	'pl': 'playlistId',
	'nl': 'nightlight',
	'nl.on': 'nightlight.on',
	'nl.dur': 'nightlight.duration',
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
	'seg.*.n': 'segments.*.name',
	'seg.*.start': 'segments.*.start',
	'seg.*.stop': 'segments.*.stop',
	'seg.*.len': 'segments.*.length',
	'seg.*.of': 'segments.*.offset',
	'seg.*.grp': 'segments.*.grouping',
	'seg.*.spc': 'segments.*.spacing',
	'seg.*.rpt': 'segments.*.repeat',
	'seg.*.frz': 'segments.*.freeze',
	'seg.*.col': 'segments.*.colors',
	'seg.*.cct': 'segments.*.cct',
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
	'time': 'time'
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

//
// Preset Adapters

const WLED_TO_CLIENT_PRESET_MAP = {
	'*.n': '*.name',
	'*.ql': '*.label',
	'*.on': '*.on',
	'*.bri': '*.brightness',
	'*.transition': '*.transition',
	'*.mainseg': '*.mainSegment',
	'*.seg': '*.segments',
	'*.seg.*.id': '*.segments.*.id',
	'*.seg.*.start': '*.segments.*.start',
	'*.seg.*.stop': '*.segments.*.stop',
	'*.seg.*.len': '*.segments.*.length',
	'*.seg.*.grp': '*.segments.*.grouping',
	'*.seg.*.spc': '*.segments.*.spacing',
	'*.seg.*.rpt': '*.segments.*.repeat',
	'*.seg.*.frz': '*.segments.*.freeze',
	'*.seg.*.col': '*.segments.*.colors',
	'*.seg.*.fx': '*.segments.*.effectId',
	'*.seg.*.sx': '*.segments.*.effectSpeed',
	'*.seg.*.ix': '*.segments.*.effectIntensity',
	'*.seg.*.pal': '*.segments.*.paletteId',
	'*.seg.*.sel': '*.segments.*.selected',
	'*.seg.*.rev': '*.segments.*.reverse',
	'*.seg.*.on': '*.segments.*.on',
	'*.seg.*.bri': '*.segments.*.brightness',
	'*.seg.*.mi': '*.segments.*.mirror',
	'*.seg.*.lx': '*.segments.*.loxonePrimaryColor',
	'*.seg.*.ly': '*.segments.*.loxoneSecondaryColor',
}
const CLIENT_TO_WLED_PRESET_MAP = Object.fromEntries(
	Object.entries(WLED_TO_CLIENT_PRESET_MAP).map(([key, value]) => [value, key]) // Flip key/value of above constant
)

const wledToClientPresetTransformer = keyTransformer(WLED_TO_CLIENT_PRESET_MAP)
const clientToWLEDPresetTransformer = keyTransformer(CLIENT_TO_WLED_PRESET_MAP)

export function wledToClientPresets(presets:WLEDPresets):WLEDClientPresets {
	return deepCloneTransform(presets, wledToClientPresetTransformer) as WLEDClientPresets
}

export function clientToWLEDPresets(presets:WLEDClientPresets):WLEDPresets {
	return deepCloneTransform(presets, clientToWLEDPresetTransformer) as WLEDPresets
}

//
// Device Options

export function wledToClientDeviceOptions(options:WLEDInfo['opt']):WLEDClientDeviceOptions {
	return {
		debug: !!(options & WLEDDeviceOptionMasks.DEBUG),
		alexa: !!(options & WLEDDeviceOptionMasks.DISABLE_ALEXA),
		blynk: !!(options & WLEDDeviceOptionMasks.DISABLE_BLYNK),
		cronixie: !!(options & WLEDDeviceOptionMasks.USERMOD_CRONIXIE),
		filesystem: !!(options & WLEDDeviceOptionMasks.DISABLE_FILESYSTEM),
		huesync: !!(options & WLEDDeviceOptionMasks.DISABLE_HUESYNC),
		adalight: !(options & WLEDDeviceOptionMasks.ENABLE_ADALIGHT),
		OTA: !!(options & WLEDDeviceOptionMasks.DISABLE_OTA)
	}
}

//
// Device Config Adapters

const WLED_TO_CLIENT_CONFIG_MAP = {
	'eth': 'ethernet',
	'eth.type': 'ethernet.type',
	'id': 'id',
	'id.mdns': 'id.mdns',
	'id.name': 'id.name',
	'id.inv': 'id.invocationName',
	'nw': 'network',
	'nw.ins': 'nw.instances',
	'nw.ins.*.ssid': 'nw.instances.*.ssid',
	'nw.ins.*.ip': 'nw.instances.*.ip',
	'nw.ins.*.gw': 'nw.instances.*.gateway',
	'nw.ins.*.sn': 'nw.instances.*.subnet',
	'ap': 'accessPoint',
	'ap.ssid': 'accessPoint.ssid',
	'ap.chan': 'accessPoint.channel',
	'ap.hide': 'accessPoint.hide',
	'ap.behav': 'accessPoint.openBehavior',
	'wifi': 'wifi',
	'wifi.sleep': 'wifi.sleep',
	'hw': 'hardware',
	'hw.led': 'hardware.led',
	'hw.led.maxpwr': 'hardware.led.maxCurrent',
	'hw.led.ledma': 'hardware.led.maxCurrentPerLED',
	'hw.led.rgbwm': 'hardware.led.autoWhiteMode',
	'hw.led.cct': 'hardware.led.cctCorrection',
	'hw.led.cr': 'hardware.led.cctFromRGB',
	'hw.led.cb': 'hardware.led.cctBlending',
	'hw.led.fps': 'hardware.led.fps',
	'hw.led.ins': 'hardware.led.instances',
	'hw.led.ins.*.type': 'hardware.led.instances.*.type',
	'hw.led.ins.*.start': 'hardware.led.instances.*.start',
	'hw.led.ins.*.len': 'hardware.led.instances.*.length',
	'hw.led.ins.*.skip': 'hardware.led.instances.*.skip',
	'hw.led.ins.*.order': 'hardware.led.instances.*.colorOrder',
	'hw.led.ins.*.pin': 'hardware.led.instances.*.pins',
	'hw.led.ins.*.ref': 'hardware.led.instances.*.offRefresh',
	'hw.led.ins.*.rev': 'hardware.led.instances.*.reverse',
	'hw.led.ins.*.rgbw': 'hardware.led.instances.*.rgbw',
	'hw.btn': 'hardware.button',
	'hw.btn.max': 'hardware.button.max',
	'hw.btn.ins': 'hardware.button.instances',
	'hw.btn.ins.*.type': 'hardware.button.instances.*.type',
	'hw.btn.ins.*.pin': 'hardware.button.instances.*.pin',
	'hw.btn.ins.*.macros': 'hardware.button.instances.*.macros',
	'hw.btn.tt': 'hardware.button.touchThreshold',
	'hw.btn.mqtt': 'hardware.button.mqtt',
	'hw.ir': 'hardware.ir',
	'hw.pin': 'hardware.pin',
	'hw.type': 'hardware.type',
	'hw.relay': 'hardware.relay',
	'hw.relay.pin': 'hardware.relay.pin',
	'hw.relay.rev': 'hardware.relay.reverse',
	'light': 'light',
	'light.scale-bri': 'light.scaleBrightness',
	'light.pal-mode': 'light.paletteBlendingMode',
	'light.aseg': 'light.autoSegments',
	'light.gc': 'light.gammaCorrection',
	'light.gc.bri': 'light.gammaCorrection.brightness',
	'light.gc.col': 'light.gammaCorrection.color',
	'light.tr': 'light.transition',
	'light.tr.mode': 'light.transition.enabled',
	'light.tr.dur': 'light.transition.duration',
	'light.tr.pal': 'light.transition.palettes',
	'light.nl': 'light.nightlight',
	'light.nl.mode': 'light.nightlight.mode',
	'light.nl.dur': 'light.nightlight.duration',
	'light.nl.tbri': 'light.nightlight.targetBrightness',
	'def': 'defaults',
	'def.ps': 'defaults.preset',
	'def.on': 'defaults.on',
	'def.bri': 'defaults.brightness',
	'if': 'interfaces',
	'if.blynk': 'interfaces.blynk',
	'if.blynk.host': 'interfaces.blynk.host',
	'if.blynk.port': 'interfaces.blynk.port',
	'if.blynk.token': 'interfaces.blynk.token',
	'if.hue': 'interfaces.hue',
	'if.hue.en': 'interfaces.hue.enabled',
	'if.hue.id': 'interfaces.hue.id',
	'if.hue.ip': 'interfaces.hue.ip',
	'if.hue.iv': 'interfaces.hue.interval',
	'if.hue.recv': 'interfaces.hue.receive',
	'if.hue.recv.on': 'interfaces.hue.receive.on',
	'if.hue.recv.bri': 'interfaces.hue.receive.brightness',
	'if.hue.recv.col': 'interfaces.hue.receive.color',
	'if.live': 'interfaces.live',
	'if.live.dmx': 'interfaces.live.dmx',
	'if.live.dmx.addr': 'interfaces.live.dmx.address',
	'if.live.dmx.mode': 'interfaces.live.dmx.mode',
	'if.live.dmx.seqskip': 'interfaces.live.dmx.sequenceSkip',
	'if.live.dmx.uni': 'interfaces.live.dmx.universe',
	'if.live.mc': 'interfaces.live.multicast',
	'if.live.port': 'interfaces.live.port',
	'if.live.en': 'interfaces.live.enabled',
	'if.live.maxbri': 'interfaces.live.maxBrightness',
	'if.live.no-gc': 'interfaces.live.noGammaCorrection',
	'if.live.offset': 'interfaces.live.offset',
	'if.live.timeout': 'interfaces.live.timeout',
	'if.mqtt': 'interfaces.mqtt',
	'if.mqtt.en': 'interfaces.mqtt.enabled',
	'if.mqtt.broker': 'interfaces.mqtt.broker',
	'if.mqtt.port': 'interfaces.mqtt.port',
	'if.mqtt.cid': 'interfaces.mqtt.clientId',
	'if.mqtt.user': 'interfaces.mqtt.user',
	'if.mqtt.topics': 'interfaces.mqtt.topics',
	'if.mqtt.topics.device': 'interfaces.mqtt.topics.device',
	'if.mqtt.topics.group': 'interfaces.mqtt.topics.group',
	'if.nodes': 'interfaces.nodes',
	'if.nodes.list': 'interfaces.nodes.list',
	'if.nodes.bcast': 'interfaces.nodes.broadcast',
	'if.ntp': 'interfaces.ntp',
	'if.ntp.en': 'interfaces.ntp.enabled',
	'if.ntp.host': 'interfaces.ntp.host',
	'if.ntp.ampm': 'interfaces.ntp.ampm',
	'if.ntp.tz': 'interfaces.ntp.timezone',
	'if.ntp.ln': 'interfaces.ntp.lon',
	'if.ntp.lt': 'interfaces.ntp.lat',
	'if.ntp.offset': 'interfaces.ntp.offset',
	'if.sync': 'interfaces.sync',
	'if.sync.port0': 'interfaces.sync.port0',
	'if.sync.port1': 'interfaces.sync.port1',
	'if.sync.recv': 'interfaces.sync.receive',
	'if.sync.recv.bri': 'interfaces.sync.receive.brightness',
	'if.sync.recv.col': 'interfaces.sync.receive.color',
	'if.sync.recv.fx': 'interfaces.sync.receive.effects',
	'if.sync.recv.grp': 'interfaces.sync.receive.groups',
	'if.sync.send': 'interfaces.sync.send',
	'if.sync.send.btn': 'interfaces.sync.send.button',
	'if.sync.send.dir': 'interfaces.sync.send.direct',
	'if.sync.send.hue': 'interfaces.sync.send.hue',
	'if.sync.send.macro': 'interfaces.sync.send.macro',
	'if.sync.send.va': 'interfaces.sync.send.alexa',
	'if.sync.send.twice': 'interfaces.sync.send.twice',
	'if.sync.send.grp': 'interfaces.sync.send.groups',
	'if.va': 'interfaces.alexa',
	'if.va.alexa': 'interfaces.alexa.enabled',
	'if.va.macros': 'interfaces.alexa.macros',
	'ol': 'overlay',
	'ol.clock': 'overlay.clock',
	'ol.cntdwn': 'overlay.countdown',
	'ol.min': 'overlay.min',
	'ol.max': 'overlay.max',
	'ol.o12pix': 'overlay.o12pix',
	'ol.o5m': 'overlay.show5MinuteMarks',
	'ol.osec': 'overlay.showSecondsTrail',
	'timers': 'timers',
	'timers.cntdwn': 'timers.countdown',
	'timers.cntdwn.goal': 'timers.countdown.goal',
	'timers.cntdwn.macro': 'timers.countdown.macro',
	'timers.ins': 'timers.instances',
	'timers.ins.*.en': 'timers.instances.*.enabled',
	'timers.ins.*.hour': 'timers.instances.*.hour',
	'timers.ins.*.min': 'timers.instances.*.minute',
	'timers.ins.*.dow': 'timers.instances.*.dayOfWeek',
	'timers.ins.*.macro': 'timers.instances.*.macro',
	'timers.ins.*.start': 'timers.instances.*.start',
	'timers.ins.*.start.mon': 'timers.instances.*.start.month',
	'timers.ins.*.start.day': 'timers.instances.*.start.day',
	'timers.ins.*.end': 'timers.instances.*.end',
	'timers.ins.*.end.mon': 'timers.instances.*.end.month',
	'timers.ins.*.end.day': 'timers.instances.*.end.day',
	'ota': 'ota',
	'ota.aota': 'ota.arduinoOTA',
	'ota.lock': 'ota.lock',
	'ota.lock-wifi': 'ota.lockWiFi',
	'dmx': 'dmx',
	'dmx.chan': 'dmx.channel',
	'dmx.gap': 'dmx.gap',
	'dmx.start': 'dmx.start',
	'dmx.start-led': 'dmx.startLED',
	'dmx.fixmap': 'dmx.fixtureMap',
	'dmx.e131proxy': 'dmx.e131Proxy',
	'um': 'usermods',
}
const CLIENT_TO_WLED_CONFIG_MAP = Object.fromEntries(
	Object.entries(WLED_TO_CLIENT_CONFIG_MAP).map(([key, value]) => [value, key]) // Flip key/value of above constant
)

const wledToClientConfigTransformer = keyTransformer(WLED_TO_CLIENT_CONFIG_MAP)
const clientToWLEDConfigTransformer = keyTransformer(CLIENT_TO_WLED_CONFIG_MAP)

export function wledToClientConfig(config:WLEDConfig):WLEDClientConfig {
	return deepCloneTransform(config, wledToClientConfigTransformer) as WLEDClientConfig
}

export function clientToWLEDConfig(config:Partial<WLEDClientConfig|WLEDClientUpdatableConfig>):{} {
	return deepCloneTransform(config, clientToWLEDConfigTransformer)
}
