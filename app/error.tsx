'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="p-4 bg-red-50 text-red-700 rounded-lg">
      <h2 className="font-bold">Something went wrong!</h2>
      <p>{error.message}</p>
      <button 
        onClick={() => reset()}
        className="mt-2 px-4 py-2 bg-red-600 text-white rounded"
      >
        Try again
      </button>
    </div>
  )
}
