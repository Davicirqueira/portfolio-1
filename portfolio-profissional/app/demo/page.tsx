import Link from "next/link"

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Demonstrações - Admin Dashboard
          </h1>
          <p className="text-xl text-gray-600">
            Teste as funcionalidades implementadas na infraestrutura administrativa
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Link
            href="/demo/admin"
            className="block p-6 bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              🎛️ Infraestrutura de Edição
            </h2>
            <p className="text-gray-600 mb-4">
              Demonstração completa dos componentes de edição, validação em tempo real, 
              auto-save, feedback visual e gerenciamento de estado.
            </p>
            <div className="text-sm text-blue-600 font-medium">
              Ver demonstração →
            </div>
          </Link>

          <div className="p-6 bg-gray-100 rounded-lg border border-dashed border-gray-300">
            <h2 className="text-xl font-semibold text-gray-500 mb-2">
              🚧 Próximas Funcionalidades
            </h2>
            <p className="text-gray-500 mb-4">
              Editores específicos para cada seção (Home, About, Skills, etc.) 
              serão implementados nas próximas tasks.
            </p>
            <div className="text-sm text-gray-400 font-medium">
              Em desenvolvimento...
            </div>
          </div>
        </div>

        <div className="mt-12 p-6 bg-white rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            ✅ Funcionalidades Implementadas (Task 3)
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Hook useContentEditor com auto-save
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Validação em tempo real com Zod
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Componentes SaveButton e CancelButton
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Sistema de mensagens de feedback
              </li>
            </ul>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Estados de loading e feedback visual
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Componentes de formulário consistentes
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Container AdminFormContainer
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Testes de propriedade com fast-check
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800"
          >
            ← Voltar ao portfólio principal
          </Link>
        </div>
      </div>
    </div>
  )
}