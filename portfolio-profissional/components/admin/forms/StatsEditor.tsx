"use client"

import { useState, useEffect } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { AdminFormContainer, FormSection } from "@/components/admin/ui/AdminFormContainer"
import { FormField } from "@/components/admin/ui/FormField"
import { Button } from "@/components/ui/Button"
import { usePortfolioData } from "@/lib/hooks/usePortfolioData"
import { Statistic } from "@/lib/types/portfolio"
import { Plus, Trash2, GripVertical, BarChart3, Hash, Type, Info } from "lucide-react"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"

// Schema de validação para estatísticas
const statisticSchema = z.object({
  id: z.string().min(1, "ID é obrigatório"),
  label: z.string().min(1, "Rótulo é obrigatório").max(100, "Rótulo muito longo"),
  value: z.number().min(0, "Valor deve ser positivo").max(999999, "Valor muito alto"),
  suffix: z.string().max(10, "Sufixo muito longo").optional(),
  prefix: z.string().max(10, "Prefixo muito longo").optional(),
  decimals: z.number().min(0).max(3).optional(),
  description: z.string().max(200, "Descrição muito longa").optional(),
  order: z.number().min(0),
})

const statsSchema = z.object({
  statistics: z.array(statisticSchema),
})

type StatsFormData = z.infer<typeof statsSchema>

