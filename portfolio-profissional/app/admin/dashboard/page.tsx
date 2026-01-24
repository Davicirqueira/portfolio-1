import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
  const session = await auth()
  
  if (!session) {
    redirect("/admin/login")
  }

  return (
    <div className="space-y-6">
      <div className="animate-fade-in-up">
        <h1 className="text-3xl font-bold text-foreground gradient-text">
          Dashboard Administrativo
        </h1>
        <p className="mt-2 text-muted-foreground">
          Bem-vindo ao painel de administração do seu portfólio, {session.user?.name}!
        </p>
      </div>

      {/* Dashboard overview cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        <div className="bg-card/50 backdrop-blur-sm border border-border overflow-hidden shadow-lg rounded-lg hover-lift">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-primary/10 rounded-md flex items-center justify-center ring-2 ring-primary/20">
                  <span className="text-primary text-sm font-medium">H</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-muted-foreground truncate">
                    Seção Home
                  </dt>
                  <dd className="text-lg font-medium text-foreground">
                    Configurado
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-card/50 backdrop-blur-sm border border-border overflow-hidden shadow-lg rounded-lg hover-lift">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500/10 rounded-md flex items-center justify-center ring-2 ring-green-500/20">
                  <span className="text-green-600 text-sm font-medium">P</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-muted-foreground truncate">
                    Projetos
                  </dt>
                  <dd className="text-lg font-medium text-foreground">
                    3 Ativos
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-card/50 backdrop-blur-sm border border-border overflow-hidden shadow-lg rounded-lg hover-lift">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-500/10 rounded-md flex items-center justify-center ring-2 ring-yellow-500/20">
                  <span className="text-yellow-600 text-sm font-medium">H</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-muted-foreground truncate">
                    Habilidades
                  </dt>
                  <dd className="text-lg font-medium text-foreground">
                    14 Itens
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-card/50 backdrop-blur-sm border border-border overflow-hidden shadow-lg rounded-lg hover-lift">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-500/10 rounded-md flex items-center justify-center ring-2 ring-purple-500/20">
                  <span className="text-purple-600 text-sm font-medium">D</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-muted-foreground truncate">
                    Depoimentos
                  </dt>
                  <dd className="text-lg font-medium text-foreground">
                    3 Ativos
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="bg-card/50 backdrop-blur-sm border border-border shadow-lg rounded-lg animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-foreground mb-2">
            Ações Rápidas
          </h3>
          <p className="text-sm text-muted-foreground mb-5">
            Acesse rapidamente as seções mais utilizadas do dashboard
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <a
              href="/admin/dashboard/home"
              className="relative group bg-card/30 backdrop-blur-sm p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary rounded-lg border border-border hover:border-primary/50 transition-all duration-200 hover-lift"
            >
              <div>
                <span className="rounded-lg inline-flex p-3 bg-primary/10 text-primary ring-4 ring-primary/5">
                  <span className="text-sm font-medium">🏠</span>
                </span>
              </div>
              <div className="mt-4">
                <h3 className="text-lg font-medium text-foreground">
                  Editar Home
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Atualize as informações principais da página inicial
                </p>
              </div>
            </a>

            <a
              href="/admin/dashboard/projects"
              className="relative group bg-card/30 backdrop-blur-sm p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary rounded-lg border border-border hover:border-primary/50 transition-all duration-200 hover-lift"
            >
              <div>
                <span className="rounded-lg inline-flex p-3 bg-green-500/10 text-green-600 ring-4 ring-green-500/5">
                  <span className="text-sm font-medium">📁</span>
                </span>
              </div>
              <div className="mt-4">
                <h3 className="text-lg font-medium text-foreground">
                  Gerenciar Projetos
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Adicione ou edite seus projetos profissionais
                </p>
              </div>
            </a>

            <a
              href="/admin/dashboard/media"
              className="relative group bg-card/30 backdrop-blur-sm p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary rounded-lg border border-border hover:border-primary/50 transition-all duration-200 hover-lift"
            >
              <div>
                <span className="rounded-lg inline-flex p-3 bg-purple-500/10 text-purple-600 ring-4 ring-purple-500/5">
                  <span className="text-sm font-medium">🖼️</span>
                </span>
              </div>
              <div className="mt-4">
                <h3 className="text-lg font-medium text-foreground">
                  Biblioteca de Mídia
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Gerencie imagens e outros arquivos de mídia
                </p>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}