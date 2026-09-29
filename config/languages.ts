export interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  isAvailable: boolean;
  region?: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', isAvailable: true },
  { code: 'lg', name: 'Luganda', nativeName: 'Oluganda', isAvailable: true, region: 'Central Uganda' },
  { code: 'xog', name: 'Lusoga', nativeName: 'Olusoga', isAvailable: false, region: 'Eastern Uganda (Busoga)' },
  { code: 'nyn', name: 'Runyankole-Rukiga', nativeName: 'Runyankole', isAvailable: false, region: 'Western Uganda' },
  { code: 'ach', name: 'Acholi / Luo', nativeName: 'Lwo', isAvailable: false, region: 'Northern Uganda' },
  { code: 'teo', name: 'Ateso', nativeName: 'Ateso', isAvailable: false, region: 'Teso / Eastern Uganda' },
  { code: 'lgg', name: 'Lugbara', nativeName: 'Lugbara ti', isAvailable: false, region: 'West Nile' },
  { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili', isAvailable: false, region: 'East Africa' },
];
