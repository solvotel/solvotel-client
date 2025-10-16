'use client';
import GlobalProvider from '@/context';
import './globals.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <GlobalProvider>
          {children}
          <ToastContainer />
        </GlobalProvider>
      </body>
    </html>
  );
}
