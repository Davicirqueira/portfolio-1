import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { ProjectsEditor } from "@/components/admin/forms/ProjectsEditor"

export default async function ProjectsPage() {
  const session = await auth()
  
  if (!session) {
    redirect("/admin/login")
  }

  return (
    <div className="animate-fade-in-up">
      <ProjectsEditor />
    </div>
  )
}