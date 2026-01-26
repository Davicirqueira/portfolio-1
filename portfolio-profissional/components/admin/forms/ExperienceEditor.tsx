"use client"

import { useState, useEffect } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { AdminFormContainer, FormSection } from "@/components/admin/ui/AdminFormContainer"
import { FormField, Input, Textarea } from "@/components/admin/ui/FormField"
import { Button } from "@/components/ui/Button"
import { RichTextEditor } from "@/components/admin/ui/RichTextEditor"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"
import { usePortfolioData } from "@/lib/hooks/usePortfolioData"
import { Experience } from "@/lib/types/portfolio"
import { 
  Plus, 
  Briefcase, 
  Edit, 
  Trash2,
  GripVertical,
  Calendar,
  Building,
  User,
  Clock,
  CheckCircle,
  AlertCircle
} from "lucide-react"

// Schema de validação para experiências
const experienceSchema = z.object({
  experiences: z.array(z.object({
    id: z.string(),
    company: z.string().min(1, "Nome da empresa é obrigatório").max(100, "Nome muito longo"),
    position: z.string().min(1, "Cargo é obrigatório").max(100, "Cargo muito longo"),
    startDate: z.string().min(1, "Data de início é obrigatória"),
    endDate: z.string().optional(),
    period: z.string().min(1, "Período é obrigatório"),
    description: z.string().min(10, "Descrição deve ter pelo menos 10 caracteres").max(2000, "Descrição muito longa"),
  }))
})

type ExperienceFormData = z.infer<typeof experienceSchema>

