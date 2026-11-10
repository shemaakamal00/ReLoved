// Fel- eller bekräftelsemeddelande i formulär.
// Rutan finns alltid i DOM:en och växer mjukt när ett meddelande kommer,
// så att resten av formuläret glider undan i stället för att hoppa.
interface FormMessageProps {
  message: string | null | undefined;
  type?: "error" | "success";
}

function FormMessage({ message, type = "error" }: FormMessageProps) {
  return (
    <div
      className={`form-message ${message ? "is-visible" : ""}`}
      role={type === "error" ? "alert" : "status"}
    >
      <div className="form-message__inner">
        {message && <p className={`form-${type}`}>{message}</p>}
      </div>
    </div>
  );
}

export default FormMessage;
