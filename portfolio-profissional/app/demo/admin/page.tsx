"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { AdminFormContainer } from "@/components/admin/ui/AdminFormContainer"
import { FormField, Input, Textarea, Select } from "@/components/admin/ui/FormField"
import { useAdminContentEditor, useApiSaveFunction } from "@/lib/hooks/useAdminContentEditor"
import { homeSchema, type HomeData } from "@/lib/schemas/admin"
import { Plus, Trash2, Settings, Eye } from "lucide-react"

// Mock da função de save para demonstração
const mockSaveFunction = async (data: HomeData) => {
  // Simula delay de rede
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // Simula sucesso/erro aleatório para demonstração
  const success = Math.random() > 0.3 // 70% de chance de sucesso
  
  if (success) {
    console.log('Dados salvos:', data)
    return {
      success: true,
      data,
      timestamp: new Date(),
    }
  } else {
    return {
      success: false,
      error: 'Erro simulado para demonstração',
      timestamp: new Date(),
    }
  }
}

export default function AdminDemoPage() {
  const initialData: HomeData = {
    name: "João Silva",
    title: "Desenvolvedor Full Stack",
    description: "Desenvolvedor experiente com foco em tecnologias modernas e soluções inovadoras para a indústria automotiva.",
    ctaButtons: [
      { text: "Ver Projetos", href: "/projetos", variant: "primary" },
      { text: "Contato", href: "/contato", variant: "secondary" }
    ],
    profileImage: "https://via.placeholder.com/300x300"
  }

  const editor = useAdminContentEditor({
    initialData,
    validationSchema: homeSchema,
    saveFunction: mockSaveFunction,
    successMessage: "Dados da seção Home salvos com sucesso!",
    errorMessage: "Erro ao salvar dados da seção Home",
  })

  const handleAddButton = () => {
    const newButtons = [
      ...(editor.data.ctaButtons || []),
      { text: "Novo Botão", href: "/novo", variant: "outline" as const }
    ]
    editor.updateData({ ctaButtons: newButtons })
  }

  const handleRemoveButton = (index: number) => {
    const newButtons = editor.data.ctaButtons?.filter((_, i) => i !== index) || []
    editor.updateData({ ctaButtons: newButtons })
  }

  const handleButtonChange = (index: number, field: string, value: string) => {
    const newButtons = [...(editor.data.ctaButtons || [])]
    newButtons[index] = { ...newButtons[index], [field]: value }
    editor.updateData({ ctaButtons: newButtons })
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background decoration */}
      <motion.div
        className="absolute top-20 left-10 w-32 h-32 bg-primary/10 rounded-full blur-xl"
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.1, 0.3] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-20 right-10 w-24 h-24 bg-purple-500/10 rounded-full blur-xl"
        animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.05, 0.2] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      />

      <div className="relative z-10 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div 
            className="mb-8 text-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-3xl font-bold text-foreground mb-2 gradient-text">
              🎛️ Demo - Infraestrutura de Edição Administrativa
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Esta página demonstra os componentes e hooks implementados na Task 3.
              Teste as funcionalidades de edição, validação, auto-save e feedback visual.
            </p>
          </motion.div>

          <AdminFormContainer
            title="Editor da Seção Home"
            description="Demonstração do sistema de edição com validação em tempo real e auto-save"
            isLoading={editor.isLoading}
            isSaving={editor.isSaving}
            isDirty={editor.isDirty}
            onSave={editor.save}
            onCancel={editor.cancel}
          >
            <div className="space-y-6">
              {/* Informações básicas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  label="Nome Completo"
                  required
                  error={editor.getError('name')}
                >
                  <Input
                    value={editor.data.name}
                    onChange={(e) => editor.updateData({ name: e.target.value })}
                    error={editor.hasError('name')}
                    placeholder="Digite seu nome completo"
                  />
                </FormField>

                <FormField
                  label="Título/Especialização"
                  required
                  error={editor.getError('title')}
                >
                  <Input
                    value={editor.data.title}
                    onChange={(e) => editor.updateData({ title: e.target.value })}
                    error={editor.hasError('title')}
                    placeholder="Ex: Desenvolvedor Full Stack"
                  />
                </FormField>
              </div>

              <FormField
                label="Descrição/Tagline"
                required
                error={editor.getError('description')}
                description="Uma breve descrição que aparecerá na página inicial"
              >
                <Textarea
                  value={editor.data.description}
                  onChange={(e) => editor.updateData({ description: e.target.value })}
                  error={editor.hasError('description')}
                  placeholder="Descreva brevemente seu perfil profissional"
                  rows={3}
                />
              </FormField>

              <FormField
                label="URL da Foto de Perfil"
                error={editor.getError('profileImage')}
              >
                <Input
                  value={editor.data.profileImage || ''}
                  onChange={(e) => editor.updateData({ profileImage: e.target.value })}
                  error={editor.hasError('profileImage')}
                  placeholder="https://exemplo.com/foto.jpg"
                />
              </FormField>

              {/* Botões de Call-to-Action */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-foreground">
                    Botões de Call-to-Action
                  </h3>
                  <motion.button
                    onClick={handleAddButton}
                    className="flex items-center gap-2 px-3 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25"
                    whileHover={{ scale: 1.05, y: -1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Plus className="w-4 h-4" />
                    Adicionar Botão
                  </motion.button>
                </div>

                {editor.data.ctaButtons?.map((button, index) => (
                  <motion.div 
                    key={index} 
                    className="p-4 bg-card/30 border border-border rounded-lg space-y-3 backdrop-blur-sm"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    whileHover={{ scale: 1.01, y: -2 }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">
                        Botão {index + 1}
                      </span>
                      <motion.button
                        onClick={() => handleRemoveButton(index)}
                        className="flex items-center gap-1 text-red-400 hover:text-red-300 text-sm px-2 py-1 rounded hover:bg-red-400/10 transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Trash2 className="w-3 h-3" />
                        Remover
                      </motion.button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <FormField label="Texto">
                        <Input
                          value={button.text}
                          onChange={(e) => handleButtonChange(index, 'text', e.target.value)}
                          placeholder="Texto do botão"
                        />
                      </FormField>
                      
                      <FormField label="Link">
                        <Input
                          value={button.href}
                          onChange={(e) => handleButtonChange(index, 'href', e.target.value)}
                          placeholder="/caminho ou https://..."
                        />
                      </FormField>
                      
                      <FormField label="Estilo">
                        <Select
                          value={button.variant || 'primary'}
                          onChange={(e) => handleButtonChange(index, 'variant', e.target.value)}
                          options={[
                            { value: 'primary', label: 'Primário' },
                            { value: 'secondary', label: 'Secundário' },
                            { value: 'outline', label: 'Contorno' },
                          ]}
                        />
                      </FormField>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </AdminFormContainer>

          {/* Informações de Debug */}
          <motion.div 
            className="mt-8 p-6 bg-card/30 backdrop-blur-sm border border-border rounded-lg shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Settings className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-medium text-foreground">
                Estado do Editor (Debug)
              </h3>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="font-medium text-foreground">isDirty:</span>
                <motion.span 
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    editor.isDirty 
                      ? 'bg-orange-400/20 text-orange-400 border border-orange-400/30' 
                      : 'bg-green-400/20 text-green-400 border border-green-400/30'
                  }`}
                  animate={{ scale: editor.isDirty ? [1, 1.05, 1] : 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {editor.isDirty ? 'Sim' : 'Não'}
                </motion.span>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="font-medium text-foreground">isSaving:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  editor.isSaving 
                    ? 'bg-blue-400/20 text-blue-400 border border-blue-400/30' 
                    : 'bg-muted text-muted-foreground border border-border'
                }`}>
                  {editor.isSaving ? 'Sim' : 'Não'}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="font-medium text-foreground">autoSave:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  editor.autoSaveEnabled 
                    ? 'bg-green-400/20 text-green-400 border border-green-400/30' 
                    : 'bg-muted text-muted-foreground border border-border'
                }`}>
                  {editor.autoSaveEnabled ? 'Ativo' : 'Inativo'}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="font-medium text-foreground">Erros:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  editor.hasAnyError() 
                    ? 'bg-red-400/20 text-red-400 border border-red-400/30' 
                    : 'bg-green-400/20 text-green-400 border border-green-400/30'
                }`}>
                  {editor.hasAnyError() ? editor.getAllErrors().length : '0'}
                </span>
              </div>
            </div>
            
            {editor.lastSaved && (
              <motion.div 
                className="mt-3 text-sm text-muted-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <span className="font-medium">Último save:</span>
                <span className="ml-2">{editor.lastSaved.toLocaleTimeString()}</span>
              </motion.div>
            )}

            {editor.hasAnyError() && (
              <motion.div 
                className="mt-3"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <span className="font-medium text-red-400">Erros de validação:</span>
                <ul className="mt-1 text-sm text-red-400 space-y-1">
                  {editor.getAllErrors().map((error, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <span className="w-1 h-1 bg-red-400 rounded-full"></span>
                      {error}
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}
          </motion.div>

          {/* Controles de Auto-save */}
          <motion.div 
            className="mt-4 p-4 bg-primary/10 backdrop-blur-sm border border-primary/20 rounded-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <h4 className="font-medium text-primary mb-3 flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Controles de Demonstração
            </h4>
            <div className="flex flex-wrap gap-3">
              <motion.button
                onClick={() => editor.setAutoSave(!editor.autoSaveEnabled)}
                className={`px-4 py-2 text-sm rounded-lg font-medium transition-all duration-200 ${
                  editor.autoSaveEnabled 
                    ? 'bg-orange-600 text-white hover:bg-orange-700 shadow-lg shadow-orange-600/25' 
                    : 'bg-green-600 text-white hover:bg-green-700 shadow-lg shadow-green-600/25'
                }`}
                whileHover={{ scale: 1.05, y: -1 }}
                whileTap={{ scale: 0.95 }}
              >
                {editor.autoSaveEnabled ? 'Desabilitar' : 'Habilitar'} Auto-save
              </motion.button>
              
              <motion.button
                onClick={editor.reset}
                className="px-4 py-2 text-sm bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 font-medium transition-all duration-200 border border-border"
                whileHover={{ scale: 1.05, y: -1 }}
                whileTap={{ scale: 0.95 }}
              >
                Reset para Estado Inicial
              </motion.button>
            </div>
          </motion.div>

          {/* Navigation */}
          <motion.div 
            className="mt-8 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            <motion.a
              href="/demo"
              className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
              whileHover={{ x: -5 }}
              transition={{ duration: 0.2 }}
            >
              ← Voltar às demonstrações
            </motion.a>
          </motion.div>
        </div>
      </div>
    </div>
  )
}