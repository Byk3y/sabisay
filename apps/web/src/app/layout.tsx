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
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Suppress hydration warnings for browser extension attributes
              if (typeof window !== 'undefined') {
                const originalConsoleError = console.error;
                console.error = function(...args) {
                  if (args[0] && typeof args[0] === 'string' && args[0].includes('bis_skin_checked')) {
                    return; // Suppress this specific warning
                  }
                  originalConsoleError.apply(console, args);
                };
              }
            `,
          }}
        />
      </head>
      <body
        className="bg-white dark:bg-[#0b1220] text-gray-900 dark:text-white antialiased transition-colors"
        suppressHydrationWarning
      >
        <Providers>
          <ThemeProvider>
            <SignUpModalProvider>{children}</SignUpModalProvider>
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
