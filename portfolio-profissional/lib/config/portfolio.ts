import { PortfolioConfig } from '../types/portfolio';

export const portfolioConfig: PortfolioConfig = {
  personal: {
    name: "Gilberto Nascimento",
    title: "Engenheiro de Processos",
    description: "Dedicado a transformar método em prática e risco em prevenção.",
    email: "gilberto.tri@gmail.com",
    phone: "+55 (11) 99881-0297",
    location: "São Paulo, Brasil",
    profilePhoto: "/profile-photo.png", // Professional photo for About section
  },

  about: "Engenheiro com mais de 8 anos de experiência em qualidade e processos na indústria automotiva. Especializado em PFMEA, APQP e implementação de controles de qualidade em ambientes de manufatura.",

  skills: [
    "PFMEA", "APQP", "Plano de Controle", "FAST", "OMP", "SMP",
    "Mapeamento de Processos", "Controles Visuais", "Melhoria Contínua",
    "Padronização de Processos", "Gestão de Projetos", "Comunicação Estratégica",
    "Redação Técnica", "Análise de Riscos"
  ],

  skillCategories: [
    {
      id: 'automotive-quality',
      name: 'Qualidade e Processos Automotivos',
      skills: [
        { name: 'PFMEA', proficiency: 95, color: 'blue' },
        { name: 'APQP', proficiency: 90, color: 'green' },
        { name: 'Plano de Controle', proficiency: 90, color: 'purple' },
        { name: 'FAST', proficiency: 85, color: 'orange' },
        { name: 'OMP', proficiency: 85, color: 'red' },
        { name: 'SMP', proficiency: 85, color: 'blue' }
      ]
    },
    {
      id: 'process-analysis',
      name: 'Análise e Melhoria de Processos',
      skills: [
        { name: 'Mapeamento de Processos', proficiency: 90, color: 'green' },
        { name: 'Controles Visuais', proficiency: 85, color: 'purple' },
        { name: 'Melhoria Contínua', proficiency: 90, color: 'orange' },
        { name: 'Padronização de Processos', proficiency: 85, color: 'red' }
      ]
    },
    {
      id: 'management-leadership',
      name: 'Gestão e Liderança',
      skills: [
        { name: 'Gestão de Projetos', proficiency: 85, color: 'blue' },
        { name: 'Controle de Indicadores', proficiency: 90, color: 'green' },
        { name: 'Relacionamento Interpessoal', proficiency: 90, color: 'purple' }
      ]
    },
    {
      id: 'strategic-communication',
      name: 'Comunicação Estratégica',
      skills: [
        { name: 'Comunicação Executiva', proficiency: 90, color: 'orange' },
        { name: 'Apresentações para Liderança', proficiency: 85, color: 'red' },
        { name: 'Treinamentos Operacionais', proficiency: 85, color: 'blue' },
        { name: 'Redação Técnica', proficiency: 85, color: 'green' }
      ]
    }
  ],

  projects: [
    {
      id: "pfmea-optimization-system",
      title: "Sistema de Otimização PFMEA",
      description: "Desenvolvimento de metodologia para otimização de análises PFMEA em processos automotivos",
      longDescription: "Sistema completo para análise e otimização de PFMEAs, incluindo identificação automática de riscos, sugestões de controles preventivos e dashboard de monitoramento de indicadores de qualidade.",
      technologies: ["PFMEA", "Análise de Riscos", "Controles Preventivos"],
      githubUrl: "https://github.com/gilberto/pfmea-system",
      demoUrl: "https://pfmea-optimization.com",
      featured: true,
      category: "Quality Engineering",
      completedAt: "2024-01-15"
    },
    {
      id: "apqp-management-platform",
      title: "Plataforma de Gestão APQP",
      description: "Sistema integrado para gerenciamento completo de projetos APQP na indústria automotiva",
      longDescription: "Plataforma completa para gestão de projetos APQP, incluindo controle de fases, documentação técnica, aprovações de peças e integração com fornecedores.",
      technologies: ["APQP", "Gestão de Projetos", "Controle de Qualidade"],
      githubUrl: "https://github.com/gilberto/apqp-platform",
      demoUrl: "https://apqp-management.com",
      featured: true,
      category: "Process Engineering",
      completedAt: "2023-11-20"
    },
    {
      id: "quality-control-dashboard",
      title: "Dashboard de Controle de Qualidade",
      description: "Dashboard interativo para monitoramento de indicadores de qualidade em tempo real",
      longDescription: "Dashboard avançado para monitoramento de KPIs de qualidade, análise de tendências, alertas automáticos e relatórios de não-conformidades em processos de manufatura.",
      technologies: ["SPC", "Controle Estatístico", "Indicadores KPI"],
      githubUrl: "https://github.com/gilberto/quality-dashboard",
      demoUrl: "https://quality-control.com",
      featured: false,
      category: "Quality Management",
      completedAt: "2023-08-10"
    }
  ],

  experience: [
    {
      id: "automotive-senior-engineer",
      company: "Magna International",
      position: "Engenheiro de Processos Sênior",
      period: "2020 - Presente",
      description: "Desenvolvimento e implementação de PFMEAs, APQPs e controles de qualidade em processos de manufatura automotiva. Liderança de projetos de melhoria contínua e padronização de processos.",
      startDate: "2020-03-01"
    },
    {
      id: "quality-engineer",
      company: "Continental Automotive",
      position: "Engenheiro de Qualidade",
      period: "2017 - 2020",
      description: "Implementação de sistemas de gestão da qualidade, desenvolvimento de planos de controle e análise de riscos em processos produtivos. Especialização em FAST, OMP e SMP.",
      startDate: "2017-06-15",
      endDate: "2020-02-28"
    }
  ],

  education: [
    {
      id: "mechanical-engineering-degree",
      institution: "Universidade de São Paulo",
      degree: "Bacharelado",
      field: "Engenharia Mecânica",
      startDate: "2012-02-01",
      endDate: "2016-12-15",
      description: "Formação sólida em processos de manufatura, controle de qualidade, gestão de projetos e sistemas produtivos.",
      gpa: "8.5/10",
      achievements: [
        "Projeto de TCC em Otimização de Processos",
        "Monitor de Processos de Manufatura",
        "Participação em projetos de pesquisa"
      ]
    },
    {
      id: "quality-management-certification",
      institution: "AIAG - Automotive Industry Action Group",
      degree: "Certificação",
      field: "PFMEA & APQP Advanced",
      startDate: "2018-01-15",
      endDate: "2018-03-20",
      description: "Certificação avançada em metodologias PFMEA e APQP para indústria automotiva.",
      verificationUrl: "https://aiag.org/verification/example"
    }
  ],

  testimonials: [
    {
      id: "testimonial-1",
      name: "Maria Silva",
      position: "Gerente de Qualidade",
      company: "Magna International",
      content: "Gilberto é um engenheiro excepcional. Sua capacidade de transformar processos complexos em soluções eficientes e sua expertise em PFMEA são impressionantes. Trabalhar com ele elevou nossos padrões de qualidade.",
      date: "2024-01-15",
      linkedinUrl: "https://linkedin.com/in/mariasilva"
    },
    {
      id: "testimonial-2",
      name: "João Santos",
      position: "Diretor de Manufatura",
      company: "Continental Automotive",
      content: "Durante nosso tempo trabalhando juntos, Gilberto demonstrou não apenas excelência técnica em processos automotivos, mas também liderança e capacidade de implementar melhorias significativas. Recomendo sem hesitação.",
      date: "2023-12-10",
      linkedinUrl: "https://linkedin.com/in/joaosantos"
    },
    {
      id: "testimonial-3",
      name: "Ana Costa",
      position: "Engenheira de Processos",
      company: "Bosch Automotive",
      content: "A colaboração com Gilberto foi perfeita. Ele entende profundamente tanto os aspectos técnicos quanto os operacionais, criando soluções que realmente funcionam no chão de fábrica.",
      date: "2023-10-05",
      linkedinUrl: "https://linkedin.com/in/anacosta"
    }
  ],

  social: {
    github: "https://github.com/seuusuario",
    linkedin: "https://linkedin.com/in/seuusuario",
    twitter: "https://twitter.com/seuusuario",
    website: "https://seusite.com"
  },

  seo: {
    title: "Gilberto Nascimento - Engenheiro de Processos & Qualidade Automotiva",
    description: "Portfolio profissional de Gilberto Nascimento, engenheiro de processos especializado em PFMEA, APQP e sistemas de qualidade na indústria automotiva.",
    keywords: [
      "engenheiro de processos",
      "pfmea",
      "apqp",
      "qualidade automotiva",
      "controle de qualidade",
      "manufatura",
      "melhoria contínua",
      "portfolio",
      "são paulo"
    ],
    ogImage: "/og-image.jpg",
    twitterHandle: "@gilbertonascimento"
  }
};