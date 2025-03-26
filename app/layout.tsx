'use client';

import './styles/globals.css';
import { Inter } from 'next/font/google';
import { AuthProvider } from './lib/context/AuthContext';
import Navbar from './components/Navbar';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <Navbar />
          <main className="pt-16">{children}</main>
          <footer className="bg-gray-100 border-t border-gray-200 mt-10">
            <div className="container mx-auto px-4 py-8">
              <div className="flex flex-col md:flex-row justify-between">
                <div className="mb-6 md:mb-0">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">HarmonyAI</h3>
                  <p className="text-gray-600 max-w-md">
                    AI-powered decentralized user research platform. Create surveys, gain insights, earn tokens.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-800 mb-3">Links</h4>
                    <ul className="space-y-2">
                      <li>
                        <a href="/about" className="text-gray-600 hover:text-blue-600 text-sm">About Us</a>
                      </li>
                      <li>
                        <a href="/contact" className="text-gray-600 hover:text-blue-600 text-sm">Contact Us</a>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-800 mb-3">Legal</h4>
                    <ul className="space-y-2">
                      <li>
                        <a href="/terms" className="text-gray-600 hover:text-blue-600 text-sm">Terms of Service</a>
                      </li>
                      <li>
                        <a href="/privacy" className="text-gray-600 hover:text-blue-600 text-sm">Privacy Policy</a>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-800 mb-3">Resources</h4>
                    <ul className="space-y-2">
                      <li>
                        <a href="/docs" className="text-gray-600 hover:text-blue-600 text-sm">Documentation</a>
                      </li>
                      <li>
                        <a href="/faqs" className="text-gray-600 hover:text-blue-600 text-sm">FAQs</a>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="border-t border-gray-200 mt-8 pt-8 text-center">
                <p className="text-gray-600 text-sm">
                  &copy; {new Date().getFullYear()} HarmonyAI. All rights reserved.
                </p>
              </div>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
} 