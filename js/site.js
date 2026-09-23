(function () {
  'use strict'

  const root = document.documentElement
  const body = document.body
  const translations = {
    zh: {
      'nav.home': '首页',
      'nav.tech': '技术',
      'nav.knowledge': '知识漫游',
      'nav.experience': '面经',
      'nav.about': '关于',
      'nav.search': '搜索',
      'home.browse': '浏览主题',
      'home.about': '关于我',
      'home.enter': '进入专栏',
      'home.read': '阅读文章',
      'home.email': '发邮件',
      'post.created': '创建于',
      'post.updated': '更新于',
      'post.pageViews': '阅读',
      'post.copyright.author': '文章作者',
      'post.copyright.link': '文章链接',
      'post.copyright.notice': '版权声明',
      'pagination.prev': '上一篇',
      'pagination.next': '下一篇',
      'footer.framework': '框架',
      'footer.theme': '主题',
      'experience.unsupported': '当前浏览器不支持安全解锁，请使用最新版浏览器。',
      'experience.validating': '正在验证...',
      'experience.incorrect': '密码不正确，请重新输入。',
      'experience.password': '请输入访问密码',
      'experience.unlock': '解锁'
    },
    en: {
      'nav.home': 'Home',
      'nav.tech': 'Technology',
      'nav.knowledge': 'Knowledge Roaming',
      'nav.experience': 'Career Notes',
      'nav.about': 'About',
      'nav.search': 'Search',
      'home.browse': 'Explore',
      'home.about': 'About',
      'home.enter': 'Enter',
      'home.read': 'Read note',
      'home.email': 'Email',
      'post.created': 'Created',
      'post.updated': 'Updated',
      'post.pageViews': 'Views',
      'post.copyright.author': 'Author',
      'post.copyright.link': 'Article link',
      'post.copyright.notice': 'License',
      'pagination.prev': 'Previous',
      'pagination.next': 'Next',
      'footer.framework': 'Framework',
      'footer.theme': 'Theme',
      'experience.unsupported': 'Secure unlocking is not supported in this browser. Please use a current browser.',
      'experience.validating': 'Verifying...',
      'experience.incorrect': 'Incorrect password. Please try again.',
      'experience.password': 'Enter access password',
      'experience.unlock': 'Unlock'
    }
  }
  let currentLanguage = root.dataset.language === 'en' ? 'en' : 'zh'

  function t(key) {
    return translations[currentLanguage][key] || translations.zh[key] || key
  }

  function applyLanguage(language, persist = true) {
    currentLanguage = language === 'en' ? 'en' : 'zh'
    const htmlLanguage = currentLanguage === 'en' ? 'en' : 'zh-CN'

    root.lang = htmlLanguage
    root.dataset.language = currentLanguage
    body.dataset.language = currentLanguage

    document.querySelectorAll('[data-i18n]').forEach((element) => {
      const value = translations[currentLanguage][element.dataset.i18n]
      if (!value) return
      const leadingSpace = /^\s/.test(element.textContent) ? ' ' : ''
      element.textContent = leadingSpace + value
    })

    document.querySelectorAll('[data-i18n-placeholder]').forEach((element) => {
      const value = translations[currentLanguage][element.dataset.i18nPlaceholder]
      if (value) element.setAttribute('placeholder', value)
    })

    document.querySelectorAll('[data-i18n-zh]').forEach((element) => {
      const value = element.getAttribute(`data-i18n-${currentLanguage}`)
      if (value) element.textContent = value
    })

    document.querySelectorAll('[data-lang-content]').forEach((element) => {
      element.hidden = element.dataset.langContent !== currentLanguage
    })

    document.querySelectorAll('[data-language-option]').forEach((button) => {
      const isActive = button.dataset.languageOption === currentLanguage
      button.setAttribute('aria-pressed', String(isActive))
      button.classList.toggle('is-active', isActive)
    })

    const zhTitle = body.dataset.pageTitleZh || document.title
    const enTitle = body.dataset.pageTitleEn || zhTitle
    const isHomePage = body.classList.contains('home')
    document.title =
      currentLanguage === 'en' && !isHomePage ? `${enTitle} | Simon` : zhTitle

    const description =
      currentLanguage === 'en'
        ? body.dataset.pageDescriptionEn || body.dataset.pageDescriptionZh
        : body.dataset.pageDescriptionZh || body.dataset.pageDescriptionEn
    const descriptionMeta = document.querySelector('meta[name="description"]')
    const openGraphMeta = document.querySelector('meta[property="og:description"]')
    if (description && descriptionMeta) descriptionMeta.setAttribute('content', description)
    if (description && openGraphMeta) openGraphMeta.setAttribute('content', description)

    if (persist) {
      try {
        localStorage.setItem('simon-language', currentLanguage)
      } catch (error) {
        // Storage may be unavailable in private browsing; the page still works.
      }
    }

    document.dispatchEvent(
      new CustomEvent('site-language-change', { detail: { language: currentLanguage } })
    )
  }

  function setupLanguageSwitch() {
    const buttons = document.querySelectorAll('[data-language-option]')
    buttons.forEach((button) => {
      button.addEventListener('click', () => {
        applyLanguage(button.dataset.languageOption)
      })
    })
    applyLanguage(currentLanguage, false)
  }

  function renderIcons() {
    if (window.SimonIcons && typeof window.SimonIcons.render === 'function') {
      window.SimonIcons.render()
    }
  }

  function setupReveal() {
    const items = Array.from(document.querySelectorAll('[data-reveal]'))
    if (!items.length) return

    if (!('IntersectionObserver' in window)) {
      items.forEach((item) => item.classList.add('is-visible'))
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          entry.target.classList.add('is-visible')
          observer.unobserve(entry.target)
        })
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
    )

    items.forEach((item) => observer.observe(item))
  }

  function setupFilters() {
    document.querySelectorAll('[data-filter-group]').forEach((group) => {
      const buttons = Array.from(group.querySelectorAll('[data-filter]'))
      const targetSelector = group.getAttribute('data-filter-target')
      const target = targetSelector ? document.querySelector(targetSelector) : null
      if (!target) return
      const cards = Array.from(target.querySelectorAll('[data-tags]'))

      function apply(filter) {
        buttons.forEach((button) => {
          button.setAttribute(
            'aria-pressed',
            String(button.getAttribute('data-filter') === filter)
          )
        })

        cards.forEach((card) => {
          const tags = (card.getAttribute('data-tags') || '').split(/\s+/)
          card.hidden = filter !== 'all' && !tags.includes(filter)
        })
      }

      buttons.forEach((button) => {
        button.addEventListener('click', () => {
          apply(button.getAttribute('data-filter') || 'all')
        })
      })

      const initial =
        buttons.find((button) => button.getAttribute('aria-pressed') === 'true') ||
        buttons[0]
      if (initial) apply(initial.getAttribute('data-filter') || 'all')
    })
  }

  function base64ToBytes(value) {
    const binary = window.atob(value)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i)
    }
    return bytes
  }

  async function deriveKey(password, salt, iterations) {
    const encoder = new TextEncoder()
    const source = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      'PBKDF2',
      false,
      ['deriveKey']
    )

    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt,
        iterations,
        hash: 'SHA-256'
      },
      source,
      { name: 'AES-GCM', length: 256 },
      false,
      ['decrypt']
    )
  }

  async function decodePayload(plaintext, payload) {
    const bytes = new Uint8Array(plaintext)
    if (payload.compression !== 'gzip') {
      return new TextDecoder().decode(bytes)
    }

    if (typeof DecompressionStream === 'undefined') {
      throw new Error('gzip-unsupported')
    }

    const stream = new Blob([bytes])
      .stream()
      .pipeThrough(new DecompressionStream('gzip'))
    return new Response(stream).text()
  }

  function setupExperienceGate() {
    const gate = document.querySelector('[data-experience-gate]')
    const content = document.querySelector('[data-experience-content]')
    const payload = window.__EXPERIENCE_PAYLOAD__
    if (!gate || !content || !payload) return

    const form = gate.querySelector('form')
    const input = gate.querySelector('input[type="password"]')
    const status = gate.querySelector('[data-experience-status]')

    form.addEventListener('submit', async (event) => {
      event.preventDefault()
      if (!input.value) return

      if (!window.crypto || !crypto.subtle) {
        status.textContent = t('experience.unsupported')
        status.dataset.state = 'error'
        return
      }

      status.textContent = t('experience.validating')
      status.dataset.state = 'loading'

      try {
        const salt = base64ToBytes(payload.salt)
        const iv = base64ToBytes(payload.iv)
        const encrypted = base64ToBytes(payload.data)
        const key = await deriveKey(input.value, salt, payload.iterations || 250000)
        const plaintext = await crypto.subtle.decrypt(
          { name: 'AES-GCM', iv },
          key,
          encrypted
        )

        if (payload.compression === 'gzip' && typeof DecompressionStream === 'undefined') {
          status.textContent = t('experience.unsupported')
          status.dataset.state = 'error'
          return
        }

        content.innerHTML = await decodePayload(plaintext, payload)
        activateScripts(content)
        gate.hidden = true
        content.hidden = false
        renderIcons()
        content.scrollIntoView({ behavior: 'smooth', block: 'start' })
      } catch (error) {
        status.textContent = t('experience.incorrect')
        status.dataset.state = 'error'
        input.select()
      }
    })
  }

  // Decrypted notes may ship their own behaviour (for example the study tool
  // on the Kuaishou page). Scripts inserted through innerHTML never run, so
  // rebuild every one of them after the content lands in the DOM.
  function activateScripts(container) {
    container.querySelectorAll('script').forEach((oldScript) => {
      const script = document.createElement('script')
      Array.from(oldScript.attributes).forEach((attribute) => {
        script.setAttribute(attribute.name, attribute.value)
      })
      script.text = oldScript.textContent
      oldScript.replaceWith(script)
    })
  }

  function setupThemeSync() {
    const current = root.getAttribute('data-theme') || 'light'
    root.setAttribute('data-site-theme', current)
  }

  function setupOfflineCache() {
    if (location.protocol !== 'https:' || !('serviceWorker' in navigator)) return
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // Caching is an optional enhancement. The site still works without it.
      })
    })
  }

  function setupFavicon() {
    const head = document.head
    if (!head) return

    head
      .querySelectorAll(
        'link[rel~="icon"], link[rel="apple-touch-icon"], link[rel="mask-icon"]'
      )
      .forEach((link) => link.remove())

    const icons = [
      { rel: 'shortcut icon', href: '/img/favicon-robot-v3.ico?v=3' },
      { rel: 'icon', type: 'image/svg+xml', href: '/img/favicon-robot-v3.svg?v=3' },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '32x32',
        href: '/img/favicon-robot-v3-32.png?v=3'
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '16x16',
        href: '/img/favicon-robot-v3-16.png?v=3'
      },
      {
        rel: 'apple-touch-icon',
        sizes: '180x180',
        href: '/img/apple-touch-icon-robot-v3.png?v=3'
      },
      {
        rel: 'mask-icon',
        href: '/img/favicon-robot-v3.svg?v=3',
        color: '#151515'
      }
    ]

    icons.forEach((attributes) => {
      const link = document.createElement('link')
      Object.entries(attributes).forEach(([name, value]) => {
        link.setAttribute(name, value)
      })
      head.appendChild(link)
    })
  }

  // 内容截图点击放大：桌面截图在手机上直接看会太小，点一下进全屏并可滚动/双指缩放
  function setupLightbox() {
    const container = document.querySelector('#content-inner') || document.body
    let overlay = null

    function close() {
      if (!overlay) return
      const target = overlay
      overlay = null
      target.classList.remove('is-open')
      document.documentElement.style.removeProperty('overflow')
      window.setTimeout(() => target.remove(), 180)
    }

    function open(img) {
      overlay = document.createElement('div')
      overlay.className = 'image-lightbox'
      overlay.setAttribute('role', 'dialog')
      overlay.setAttribute('aria-label', '放大查看图片')

      const picture = document.createElement('img')
      picture.src = img.currentSrc || img.src
      picture.alt = img.alt || ''

      const hint = document.createElement('span')
      hint.className = 'image-lightbox__hint'
      hint.textContent = '双指缩放 · 点击空白或按 Esc 关闭'

      overlay.append(picture, hint)
      overlay.addEventListener('click', close)
      document.body.appendChild(overlay)
      requestAnimationFrame(() => overlay.classList.add('is-open'))
      document.documentElement.style.overflow = 'hidden'
    }

    function bindOne(img) {
      if (img.dataset.zoomBound === '1' || img.dataset.zoomCandidate === '1') return
      img.dataset.zoomCandidate = '1'
      const activate = () => {
        // 头像、图标这类小图不参与放大
        if (!img.naturalWidth || img.naturalWidth < 420) return
        img.dataset.zoomBound = '1'
        img.classList.add('zoomable')
        img.addEventListener('click', () => open(img))
      }
      if (img.complete) activate()
      else img.addEventListener('load', activate, { once: true })
    }

    function bindAll() {
      container.querySelectorAll('img').forEach(bindOne)
    }

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') close()
    })

    bindAll()
    window.addEventListener('load', bindAll)
  }

  function boot() {
    setupFavicon()
    setupThemeSync()
    setupLanguageSwitch()
    setupReveal()
    setupFilters()
    setupExperienceGate()
    setupLightbox()
    setupOfflineCache()
    renderIcons()
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot)
  } else {
    boot()
  }
})()
