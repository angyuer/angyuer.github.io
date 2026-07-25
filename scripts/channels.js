'use strict'

const CHANNELS = [
  { slug: 'tech', key: 'tech', title: '技术', description: '工程实践、工具方法与踩坑记录。' },
  { slug: 'journal', key: 'journal', title: '日记', description: '关于生活、选择和持续成长的记录。' },
  { slug: 'projects', key: 'project', title: '项目', description: '做过的项目、过程复盘与阶段成果。' }
]

hexo.extend.generator.register('content-channels', locals => {
  return CHANNELS.map(channel => ({
    path: `${channel.slug}/index.html`,
    layout: ['channel'],
    data: {
      title: channel.title,
      type: 'channel',
      channel: channel.key,
      channelDescription: channel.description,
      aside: false,
      top_img: false,
      posts: locals.posts.filter(post => (post.channel || 'tech') === channel.key)
    }
  }))
})
