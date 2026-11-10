import type { ChangeEvent } from "react";
import { useToast } from "../context/ToastContext";
import { imageFileProblem } from "../utils/imageFile";

export function useImageCheck() {
  const { showToast } = useToast();

  return function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const problem = imageFileProblem(file);
    if (problem) {
      showToast(problem, "error");
      event.target.value = "";
      return;
    }

    showToast(`Bild vald: ${file.name}`);
  };
}
