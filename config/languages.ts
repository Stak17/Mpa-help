export interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  isAvailable: boolean;
  region?: string;
  greeting?: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    isAvailable: true,
    greeting: 'Hello! How can I help you today?',
  },
  {
    code: 'lg',
    name: 'Luganda',
    nativeName: 'Oluganda',
    isAvailable: true,
    region: 'Central Uganda',
    greeting: 'Oli otyanno? Nkuyambe ntya leero?',
  },
  {
    code: 'xog',
    name: 'Lusoga',
    nativeName: 'Olusoga',
    isAvailable: true,
    region: 'Eastern Uganda (Busoga)',
    greeting: 'Mukezi otyeno? Nkuyambe ntya leero?',
  },
  {
    code: 'nyn',
    name: 'Runyankole-Rukiga',
    nativeName: 'Runyankole-Rukiga',
    isAvailable: true,
    region: 'Western Uganda',
    greeting: 'Agandi mutyo? Nkwambe nta erizooba?',
  },
  {
    code: 'ach',
    name: 'Acholi / Luo',
    nativeName: 'Leb Luo (Acholi)',
    isAvailable: true,
    region: 'Northern Uganda',
    greeting: 'Kop ango? Akonyi ningning tin?',
  },
  {
    code: 'teo',
    name: 'Ateso',
    nativeName: 'Ateso',
    isAvailable: true,
    region: 'Teso / Eastern Uganda',
    greeting: 'Yoga noi? Epone bo ani akonyio jo lolo?',
  },
  {
    code: 'lgg',
    name: 'Lugbara',
    nativeName: 'Lugbara ti',
    isAvailable: true,
    region: 'West Nile',
    greeting: 'Mi ngoni? Ma mini aza ngoni andro?',
  },
  {
    code: 'sw',
    name: 'Swahili',
    nativeName: 'Kiswahili',
    isAvailable: true,
    region: 'East Africa',
    greeting: 'Habari yako! Nikusaidie vipi leo?',
  },
];

export function getLanguageByCode(code: string): LanguageOption {
  return (
    SUPPORTED_LANGUAGES.find((l) => l.code === code) || SUPPORTED_LANGUAGES[0]
  );
}

export function getLanguageName(code: string): string {
  const match = SUPPORTED_LANGUAGES.find((l) => l.code === code);
  return match ? match.name : 'English';
}
