let container = null;

function getContainer() {
  if (container) return container;

  container = document.createElement("div");
  container.id = "toast-container";
  container.setAttribute("role", "status");
  container.setAttribute("aria-live", "polite");
  document.body.appendChild(container);
  return container;
}

/**
 * Visar en liten notis i hörnet som tonar in och sedan ut av sig själv.
 * @param {string} message - Texten som visas
 * @param {"success"|"error"} type - Avgör färgen (grön/röd)
 * @param {number} duration - Hur länge den syns, i millisekunder
 */
export function showToast(message, type = "success", duration = 3000) {
  const toastContainer = getContainer();

  const toast = document.createElement("div");
  toast.className = `toast toast--${type}`;
  toast.textContent = message;
  toastContainer.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.add("toast--visible");
  });

  setTimeout(() => {
    toast.classList.remove("toast--visible");
    toast.addEventListener("transitionend", () => toast.remove(), { once: true });
  }, duration);
}