export function ExperienceEditor() {
  const { portfolioData, isLoading, saveData, isDirty, setDirty } = usePortfolioData()
  const [isSaving, setIsSaving] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)

  const form = useForm<ExperienceFormData>({
    resolver: zodResolver(experienceSchema),
    defaultValues: {
      experiences: []
    },
  })

  const { control, register, handleSubmit, formState: { errors }, watch, setValue, reset } = form
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "experiences"
  })

  // Carrega os dados quando disponíveis
  useEffect(() => {
    if (portfolioData?.data?.experience) {
      const experiences = portfolioData.data.experience as Experience[]
      // Ordena por data de início (mais recente primeiro)
      const sortedExperiences = [...experiences].sort((a, b) => {
        return new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
      })
      reset({ experiences: sortedExperiences })
    }
  }, [portfolioData, reset])

  // Monitora mudanças no formulário
  useEffect(() => {
    const subscription = watch(() => {
      setDirty(true)
    })
    return () => subscription.unsubscribe()
  }, [watch, setDirty])

  const onSubmit = async (data: ExperienceFormData) => {
    setIsSaving(true)
    try {
      const updatedData = {
        ...portfolioData?.data,
        experience: data.experiences
      }

      const success = await saveData(updatedData)
      if (success) {
        setDirty(false)
        setShowForm(false)
        setEditingIndex(null)
      }
    } catch (error) {
      console.error("Erro ao salvar experiências:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    if (portfolioData?.data?.experience) {
      const experiences = portfolioData.data.experience as Experience[]
      const sortedExperiences = [...experiences].sort((a, b) => {
        return new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
      })
      reset({ experiences: sortedExperiences })
      setDirty(false)
      setShowForm(false)
      setEditingIndex(null)
    }
  }

  const handleAddExperience = () => {
    const newExperience: Experience = {
      id: `exp-${Date.now()}`,
      company: "",
      position: "",
      startDate: "",
      endDate: "",
      period: "",
      description: ""
    }
    append(newExperience)
    setEditingIndex(fields.length)
    setShowForm(true)
    setDirty(true)
  }

  const handleEditExperience = (index: number) => {
    setEditingIndex(index)
    setShowForm(true)
  }

  const handleDeleteExperience = (index: number) => {
    if (confirm('Tem certeza que deseja excluir esta experiência?')) {
      remove(index)
      setDirty(true)
      if (editingIndex === index) {
        setShowForm(false)
        setEditingIndex(null)
      }
    }
  }

  const handleDragEnd = (result: any) => {
    if (!result.destination) return

    const { source, destination } = result
    move(source.index, destination.index)
    setDirty(true)
  }

  // Função para calcular o período automaticamente
  const calculatePeriod = (startDate: string, endDate?: string) => {
    if (!startDate) return ""
    
    const start = new Date(startDate)
    const end = endDate ? new Date(endDate) : new Date()
    
    const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth())
    const years = Math.floor(months / 12)
    const remainingMonths = months % 12
    
    if (years === 0) {
      return `${remainingMonths} ${remainingMonths === 1 ? 'mês' : 'meses'}`
    } else if (remainingMonths === 0) {
      return `${years} ${years === 1 ? 'ano' : 'anos'}`
    } else {
      return `${years} ${years === 1 ? 'ano' : 'anos'} e ${remainingMonths} ${remainingMonths === 1 ? 'mês' : 'meses'}`
    }
  }

  // Função para validar datas
  const validateDates = (startDate: string, endDate?: string) => {
    if (!startDate) return { isValid: false, message: "Data de início é obrigatória" }
    
    const start = new Date(startDate)
    const today = new Date()
    
    if (start > today) {
      return { isValid: false, message: "Data de início não pode ser no futuro" }
    }
    
    if (endDate) {
      const end = new Date(endDate)
      if (end < start) {
        return { isValid: false, message: "Data de fim deve ser posterior à data de início" }
      }
      if (end > today) {
        return { isValid: false, message: "Data de fim não pode ser no futuro" }
      }
    }
    
    return { isValid: true, message: "" }
  }

  // Função para formatar data para exibição
  const formatDateForDisplay = (dateString: string) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR', { 
      year: 'numeric', 
      month: 'long' 
    })
  }

  return (
    <AdminFormContainer
      title="Experiência Profissional"
      description="Gerencie seu histórico de experiências profissionais em ordem cronológica"
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
          description="Resumo das suas experiências profissionais"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
              <div className="flex items-center space-x-2">
                <Briefcase className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Total de Experiências</p>
                  <p className="text-2xl font-bold text-primary">{fields.length}</p>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-green-100 rounded-lg border border-green-200">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm text-green-600">Anos de Experiência</p>
                  <p className="text-2xl font-bold text-green-700">
                    {fields.reduce((total, exp) => {
                      if (exp.startDate) {
                        const start = new Date(exp.startDate)
                        const end = exp.endDate ? new Date(exp.endDate) : new Date()
                        const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth())
                        return total + months
                      }
                      return total
                    }, 0) / 12 | 0}+
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-blue-100 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-2">
                <Building className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-blue-600">Empresas</p>
                  <p className="text-2xl font-bold text-blue-700">
                    {new Set(fields.map(exp => exp.company).filter(Boolean)).size}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-purple-100 rounded-lg border border-purple-200">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-sm text-purple-600">Experiência Atual</p>
                  <p className="text-2xl font-bold text-purple-700">
                    {fields.some(exp => !exp.endDate) ? '1' : '0'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </FormSection>

        {/* Lista de Experiências */}
        <FormSection
          title="Timeline de Experiências"
          description="Suas experiências profissionais em ordem cronológica (mais recente primeiro)"
        >
          <div className="flex justify-between items-center mb-6">
            <p className="text-sm text-muted-foreground">
              {fields.length} experiências encontradas
            </p>
            <Button onClick={handleAddExperience} className="flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>Nova Experiência</span>
            </Button>
          </div>

          {fields.length === 0 ? (
            <div className="text-center py-12 bg-muted/30 rounded-lg border border-border">
              <div className="flex flex-col items-center space-y-4">
                <Briefcase className="w-12 h-12 text-muted-foreground" />
                <div>
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    Nenhuma experiência encontrada
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Adicione sua primeira experiência profissional
                  </p>
                  <Button onClick={handleAddExperience} variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Experiência
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="experiences">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-4"
                  >
                    {fields.map((experience, index) => {
                      const dateValidation = validateDates(experience.startDate, experience.endDate)
                      const isEditing = editingIndex === index && showForm
                      
                      return (
                        <Draggable
                          key={experience.id}
                          draggableId={experience.id}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`bg-background border border-border rounded-lg p-6 transition-all duration-200 ${
                                snapshot.isDragging ? 'shadow-lg scale-105' : 'hover:shadow-md'
                              } ${isEditing ? 'ring-2 ring-primary' : ''}`}
                            >
                              {isEditing ? (
                                // Formulário de edição
                                <div className="space-y-6">
                                  <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold text-foreground">
                                      {experience.company ? `Editando: ${experience.company}` : 'Nova Experiência'}
                                    </h3>
                                    <div className="flex items-center space-x-2">
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                          setShowForm(false)
                                          setEditingIndex(null)
                                        }}
                                      >
                                        Cancelar
                                      </Button>
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField
                                      label="Empresa"
                                      error={errors.experiences?.[index]?.company?.message}
                                      required
                                    >
                                      <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                          <Building className="w-4 h-4 text-muted-foreground" />
                                        </div>
                                        <Input
                                          {...register(`experiences.${index}.company`)}
                                          placeholder="Nome da empresa"
                                          className="pl-10"
                                          error={!!errors.experiences?.[index]?.company}
                                        />
                                      </div>
                                    </FormField>

                                    <FormField
                                      label="Cargo"
                                      error={errors.experiences?.[index]?.position?.message}
                                      required
                                    >
                                      <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                          <User className="w-4 h-4 text-muted-foreground" />
                                        </div>
                                        <Input
                                          {...register(`experiences.${index}.position`)}
                                          placeholder="Seu cargo na empresa"
                                          className="pl-10"
                                          error={!!errors.experiences?.[index]?.position}
                                        />
                                      </div>
                                    </FormField>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField
                                      label="Data de Início"
                                      error={errors.experiences?.[index]?.startDate?.message}
                                      required
                                    >
                                      <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                          <Calendar className="w-4 h-4 text-muted-foreground" />
                                        </div>
                                        <Input
                                          {...register(`experiences.${index}.startDate`, {
                                            onChange: (e) => {
                                              const startDate = e.target.value
                                              const endDate = watch(`experiences.${index}.endDate`)
                                              const period = calculatePeriod(startDate, endDate)
                                              setValue(`experiences.${index}.period`, period)
                                            }
                                          })}
                                          type="date"
                                          className="pl-10"
                                          error={!!errors.experiences?.[index]?.startDate}
                                        />
                                      </div>
                                    </FormField>

                                    <FormField
                                      label="Data de Fim"
                                      description="Deixe em branco se ainda trabalha na empresa"
                                    >
                                      <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                          <Calendar className="w-4 h-4 text-muted-foreground" />
                                        </div>
                                        <Input
                                          {...register(`experiences.${index}.endDate`, {
                                            onChange: (e) => {
                                              const endDate = e.target.value
                                              const startDate = watch(`experiences.${index}.startDate`)
                                              const period = calculatePeriod(startDate, endDate)
                                              setValue(`experiences.${index}.period`, period)
                                            }
                                          })}
                                          type="date"
                                          className="pl-10"
                                        />
                                      </div>
                                    </FormField>
                                  </div>

                                  {!dateValidation.isValid && (
                                    <div className="flex items-center gap-2 text-sm text-red-400 bg-red-50 p-3 rounded-lg">
                                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                      <span>{dateValidation.message}</span>
                                    </div>
                                  )}

                                  <FormField
                                    label="Período"
                                    description="Calculado automaticamente com base nas datas"
                                  >
                                    <Input
                                      {...register(`experiences.${index}.period`)}
                                      placeholder="Ex: 2 anos e 3 meses"
                                      readOnly
                                      className="bg-muted"
                                    />
                                  </FormField>

                                  <FormField
                                    label="Descrição das Responsabilidades"
                                    error={errors.experiences?.[index]?.description?.message}
                                    required
                                    description="Descreva suas principais responsabilidades e conquistas nesta posição"
                                  >
                                    <RichTextEditor
                                      content={watch(`experiences.${index}.description`) || ""}
                                      onChange={(content) => setValue(`experiences.${index}.description`, content)}
                                      placeholder="Descreva suas responsabilidades, projetos e conquistas nesta posição..."
                                      minHeight="200px"
                                    />
                                  </FormField>
                                </div>
                              ) : (
                                // Visualização da experiência
                                <div className="flex items-start space-x-4">
                                  <div
                                    {...provided.dragHandleProps}
                                    className="cursor-grab hover:cursor-grabbing mt-1"
                                  >
                                    <GripVertical className="w-5 h-5 text-muted-foreground" />
                                  </div>
                                  
                                  <div className="flex-1">
                                    <div className="flex items-start justify-between mb-3">
                                      <div>
                                        <h3 className="text-lg font-semibold text-foreground">
                                          {experience.position}
                                        </h3>
                                        <p className="text-primary font-medium">
                                          {experience.company}
                                        </p>
                                        <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                                          <div className="flex items-center space-x-1">
                                            <Calendar className="w-4 h-4" />
                                            <span>
                                              {formatDateForDisplay(experience.startDate)} - {
                                                experience.endDate 
                                                  ? formatDateForDisplay(experience.endDate)
                                                  : 'Presente'
                                              }
                                            </span>
                                          </div>
                                          <div className="flex items-center space-x-1">
                                            <Clock className="w-4 h-4" />
                                            <span>{experience.period}</span>
                                          </div>
                                        </div>
                                      </div>
                                      
                                      <div className="flex items-center space-x-2">
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => handleEditExperience(index)}
                                        >
                                          <Edit className="w-4 h-4" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => handleDeleteExperience(index)}
                                          className="text-red-500 hover:text-red-600"
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </Button>
                                      </div>
                                    </div>
                                    
                                    {experience.description && (
                                      <div 
                                        className="text-sm text-muted-foreground prose prose-sm max-w-none"
                                        dangerouslySetInnerHTML={{ __html: experience.description }}
                                      />
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </Draggable>
                      )
                    })}
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