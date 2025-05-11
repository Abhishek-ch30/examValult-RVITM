
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import TeacherLayout from '@/components/TeacherLayout';
import PageHeader from '@/components/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, User, BarChart, PlusCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { quizService, userService, quizAttemptService, initializeDemoData } from '@/services/mockServices';
import { Quiz, LeaderboardEntry } from '@/types';

const TeacherDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [studentCount, setStudentCount] = useState(0);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [recentQuizResults, setRecentQuizResults] = useState<{ quizId: string; quizTitle: string; averageScore: number; totalMarks: number }[]>([]);
  
  useEffect(() => {
    // Initialize demo data if needed
    initializeDemoData();
    
    // Fetch quizzes
    const allQuizzes = quizService.getAll();
    const teacherQuizzes = user ? allQuizzes.filter(quiz => quiz.createdBy === user.name) : [];
    setQuizzes(teacherQuizzes);
    
    // Fetch student count
    const students = userService.getStudents();
    setStudentCount(students.length);
    
    // Fetch leaderboard data
    const leaderboardData = quizAttemptService.getLeaderboard();
    setLeaderboard(leaderboardData.sort((a, b) => b.score - a.score).slice(0, 5));
    
    // Calculate recent quiz results (average scores)
    if (teacherQuizzes.length > 0) {
      const results = teacherQuizzes.map(quiz => {
        const attempts = quizAttemptService.getByQuizId(quiz.id)
          .filter(attempt => attempt.score !== undefined);
        
        if (attempts.length === 0) {
          return {
            quizId: quiz.id,
            quizTitle: quiz.title,
            averageScore: 0,
            totalMarks: quiz.totalMarks
          };
        }
        
        const totalScore = attempts.reduce((sum, attempt) => sum + (attempt.score || 0), 0);
        const averageScore = totalScore / attempts.length;
        
        return {
          quizId: quiz.id,
          quizTitle: quiz.title,
          averageScore,
          totalMarks: quiz.totalMarks
        };
      });
      
      setRecentQuizResults(results);
    }
  }, [user]);
  
  return (
    <TeacherLayout activeTab="dashboard">
      <div className="animate-fade-in">
        <PageHeader
          title={`Welcome, ${user?.name || 'Teacher'}`}
          description="Manage your exams and view student performance"
          action={
            <Button className="gradient-primary" onClick={() => navigate('/teacher/create-exam')}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create New Exam
            </Button>
          }
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Exams</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{quizzes.length}</div>
              <p className="text-xs text-muted-foreground">
                {quizzes.length === 0 ? 'No exams created yet' : 'Exams created'}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Registered Students</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{studentCount}</div>
              <p className="text-xs text-muted-foreground">
                {studentCount === 0 ? 'No students registered yet' : 'Students registered'}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Exams</CardTitle>
              <BarChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {quizzes.filter(quiz => quiz.isActive).length}
              </div>
              <p className="text-xs text-muted-foreground">
                {quizzes.filter(quiz => quiz.isActive).length === 0 
                  ? 'No active exams' 
                  : 'Exams currently active'}
              </p>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Recent Exams</CardTitle>
              <CardDescription>Performance overview of your recent exams</CardDescription>
            </CardHeader>
            <CardContent>
              {recentQuizResults.length > 0 ? (
                <div className="space-y-4">
                  {recentQuizResults.map((result) => (
                    <div key={result.quizId} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="font-medium">{result.quizTitle}</span>
                        <span>
                          {result.averageScore.toFixed(1)} / {result.totalMarks}
                        </span>
                      </div>
                      <Progress 
                        value={(result.averageScore / result.totalMarks) * 100} 
                        className="h-2" 
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">No exam results available yet</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Top Performers</CardTitle>
              <CardDescription>Students with the highest scores</CardDescription>
            </CardHeader>
            <CardContent>
              {leaderboard.length > 0 ? (
                <div className="space-y-4">
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
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">No student performance data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Your Exams</CardTitle>
            <CardDescription>Manage all your created exams</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all">
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="inactive">Inactive</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all" className="mt-4">
                {quizzes.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4">Title</th>
                          <th className="text-left py-3 px-4 hidden md:table-cell">Duration</th>
                          <th className="text-left py-3 px-4 hidden md:table-cell">Questions</th>
                          <th className="text-left py-3 px-4">Status</th>
                          <th className="text-right py-3 px-4">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {quizzes.map((quiz) => (
                          <tr key={quiz.id} className="border-b hover:bg-muted/30">
                            <td className="py-3 px-4 font-medium">{quiz.title}</td>
                            <td className="py-3 px-4 hidden md:table-cell">{quiz.duration} mins</td>
                            <td className="py-3 px-4 hidden md:table-cell">{quiz.totalMarks}</td>
                            <td className="py-3 px-4">
                              <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                                quiz.isActive 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {quiz.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="py-2 px-4 text-right">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate('/teacher/manage-exams')}
                              >
                                View
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">You haven't created any exams yet</p>
                    <Button className="gradient-primary" onClick={() => navigate('/teacher/create-exam')}>
                      Create Your First Exam
                    </Button>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="active" className="mt-4">
                {quizzes.filter(q => q.isActive).length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4">Title</th>
                          <th className="text-left py-3 px-4 hidden md:table-cell">Duration</th>
                          <th className="text-left py-3 px-4 hidden md:table-cell">Questions</th>
                          <th className="text-right py-3 px-4">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {quizzes.filter(q => q.isActive).map((quiz) => (
                          <tr key={quiz.id} className="border-b hover:bg-muted/30">
                            <td className="py-3 px-4 font-medium">{quiz.title}</td>
                            <td className="py-3 px-4 hidden md:table-cell">{quiz.duration} mins</td>
                            <td className="py-3 px-4 hidden md:table-cell">{quiz.totalMarks}</td>
                            <td className="py-2 px-4 text-right">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate('/teacher/manage-exams')}
                              >
                                View
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground">No active exams</p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="inactive" className="mt-4">
                {quizzes.filter(q => !q.isActive).length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4">Title</th>
                          <th className="text-left py-3 px-4 hidden md:table-cell">Duration</th>
                          <th className="text-left py-3 px-4 hidden md:table-cell">Questions</th>
                          <th className="text-right py-3 px-4">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {quizzes.filter(q => !q.isActive).map((quiz) => (
                          <tr key={quiz.id} className="border-b hover:bg-muted/30">
                            <td className="py-3 px-4 font-medium">{quiz.title}</td>
                            <td className="py-3 px-4 hidden md:table-cell">{quiz.duration} mins</td>
                            <td className="py-3 px-4 hidden md:table-cell">{quiz.totalMarks}</td>
                            <td className="py-2 px-4 text-right">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate('/teacher/manage-exams')}
                              >
                                View
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground">No inactive exams</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </TeacherLayout>
  );
};

export default TeacherDashboard;
