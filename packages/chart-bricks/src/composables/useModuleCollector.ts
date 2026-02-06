import { inject, ref, type InjectionKey, type Ref } from 'vue'

import type { ModuleDeclaration, ModuleName, ModuleCollector } from '../types'

export const ModuleCollectorKey: InjectionKey<ModuleCollector> = Symbol('ModuleCollector')

export function createModuleCollector(): {
	collector: ModuleCollector
	modulesRef: Ref<ModuleName[]>
} {
	const declarations = ref<ModuleDeclaration[]>([])

	const collector: ModuleCollector = {
		declare: declaration => {
			declarations.value.push(declaration)
		},
		getAll: () => {
			// 按优先级排序并去重
			const sorted = [...declarations.value].sort((a, b) => (b.priority || 0) - (a.priority || 0))
			const seen = new Set<string>()
			const result: ModuleName[] = []

			for (const decl of sorted) {
				for (const name of decl.names) {
					if (!seen.has(name)) {
						seen.add(name)
						result.push(name)
					}
				}
			}

			return result
		},
		clear: () => {
			declarations.value = []
		},
	}

	return {
		collector,
		modulesRef: declarations as unknown as Ref<ModuleName[]>,
	}
}

export function useModuleCollector(): ModuleCollector {
	const collector = inject(ModuleCollectorKey)
	if (!collector) {
		throw new Error('useModuleCollector must be used inside a Chart component')
	}
	return collector
}

// 子组件声明模块的辅助函数
export function declareModules(names: ModuleName[], priority = 0): void {
	const collector = inject(ModuleCollectorKey, null)
	if (collector) {
		collector.declare({ names, priority })
	}
}
