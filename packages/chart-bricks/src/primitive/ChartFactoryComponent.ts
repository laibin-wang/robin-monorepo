import { defineComponent, computed, type PropType, watchEffect, nextTick, onUnmounted } from 'vue'

import type { ModuleName } from '../types'

import { useChartContext } from '../composables/useChart'
import { declareModules } from '../composables/useModuleCollector'
import { generateId, mergeOptions } from '../utils/chartHelpers'

interface BaseChartComponentProps<T> {
	config?: T
	[key: string]: any
}

export function createChartComponent<T extends object, P extends Record<string, any> = {}>(
	componentName: string,
	defaultOptions: Partial<T> = {},
	requiredModules: ModuleName[] = [],
	type: string,
	privatePropsDefinition?: {
		[K in keyof P]?: PropType<P[K]> | { type: PropType<P[K]> }
	},
) {
	const propsDefinition = {
		config: {
			type: Object as PropType<T>,
			default: () => ({}),
		},
		...privatePropsDefinition,
	} as const
	return defineComponent({
		name: componentName,

		props: propsDefinition,

		setup(props: BaseChartComponentProps<T>) {
			console.log('createChartComponent', componentName, type)
			debugger
			const componentFlag = componentName.toLowerCase()
			const componentId = generateId(componentFlag)
			const ctx = useChartContext()

			// 声明需要的模块
			if (requiredModules.length > 0) {
				declareModules(requiredModules as any)
			}
			const extractPrivateProps = <P>(props: any): P => {
				const { config, ...rest } = props
				return rest as P
			}

			const options = computed(() => {
				const privateProps = extractPrivateProps<P>(props)
				const baseOpts = { id: componentId } as T
				return mergeOptions<T, P>(
					baseOpts, // 基础配置（包含 id）
					defaultOptions, // 组件默认配置
					props.config, // 用户传入的 config
					privateProps, // 私有属性（优先级最高）
				)
			})
			watchEffect(() => {
				const opt = options.value // 自动追踪
				nextTick(() => {
					debugger
					ctx.setOptionByOne(componentId, type, { ...opt })
				})
			})

			onUnmounted(() => {
				// 清理图表实例
				// ctx.removeOption(componentId)
			})

			return () => null
		},
	})
}
