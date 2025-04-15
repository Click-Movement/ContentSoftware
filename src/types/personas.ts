// Define persona types for the content rewriter

export type PersonaType = 
  | 'rush_limbaugh'
  | 'charlie_kirk'
  | 'larry_elder'
  | 'glenn_beck'
  | 'laura_loomer'
  | 'tomi_lahren';

export interface Persona {
  id: PersonaType;
  name: string;
  description: string;
}

export const personas: Persona[] = [
  {
    id: 'rush_limbaugh',
    name: 'Rush Limbaugh',
    description: 'Provocative and passionate radio host known for his bold conservative commentary'
  },
  {
    id: 'charlie_kirk',
    name: 'Charlie Kirk',
    description: 'Young conservative activist and founder of Turning Point USA'
  },
  {
    id: 'larry_elder',
    name: 'Larry Elder',
    description: 'Radio host and political commentator known as "The Sage from South Central"'
  },
  {
    id: 'glenn_beck',
    name: 'Glenn Beck',
    description: 'Radio host and media entrepreneur with a focus on constitutional principles'
  },
  {
    id: 'laura_loomer',
    name: 'Laura Loomer',
    description: 'Controversial activist and political commentator known for provocative statements'
  },
  {
    id: 'tomi_lahren',
    name: 'Tomi Lahren',
    description: 'Outspoken young conservative commentator known for her "Final Thoughts" segments'
  }
];

export function getPersonaById(id: PersonaType): Persona {
  return personas.find(persona => persona.id === id) || personas[0];
}
