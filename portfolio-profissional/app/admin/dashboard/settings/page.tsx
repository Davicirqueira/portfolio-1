import { Metadata } from "next"
import { AdminSettingsPanel } from "@/components/admin/settings/AdminSettingsPanel"

export const metadata: Metadata = {
  title: "Admin Settings - Admin Dashboard",
  description: "Configure administrative settings and preferences",
}

export default function AdminSettingsPage() {
  return (
    <div className="container mx-auto py-6">
      <AdminSettingsPanel />
    </div>
  )
}