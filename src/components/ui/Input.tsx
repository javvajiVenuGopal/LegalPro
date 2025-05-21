interface InputProps {
  label?: string;
  id: string;
  type?: string;
  [key: string]: any;
}

export const Input = ({ label, id, type = 'text', ...props }: InputProps) => (
  <div className="space-y-1">
    {label && <label htmlFor={id} className="text-sm font-medium text-gray-700">{label}</label>}
    <input
      id={id}
      type={type}
      className="w-full border border-gray-300 px-3 py-2 rounded-md focus:ring-primary-500 focus:outline-none"
      {...props}
    />
  </div>
);
