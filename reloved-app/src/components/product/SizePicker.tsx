// Storleksknappar för lagervaror med varianter (t.ex. S, M, L)
interface SizePickerProps {
  sizes: string[];
  value: string;
  onChange: (size: string) => void;
  showError?: boolean;
}

function SizePicker({ sizes, value, onChange, showError }: SizePickerProps) {
  return (
    <fieldset className={`size-picker ${showError ? "has-error" : ""}`}>
      <legend>
        Storlek
        {showError && (
          <span className="size-picker__hint"> · välj en storlek</span>
        )}
      </legend>
      <div className="size-picker__options">
        {sizes.map((size) => (
          <label key={size} className="size-picker__option">
            <input
              type="radio"
              name="size"
              value={size}
              checked={value === size}
              onChange={() => onChange(size)}
            />
            <span>{size}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export default SizePicker;
