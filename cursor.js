/* ============================================================
   Portfólio — Antonio Rodrigues
   Cursor Zangetsu — a espada do protagonista de Bleach
   Sprite: img/mouse.png (espada diagonal, ponta no canto
   superior esquerdo). O hotspot do clique é a própria ponta,
   localizada escaneando o canal alfa da imagem.
   Progressive enhancement: sem JS ou sem a imagem, o cursor
   nativo do navegador permanece.
   ============================================================ */

(function () {
    "use strict";

    /* Só ativa com ponteiro preciso (mouse/caneta); toque mantém o nativo */
    if (!window.matchMedia || !window.matchMedia("(pointer: fine)").matches) {
        return;
    }

    const IMG_SRC = "img/mouse.png";
    const DISPLAY_SIZE = 128;

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
    width: 128px;
    height: 128px;
    pointer-events: none;
    transform: translate3d(-240px, -240px, 0);
    will-change: transform;
    opacity: 0;
}

.zangetsu-cursor.is-visible { opacity: 1; }
.zangetsu-cursor.is-text { opacity: 0; }

.zangetsu-cursor img {
    display: block;
    width: 128px;
    height: 128px;
    filter: drop-shadow(0 0 5px rgba(246, 137, 30, 0.45)) drop-shadow(0 0 16px rgba(200, 16, 46, 0.22));
    transition: filter 0.16s ease;
}

/* brilho de reiatsu mais forte sobre o que é clicável (não é movimento) */
.zangetsu-cursor.is-hot img {
    filter: drop-shadow(0 0 8px rgba(246, 137, 30, 0.75)) drop-shadow(0 0 24px rgba(200, 16, 46, 0.40));
}

.zangetsu-swing {
    width: 100%;
    height: 100%;
    transform-origin: 4px 4px; /* substituído pela ponta real via JS */
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

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let cursor = null;
    let swing = null;
    let tipX = 0;
    let tipY = 0;

    let shown = false;
    let hot = false;
    let textMode = false;

    const setShown = (value) => {
        if (!cursor || shown === value) return;
        shown = value;
        cursor.classList.toggle("is-visible", value);
    };

    const setHot = (value) => {
        if (!cursor || hot === value) return;
        hot = value;
        cursor.classList.toggle("is-hot", value);
    };

    const setTextMode = (value) => {
        if (!cursor || textMode === value) return;
        textMode = value;
        cursor.classList.toggle("is-text", value);
    };

    const img = new Image();
    img.alt = "";
    img.draggable = false;
    img.setAttribute("aria-hidden", "true");

    img.addEventListener("error", () => {
        /* sem imagem não há espada: limpa o CSS extra e mantém o cursor nativo */
        style.remove();
    });

    img.addEventListener("load", () => {
        /* localiza a ponta real da espada: pixel visível mais à esquerda
           da primeira linha opaca da imagem (a ponta fica no canto) */
        try {
            const c = document.createElement("canvas");
            c.width = img.naturalWidth || DISPLAY_SIZE;
            c.height = img.naturalHeight || DISPLAY_SIZE;
            const ctx = c.getContext("2d", { willReadFrequently: true });
            ctx.drawImage(img, 0, 0);
            const d = ctx.getImageData(0, 0, c.width, c.height).data;

            /* escala caso a imagem não seja 128px nativos */
            const sx = DISPLAY_SIZE / c.width;
            const sy = DISPLAY_SIZE / c.height;

            busca:
            for (let y = 0; y < c.height; y++) {
                for (let x = 0; x < c.width; x++) {
                    if (d[(y * c.width + x) * 4 + 3] > 16) {
                        tipX = Math.round(x * sx);
                        tipY = Math.round(y * sy);
                        break busca;
                    }
                }
            }
        } catch (err) {
            /* leitura bloqueada (ex.: abertura via file://): a ponta é o canto */
            tipX = 0;
            tipY = 0;
        }

        cursor = document.createElement("div");
        cursor.className = "zangetsu-cursor";
        cursor.setAttribute("aria-hidden", "true");

        swing = document.createElement("div");
        swing.className = "zangetsu-swing";
        swing.style.transformOrigin = tipX + "px " + tipY + "px";
        swing.appendChild(img);
        cursor.appendChild(swing);
        document.body.appendChild(cursor);

        swing.addEventListener("animationend", () => {
            swing.classList.remove("zc-slash");
        });

        window.addEventListener("pointermove", (e) => {
            if (e.pointerType === "touch") {
                setShown(false);
                return;
            }

            /* a ponta da lâmina fica exatamente sob o ponteiro */
            cursor.style.transform =
                "translate3d(" + (e.clientX - tipX) + "px, " + (e.clientY - tipY) + "px, 0)";

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

        /* some quando o mouse deixa a janela */
        document.addEventListener("pointerout", (e) => {
            if (!e.relatedTarget) setShown(false);
        });
        document.documentElement.addEventListener("mouseleave", () => setShown(false));
        window.addEventListener("blur", () => setShown(false));

        /* o cursor nativo só desaparece quando o Zangetsu está pronto */
        document.documentElement.classList.add("zc-on");
    });

    img.src = IMG_SRC;
})();
