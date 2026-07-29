export type HeroBgType =
  | 'gradient'
  | 'poster'
  | 'ken-burns'
  | 'cards'
  | 'charts'
  | 'network';

export type HeroAccent = 'default' | 'cyan' | 'pink';

export interface HeroCTAConfig {
  label: string;
  href: string;
}

export interface HeroContentConfig {
  badge?: string;
  iconName?: string;
  title: string;
  titleClass?: string;
  subtitle: string;
  cta?: HeroCTAConfig;
}

export type HeroDecoration = 'cards' | 'charts' | 'network' | 'none';

export interface HeroBackgroundConfig {
  type: HeroBgType;
  src?: string;
  images?: string[];
  poster?: string;
  decoration?: HeroDecoration;
}

export interface HeroConfig {
  background: HeroBackgroundConfig;
  content: HeroContentConfig;
  accent?: HeroAccent;
}
