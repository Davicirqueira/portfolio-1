'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { AlertCircle } from 'lucide-react'

// Import your main portfolio components
// These would be the same components used in your main portfolio
// For now, I'll create a simple preview structure

interface PreviewData {
  section?: string
  data?: any
}

export function PreviewContent() {
  const searchParams = useSearchParams()
  const [previewData, setPreviewData] = useState<PreviewData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    try {
      const dataParam = searchParams.get('data')
      if (dataParam) {
        const parsed = JSON.parse(decodeURIComponent(dataParam))
        setPreviewData(parsed)
      }
    } catch (err) {
      setError('Erro ao carregar dados de preview')
      console.error('Preview data parsing error:', err)
    }
  }, [searchParams])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Erro no Preview</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  if (!previewData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Preview Banner */}
      <div className="bg-yellow-100 border-b border-yellow-200 px-4 py-2">
        <div className="flex items-center justify-center text-yellow-800 text-sm font-medium">
          <AlertCircle className="w-4 h-4 mr-2" />
          Modo Preview - Esta é uma visualização das suas alterações
        </div>
      </div>

      {/* Preview Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h1 className="text-2xl font-bold mb-4">Preview do Conteúdo</h1>
          
          {/* This is where you would render your actual portfolio components */}
          {/* with the preview data. For now, showing the raw data structure */}
          
          <div className="space-y-6">
            {previewData.section && (
              <div>
                <h2 className="text-lg font-semibold mb-2">Seção: {previewData.section}</h2>
              </div>
            )}
            
            {previewData.data && (
              <div>
                <h3 className="text-md font-medium mb-2">Dados:</h3>
                <pre className="bg-gray-50 p-4 rounded-lg text-sm overflow-auto">
                  {JSON.stringify(previewData.data, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* Example of how you might render specific sections */}
          {previewData.section === 'home' && previewData.data && (
            <div className="mt-8 p-6 bg-blue-50 rounded-lg">
              <h2 className="text-xl font-bold mb-4">Preview da Seção Home</h2>
              <div className="space-y-4">
                {previewData.data.name && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nome:</label>
                    <p className="text-lg">{previewData.data.name}</p>
                  </div>
                )}
                {previewData.data.title && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Título:</label>
                    <p className="text-lg">{previewData.data.title}</p>
                  </div>
                )}
                {previewData.data.description && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Descrição:</label>
                    <p className="text-gray-600">{previewData.data.description}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {previewData.section === 'about' && previewData.data && (
            <div className="mt-8 p-6 bg-green-50 rounded-lg">
              <h2 className="text-xl font-bold mb-4">Preview da Seção Sobre</h2>
              <div className="space-y-4">
                {previewData.data.presentation && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Apresentação:</label>
                    <div 
                      className="prose max-w-none"
                      dangerouslySetInnerHTML={{ __html: previewData.data.presentation }}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Add more section previews as needed */}
        </div>
      </div>
    </div>
  )
}