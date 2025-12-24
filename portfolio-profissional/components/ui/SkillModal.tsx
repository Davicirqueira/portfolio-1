'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Award, Calendar, Briefcase } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { EnhancedSkill } from '@/lib/types/portfolio';

interface SkillModalProps {
  skill: EnhancedSkill | null;
  isOpen: boolean;
  onClose: () => void;
}

export function SkillModal({ skill, isOpen, onClose }: SkillModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Fechar modal com ESC e gerenciar foco
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (isOpen) {
      // Salvar o elemento que tinha foco antes do modal abrir
      previousFocusRef.current = document.activeElement as HTMLElement;
      
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
      
      // Focar no modal quando abrir
      setTimeout(() => {
        modalRef.current?.focus();
      }, 100);
    }
    
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
      
      // Retornar foco para o elemento original quando fechar
      if (!isOpen && previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    };
  }, [isOpen, onClose]);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Qualidade e Processos Automotivos':
        return 'text-blue-600 bg-blue-500/10 border-blue-500/20';
      case 'Análise e Melhoria de Processos':
        return 'text-green-600 bg-green-500/10 border-green-500/20';
      case 'Gestão e Liderança':
        return 'text-purple-600 bg-purple-500/10 border-purple-500/20';
      case 'Comunicação Estratégica':
        return 'text-orange-600 bg-orange-500/10 border-orange-500/20';
      default:
        return 'text-gray-600 bg-gray-500/10 border-gray-500/20';
    }
  };

  const getExpertiseBadgeColor = (level: string) => {
    switch (level) {
      case 'Specialist':
        return 'bg-emerald-500 text-white';
      case 'Expert':
        return 'bg-blue-500 text-white';
      case 'Advanced':
        return 'bg-purple-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  if (!skill) return null;

  // Fallback para dados ausentes
  const safeSkill = {
    id: skill.id || 'unknown',
    name: skill.name || 'Competência não identificada',
    category: skill.category || 'Categoria não especificada',
    description: skill.description || 'Descrição não disponível',
    detailedDescription: skill.detailedDescription || ['Informações detalhadas não disponíveis.'],
    usageExamples: skill.usageExamples || [],
    expertiseLevel: skill.expertiseLevel || 'Advanced',
    yearsOfExperience: skill.yearsOfExperience || 0,
    keyProjects: skill.keyProjects || []
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop com blur */}
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          
          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              ref={modalRef}
              className="bg-card border border-border rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="skill-modal-title"
              aria-describedby="skill-modal-description"
              tabIndex={-1}
            >
              {/* Header */}
              <div className="flex items-start justify-between p-6 border-b border-border">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <motion.h2 
                      id="skill-modal-title"
                      className="text-2xl font-bold text-foreground"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      {safeSkill.name}
                    </motion.h2>
                    
                    <motion.span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getExpertiseBadgeColor(safeSkill.expertiseLevel)}`}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.15 }}
                    >
                      {safeSkill.expertiseLevel}
                    </motion.span>
                  </div>
                  
                  <motion.div
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getCategoryColor(safeSkill.category)}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    {safeSkill.category}
                  </motion.div>
                </div>
                
                <motion.button
                  onClick={onClose}
                  className="p-2 hover:bg-muted rounded-lg transition-all duration-150 ml-4"
                  whileHover={{ 
                    scale: 1.1,
                    rotate: 90,
                    transition: { duration: 0.15, ease: "easeOut" }
                  }}
                  whileTap={{ 
                    scale: 0.9,
                    transition: { duration: 0.1 }
                  }}
                  initial={{ opacity: 0, rotate: -90 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  transition={{ delay: 0.25 }}
                  aria-label="Fechar modal"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </motion.button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Stats Row */}
                <motion.div
                  className="grid grid-cols-2 gap-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg border border-border/50">
                    <Calendar className="w-5 h-5 text-primary" />
                    <div>
                      <div className="text-sm text-muted-foreground">Experiência</div>
                      <div className="font-semibold text-foreground">{safeSkill.yearsOfExperience} anos</div>
                    </div>
                  </div>
                  
                  {safeSkill.keyProjects && safeSkill.keyProjects.length > 0 && (
                    <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg border border-border/50">
                      <Briefcase className="w-5 h-5 text-primary" />
                      <div>
                        <div className="text-sm text-muted-foreground">Projetos-chave</div>
                        <div className="font-semibold text-foreground">{safeSkill.keyProjects.length}</div>
                      </div>
                    </div>
                  )}
                </motion.div>

                {/* Descrição detalhada */}
                <motion.div
                  id="skill-modal-description"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                >
                  <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Award className="w-5 h-5 text-primary" />
                    Expertise Profissional
                  </h3>
                  
                  <div className="space-y-4">
                    {safeSkill.detailedDescription.map((paragraph, index) => (
                      <motion.p
                        key={index}
                        className="text-muted-foreground leading-relaxed text-justify"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + index * 0.1 }}
                      >
                        {paragraph}
                      </motion.p>
                    ))}
                  </div>
                </motion.div>

                {/* Exemplos de uso */}
                {safeSkill.usageExamples && safeSkill.usageExamples.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <h3 className="text-lg font-semibold text-foreground mb-4">
                      🎯 Exemplos de Aplicação
                    </h3>
                    
                    <div className="grid gap-3">
                      {safeSkill.usageExamples.map((example, index) => (
                        <motion.div
                          key={index}
                          className="flex items-start gap-3 p-4 bg-muted/20 rounded-lg border border-border/30"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.55 + index * 0.1 }}
                          whileHover={{ 
                            x: 4, 
                            backgroundColor: 'hsl(var(--primary) / 0.05)',
                            transition: { duration: 0.12, ease: "easeOut" }
                          }}
                        >
                          <motion.div 
                            className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-2"
                            whileHover={{ 
                              scale: 1.2,
                              transition: { duration: 0.15 }
                            }}
                          />
                          <span className="text-sm text-muted-foreground">
                            {example}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Projetos-chave */}
                {safeSkill.keyProjects && safeSkill.keyProjects.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <h3 className="text-lg font-semibold text-foreground mb-4">
                      🚀 Projetos Destacados
                    </h3>
                    
                    <div className="flex flex-wrap gap-2">
                      {safeSkill.keyProjects.map((project, index) => (
                        <motion.span
                          key={project}
                          className="bg-primary/10 text-primary px-3 py-2 rounded-full text-sm font-medium border border-primary/20"
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.65 + index * 0.05 }}
                          whileHover={{ 
                            scale: 1.05, 
                            backgroundColor: 'hsl(var(--primary) / 0.15)',
                            transition: { duration: 0.12, ease: "easeOut" }
                          }}
                        >
                          {project}
                        </motion.span>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}