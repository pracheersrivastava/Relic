export interface Lesson {
  id: string;
  title: string;
  duration: string;
  status: 'completed' | 'current' | 'locked';
}

export interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  progress: number;
  status: 'not-started' | 'in-progress' | 'completed';
  modules: Module[];
}

export const courses: Course[] = [
  {
    id: 'course-1',
    title: 'Introduction to machine learning',
    description: 'Learn the fundamentals of machine learning and AI concepts.',
    progress: 75,
    status: 'in-progress',
    modules: [
      {
        id: 'module-1',
        title: 'Module 1: Getting started',
        lessons: [
          { id: 'lesson-1-1', title: 'What is machine learning?', duration: '12 min', status: 'completed' },
          { id: 'lesson-1-2', title: 'Types of machine learning', duration: '18 min', status: 'completed' },
          { id: 'lesson-1-3', title: 'Setting up your environment', duration: '15 min', status: 'completed' },
        ],
      },
      {
        id: 'module-2',
        title: 'Module 2: Supervised learning',
        lessons: [
          { id: 'lesson-2-1', title: 'Linear regression basics', duration: '20 min', status: 'completed' },
          { id: 'lesson-2-2', title: 'Classification algorithms', duration: '25 min', status: 'current' },
          { id: 'lesson-2-3', title: 'Model evaluation', duration: '18 min', status: 'locked' },
        ],
      },
      {
        id: 'module-3',
        title: 'Module 3: Unsupervised learning',
        lessons: [
          { id: 'lesson-3-1', title: 'Clustering techniques', duration: '22 min', status: 'locked' },
          { id: 'lesson-3-2', title: 'Dimensionality reduction', duration: '20 min', status: 'locked' },
          { id: 'lesson-3-3', title: 'Practical applications', duration: '30 min', status: 'locked' },
        ],
      },
    ],
  },
  {
    id: 'course-2',
    title: 'Web development fundamentals',
    description: 'Build modern websites with HTML, CSS, and JavaScript.',
    progress: 100,
    status: 'completed',
    modules: [
      {
        id: 'module-1',
        title: 'Module 1: HTML basics',
        lessons: [
          { id: 'lesson-1-1', title: 'Introduction to HTML', duration: '10 min', status: 'completed' },
          { id: 'lesson-1-2', title: 'HTML elements and structure', duration: '15 min', status: 'completed' },
        ],
      },
      {
        id: 'module-2',
        title: 'Module 2: CSS styling',
        lessons: [
          { id: 'lesson-2-1', title: 'CSS selectors', duration: '12 min', status: 'completed' },
          { id: 'lesson-2-2', title: 'Box model and layout', duration: '18 min', status: 'completed' },
        ],
      },
    ],
  },
  {
    id: 'course-3',
    title: 'Data science with Python',
    description: 'Analyze data and create visualizations using Python libraries.',
    progress: 0,
    status: 'not-started',
    modules: [
      {
        id: 'module-1',
        title: 'Module 1: Python basics',
        lessons: [
          { id: 'lesson-1-1', title: 'Python syntax', duration: '15 min', status: 'locked' },
          { id: 'lesson-1-2', title: 'Data types and variables', duration: '20 min', status: 'locked' },
        ],
      },
      {
        id: 'module-2',
        title: 'Module 2: Data analysis',
        lessons: [
          { id: 'lesson-2-1', title: 'Introduction to Pandas', duration: '25 min', status: 'locked' },
          { id: 'lesson-2-2', title: 'Data visualization', duration: '22 min', status: 'locked' },
        ],
      },
    ],
  },
  {
    id: 'course-4',
    title: 'Cloud computing essentials',
    description: 'Understand cloud infrastructure and deployment strategies.',
    progress: 30,
    status: 'in-progress',
    modules: [
      {
        id: 'module-1',
        title: 'Module 1: Cloud fundamentals',
        lessons: [
          { id: 'lesson-1-1', title: 'What is cloud computing?', duration: '12 min', status: 'completed' },
          { id: 'lesson-1-2', title: 'Cloud service models', duration: '18 min', status: 'current' },
          { id: 'lesson-1-3', title: 'Major cloud providers', duration: '15 min', status: 'locked' },
        ],
      },
    ],
  },
];

export const getCourseById = (id: string): Course | undefined => {
  return courses.find((course) => course.id === id);
};

export const getCurrentLesson = (course: Course): Lesson | undefined => {
  for (const module of course.modules) {
    const currentLesson = module.lessons.find((lesson) => lesson.status === 'current');
    if (currentLesson) return currentLesson;
  }
  return undefined;
};
