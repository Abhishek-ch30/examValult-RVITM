
export type UserRole = 'student' | 'teacher';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  usn?: string; // For students
  phone: string;
  department: string;
  gender: 'male' | 'female' | 'other';
  staffId?: string; // For teachers
}

export interface Question {
  id: string;
  quizId: string;
  questionText: string;
  options: string[];
  correctAnswer: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  createdBy: string;
  createdOn: string;
  duration: number; // in minutes
  startTime?: string;
  endTime?: string;
  totalMarks: number;
  isActive: boolean;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  studentId: string;
  startTime: string;
  endTime?: string;
  score?: number;
  answers: {
    questionId: string;
    selectedOption: number;
    isCorrect?: boolean;
  }[];
}

export interface LeaderboardEntry {
  studentId: string;
  studentName: string;
  studentEmail: string;
  quizId: string;
  quizTitle: string;
  score: number;
  totalScore: number;
}
