"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Database, 
  Download, 
  Upload, 
  Trash2, 
  Plus, 
  RefreshCw,
  Calendar,
  HardDrive,
  AlertTriangle,
  CheckCircle
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Backup {
  id: string
  timestamp: Date
  description?: string
  metadata: {
    totalSize: number
    recordCounts: {
      portfolioData: number
      dynamicModals: number
      mediaFiles: number
    }
  }
}

interface BackupStats {
  totalBackups: number
  totalSize: number
  averageSize: number
  recentBackups: number
  oldestBackup: Date | null
  newestBackup: Date | null
}

interface RestoreOptions {
  includePortfolioData: boolean
  includeDynamicModals: boolean
  includeMediaFiles: boolean
  includeAdminSettings: boolean
  createBackupBeforeRestore: boolean
}

export function BackupManager() {
  const [backups, setBackups] = useState<Backup[]>([])
  const [stats, setStats] = useState<BackupStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [restoring, setRestoring] = useState<string | null>(null)
  const [newBackupDescription, setNewBackupDescription] = useState('')
  const [restoreOptions, setRestoreOptions] = useState<RestoreOptions>({
    includePortfolioData: true,
    includeDynamicModals: true,
    includeMediaFiles: false,
    includeAdminSettings: true,
    createBackupBeforeRestore: true
  })
  const { toast } = useToast()

  const fetchBackups = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/backup')
      if (!response.ok) throw new Error('Failed to fetch backups')
      
      const data = await response.json()
      setBackups(data.backups)
      setStats(data.stats)
    } catch (error) {
      console.error('Failed to fetch backups:', error)
      toast({
        title: "Error",
        description: "Failed to load backups",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBackups()
  }, [])

  const createBackup = async () => {
    try {
      setCreating(true)
      const response = await fetch('/api/admin/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: newBackupDescription || undefined })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create backup')
      }

      toast({
        title: "Success",
        description: "Backup created successfully"
      })
      
      setNewBackupDescription('')
      fetchBackups()
    } catch (error) {
      console.error('Failed to create backup:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to create backup",
        variant: "destructive"
      })
    } finally {
      setCreating(false)
    }
  }

  const restoreBackup = async (backupId: string) => {
    try {
      setRestoring(backupId)
      const response = await fetch('/api/admin/backup', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ backupId, options: restoreOptions })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to restore backup')
      }

      toast({
        title: "Success",
        description: "Backup restored successfully"
      })
      
      fetchBackups()
    } catch (error) {
      console.error('Failed to restore backup:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to restore backup",
        variant: "destructive"
      })
    } finally {
      setRestoring(null)
    }
  }

  const deleteBackup = async (backupId: string) => {
    try {
      const response = await fetch(`/api/admin/backup/${backupId}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete backup')

      toast({
        title: "Success",
        description: "Backup deleted successfully"
      })
      
      fetchBackups()
    } catch (error) {
      console.error('Failed to delete backup:', error)
      toast({
        title: "Error",
        description: "Failed to delete backup",
        variant: "destructive"
      })
    }
  }

  const formatSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    if (bytes === 0) return '0 Bytes'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString()
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Database className="h-6 w-6" />
          Backup Manager
        </h2>
        <Button onClick={fetchBackups} disabled={loading} size="sm">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Backups</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalBackups}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Size</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatSize(stats.totalSize)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Recent Backups</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.recentBackups}</div>
              <p className="text-xs text-gray-600">in last 7 days</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Average Size</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatSize(stats.averageSize)}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Create Backup */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Create New Backup
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="backup-description">Description (optional)</Label>
              <Input
                id="backup-description"
                placeholder="e.g., Before major update"
                value={newBackupDescription}
                onChange={(e) => setNewBackupDescription(e.target.value)}
                className="mt-1"
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={createBackup}
                disabled={creating}
              >
                <Plus className={`h-4 w-4 mr-2 ${creating ? 'animate-spin' : ''}`} />
                Create Backup
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Backups List */}
      <Card>
        <CardHeader>
          <CardTitle>Available Backups</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            <div className="space-y-3">
              {backups.map((backup) => (
                <div
                  key={backup.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">
                        {formatDate(backup.timestamp)}
                      </span>
                      {backup.description && (
                        <Badge variant="outline">{backup.description}</Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <HardDrive className="h-3 w-3" />
                        {formatSize(backup.metadata.totalSize)}
                      </span>
                      <span>
                        Portfolio: {backup.metadata.recordCounts.portfolioData}
                      </span>
                      <span>
                        Modals: {backup.metadata.recordCounts.dynamicModals}
                      </span>
                      <span>
                        Media: {backup.metadata.recordCounts.mediaFiles}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Upload className="h-4 w-4 mr-2" />
                          Restore
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Restore Backup</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <Alert>
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>
                              This will replace current data with the backup. This action cannot be undone.
                            </AlertDescription>
                          </Alert>

                          <div className="space-y-3">
                            <Label>What to restore:</Label>
                            
                            <div className="flex items-center justify-between">
                              <Label htmlFor="restore-portfolio">Portfolio Data</Label>
                              <Switch
                                id="restore-portfolio"
                                checked={restoreOptions.includePortfolioData}
                                onCheckedChange={(checked) => 
                                  setRestoreOptions(prev => ({ ...prev, includePortfolioData: checked }))
                                }
                              />
                            </div>

                            <div className="flex items-center justify-between">
                              <Label htmlFor="restore-modals">Dynamic Modals</Label>
                              <Switch
                                id="restore-modals"
                                checked={restoreOptions.includeDynamicModals}
                                onCheckedChange={(checked) => 
                                  setRestoreOptions(prev => ({ ...prev, includeDynamicModals: checked }))
                                }
                              />
                            </div>

                            <div className="flex items-center justify-between">
                              <Label htmlFor="restore-media">Media Files</Label>
                              <Switch
                                id="restore-media"
                                checked={restoreOptions.includeMediaFiles}
                                onCheckedChange={(checked) => 
                                  setRestoreOptions(prev => ({ ...prev, includeMediaFiles: checked }))
                                }
                              />
                            </div>

                            <div className="flex items-center justify-between">
                              <Label htmlFor="restore-settings">Admin Settings</Label>
                              <Switch
                                id="restore-settings"
                                checked={restoreOptions.includeAdminSettings}
                                onCheckedChange={(checked) => 
                                  setRestoreOptions(prev => ({ ...prev, includeAdminSettings: checked }))
                                }
                              />
                            </div>

                            <div className="flex items-center justify-between">
                              <Label htmlFor="backup-before-restore">Create backup before restore</Label>
                              <Switch
                                id="backup-before-restore"
                                checked={restoreOptions.createBackupBeforeRestore}
                                onCheckedChange={(checked) => 
                                  setRestoreOptions(prev => ({ ...prev, createBackupBeforeRestore: checked }))
                                }
                              />
                            </div>
                          </div>

                          <div className="flex justify-end gap-2">
                            <Button
                              onClick={() => restoreBackup(backup.id)}
                              disabled={restoring === backup.id}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              {restoring === backup.id ? (
                                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                              ) : (
                                <Upload className="h-4 w-4 mr-2" />
                              )}
                              Restore Backup
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteBackup(backup.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              
              {backups.length === 0 && !loading && (
                <div className="text-center py-8 text-gray-500">
                  <Database className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>No backups available</p>
                  <p className="text-sm">Create your first backup to get started</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}