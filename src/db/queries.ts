import { Pool } from 'mysql2/promise';
import pool from './config';

// User Queries
export const userQueries = {
  getAll: async () => {
    const [rows] = await (pool as unknown as Pool).query('SELECT id, name, email, role, phone, department, gender, usn, staff_id FROM users');
    return rows;
  },

  getById: async (id: number) => {
    const [rows] = await (pool as unknown as Pool).query(
      'SELECT id, name, email, role, phone, department, gender, usn, staff_id FROM users WHERE id = ?',
      [id]
    );
    return rows[0];
  },

  getByEmail: async (email: string) => {
    const [rows] = await (pool as unknown as Pool).query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
  },

  validateEmail: (email: string): boolean => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+\.rvitm@rvei\.edu\.in$/;
    return emailRegex.test(email);
  },

  validateUSN: (usn: string, role: string): boolean => {
    if (role === 'teacher') {
      return usn === null || usn === undefined;
    }
    const usnRegex = /^1RF[0-9]{2}(CS|IS|EC)[0-9]{3}$/;
    return usnRegex.test(usn);
  },

  create: async (user: any) => {
    if (!userQueries.validateEmail(user.email)) {
      throw new Error('Please use your RVITM email address (.rvitm@rvei.edu.in)');
    }

    if (!userQueries.validateUSN(user.usn, user.role)) {
      throw new Error('Invalid USN format. Must be in the format: 1RF23CS/IS/ECXXX (e.g., 1RF23IS003, 1RF23CS062)');
    }

    const [result] = await (pool as unknown as Pool).query(
      `INSERT INTO users (name, email, role, password, phone, department, gender, usn, staff_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [user.name, user.email, user.role, user.password, user.phone, user.department, user.gender, user.usn, user.staffId]
    );
    return result;
  },

  update: async (id: number, updates: any) => {
    if (updates.email && !userQueries.validateEmail(updates.email)) {
      throw new Error('Please use your RVITM email address (.rvitm@rvei.edu.in)');
    }

    if (updates.usn && !userQueries.validateUSN(updates.usn, updates.role)) {
      throw new Error('Invalid USN format. Must be in the format: 1RF23CS/IS/ECXXX (e.g., 1RF23IS003, 1RF23CS062)');
    }

    const [result] = await (pool as unknown as Pool).query(
      `UPDATE users 
       SET name = ?, email = ?, phone = ?, department = ?, gender = ?, usn = ?, staff_id = ?
       WHERE id = ?`,
      [updates.name, updates.email, updates.phone, updates.department, updates.gender, updates.usn, updates.staffId, id]
    );
    return result;
  }
};

// Quiz Queries
export const quizQueries = {
  getAll: async () => {
    const [rows] = await (pool as unknown as Pool).query('SELECT * FROM quizzes');
    return rows;
  },

  getById: async (id: number) => {
    const [rows] = await (pool as unknown as Pool).query('SELECT * FROM quizzes WHERE id = ?', [id]);
    return rows[0];
  },

  getActive: async () => {
    const [rows] = await (pool as unknown as Pool).query('SELECT * FROM quizzes WHERE is_active = true');
    return rows;
  },

  create: async (quiz: any) => {
    const [result] = await (pool as unknown as Pool).query(
      `INSERT INTO quizzes (title, description, created_by, duration, total_marks, is_active)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [quiz.title, quiz.description, quiz.createdBy, quiz.duration, quiz.totalMarks, quiz.isActive]
    );
    return result;
  },

  update: async (id: number, updates: any) => {
    const [result] = await (pool as unknown as Pool).query(
      `UPDATE quizzes 
       SET title = ?, description = ?, duration = ?, total_marks = ?, is_active = ?
       WHERE id = ?`,
      [updates.title, updates.description, updates.duration, updates.totalMarks, updates.isActive, id]
    );
    return result;
  },

  delete: async (id: number) => {
    await (pool as unknown as Pool).query('DELETE FROM quizzes WHERE id = ?', [id]);
  }
};

