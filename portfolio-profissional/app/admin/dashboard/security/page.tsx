import { Metadata } from "next"
import { SecurityDashboard } from "@/components/admin/security/SecurityDashboard"
import { AuditLogViewer } from "@/components/admin/security/AuditLogViewer"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export const metadata: Metadata = {
  title: "Security & Audit - Admin Dashboard",
  description: "Monitor security events and audit logs",
}

export default function SecurityPage() {
  return (
    <div className="container mx-auto py-6">
      <Tabs defaultValue="dashboard" className="space-y-4">
        <TabsList>
          <TabsTrigger value="dashboard">Security Dashboard</TabsTrigger>
          <TabsTrigger value="audit">Audit Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <SecurityDashboard />
        </TabsContent>

        <TabsContent value="audit">
          <AuditLogViewer />
        </TabsContent>
      </Tabs>
    </div>
  )
}