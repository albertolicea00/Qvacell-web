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
        a: 'No. Qvacell no usa internet en ningún momento. Todo funciona mediante códigos USSD sobre la red telefónica de ETECSA, igual que cuando marcas el código manualmente en el teléfono.'
      },
      {
        q: '¿Cuándo estará en la App Store?',
        a: 'Actualmente está en beta — solo disponible instalando desde el código fuente en GitHub. <button onclick="window.dispatchEvent(new CustomEvent(\'notify:open\'))" class="text-navy dark:text-accent underline cursor-pointer">Suscríbete</button> para recibir una notificación en cuanto se publique.'
      },
      {
        q: '¿Puedo usar Qvacell sin instalar la app?',
        a: 'Sí. Entra a <a href="dial.html" class="text-navy dark:text-accent underline hover:no-underline">/dial</a> — el marcador USSD corriendo directo en el navegador, sin Xcode ni cuenta de desarrollador. Agrégalo a tu pantalla de inicio y funciona incluso sin internet: después de la primera visita, la página y el catálogo de códigos quedan guardados en el propio navegador.'
      },
      {
        q: '¿Cuánto cuesta la app?',
        a: 'Cero. Es un proyecto de comunidad, sin anuncios ni compras dentro de la app.'
      },
      {
        q: '¿Por qué no se muestra mi saldo directamente en la interfaz de la app?',
        a: 'Tanto en iOS por sus fuertes restricciones de seguridad (sandbox), como en las versiones modernas de Android, las apps de terceros tienen prohibido leer silenciosamente los diálogos de respuesta USSD. Por ello, la app solo preescribe el código y abre tu app nativa de Teléfono, donde ves la respuesta oficial de ETECSA.'
      },
      {
        q: '¿El identificador de llamadas reconoce automáticamente quién me llama?',
        a: 'No. El directorio telefónico de la app se mantiene separado del identificador de llamadas del sistema. Tanto iOS como Android imponen límites estrictos o políticas de privacidad que impiden inyectar millones de registros de la guía telefónica directamente en los contactos de tu teléfono.'
      },
      {
        q: '¿Por qué no hay opciones para llamar por WhatsApp o Telegram?',
        a: 'La app ofrece únicamente operaciones sobre la red celular tradicional (llamada normal, cobro revertido <code class="code-inline">*99</code>, llamada privada <code class="code-inline">#31#</code>). Aplicaciones de VoIP como WhatsApp manejan su propio protocolo cerrado sin exponer APIs para iniciarlas desde nuestro marcador.'
      },
      {
        q: '¿Qué pasa si tengo un dispositivo con Dual SIM?',
        a: 'En iOS no existe una forma para que una app elija por qué línea enviar un código USSD, así que la llamada saldrá por tu línea configurada por defecto. En Android, la app nativa de llamadas interceptará el código y, dependiendo de tu configuración, usará la predeterminada o te preguntará qué SIM usar.'
      },
      {
        q: '¿Tienen widgets para la pantalla de inicio?',
        a: 'No. En iOS, las políticas prohíben estrictamente iniciar llamadas o ejecutar códigos USSD directamente desde un widget. Para mantener la experiencia segura y unificada en ambas plataformas, todas las operaciones requieren entrar a la app.'
      },
      {
        q: '¿Funciona en tablets o relojes inteligentes?',
        a: 'En general, no. Apple bloquea completamente la ejecución de códigos USSD en iPadOS y watchOS, incluso en modelos con conectividad Cellular. En el ecosistema Android, las tablets sin SIM o smartwatches sin aplicación de Teléfono nativa tampoco podrán realizar las operaciones.'
      }
    ],
    init() {
      this.$watch('darkMode', val => localStorage.setItem('darkMode', val));
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        if (!localStorage.getItem('darkMode')) {
          this.darkMode = e.matches;
        }
      });
      window.addEventListener('notify:open', () => { this.notifyOpen = true; });
      Promise.all([
        fetch('https://api.github.com/repos/albertolicea00/Qvacell-ios').then(r => r.json()),
        fetch('https://api.github.com/repos/albertolicea00/Qvacell-android').then(r => r.json())
      ])
      .then(([ios, android]) => {
        let count = 0;
        if (ios.stargazers_count !== undefined) count += ios.stargazers_count;
        if (android.stargazers_count !== undefined) count += android.stargazers_count;
        if (count > 0) this.githubStars = count;
      })
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
