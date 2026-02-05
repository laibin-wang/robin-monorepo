import type { DataItem, AggregationMethod } from '../types'

export class DataProcessor {
	static filter(data: DataItem[], predicate: (item: DataItem) => boolean): DataItem[] {
		return data.filter(predicate)
	}

	static sort(data: DataItem[], key: string, order: 'asc' | 'desc' = 'asc'): DataItem[] {
		return [...data].sort((a, b) => {
			const aVal = a[key]
			const bVal = b[key]
			if (aVal < bVal) return order === 'asc' ? -1 : 1
			if (aVal > bVal) return order === 'asc' ? 1 : -1
			return 0
		})
	}

	static groupBy(data: DataItem[], key: string): Map<string, DataItem[]> {
		return data.reduce((acc, item) => {
			const val = String(item[key])
			if (!acc.has(val)) acc.set(val, [])
			acc.get(val)!.push(item)
			return acc
		}, new Map<string, DataItem[]>())
	}

	static aggregate(
		data: DataItem[],
		groupKey: string,
		valueKey: string,
		method: AggregationMethod,
	): DataItem[] {
		const grouped = this.groupBy(data, groupKey)

		return Array.from(grouped.entries()).map(([key, items]) => {
			const values = items.map(i => Number(i[valueKey]) || 0)

			let value: number
			switch (method) {
				case 'sum':
					value = values.reduce((a, b) => a + b, 0)
					break
				case 'avg':
					value = values.reduce((a, b) => a + b, 0) / values.length
					break
				case 'max':
					value = Math.max(...values)
					break
				case 'min':
					value = Math.min(...values)
					break
				case 'count':
					value = values.length
					break
				case 'first':
					value = values[0]
					break
				case 'last':
					value = values[values.length - 1]
					break
				default:
					value = 0
			}

			return { [groupKey]: key, [valueKey]: value }
		})
	}

	static sample(data: DataItem[], count: number): DataItem[] {
		if (data.length <= count) return data

		const step = data.length / count
		return Array.from({ length: count }, (_, i) => {
			const index = Math.floor(i * step)
			return data[index]
		})
	}

	static fillMissing(
		data: DataItem[],
		key: string,
		interval: number,
		fillValue: any = 0,
	): DataItem[] {
		if (data.length === 0) return data

		const sorted = this.sort(data, key)
		const result: DataItem[] = [sorted[0]]

		for (let i = 1; i < sorted.length; i++) {
			const current = sorted[i][key]
			const prev = sorted[i - 1][key]
			const gap = current - prev

			if (gap > interval) {
				const steps = Math.floor(gap / interval)
				for (let j = 1; j < steps; j++) {
					const filler = { ...sorted[i - 1] }
					filler[key] = prev + interval * j
					Object.keys(filler).forEach(k => {
						if (k !== key) filler[k] = fillValue
					})
					result.push(filler)
				}
			}

			result.push(sorted[i])
		}

		return result
	}
}
