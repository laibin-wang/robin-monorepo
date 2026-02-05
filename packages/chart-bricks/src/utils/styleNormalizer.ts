import type { CSSProperties } from 'vue'

export function normalizeColor(color: string | undefined): string | undefined {
	if (!color) return undefined
	// 支持 hex, rgb, rgba, hsl, 颜色名
	return color
}

export function normalizeSize(size: string | number | undefined): string | undefined {
	if (size === undefined) return undefined
	if (typeof size === 'number') return `${size}px`
	return size
}

export function normalizeBorderRadius(
	radius: number | number[] | undefined,
): number | number[] | undefined {
	if (radius === undefined) return undefined
	if (typeof radius === 'number') return radius
	return radius
}

export function cssToEchartsStyle(css: CSSProperties): Record<string, any> {
	const style: Record<string, any> = {}

	if (css.color) style.color = css.color
	if (css.backgroundColor) style.backgroundColor = css.backgroundColor
	if (css.fontSize) style.fontSize = parseInt(String(css.fontSize))
	if (css.fontWeight) style.fontWeight = css.fontWeight
	if (css.fontFamily) style.fontFamily = css.fontFamily
	if (css.textAlign) style.align = css.textAlign
	if (css.padding) {
		const p = String(css.padding).split(' ').map(Number)
		style.padding =
			p.length === 1
				? [p[0], p[0], p[0], p[0]]
				: p.length === 2
					? [p[0], p[1], p[0], p[1]]
					: p.length === 4
						? p
						: [0, 0, 0, 0]
	}

	return style
}
