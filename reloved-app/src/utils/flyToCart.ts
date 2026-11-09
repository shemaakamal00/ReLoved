// Kopian av produktbilden flyger till varukorgsikononen

const DURATION_MS = 700;

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function flyToCart(source: Element | null | undefined) {
  const target = document.querySelector("[data-cart-target]");
  if (!(source instanceof HTMLElement) || !target || prefersReducedMotion()) {
    return;
  }

  const from = source.getBoundingClientRect();
  const to = target.getBoundingClientRect();

  const clone = source.cloneNode(true) as HTMLElement;
  clone.classList.add("fly-to-cart");
  clone.setAttribute("aria-hidden", "true");
  Object.assign(clone.style, {
    left: `${from.left}px`,
    top: `${from.top}px`,
    width: `${from.width}px`,
    height: `${from.height}px`,
    margin: "0",
  });
  document.body.appendChild(clone);

  const dx = to.left + to.width / 2 - (from.left + from.width / 2);
  const dy = to.top + to.height / 2 - (from.top + from.height / 2);

  const animation = clone.animate(
    [
      { transform: "translate(0, 0) scale(1)", opacity: 1 },
      {
        transform: `translate(${dx * 0.45}px, ${dy * 0.45 - 80}px) scale(0.45)`,
        opacity: 0.95,
        offset: 0.55,
      },
      { transform: `translate(${dx}px, ${dy}px) scale(0.06)`, opacity: 0.4 },
    ],
    { duration: DURATION_MS, easing: "cubic-bezier(0.45, 0, 0.55, 1)" },
  );

  const cleanUp = () => clone.remove();
  animation.onfinish = cleanUp;
  animation.oncancel = cleanUp;
}
