"use client"

import { useState, useEffect } from "react"
import { AdminFormContainer, FormSection } from "@/components/admin/ui/AdminFormContainer"
import { Button } from "@/components/ui/Button"
import { EducationModalEditor } from "./EducationModalEditor"
import { SkillModalEditor } from "./SkillModalEditor"
import { ProjectModalEditor } from "./ProjectModalEditor"
import { useModalManager } from "@/lib/hooks/useModalManager"
import { 
  Plus, 
  GraduationCap, 
  Code, 
  FolderOpen, 
  Edit, 
  Trash2,
  Eye
} from "lucide-react"

type ModalType = 'education' | 'skill' | 'project'

interface Modal {
  id: string
  type: ModalType
  title: string
  lastModified: string
  isActive: boolean
}

export function ModalManager() {
  const { modals, isLoading, createModal, updateModal, deleteModal, isDirty } = useModalManager()
  const [selectedType, setSelectedType] = useState<ModalType>('education')
  const [editingModal, setEditingModal] = useState<Modal | null>(null)
  const [showEditor, setShowEditor] = useState(false)

  const modalTypes = [
    {
      type: 'education' as ModalType,
      label: 'Formação',
      icon: GraduationCap,
      description: 'Modais para educação e certificações',
      color: 'text-blue-500'
    },
    {
      type: 'skill' as ModalType,
      label: 'Habilidades',
      icon: Code,
      description: 'Modais para tecnologias e metodologias',
      color: 'text-green-500'
    },
    {
      type: 'project' as ModalType,
      label: 'Projetos',
      icon: FolderOpen,
      description: 'Modais para detalhes de projetos',
      color: 'text-purple-500'
    }
  ]

  const filteredModals = modals.filter(modal => modal.type === selectedType)

  const handleCreateModal = async () => {
    const newModal = await createModal(selectedType, {
      title: `Novo ${modalTypes.find(t => t.type === selectedType)?.label}`,
      content: '',
      isActive: true
    })
    
    if (newModal) {
      setEditingModal(newModal)
      setShowEditor(true)
    }
  }

  const handleEditModal = (modal: Modal) => {
    setEditingModal(modal)
    setShowEditor(true)
  }

  const handleDeleteModal = async (modalId: string) => {
    if (confirm('Tem certeza que deseja excluir este modal?')) {
      await deleteModal(modalId)
    }
  }

  const handleSaveModal = async (modalData: any) => {
    if (editingModal) {
      await updateModal(editingModal.id, modalData)
      setShowEditor(false)
      setEditingModal(null)
    }
  }

  const handleCancelEdit = () => {
    setShowEditor(false)
    setEditingModal(null)
  }

  const renderEditor = () => {
    if (!editingModal) return null

    switch (editingModal.type) {
      case 'education':
        return (
          <EducationModalEditor
            modal={editingModal}
            onSave={handleSaveModal}
            onCancel={handleCancelEdit}
          />
        )
      case 'skill':
        return (
          <SkillModalEditor
            modal={editingModal}
            onSave={handleSaveModal}
            onCancel={handleCancelEdit}
          />
        )
      case 'project':
        return (
          <ProjectModalEditor
            modal={editingModal}
            onSave={handleSaveModal}
            onCancel={handleCancelEdit}
          />
        )
      default:
        return null
    }
  }

  if (showEditor) {
    return renderEditor()
  }

  return (
    <AdminFormContainer
      title="Gerenciamento de Modais"
      description="Gerencie todos os modais de conteúdo detalhado do seu portfólio"
      isLoading={isLoading}
      className="animate-fade-in-up"
    >
      <div className="space-y-8">
        {/* Seletor de Tipo de Modal */}
        <FormSection
          title="Tipos de Modal"
          description="Selecione o tipo de modal que deseja gerenciar"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {modalTypes.map((type) => {
              const Icon = type.icon
              const isSelected = selectedType === type.type
              
              return (
                <button
                  key={type.type}
                  onClick={() => setSelectedType(type.type)}
                  className={`p-6 rounded-lg border-2 transition-all duration-200 text-left ${
                    isSelected
                      ? 'border-primary bg-primary/10 shadow-lg'
                      : 'border-border bg-background hover:border-primary/50 hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <Icon className={`w-6 h-6 ${isSelected ? 'text-primary' : type.color}`} />
                    <h3 className={`font-semibold ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                      {type.label}
                    </h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {type.description}
                  </p>
                  <div className="mt-3 text-xs text-muted-foreground">
                    {modals.filter(m => m.type === type.type).length} modais
                  </div>
                </button>
              )
            })}
          </div>
        </FormSection>

        {/* Lista de Modais */}
        <FormSection
          title={`Modais de ${modalTypes.find(t => t.type === selectedType)?.label}`}
          description={`Gerencie os modais de ${modalTypes.find(t => t.type === selectedType)?.label.toLowerCase()}`}
        >
          <div className="flex justify-between items-center mb-6">
            <div className="text-sm text-muted-foreground">
              {filteredModals.length} modais encontrados
            </div>
            <Button onClick={handleCreateModal} className="flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>Novo Modal</span>
            </Button>
          </div>

          {filteredModals.length === 0 ? (
            <div className="text-center py-12 bg-muted/30 rounded-lg border border-border">
              <div className="flex flex-col items-center space-y-4">
                {(() => {
                  const Icon = modalTypes.find(t => t.type === selectedType)?.icon || FolderOpen
                  return <Icon className="w-12 h-12 text-muted-foreground" />
                })()}
                <div>
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    Nenhum modal encontrado
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Crie seu primeiro modal de {modalTypes.find(t => t.type === selectedType)?.label.toLowerCase()}
                  </p>
                  <Button onClick={handleCreateModal} variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Criar Modal
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredModals.map((modal) => (
                <div
                  key={modal.id}
                  className="p-4 bg-background border border-border rounded-lg hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-medium text-foreground truncate">
                        {modal.title}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        Modificado em {new Date(modal.lastModified).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div className={`w-2 h-2 rounded-full ${modal.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditModal(modal)}
                      className="flex-1"
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      Editar
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteModal(modal.id)}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </FormSection>
      </div>
    </AdminFormContainer>
  )
}