import { useState, type InputHTMLAttributes } from "react";

// Lösenordsfält med en ögonknapp som visar eller döljer lösenordet
function PasswordInput(props: InputHTMLAttributes<HTMLInputElement>) {
  const [visible, setVisible] = useState(false);

  return (
    <span className="password-input">
      <input {...props} type={visible ? "text" : "password"} />
      <button
        type="button"
        className="password-input__toggle"
        aria-label={visible ? "Dölj lösenord" : "Visa lösenord"}
        aria-pressed={visible}
        onClick={() => setVisible((v) => !v)}
      >
        {/* key: ikonen byggs om vid byte så att den poppar */}
        <svg viewBox="0 0 24 24" aria-hidden="true" key={String(visible)}>
          <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" />
          <circle cx="12" cy="12" r="3" />
          {visible && <path d="M4 4l16 16" />}
        </svg>
      </button>
    </span>
  );
}

export default PasswordInput;
