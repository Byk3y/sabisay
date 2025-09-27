import './globals.css';
import { Providers } from '@/components/providers';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { SignUpModalProvider } from '@/contexts/SignUpModalContext';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-white dark:bg-[#0b1220] text-gray-900 dark:text-white antialiased transition-colors">
        <Providers>
          <ThemeProvider>
            <SignUpModalProvider>{children}</SignUpModalProvider>
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
