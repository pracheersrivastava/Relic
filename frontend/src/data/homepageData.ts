// Dummy data for homepage - NO BACKEND, NO API

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

export const banners: Banner[] = [
  {
    id: 'banner-1',
    title: 'Coursera Plus',
    subtitle: 'Next level skills. New Year savings.',
    description: 'Get all the skills for one low price with 10,000+ top courses from Microsoft, Google, IBM, and more.',
    ctaText: 'Save on Coursera Plus',
    bgColor: '#0056D2',
    textColor: '#FFFFFF',
  },
  {
    id: 'banner-2',
    title: 'Coursera for Teams',
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

export const trendingCourses: HomepageCourse[] = [
  {
    id: 'trend-1',
    title: 'Google Data Analytics',
    provider: 'Google',
    providerLogo: 'G',
    image: '/placeholder-course.jpg',
    rating: 4.8,
    reviewCount: '125K',
    type: 'Professional Certificate',
  },
  {
    id: 'trend-2',
    title: 'IBM Data Science',
    provider: 'IBM',
    providerLogo: 'IBM',
    image: '/placeholder-course.jpg',
    rating: 4.6,
    reviewCount: '89K',
    type: 'Professional Certificate',
  },
];

export const popularCourses: HomepageCourse[] = [
  {
    id: 'pop-1',
    title: 'Microsoft Power BI Data Analyst',
    provider: 'Microsoft',
    providerLogo: '⊞',
    image: '/placeholder-course.jpg',
    rating: 4.6,
    reviewCount: '34K',
    type: 'Professional Certificate',
  },
  {
    id: 'pop-2',
    title: 'IBM Generative AI Engineering',
    provider: 'IBM',
    providerLogo: 'IBM',
    image: '/placeholder-course.jpg',
    rating: 4.6,
    reviewCount: '12K',
    type: 'Professional Certificate',
  },
];

export const newCourses: HomepageCourse[] = [
  {
    id: 'new-1',
    title: 'Generative AI for Everyone',
    provider: 'DeepLearning.AI',
    providerLogo: 'DL',
    image: '/placeholder-course.jpg',
    rating: 4.9,
    reviewCount: '8K',
    type: 'Course',
  },
  {
    id: 'new-2',
    title: 'Google AI Essentials',
    provider: 'Google',
    providerLogo: 'G',
    image: '/placeholder-course.jpg',
    rating: 4.8,
    reviewCount: '5K',
    type: 'Course',
  },
];

export const aiSkillsCourses: HomepageCourse[] = [
  {
    id: 'ai-1',
    title: 'AI For Everyone',
    provider: 'DeepLearning.AI',
    providerLogo: 'DL',
    image: '/placeholder-course.jpg',
    rating: 4.8,
    reviewCount: '210K',
    type: 'Course',
  },
  {
    id: 'ai-2',
    title: 'ChatGPT Advanced Data Analysis',
    provider: 'Vanderbilt University',
    providerLogo: 'V',
    image: '/placeholder-course.jpg',
    rating: 4.7,
    reviewCount: '18K',
    type: 'Course',
  },
];

export const categories = [
  { id: 'cat-1', name: 'Launch a new career', icon: '📈' },
  { id: 'cat-2', name: 'Gain in-demand skills', icon: '🎯' },
  { id: 'cat-3', name: 'Earn a degree', icon: '🎓' },
];
