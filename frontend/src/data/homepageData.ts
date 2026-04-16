// Reusable types for homepage components

export interface HomepageCourse {
  id: string;
  title: string;
  provider: string;
  providerLogo: string;
  image: string;
  rating: number;
  reviewCount: string;
  type: 'Professional Certificate' | 'Course' | 'Specialization';
  price?: number;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  ctaText: string;
  bgColor: string;
  textColor: string;
}

// Banner data for hero section
export const banners: Banner[] = [
  {
    id: 'banner-1',
    title: 'Relic Plus',
    subtitle: 'Next level skills. New Year savings.',
    description: 'Get all the skills for one low price with 10,000+ top courses from Microsoft, Google, IBM, and more.',
    ctaText: 'Save on Relic Plus',
    bgColor: '#0056D2',
    textColor: '#FFFFFF',
  },
  {
    id: 'banner-2',
    title: 'Relic for Teams',
    subtitle: 'Train your team in top skills',
    description: 'Join 3,700+ teams worldwide and get 50% off team training.',
    ctaText: 'Save 50% on Teams',
    bgColor: '#1E1E1E',
    textColor: '#FFFFFF',
  },
  {
    id: 'banner-3',
    title: 'Start Learning Today',
    subtitle: 'Grow your career with in-demand skills',
    description: 'Get certificates from top universities and companies.',
    ctaText: 'Explore Courses',
    bgColor: '#F8F9FA',
    textColor: '#1F1F1F',
  },
];

// Partner logos for display
export const partners = [
  { name: 'Google', logo: 'G' },
  { name: 'IBM', logo: 'IBM' },
  { name: 'Microsoft', logo: '⊞' },
  { name: 'University of Illinois', logo: 'UI' },
  { name: 'OpenAI', logo: 'OAI' },
  { name: 'Anthropic', logo: 'A' },
  { name: 'DeepLearning.AI', logo: 'DL' },
  { name: 'Stanford University', logo: 'S' },
  { name: 'University of Pennsylvania', logo: 'UP' },
  { name: 'Meta', logo: 'M' },
];

// Category cards for homepage
export const categories = [
  { id: 'cat-1', name: 'Launch a new career', icon: '📈' },
  { id: 'cat-2', name: 'Gain in-demand skills', icon: '🎯' },
  { id: 'cat-3', name: 'Earn a degree', icon: '🎓' },
];