// Question Queries
export const questionQueries = {
  getByQuizId: async (quizId: number) => {
    const [rows] = await (pool as unknown as Pool).query('SELECT * FROM questions WHERE quiz_id = ?', [quizId]);
    return rows;
  },

  create: async (question: any) => {
    const [result] = await (pool as unknown as Pool).query(
      `INSERT INTO questions (quiz_id, question_text, options, correct_answer, difficulty)
       VALUES (?, ?, ?, ?, ?)`,
      [question.quizId, question.questionText, JSON.stringify(question.options), question.correctAnswer, question.difficulty]
    );
    return result;
  },

  bulkCreate: async (questions: any[]) => {
    const values = questions.map(q => 
      `(?, ?, ?, ?, ?)`
    ).join(',');
    
    const params = questions.flatMap(q => [
      q.quizId, 
      q.questionText, 
      JSON.stringify(q.options), 
      q.correctAnswer, 
      q.difficulty
    ]);
    
    const [result] = await (pool as unknown as Pool).query(
      `INSERT INTO questions (quiz_id, question_text, options, correct_answer, difficulty)
       VALUES ${values}`,
      params
    );
    return result;
  },

  update: async (id: number, updates: any) => {
    const [result] = await (pool as unknown as Pool).query(
      `UPDATE questions 
       SET question_text = ?, options = ?, correct_answer = ?, difficulty = ?
       WHERE id = ?`,
      [updates.questionText, JSON.stringify(updates.options), updates.correctAnswer, updates.difficulty, id]
    );
    return result;
  },

  delete: async (id: number) => {
    await (pool as unknown as Pool).query('DELETE FROM questions WHERE id = ?', [id]);
  }
};

// Quiz Attempt Queries
export const quizAttemptQueries = {
  getByStudentId: async (studentId: number) => {
    const [rows] = await (pool as unknown as Pool).query(
      `SELECT qa.*, q.title as quiz_title 
       FROM quiz_attempts qa
       JOIN quizzes q ON qa.quiz_id = q.id
       WHERE qa.student_id = ?`,
      [studentId]
    );
    return rows;
  },

  getByQuizId: async (quizId: number) => {
    const [rows] = await (pool as unknown as Pool).query(
      `SELECT qa.*, u.name as student_name 
       FROM quiz_attempts qa
       JOIN users u ON qa.student_id = u.id
       WHERE qa.quiz_id = ?`,
      [quizId]
    );
    return rows;
  },

  create: async (attempt: any) => {
    const [result] = await (pool as unknown as Pool).query(
      `INSERT INTO quiz_attempts (quiz_id, student_id)
       VALUES (?, ?)`,
      [attempt.quizId, attempt.studentId]
    );
    return result;
  },

  submitAnswers: async (attemptId: number, answers: any[]) => {
    const values = answers.map(() => '(?, ?, ?, ?)').join(',');
    const params = answers.flatMap(a => [attemptId, a.questionId, a.selectedOption, a.isCorrect]);
    
    await (pool as unknown as Pool).query(
      `INSERT INTO quiz_answers (attempt_id, question_id, selected_option, is_correct)
       VALUES ${values}`,
      params
    );

    const [result] = await (pool as unknown as Pool).query(
      `UPDATE quiz_attempts 
       SET score = (
         SELECT COUNT(*) 
         FROM quiz_answers 
         WHERE attempt_id = ? AND is_correct = true
       ),
       end_time = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [attemptId, attemptId]
    );
    return result;
  }
};

// Leaderboard Queries
export const leaderboardQueries = {
  getByQuiz: async (quizId: number) => {
    const [rows] = await (pool as unknown as Pool).query(
      `SELECT 
         u.id as student_id,
         u.name as student_name,
         u.email as student_email,
         q.id as quiz_id,
         q.title as quiz_title,
         qa.score,
         q.total_marks as total_score
       FROM quiz_attempts qa
       JOIN users u ON qa.student_id = u.id
       JOIN quizzes q ON qa.quiz_id = q.id
       WHERE qa.quiz_id = ? AND qa.score IS NOT NULL
       ORDER BY qa.score DESC`,
      [quizId]
    );
    return rows;
  },

  getOverall: async () => {
    const [rows] = await (pool as unknown as Pool).query(
      `SELECT 
         u.id as student_id,
         u.name as student_name,
         u.email as student_email,
         q.id as quiz_id,
         q.title as quiz_title,
         qa.score,
         q.total_marks as total_score
       FROM quiz_attempts qa
       JOIN users u ON qa.student_id = u.id
       JOIN quizzes q ON qa.quiz_id = q.id
       WHERE qa.score IS NOT NULL
       ORDER BY qa.score DESC`
    );
    return rows;
  }
}; 