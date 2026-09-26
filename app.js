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
        q: '¿Puedo usar Qvacell sin instalar la app?',
        a: 'Sí. Entra a <a href="dial.html" class="text-navy dark:text-accent underline hover:no-underline">/dial</a> — el marcador USSD corriendo directo en el navegador. Agrégalo a tu pantalla de inicio y funciona incluso sin internet: después de la primera visita, la página y el catálogo de códigos quedan guardados en el propio navegador.'
      },
      {
        q: '¿Por qué el saldo se muestra solo en Android pero no en iPhone?',
        a: 'En <strong>Android</strong>, la aplicación puede leer la respuesta de los códigos USSD y mostrarla directamente en la interfaz. En <strong>iPhone</strong>, <strong>iOS</strong> no permite a las aplicaciones de terceros acceder a las respuestas USSD por sus restricciones de seguridad. Por eso, en <strong>iOS</strong> el código se prepara y se abre la aplicación Teléfono para que puedas consultar la respuesta oficial de ETECSA.'
      },
      {
        q: '¿Cómo funciona el identificador de cobro revertido (*99) en cada sistema?',
        a: 'En <strong>iOS</strong>, el nombre del contacto aparece directamente en la pantalla de llamada entrante. En <strong>Android</strong>, la API del sistema no permite modificar la pantalla de llamada nativa a menos que configures nuestra app como tu marcador predeterminado. Como nos parece demasiado invasivo pedirte que reemplaces tu app de Teléfono principal solo por esta función, en <strong>Android</strong> el nombre se mostrará cómodamente a través de una <strong>notificación emergente</strong> al recibir la llamada.'
      },
      {
        q: '¿El identificador de llamadas reconoce automáticamente quién me llama?',
        a: 'No. El directorio telefónico de la app se mantiene separado del identificador de llamadas del sistema. Tanto <strong>iOS</strong> como <strong>Android</strong> imponen límites estrictos o políticas de privacidad que impiden inyectar millones de registros de la guía telefónica directamente en los contactos de tu teléfono.'
      },
      {
        q: '¿Por qué no hay opciones para llamar directo como en WhatsApp o Telegram?',
        a: 'La app ofrece únicamente operaciones sobre la red celular tradicional (llamada normal, cobro revertido <code class="code-inline">*99</code>, llamada privada <code class="code-inline">#31#</code>). Aplicaciones de VoIP como WhatsApp manejan su propio protocolo cerrado sin exponer APIs para iniciarlas desde nuestro marcador.'
      },
      {
        q: '¿Qué pasa si tengo un dispositivo con Dual SIM?',
        a: 'En <strong>iOS</strong> no existe una forma para que una app elija por qué línea enviar un código USSD, así que la llamada saldrá por tu línea configurada por defecto. En <strong>Android</strong>, puedes configurar el teléfono para usar una SIM predeterminada o seleccionar cuál usar.'
      },
      {
        q: '¿Tienen widgets para la pantalla de inicio?',
        a: 'Sí, en <strong>Android</strong> puedes usar widgets de marcado rápido. Sin embargo, en <strong>iOS</strong> las políticas de seguridad de Apple prohíben estrictamente iniciar llamadas o ejecutar códigos USSD directamente desde un widget, por lo que en <strong>iPhone</strong> las operaciones siempre requerirán entrar a la app.'
      },
      {
        q: '¿Funciona en tablets o relojes inteligentes?',
        a: 'En general, no. Apple bloquea completamente la ejecución de códigos USSD en iPadOS y watchOS, incluso en modelos con conectividad Cellular. En el ecosistema <strong>Android</strong>, las tablets sin SIM o smartwatches sin aplicación de Teléfono nativa tampoco podrán realizar las operaciones.'
      },
      {
        q: '¿Cuándo estará en la App Store y Play Store?',
        a: 'Actualmente está en revisión de las tiendas — solo disponible instalando desde el código fuente en GitHub. <button onclick="window.dispatchEvent(new CustomEvent(\'notify:open\'))" class="text-navy dark:text-accent underline cursor-pointer">Suscríbete</button> para recibir una notificación en cuanto se publique.'
      },
      {
        q: '¿Cuánto cuesta la app?',
        a: 'Cero. Que bastante caro te salió ya el teléfono como para seguir gastando.'
      },
    ],
    init() {
      let scrollY = 0;
      this.$watch('notifyOpen', open => {
        if (open) {
          scrollY = window.scrollY;
          document.body.style.position = 'fixed';
          document.body.style.top = `-${scrollY}px`;
          document.body.style.left = '0';
          document.body.style.right = '0';
        } else {
          document.body.style.position = '';
          document.body.style.top = '';
          document.body.style.left = '';
          document.body.style.right = '';
          window.scrollTo(0, scrollY);
        }
      });
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
