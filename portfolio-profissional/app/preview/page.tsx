import { Suspense } from 'react'
import { PreviewContent } from './PreviewContent'

export default function PreviewPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    }>
      <PreviewContent />
    </Suspense>
  )
}