"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Settings, 
  Save, 
  RotateCcw, 
  Clock, 
  Shield, 
  Image, 
  History,
  CheckCircle,
  AlertCircle
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface AdminSettings {
  autoSave: boolean
  autoSaveInterval: number
  requirePreview: boolean
  backupRetention: number
  allowedImageFormats: string[]
  maxImageSize: number
}

interface SettingsHistory {
  id: string
  autoSave: boolean
  autoSaveInterval: number
  requirePreview: boolean
  backupRetention: number
  allowedImageFormats: string[]
  maxImageSize: number
  createdAt: Date
}

export function AdminSettingsPanel() {
  const [settings, setSettings] = useState<AdminSettings | null>(null)
  const [history, setHistory] = useState<SettingsHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [resetting, setResetting] = useState(false)
  const { toast } = useToast()

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings')
      if (!response.ok) throw new Error('Failed to fetch settings')
      
      const data = await response.json()
      setSettings(data)
    } catch (error) {
      console.error('Failed to fetch settings:', error)
      toast({
        title: "Error",
        description: "Failed to load settings",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchHistory = async () => {
    try {
      const response = await fetch('/api/admin/settings/history')
      if (!response.ok) throw new Error('Failed to fetch history')
      
      const data = await response.json()
      setHistory(data)
    } catch (error) {
      console.error('Failed to fetch history:', error)
    }
  }

  useEffect(() => {
    fetchSettings()
    fetchHistory()
  }, [])

  const handleSave = async () => {
    if (!settings) return

    try {
      setSaving(true)
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save settings')
      }

      const updatedSettings = await response.json()
      setSettings(updatedSettings)
      
      toast({
        title: "Success",
        description: "Settings saved successfully"
      })
      
      // Refresh history
      fetchHistory()
    } catch (error) {
      console.error('Failed to save settings:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to save settings",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const handleReset = async () => {
    try {
      setResetting(true)
      const response = await fetch('/api/admin/settings', {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to reset settings')

      const defaultSettings = await response.json()
      setSettings(defaultSettings)
      
      toast({
        title: "Success",
        description: "Settings reset to defaults"
      })
      
      // Refresh history
      fetchHistory()
    } catch (error) {
      console.error('Failed to reset settings:', error)
      toast({
        title: "Error",
        description: "Failed to reset settings",
        variant: "destructive"
      })
    } finally {
      setResetting(false)
    }
  }

  const updateSetting = <K extends keyof AdminSettings>(
    key: K,
    value: AdminSettings[K]
  ) => {
    if (!settings) return
    setSettings({ ...settings, [key]: value })
  }

  const toggleImageFormat = (format: string) => {
    if (!settings) return
    
    const formats = settings.allowedImageFormats.includes(format)
      ? settings.allowedImageFormats.filter(f => f !== format)
      : [...settings.allowedImageFormats, format]
    
    updateSetting('allowedImageFormats', formats)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!settings) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load settings. Please try refreshing the page.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Settings className="h-6 w-6" />
          Admin Settings
        </h2>
        <div className="flex gap-2">
          <Button
            onClick={handleReset}
            variant="outline"
            disabled={resetting}
          >
            <RotateCcw className={`h-4 w-4 mr-2 ${resetting ? 'animate-spin' : ''}`} />
            Reset to Defaults
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
          >
            <Save className={`h-4 w-4 mr-2 ${saving ? 'animate-spin' : ''}`} />
            Save Settings
          </Button>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="media">Media</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Auto-Save Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="auto-save">Enable Auto-Save</Label>
                  <p className="text-sm text-gray-600">
                    Automatically save changes while editing
                  </p>
                </div>
                <Switch
                  id="auto-save"
                  checked={settings.autoSave}
                  onCheckedChange={(checked) => updateSetting('autoSave', checked)}
                />
              </div>

              {settings.autoSave && (
                <div>
                  <Label htmlFor="auto-save-interval">Auto-Save Interval (seconds)</Label>
                  <Input
                    id="auto-save-interval"
                    type="number"
                    min="10"
                    max="300"
                    value={settings.autoSaveInterval}
                    onChange={(e) => updateSetting('autoSaveInterval', parseInt(e.target.value))}
                    className="mt-1"
                  />
                  <p className="text-sm text-gray-600 mt-1">
                    How often to auto-save (10-300 seconds)
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Preview Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="require-preview">Require Preview</Label>
                  <p className="text-sm text-gray-600">
                    Require preview before publishing changes
                  </p>
                </div>
                <Switch
                  id="require-preview"
                  checked={settings.requirePreview}
                  onCheckedChange={(checked) => updateSetting('requirePreview', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Backup Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="backup-retention">Backup Retention (days)</Label>
                <Input
                  id="backup-retention"
                  type="number"
                  min="1"
                  max="365"
                  value={settings.backupRetention}
                  onChange={(e) => updateSetting('backupRetention', parseInt(e.target.value))}
                  className="mt-1"
                />
                <p className="text-sm text-gray-600 mt-1">
                  How long to keep backup files (1-365 days)
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="media" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="h-5 w-5" />
                Image Upload Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="max-image-size">Maximum Image Size (MB)</Label>
                <Input
                  id="max-image-size"
                  type="number"
                  min="1"
                  max="50"
                  value={settings.maxImageSize}
                  onChange={(e) => updateSetting('maxImageSize', parseInt(e.target.value))}
                  className="mt-1"
                />
                <p className="text-sm text-gray-600 mt-1">
                  Maximum file size for image uploads (1-50 MB)
                </p>
              </div>

              <div>
                <Label>Allowed Image Formats</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {['jpg', 'jpeg', 'png', 'webp', 'gif'].map((format) => (
                    <Badge
                      key={format}
                      variant={settings.allowedImageFormats.includes(format) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleImageFormat(format)}
                    >
                      {format.toUpperCase()}
                      {settings.allowedImageFormats.includes(format) && (
                        <CheckCircle className="h-3 w-3 ml-1" />
                      )}
                    </Badge>
                  ))}
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Click to toggle allowed image formats
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Settings History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {history.map((item, index) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <div className="font-medium text-sm">
                        Settings Update #{history.length - index}
                      </div>
                      <div className="text-xs text-gray-600">
                        {new Date(item.createdAt).toLocaleString()}
                      </div>
                    </div>
                    <div className="text-right text-xs text-gray-600">
                      <div>Auto-save: {item.autoSave ? 'On' : 'Off'}</div>
                      <div>Max size: {item.maxImageSize}MB</div>
                    </div>
                  </div>
                ))}
                
                {history.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <History className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p>No settings history available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}