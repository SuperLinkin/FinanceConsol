export default function PageContainer({ children, maxWidth = "full", noPadding = false }) {
  const widthClasses = {
    full: "w-full",
    "7xl": "max-w-7xl mx-auto",
    "6xl": "max-w-6xl mx-auto",
    "5xl": "max-w-5xl mx-auto",
    "4xl": "max-w-4xl mx-auto"
  };

  return (
    <div className={`${widthClasses[maxWidth]} ${noPadding ? '' : 'px-8 py-6'}`}>
      {children}
    </div>
  );
}
