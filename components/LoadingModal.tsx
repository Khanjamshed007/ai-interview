'use client'

import { Loader2 } from 'lucide-react'

export default function LoadingModal() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm">
      <div className="bg-white p-6 rounded-2xl shadow-lg w-80 text-center">
        <div className="flex justify-center mb-4">
          <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
        </div>
        <h2 className="text-lg font-semibold text-gray-800 mb-2">Please wait...</h2>
        <p className="text-sm text-gray-600">We’re loading your next page.</p>
      </div>
    </div>
  )
}
