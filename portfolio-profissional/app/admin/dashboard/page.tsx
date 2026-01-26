import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { DashboardAnalytics } from "@/components/admin/DashboardAnalytics"

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

      {/* Dashboard Analytics */}
      <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        <DashboardAnalytics />
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