'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { PortfolioConfig, Project, Experience, Education, Testimonial } from '@/lib/types/portfolio';
import { portfolioConfig as defaultConfig } from '@/lib/config/portfolio';

interface PortfolioContextType {
  config: PortfolioConfig;
  updatePersonalInfo: (info: Partial<PortfolioConfig['personal']>) => void;
  updateAbout: (about: string) => void;
  updateSkills: (skills: string[]) => void;
  addProject: (project: Project) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  removeProject: (id: string) => void;
  addExperience: (experience: Experience) => void;
  updateExperience: (id: string, updates: Partial<Experience>) => void;
  removeExperience: (id: string) => void;
  addEducation: (education: Education) => void;
  updateEducation: (id: string, updates: Partial<Education>) => void;
  removeEducation: (id: string) => void;
  addTestimonial: (testimonial: Testimonial) => void;
  updateTestimonial: (id: string, updates: Partial<Testimonial>) => void;
  removeTestimonial: (id: string) => void;
  resetConfig: () => void;
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

interface PortfolioProviderProps {
  children: ReactNode;
  initialConfig?: PortfolioConfig;
}

export function PortfolioProvider({ children, initialConfig }: PortfolioProviderProps) {
  const [config, setConfig] = useState<PortfolioConfig>(initialConfig || defaultConfig);

  const updatePersonalInfo = useCallback((info: Partial<PortfolioConfig['personal']>) => {
    setConfig(prev => ({
      ...prev,
      personal: { ...prev.personal, ...info }
    }));
  }, []);

  const updateAbout = useCallback((about: string) => {
    setConfig(prev => ({ ...prev, about }));
  }, []);

  const updateSkills = useCallback((skills: string[]) => {
    setConfig(prev => ({ ...prev, skills }));
  }, []);

  const addProject = useCallback((project: Project) => {
    setConfig(prev => ({
      ...prev,
      projects: [...prev.projects, project]
    }));
  }, []);

  const updateProject = useCallback((id: string, updates: Partial<Project>) => {
    setConfig(prev => ({
      ...prev,
      projects: prev.projects.map(project =>
        project.id === id ? { ...project, ...updates } : project
      )
    }));
  }, []);

  const removeProject = useCallback((id: string) => {
    setConfig(prev => ({
      ...prev,
      projects: prev.projects.filter(project => project.id !== id)
    }));
  }, []);

  const addExperience = useCallback((experience: Experience) => {
    setConfig(prev => ({
      ...prev,
      experience: [...prev.experience, experience]
    }));
  }, []);

  const updateExperience = useCallback((id: string, updates: Partial<Experience>) => {
    setConfig(prev => ({
      ...prev,
      experience: prev.experience.map(exp =>
        exp.id === id ? { ...exp, ...updates } : exp
      )
    }));
  }, []);

  const removeExperience = useCallback((id: string) => {
    setConfig(prev => ({
      ...prev,
      experience: prev.experience.filter(exp => exp.id !== id)
    }));
  }, []);

  const addEducation = useCallback((education: Education) => {
    setConfig(prev => ({
      ...prev,
      education: [...prev.education, education]
    }));
  }, []);

  const updateEducation = useCallback((id: string, updates: Partial<Education>) => {
    setConfig(prev => ({
      ...prev,
      education: prev.education.map(edu =>
        edu.id === id ? { ...edu, ...updates } : edu
      )
    }));
  }, []);

  const removeEducation = useCallback((id: string) => {
    setConfig(prev => ({
      ...prev,
      education: prev.education.filter(edu => edu.id !== id)
    }));
  }, []);

  const addTestimonial = useCallback((testimonial: Testimonial) => {
    setConfig(prev => ({
      ...prev,
      testimonials: [...prev.testimonials, testimonial]
    }));
  }, []);

  const updateTestimonial = useCallback((id: string, updates: Partial<Testimonial>) => {
    setConfig(prev => ({
      ...prev,
      testimonials: prev.testimonials.map(testimonial =>
        testimonial.id === id ? { ...testimonial, ...updates } : testimonial
      )
    }));
  }, []);

  const removeTestimonial = useCallback((id: string) => {
    setConfig(prev => ({
      ...prev,
      testimonials: prev.testimonials.filter(testimonial => testimonial.id !== id)
    }));
  }, []);

  const resetConfig = useCallback(() => {
    setConfig(defaultConfig);
  }, []);

  const value: PortfolioContextType = {
    config,
    updatePersonalInfo,
    updateAbout,
    updateSkills,
    addProject,
    updateProject,
    removeProject,
    addExperience,
    updateExperience,
    removeExperience,
    addEducation,
    updateEducation,
    removeEducation,
    addTestimonial,
    updateTestimonial,
    removeTestimonial,
    resetConfig,
  };

  return (
    <PortfolioContext.Provider value={value}>
      {children}
    </PortfolioContext.Provider>
  );
}

export function usePortfolioContext() {
  const context = useContext(PortfolioContext);
  if (context === undefined) {
    throw new Error('usePortfolioContext must be used within a PortfolioProvider');
  }
  return context;
}