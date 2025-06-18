export function Button({ children, className = '', ...props }) {
  return (
    <button
      className={`bg-purple-700 hover:bg-purple-800 text-white font-semibold px-4 py-2 rounded-2xl shadow ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}