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

  about: "Engenheiro com mais de 8 anos de experiência em qualidade e processos na indústria automotiva. Especializado em PFMEA, APQP e implementação de controles de qualidade em ambientes de manufatura.\n\nMinha trajetória profissional é marcada pela paixão em transformar desafios complexos em soluções eficientes e sustentáveis. Acredito que a excelência operacional nasce da combinação entre metodologia rigorosa e visão estratégica, sempre com foco na prevenção de riscos e na otimização contínua de processos. Ao longo dos anos, desenvolvi uma abordagem única que integra conhecimento técnico profundo com habilidades de comunicação e liderança, permitindo-me não apenas identificar oportunidades de melhoria, mas também engajar equipes na implementação de mudanças duradouras.",

  skills: [
    "PFMEA", "APQP", "Plano de Controle", "FAST", "OMP", "SMP",
    "Mapeamento de Processos", "Controles Visuais", "Melhoria Contínua",
    "Padronização de Processos", "Gestão de Projetos", "Comunicação Estratégica",
    "Redação Técnica", "Análise de Riscos"
  ],

  enhancedSkills: [
    {
      id: 'pfmea',
      name: 'PFMEA',
      category: 'Qualidade e Processos Automotivos',
      description: 'Process Failure Mode and Effects Analysis - Metodologia avançada para análise de riscos em processos de manufatura.',
      detailedDescription: [
        'Como especialista em PFMEA, Gilberto Nascimento domina completamente esta metodologia crítica para a indústria automotiva. Sua expertise abrange desde a identificação sistemática de modos de falha potenciais até a implementação de controles preventivos eficazes.',
        'Em seus mais de 8 anos de experiência, desenvolveu uma abordagem única que combina rigor técnico com praticidade operacional. Gilberto conduz análises PFMEA que não apenas atendem aos padrões AIAG e VDA, mas também se traduzem em melhorias tangíveis no chão de fábrica.',
        'Sua metodologia inclui workshops colaborativos com equipes multidisciplinares, onde facilita discussões técnicas complexas de forma clara e objetiva. Utiliza ferramentas digitais avançadas para documentação e rastreabilidade, garantindo que cada análise seja um documento vivo que evolui com o processo.',
        'Os resultados de seu trabalho incluem reduções significativas de riscos operacionais, com projetos que alcançaram até 45% de diminuição em não-conformidades e 60% de redução no tempo de análise através de metodologias otimizadas que desenvolveu.'
      ],
      usageExamples: [
        'Liderou análises PFMEA para linhas de produção automotiva com mais de 200 operações',
        'Desenvolveu templates customizados que reduziram o tempo de análise em 60%',
        'Treinou mais de 50 engenheiros em metodologia PFMEA avançada'
      ],
      expertiseLevel: 'Specialist',
      yearsOfExperience: 8,
      keyProjects: ['Sistema de Otimização PFMEA', 'Implementação PFMEA Digital']
    },
    {
      id: 'apqp',
      name: 'APQP',
      category: 'Qualidade e Processos Automotivos',
      description: 'Advanced Product Quality Planning - Gestão completa do ciclo de desenvolvimento de produtos automotivos.',
      detailedDescription: [
        'Gilberto é reconhecido como um especialista em APQP, dominando todas as fases do Advanced Product Quality Planning desde o conceito inicial até a produção em série. Sua experiência abrange o gerenciamento completo de projetos automotivos complexos.',
        'Desenvolveu uma metodologia própria que integra ferramentas digitais com processos tradicionais APQP, resultando em maior eficiência e rastreabilidade. Sua abordagem inclui dashboards em tempo real que permitem acompanhamento preciso de cada gate do projeto.',
        'Como líder de projetos APQP, coordena equipes multifuncionais incluindo engenharia, qualidade, produção e fornecedores. Sua habilidade de comunicação técnica permite traduzir requisitos complexos em ações práticas para todas as partes interessadas.',
        'Seus projetos APQP são reconhecidos pela alta taxa de aprovação first-time (85%) e redução média de 30% no tempo de desenvolvimento, mantendo sempre os mais altos padrões de qualidade exigidos pela indústria automotiva.'
      ],
      usageExamples: [
        'Gerenciou mais de 120 projetos APQP com taxa de sucesso de 98%',
        'Implementou sistema digital que reduziu tempo de desenvolvimento em 30%',
        'Coordenou aprovações de peças com fornecedores globais'
      ],
      expertiseLevel: 'Specialist',
      yearsOfExperience: 8,
      keyProjects: ['Plataforma de Gestão APQP', 'APQP Digital Integration']
    },
    {
      id: 'plano-controle',
      name: 'Plano de Controle',
      category: 'Qualidade e Processos Automotivos',
      description: 'Desenvolvimento e implementação de planos de controle robustos para processos de manufatura automotiva.',
      detailedDescription: [
        'A expertise de Gilberto em Planos de Controle é fundamental para garantir a qualidade consistente em processos de manufatura. Ele desenvolve documentos técnicos que servem como guia definitivo para controle de qualidade em produção.',
        'Sua abordagem sistemática inclui a identificação precisa de características críticas, definição de métodos de controle apropriados e estabelecimento de frequências de inspeção otimizadas. Cada plano é desenvolvido considerando tanto aspectos técnicos quanto operacionais.',
        'Gilberto integra os planos de controle com sistemas digitais de coleta de dados, permitindo monitoramento em tempo real e análises estatísticas avançadas. Isso resulta em detecção precoce de desvios e ações corretivas mais eficazes.',
        'Seus planos de controle são reconhecidos pela clareza e praticidade, sendo facilmente implementados por operadores de linha. A taxa de conformidade dos processos sob seus planos atinge consistentemente 98% ou superior.'
      ],
      usageExamples: [
        'Desenvolveu planos de controle para mais de 50 processos críticos',
        'Implementou controles estatísticos que aumentaram conformidade para 98%',
        'Treinou equipes operacionais em execução de planos de controle'
      ],
      expertiseLevel: 'Expert',
      yearsOfExperience: 8,
      keyProjects: ['Sistema de Controle Digital', 'Otimização de Planos de Controle']
    },
    {
      id: 'mapeamento-processos',
      name: 'Mapeamento de Processos',
      category: 'Análise e Melhoria de Processos',
      description: 'Análise detalhada e otimização de fluxos de processos industriais com foco em eficiência e qualidade.',
      detailedDescription: [
        'Gilberto possui uma habilidade excepcional para visualizar e documentar processos complexos de manufatura. Sua metodologia de mapeamento vai além da simples documentação, identificando oportunidades de melhoria e otimização.',
        'Utiliza ferramentas avançadas de mapeamento digital combinadas com observação direta no chão de fábrica. Essa abordagem híbrida garante que os mapas de processo reflitam a realidade operacional e sejam verdadeiramente úteis para as equipes.',
        'Seus mapeamentos incluem análise de valor agregado, identificação de desperdícios e propostas de melhorias baseadas em princípios Lean. Cada processo mapeado resulta em recomendações práticas e implementáveis.',
        'Os resultados de seus projetos de mapeamento incluem reduções médias de 25% no tempo de ciclo e eliminação de até 40% de atividades que não agregam valor, sempre mantendo ou melhorando os padrões de qualidade.'
      ],
      usageExamples: [
        'Mapeou mais de 100 processos industriais complexos',
        'Identificou melhorias que resultaram em 25% de redução de tempo de ciclo',
        'Desenvolveu metodologia própria de mapeamento digital'
      ],
      expertiseLevel: 'Expert',
      yearsOfExperience: 7,
      keyProjects: ['Otimização de Linha de Produção', 'Mapeamento Digital de Processos']
    },
    {
      id: 'controles-visuais',
      name: 'Controles Visuais',
      category: 'Análise e Melhoria de Processos',
      description: 'Implementação de sistemas visuais para controle e monitoramento de processos produtivos.',
      detailedDescription: [
        'A expertise de Gilberto em controles visuais transforma ambientes de produção complexos em espaços organizados e facilmente gerenciáveis. Ele desenvolve sistemas visuais que comunicam instantaneamente o status de processos e equipamentos.',
        'Sua abordagem inclui desde painéis simples de status até dashboards digitais avançados. Cada solução é customizada para as necessidades específicas da operação, considerando o perfil dos usuários e as características do ambiente.',
        'Gilberto integra controles visuais com sistemas de gestão da qualidade, criando loops de feedback que permitem ações corretivas rápidas. Seus sistemas visuais não apenas informam, mas também orientam ações específicas.',
        'As implementações de controles visuais sob sua liderança resultam em melhorias significativas na eficiência operacional, com reduções de até 50% no tempo de identificação de problemas e 70% de melhoria na detecção precoce de desvios.'
      ],
      usageExamples: [
        'Implementou controles visuais em 15 linhas de produção',
        'Desenvolveu dashboards que reduziram tempo de detecção de problemas em 50%',
        'Treinou operadores em uso e manutenção de controles visuais'
      ],
      expertiseLevel: 'Expert',
      yearsOfExperience: 6,
      keyProjects: ['Dashboard de Controle de Qualidade', 'Sistema Visual de Gestão']
    },
    {
      id: 'gestao-projetos',
      name: 'Gestão de Projetos',
      category: 'Gestão e Liderança',
      description: 'Liderança e coordenação de projetos complexos de melhoria e implementação na indústria automotiva.',
      detailedDescription: [
        'Como gestor de projetos certificado PMP, Gilberto combina metodologias tradicionais com abordagens ágeis para entregar resultados excepcionais. Sua experiência abrange projetos desde pequenas melhorias até implementações complexas de sistemas.',
        'Desenvolve cronogramas detalhados e realistas, sempre considerando interdependências e riscos potenciais. Sua habilidade de comunicação permite manter todas as partes interessadas alinhadas e engajadas durante todo o ciclo do projeto.',
        'Utiliza ferramentas digitais avançadas para acompanhamento e controle, incluindo dashboards executivos que fornecem visibilidade em tempo real do progresso. Isso permite tomadas de decisão rápidas e ajustes proativos quando necessário.',
        'Seus projetos são reconhecidos pela alta taxa de sucesso (95%) e entrega dentro do prazo e orçamento. A satisfação das partes interessadas é consistentemente alta, refletindo sua abordagem colaborativa e orientada a resultados.'
      ],
      usageExamples: [
        'Liderou mais de 80 projetos de melhoria com taxa de sucesso de 95%',
        'Gerenciou orçamentos de projetos superiores a R$ 2 milhões',
        'Coordenou equipes multidisciplinares de até 25 pessoas'
      ],
      expertiseLevel: 'Advanced',
      yearsOfExperience: 6,
      keyProjects: ['Implementação Sistema PFMEA', 'Projeto Lean Manufacturing']
    },
    {
      id: 'comunicacao-estrategica',
      name: 'Comunicação Estratégica',
      category: 'Comunicação Estratégica',
      description: 'Comunicação técnica eficaz com diferentes níveis hierárquicos e stakeholders da organização.',
      detailedDescription: [
        'Gilberto possui uma habilidade rara de traduzir conceitos técnicos complexos em linguagem acessível para diferentes audiências. Seja apresentando para a alta direção ou treinando operadores, adapta sua comunicação para máxima efetividade.',
        'Desenvolve apresentações executivas que combinam dados técnicos com insights estratégicos, permitindo que líderes tomem decisões informadas. Suas apresentações são conhecidas pela clareza visual e narrativa convincente.',
        'Como facilitador de workshops e reuniões técnicas, cria ambientes colaborativos onde diferentes perspectivas são valorizadas. Sua habilidade de mediação resolve conflitos e alinha equipes em torno de objetivos comuns.',
        'Seus treinamentos operacionais são altamente eficazes, com taxas de retenção superiores a 90%. Utiliza metodologias ativas de aprendizagem que garantem que o conhecimento seja realmente aplicado na prática.'
      ],
      usageExamples: [
        'Apresentou mais de 200 relatórios para alta direção',
        'Conduziu treinamentos para mais de 500 colaboradores',
        'Facilitou workshops de melhoria com equipes multidisciplinares'
      ],
      expertiseLevel: 'Advanced',
      yearsOfExperience: 8,
      keyProjects: ['Programa de Treinamento PFMEA', 'Workshop de Melhoria Contínua']
    },
    {
      id: 'fast',
      name: 'FAST',
      category: 'Qualidade e Processos Automotivos',
      description: 'Function Analysis System Technique - Análise funcional sistemática para otimização de processos.',
      detailedDescription: [
        'Gilberto utiliza a metodologia FAST para análise funcional detalhada de processos e produtos, identificando funções essenciais e oportunidades de otimização. Sua expertise permite decomposição sistemática de sistemas complexos.',
        'Aplica FAST em projetos de redução de custos e melhoria de eficiência, sempre mantendo ou melhorando a qualidade. Sua abordagem estruturada garante que todas as funções críticas sejam preservadas durante otimizações.',
        'Conduz workshops FAST com equipes multidisciplinares, facilitando análises colaborativas que resultam em soluções inovadoras. Sua experiência permite identificar rapidamente funções redundantes ou desnecessárias.',
        'Os projetos utilizando FAST sob sua liderança alcançaram reduções médias de 20% em custos operacionais mantendo 100% da funcionalidade original.'
      ],
      usageExamples: [
        'Aplicou FAST em 25 projetos de otimização de processos',
        'Reduziu custos operacionais em 20% mantendo qualidade',
        'Treinou equipes em metodologia FAST'
      ],
      expertiseLevel: 'Advanced',
      yearsOfExperience: 5,
      keyProjects: ['Otimização de Custos FAST', 'Análise Funcional de Processos']
    },
    {
      id: 'omp',
      name: 'OMP',
      category: 'Qualidade e Processos Automotivos',
      description: 'Operational Management Process - Gestão operacional de processos produtivos automotivos.',
      detailedDescription: [
        'Como especialista em OMP, Gilberto gerencia operações complexas de manufatura automotiva, garantindo eficiência e qualidade consistentes. Sua abordagem integra pessoas, processos e tecnologia.',
        'Desenvolve sistemas de gestão operacional que proporcionam visibilidade completa dos processos produtivos. Utiliza indicadores-chave de performance (KPIs) para monitoramento contínuo e tomada de decisões baseada em dados.',
        'Sua expertise em OMP inclui gestão de mudanças operacionais, implementação de melhorias e coordenação de equipes de produção. Sempre foca em sustentabilidade das melhorias implementadas.',
        'Os processos sob sua gestão OMP mantêm consistentemente indicadores superiores à média da indústria, com eficiência operacional acima de 95% e índices de qualidade que excedem especificações.'
      ],
      usageExamples: [
        'Gerenciou operações com eficiência superior a 95%',
        'Implementou sistemas OMP em 10 linhas de produção',
        'Coordenou equipes operacionais de até 100 pessoas'
      ],
      expertiseLevel: 'Advanced',
      yearsOfExperience: 5,
      keyProjects: ['Sistema OMP Digital', 'Otimização Operacional']
    },
    {
      id: 'smp',
      name: 'SMP',
      category: 'Qualidade e Processos Automotivos',
      description: 'Statistical Management Process - Gestão estatística de processos para controle de qualidade.',
      detailedDescription: [
        'Gilberto domina técnicas avançadas de SMP para controle estatístico de processos, utilizando ferramentas matemáticas para garantir qualidade consistente. Sua expertise inclui análise de capacidade e controle de variabilidade.',
        'Implementa sistemas de monitoramento estatístico em tempo real que detectam desvios antes que afetem a qualidade do produto. Utiliza software especializado para análises complexas e geração de relatórios automatizados.',
        'Sua abordagem SMP inclui treinamento de equipes operacionais em conceitos estatísticos básicos, garantindo que todos compreendam a importância do controle estatístico na qualidade final.',
        'Os processos sob controle SMP de Gilberto apresentam índices Cpk consistentemente superiores a 1,67, demonstrando excelente capacidade de processo e controle de variabilidade.'
      ],
      usageExamples: [
        'Implementou SMP em 30 processos críticos com Cpk > 1,67',
        'Desenvolveu dashboards estatísticos em tempo real',
        'Treinou operadores em conceitos de controle estatístico'
      ],
      expertiseLevel: 'Advanced',
      yearsOfExperience: 5,
      keyProjects: ['Controle Estatístico Digital', 'Sistema SMP Avançado']
    },
    {
      id: 'melhoria-continua',
      name: 'Melhoria Contínua',
      category: 'Análise e Melhoria de Processos',
      description: 'Implementação de cultura e práticas de melhoria contínua baseadas em metodologias Lean e Six Sigma.',
      detailedDescription: [
        'Gilberto é um catalisador de mudanças positivas, implementando cultura de melhoria contínua em organizações. Sua abordagem combina metodologias Lean, Six Sigma e ferramentas próprias desenvolvidas ao longo de sua experiência.',
        'Desenvolve programas estruturados de melhoria que engajam colaboradores de todos os níveis. Utiliza técnicas de gamificação e reconhecimento para manter alta motivação e participação nas iniciativas.',
        'Sua metodologia inclui identificação sistemática de oportunidades, priorização baseada em impacto e facilidade de implementação, e acompanhamento rigoroso de resultados. Cada melhoria é documentada e padronizada.',
        'Os programas de melhoria contínua sob sua liderança geraram economias superiores a R$ 5 milhões em projetos diversos, com mais de 80% das melhorias sustentadas após 12 meses de implementação.'
      ],
      usageExamples: [
        'Liderou programas que geraram R$ 5 milhões em economias',
        'Implementou mais de 200 melhorias sustentáveis',
        'Engajou mais de 300 colaboradores em iniciativas de melhoria'
      ],
      expertiseLevel: 'Expert',
      yearsOfExperience: 8,
      keyProjects: ['Programa Kaizen Corporativo', 'Sistema de Melhoria Digital']
    },
    {
      id: 'analise-riscos',
      name: 'Análise de Riscos',
      category: 'Qualidade e Processos Automotivos',
      description: 'Identificação, avaliação e mitigação de riscos em processos industriais e projetos.',
      detailedDescription: [
        'Como especialista em análise de riscos, Gilberto desenvolve metodologias robustas para identificação proativa de riscos potenciais em processos e projetos. Sua abordagem sistemática previne problemas antes que ocorram.',
        'Utiliza ferramentas quantitativas e qualitativas para avaliação de riscos, incluindo análise de árvore de falhas, análise de modo de falha e matrizes de risco customizadas. Cada análise resulta em planos de mitigação específicos.',
        'Sua expertise inclui análise de riscos financeiros, operacionais, de qualidade e de segurança. Desenvolve cenários de contingência e planos de resposta que garantem continuidade operacional mesmo em situações adversas.',
        'Os projetos com análise de riscos conduzida por Gilberto apresentam 60% menos problemas não planejados e 40% de redução no tempo de resolução quando problemas ocorrem, demonstrando a eficácia de sua abordagem preventiva.'
      ],
      usageExamples: [
        'Conduziu análises de risco para mais de 50 projetos críticos',
        'Desenvolveu metodologia própria de análise de riscos',
        'Reduziu problemas não planejados em 60% através de análise preventiva'
      ],
      expertiseLevel: 'Expert',
      yearsOfExperience: 8,
      keyProjects: ['Sistema de Gestão de Riscos', 'Análise de Riscos PFMEA']
    }
  ],

  skillCategories: [
    {
      id: 'automotive-quality',
      name: 'Qualidade e Processos Automotivos',
      skills: [
        { name: 'PFMEA', proficiency: 100, color: 'green' },
        { name: 'APQP', proficiency: 100, color: 'green' },
        { name: 'Plano de Controle', proficiency: 100, color: 'green' },
        { name: 'FAST', proficiency: 85, color: 'green' },
        { name: 'OMP', proficiency: 85, color: 'green' },
        { name: 'SMP', proficiency: 85, color: 'green' }
      ]
    },
    {
      id: 'process-analysis',
      name: 'Análise e Melhoria de Processos',
      skills: [
        { name: 'Mapeamento de Processos', proficiency: 100, color: 'green' },
        { name: 'Controles Visuais', proficiency: 100, color: 'green' },
        { name: 'Melhoria Contínua', proficiency: 100, color: 'green' },
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
      institution: "Universidade de São Paulo (USP)",
      degree: "Bacharelado",
      field: "Engenharia Mecânica",
      startDate: "2012-02-01",
      endDate: "2016-12-15",
      description: "Formação sólida em processos de manufatura, controle de qualidade, gestão de projetos e sistemas produtivos. Foco em metodologias de qualidade aplicadas à indústria automotiva, com ênfase em análise de riscos e otimização de processos industriais.",
      gpa: "8.5/10",
      achievements: [
        "Projeto de TCC em Otimização de Processos Industriais com foco em PFMEA",
        "Monitor da disciplina de Processos de Manufatura por 2 semestres",
        "Participação em projetos de pesquisa em Qualidade Industrial e Lean Manufacturing",
        "Membro ativo do Centro Acadêmico de Engenharia Mecânica",
        "Certificado de Excelência Acadêmica em Controle de Qualidade"
      ]
    },
    {
      id: "quality-management-certification",
      institution: "AIAG - Automotive Industry Action Group",
      degree: "Certificação Profissional",
      field: "PFMEA & APQP Advanced",
      startDate: "2018-01-15",
      endDate: "2018-03-20",
      description: "Certificação avançada em metodologias PFMEA (Process Failure Mode and Effects Analysis) e APQP (Advanced Product Quality Planning) para indústria automotiva, seguindo padrões internacionais AIAG e VDA. Capacitação completa em análise de riscos, controles preventivos e gestão de qualidade em processos de manufatura.",
      verificationUrl: "https://aiag.org/verification/example"
    },
    {
      id: "lean-six-sigma-certification",
      institution: "Instituto Brasileiro de Qualidade e Produtividade (IBQP)",
      degree: "Certificação Green Belt",
      field: "Lean Six Sigma",
      startDate: "2019-03-01",
      endDate: "2019-06-15",
      description: "Certificação Green Belt em metodologia Lean Six Sigma, com foco em eliminação de desperdícios, melhoria contínua e otimização de processos. Aplicação prática de ferramentas DMAIC, análise estatística e gestão de projetos de melhoria.",
      achievements: [
        "Projeto de certificação resultou em 25% de redução de tempo de ciclo",
        "Implementação de controles visuais em linha de produção",
        "Treinamento de equipes operacionais em conceitos Lean"
      ]
    },
    {
      id: "project-management-certification",
      institution: "Project Management Institute (PMI)",
      degree: "Certificação PMP",
      field: "Gerenciamento de Projetos",
      startDate: "2021-01-10",
      endDate: "2021-04-20",
      description: "Certificação Project Management Professional (PMP) reconhecida internacionalmente, demonstrando competência em liderança de projetos, gestão de equipes e aplicação de metodologias ágeis e tradicionais de gerenciamento de projetos.",
      verificationUrl: "https://pmi.org/verification/example"
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
    linkedin: "https://linkedin.com/in/gilberto-nascimento",
    twitter: "https://twitter.com/gilberto_eng"
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