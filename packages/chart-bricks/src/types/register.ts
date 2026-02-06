import type { ModuleName } from '../utils/register'

// 子组件向父图表声明需要的模块
export interface ModuleDeclaration {
	names: ModuleName[]
	priority?: number
}

// 模块收集上下文
export interface ModuleCollector {
	declare: (declaration: ModuleDeclaration) => void
	getAll: () => ModuleName[]
	clear: () => void
}
export type { ModuleName }
