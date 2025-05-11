import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import NavBar from '@/components/NavBar';
import QuestionCard from '@/components/QuestionCard';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { quizService, questionService, quizAttemptService } from '@/services/mockServices';
import { Quiz, Question } from '@/types';
import { Clock, ChevronLeft, ChevronRight, AlertTriangle, CheckCircle2 } from 'lucide-react';

const TakeExam = () => {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [difficultyFilter, setDifficultyFilter] = useState<'all' | 'easy' | 'medium' | 'hard'>('all');
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [examSubmitted, setExamSubmitted] = useState(false);

  const AUTO_SUBMIT_MINUTES = 5;

  useEffect(() => {
    if (!examId || !user) return;

    const quizData = quizService.getById(examId);
    if (!quizData) {
      toast.error('Exam not found');
      navigate('/student/exams');
      return;
    }

    let attempt = quizAttemptService.getByStudentAndQuiz(user.id, examId);
    if (!attempt) {
      try {
        attempt = quizAttemptService.create({
          studentId: user.id,
          quizId: examId,
          startTime: new Date().toISOString(),
          answers: [],
          score: null,
          endTime: null,
        });
        if (!attempt) {
          throw new Error('Failed to create quiz attempt.');
        }
        console.log('Created new quiz attempt:', attempt.id);
      } catch (error) {
        console.error('Error creating quiz attempt:', error);
        toast.error('Could not start the exam. Please try again.');
        navigate('/student/exams');
        return;
      }
    } else {
      console.log('Resuming existing quiz attempt:', attempt.id);
    }

    setQuiz(quizData);
    setTimeLeft(quizData.duration * 60);

    const quizQuestions = questionService.getByQuizId(examId);
    setQuestions(quizQuestions);
  }, [examId, navigate, user]);

  useEffect(() => {
    if (timeLeft <= 0 || examSubmitted) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const autoSubmitTimeout = setTimeout(() => {
      handleSubmitExam();
    }, AUTO_SUBMIT_MINUTES * 60 * 1000);

    return () => {
      clearInterval(timer);
      clearTimeout(autoSubmitTimeout);
    };
  }, [timeLeft, examSubmitted]);

  const handleAnswerSelect = (questionId: string, selectedOption: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: selectedOption }));
  };

  const filteredQuestions = difficultyFilter === 'all'
    ? questions
    : questions.filter(q => q.difficulty === difficultyFilter);

  const currentQuestion = filteredQuestions[currentQuestionIndex];

  const handleNextQuestion = () => {
    if (currentQuestionIndex < filteredQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleJumpToQuestion = (index: number) => {
    setCurrentQuestionIndex(index);
  };

  const isQuestionAnswered = (questionId: string) => {
    return answers[questionId] !== undefined;
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const answerCount = Object.keys(answers).length;
  const progress = questions.length > 0 ? (answerCount / questions.length) * 100 : 0;

  const handleSubmitExam = () => {
    if (!user || !quiz) return;

    const existingAttempt = quizAttemptService.getByStudentAndQuiz(user.id, quiz.id);

    if (existingAttempt) {
      const formattedAnswers = questions.map(q => ({
        questionId: q.id,
        selectedOption: answers[q.id] !== undefined ? answers[q.id] : -1,
        isCorrect: answers[q.id] === q.correctAnswer
      }));

      quizAttemptService.update(existingAttempt.id, {
        answers: formattedAnswers,
        endTime: new Date().toISOString()
      });

      quizAttemptService.calculateScore(existingAttempt.id);

      toast.success('Exam submitted successfully!');
      setExamSubmitted(true);
    } else {
      toast.error('Error submitting exam. Please try again.');
    }
  };

  if (!quiz || questions.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <NavBar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-2">Loading exam...</h2>
            <p className="text-muted-foreground">Please wait while we prepare your exam.</p>
          </div>
        </div>
      </div>
    );
  }

  if (examSubmitted) {
    return (
      <div className="min-h-screen flex flex-col">
        <NavBar />
        <div className="flex-1 flex items-center justify-center p-6">
          <Card className="w-full max-w-lg animate-scale-in">
            <CardHeader>
              <CardTitle className="text-center flex justify-center items-center text-2xl text-green-600">
                <CheckCircle2 className="mr-2 h-6 w-6" />
                Exam Submitted
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="mb-4">Your answers have been submitted successfully.</p>
              <p className="text-muted-foreground mb-4">Check your results in your history.</p>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button onClick={() => navigate('/student/history')}>
                View Results
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">{quiz.title}</h1>
          <p className="text-muted-foreground">{quiz.description}</p>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-4">
            <div className="flex items-center text-sm mb-2 sm:mb-0">
              <Clock className="h-4 w-4 mr-1 text-exam-primary" />
              <span className="font-medium">Time Left: {formatTime(timeLeft)}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">{answerCount} / {questions.length} answered</span>
              <Progress value={progress} className="w-40 h-2" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 order-2 lg:order-1">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Questions</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs value={difficultyFilter} onValueChange={(value) => {
                  setDifficultyFilter(value as 'all' | 'easy' | 'medium' | 'hard');
                  setCurrentQuestionIndex(0);
                }}>
                  <TabsList className="grid grid-cols-4 mb-4">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="easy">Easy</TabsTrigger>
                    <TabsTrigger value="medium">Medium</TabsTrigger>
                    <TabsTrigger value="hard">Hard</TabsTrigger>
                  </TabsList>
                </Tabs>

                <div className="grid grid-cols-5 gap-2 mt-4">
                  {filteredQuestions.map((question, index) => (
                    <button
                      key={question.id}
                      onClick={() => handleJumpToQuestion(index)}
                      className={`question-bubble ${isQuestionAnswered(question.id) ? 'question-bubble-correct' : 'question-bubble-unanswered'} ${currentQuestionIndex === index ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Button
              variant="destructive"
              className="w-full mt-4"
              onClick={() => setShowSubmitDialog(true)}
            >
              Submit Exam
            </Button>
          </div>

          <div className="lg:col-span-3 order-1 lg:order-2">
            {currentQuestion ? (
              <div className="animate-fade-in">
                <QuestionCard
                  question={currentQuestion}
                  questionNumber={currentQuestionIndex + 1}
                  onAnswerSelect={handleAnswerSelect}
                  selectedOption={answers[currentQuestion.id]}
                />
                <div className="flex justify-between mt-4">
                  <Button variant="outline" onClick={handlePreviousQuestion} disabled={currentQuestionIndex === 0}>
                    <ChevronLeft className="mr-2 h-4 w-4" /> Previous
                  </Button>
                  <Button onClick={handleNextQuestion} disabled={currentQuestionIndex === filteredQuestions.length - 1}>
                    Next <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No questions available for this filter.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5 text-yellow-500" />
              Submit Exam
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to submit? You answered {answerCount} of {questions.length}.
              {answerCount < questions.length && (
                <p className="mt-2 text-yellow-600 font-medium">
                  Warning: {questions.length - answerCount} questions are unanswered.
                </p>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmitExam}>Submit</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TakeExam;
