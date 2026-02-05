export type ChartEvent =
	| 'click'
	| 'dblclick'
	| 'mouseover'
	| 'mouseout'
	| 'mousemove'
	| 'mousedown'
	| 'mouseup'
	| 'globalout'
	| 'legendselectchanged'
	| 'legendselected'
	| 'legendunselected'
	| 'legendscroll'
	| 'datazoom'
	| 'datarangeselected'
	| 'timelinechanged'
	| 'timelineplaychanged'
	| 'restore'
	| 'dataviewchanged'
	| 'magictypechanged'
	| 'geoselectchanged'
	| 'geoselected'
	| 'geounselected'
	| 'pieselectchanged'
	| 'pieselected'
	| 'pieunselected'
	| 'mapselectchanged'
	| 'mapselected'
	| 'mapunselected'
	| 'axisareaselected'
	| 'brush'
	| 'brushend'
	| 'brushselected'
	| 'rendered'
	| 'finished'
	| 'highlight'
	| 'downplay'
	| 'selectchanged'
	| 'selected'
	| 'unselected'
	| 'legendinverseselect'
	| 'legendallselect'
	| 'legendinverseall'

export interface ChartEventPayload {
	componentType: string
	seriesType?: string
	seriesIndex?: number
	seriesName?: string
	name: string
	dataIndex: number
	data: any
	value: any | any[]
	color: string
	event: Event
	percent?: number
	dataType?: string
	marker?: string
}

export type ChartEventHandler = (payload: ChartEventPayload) => void

export interface UseEventsReturn {
	on: (event: ChartEvent, handler: ChartEventHandler) => () => void
	off: (event: ChartEvent, handler: ChartEventHandler) => void
	emit: (event: ChartEvent, payload: ChartEventPayload) => void
	once: (event: ChartEvent, handler: ChartEventHandler) => () => void
	clear: (event?: ChartEvent) => void
	handlers: Map<ChartEvent, Set<ChartEventHandler>>
}
