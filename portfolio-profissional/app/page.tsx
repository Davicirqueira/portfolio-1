'use client';

import { useState } from 'react';
import { usePortfolio } from '@/lib/hooks/usePortfolio';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

export default function Portfolio() {
  const [activeSection, setActiveSection] = useState('home');
  const { personal, about, skills, projects, experience, social } = usePortfolio();

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-background/90 backdrop-blur-md z-50 border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="text-xl font-bold text-foreground">
              {personal.name}
            </div>
            <div className="hidden md:flex items-center space-x-8">
              {['home', 'sobre', 'habilidades', 'projetos', 'experiência', 'contato'].map((item) => (
                <button
                  key={item}
                  onClick={() => scrollToSection(item)}
                  className={`capitalize transition-colors ${
                    activeSection === item 
                      ? 'text-foreground font-medium' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {item}
                </button>
              ))}
              <ThemeToggle />
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-20">
            <div className="w-32 h-32 mx-auto mb-8 bg-card border-2 border-foreground rounded-full flex items-center justify-center text-foreground text-4xl font-bold">
              {personal.name.split(' ').map(n => n[0]).join('')}
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4">
              {personal.name}
            </h1>
            <h2 className="text-xl md:text-2xl text-muted-foreground mb-6">
              {personal.title}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              {personal.description}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => scrollToSection('projetos')}
                className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-3 rounded-lg transition-colors"
              >
                Ver Projetos
              </button>
              <button 
                onClick={() => scrollToSection('contato')}
                className="border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground px-8 py-3 rounded-lg transition-colors"
              >
                Entre em Contato
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="sobre" className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">
            Sobre Mim
          </h2>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {about}
              </p>
              <div className="mt-8 space-y-2">
                <p className="text-muted-foreground">
                  <span className="font-semibold">Email:</span> {personal.email}
                </p>
                <p className="text-muted-foreground">
                  <span className="font-semibold">Telefone:</span> {personal.phone}
                </p>
                <p className="text-muted-foreground">
                  <span className="font-semibold">Localização:</span> {personal.location}
                </p>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="w-64 h-64 bg-card border-2 border-foreground rounded-lg flex items-center justify-center text-foreground text-6xl font-bold">
                {personal.name.split(' ').map(n => n[0]).join('')}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Skills Section */}
      <section id="habilidades" className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">
            Habilidades
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {skills.map((skill, index) => (
              <div 
                key={index}
                className="bg-card border border-border p-4 rounded-lg shadow-md text-center hover:shadow-lg transition-shadow hover-lift"
              >
                <span className="text-foreground font-medium">{skill}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projetos" className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">
            Projetos
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project) => (
              <div key={project.id} className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow hover-lift">
                <h3 className="text-xl font-bold text-foreground mb-3">
                  {project.title}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {project.description}
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.technologies.map((tech, techIndex) => (
                    <span 
                      key={techIndex}
                      className="bg-secondary text-secondary-foreground px-2 py-1 rounded text-sm"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
                <div className="flex gap-4">
                  {project.githubUrl && (
                    <a 
                      href={project.githubUrl}
                      className="text-primary hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      GitHub
                    </a>
                  )}
                  {project.demoUrl && (
                    <a 
                      href={project.demoUrl}
                      className="text-primary hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Demo
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Experience Section */}
      <section id="experiência" className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">
            Experiência
          </h2>
          <div className="space-y-8">
            {experience.map((exp) => (
              <div key={exp.id} className="bg-card border border-border rounded-lg p-6 shadow-md hover-lift">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-foreground">
                      {exp.position}
                    </h3>
                    <p className="text-muted-foreground font-medium">
                      {exp.company}
                    </p>
                  </div>
                  <span className="text-muted-foreground mt-2 md:mt-0">
                    {exp.period}
                  </span>
                </div>
                <p className="text-muted-foreground">
                  {exp.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contato" className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/50">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-foreground mb-12">
            Entre em Contato
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Interessado em trabalhar juntos? Vamos conversar sobre seu próximo projeto!
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <a 
              href={`mailto:${personal.email}`}
              className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-3 rounded-lg transition-colors"
            >
              Enviar Email
            </a>
            <div className="flex gap-4">
              {social.github && (
                <a 
                  href={social.github}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  GitHub
                </a>
              )}
              {social.linkedin && (
                <a 
                  href={social.linkedin}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  LinkedIn
                </a>
              )}
              {social.twitter && (
                <a 
                  href={social.twitter}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Twitter
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 lg:px-8 border-t border-border">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-muted-foreground">
            © 2024 {personal.name}. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}