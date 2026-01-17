// Type definitions for course-related components
// These are used by Sidebar and CourseCard components for type safety

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

// Helper function to get current lesson from modules
export const getCurrentLesson = (modules: Module[]): Lesson | undefined => {
  for (const module of modules) {
    const currentLesson = module.lessons.find((lesson) => lesson.status === 'current');
    if (currentLesson) return currentLesson;
  }
  return undefined;
};
