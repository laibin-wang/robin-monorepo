export function debounce<T extends (...args: any[]) => any>(
	func: T,
	wait: number = 200,
	immediate: boolean = false,
): {
	(...args: Parameters<T>): void
	cancel: () => void
	flush: () => void
} {
	let timeoutId: ReturnType<typeof setTimeout> | undefined
	let lastArgs: Parameters<T> | undefined
	let isImmediateCall = false

	const debounced = (...args: Parameters<T>) => {
		lastArgs = args
		const callNow = immediate && timeoutId === undefined && !isImmediateCall

		clearTimeout(timeoutId)

		if (callNow) {
			isImmediateCall = true
			func(...args)
			timeoutId = setTimeout(() => {
				isImmediateCall = false
				timeoutId = undefined
			}, wait)
		} else {
			timeoutId = setTimeout(() => {
				timeoutId = undefined
				isImmediateCall = false
				if (!immediate) {
					func(...(lastArgs as Parameters<T>))
				}
			}, wait)
		}
	}

	debounced.cancel = () => {
		if (timeoutId !== undefined) {
			clearTimeout(timeoutId)
			timeoutId = undefined
			isImmediateCall = false
		}
	}

	debounced.flush = () => {
		if (timeoutId !== undefined) {
			clearTimeout(timeoutId)
			timeoutId = undefined
			isImmediateCall = false
			if (lastArgs) {
				func(...lastArgs)
			}
		}
	}

	return debounced
}
