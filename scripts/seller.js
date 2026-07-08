import { submitListing } from "./api.js";

export function setupSellerForm() {
  const form = document.getElementById("seller-form");
  if (!form) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(form);

    try {
      await submitListing(formData);
      alert("Din annons är inskickad och väntar på granskning!");
      form.reset();
    } catch (err) {
      console.error(err);
      alert("Kunde inte skicka in annonsen.");
    }
  });
}
