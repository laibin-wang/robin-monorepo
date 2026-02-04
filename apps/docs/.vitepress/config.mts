import { defineConfig } from 'vitepress'
import { defineTeekConfig } from 'vitepress-theme-teek/config'
const teekConfig = defineTeekConfig({
	articleShare: {
		enabled: true,
		text: '分享此页面',
		copiedText: '链接已复制',
		query: false,
		hash: false,
	},
})

const description = [
	'欢迎来到 vitepress-theme-teek 使用文档',
	'Teek 是一个基于 VitePress 构建的主题，是在默认主题的基础上进行拓展，支持 VitePress 的所有功能、配置',
	'Teek 拥有三种典型的知识管理形态：结构化、碎片化、体系化，可以轻松构建一个结构化知识库，适用个人博客、文档站、知识库等场景',
].toString()

export default defineConfig({
	extends: teekConfig,
	title: 'Vitepress Theme Teek',
	description: description,
	cleanUrls: false,
	lastUpdated: true,
	lang: 'zh-CN',

	markdown: {
		// 开启行号
		lineNumbers: true,
		image: {
			// 默认禁用；设置为 true 可为所有图片启用懒加载。
			lazyLoading: true,
		},
		// 更改容器默认值标题
		container: {
			tipLabel: '提示',
			warningLabel: '警告',
			dangerLabel: '危险',
			infoLabel: '信息',
			detailsLabel: '详细信息',
		},
	},
	sitemap: {
		hostname: 'https://vp.teek.top',
		transformItems: items => {
			const permalinkItemBak: typeof items = []
			// 使用永久链接生成 sitemap
			const permalinks = (globalThis as any).VITEPRESS_CONFIG.site.themeConfig.permalinks
			items.forEach(item => {
				const permalink = permalinks?.map[item.url.replace('.html', '')]
				if (permalink) permalinkItemBak.push({ url: permalink, lastmod: item.lastmod })
			})
			return [...items, ...permalinkItemBak]
		},
	},
	themeConfig: {
		logo: '/logo.svg',
		nav: [
			{ text: '首页', link: '/' },
			{ text: '指南', link: '/guide/' },
			{ text: '组件', link: '/components/signature-pad' },
		],

		sidebar: {
			'/guide/': [
				{
					text: '入门',
					items: [
						{ text: '介绍', link: '/guide/' },
						{ text: '快速开始', link: '/guide/getting-started' },
					],
				},
			],
			'/components/': [
				{
					text: '组件',
					items: [
						{ text: 'SignaturePad 签名板', link: '/components/signature-pad' },
						{ text: 'MonitorSDK 监控 SDK', link: '/components/monitor-sdk' },
					],
				},
			],
		},

		socialLinks: [{ icon: 'github', link: 'https://github.com/WenwuLi/cotc-monorepo' }],

		footer: {
			message: 'Released under the MIT License.',
			copyright: 'Copyright © 2024-present COTC',
		},

		search: {
			provider: 'local',
		},

		outline: {
			label: '页面导航',
		},

		docFooter: {
			prev: '上一页',
			next: '下一页',
		},

		lastUpdated: {
			text: '最后更新于',
		},
	},
})
