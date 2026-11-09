// En bock i en cirkel som ritas upp (motion.css)
function Checkmark({ small = false }: { small?: boolean }) {
  return (
    <svg
      className={`checkmark ${small ? "checkmark--small" : ""}`}
      viewBox="0 0 52 52"
      aria-hidden="true"
    >
      <circle cx="26" cy="26" r="24" />
      <path d="M15 27l7 7 15-16" />
    </svg>
  );
}

export default Checkmark;
