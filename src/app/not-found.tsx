'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50 px-4">
      <div className="text-center max-w-md">
        {/* 404 Text */}
        <div className="mb-8">
          <h1 className="text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600 mb-2">
            404
          </h1>
          <div className="h-1 w-24 bg-gradient-to-r from-pink-500 to-purple-600 mx-auto rounded-full"></div>
        </div>

        {/* Message */}
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          Oops! Page Not Found
        </h2>
        <p className="text-gray-600 mb-8 text-lg">
          The page you're looking for has wilted away. Let's help you find your way back to Paper Petals.
        </p>

        {/* Illustration or Icon */}
        <div className="mb-8">
          <div className="text-6xl inline-block opacity-50">🌸</div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:justify-center gap-4">
          <Link
            href="/"
            className="inline-block px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300 hover:scale-105"
          >
            Home
          </Link>
          <button
            onClick={() => router.back()}
            className="inline-block px-8 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:border-pink-500 hover:text-pink-500 transition-all duration-300"
          >
            Go Back
          </button>
        </div>

        {/* Additional Links */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-gray-600 text-sm mb-4">Need help? Visit these pages:</p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link href="/products" className="text-pink-500 hover:underline font-medium">
              Shop
            </Link>
            <span className="text-gray-400">•</span>
            <Link href="/contact" className="text-pink-500 hover:underline font-medium">
              Contact Us
            </Link>
            <span className="text-gray-400">•</span>
            <Link href="/about" className="text-pink-500 hover:underline font-medium">
              About
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
