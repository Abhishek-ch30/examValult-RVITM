
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import StudentLayout from '@/components/StudentLayout';
import PageHeader from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { quizService, questionService, quizAttemptService } from '@/services/mockServices';
import { Quiz, Question, QuizAttempt } from '@/types';

interface ExamResult {
  quizId: string;
  quizTitle: string;
  score: number;
  totalMarks: number;
  completedOn: string;
  percentage: number;
}

const ExamHistory = () => {
  const { user } = useAuth();
  const [examResults, setExamResults] = useState<ExamResult[]>([]);
  const [selectedQuiz, setSelectedQuiz] = useState<string | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  
  useEffect(() => {
    if (!user) return;
    
    // Fetch user's exam attempts
    const attempts = quizAttemptService.getByStudentId(user.id);
    
    // Format results
    const results = attempts
      .filter(attempt => attempt.endTime && attempt.score !== undefined)
      .map(attempt => {
        const quiz = quizService.getById(attempt.quizId);
        if (!quiz) return null;
        
        return {
          quizId: quiz.id,
          quizTitle: quiz.title,
          score: attempt.score || 0,
          totalMarks: quiz.totalMarks,
          completedOn: attempt.endTime || '',
          percentage: quiz.totalMarks > 0 ? ((attempt.score || 0) / quiz.totalMarks) * 100 : 0
        };
      })
      .filter(Boolean) as ExamResult[];
    
    setExamResults(results);
    
    // Select the first quiz for detailed view if available
    if (results.length > 0 && !selectedQuiz) {
      handleSelectQuiz(results[0].quizId);
    }
  }, [user, selectedQuiz]);
  
  const handleSelectQuiz = (quizId: string) => {
    setSelectedQuiz(quizId);
    
    // Fetch questions for the selected quiz
    const questions = questionService.getByQuizId(quizId);
    setQuizQuestions(questions);
    
    // Get user's answers for this quiz
    if (user) {
      const attempt = quizAttemptService.getByStudentAndQuiz(user.id, quizId);
      if (attempt) {
        const answerMap: Record<string, number> = {};
        attempt.answers.forEach(answer => {
          answerMap[answer.questionId] = answer.selectedOption;
        });
        setUserAnswers(answerMap);
      } else {
        setUserAnswers({});
      }
    }
  };
  
  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-blue-600';
    if (percentage >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };
  
  const getOptionLabel = (index: number) => {
    return String.fromCharCode(65 + index); // A, B, C, D...
  };

  return (
    <StudentLayout activeTab="history">
      <div className="animate-fade-in">
        <PageHeader
          title="Exam History"
          description="View your past exam results"
        />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <h3 className="text-lg font-medium mb-4">Your Results</h3>
            {examResults.length > 0 ? (
              <div className="space-y-4">
                {examResults.map((result) => (
                  <Card 
                    key={result.quizId} 
                    className={`cursor-pointer hover:shadow-md transition-shadow ${
                      selectedQuiz === result.quizId ? 'border-primary' : ''
                    }`}
                    onClick={() => handleSelectQuiz(result.quizId)}
                  >
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">{result.quizTitle}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">
                            {format(new Date(result.completedOn), 'PPP')}
                          </span>
                          <span className={`font-medium ${getScoreColor(result.percentage)}`}>
                            {result.score}/{result.totalMarks} ({Math.round(result.percentage)}%)
                          </span>
                        </div>
                        <Progress value={result.percentage} className="h-2" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-muted-foreground">
                    You haven't completed any exams yet.
                  </p>
                  <Button 
                    variant="link" 
                    onClick={() => window.location.href = '/student/exams'}
                  >
                    Take an exam
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
          
          <div className="lg:col-span-2">
            {selectedQuiz && (
              <div>
                <h3 className="text-lg font-medium mb-4">Detailed Results</h3>
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {examResults.find(r => r.quizId === selectedQuiz)?.quizTitle}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="summary">
                      <TabsList className="mb-4">
                        <TabsTrigger value="summary">Summary</TabsTrigger>
                        <TabsTrigger value="questions">Questions & Answers</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="summary">
                        {examResults.find(r => r.quizId === selectedQuiz) && (
                          <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="border rounded-md p-4">
                                <p className="text-sm text-muted-foreground mb-1">Score</p>
                                <p className="text-2xl font-bold">
                                  {examResults.find(r => r.quizId === selectedQuiz)?.score} / 
                                  {examResults.find(r => r.quizId === selectedQuiz)?.totalMarks}
                                </p>
                              </div>
                              <div className="border rounded-md p-4">
                                <p className="text-sm text-muted-foreground mb-1">Percentage</p>
                                <p className="text-2xl font-bold">
                                  {Math.round(examResults.find(r => r.quizId === selectedQuiz)?.percentage || 0)}%
                                </p>
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="text-base font-medium mb-2">Performance by Difficulty</h4>
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Difficulty</TableHead>
                                    <TableHead>Correct</TableHead>
                                    <TableHead>Incorrect</TableHead>
                                    <TableHead>Total</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {['easy', 'medium', 'hard'].map((difficulty) => {
                                    const questionsOfDifficulty = quizQuestions.filter(
                                      q => q.difficulty === difficulty
                                    );
                                    const correctAnswers = questionsOfDifficulty.filter(
                                      q => userAnswers[q.id] === q.correctAnswer
                                    ).length;
                                    
                                    return (
                                      <TableRow key={difficulty}>
                                        <TableCell className="capitalize">{difficulty}</TableCell>
                                        <TableCell className="text-green-600">{correctAnswers}</TableCell>
                                        <TableCell className="text-red-600">
                                          {questionsOfDifficulty.length - correctAnswers}
                                        </TableCell>
                                        <TableCell>{questionsOfDifficulty.length}</TableCell>
                                      </TableRow>
                                    );
                                  })}
                                </TableBody>
                              </Table>
                            </div>
                          </div>
                        )}
                      </TabsContent>
                      
                      <TabsContent value="questions">
                        <div className="space-y-6">
                          {quizQuestions.map((question, index) => (
                            <div key={question.id} className="border rounded-md p-4">
                              <div className="flex items-start justify-between mb-2">
                                <span className="font-medium">Question {index + 1}</span>
                                <Badge className={
                                  question.difficulty === 'easy' ? 'bg-green-500' :
                                  question.difficulty === 'medium' ? 'bg-yellow-500' : 'bg-red-500'
                                }>
                                  {question.difficulty}
                                </Badge>
                              </div>
                              <p className="mb-4">{question.questionText}</p>
                              
                              <div className="space-y-2">
                                {question.options.map((option, optionIndex) => {
                                  const isUserAnswer = userAnswers[question.id] === optionIndex;
                                  const isCorrectAnswer = question.correctAnswer === optionIndex;
                                  
                                  let className = "border p-3 rounded-md flex items-center";
                                  if (isUserAnswer && isCorrectAnswer) {
                                    className += " bg-green-100 border-green-500";
                                  } else if (isUserAnswer && !isCorrectAnswer) {
                                    className += " bg-red-100 border-red-500";
                                  } else if (isCorrectAnswer) {
                                    className += " border-green-500";
                                  }
                                  
                                  return (
                                    <div key={optionIndex} className={className}>
                                      <span className="w-6 h-6 flex items-center justify-center rounded-full border mr-2">
                                        {getOptionLabel(optionIndex)}
                                      </span>
                                      <span>{option}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </StudentLayout>
  );
};

export default ExamHistory;
