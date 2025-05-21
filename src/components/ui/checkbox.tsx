// Input.tsx (example)

// Checkbox.tsx (example)
interface CheckboxProps {
  label: string;
  id: string;
  [key: string]: any; // For additional props
}

export const Checkbox = ({ label, id, ...props }: CheckboxProps) => (
  <div className="flex items-center space-x-2">
    <input id={id} type="checkbox" className="form-checkbox h-4 w-4 text-primary-600" {...props} />
    <label htmlFor={id} className="text-sm text-gray-700">{label}</label>
  </div>
);
