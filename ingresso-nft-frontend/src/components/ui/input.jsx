export function Input({ className = '', ...props }) {
  return (
    <input
      className={`bg-black text-white border border-purple-600 rounded-2xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-700 ${className}`}
      {...props}
    />
  );
}