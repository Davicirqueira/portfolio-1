'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { usePortfolio } from '@/lib/hooks/usePortfolio';
import { AnimatedSection } from '@/components/ui/AnimatedSection';
import { AnimatedCard } from '@/components/ui/AnimatedCard';
import { AnimatedProgressBar } from '@/components/ui/AnimatedProgressBar';
import { TypewriterText } from '@/components/ui/TypewriterText';
import { ParticleBackground } from '@/components/ui/ParticleBackground';
import { ScrollProgress } from '@/components/ui/ScrollProgress';
import { ScrollToTop } from '@/components/ui/ScrollToTop';
import { ProfileAvatar } from '@/components/ui/ProfileAvatar';
import { StatsSection } from '@/components/sections/StatsSection';
import { TestimonialsSection } from '@/components/sections/TestimonialsSection';

export default function Portfolio() {
  const [activeSection, setActiveSection] = useState('home');
  const { personal, about, skills, skillCategories, projects, experience, social } = usePortfolio();

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  };

  const typewriterTexts = [
    personal.title,
    'Especialista em APQP',
    'Especialista em PFMEA',
    'Arquiteto de Soluções'
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
          <div className="flex justify-between items-center py-4">
            <motion.div 
              className="text-xl font-bold text-foreground"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {personal.name}
            </motion.div>
            <div className="hidden md:flex items-center space-x-8">
              {['home', 'sobre', 'habilidades', 'projetos', 'experiência', 'contato'].map((item, index) => (
                <motion.button
                  key={item}
                  onClick={() => scrollToSection(item)}
                  className={`capitalize transition-all duration-300 relative px-3 py-2 rounded-md ${
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
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section id="home" className="pt-20 pb-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center py-20">
            <ProfileAvatar 
              section="hero"
              size="lg"
              className="mx-auto mb-8"
              enableAnimations={true}
            />
            
            <motion.h1 
              className="text-4xl md:text-6xl font-bold text-foreground mb-4"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              {personal.name}
            </motion.h1>
            
            <motion.div
              className="text-xl md:text-2xl text-muted-foreground mb-6 h-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <TypewriterText texts={typewriterTexts} />
            </motion.div>
            
            <motion.p 
              className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              {personal.description}
            </motion.p>
            
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <motion.button 
                onClick={() => scrollToSection('projetos')}
                className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-3 rounded-lg transition-colors relative overflow-hidden group"
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
                className="border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground px-8 py-3 rounded-lg transition-colors relative overflow-hidden group"
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
        
        {/* Floating elements */}
        <motion.div
          className="absolute top-20 left-10 w-20 h-20 bg-primary/10 rounded-full"
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute top-40 right-20 w-16 h-16 bg-purple-500/10 rounded-full"
          animate={{ y: [0, 20, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        />
        <motion.div
          className="absolute bottom-20 left-20 w-12 h-12 bg-blue-500/10 rounded-full"
          animate={{ y: [0, -15, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        />
      </section>

      {/* About Section */}
      <section id="sobre" className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/50 relative">
        <div className="max-w-6xl mx-auto">
          <AnimatedSection direction="up" className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Sobre Mim
            </h2>
            <div className="w-20 h-1 bg-primary mx-auto rounded-full" />
          </AnimatedSection>
          
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <AnimatedSection direction="left">
              <motion.p 
                className="text-lg text-muted-foreground leading-relaxed mb-8"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                {about}
              </motion.p>
              
              <motion.div 
                className="space-y-4"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                {[
                  { label: 'Email', value: personal.email },
                  { label: 'Telefone', value: personal.phone },
                  { label: 'Localização', value: personal.location }
                ].map((item, index) => (
                  <motion.div
                    key={item.label}
                    className="flex items-center space-x-3 p-3 rounded-lg bg-card/50 border border-border/50"
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                    whileHover={{ scale: 1.02, x: 5 }}
                  >
                    <span className="font-semibold text-primary min-w-[100px]">{item.label}:</span>
                    <span className="text-muted-foreground">{item.value}</span>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatedSection>
            
            <AnimatedSection direction="right" className="flex justify-center">
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
      <section id="habilidades" className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <AnimatedSection direction="up" className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Competências Técnicas
            </h2>
            <div className="w-20 h-1 bg-primary mx-auto rounded-full" />
            <p className="text-lg text-muted-foreground mt-4 max-w-2xl mx-auto">
              Metodologias e competências especializadas em qualidade e processos na indústria automotiva
            </p>
          </AnimatedSection>

          {/* Skills with progress bars */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {skillCategories && skillCategories.length > 0 ? (
              skillCategories.slice(0, 2).flatMap(category => 
                category.skills.slice(0, 3)
              ).map((skillItem, index) => (
                <AnimatedProgressBar
                  key={skillItem.name}
                  label={skillItem.name}
                  percentage={skillItem.proficiency}
                  color={skillItem.color}
                  delay={index * 0.1}
                />
              ))
            ) : (
              [
                { skill: 'PFMEA', percentage: 95, color: 'blue' as const },
                { skill: 'APQP', percentage: 90, color: 'green' as const },
                { skill: 'Mapeamento de Processos', percentage: 90, color: 'purple' as const },
                { skill: 'Gestão de Projetos', percentage: 85, color: 'orange' as const },
                { skill: 'Comunicação Estratégica', percentage: 90, color: 'red' as const },
                { skill: 'Controle de Indicadores', percentage: 90, color: 'blue' as const }
              ].map((item, index) => (
                <AnimatedProgressBar
                  key={item.skill}
                  label={item.skill}
                  percentage={item.percentage}
                  color={item.color}
                  delay={index * 0.1}
                />
              ))
            )}
          </div>

          {/* Skills grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {skills.map((skill, index) => (
              <AnimatedCard
                key={index}
                className="bg-card border border-border p-4 rounded-lg shadow-md text-center"
                hoverScale={1.05}
                tiltIntensity={5}
                glowEffect
              >
                <motion.span 
                  className="text-foreground font-medium"
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
        </div>
      </section>

      {/* Stats Section */}
      <StatsSection />

      {/* Projects Section */}
      <section id="projetos" className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/50">
        <div className="max-w-6xl mx-auto">
          <AnimatedSection direction="up" className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Projetos em Destaque
            </h2>
            <div className="w-20 h-1 bg-primary mx-auto rounded-full" />
            <p className="text-lg text-muted-foreground mt-4 max-w-2xl mx-auto">
              Alguns dos projetos que desenvolvi, demonstrando minhas habilidades e experiência
            </p>
          </AnimatedSection>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project, index) => (
              <AnimatedSection
                key={project.id}
                direction="up"
                delay={index * 0.1}
              >
                <AnimatedCard
                  className="bg-card border border-border rounded-lg p-6 h-full flex flex-col"
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
                      className="text-xl font-bold text-foreground mb-3"
                      whileHover={{ color: 'hsl(var(--primary))' }}
                      transition={{ duration: 0.2 }}
                    >
                      {project.title}
                    </motion.h3>
                    
                    <p className="text-muted-foreground mb-4 flex-1">
                      {project.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-2 mb-6">
                      {project.technologies.map((tech, techIndex) => (
                        <motion.span 
                          key={techIndex}
                          className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm font-medium"
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
                    className="flex gap-4 pt-4 border-t border-border"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                  >
                    {project.githubUrl && (
                      <motion.a 
                        href={project.githubUrl}
                        className="text-primary hover:text-primary/80 font-medium transition-colors"
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        GitHub
                      </motion.a>
                    )}
                    {project.demoUrl && (
                      <motion.a 
                        href={project.demoUrl}
                        className="text-primary hover:text-primary/80 font-medium transition-colors"
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Demo
                      </motion.a>
                    )}
                  </motion.div>
                </AnimatedCard>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Experience Section */}
      <section id="experiência" className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <AnimatedSection direction="up" className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Experiência Profissional
            </h2>
            <div className="w-20 h-1 bg-primary mx-auto rounded-full" />
          </AnimatedSection>
          
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border hidden md:block" />
            
            <div className="space-y-8">
              {experience.map((exp, index) => (
                <AnimatedSection
                  key={exp.id}
                  direction="left"
                  delay={index * 0.2}
                >
                  <motion.div 
                    className="relative bg-card border border-border rounded-lg p-6 shadow-md md:ml-16"
                    whileHover={{ scale: 1.02, y: -5 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Timeline dot */}
                    <motion.div 
                      className="absolute -left-20 top-8 w-4 h-4 bg-primary rounded-full border-4 border-background hidden md:block"
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: index * 0.2 + 0.3 }}
                    />
                    
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4">
                      <div>
                        <motion.h3 
                          className="text-xl font-bold text-foreground mb-1"
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.5, delay: index * 0.2 + 0.1 }}
                        >
                          {exp.position}
                        </motion.h3>
                        <motion.p 
                          className="text-primary font-medium"
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.5, delay: index * 0.2 + 0.2 }}
                        >
                          {exp.company}
                        </motion.p>
                      </div>
                      <motion.span 
                        className="text-muted-foreground mt-2 md:mt-0 bg-muted px-3 py-1 rounded-full text-sm"
                        initial={{ opacity: 0, scale: 0 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: index * 0.2 + 0.4 }}
                      >
                        {exp.period}
                      </motion.span>
                    </div>
                    
                    <motion.p 
                      className="text-muted-foreground leading-relaxed"
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
      <section id="contato" className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/50 relative overflow-hidden">
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <AnimatedSection direction="up">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Vamos Trabalhar Juntos?
            </h2>
            <div className="w-20 h-1 bg-primary mx-auto rounded-full mb-8" />
            <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">
              Interessado em trabalhar juntos? Vamos conversar sobre seu próximo projeto!
            </p>
          </AnimatedSection>
          
          <AnimatedSection direction="up" delay={0.2}>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-8">
              <motion.a 
                href={`mailto:${personal.email}`}
                className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-4 rounded-lg transition-colors font-medium relative overflow-hidden group"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="relative z-10">Enviar Email</span>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-primary to-purple-600"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: 0 }}
                  transition={{ duration: 0.3 }}
                />
              </motion.a>
              
              <div className="flex gap-6">
                {[
                  { href: social.github, label: 'GitHub' },
                  { href: social.linkedin, label: 'LinkedIn' },
                  { href: social.twitter, label: 'Twitter' }
                ].filter(item => item.href).map((item, index) => (
                  <motion.a
                    key={item.label}
                    href={item.href}
                    className="text-muted-foreground hover:text-primary transition-colors font-medium px-4 py-2 rounded-lg hover:bg-card/50"
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {item.label}
                  </motion.a>
                ))}
              </div>
            </div>
          </AnimatedSection>
          
          {/* Contact info cards */}
          <AnimatedSection direction="up" delay={0.4}>
            <div className="grid md:grid-cols-3 gap-6 mt-12">
              {[
                { label: 'Email', value: personal.email, icon: '📧' },
                { label: 'Telefone', value: personal.phone, icon: '📱' },
                { label: 'Localização', value: personal.location, icon: '📍' }
              ].map((item, index) => (
                <motion.div
                  key={item.label}
                  className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-lg p-6 text-center"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                >
                  <div className="text-3xl mb-3">{item.icon}</div>
                  <h3 className="font-semibold text-foreground mb-2">{item.label}</h3>
                  <p className="text-muted-foreground text-sm">{item.value}</p>
                </motion.div>
              ))}
            </div>
          </AnimatedSection>
        </div>
        
        {/* Background decoration */}
        <motion.div
          className="absolute top-10 left-10 w-32 h-32 bg-primary/10 rounded-full blur-xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.1, 0.3] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-10 right-10 w-24 h-24 bg-purple-500/10 rounded-full blur-xl"
          animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.05, 0.2] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        />
      </section>
      
      <ScrollToTop />

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
            © 2025 {personal.name}. Todos os direitos reservados.
          </motion.p>
          <motion.div
            className="mt-4 text-sm text-muted-foreground/70"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Feito com ❤️ e muito ☕
          </motion.div>
        </div>
      </motion.footer>
    </div>
  );
}