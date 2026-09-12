function app() {
  return {
    mobileMenuOpen: false,
    notifyOpen: false,
    githubStars: null,
    darkMode: localStorage.getItem('darkMode') === 'true' ||
      (!localStorage.getItem('darkMode') && window.matchMedia('(prefers-color-scheme: dark)').matches),
    faqs: [
      {
        q: '¿Necesito internet para usar la app?',
        a: 'No. CubaCell Connect no usa internet en ningún momento. Todo funciona mediante códigos USSD sobre la red telefónica de ETECSA, igual que cuando marcas el código manualmente en el teléfono.'
      },
      {
        q: '¿Es segura la app?',
        a: 'Sí. No hay red, servidores ni cuentas — el catálogo completo de códigos viaja embebido en la propia app. No se recopila ningún dato. El código es open source: puedes revisarlo tú mismo en <a href="https://github.com/albertolicea00/cubacell-connect" target="_blank" rel="noopener" class="text-navy dark:text-accent underline">GitHub</a>.'
      },
      {
        q: '¿Cuándo estará en la App Store?',
        a: 'Actualmente está en beta — solo disponible instalando desde el código fuente en GitHub. <button onclick="window.dispatchEvent(new CustomEvent(\'notify:open\'))" class="text-navy dark:text-accent underline cursor-pointer">Suscríbete</button> para recibir una notificación en cuanto se publique.'
      },
      {
        q: '¿Puedo usar CubaCell Connect sin instalar la app?',
        a: 'Sí. Entra a <a href="dial.html" class="text-navy dark:text-accent underline hover:no-underline">/dial</a> — el marcador USSD corriendo directo en el navegador, sin Xcode ni cuenta de desarrollador. Agrégalo a tu pantalla de inicio y funciona incluso sin internet: después de la primera visita, la página y el catálogo de códigos quedan guardados en el propio navegador.'
      },
      {
        q: '¿Cuánto cuesta la app?',
        a: 'Cero. Es un proyecto de comunidad, sin anuncios ni compras dentro de la app.'
      },
      {
        q: '¿La app realiza las operaciones por mí?',
        a: 'No. La app solo abre el marcador del iPhone con el código USSD correcto preescrito (el <code class="code-inline">#</code> va correctamente codificado). Tú confirmas la llamada y ETECSA responde por la red telefónica. Es un lanzador de códigos, no un bot.'
      },
      {
        q: '¿Qué pasa si un código deja de funcionar?',
        a: 'Repórtalo como issue en <a href="https://github.com/albertolicea00/cubacell-connect/issues" target="_blank" rel="noopener" class="text-navy dark:text-accent underline">GitHub</a>. Los códigos se corrigen primero en <a href="https://github.com/albertolicea00/MyUSSDCodes-collection" target="_blank" rel="noopener" class="text-navy dark:text-accent underline">MyUSSDCodes-collection</a> — la fuente única de verdad compartida por todas mis apps — y una acción semanal automática avisa si este repo se desincroniza.'
      },
      {
        q: '¿Puedo contribuir al proyecto?',
        a: 'Sí. Mira <code class="code-inline">CONTRIBUTING.md</code> en el repositorio. Issues, PRs y commits deben estar en inglés, aunque la UI de la app está en español.'
      },
    ],
    init() {
      this.$watch('darkMode', val => localStorage.setItem('darkMode', val));
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        if (!localStorage.getItem('darkMode')) {
          this.darkMode = e.matches;
        }
      });
      window.addEventListener('notify:open', () => { this.notifyOpen = true; });
      fetch('https://api.github.com/repos/albertolicea00/cubacell-connect')
        .then(r => r.json())
        .then(d => { if (d.stargazers_count !== undefined) this.githubStars = d.stargazers_count; })
        .catch(() => {});
    }
  }
}

// cards: array of {id, light, dark}
// compact: true for the smaller feature-section stacks (tighter fan offsets)
function cardStack(cards, compact = false) {
  const s = compact ? 0.55 : 1  // scale factor for fan offsets
  return {
    cards: [...cards],
    dragging: false,
    dragX: 0, dragY: 0,
    startX: 0, startY: 0,
    flying: false, flyDir: 1,

    init() {
      // Preload images for instantaneous theme switching
      setTimeout(() => {
        this.cards.forEach(card => {
          const imgL = new Image(); imgL.src = card.light;
          const imgD = new Image(); imgD.src = card.dark;
        });
      }, 500);
    },

    fanPos: [
      { r:  0,  x:          0, y:         0, z: 50 },
      { r: -7,  x: -22 * s,   y:  4 * s,    z: 40 },
      { r:  7,  x:  22 * s,   y:  4 * s,    z: 30 },
      { r: -13, x: -40 * s,   y:  8 * s,    z: 20 },
      { r:  13, x:  40 * s,   y:  8 * s,    z: 10 },
    ],

    fanStyle(i) {
      if (i === 0) {
        if (this.dragging) {
          const rot = this.dragX * 0.07
          return `transform:translate(${this.dragX}px,${this.dragY * 0.35}px) rotate(${rot}deg);z-index:50;transition:none;`
        }
        if (this.flying) {
          return `transform:translate(${this.flyDir * 520}px,60px) rotate(${this.flyDir * 28}deg);z-index:50;opacity:0;transition:transform 0.35s ease,opacity 0.3s ease;`
        }
        return `transform:rotate(0deg) translate(0,0);z-index:50;transition:transform 0.45s cubic-bezier(0.34,1.4,0.64,1);`
      }
      // While flying, pre-animate each card one step forward so they're already
      // in position when the array reshuffles — no jump
      const targetIdx = this.flying ? i - 1 : i
      const p = this.fanPos[targetIdx] ?? this.fanPos[this.fanPos.length - 1]
      const z = (this.fanPos[i] ?? this.fanPos[this.fanPos.length - 1]).z
      return `transform:rotate(${p.r}deg) translate(${p.x}px,${p.y}px);z-index:${z};transition:transform 0.35s ease;`
    },

    startDrag(e) {
      if (this.flying) return
      this.dragging = true
      this.startX = e.clientX
      this.startY = e.clientY
      this.dragX = 0; this.dragY = 0
      e.currentTarget.setPointerCapture(e.pointerId)
    },
    drag(e) {
      if (!this.dragging) return
      this.dragX = e.clientX - this.startX
      this.dragY = e.clientY - this.startY
    },
    endDrag() {
      if (!this.dragging) return
      this.dragging = false
      if (Math.abs(this.dragX) > 75) {
        this.flyDir = this.dragX > 0 ? 1 : -1
        this.flying = true
        setTimeout(() => {
          this.cards.push(this.cards.shift())
          this.dragX = 0; this.dragY = 0; this.flying = false
        }, 360)
      } else {
        this.dragX = 0; this.dragY = 0
      }
    },
  }
}

function notifyForm() {
  return {
    email: '',
    sent: false,
    loading: false,
    error: '',
    async submit() {
      if (!this.email) return;
      this.loading = true;
      this.error = '';

      try {
        const res = await fetch('/api/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: this.email })
        });

        if (res.ok) {
          this.sent = true;
        } else {
          this.error = 'Hubo un error al suscribirte. Inténtalo de nuevo.';
        }
      } catch (err) {
        this.error = 'Error de red. Por favor, revisa tu conexión e inténtalo de nuevo.';
      } finally {
        this.loading = false;
      }
    }
  }
}
