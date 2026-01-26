import { Metadata } from "next"
import { BackupManager } from "@/components/admin/backup/BackupManager"

export const metadata: Metadata = {
  title: "Backup Manager - Admin Dashboard",
  description: "Create and manage system backups",
}

export default function BackupPage() {
  return (
    <div className="container mx-auto py-6">
      <BackupManager />
    </div>
  )
}