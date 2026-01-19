
export enum Section {
  QUANT = 'Quantitative Techniques & DI',
  LOGICAL = 'Logical Reasoning',
  LANGUAGE = 'Language Comprehension',
  GENERAL = 'General Awareness',
  INNOVATION = 'Innovation & Entrepreneurship'
}

export interface Question {
  id: string;
  section: Section;
  question: string;
  options: string[];
  correctAnswer: number; // Index of options
  explanation?: string;
}

export interface MockTest {
  id: string;
  title: string;
  duration: number; // in minutes
  totalMarks: number;
  questions: Question[];
}

export interface TestAttempt {
  testId: string;
  score: number;
  answers: Record<string, number>;
  completedAt: Date;
  sectionWiseScores: Record<Section, number>;
}

export interface AIAnalysis {
  strengths: string[];
  weaknesses: string[];
  improvementPlan: string;
  suggestedResources: string[];
}
