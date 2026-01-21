'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { Project } from '@/lib/types/portfolio';
import { useScrollLock } from '@/lib/hooks/useScrollLock';

interface ProjectModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ProjectModal({ project, isOpen, onClose }: ProjectModalProps) {
  const [showResults, setShowResults] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);
  
  // Usar o hook para gerenciar scroll de forma segura
  const { forceUnlock } = useScrollLock(isOpen);

  // Fechar modal com ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
    }
    
    return () => {
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  // Reset showResults quando modal fecha
  useEffect(() => {
    if (!isOpen) {
      setShowResults(false);
    }
  }, [isOpen]);

  // Scroll suave para resultados (apenas dentro do modal)
  const handleShowResults = () => {
    setShowResults(true);
    setTimeout(() => {
      if (resultsRef.current) {
        // Scroll apenas dentro do modal, não na página principal
        const modalContainer = resultsRef.current.closest('.overflow-y-auto');
        if (modalContainer) {
          const elementTop = resultsRef.current.offsetTop;
          modalContainer.scrollTo({ 
            top: elementTop - 20, // 20px de margem
            behavior: 'smooth'
          });
        }
      }
    }, 300);
  };

  // Dados de resultados baseados no projeto
  const getProjectResults = (projectId: string) => {
    const resultsData = {
      'pfmea-optimization-system': {
        metrics: [
          { label: 'Redução de Riscos', value: '45%', description: 'Diminuição significativa nos riscos identificados' },
          { label: 'Tempo de Análise', value: '60%', description: 'Redução no tempo para completar PFMEAs' },
          { label: 'Conformidade', value: '98%', description: 'Taxa de conformidade com padrões AIAG' }
        ],
        achievements: [
          'Implementação em 3 plantas industriais',
          'Treinamento de 50+ engenheiros',
          'Padronização de processos PFMEA',
          'Integração com sistemas ERP existentes'
        ]
      },
      'apqp-management-platform': {
        metrics: [
          { label: 'Projetos Gerenciados', value: '120+', description: 'Projetos APQP concluídos com sucesso' },
          { label: 'Redução de Prazo', value: '30%', description: 'Diminuição no tempo de desenvolvimento' },
          { label: 'Aprovação First Time', value: '85%', description: 'Taxa de aprovação na primeira tentativa' }
        ],
        achievements: [
          'Gestão de portfólio completo APQP',
          'Integração com fornecedores',
          'Dashboard executivo em tempo real',
          'Automação de aprovações'
        ]
      },
      'quality-control-dashboard': {
        metrics: [
          { label: 'Indicadores Monitorados', value: '25+', description: 'KPIs de qualidade em tempo real' },
          { label: 'Detecção de Problemas', value: '70%', description: 'Melhoria na detecção precoce' },
          { label: 'Redução de Defeitos', value: '40%', description: 'Diminuição de produtos não-conformes' }
        ],
        achievements: [
          'Monitoramento 24/7 de qualidade',
          'Alertas automáticos por SMS/Email',
          'Relatórios gerenciais automatizados',
          'Integração com sistemas de produção'
        ]
      }
    };
    
    return resultsData[projectId as keyof typeof resultsData] || resultsData['pfmea-optimization-system'];
  };

  if (!project) return null;

  const results = getProjectResults(project.id);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          onClick={onClose}
        >
          {/* Backdrop com blur aprimorado */}
          <div className="absolute inset-0 modal-backdrop-enhanced" />
          
          {/* Modal */}
          <motion.div
            className="relative modal-container-enhanced rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
          >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-border">
                <div>
                  <motion.h2 
                    className="text-2xl font-bold text-foreground"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    {project.title}
                  </motion.h2>
                  <motion.p 
                    className="text-sm text-muted-foreground mt-1"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 }}
                  >
                    {project.category} • {new Date(project.completedAt).toLocaleDateString('pt-BR')}
                  </motion.p>
                </div>
                
                <motion.button
                  onClick={onClose}
                  className="p-2 hover:bg-muted rounded-lg transition-all duration-150"
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
                  transition={{ delay: 0.2 }}
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </motion.button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Descrição resumida */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                >
                  <h3 className="text-lg font-semibold text-foreground mb-2">Resumo</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {project.description}
                  </p>
                </motion.div>

                {/* Descrição detalhada */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <h3 className="text-lg font-semibold text-foreground mb-2">Detalhes do Projeto</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {project.longDescription || project.description}
                  </p>
                </motion.div>

                {/* Tecnologias */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                >
                  <h3 className="text-lg font-semibold text-foreground mb-3">Metodologias e Ferramentas</h3>
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.map((tech, index) => (
                      <motion.span
                        key={tech}
                        className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium border border-primary/20 cursor-pointer"
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4 + index * 0.05 }}
                        whileHover={{ 
                          scale: 1.08, 
                          backgroundColor: 'hsl(var(--primary) / 0.25)',
                          transition: { duration: 0.12, ease: "easeOut" }
                        }}
                        whileTap={{ 
                          scale: 0.95,
                          transition: { duration: 0.08 }
                        }}
                      >
                        {tech}
                      </motion.span>
                    ))}
                  </div>
                </motion.div>

                {/* Botão Ver Resultados */}
                <motion.div
                  className="pt-4 border-t border-border"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45 }}
                >
                  <motion.button
                    onClick={handleShowResults}
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-3 rounded-lg transition-all duration-200 font-medium flex items-center justify-center gap-2"
                    whileHover={{ 
                      scale: 1.02,
                      transition: { duration: 0.15, ease: "easeOut" }
                    }}
                    whileTap={{ 
                      scale: 0.98,
                      transition: { duration: 0.1 }
                    }}
                  >
                    Ver Resultados
                    <motion.div
                      whileHover={{ 
                        x: 2,
                        transition: { duration: 0.15 }
                      }}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </motion.div>
                  </motion.button>
                </motion.div>

                {/* Card de Resultados */}
                <AnimatePresence>
                  {showResults && (
                    <motion.div
                      ref={resultsRef}
                      className="mt-6 p-6 bg-muted/30 border border-border rounded-lg"
                      initial={{ opacity: 0, y: 30, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -30, scale: 0.95 }}
                      transition={{ duration: 0.4, ease: 'easeOut' }}
                    >
                      <motion.h3 
                        className="text-xl font-bold text-foreground mb-4 flex items-center gap-2"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                      >
                        📊 Resultados Alcançados
                      </motion.h3>

                      {/* Métricas */}
                      <div className="grid md:grid-cols-3 gap-4 mb-6">
                        {results.metrics.map((metric, index) => (
                          <motion.div
                            key={metric.label}
                            className="bg-card/50 p-4 rounded-lg border border-border/50 cursor-pointer"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 + index * 0.1 }}
                            whileHover={{ 
                              scale: 1.03, 
                              y: -4,
                              transition: { duration: 0.15, ease: "easeOut" }
                            }}
                            whileTap={{ 
                              scale: 0.98,
                              transition: { duration: 0.1 }
                            }}
                          >
                            <div className="text-2xl font-bold text-primary mb-1">
                              {metric.value}
                            </div>
                            <div className="text-sm font-medium text-foreground mb-1">
                              {metric.label}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {metric.description}
                            </div>
                          </motion.div>
                        ))}
                      </div>

                      {/* Conquistas */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                      >
                        <h4 className="text-lg font-semibold text-foreground mb-3">
                          🎯 Principais Conquistas
                        </h4>
                        <div className="grid gap-2">
                          {results.achievements.map((achievement, index) => (
                            <motion.div
                              key={achievement}
                              className="flex items-center gap-3 p-3 bg-card/30 rounded-lg border border-border/30 cursor-pointer"
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.6 + index * 0.1 }}
                              whileHover={{ 
                                x: 8, 
                                backgroundColor: 'hsl(var(--primary) / 0.08)',
                                transition: { duration: 0.12, ease: "easeOut" }
                              }}
                              whileTap={{ 
                                scale: 0.98,
                                x: 4,
                                transition: { duration: 0.08 }
                              }}
                            >
                              <motion.div 
                                className="w-2 h-2 bg-primary rounded-full flex-shrink-0"
                                whileHover={{ 
                                  scale: 1.2,
                                  transition: { duration: 0.15 }
                                }}
                              />
                              <span className="text-sm text-muted-foreground">
                                {achievement}
                              </span>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}