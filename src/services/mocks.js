export const mockAnalysis = {
  case_summary:
    'Une personne aurait pris un bien appartenant à une autre personne sans son autorisation.',
  possible_qualifications: [
    {
      name: 'Vol',
      relevance: 'high',
      sources: [
        { document: 'Code pénal', article: 'XXX', article_id: 'cp-1' },
      ],
    },
    {
      name: 'Vol accompagné de circonstances particulières',
      relevance: 'medium',
      sources: [
        { document: 'Code pénal', article: 'XXX', article_id: 'cp-2' },
      ],
    },
  ],
  scenarios: [
    {
      title: 'Scénario A',
      description:
        'Les éléments fournis correspondent à certaines conditions du texte X.',
    },
    {
      title: 'Scénario B',
      description:
        'Si une violence est établie, une autre disposition pourrait devenir pertinente.',
    },
    {
      title: 'Scénario C',
      description:
        "Si l'absence d'autorisation n'est pas établie, la qualification pourrait différer.",
    },
  ],
  limitations: [
    "Informations insuffisantes sur l'usage éventuel de la violence.",
  ],
  clarification_questions: ['Une violence a-t-elle été utilisée ?'],
}

export const mockArticles = [
  {
    id: 'cp-1',
    document_title: 'Code pénal haïtien',
    document: 'Code pénal',
    article_number: 'XXX',
    title: 'Du vol',
    chapter: 'Chapitre à compléter',
    content: "Texte officiel de l'article, copié depuis le corpus vérifié.",
    file_url: '#',
    relevance: 'high',
  },
  {
    id: 'cp-2',
    document_title: 'Code pénal haïtien',
    document: 'Code pénal',
    article_number: 'XXX',
    title: 'Du vol accompagné de circonstances particulières',
    chapter: 'Chapitre à compléter',
    content: "Texte officiel de l'article, copié depuis le corpus vérifié.",
    file_url: '#',
    relevance: 'medium',
  },
  {
    id: 'cc-1',
    document_title: 'Code civil haïtien',
    document: 'Code civil',
    article_number: 'XXX',
    title: 'Des obligations et des contrats',
    chapter: 'Chapitre à compléter',
    content: "Texte officiel de l'article, copié depuis le corpus vérifié.",
    file_url: '#',
    relevance: 'low',
  },
  {
    id: 'const-1',
    document_title: 'Constitution haïtienne',
    document: 'Constitution',
    article_number: 'XXX',
    title: 'Droits et garanties fondamentales',
    chapter: 'Chapitre à compléter',
    content: "Texte officiel de l'article, copié depuis le corpus vérifié.",
    file_url: '#',
    relevance: 'low',
  },
]