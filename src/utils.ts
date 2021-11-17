export function deepMerge(target:object, ...sources:object[]) {
	for (let source of sources) {
		for (let property in source) {
			let value = source[property]
			if (typeof value == 'object' && value !== null) {
				target[property] = target[property] || {}
				deepMerge(target[property], source[property])
			} else {
				target[property] = value
			}
		}
	}
}

export function deepCloneTransform(object:{}|[], transformer?:(key:string, value:any, path?:string)=>[string, any], key_path?:string, stack?:Map<any, any>) {
	const isArray = Array.isArray(object)
	const cloned_object:{[key:string]:any} =  isArray ? [] : {}

	for (let [key, value] of Object.entries<any>(object)) {
		const current_key_path = (key_path ? key_path+(isArray ? '' : '.') : '')+(isArray ? '['+key+']' : key)

		let cloned_value:any
		if (typeof value == 'object' || Array.isArray(value)) {
			if (!stack) stack = new Map()

			const existing = stack.get(value)
			if (existing) {
				cloned_value = existing
			} else {
				cloned_value = deepCloneTransform(value, transformer, current_key_path, stack)
				stack.set(value, cloned_value)
			}
		} else {
			cloned_value = value
		}

		if (transformer) {
			let [transformed_key, transformed_value] = transformer(key, cloned_value, key_path)
			cloned_object[transformed_key] = transformed_value
		} else {
			cloned_object[key] = value
		}
	}

	return cloned_object
}