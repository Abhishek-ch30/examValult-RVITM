
import { Quiz, Question, User, QuizAttempt, LeaderboardEntry } from '@/types';

// Helper function to get or initialize localStorage data
const getStorageData = <T>(key: string, initialValue: T): T => {
  if (typeof window === 'undefined') {
    return initialValue;
  }
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : initialValue;
  } catch (error) {
    console.error(`Error reading localStorage key "${key}":`, error);
    return initialValue;
  }
};

// Helper function to set localStorage data
const setStorageData = <T>(key: string, value: T): void => {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error setting localStorage key "${key}":`, error);
  }
};

// Quiz Services
export const quizService = {
  getAll: (): Quiz[] => {
    return getStorageData<Quiz[]>('examQuizzes', []);
  },
  
  getById: (id: string): Quiz | undefined => {
    const quizzes = getStorageData<Quiz[]>('examQuizzes', []);
    return quizzes.find(quiz => quiz.id === id);
  },
  
  create: (quiz: Omit<Quiz, 'id'>): Quiz => {
    const quizzes = getStorageData<Quiz[]>('examQuizzes', []);
    const newQuiz: Quiz = {
      ...quiz,
      id: crypto.randomUUID(),
    };
    quizzes.push(newQuiz);
    setStorageData('examQuizzes', quizzes);
    return newQuiz;
  },
  
  update: (id: string, updates: Partial<Quiz>): Quiz | null => {
    const quizzes = getStorageData<Quiz[]>('examQuizzes', []);
    const index = quizzes.findIndex(quiz => quiz.id === id);
    
    if (index === -1) return null;
    
    quizzes[index] = { ...quizzes[index], ...updates };
    setStorageData('examQuizzes', quizzes);
    return quizzes[index];
  },
  
  delete: (id: string): boolean => {
    const quizzes = getStorageData<Quiz[]>('examQuizzes', []);
    const filtered = quizzes.filter(quiz => quiz.id !== id);
    
    if (filtered.length === quizzes.length) return false;
    
    setStorageData('examQuizzes', filtered);
    return true;
  },
  
  getActiveQuizzes: (): Quiz[] => {
    const quizzes = getStorageData<Quiz[]>('examQuizzes', []);
    return quizzes.filter(quiz => quiz.isActive);
  }
};

// Question Services
export const questionService = {
  getByQuizId: (quizId: string): Question[] => {
    const questions = getStorageData<Question[]>('examQuestions', []);
    return questions.filter(question => question.quizId === quizId);
  },
  
  create: (question: Omit<Question, 'id'>): Question => {
    const questions = getStorageData<Question[]>('examQuestions', []);
    const newQuestion: Question = {
      ...question,
      id: crypto.randomUUID(),
    };
    questions.push(newQuestion);
    setStorageData('examQuestions', questions);
    return newQuestion;
  },
  
  bulkCreate: (quizId: string, questions: Omit<Question, 'id' | 'quizId'>[]): Question[] => {
    const existingQuestions = getStorageData<Question[]>('examQuestions', []);
    const newQuestions = questions.map(q => ({
      ...q,
      id: crypto.randomUUID(),
      quizId
    }));
    
    setStorageData('examQuestions', [...existingQuestions, ...newQuestions]);
    return newQuestions;
  },
  
  update: (id: string, updates: Partial<Question>): Question | null => {
    const questions = getStorageData<Question[]>('examQuestions', []);
    const index = questions.findIndex(question => question.id === id);
    
    if (index === -1) return null;
    
    questions[index] = { ...questions[index], ...updates };
    setStorageData('examQuestions', questions);
    return questions[index];
  },
  
  delete: (id: string): boolean => {
    const questions = getStorageData<Question[]>('examQuestions', []);
    const filtered = questions.filter(question => question.id !== id);
    
    if (filtered.length === questions.length) return false;
    
    setStorageData('examQuestions', filtered);
    return true;
  },
  
  deleteByQuizId: (quizId: string): boolean => {
    const questions = getStorageData<Question[]>('examQuestions', []);
    const filtered = questions.filter(question => question.quizId !== quizId);
    
    if (filtered.length === questions.length) return false;
    
    setStorageData('examQuestions', filtered);
    return true;
  }
};

// Quiz Attempt Services
export const quizAttemptService = {
  getByStudentId: (studentId: string): QuizAttempt[] => {
    const attempts = getStorageData<QuizAttempt[]>('examQuizAttempts', []);
    return attempts.filter(attempt => attempt.studentId === studentId);
  },
  
  getByQuizId: (quizId: string): QuizAttempt[] => {
    const attempts = getStorageData<QuizAttempt[]>('examQuizAttempts', []);
    return attempts.filter(attempt => attempt.quizId === quizId);
  },
  
  getByStudentAndQuiz: (studentId: string, quizId: string): QuizAttempt | undefined => {
    const attempts = getStorageData<QuizAttempt[]>('examQuizAttempts', []);
    return attempts.find(attempt => attempt.studentId === studentId && attempt.quizId === quizId);
  },
  
  create: (attempt: Omit<QuizAttempt, 'id'>): QuizAttempt => {
    const attempts = getStorageData<QuizAttempt[]>('examQuizAttempts', []);
    const newAttempt: QuizAttempt = {
      ...attempt,
      id: crypto.randomUUID(),
    };
    attempts.push(newAttempt);
    setStorageData('examQuizAttempts', attempts);
    return newAttempt;
  },
  
  update: (id: string, updates: Partial<QuizAttempt>): QuizAttempt | null => {
    const attempts = getStorageData<QuizAttempt[]>('examQuizAttempts', []);
    const index = attempts.findIndex(attempt => attempt.id === id);
    
    if (index === -1) return null;
    
    attempts[index] = { ...attempts[index], ...updates };
    setStorageData('examQuizAttempts', attempts);
    return attempts[index];
  },
  
  calculateScore: (attemptId: string): number | null => {
    const attempts = getStorageData<QuizAttempt[]>('examQuizAttempts', []);
    const attemptIndex = attempts.findIndex(attempt => attempt.id === attemptId);
    
    if (attemptIndex === -1) return null;
    
    const attempt = attempts[attemptIndex];
    const questions = questionService.getByQuizId(attempt.quizId);
    
    let score = 0;
    const updatedAnswers = attempt.answers.map(answer => {
      const question = questions.find(q => q.id === answer.questionId);
      const isCorrect = question?.correctAnswer === answer.selectedOption;
      if (isCorrect) score++;
      return { ...answer, isCorrect };
    });
    
    attempts[attemptIndex] = {
      ...attempt,
      score,
      answers: updatedAnswers,
      endTime: new Date().toISOString()
    };
    
    setStorageData('examQuizAttempts', attempts);
    return score;
  },
  
  getLeaderboard: (quizId?: string): LeaderboardEntry[] => {
    const attempts = getStorageData<QuizAttempt[]>('examQuizAttempts', []);
    const users = getStorageData<User[]>('examUsers', []);
    const quizzes = getStorageData<Quiz[]>('examQuizzes', []);
    
    const filteredAttempts = quizId 
      ? attempts.filter(a => a.quizId === quizId && a.score !== undefined)
      : attempts.filter(a => a.score !== undefined);
    
    return filteredAttempts.map(attempt => {
      const student = users.find(u => u.id === attempt.studentId);
      const quiz = quizzes.find(q => q.id === attempt.quizId);
      
      if (!student || !quiz) return null;
      
      return {
        studentId: student.id,
        studentName: student.name,
        studentEmail: student.email,
        quizId: quiz.id,
        quizTitle: quiz.title,
        score: attempt.score || 0,
        totalScore: quiz.totalMarks
      };
    }).filter(Boolean) as LeaderboardEntry[];
  },
  
  downloadResults: (quizId: string): void => {
    const leaderboard = quizAttemptService.getLeaderboard(quizId);
    const quiz = quizService.getById(quizId);
    
    if (!leaderboard.length || !quiz) return;
    
    // Format data for CSV
    const headers = ['Student Name', 'Email', 'Score', 'Total Score'];
    
    const rows = leaderboard.map(entry => [
      entry.studentName,
      entry.studentEmail,
      entry.score.toString(),
      entry.totalScore.toString()
    ]);
    
    // Create CSV content
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    // Create a blob and download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.setAttribute('href', url);
    link.setAttribute('download', `${quiz.title}_results.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

// User Services
export const userService = {
  getAll: (): User[] => {
    const users = getStorageData<(User & { password: string })[]>('examUsers', []);
    return users.map(({ password, ...user }) => user);
  },
  
  getById: (id: string): User | undefined => {
    const users = getStorageData<(User & { password: string })[]>('examUsers', []);
    const user = users.find(user => user.id === id);
    if (!user) return undefined;
    
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },
  
  getStudents: (): User[] => {
    const users = getStorageData<(User & { password: string })[]>('examUsers', []);
    return users
      .filter(user => user.role === 'student')
      .map(({ password, ...user }) => user);
  },
  
  getTeachers: (): User[] => {
    const users = getStorageData<(User & { password: string })[]>('examUsers', []);
    return users
      .filter(user => user.role === 'teacher')
      .map(({ password, ...user }) => user);
  },
  
  update: (id: string, updates: Partial<User>): User | null => {
    const users = getStorageData<(User & { password: string })[]>('examUsers', []);
    const index = users.findIndex(user => user.id === id);
    
    if (index === -1) return null;
    
    users[index] = { ...users[index], ...updates };
    setStorageData('examUsers', users);
    
    const { password, ...userWithoutPassword } = users[index];
    return userWithoutPassword;
  }
};

// Initialize some demo data if none exists
export const initializeDemoData = () => {
  // Check if we already have data
  const users = getStorageData<User[]>('examUsers', []);
  if (users.length > 0) return;
  
  // Create sample users
  const sampleUsers = [
    {
      id: "1",
      name: "Prof. Sharma",
      email: "sharma@rvitm.edu.in",
      role: "teacher" as const,
      phone: "9876543210",
      department: "Computer Science",
      gender: "male" as const,
      staffId: "RVITMCS001",
      password: "teacher123"
    },
    {
      id: "2",
      name: "Rahul Kumar",
      email: "rahul@rvitm.edu.in",
      role: "student" as const,
      phone: "9876543211",
      department: "Computer Science",
      gender: "male" as const,
      usn: "1RV21CS001",
      password: "student123"
    }
  ];
  
  setStorageData('examUsers', sampleUsers);
  
  // Create sample quizzes
  const sampleQuizzes: Quiz[] = [
    {
      id: "1",
      title: "Introduction to Programming",
      description: "Basic concepts of programming languages",
      createdBy: "Prof. Sharma",
      createdOn: new Date().toISOString(),
      duration: 30,
      totalMarks: 3,
      isActive: true
    },
    {
      id: "2",
      title: "Data Structures",
      description: "Advanced concepts of data structures",
      createdBy: "Prof. Sharma",
      createdOn: new Date().toISOString(),
      duration: 45,
      totalMarks: 3,
      isActive: true
    }
  ];
  
  setStorageData('examQuizzes', sampleQuizzes);
  
  // Create sample questions
  const sampleQuestions: Question[] = [
    {
      id: "1",
      quizId: "1",
      questionText: "What is the output of the following code?\n\nconsole.log(1 + '1');",
      options: ["2", "'11'", "Error", "undefined"],
      correctAnswer: 1,
      difficulty: "easy"
    },
    {
      id: "2",
      quizId: "1",
      questionText: "Which of the following is NOT a JavaScript data type?",
      options: ["String", "Boolean", "Object", "Character"],
      correctAnswer: 3,
      difficulty: "medium"
    },
    {
      id: "3",
      quizId: "1",
      questionText: "What is the time complexity of binary search?",
      options: ["O(1)", "O(n)", "O(log n)", "O(n²)"],
      correctAnswer: 2,
      difficulty: "hard"
    },
    {
      id: "4",
      quizId: "2",
      questionText: "Which data structure uses LIFO principle?",
      options: ["Queue", "Stack", "Linked List", "Tree"],
      correctAnswer: 1,
      difficulty: "easy"
    },
    {
      id: "5",
      quizId: "2",
      questionText: "What is the worst-case time complexity for searching in a balanced binary search tree?",
      options: ["O(1)", "O(n)", "O(log n)", "O(n²)"],
      correctAnswer: 2,
      difficulty: "medium"
    },
    {
      id: "6",
      quizId: "2",
      questionText: "Which sorting algorithm has the best average-case performance?",
      options: ["Bubble Sort", "Insertion Sort", "Merge Sort", "Quick Sort"],
      correctAnswer: 3,
      difficulty: "hard"
    }
  ];
  
  setStorageData('examQuestions', sampleQuestions);
};
