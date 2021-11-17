# WLED Client

A friendly interface for controlling your WLED devices from Node.js or the browser.

## About

This is a JS/TS client library for the control of WLED devices. It offers a friendly simplified interface to send commands and receive data from your device, either piecemeal via WLED's JSON API or in real time via the WebSocket API. The full power of WLED's JSON API can also be harnessed through WLED Client by using `updateState`.

## Installation
WLED Client is isomorphic, meaning it will behave identically in both the browser and Node.js.
### Browser
Include the CDN script for WLED Client in your HTML:

```html
<script src="https://unpkg.com/wled-client/dist/browser/wled-client.js"></script>
```

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
import WLEDClient from 'wled-client'
```
```js
const WLEDClient = require('wled-client')
```

See [usage](#usage) for next steps.

### Versioning

WLED Client's versioning tracks WLED's version to determine what WLED API features are supported. If you have a device with WLED `0.12.0` installed, you will need WLED Client version starting with `0.12.0-*` to guarantee support.

The version format for WLED Client looks like `[WLED Version]-[MAJOR].[MINOR]` and follows Semantic Versioning. This library began with support for WLED starting at version 0.12.0.

## Usage

Create a new instance of the `WLEDClient` class and pass in the IP of your WLED device:

```js
const wled = new WLEDClient('192.168.0.123')
```

Once the class is constructed, WLED Client will immediately try to fetch the full device context (state, info, effects, and palettes) via the JSON API. If WebSocket is enabled, then at the same time WLED Client will also try to establish a connection via the WebSocket API.

When WLED Client has successfully fetched the context, the promise at `wled.isReady` will resolve.

```js
async function init() {
	const wled = new WLEDClient('192.168.0.123')
	await wled.isReady

	console.log(wled.info.version) // 0.12.0
}
init().catch(console.error)
```

## License

WLED Client is [MIT](LICENSE) licensed.
