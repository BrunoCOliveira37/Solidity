export function Card({ children, className = '' }) {
  return (
    <div
      className={`bg-gradient-to-b from-black to-purple-900 border border-purple-700 rounded-2xl shadow-lg p-6 ${className}`}
    >
      {children}
    </div>
  );
}

export function CardContent({ children, className = '' }) {
  return <div className={`text-white ${className}`}>{children}</div>;
}
