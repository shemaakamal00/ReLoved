import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

const CLOSE_MS = 200;

interface ModalProps {
  label: string;
  onClose: () => void;
  children: ReactNode;
  className?: string;
}

// Dialogruta med mörk bakgrund. Stängs med Esc, krysset eller klick utanför.
// Vid stängning spelas en kort ut-animation innan onClose anropas.
function Modal({ label, onClose, children, className = "" }: ModalProps) {
  const [closing, setClosing] = useState(false);

  function close() {
    setClosing(true);
    setTimeout(onClose, CLOSE_MS);
  }

  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setClosing(true);
        setTimeout(onClose, CLOSE_MS);
      }
    }
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKey);
    };
  }, [onClose]);

  return createPortal(
    <div
      className={`modal-backdrop ${closing ? "is-closing" : ""}`}
      onClick={close}
    >
      <div
        className={`modal ${className}`}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="modal__close"
          aria-label="Stäng"
          onClick={close}
          autoFocus
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        </button>
        {children}
      </div>
    </div>,
    document.body,
  );
}

export default Modal;
