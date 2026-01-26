"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { AdminFormContainer, FormSection } from "@/components/admin/ui/AdminFormContainer"
import { FormField } from "@/components/admin/ui/FormField"
import { Button } from "@/components/ui/Button"
import { ProjectModalEditor } from "@/components/admin/modals/ProjectModalEditor"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"
import { usePortfolioData } from "@/lib/hooks/usePortfolioData"
import { useModalManager } from "@/lib/hooks/useModalManager"
import { Project } from "@/lib/types/portfolio"
import { 
  Plus, 
  FolderOpen, 
  Edit, 
  Trash2,
  GripVertical,
  Star,
  Calendar,
  ExternalLink,
  Github,
  Globe,
  Eye,
  EyeOff,
  Filter,
  Search
} from "lucide-react"

// Schema de validação para projetos
const projectsSchema = z.object({
  projects: z.array(z.object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    longDescription: z.string().optional(),
    technologies: z.array(z.string()),
    githubUrl: z.string().optional(),
    demoUrl: z.string().optional(),
    imageUrl: z.string().optional(),
    featured: z.boolean(),
    category: z.string(),
    completedAt: z.string(),
  }))
})

type ProjectsFormData = z.infer<typeof projectsSchema>

interface ExtendedProject extends Project {
  status?: 'completed' | 'in-progress' | 'planned' | 'archived'
  methodologies?: string[]
  achievements?: string[]
  challenges?: string[]
  teamSize?: number
  role?: string
  projectUrl?: string
  isActive?: boolean
}

