(() => {
  const initThemeToggle = () => {
    const button = document.getElementById('nav-darkmode')
    if (!button || button.dataset.ready) return

    button.dataset.ready = 'true'
    button.addEventListener('click', () => {
      if (button.dataset.switching) return

      const toggle = document.querySelector('#rightside #darkmode')
      if (!toggle) return

      const root = document.documentElement
      const applyTheme = () => toggle.click()
      const finish = () => {
        delete button.dataset.switching
        root.classList.remove('theme-switching')
      }

      button.dataset.switching = 'true'
      root.classList.add('theme-switching')
      applyTheme()
      window.requestAnimationFrame(() => window.requestAnimationFrame(finish))
    })
  }

  const initChannelFilter = () => {
    const controls = document.querySelectorAll('[data-channel-filter]')
    const posts = document.querySelectorAll('#recent-posts .recent-post-item[data-channel]')

    if (!controls.length || !posts.length) return

    const setFilter = channel => {
      controls.forEach(control => {
        const active = control.dataset.channelFilter === channel
        control.classList.toggle('is-active', active)
        control.setAttribute('aria-pressed', String(active))
      })

      let firstVisible
      posts.forEach(post => {
        const visible = channel === 'all' || post.dataset.channel === channel
        post.hidden = !visible
        post.classList.remove('is-filter-lead')
        if (visible && !firstVisible) firstVisible = post
      })

      if (channel !== 'all' && firstVisible) firstVisible.classList.add('is-filter-lead')

      const recentPosts = document.getElementById('recent-posts')
      if (recentPosts) recentPosts.dataset.filtered = channel

      const url = new URL(window.location.href)
      if (channel === 'all') url.searchParams.delete('channel')
      else url.searchParams.set('channel', channel)
      window.history.replaceState({}, '', url)
    }

    controls.forEach(control => {
      control.addEventListener('click', () => setFilter(control.dataset.channelFilter))
    })

    const requested = new URLSearchParams(window.location.search).get('channel')
    const supported = [...controls].some(control => control.dataset.channelFilter === requested)
    setFilter(supported ? requested : 'all')
  }

  const initSite = () => {
    initThemeToggle()
    initChannelFilter()
  }

  document.addEventListener('DOMContentLoaded', initSite)
  document.addEventListener('pjax:complete', initSite)
})()
