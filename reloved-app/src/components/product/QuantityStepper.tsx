// − 2 + för att välja antal. Används på produktsidan och i varukorgen.
interface QuantityStepperProps {
  value: number;
  max: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  label?: string;
}

function QuantityStepper({
  value,
  max,
  onChange,
  disabled = false,
  label = "Antal",
}: QuantityStepperProps) {
  return (
    <div className="quantity-stepper" role="group" aria-label={label}>
      <button
        type="button"
        aria-label="Minska antal"
        onClick={() => onChange(value - 1)}
        disabled={disabled || value <= 1}
      >
        −
      </button>
      {/* key: siffran poppar när den ändras */}
      <output className="scale-pop" key={value} aria-live="polite">
        {value}
      </output>
      <button
        type="button"
        aria-label="Öka antal"
        onClick={() => onChange(value + 1)}
        disabled={disabled || value >= max}
      >
        +
      </button>
    </div>
  );
}

export default QuantityStepper;
