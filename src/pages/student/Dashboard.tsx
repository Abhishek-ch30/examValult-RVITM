
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import StudentLayout from '@/components/StudentLayout';
import PageHeader from '@/components/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Calendar, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { quizService, quizAttemptService, initializeDemoData } from '@/services/mockServices';
import { Quiz, QuizAttempt, LeaderboardEntry } from '@/types';

const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [upcomingQuizzes, setUpcomingQuizzes] = useState<Quiz[]>([]);
  const [recentAttempts, setRecentAttempts] = useState<(QuizAttempt & { quizTitle: string })[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  
  useEffect(() => {
    // Initialize demo data if needed
    initializeDemoData();
    
    // Fetch quizzes and attempts
    const quizzes = quizService.getActiveQuizzes();
    setUpcomingQuizzes(quizzes.slice(0, 3)); // Show up to 3 upcoming quizzes
    
    if (user) {
      const attempts = quizAttemptService.getByStudentId(user.id);
      const formattedAttempts = attempts
        .map(attempt => {
          const quiz = quizService.getById(attempt.quizId);
          return quiz ? {
            ...attempt,
            quizTitle: quiz.title
          } : null;
        })
        .filter(Boolean) as (QuizAttempt & { quizTitle: string })[];
      
      setRecentAttempts(formattedAttempts.slice(0, 3)); // Show up to 3 recent attempts
    }
    
    // Get leaderboard data
    const leaderboardData = quizAttemptService.getLeaderboard();
    setLeaderboard(leaderboardData.sort((a, b) => b.score - a.score).slice(0, 5)); // Top 5
  }, [user]);
  
  const calculateProgress = (attempt: QuizAttempt, totalMarks: number) => {
    if (attempt.score === undefined) return 0;
    return (attempt.score / totalMarks) * 100;
  };
  
  return (
    <StudentLayout activeTab="dashboard">
      <div className="animate-fade-in">
        <PageHeader
          title={`Welcome, ${user?.name || 'Student'}`}
          description="Check your exam schedule and recent performance"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Exams</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{upcomingQuizzes.length}</div>
              <p className="text-xs text-muted-foreground">
                {upcomingQuizzes.length === 0 ? 'No upcoming exams' : 'Exams scheduled'}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Exams Completed</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{recentAttempts.length}</div>
              <p className="text-xs text-muted-foreground">
                {recentAttempts.length === 0 ? 'No exams taken yet' : 'Exams completed'}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Average Score</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {recentAttempts.length > 0 
                  ? `${Math.round((recentAttempts.reduce((acc, curr) => acc + (curr.score || 0), 0) / recentAttempts.length))}%`
                  : 'N/A'
                }
              </div>
              <p className="text-xs text-muted-foreground">
                {recentAttempts.length === 0 ? 'Take exams to see your score' : 'Your average performance'}
              </p>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">Upcoming Exams</h2>
            {upcomingQuizzes.length > 0 ? (
              <div className="space-y-4">
                {upcomingQuizzes.map((quiz) => (
                  <Card key={quiz.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <CardTitle>{quiz.title}</CardTitle>
                      <CardDescription>{quiz.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Duration: {quiz.duration} minutes</span>
                        <span>Total Marks: {quiz.totalMarks}</span>
                      </div>
                      <Button 
                        className="w-full gradient-primary mt-2"
                        onClick={() => navigate(`/student/exam/${quiz.id}`)}
                      >
                        Take Exam
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Alert>
                <AlertTitle>No upcoming exams</AlertTitle>
                <AlertDescription>
                  You have no scheduled exams at the moment. Check back later or visit the Exams page
                  to see if new exams are available.
                </AlertDescription>
              </Alert>
            )}
            
            <div className="mt-4">
              <Button 
                variant="outline" 
                onClick={() => navigate('/student/exams')}
                className="w-full"
              >
                View All Exams
              </Button>
            </div>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-4">Recent Exam Results</h2>
            {recentAttempts.length > 0 ? (
              <div className="space-y-4">
                {recentAttempts.map((attempt) => {
                  const quiz = quizService.getById(attempt.quizId);
                  if (!quiz) return null;
                  
                  const progress = attempt.score !== undefined 
                    ? calculateProgress(attempt, quiz.totalMarks) 
                    : 0;
                  
                  return (
                    <Card key={attempt.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">{attempt.quizTitle}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Score</span>
                            <span className="font-medium">
                              {attempt.score !== undefined ? `${attempt.score}/${quiz.totalMarks}` : 'Not graded yet'}
                            </span>
                          </div>
                          <Progress value={progress} className="h-2" />
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Alert>
                <AlertTitle>No exam results yet</AlertTitle>
                <AlertDescription>
                  You haven't completed any exams yet. Take an exam to see your results here.
                </AlertDescription>
              </Alert>
            )}
            
            <div className="mt-4">
              <Button 
                variant="outline" 
                onClick={() => navigate('/student/history')}
                className="w-full"
              >
                View Exam History
              </Button>
            </div>
          </div>
        </div>
        
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Top Performers</h2>
          {leaderboard.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Leaderboard</CardTitle>
                <CardDescription>Top performing students across all exams</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-2">Rank</th>
                        <th className="text-left py-3 px-2">Student</th>
                        <th className="text-left py-3 px-2">Quiz</th>
                        <th className="text-left py-3 px-2">Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leaderboard.map((entry, index) => (
                        <tr key={`${entry.studentId}-${entry.quizId}`} className="border-b last:border-0">
                          <td className="py-3 px-2 font-medium">{index + 1}</td>
                          <td className="py-3 px-2">{entry.studentName}</td>
                          <td className="py-3 px-2">{entry.quizTitle}</td>
                          <td className="py-3 px-2">{entry.score}/{entry.totalScore}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Alert>
              <AlertTitle>No leaderboard data</AlertTitle>
              <AlertDescription>
                No students have completed exams yet. Be the first to take an exam and appear on the leaderboard!
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </StudentLayout>
  );
};

export default StudentDashboard;
