import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#0b1220] text-white antialiased">{children}</body>
    </html>
  );
}