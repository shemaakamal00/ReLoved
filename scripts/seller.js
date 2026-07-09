import { submitListing } from "./api.js";
import { showToast } from "./toast.js";

export function setupSellerForm() {
  const form = document.getElementById("seller-form");
  if (!form) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(form);

    try {
      await submitListing(formData);
      showToast("Din annons är inskickad och väntar på granskning!");
      form.reset();
    } catch (err) {
      console.error(err);
      showToast("Kunde inte skicka in annonsen.", "error");
    }
  });
}