export function ProjectsEditor() {
  const { portfolioData, isLoading, saveData, isDirty, setDirty } = usePortfolioData()
  const { modals, createModal, updateModal, deleteModal } = useModalManager('project')
  const [isSaving, setIsSaving] = useState(false)
  const [projects, setProjects] = useState<ExtendedProject[]>([])
  const [editingProject, setEditingProject] = useState<ExtendedProject | null>(null)
  const [showProjectModal, setShowProjectModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")

  const form = useForm<ProjectsFormData>({
    resolver: zodResolver(projectsSchema),
    defaultValues: {
      projects: []
    },
  })

  const { handleSubmit, setValue, reset } = form

  // Carrega os dados quando disponíveis
  useEffect(() => {
    if (portfolioData?.data?.projects) {
      const projectsData = portfolioData.data.projects as ExtendedProject[]
      setProjects(projectsData)
      reset({ projects: projectsData })
    }
  }, [portfolioData, reset])

  const onSubmit = async (data: ProjectsFormData) => {
    setIsSaving(true)
    try {
      const updatedData = {
        ...portfolioData?.data,
        projects: projects
      }

      const success = await saveData(updatedData)
      if (success) {
        setDirty(false)
      }
    } catch (error) {
      console.error("Erro ao salvar projetos:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    if (portfolioData?.data?.projects) {
      const projectsData = portfolioData.data.projects as ExtendedProject[]
      setProjects(projectsData)
      reset({ projects: projectsData })
      setDirty(false)
    }
  }

  // Gerenciamento de projetos
  const handleCreateProject = () => {
    setEditingProject(null)
    setShowProjectModal(true)
  }

  const handleEditProject = (project: ExtendedProject) => {
    setEditingProject(project)
    setShowProjectModal(true)
  }

  const handleSaveProject = async (projectData: any) => {
    try {
      if (editingProject) {
        // Editar projeto existente
        const updatedProjects = projects.map(proj =>
          proj.id === editingProject.id
            ? { ...proj, ...projectData, id: editingProject.id }
            : proj
        )
        setProjects(updatedProjects)

        // Atualizar modal associado se existir
        const associatedModal = modals.find(modal => 
          modal.type === 'project' && modal.title === editingProject.title
        )
        if (associatedModal) {
          await updateModal({
            id: associatedModal.id,
            title: projectData.title,
            content: projectData
          })
        }
      } else {
        // Criar novo projeto
        const newProject: ExtendedProject = {
          id: `project-${Date.now()}`,
          ...projectData,
          completedAt: projectData.endDate || new Date().toISOString().split('T')[0]
        }
        setProjects([...projects, newProject])

        // Criar modal associado
        await createModal({
          type: 'project',
          title: projectData.title,
          content: projectData
        })
      }
      
      setShowProjectModal(false)
      setEditingProject(null)
      setDirty(true)
    } catch (error) {
      console.error("Erro ao salvar projeto:", error)
    }
  }

  const handleDeleteProject = async (projectId: string) => {
    if (confirm('Tem certeza que deseja excluir este projeto? Esta ação não pode ser desfeita.')) {
      const projectToDelete = projects.find(p => p.id === projectId)
      if (projectToDelete) {
        // Remover modal associado
        const associatedModal = modals.find(modal => 
          modal.type === 'project' && modal.title === projectToDelete.title
        )
        if (associatedModal) {
          await deleteModal(associatedModal.id)
        }
      }

      const updatedProjects = projects.filter(proj => proj.id !== projectId)
      setProjects(updatedProjects)
      setDirty(true)
    }
  }

  const handleToggleFeatured = (projectId: string) => {
    const updatedProjects = projects.map(proj =>
      proj.id === projectId
        ? { ...proj, featured: !proj.featured }
        : proj
    )
    setProjects(updatedProjects)
    setDirty(true)
  }

  const handleToggleActive = (projectId: string) => {
    const updatedProjects = projects.map(proj =>
      proj.id === projectId
        ? { ...proj, isActive: !proj.isActive }
        : proj
    )
    setProjects(updatedProjects)
    setDirty(true)
  }

  // Drag and Drop
  const handleDragEnd = (result: any) => {
    if (!result.destination) return

    const newProjects = Array.from(projects)
    const [reorderedProject] = newProjects.splice(result.source.index, 1)
    newProjects.splice(result.destination.index, 0, reorderedProject)
    
    setProjects(newProjects)
    setDirty(true)
  }

  // Filtros
  const categories = Array.from(new Set(projects.map(p => p.category).filter(Boolean)))
  const statuses = ['completed', 'in-progress', 'planned', 'archived']

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.technologies.some(tech => tech.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesCategory = filterCategory === 'all' || project.category === filterCategory
    const matchesStatus = filterStatus === 'all' || project.status === filterStatus

    return matchesSearch && matchesCategory && matchesStatus
  })

  // Estatísticas
  const stats = {
    total: projects.length,
    featured: projects.filter(p => p.featured).length,
    completed: projects.filter(p => p.status === 'completed' || !p.status).length,
    inProgress: projects.filter(p => p.status === 'in-progress').length,
    active: projects.filter(p => p.isActive !== false).length
  }

  if (showProjectModal) {
    const modalData = editingProject ? {
      id: editingProject.id,
      title: editingProject.title,
      type: 'project',
      content: editingProject,
      isActive: editingProject.isActive ?? true
    } : null

    return (
      <ProjectModalEditor
        modal={modalData}
        onSave={handleSaveProject}
        onCancel={() => {
          setShowProjectModal(false)
          setEditingProject(null)
        }}
      />
    )
  }

  return (
    <AdminFormContainer
      title="Gerenciamento de Projetos"
      description="Gerencie seus projetos profissionais com detalhes completos e modais interativos"
      isLoading={isLoading}
      isSaving={isSaving}
      isDirty={isDirty}
      onSave={handleSubmit(onSubmit)}
      onCancel={handleCancel}
      className="animate-fade-in-up"
    >
      <div className="space-y-8">
        {/* Estatísticas */}
        <FormSection
          title="Visão Geral"
          description="Estatísticas dos seus projetos organizados por categoria e status"
        >
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
              <div className="flex items-center space-x-2">
                <FolderOpen className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold text-primary">{stats.total}</p>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-yellow-100 rounded-lg border border-yellow-200">
              <div className="flex items-center space-x-2">
                <Star className="w-5 h-5 text-yellow-600" />
                <div>
                  <p className="text-sm text-yellow-600">Em Destaque</p>
                  <p className="text-2xl font-bold text-yellow-700">{stats.featured}</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-green-100 rounded-lg border border-green-200">
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm text-green-600">Concluídos</p>
                  <p className="text-2xl font-bold text-green-700">{stats.completed}</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-blue-100 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-blue-600">Em Andamento</p>
                  <p className="text-2xl font-bold text-blue-700">{stats.inProgress}</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-purple-100 rounded-lg border border-purple-200">
              <div className="flex items-center space-x-2">
                <Eye className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-sm text-purple-600">Ativos</p>
                  <p className="text-2xl font-bold text-purple-700">{stats.active}</p>
                </div>
              </div>
            </div>
          </div>
        </FormSection>

        {/* Filtros e Busca */}
        <FormSection
          title="Filtros e Busca"
          description="Filtre e pesquise seus projetos"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <FormField label="Buscar">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="w-4 h-4 text-muted-foreground" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                  placeholder="Buscar por título, descrição ou tecnologia..."
                />
              </div>
            </FormField>

            <FormField label="Categoria">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Filter className="w-4 h-4 text-muted-foreground" />
                </div>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                >
                  <option value="all">Todas as categorias</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </FormField>

            <FormField label="Status">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
              >
                <option value="all">Todos os status</option>
                <option value="completed">Concluído</option>
                <option value="in-progress">Em Andamento</option>
                <option value="planned">Planejado</option>
                <option value="archived">Arquivado</option>
              </select>
            </FormField>

            <div className="flex items-end">
              <Button onClick={handleCreateProject} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Novo Projeto
              </Button>
            </div>
          </div>
        </FormSection>

        {/* Lista de Projetos */}
        <FormSection
          title="Projetos"
          description="Gerencie seus projetos. Use drag & drop para reordenar."
        >
          <div className="flex justify-between items-center mb-6">
            <p className="text-sm text-muted-foreground">
              {filteredProjects.length} de {projects.length} projetos
            </p>
          </div>

          {filteredProjects.length === 0 ? (
            <div className="text-center py-12 bg-muted/30 rounded-lg border border-border">
              <div className="flex flex-col items-center space-y-4">
                <FolderOpen className="w-12 h-12 text-muted-foreground" />
                <div>
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    {projects.length === 0 ? "Nenhum projeto encontrado" : "Nenhum projeto corresponde aos filtros"}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {projects.length === 0 
                      ? "Crie seu primeiro projeto profissional" 
                      : "Tente ajustar os filtros ou criar um novo projeto"
                    }
                  </p>
                  <Button onClick={handleCreateProject} variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Criar Projeto
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="projects">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-4"
                  >
                    {filteredProjects.map((project, index) => (
                      <Draggable
                        key={project.id}
                        draggableId={project.id}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`bg-background border border-border rounded-lg p-6 transition-all duration-200 ${
                              snapshot.isDragging ? 'shadow-lg scale-105' : 'hover:shadow-md'
                            } ${project.isActive === false ? 'opacity-60' : ''}`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-start space-x-4 flex-1">
                                <div
                                  {...provided.dragHandleProps}
                                  className="cursor-grab hover:cursor-grabbing mt-1"
                                >
                                  <GripVertical className="w-5 h-5 text-muted-foreground" />
                                </div>

                                {/* Imagem do projeto */}
                                {project.imageUrl && (
                                  <div className="flex-shrink-0">
                                    <img
                                      src={project.imageUrl}
                                      alt={project.title}
                                      className="w-20 h-20 object-cover rounded-lg border border-border"
                                    />
                                  </div>
                                )}

                                {/* Informações do projeto */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center space-x-2 mb-2">
                                    <h3 className="text-lg font-semibold text-foreground truncate">
                                      {project.title}
                                    </h3>
                                    {project.featured && (
                                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                    )}
                                    {project.isActive === false && (
                                      <EyeOff className="w-4 h-4 text-muted-foreground" />
                                    )}
                                  </div>
                                  
                                  <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-2">
                                    <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs">
                                      {project.category}
                                    </span>
                                    {project.status && (
                                      <span className={`px-2 py-1 rounded-full text-xs ${
                                        project.status === 'completed' ? 'bg-green-100 text-green-700' :
                                        project.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                                        project.status === 'planned' ? 'bg-yellow-100 text-yellow-700' :
                                        'bg-gray-100 text-gray-700'
                                      }`}>
                                        {project.status === 'completed' ? 'Concluído' :
                                         project.status === 'in-progress' ? 'Em Andamento' :
                                         project.status === 'planned' ? 'Planejado' : 'Arquivado'}
                                      </span>
                                    )}
                                    <span className="flex items-center">
                                      <Calendar className="w-3 h-3 mr-1" />
                                      {new Date(project.completedAt).toLocaleDateString('pt-BR')}
                                    </span>
                                  </div>
                                  
                                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                                    {project.description}
                                  </p>
                                  
                                  {/* Tecnologias */}
                                  <div className="flex flex-wrap gap-1 mb-3">
                                    {project.technologies.slice(0, 5).map((tech, techIndex) => (
                                      <span
                                        key={techIndex}
                                        className="px-2 py-1 bg-muted text-muted-foreground rounded text-xs"
                                      >
                                        {tech}
                                      </span>
                                    ))}
                                    {project.technologies.length > 5 && (
                                      <span className="px-2 py-1 bg-muted text-muted-foreground rounded text-xs">
                                        +{project.technologies.length - 5}
                                      </span>
                                    )}
                                  </div>
                                  
                                  {/* Links */}
                                  <div className="flex items-center space-x-3">
                                    {project.githubUrl && (
                                      <a
                                        href={project.githubUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center text-xs text-muted-foreground hover:text-foreground transition-colors"
                                      >
                                        <Github className="w-3 h-3 mr-1" />
                                        GitHub
                                      </a>
                                    )}
                                    {project.demoUrl && (
                                      <a
                                        href={project.demoUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center text-xs text-muted-foreground hover:text-foreground transition-colors"
                                      >
                                        <Globe className="w-3 h-3 mr-1" />
                                        Demo
                                      </a>
                                    )}
                                    {(project as any).projectUrl && (
                                      <a
                                        href={(project as any).projectUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center text-xs text-muted-foreground hover:text-foreground transition-colors"
                                      >
                                        <ExternalLink className="w-3 h-3 mr-1" />
                                        Site
                                      </a>
                                    )}
                                  </div>
                                </div>
                              </div>
                              
                              {/* Ações */}
                              <div className="flex items-center space-x-2 ml-4">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleToggleFeatured(project.id)}
                                  className={project.featured ? "text-yellow-500" : "text-muted-foreground"}
                                >
                                  <Star className={`w-4 h-4 ${project.featured ? 'fill-current' : ''}`} />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleToggleActive(project.id)}
                                  className={project.isActive === false ? "text-muted-foreground" : "text-foreground"}
                                >
                                  {project.isActive === false ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditProject(project)}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteProject(project.id)}
                                  className="text-red-500 hover:text-red-600"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          )}
        </FormSection>
      </div>
    </AdminFormContainer>
  )
}