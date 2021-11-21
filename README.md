# WLED Client

A friendly JS interface for controlling your [WLED](https://github.com/Aircoookie/WLED) devices from Node.js or the browser.

**Note**: This is under early active development and may be subject to breaking changes until it reaches a stable version **0.12.0-1.0**.

## About

This is a JS/TS client library for the control of [WLED](https://github.com/Aircoookie/WLED) devices. It offers a friendly simplified interface to send commands and receive data from your device, either piecemeal via WLED's JSON API or in real time via the WebSocket API. The full power of WLED's JSON API can also be harnessed through WLED Client by using `updateState`.

## Installation
WLED Client is isomorphic, meaning it will behave identically in both the browser and Node.js.
### Browser
Include the CDN script for WLED Client in your HTML:

```html
<script src="https://unpkg.com/wled-client/dist/browser/wled-client.js"></script>
```

You can also [download](https://unpkg.com/wled-client/dist/browser/wled-client.js) this script directly to use it where you please.

The `WLEDClient` class will now be available globally. See [usage](#usage) for next steps.

### Node
Install with your favorite Node.js package manager:

```bash
# NPM
$ npm install wled-client

# Yarn
$ yarn add wled-client
```

Then you can `require` or `import` WLED Client:

```ts
import { WLEDClient } from 'wled-client'
```
```js
const { WLEDClient } = require('wled-client')
```

See [usage](#usage) for next steps.

### Other Environments
Under the hood, WLED Client uses the `fetch`, `WebSocket`, and `EventTarget` APIs to achieve the desired behavior. WLED Client is primarily meant to be used in the browser where these APIs are provided by the browser's execution environment. In order to work on node, each API has been polyfilled.

If your execution environment includes these APIs, you can use the browser script out of the box. Otherwise you'll need to add your own polyfills to make WLED Client work in your desired environment.

### Versioning

WLED Client's versioning tracks WLED's version to determine what WLED API features are supported. If you have a device with WLED `0.12.0` installed, you will need WLED Client version starting with `0.12.0-*` to guarantee support.

The version format for WLED Client looks like `[WLED Version]-[MAJOR].[MINOR]` and follows Semantic Versioning. This library began with support for WLED starting at version 0.12.0.

## Usage

Create a new instance of the `WLEDClient` class and pass in the IP of your WLED device:

```js
const wled = new WLEDClient('192.168.0.123')
```

Once the class is constructed, WLED Client will immediately try to fetch the full device context (state, info, effects, and palettes) via the JSON API. If WebSocket is enabled, then at the same time WLED Client will also try to establish a connection via the WebSocket API.

When WLED Client has successfully fetched the device context, the promise at `wled.isReady` will resolve. Then the device's state, info, effects, and palettes will be accessible. As long as the WebSocket API is connected updates to the device context will be received asynchronously, so changes made from outside WLED Client (like the WLED App) will be automatically applied to the client instance. You can always manually refetch the context using the `wled.refreshContext()` method.

```js
async function init() {
	const wled = new WLEDClient('192.168.0.123')
	await wled.isReady

	console.log(wled.info.version) // 0.12.0
}
init().catch(console.error)
```

If you're familiar with WLED's JSON API, you can make an update to the device state in a similar way using the `wled.updateState()` method. This method accepts an object with a friendly (verbose) interface that matches 1:1 with the WLED JSON API.

```js
async function init() {
	const wled = new WLEDClient('192.168.0.123')
	await wled.isReady

	console.log(wled.state.brightness) // 255
	await wled.updateState({
		brightness: 128
	})
	console.log(wled.state.brightness) // 128
}
init().catch(console.error)
```

If you'd rather be more direct, WLED Client offers simple methods to execute common commands as well.

```js
async function init() {
	const wled = new WLEDClient('192.168.0.123')
	await wled.isReady

	console.log(wled.state.brightness) // 255
	await wled.setBrightness(128)
	console.log(wled.state.brightness) // 128
}
init().catch(console.error)
```

See the [WLEDClient class](https://shiftlimits.github.io/wled-client/classes/client.WLEDClient.html) page for a list of methods. At any point you can run any method that updates the device's state, regardless of WLED Client's ready state. If the WebSocket is not connected, state updates will be sent via the JSON API over HTTP.

## Examples

To see how WLED Client handles various use cases, there are several example scripts in the [`/examples` directory](https://github.com/ShiftLimits/wled-client/tree/main/examples).

## Documentation

There is a wonderfully done documentation for the WLED JSON API to be found at the [WLED knowledge base](https://kno.wled.ge/interfaces/json-api/). WLED Client implements this with only slightly more verbose key names. 

See the [API documentation](https://shiftlimits.github.io/wled-client/) page for a detailed run down of WLED Client's structure. The [WLEDClient class](https://shiftlimits.github.io/wled-client/classes/client.WLEDClient.html) docs has a quick list of properties and methods you can use. It may also help to check out the type definitions for [WLED Client](https://github.com/ShiftLimits/wled-client/blob/main/src/types.client.ts) and compare them to the type definitions for [WLED itself](https://github.com/ShiftLimits/wled-client/blob/main/src/types.wled.ts).

## License

WLED Client is [MIT](LICENSE) licensed.
