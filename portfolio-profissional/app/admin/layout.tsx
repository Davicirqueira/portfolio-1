import { SessionProvider } from "next-auth/react"
import { AdminLayout } from "@/components/admin/layout/AdminLayout"

export default function AdminLayoutWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SessionProvider>
      <AdminLayout>
        {children}
      </AdminLayout>
    </SessionProvider>
  )
}