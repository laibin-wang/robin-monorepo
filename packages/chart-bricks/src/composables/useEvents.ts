import { onUnmounted } from 'vue'

import type { ChartEvent, ChartEventHandler, ChartEventPayload, UseEventsReturn } from '../types'

export function useEvents(): UseEventsReturn {
	const handlers: Map<ChartEvent, Set<ChartEventHandler>> = new Map()

	const on = (event: ChartEvent, handler: ChartEventHandler): (() => void) => {
		if (!handlers.has(event)) {
			handlers.set(event, new Set())
		}
		handlers.get(event)!.add(handler)

		return () => off(event, handler)
	}

	const off = (event: ChartEvent, handler: ChartEventHandler): void => {
		handlers.get(event)?.delete(handler)
	}

	const emit = (event: ChartEvent, payload: ChartEventPayload): void => {
		handlers.get(event)?.forEach(handler => handler(payload))
	}

	const once = (event: ChartEvent, handler: ChartEventHandler): (() => void) => {
		const wrapped = (payload: ChartEventPayload) => {
			handler(payload)
			off(event, wrapped)
		}
		return on(event, wrapped)
	}

	const clear = (event?: ChartEvent): void => {
		if (event) {
			handlers.get(event)?.clear()
		} else {
			handlers.clear()
		}
	}

	onUnmounted(() => {
		clear()
	})

	return {
		on,
		off,
		emit,
		once,
		clear,
		handlers,
	}
}
