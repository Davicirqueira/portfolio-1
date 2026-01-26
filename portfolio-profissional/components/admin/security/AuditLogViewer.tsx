"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { RefreshCw, Search, Filter } from "lucide-react"

interface AuditLog {
  id: string
  userId: string
  action: string
  section: string
  oldData?: any
  newData?: any
  timestamp: Date
  ipAddress: string
  userAgent: string
  user: {
    id: string
    name: string
    email: string
  }
}

interface AuditStats {
  totalLogs: number
  actionStats: Array<{ action: string; count: number }>
  sectionStats: Array<{ section: string; count: number }>
}

export function AuditLogViewer() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [stats, setStats] = useState<AuditStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    section: '',
    action: '',
    search: ''
  })
  const [pagination, setPagination] = useState({
    limit: 50,
    offset: 0,
    hasMore: false
  })

  const fetchAuditLogs = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        limit: pagination.limit.toString(),
        offset: pagination.offset.toString(),
        ...(filters.section && { section: filters.section }),
        ...(filters.action && { action: filters.action })
      })

      const response = await fetch(`/api/admin/audit?${params}`)
      if (!response.ok) throw new Error('Failed to fetch audit logs')

      const data = await response.json()
      setLogs(data.logs)
      setStats(data.stats)
      setPagination(prev => ({ ...prev, hasMore: data.pagination.hasMore }))
    } catch (error) {
      console.error('Failed to fetch audit logs:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAuditLogs()
  }, [filters.section, filters.action, pagination.limit, pagination.offset])

  const filteredLogs = logs.filter(log => {
    if (!filters.search) return true
    const searchTerm = filters.search.toLowerCase()
    return (
      log.user.name.toLowerCase().includes(searchTerm) ||
      log.user.email.toLowerCase().includes(searchTerm) ||
      log.section.toLowerCase().includes(searchTerm) ||
      log.action.toLowerCase().includes(searchTerm)
    )
  })

  const getActionColor = (action: string) => {
    switch (action) {
      case 'create': return 'bg-green-100 text-green-800'
      case 'update': return 'bg-blue-100 text-blue-800'
      case 'delete': return 'bg-red-100 text-red-800'
      case 'login': return 'bg-purple-100 text-purple-800'
      case 'logout': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatTimestamp = (timestamp: Date) => {
    return new Date(timestamp).toLocaleString()
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalLogs}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Top Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {stats.actionStats.slice(0, 3).map(stat => (
                  <div key={stat.action} className="flex justify-between text-sm">
                    <span className="capitalize">{stat.action}</span>
                    <span className="font-medium">{stat.count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Top Sections</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {stats.sectionStats.slice(0, 3).map(stat => (
                  <div key={stat.section} className="flex justify-between text-sm">
                    <span className="capitalize">{stat.section}</span>
                    <span className="font-medium">{stat.count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Audit Logs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="flex-1">
              <Input
                placeholder="Search logs..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="w-full"
              />
            </div>
            
            <Select
              value={filters.section}
              onValueChange={(value) => setFilters(prev => ({ ...prev, section: value }))}
            >
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by section" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All sections</SelectItem>
                <SelectItem value="auth">Authentication</SelectItem>
                <SelectItem value="home">Home</SelectItem>
                <SelectItem value="about">About</SelectItem>
                <SelectItem value="skills">Skills</SelectItem>
                <SelectItem value="projects">Projects</SelectItem>
                <SelectItem value="backup">Backup</SelectItem>
                <SelectItem value="admin_settings">Settings</SelectItem>
              </SelectContent>
            </Select>
            
            <Select
              value={filters.action}
              onValueChange={(value) => setFilters(prev => ({ ...prev, action: value }))}
            >
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All actions</SelectItem>
                <SelectItem value="create">Create</SelectItem>
                <SelectItem value="update">Update</SelectItem>
                <SelectItem value="delete">Delete</SelectItem>
                <SelectItem value="login">Login</SelectItem>
                <SelectItem value="logout">Logout</SelectItem>
              </SelectContent>
            </Select>
            
            <Button onClick={fetchAuditLogs} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>

          {/* Logs List */}
          <ScrollArea className="h-96">
            <div className="space-y-2">
              {filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={getActionColor(log.action)}>
                        {log.action}
                      </Badge>
                      <span className="text-sm font-medium">{log.section}</span>
                      <span className="text-xs text-gray-500">
                        by {log.user.name}
                      </span>
                    </div>
                    <div className="text-xs text-gray-600">
                      {formatTimestamp(log.timestamp)} • {log.ipAddress}
                    </div>
                  </div>
                  
                  {(log.oldData || log.newData) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        // Show details modal
                        console.log('Log details:', log)
                      }}
                    >
                      Details
                    </Button>
                  )}
                </div>
              ))}
              
              {filteredLogs.length === 0 && !loading && (
                <div className="text-center py-8 text-gray-500">
                  No audit logs found
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-4">
            <Button
              variant="outline"
              disabled={pagination.offset === 0}
              onClick={() => setPagination(prev => ({ 
                ...prev, 
                offset: Math.max(0, prev.offset - prev.limit) 
              }))}
            >
              Previous
            </Button>
            
            <span className="text-sm text-gray-600">
              Showing {pagination.offset + 1} - {pagination.offset + filteredLogs.length}
            </span>
            
            <Button
              variant="outline"
              disabled={!pagination.hasMore}
              onClick={() => setPagination(prev => ({ 
                ...prev, 
                offset: prev.offset + prev.limit 
              }))}
            >
              Next
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}