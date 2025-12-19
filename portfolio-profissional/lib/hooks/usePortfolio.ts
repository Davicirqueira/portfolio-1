import { useMemo } from 'react';
import { usePortfolioContext } from '@/lib/context/PortfolioContext';
import { PortfolioConfig, Project, Experience, Education, Testimonial } from '@/lib/types/portfolio';

export function usePortfolio() {
  const { config } = usePortfolioContext();

  // Helper functions for filtering and sorting
  const getFeaturedProjects = useMemo(() => {
    return config.projects.filter(project => project.featured);
  }, [config.projects]);

  const getProjectsByCategory = useMemo(() => {
    return (category?: string) => {
      if (!category) return config.projects;
      return config.projects.filter(project => 
        project.category.toLowerCase() === category.toLowerCase()
      );
    };
  }, [config.projects]);

  const searchProjects = useMemo(() => {
    return (query: string) => {
      if (!query.trim()) return config.projects;
      
      const searchTerm = query.toLowerCase();
      return config.projects.filter(project =>
        project.title.toLowerCase().includes(searchTerm) ||
        project.description.toLowerCase().includes(searchTerm) ||
        project.technologies.some(tech => 
          tech.toLowerCase().includes(searchTerm)
        )
      );
    };
  }, [config.projects]);

  const getExperienceByDate = useMemo(() => {
    return [...config.experience].sort((a, b) => 
      new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    );
  }, [config.experience]);

  const getEducationByDate = useMemo(() => {
    return [...config.education].sort((a, b) => 
      new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    );
  }, [config.education]);

  const getTestimonialsByDate = useMemo(() => {
    return [...config.testimonials].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [config.testimonials]);

  const getAllTechnologies = useMemo(() => {
    const techSet = new Set<string>();
    config.projects.forEach(project => {
      project.technologies.forEach(tech => techSet.add(tech));
    });
    return Array.from(techSet).sort();
  }, [config.projects]);

  const getProjectCategories = useMemo(() => {
    const categorySet = new Set<string>();
    config.projects.forEach(project => {
      categorySet.add(project.category);
    });
    return Array.from(categorySet).sort();
  }, [config.projects]);

  return {
    // Raw config
    config,
    
    // Personal info
    personal: config.personal,
    about: config.about,
    skills: config.skills,
    skillCategories: config.skillCategories,
    social: config.social,
    seo: config.seo,
    
    // Projects
    projects: config.projects,
    featuredProjects: getFeaturedProjects,
    getProjectsByCategory,
    searchProjects,
    getAllTechnologies,
    getProjectCategories,
    
    // Experience & Education
    experience: getExperienceByDate,
    education: getEducationByDate,
    
    // Testimonials
    testimonials: getTestimonialsByDate,
  };
}