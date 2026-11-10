const values = [
  {
    text: "Ett exemplar av varje",
    icon: <path d="M6 4h12l3 5-9 11L3 9l3-5zM3 9h18M9 4l3 16M15 4l-3 16" />,
  },
  {
    text: "Varje annons granskas",
    icon: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M8 12.5l2.6 2.5L16 9.5" />
      </>
    ),
  },
  {
    text: "Fri frakt från 500 kr",
    icon: <path d="M3 7l9-4 9 4v10l-9 4-9-4V7zM3 7l9 4 9-4M12 11v10" />,
  },
];

function ValueStrip() {
  return (
    <section className="value-strip" aria-label="Det här gäller på ReLoved">
      <ul className="container value-strip__list">
        {values.map((value) => (
          <li key={value.text}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              {value.icon}
            </svg>
            {value.text}
          </li>
        ))}
      </ul>
    </section>
  );
}

export default ValueStrip;