export function StatsEditor() {
  const { portfolioData, isLoading, saveData, isDirty, setDirty } = usePortfolioData()
  const [isSaving, setIsSaving] = useState(false)

  const form = useForm<StatsFormData>({
    resolver: zodResolver(statsSchema),
    defaultValues: {
      statistics: [],
    },
  })

  const { control, register, handleSubmit, formState: { errors }, watch, reset } = form
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "statistics",
  })

  // Carrega os dados quando disponíveis
  useEffect(() => {
    if (portfolioData?.data?.statistics) {
      const statistics = portfolioData.data.statistics as Statistic[]
      reset({
        statistics: statistics.sort((a, b) => a.order - b.order),
      })
    }
  }, [portfolioData, reset])

  // Monitora mudanças no formulário
  useEffect(() => {
    const subscription = watch(() => {
      setDirty(true)
    })
    return () => subscription.unsubscribe()
  }, [watch, setDirty])

  const onSubmit = async (data: StatsFormData) => {
    setIsSaving(true)
    try {
      const updatedData = {
        ...portfolioData?.data,
        statistics: data.statistics,
      }

      const success = await saveData(updatedData)
      if (success) {
        setDirty(false)
      }
    } catch (error) {
      console.error("Erro ao salvar estatísticas:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    if (portfolioData?.data?.statistics) {
      const statistics = portfolioData.data.statistics as Statistic[]
      reset({
        statistics: statistics.sort((a, b) => a.order - b.order),
      })
      setDirty(false)
    }
  }

  const addStatistic = () => {
    const newOrder = fields.length
    const newId = `stat-${Date.now()}`
    append({
      id: newId,
      label: "",
      value: 0,
      suffix: "",
      prefix: "",
      decimals: 0,
      description: "",
      order: newOrder,
    })
    setDirty(true)
  }

  const removeStatistic = (index: number) => {
    remove(index)
    setDirty(true)
  }

  const handleDragEnd = (result: any) => {
    if (!result.destination) return

    const sourceIndex = result.source.index
    const destinationIndex = result.destination.index

    if (sourceIndex !== destinationIndex) {
      move(sourceIndex, destinationIndex)
      setDirty(true)
    }
  }

  const generateId = (label: string) => {
    return label
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 50)
  }

  return (
    <AdminFormContainer
      title="Estatísticas e Números"
      description="Configure os indicadores quantitativos que aparecerão na seção de estatísticas do seu portfólio"
      isLoading={isLoading}
      isSaving={isSaving}
      isDirty={isDirty}
      onSave={handleSubmit(onSubmit)}
      onCancel={handleCancel}
      className="animate-fade-in-up"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <FormSection
          title="Gerenciar Estatísticas"
          description="Adicione, edite e organize as estatísticas que representam seus números profissionais"
        >
          <div className="space-y-6">
            {fields.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-border rounded-lg">
                <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  Nenhuma estatística adicionada ainda
                </p>
                <Button type="button" onClick={addStatistic} variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Primeira Estatística
                </Button>
              </div>
            ) : (
              <>
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="statistics">
                    {(provided) => (
                      <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                        {fields.map((field, index) => (
                          <Draggable key={field.id} draggableId={field.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className={`bg-card border border-border rounded-lg p-6 transition-all duration-200 ${
                                  snapshot.isDragging ? 'shadow-lg scale-105' : 'shadow-sm'
                                }`}
                              >
                                <div className="flex items-start justify-between mb-4">
                                  <div className="flex items-center space-x-2">
                                    <div
                                      {...provided.dragHandleProps}
                                      className="cursor-grab hover:cursor-grabbing p-1 rounded hover:bg-muted transition-colors"
                                    >
                                      <GripVertical className="w-4 h-4 text-muted-foreground" />
                                    </div>
                                    <h4 className="font-medium text-foreground">
                                      Estatística {index + 1}
                                    </h4>
                                  </div>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeStatistic(index)}
                                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <FormField
                                    label="Rótulo"
                                    error={errors.statistics?.[index]?.label?.message}
                                    required
                                  >
                                    <div className="relative">
                                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Type className="w-4 h-4 text-muted-foreground" />
                                      </div>
                                      <input
                                        {...register(`statistics.${index}.label`)}
                                        type="text"
                                        className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                                        placeholder="Ex: Projetos Concluídos"
                                        onChange={(e) => {
                                          const value = e.target.value
                                          register(`statistics.${index}.label`).onChange(e)
                                          // Auto-generate ID based on label
                                          const generatedId = generateId(value)
                                          register(`statistics.${index}.id`).onChange({
                                            target: { value: generatedId }
                                          })
                                        }}
                                      />
                                    </div>
                                  </FormField>

                                  <FormField
                                    label="Valor"
                                    error={errors.statistics?.[index]?.value?.message}
                                    required
                                  >
                                    <div className="relative">
                                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Hash className="w-4 h-4 text-muted-foreground" />
                                      </div>
                                      <input
                                        {...register(`statistics.${index}.value`, {
                                          valueAsNumber: true,
                                        })}
                                        type="number"
                                        min="0"
                                        max="999999"
                                        className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                                        placeholder="0"
                                      />
                                    </div>
                                  </FormField>

                                  <FormField
                                    label="Prefixo"
                                    error={errors.statistics?.[index]?.prefix?.message}
                                    description="Texto antes do número (ex: R$, +)"
                                  >
                                    <input
                                      {...register(`statistics.${index}.prefix`)}
                                      type="text"
                                      maxLength={10}
                                      className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                                      placeholder="Ex: R$"
                                    />
                                  </FormField>

                                  <FormField
                                    label="Sufixo"
                                    error={errors.statistics?.[index]?.suffix?.message}
                                    description="Texto após o número (ex: %, +, k)"
                                  >
                                    <input
                                      {...register(`statistics.${index}.suffix`)}
                                      type="text"
                                      maxLength={10}
                                      className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                                      placeholder="Ex: %"
                                    />
                                  </FormField>

                                  <FormField
                                    label="Casas Decimais"
                                    error={errors.statistics?.[index]?.decimals?.message}
                                    description="Número de casas decimais a exibir"
                                  >
                                    <select
                                      {...register(`statistics.${index}.decimals`, {
                                        valueAsNumber: true,
                                      })}
                                      className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                                    >
                                      <option value={0}>0 (inteiro)</option>
                                      <option value={1}>1 casa decimal</option>
                                      <option value={2}>2 casas decimais</option>
                                      <option value={3}>3 casas decimais</option>
                                    </select>
                                  </FormField>
                                </div>

                                <FormField
                                  label="Descrição"
                                  error={errors.statistics?.[index]?.description?.message}
                                  description="Descrição opcional para contexto adicional"
                                >
                                  <div className="relative">
                                    <div className="absolute top-3 left-3 pointer-events-none">
                                      <Info className="w-4 h-4 text-muted-foreground" />
                                    </div>
                                    <textarea
                                      {...register(`statistics.${index}.description`)}
                                      rows={2}
                                      maxLength={200}
                                      className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-colors resize-none"
                                      placeholder="Descrição opcional da estatística..."
                                    />
                                  </div>
                                </FormField>

                                {/* Hidden fields */}
                                <input
                                  {...register(`statistics.${index}.id`)}
                                  type="hidden"
                                />
                                <input
                                  {...register(`statistics.${index}.order`, {
                                    valueAsNumber: true,
                                  })}
                                  type="hidden"
                                  value={index}
                                />
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>

                <div className="flex justify-center pt-4">
                  <Button type="button" onClick={addStatistic} variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Estatística
                  </Button>
                </div>
              </>
            )}
          </div>
        </FormSection>

        {/* Preview Section */}
        {fields.length > 0 && (
          <FormSection
            title="Visualização"
            description="Prévia de como as estatísticas aparecerão no portfólio"
          >
            <div className="bg-muted/30 rounded-lg p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {fields.map((field, index) => {
                  const watchedField = watch(`statistics.${index}`)
                  const displayValue = watchedField.value || 0
                  const prefix = watchedField.prefix || ""
                  const suffix = watchedField.suffix || ""
                  const decimals = watchedField.decimals || 0
                  const formattedValue = decimals > 0 
                    ? displayValue.toFixed(decimals)
                    : displayValue.toString()

                  return (
                    <div key={field.id} className="text-center">
                      <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                        {prefix}{formattedValue}{suffix}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {watchedField.label || "Rótulo da estatística"}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          </FormSection>
        )}
      </form>
    </AdminFormContainer>
  )
}