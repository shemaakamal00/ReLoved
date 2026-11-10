import { useEffect, useState, type ChangeEvent } from "react";
import type { Category, Product } from "../../types";
import { CONDITIONS } from "../../utils/conditions";
import { IMAGE_ACCEPT, MAX_IMAGE_MB } from "../../utils/imageFile";
import CategoryOptions from "./CategoryOptions";

interface ProductFormFieldsProps {
  variant: "admin" | "seller";
  product: Product | null | undefined;
  categories: Category[];
  onImageChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

function ProductFormFields({
  variant,
  product,
  categories,
  onImageChange,
}: ProductFormFieldsProps) {
  const isSeller = variant === "seller";
  const fullWidth = `${variant}-form__full`;
  const preview = useImagePreview(product?.image_url ?? null);

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    onImageChange(event);
    preview.show(event.target.files?.[0]);
  }
  return (
    <>
      <label>
        Produktnamn
        <input
          name="title"
          type="text"
          defaultValue={product?.name}
          placeholder="Svart skinnjacka"
          required
        />
      </label>

      <label>
        Varumärke
        <input
          name="brand"
          type="text"
          defaultValue={product?.brand}
          placeholder="Zara"
          required
        />
      </label>

      <label>
        Pris
        <input
          name="price"
          type="number"
          defaultValue={product?.price}
          placeholder="350"
          required
        />
      </label>

      <label>
        Kategori
        <select
          name="category"
          defaultValue={
            isSeller
              ? String(product?.category_id ?? "")
              : (product?.category_id ?? undefined)
          }
          required={isSeller}
        >
          {isSeller && (
            <option value="" disabled>
              Välj kategori
            </option>
          )}
          <CategoryOptions categories={categories} />
        </select>
      </label>

      <label>
        Skick
        <select
          name="condition"
          defaultValue={product?.condition ?? (isSeller ? "" : undefined)}
          required={isSeller}
        >
          {isSeller && (
            <option value="" disabled>
              Välj skick
            </option>
          )}
          {CONDITIONS.map((condition) => (
            <option key={condition}>{condition}</option>
          ))}
        </select>
      </label>

      <label>
        Storlek
        <input
          name="size"
          type="text"
          defaultValue={product?.size ?? ""}
          placeholder="M"
          required={isSeller}
        />
      </label>

      <label>
        Färg
        <input
          name="color"
          type="text"
          defaultValue={product?.color ?? ""}
          placeholder="Svart"
          required={isSeller}
        />
      </label>

      <label className={isSeller ? undefined : fullWidth}>
        Material
        <input
          name="material"
          type="text"
          defaultValue={product?.material ?? ""}
          placeholder="Skinn"
          required={isSeller}
        />
      </label>

      {isSeller ? (
        <label className={`upload-box ${preview.url ? "has-preview" : ""}`}>
          <input
            name="image"
            type="file"
            accept={IMAGE_ACCEPT}
            onChange={handleImageChange}
            hidden
          />
          {preview.url ? (
            <img
              className="upload-box__preview"
              src={preview.url}
              alt="Förhandsvisning av produktbilden"
              key={preview.url}
            />
          ) : (
            <svg className="upload-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 8h3l2-3h6l2 3h3v11H4z" />
              <circle cx="12" cy="13" r="3.5" />
            </svg>
          )}
          <strong>
            {preview.url
              ? "Byt bild"
              : product
                ? "Byt produktbild (valfritt)"
                : "Ladda upp produktbild (obligatoriskt)"}
          </strong>
          <p>JPEG eller PNG, max {MAX_IMAGE_MB} MB</p>
        </label>
      ) : (
        <label className={fullWidth}>
          Produktbild {product && "(lämna tom för att behålla nuvarande bild)"}
          <small>JPEG eller PNG, max {MAX_IMAGE_MB} MB</small>
          <input
            name="image"
            type="file"
            accept={IMAGE_ACCEPT}
            onChange={handleImageChange}
          />
          {preview.url && (
            <img
              className="upload-box__preview"
              src={preview.url}
              alt="Förhandsvisning av produktbilden"
              key={preview.url}
            />
          )}
        </label>
      )}

      <label className={fullWidth}>
        Beskrivning
        <textarea
          name="description"
          defaultValue={product?.description ?? ""}
          placeholder={isSeller ? "Beskriv plagget..." : "Beskriv produkten..."}
          required={isSeller}
        ></textarea>
      </label>
    </>
  );
}

function useImagePreview(currentUrl: string | null) {
  const [fileUrl, setFileUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (fileUrl) URL.revokeObjectURL(fileUrl);
    };
  }, [fileUrl]);

  return {
    url: fileUrl ?? currentUrl,
    show(file: File | undefined) {
      setFileUrl(file ? URL.createObjectURL(file) : null);
    },
  };
}

export default ProductFormFields;
