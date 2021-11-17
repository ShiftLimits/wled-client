function isCustomEvent(event:any):event is CustomEvent {
	return !!event.detail
}

class IsomorphicCustomEvent<T = any> extends Event {
	detail?:T
	constructor(typeArg: string, eventInitDict?: CustomEventInit<T>) {
		super(typeArg, eventInitDict)
		this.detail = eventInitDict?.detail
	}
}

/** Class to support event emitters in an isomorphic way using EventTarget */
export class IsomorphicEventEmitter extends EventTarget {
	on(eventName:string, listener: (...args: any[]) => void) {
		return this.addEventListener(eventName, (event:Event|CustomEvent) => {
			if (isCustomEvent(event)) return listener(...event.detail)
			listener(event)
		})
	}

	once(eventName:string, listener: (...args: any[]) => void) {
		let event_listener = this.on(eventName, listener)
		this.addEventListener(eventName, () => this.off(eventName, listener))
		return event_listener
	}

	off(eventName:string, listener: (...args: any[]) => void) {
		return this.removeEventListener(eventName, listener)
	}

	emit<T extends any[]>(eventName: string, ...args: T) {
		const event = new IsomorphicCustomEvent(eventName, { detail: args })
		return this.dispatchEvent(event)
	}
}
