'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin } from 'lucide-react';
import { usePortfolio } from '@/lib/hooks/usePortfolio';
import { AnimatedSection } from '@/components/ui/AnimatedSection';
import { AnimatedCard } from '@/components/ui/AnimatedCard';
import { TypewriterText } from '@/components/ui/TypewriterText';
import { ParticleBackground } from '@/components/ui/ParticleBackground';
import { ScrollProgress } from '@/components/ui/ScrollProgress';
import { ScrollToTop } from '@/components/ui/ScrollToTop';
import { ProfileAvatar } from '@/components/ui/ProfileAvatar';
import { StatsSection } from '@/components/sections/StatsSection';
import { TestimonialsSection } from '@/components/sections/TestimonialsSection';
import { ProjectModal } from '@/components/ui/ProjectModal';
import { EducationButton } from '@/components/ui/EducationButton';
import { EducationModal } from '@/components/ui/EducationModal';
import { SkillCard } from '@/components/ui/SkillCard';
import { SkillModal } from '@/components/ui/SkillModal';
import { SkillErrorBoundary } from '@/components/ui/SkillErrorBoundary';
import { SocialIcons } from '@/components/ui/SocialIcons';
import { EnhancedSkill, Project } from '@/lib/types/portfolio';

export default function Portfolio() {
  const [activeSection, setActiveSection] = useState('home');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEducationModalOpen, setIsEducationModalOpen] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState<EnhancedSkill | null>(null);
  const [isSkillModalOpen, setIsSkillModalOpen] = useState(false);
  const { personal, about, skills, skillCategories, enhancedSkills, projects, experience, education, social } = usePortfolio();

  // Auto-detect active section on scroll
  React.useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'sobre', 'habilidades', 'projetos', 'experiencia', 'depoimentos', 'contato'];
      const scrollPosition = window.scrollY + 100;

      for (let i = sections.length - 1; i >= 0; i--) {
        const element = document.getElementById(sections[i]);
        if (element && scrollPosition >= element.offsetTop) {
          setActiveSection(sections[i]);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      const navHeight = 80; // Height of fixed navigation
      const elementPosition = element.offsetTop - navHeight;
      
      window.scrollTo({
        top: Math.max(0, elementPosition),
        behavior: 'smooth'
      });
    }
  };

  const openProjectModal = (project: Project) => {
    setSelectedProject(project);
    setIsModalOpen(true);
  };

  const closeProjectModal = () => {
    setIsModalOpen(false);
    setSelectedProject(null);
  };

  const openEducationModal = () => {
    setIsEducationModalOpen(true);
  };

  const closeEducationModal = () => {
    setIsEducationModalOpen(false);
  };

  const openSkillModal = (skill: EnhancedSkill) => {
    setSelectedSkill(skill);
    setIsSkillModalOpen(true);
  };

  const closeSkillModal = () => {
    setIsSkillModalOpen(false);
    setSelectedSkill(null);
  };

  // Get section label for screen reader announcements
  const activeSectionLabel = '';

  const typewriterTexts = [
    personal.title,
    'Especialista em APQP',
    'Especialista em PFMEA',
    'Foco em Resoluções de Problemas'
  ];

  return (
    <div className="min-h-screen bg-background relative">
      <ParticleBackground />
      <ScrollProgress />
      
      {/* Navigation */}
      <motion.nav 
        className="fixed top-0 w-full bg-background/90 backdrop-blur-md z-50 border-b border-border"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3 sm:py-4">
            <motion.div 
              className="text-lg sm:text-xl font-bold text-foreground"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {personal.name}
            </motion.div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
              {['home', 'sobre', 'habilidades', 'projetos', 'experiência', 'depoimentos', 'contato'].map((item, index) => (
                <motion.button
                  key={item}
                  onClick={() => scrollToSection(item)}
                  className={`capitalize transition-all duration-300 relative px-3 py-2 rounded-md text-sm lg:text-base ${
                    activeSection === item 
                      ? 'text-foreground font-medium' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ 
                    scale: 1.02,
                    y: -1,
                    transition: { duration: 0.2, ease: "easeOut" }
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  {item}
                  {activeSection === item && (
                    <motion.div
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary"
                      layoutId="activeSection"
                      transition={{ duration: 0.3 }}
                    />
                  )}
                </motion.button>
              ))}
            </div>

            {/* Mobile Menu Button */}
            <motion.button
              className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                // Simple scroll to contact for mobile - you can enhance this with a proper mobile menu later
                scrollToSection('contato');
              }}
            >
              <div className="w-6 h-6 flex flex-col justify-center items-center space-y-1">
                <span className="w-4 h-0.5 bg-foreground rounded-full"></span>
                <span className="w-4 h-0.5 bg-foreground rounded-full"></span>
                <span className="w-4 h-0.5 bg-foreground rounded-full"></span>
              </div>
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section id="home" className="pt-16 sm:pt-20 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center py-12 sm:py-16 lg:py-20">
            <ProfileAvatar 
              section="hero"
              size="lg"
              className="mx-auto mb-6 sm:mb-8"
              enableAnimations={true}
            />
            
            <motion.h1 
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-3 sm:mb-4 px-2"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              {personal.name}
            </motion.h1>
            
            <motion.div
              className="text-lg sm:text-xl md:text-2xl text-muted-foreground mb-4 sm:mb-6 h-6 sm:h-8 px-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <TypewriterText texts={typewriterTexts} />
            </motion.div>
            
            <motion.p 
              className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto mb-6 sm:mb-8 px-4 leading-relaxed"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              {personal.description}
            </motion.p>
            
            <motion.div 
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <motion.button 
                onClick={() => scrollToSection('projetos')}
                className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 sm:px-8 py-3 rounded-lg transition-colors relative overflow-hidden group w-full sm:w-auto"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="relative z-10">Ver Projetos</span>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-primary to-purple-600"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: 0 }}
                  transition={{ duration: 0.3 }}
                />
              </motion.button>
              
              <motion.button 
                onClick={() => scrollToSection('contato')}
                className="border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground px-6 sm:px-8 py-3 rounded-lg transition-colors relative overflow-hidden group w-full sm:w-auto"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="relative z-10">Entre em Contato</span>
                <motion.div
                  className="absolute inset-0 bg-primary"
                  initial={{ scale: 0 }}
                  whileHover={{ scale: 1 }}
                  transition={{ duration: 0.3 }}
                />
              </motion.button>
            </motion.div>
          </div>
        </div>
        
        {/* Floating elements - Hidden on mobile for better performance */}
        <motion.div
          className="absolute top-20 left-4 sm:left-10 w-16 sm:w-20 h-16 sm:h-20 bg-primary/10 rounded-full hidden sm:block"
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute top-32 sm:top-40 right-8 sm:right-20 w-12 sm:w-16 h-12 sm:h-16 bg-purple-500/10 rounded-full hidden sm:block"
          animate={{ y: [0, 20, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        />
        <motion.div
          className="absolute bottom-16 sm:bottom-20 left-8 sm:left-20 w-10 sm:w-12 h-10 sm:h-12 bg-blue-500/10 rounded-full hidden sm:block"
          animate={{ y: [0, -15, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        />
      </section>

      {/* About Section */}
      <section id="sobre" className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-muted/50 relative">
        <div className="max-w-6xl mx-auto">
          <AnimatedSection direction="up" className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
              Sobre Mim
            </h2>
            <div className="w-20 h-1 bg-primary mx-auto rounded-full" />
          </AnimatedSection>
          
          <div className="grid md:grid-cols-2 gap-8 sm:gap-12 items-center">
            <AnimatedSection direction="left">
              <motion.div 
                className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-6 sm:mb-8 space-y-4"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                {about.split('\n\n').map((paragraph, index) => (
                  <p key={index} className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </motion.div>

              {/* Education Button */}
              <motion.div
                className="mb-6 sm:mb-8"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <EducationButton onClick={openEducationModal} />
              </motion.div>
            </AnimatedSection>
            
            <AnimatedSection direction="right" className="flex justify-center items-center order-first md:order-last">
              <ProfileAvatar 
                section="about"
                size="xl"
                enableAnimations={true}
              />
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Skills Section */}
      <section id="habilidades" className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <AnimatedSection direction="up" className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
              Competências Técnicas
            </h2>
            <div className="w-20 h-1 bg-primary mx-auto rounded-full" />
            <p className="text-base sm:text-lg text-muted-foreground mt-4 max-w-2xl mx-auto px-2">
              Metodologias e competências especializadas em qualidade e processos na indústria automotiva
            </p>
          </AnimatedSection>

          {/* Enhanced Skills Grid */}
          {enhancedSkills && enhancedSkills.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {enhancedSkills.map((skill, index) => (
                <AnimatedSection
                  key={skill.id}
                  direction="up"
                  delay={index * 0.1}
                >
                  <SkillErrorBoundary>
                    <SkillCard
                      skill={skill}
                      onClick={openSkillModal}
                      index={index}
                    />
                  </SkillErrorBoundary>
                </AnimatedSection>
              ))}
            </div>
          ) : (
            /* Fallback to original skills grid if enhancedSkills not available */
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
              {skills.map((skill, index) => (
                <AnimatedCard
                  key={index}
                  className="bg-card border border-border p-3 sm:p-4 rounded-lg shadow-md text-center"
                  hoverScale={1.05}
                  tiltIntensity={5}
                  glowEffect
                >
                  <motion.span 
                    className="text-sm sm:text-base text-foreground font-medium"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                  >
                    {skill}
                  </motion.span>
                </AnimatedCard>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Stats Section */}
      <StatsSection />

      {/* Projects Section */}
      <section id="projetos" className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-muted/50">
        <div className="max-w-6xl mx-auto">
          <AnimatedSection direction="up" className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
              Projetos em Destaque
            </h2>
            <div className="w-20 h-1 bg-primary mx-auto rounded-full" />
            <p className="text-base sm:text-lg text-muted-foreground mt-4 max-w-2xl mx-auto px-2">
              Alguns dos projetos que desenvolvi, demonstrando minhas habilidades e experiência
            </p>
          </AnimatedSection>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {projects.map((project, index) => (
              <AnimatedSection
                key={project.id}
                direction="up"
                delay={index * 0.1}
              >
                <AnimatedCard
                  className="bg-card border border-border rounded-lg p-4 sm:p-6 h-full flex flex-col"
                  hoverScale={1.02}
                  tiltIntensity={3}
                  glowEffect
                >
                  <motion.div
                    className="flex-1"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    <motion.h3 
                      className="text-lg sm:text-xl font-bold text-foreground mb-3"
                      whileHover={{ color: 'hsl(var(--primary))' }}
                      transition={{ duration: 0.2 }}
                    >
                      {project.title}
                    </motion.h3>
                    
                    <p className="text-sm sm:text-base text-muted-foreground mb-4 flex-1 leading-relaxed">
                      {project.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-2 mb-4 sm:mb-6">
                      {project.technologies.map((tech, techIndex) => (
                        <motion.span 
                          key={techIndex}
                          className="bg-secondary text-secondary-foreground px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium"
                          initial={{ opacity: 0, scale: 0 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.3, delay: techIndex * 0.05 }}
                          whileHover={{ scale: 1.1, backgroundColor: 'hsl(var(--primary))' }}
                        >
                          {tech}
                        </motion.span>
                      ))}
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    className="pt-4 border-t border-border"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                  >
                    <motion.button
                      onClick={() => openProjectModal(project)}
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 sm:py-3 rounded-lg transition-all duration-200 font-medium text-sm sm:text-base"
                      whileHover={{ 
                        scale: 1.03,
                        transition: { duration: 0.15, ease: "easeOut" }
                      }}
                      whileTap={{ 
                        scale: 0.97,
                        transition: { duration: 0.1 }
                      }}
                    >
                      Saber mais
                    </motion.button>
                  </motion.div>
                </AnimatedCard>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Experience Section */}
      <section id="experiencia" className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <AnimatedSection direction="up" className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
              Experiência Profissional
            </h2>
            <div className="w-20 h-1 bg-primary mx-auto rounded-full" />
          </AnimatedSection>
          
          <div className="relative">
            {/* Timeline line - Hidden on mobile */}
            <div className="absolute left-6 sm:left-8 top-0 bottom-0 w-0.5 bg-border hidden md:block" />
            
            <div className="space-y-6 sm:space-y-8">
              {experience.map((exp, index) => (
                <AnimatedSection
                  key={exp.id}
                  direction="left"
                  delay={index * 0.2}
                >
                  <motion.div 
                    className="relative bg-card border border-border rounded-lg p-4 sm:p-6 shadow-md md:ml-16"
                    whileHover={{ scale: 1.02, y: -5 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Timeline dot - Hidden on mobile */}
                    <motion.div 
                      className="absolute -left-20 top-6 sm:top-8 w-4 h-4 bg-primary rounded-full border-4 border-background hidden md:block"
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: index * 0.2 + 0.3 }}
                    />
                    
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3 sm:mb-4">
                      <div className="mb-2 sm:mb-0">
                        <motion.h3 
                          className="text-lg sm:text-xl font-bold text-foreground mb-1"
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.5, delay: index * 0.2 + 0.1 }}
                        >
                          {exp.position}
                        </motion.h3>
                        <motion.p 
                          className="text-sm sm:text-base text-primary font-medium"
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.5, delay: index * 0.2 + 0.2 }}
                        >
                          {exp.company}
                        </motion.p>
                      </div>
                      <motion.span 
                        className="text-xs sm:text-sm text-muted-foreground bg-muted px-2 sm:px-3 py-1 rounded-full self-start"
                        initial={{ opacity: 0, scale: 0 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: index * 0.2 + 0.4 }}
                      >
                        {exp.period}
                      </motion.span>
                    </div>
                    
                    <motion.p 
                      className="text-sm sm:text-base text-muted-foreground leading-relaxed"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: index * 0.2 + 0.3 }}
                    >
                      {exp.description}
                    </motion.p>
                    
                    {/* Hover effect overlay */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-primary/5 to-purple-500/5 rounded-lg opacity-0"
                      whileHover={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  </motion.div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <TestimonialsSection />

      {/* Contact Section */}
      <section id="contato" className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-muted/50 relative overflow-hidden">
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <AnimatedSection direction="up">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
              Vamos Otimizar Seus Processos?
            </h2>
            <div className="w-20 h-1 bg-primary mx-auto rounded-full mb-6 sm:mb-8" />
            <p className="text-base sm:text-lg text-muted-foreground mb-8 sm:mb-12 max-w-2xl mx-auto px-2 leading-relaxed">
              Interessado em implementar metodologias de qualidade e otimização de processos? Vamos conversar sobre como posso contribuir em seus projetos e melhorias.
            </p>
          </AnimatedSection>
          
          <AnimatedSection direction="up" delay={0.2}>
            <div className="mb-8 sm:mb-12">
              <SocialIcons 
                email={personal.email}
                linkedin={social.linkedin}
                twitter={social.twitter}
                iconSize="lg"
              />
            </div>
          </AnimatedSection>
          
          {/* Contact info cards */}
          <AnimatedSection direction="up" delay={0.4}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-8 sm:mt-12">
              {[
                { label: 'Email', value: personal.email, Icon: Mail, color: 'text-[#EA4335]' },
                { label: 'Telefone', value: personal.phone, Icon: Phone, color: 'text-[#0A66C2]' },
                { label: 'Localização', value: personal.location, Icon: MapPin, color: 'text-[#1DA1F2]' }
              ].map((item, index) => (
                <motion.div
                  key={item.label}
                  className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-lg p-4 sm:p-6 text-center"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                >
                  <div className={`flex justify-center mb-2 sm:mb-3 ${item.color}`}>
                    <item.Icon size={28} strokeWidth={2} className="sm:w-8 sm:h-8" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-1 sm:mb-2 text-sm sm:text-base">{item.label}</h3>
                  <p className="text-muted-foreground text-xs sm:text-sm break-words">{item.value}</p>
                </motion.div>
              ))}
            </div>
          </AnimatedSection>
        </div>
        
        {/* Background decoration - Hidden on mobile for better performance */}
        <motion.div
          className="absolute top-10 left-4 sm:left-10 w-24 sm:w-32 h-24 sm:h-32 bg-primary/10 rounded-full blur-xl hidden sm:block"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.1, 0.3] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-10 right-4 sm:right-10 w-20 sm:w-24 h-20 sm:h-24 bg-purple-500/10 rounded-full blur-xl hidden sm:block"
          animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.05, 0.2] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        />
      </section>
      
      <ScrollToTop />

      {/* Project Modal */}
      <ProjectModal 
        project={selectedProject}
        isOpen={isModalOpen}
        onClose={closeProjectModal}
      />

      {/* Education Modal */}
      <EducationModal 
        educationData={education}
        isOpen={isEducationModalOpen}
        onClose={closeEducationModal}
      />

      {/* Skill Modal */}
      <SkillModal 
        skill={selectedSkill}
        isOpen={isSkillModalOpen}
        onClose={closeSkillModal}
      />

      {/* Footer */}
      <motion.footer 
        className="py-8 px-4 sm:px-6 lg:px-8 border-t border-border bg-card/30"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-6xl mx-auto text-center">
          <motion.p 
            className="text-muted-foreground"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            © 2026 {personal.name}. Todos os direitos reservados.
          </motion.p>
          <motion.div
            className="mt-4 text-sm text-muted-foreground/70"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
          
          </motion.div>
        </div>
      </motion.footer>
    </div>
  );
}