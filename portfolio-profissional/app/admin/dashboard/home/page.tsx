import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { HomeEditor } from "@/components/admin/forms/HomeEditor"

export default async function HomeEditorPage() {
  const session = await auth()
  
  if (!session) {
    redirect("/admin/login")
  }

  return (
    <div className="space-y-6">
      <div className="animate-fade-in-up">
        <h1 className="text-2xl font-bold text-foreground">
          Editar Seção Home
        </h1>
        <p className="mt-2 text-muted-foreground">
          Gerencie as informações principais da página inicial do seu portfólio
        </p>
      </div>

      <HomeEditor />
    </div>
  )
}