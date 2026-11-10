/* ============================================================
   Portfólio — Antonio Rodrigues
   Cursor Zangetsu — a espada do protagonista de Bleach
   Lâmina em SVG estilo mangá + brilho de reiatsu + corte no clique.
   Progressive enhancement: se o JS não rodar, o cursor nativo
   permanece (a classe que esconde o cursor só é adicionada aqui).
   ============================================================ */

(function () {
    "use strict";

    /* Só ativa com ponteiro preciso (mouse/caneta); toque mantém o nativo */
    if (!window.matchMedia || !window.matchMedia("(pointer: fine)").matches) {
        return;
    }

    /* Ponta da lâmina no SVG — o hotspot do cursor fica exatamente aí */
    const TIP_X = 64;
    const TIP_Y = 6;

    const SVG = `
<svg viewBox="0 0 120 128" width="120" height="128" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
    <path d="M55 110 C 48 114, 45 121, 50 127 C 53 122, 58 117, 61 111 Z" fill="#F4F2ED" stroke="#0C0C0F" stroke-width="2" stroke-linejoin="round"/>
    <rect x="53" y="69" width="14" height="39" rx="4.5" fill="#F4F2ED" stroke="#0C0C0F" stroke-width="2.5"/>
    <path d="M52.5 78 L 67.5 74 M52.5 87 L 67.5 83 M52.5 96 L 67.5 92 M52.5 105 L 67.5 101" stroke="#0C0C0F" stroke-width="1.6" opacity="0.7"/>
    <circle cx="60" cy="113" r="2.6" fill="#F4F2ED" stroke="#0C0C0F" stroke-width="1.5"/>
    <circle cx="60" cy="118.4" r="2.2" fill="#F4F2ED" stroke="#0C0C0F" stroke-width="1.4"/>
    <circle cx="60" cy="123.2" r="1.8" fill="#F4F2ED" stroke="#0C0C0F" stroke-width="1.3"/>
    <path d="M64 6 C 76 12, 79 20, 79 30 L 79 62 Q 79 70, 71 70 L 49 70 C 44 62, 41 52, 44 38 C 47 24, 55 11, 64 6 Z" fill="#F4F2ED" stroke="#0C0C0F" stroke-width="3" stroke-linejoin="round"/>
    <path d="M47 24 C 43.8 40, 44 58, 49 69" stroke="#FFFFFF" stroke-width="1.6" fill="none" opacity="0.55"/>
    <path d="M71.5 20 C 73 34, 73 52, 71.5 64" stroke="#0C0C0F" stroke-width="2" fill="none" opacity="0.18"/>
</svg>`;

    const CSS = `
html.zc-on,
html.zc-on * { cursor: none !important; }

/* campos de texto mantêm o cursor nativo de edição */
html.zc-on input,
html.zc-on textarea,
html.zc-on select { cursor: text !important; }

.zangetsu-cursor {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 2147483646;
    width: 120px;
    height: 128px;
    pointer-events: none;
    transform: translate3d(-240px, -240px, 0) rotate(45deg);
    transform-origin: 64px 6px;
    will-change: transform;
    opacity: 0;
}

.zangetsu-cursor.is-visible { opacity: 1; }
.zangetsu-cursor.is-text { opacity: 0; }

.zangetsu-cursor svg {
    display: block;
    filter: drop-shadow(0 0 5px rgba(246, 137, 30, 0.45)) drop-shadow(0 0 16px rgba(200, 16, 46, 0.22));
    transition: filter 0.16s ease;
}

/* brilho de reiatsu mais forte sobre o que é clicável (não é movimento) */
.zangetsu-cursor.is-hot svg {
    filter: drop-shadow(0 0 8px rgba(246, 137, 30, 0.75)) drop-shadow(0 0 24px rgba(200, 16, 46, 0.40));
}

.zangetsu-swing {
    width: 100%;
    height: 100%;
    transform-origin: 64px 6px;
}

@media (prefers-reduced-motion: no-preference) {
    .zangetsu-cursor {
        transition: opacity 0.16s ease;
    }

    .zangetsu-swing {
        transition: transform 0.16s cubic-bezier(0.2, 0.7, 0.2, 1);
    }

    .zangetsu-cursor.is-hot .zangetsu-swing {
        transform: rotate(-8deg) scale(1.06);
    }

    .zangetsu-swing.zc-slash {
        animation: zc-slash 0.3s cubic-bezier(0.2, 0.7, 0.2, 1);
    }
}

@keyframes zc-slash {
    0% { transform: rotate(0deg); }
    45% { transform: rotate(26deg) scale(1.05); }
    100% { transform: rotate(0deg); }
}
`;

    const style = document.createElement("style");
    style.textContent = CSS;
    document.head.appendChild(style);

    const cursor = document.createElement("div");
    cursor.className = "zangetsu-cursor";
    cursor.setAttribute("aria-hidden", "true");
    cursor.innerHTML = '<div class="zangetsu-swing">' + SVG + "</div>";
    document.body.appendChild(cursor);

    const swing = cursor.querySelector(".zangetsu-swing");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let shown = false;
    let hot = false;
    let textMode = false;

    const setShown = (value) => {
        if (shown === value) return;
        shown = value;
        cursor.classList.toggle("is-visible", value);
    };

    const setHot = (value) => {
        if (hot === value) return;
        hot = value;
        cursor.classList.toggle("is-hot", value);
    };

    const setTextMode = (value) => {
        if (textMode === value) return;
        textMode = value;
        cursor.classList.toggle("is-text", value);
    };

    window.addEventListener("pointermove", (e) => {
        if (e.pointerType === "touch") {
            setShown(false);
            return;
        }

        /* a ponta da lâmina fica exatamente sob o ponteiro */
        cursor.style.transform =
            "translate3d(" + (e.clientX - TIP_X) + "px, " + (e.clientY - TIP_Y) + "px, 0) rotate(45deg)";

        const el = e.target instanceof Element ? e.target : null;
        const isText = !!(el && el.closest("input, textarea, select"));
        const isHot = !isText && !!(el && el.closest("a, button, label, summary, [role='button']"));

        setTextMode(isText);
        setHot(isHot);
        setShown(!isText);
    }, { passive: true });

    window.addEventListener("pointerdown", (e) => {
        if (e.button !== 0 || e.pointerType === "touch" || textMode || reduceMotion) return;
        swing.classList.remove("zc-slash");
        void swing.offsetWidth; /* reinicia a animação em cliques rápidos */
        swing.classList.add("zc-slash");
    });

    swing.addEventListener("animationend", () => {
        swing.classList.remove("zc-slash");
    });

    /* some quando o mouse deixa a janela */
    document.addEventListener("pointerout", (e) => {
        if (!e.relatedTarget) setShown(false);
    });
    document.documentElement.addEventListener("mouseleave", () => setShown(false));
    window.addEventListener("blur", () => setShown(false));

    /* o cursor nativo só desaparece quando o Zangetsu está ativo */
    document.documentElement.classList.add("zc-on");
})();
