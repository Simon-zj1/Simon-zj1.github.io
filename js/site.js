(function () {
  'use strict'

  const root = document.documentElement
  const body = document.body

  function renderIcons() {
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons()
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
        status.textContent = '当前浏览器不支持安全解锁，请使用最新版浏览器。'
        status.dataset.state = 'error'
        return
      }

      status.textContent = '正在验证…'
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

        const decoder = new TextDecoder()
        content.innerHTML = decoder.decode(plaintext)
        gate.hidden = true
        content.hidden = false
        renderIcons()
        content.scrollIntoView({ behavior: 'smooth', block: 'start' })
      } catch (error) {
        status.textContent = '密码不正确，请重新输入。'
        status.dataset.state = 'error'
        input.select()
      }
    })
  }

  function setupThemeSync() {
    const current = root.getAttribute('data-theme') || 'light'
    root.setAttribute('data-site-theme', current)
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
      { rel: 'icon', type: 'image/svg+xml', href: '/img/favicon-robot-v3.svg' },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '32x32',
        href: '/img/favicon-robot-v3-32.png'
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '16x16',
        href: '/img/favicon-robot-v3-16.png'
      },
      {
        rel: 'apple-touch-icon',
        sizes: '180x180',
        href: '/img/apple-touch-icon-robot-v3.png'
      },
      {
        rel: 'mask-icon',
        href: '/img/favicon-robot-v3.svg',
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

  function boot() {
    setupFavicon()
    setupThemeSync()
    setupReveal()
    setupFilters()
    setupExperienceGate()
    renderIcons()
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot)
  } else {
    boot()
  }
})()
