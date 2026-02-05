import { DataItem } from './chart'

export * from './chart'
export * from './theme'
export * from './events'

export type AggregationMethod = 'sum' | 'avg' | 'max' | 'min' | 'count' | 'first' | 'last'

export type DataTransform =
	| { type: 'filter'; predicate: (item: DataItem) => boolean }
	| { type: 'sort'; key: string; order?: 'asc' | 'desc' }
	| { type: 'map'; mapper: (item: DataItem) => DataItem }
	| { type: 'groupBy'; key: string }
	| { type: 'aggregate'; groupKey: string; valueKey: string; method: AggregationMethod }
	| { type: 'sample'; count: number }
