"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { AdminFormContainer, FormSection } from "@/components/admin/ui/AdminFormContainer"
import { FormField } from "@/components/admin/ui/FormField"
import { Button } from "@/components/ui/Button"
import { SkillCategoryManager } from "@/components/admin/skills/SkillCategoryManager"
import { SkillItemEditor } from "@/components/admin/skills/SkillItemEditor"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"
import { usePortfolioData } from "@/lib/hooks/usePortfolioData"
import { SkillCategory, SkillItem } from "@/lib/types/portfolio"
import { 
  Plus, 
  Code, 
  Edit, 
  Trash2,
  GripVertical,
  Star,
  Settings
} from "lucide-react"

// Schema de validação para habilidades
const skillsSchema = z.object({
  skillCategories: z.array(z.object({
    id: z.string(),
    name: z.string(),
    skills: z.array(z.object({
      name: z.string(),
      proficiency: z.number(),
      color: z.enum(["blue", "green", "purple", "orange", "red"]),
      description: z.string().optional()
    }))
  }))
})

type SkillsFormData = z.infer<typeof skillsSchema>

export function SkillsEditor() {
  const { portfolioData, isLoading, saveData, isDirty, setDirty } = usePortfolioData()
  const [isSaving, setIsSaving] = useState(false)
  const [skillCategories, setSkillCategories] = useState<SkillCategory[]>([])
  const [editingCategory, setEditingCategory] = useState<SkillCategory | null>(null)
  const [editingSkill, setEditingSkill] = useState<{ skill: SkillItem; categoryId: string } | null>(null)
  const [showCategoryEditor, setShowCategoryEditor] = useState(false)
  const [showSkillEditor, setShowSkillEditor] = useState(false)

  const form = useForm<SkillsFormData>({
    resolver: zodResolver(skillsSchema),
    defaultValues: {
      skillCategories: []
    },
  })

  const { handleSubmit, setValue, reset } = form

  // Carrega os dados quando disponíveis
  useEffect(() => {
    if (portfolioData?.data?.skillCategories) {
      const categories = portfolioData.data.skillCategories as SkillCategory[]
      setSkillCategories(categories)
      reset({ skillCategories: categories })
    }
  }, [portfolioData, reset])

  const onSubmit = async (data: SkillsFormData) => {
    setIsSaving(true)
    try {
      const updatedData = {
        ...portfolioData?.data,
        skillCategories: skillCategories
      }

      const success = await saveData(updatedData)
      if (success) {
        setDirty(false)
      }
    } catch (error) {
      console.error("Erro ao salvar habilidades:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    if (portfolioData?.data?.skillCategories) {
      const categories = portfolioData.data.skillCategories as SkillCategory[]
      setSkillCategories(categories)
      reset({ skillCategories: categories })
      setDirty(false)
    }
  }

  // Gerenciamento de categorias
  const handleCreateCategory = () => {
    setEditingCategory(null)
    setShowCategoryEditor(true)
  }

  const handleEditCategory = (category: SkillCategory) => {
    setEditingCategory(category)
    setShowCategoryEditor(true)
  }

  const handleSaveCategory = (categoryData: Omit<SkillCategory, 'id'>) => {
    if (editingCategory) {
      // Editar categoria existente
      const updatedCategories = skillCategories.map(cat =>
        cat.id === editingCategory.id
          ? { ...editingCategory, ...categoryData }
          : cat
      )
      setSkillCategories(updatedCategories)
    } else {
      // Criar nova categoria
      const newCategory: SkillCategory = {
        id: `category-${Date.now()}`,
        ...categoryData,
        skills: []
      }
      setSkillCategories([...skillCategories, newCategory])
    }
    
    setShowCategoryEditor(false)
    setEditingCategory(null)
    setDirty(true)
  }

  const handleDeleteCategory = (categoryId: string) => {
    if (confirm('Tem certeza que deseja excluir esta categoria? Todas as habilidades serão removidas.')) {
      const updatedCategories = skillCategories.filter(cat => cat.id !== categoryId)
      setSkillCategories(updatedCategories)
      setDirty(true)
    }
  }

  // Gerenciamento de habilidades
  const handleCreateSkill = (categoryId: string) => {
    setEditingSkill({ skill: {} as SkillItem, categoryId })
    setShowSkillEditor(true)
  }

  const handleEditSkill = (skill: SkillItem, categoryId: string) => {
    setEditingSkill({ skill, categoryId })
    setShowSkillEditor(true)
  }

  const handleSaveSkill = (skillData: SkillItem) => {
    if (!editingSkill) return

    const { categoryId } = editingSkill
    const updatedCategories = skillCategories.map(category => {
      if (category.id === categoryId) {
        if (editingSkill.skill.name) {
          // Editar habilidade existente
          const updatedSkills = category.skills.map(skill =>
            skill.name === editingSkill.skill.name ? skillData : skill
          )
          return { ...category, skills: updatedSkills }
        } else {
          // Criar nova habilidade
          return { ...category, skills: [...category.skills, skillData] }
        }
      }
      return category
    })

    setSkillCategories(updatedCategories)
    setShowSkillEditor(false)
    setEditingSkill(null)
    setDirty(true)
  }

  const handleDeleteSkill = (skillName: string, categoryId: string) => {
    if (confirm('Tem certeza que deseja excluir esta habilidade?')) {
      const updatedCategories = skillCategories.map(category => {
        if (category.id === categoryId) {
          const updatedSkills = category.skills.filter(skill => skill.name !== skillName)
          return { ...category, skills: updatedSkills }
        }
        return category
      })
      setSkillCategories(updatedCategories)
      setDirty(true)
    }
  }

  // Drag and Drop
  const handleDragEnd = (result: any) => {
    if (!result.destination) return

    const { source, destination, type } = result

    if (type === 'CATEGORY') {
      // Reordenar categorias
      const newCategories = Array.from(skillCategories)
      const [reorderedCategory] = newCategories.splice(source.index, 1)
      newCategories.splice(destination.index, 0, reorderedCategory)
      
      setSkillCategories(newCategories)
      setDirty(true)
    } else if (type === 'SKILL') {
      // Reordenar habilidades dentro de uma categoria
      const categoryId = source.droppableId
      const updatedCategories = skillCategories.map(category => {
        if (category.id === categoryId) {
          const newSkills = Array.from(category.skills)
          const [reorderedSkill] = newSkills.splice(source.index, 1)
          newSkills.splice(destination.index, 0, reorderedSkill)
          return { ...category, skills: newSkills }
        }
        return category
      })
      
      setSkillCategories(updatedCategories)
      setDirty(true)
    }
  }

  if (showCategoryEditor) {
    return (
      <SkillCategoryManager
        category={editingCategory}
        onSave={handleSaveCategory}
        onCancel={() => {
          setShowCategoryEditor(false)
          setEditingCategory(null)
        }}
      />
    )
  }

  if (showSkillEditor && editingSkill) {
    return (
      <SkillItemEditor
        skill={editingSkill.skill}
        categoryId={editingSkill.categoryId}
        onSave={handleSaveSkill}
        onCancel={() => {
          setShowSkillEditor(false)
          setEditingSkill(null)
        }}
      />
    )
  }

  return (
    <AdminFormContainer
      title="Gerenciamento de Habilidades"
      description="Organize suas habilidades técnicas por categorias com níveis de proficiência"
      isLoading={isLoading}
      isSaving={isSaving}
      isDirty={isDirty}
      onSave={handleSubmit(onSubmit)}
      onCancel={handleCancel}
      className="animate-fade-in-up"
    >
      <div className="space-y-8">
        {/* Header com estatísticas */}
        <FormSection
          title="Visão Geral"
          description="Estatísticas das suas habilidades organizadas por categoria"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
              <div className="flex items-center space-x-2">
                <Code className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Categorias</p>
                  <p className="text-2xl font-bold text-primary">{skillCategories.length}</p>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-green-100 rounded-lg border border-green-200">
              <div className="flex items-center space-x-2">
                <Star className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm text-green-600">Total de Habilidades</p>
                  <p className="text-2xl font-bold text-green-700">
                    {skillCategories.reduce((total, cat) => total + cat.skills.length, 0)}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-blue-100 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-2">
                <Settings className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-blue-600">Proficiência Média</p>
                  <p className="text-2xl font-bold text-blue-700">
                    {skillCategories.length > 0 ? Math.round(
                      skillCategories.reduce((total, cat) => 
                        total + cat.skills.reduce((sum, skill) => sum + skill.proficiency, 0), 0
                      ) / skillCategories.reduce((total, cat) => total + cat.skills.length, 0)
                    ) : 0}%
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-purple-100 rounded-lg border border-purple-200">
              <div className="flex items-center space-x-2">
                <Star className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-sm text-purple-600">Habilidades Avançadas</p>
                  <p className="text-2xl font-bold text-purple-700">
                    {skillCategories.reduce((total, cat) => 
                      total + cat.skills.filter(skill => skill.proficiency >= 80).length, 0
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </FormSection>

        {/* Gerenciamento de Categorias */}
        <FormSection
          title="Categorias de Habilidades"
          description="Organize suas habilidades em categorias. Use drag & drop para reordenar."
        >
          <div className="flex justify-between items-center mb-6">
            <p className="text-sm text-muted-foreground">
              {skillCategories.length} categorias encontradas
            </p>
            <Button onClick={handleCreateCategory} className="flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>Nova Categoria</span>
            </Button>
          </div>

          {skillCategories.length === 0 ? (
            <div className="text-center py-12 bg-muted/30 rounded-lg border border-border">
              <div className="flex flex-col items-center space-y-4">
                <Code className="w-12 h-12 text-muted-foreground" />
                <div>
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    Nenhuma categoria encontrada
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Crie sua primeira categoria de habilidades
                  </p>
                  <Button onClick={handleCreateCategory} variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Criar Categoria
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="categories" type="CATEGORY">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-4"
                  >
                    {skillCategories.map((category, index) => (
                      <Draggable
                        key={category.id}
                        draggableId={category.id}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`bg-background border border-border rounded-lg p-6 transition-shadow duration-200 ${
                              snapshot.isDragging ? 'shadow-lg' : 'hover:shadow-md'
                            }`}
                          >
                            {/* Header da Categoria */}
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center space-x-3">
                                <div
                                  {...provided.dragHandleProps}
                                  className="cursor-grab hover:cursor-grabbing"
                                >
                                  <GripVertical className="w-5 h-5 text-muted-foreground" />
                                </div>
                                <div>
                                  <h3 className="text-lg font-semibold text-foreground">
                                    {category.name}
                                  </h3>
                                  <p className="text-sm text-muted-foreground">
                                    {category.skills.length} habilidades
                                  </p>
                                </div>
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleCreateSkill(category.id)}
                                >
                                  <Plus className="w-4 h-4 mr-1" />
                                  Habilidade
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditCategory(category)}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteCategory(category.id)}
                                  className="text-red-500 hover:text-red-600"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>

                            {/* Lista de Habilidades */}
                            {category.skills.length > 0 ? (
                              <Droppable droppableId={category.id} type="SKILL">
                                {(provided) => (
                                  <div
                                    {...provided.droppableProps}
                                    ref={provided.innerRef}
                                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3"
                                  >
                                    {category.skills.map((skill, skillIndex) => (
                                      <Draggable
                                        key={skill.name}
                                        draggableId={`${category.id}-${skill.name}`}
                                        index={skillIndex}
                                      >
                                        {(provided, snapshot) => (
                                          <div
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            className={`p-3 bg-muted/50 rounded-lg border border-border transition-all duration-200 ${
                                              snapshot.isDragging ? 'shadow-md scale-105' : 'hover:bg-muted/70'
                                            }`}
                                          >
                                            <div className="flex items-center justify-between mb-2">
                                              <div className="flex items-center space-x-2">
                                                <div
                                                  {...provided.dragHandleProps}
                                                  className="cursor-grab hover:cursor-grabbing"
                                                >
                                                  <GripVertical className="w-3 h-3 text-muted-foreground" />
                                                </div>
                                                <span className="font-medium text-sm text-foreground">
                                                  {skill.name}
                                                </span>
                                              </div>
                                              
                                              <div className="flex items-center space-x-1">
                                                <Button
                                                  variant="ghost"
                                                  size="sm"
                                                  onClick={() => handleEditSkill(skill, category.id)}
                                                  className="h-6 w-6 p-0"
                                                >
                                                  <Edit className="w-3 h-3" />
                                                </Button>
                                                <Button
                                                  variant="ghost"
                                                  size="sm"
                                                  onClick={() => handleDeleteSkill(skill.name, category.id)}
                                                  className="h-6 w-6 p-0 text-red-500 hover:text-red-600"
                                                >
                                                  <Trash2 className="w-3 h-3" />
                                                </Button>
                                              </div>
                                            </div>
                                            
                                            <div className="space-y-2">
                                              <div className="flex items-center justify-between">
                                                <span className="text-xs text-muted-foreground">
                                                  Proficiência
                                                </span>
                                                <span className="text-xs font-medium text-foreground">
                                                  {skill.proficiency}%
                                                </span>
                                              </div>
                                              <div className="w-full bg-muted rounded-full h-1.5">
                                                <div 
                                                  className={`h-1.5 rounded-full transition-all duration-300 ${
                                                    skill.color === 'blue' ? 'bg-blue-500' :
                                                    skill.color === 'green' ? 'bg-green-500' :
                                                    skill.color === 'purple' ? 'bg-purple-500' :
                                                    skill.color === 'orange' ? 'bg-orange-500' :
                                                    'bg-red-500'
                                                  }`}
                                                  style={{ width: `${skill.proficiency}%` }}
                                                />
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
                            ) : (
                              <div className="text-center py-8 bg-muted/20 rounded-lg border border-dashed border-border">
                                <p className="text-sm text-muted-foreground mb-2">
                                  Nenhuma habilidade nesta categoria
                                </p>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleCreateSkill(category.id)}
                                >
                                  <Plus className="w-4 h-4 mr-1" />
                                  Adicionar Habilidade
                                </Button>
                              </div>
                            )}
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