import { defineConfig } from 'vitepress'

export default defineConfig({
    title: 'COTC Plugins',
    description: 'COCT插件集合文档',
    lang: 'zh-CN',

    head: [
        ['link', { rel: 'icon', type: 'image/svg+xml', href: '/logo.svg' }]
    ],

    themeConfig: {
        logo: '/logo.svg',

        nav: [
            { text: '首页', link: '/' },
            { text: '指南', link: '/guide/' },
            { text: '组件', link: '/components/signature-pad' }
        ],

        sidebar: {
            '/guide/': [
                {
                    text: '入门',
                    items: [
                        { text: '介绍', link: '/guide/' },
                        { text: '快速开始', link: '/guide/getting-started' }
                    ]
                }
            ],
            '/components/': [
                {
                    text: '组件',
                    items: [
                        { text: 'SignaturePad 签名板', link: '/components/signature-pad' },
                        { text: 'MonitorSDK 监控 SDK', link: '/components/monitor-sdk' }
                    ]
                }
            ]
        },

        socialLinks: [
            { icon: 'github', link: 'https://github.com/WenwuLi/cotc-monorepo' }
        ],

        footer: {
            message: 'Released under the MIT License.',
            copyright: 'Copyright © 2024-present COTC'
        },

        search: {
            provider: 'local'
        },

        outline: {
            label: '页面导航'
        },

        docFooter: {
            prev: '上一页',
            next: '下一页'
        },

        lastUpdated: {
            text: '最后更新于'
        }
    }
})
