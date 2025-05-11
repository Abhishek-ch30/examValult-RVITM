
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import TeacherLayout from '@/components/TeacherLayout';
import PageHeader from '@/components/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { quizService, questionService, quizAttemptService, initializeDemoData } from '@/services/mockServices';
import { Quiz } from '@/types';
import { DownloadCloud, MoreVertical, Eye, FileText, Trash, Search, PlusCircle } from 'lucide-react';

const ManageExams = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showResultsDialog, setShowResultsDialog] = useState(false);
  const [quizResults, setQuizResults] = useState<{
    totalAttempts: number;
    averageScore: number;
    highestScore: number;
  }>({ totalAttempts: 0, averageScore: 0, highestScore: 0 });
  
  useEffect(() => {
    // Initialize demo data if needed
    initializeDemoData();
    
    loadQuizzes();
  }, [user]);
  
  const loadQuizzes = () => {
    const allQuizzes = quizService.getAll();
    const teacherQuizzes = user ? allQuizzes.filter(quiz => quiz.createdBy === user.name) : [];
    setQuizzes(teacherQuizzes);
  };
  
  const filteredQuizzes = quizzes.filter(quiz => 
    quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quiz.description.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const activeQuizzes = filteredQuizzes.filter(quiz => quiz.isActive);
  const inactiveQuizzes = filteredQuizzes.filter(quiz => !quiz.isActive);
  
  const handleToggleActive = (quiz: Quiz) => {
    quizService.update(quiz.id, { isActive: !quiz.isActive });
    loadQuizzes();
    toast.success(`Exam ${quiz.isActive ? 'deactivated' : 'activated'} successfully`);
  };
  
  const handleDeleteExam = () => {
    if (!selectedQuiz) return;
    
    questionService.deleteByQuizId(selectedQuiz.id);
    quizService.delete(selectedQuiz.id);
    
    loadQuizzes();
    setShowDeleteDialog(false);
    toast.success('Exam deleted successfully');
  };
  
  const handleViewResults = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    
    const attempts = quizAttemptService.getByQuizId(quiz.id)
      .filter(attempt => attempt.score !== undefined);
    
    if (attempts.length === 0) {
      setQuizResults({
        totalAttempts: 0,
        averageScore: 0,
        highestScore: 0
      });
    } else {
      const totalScore = attempts.reduce((sum, attempt) => sum + (attempt.score || 0), 0);
      const highestScore = Math.max(...attempts.map(attempt => attempt.score || 0));
      
      setQuizResults({
        totalAttempts: attempts.length,
        averageScore: totalScore / attempts.length,
        highestScore
      });
    }
    
    setShowResultsDialog(true);
  };
  
  const handleDownloadResults = () => {
    if (!selectedQuiz) return;
    
    quizAttemptService.downloadResults(selectedQuiz.id);
    toast.success('Results downloaded successfully');
  };

  return (
    <TeacherLayout activeTab="manage">
      <div className="animate-fade-in">
        <PageHeader
          title="Manage Exams"
          description="View, edit, and manage your exams"
          action={
            <Button className="gradient-primary" onClick={() => navigate('/teacher/create-exam')}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create New Exam
            </Button>
          }
        />
        
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search exams..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) =>setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <Card>
          <CardContent className="p-0">
            <Tabs defaultValue="all" className="w-full">
              <div className="border-b px-4">
                <TabsList className="bg-transparent">
                  <TabsTrigger value="all" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none">
                    All ({filteredQuizzes.length})
                  </TabsTrigger>
                  <TabsTrigger value="active" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none">
                    Active ({activeQuizzes.length})
                  </TabsTrigger>
                  <TabsTrigger value="inactive" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none">
                    Inactive ({inactiveQuizzes.length})
                  </TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="all" className="p-0 m-0">
                <ExamTable 
                  quizzes={filteredQuizzes} 
                  onToggleActive={handleToggleActive} 
                  onDeleteDialogOpen={(quiz) => {
                    setSelectedQuiz(quiz);
                    setShowDeleteDialog(true);
                  }}
                  onViewResults={handleViewResults}
                />
              </TabsContent>
              
              <TabsContent value="active" className="p-0 m-0">
                <ExamTable 
                  quizzes={activeQuizzes} 
                  onToggleActive={handleToggleActive} 
                  onDeleteDialogOpen={(quiz) => {
                    setSelectedQuiz(quiz);
                    setShowDeleteDialog(true);
                  }}
                  onViewResults={handleViewResults}
                />
              </TabsContent>
              
              <TabsContent value="inactive" className="p-0 m-0">
                <ExamTable 
                  quizzes={inactiveQuizzes} 
                  onToggleActive={handleToggleActive} 
                  onDeleteDialogOpen={(quiz) => {
                    setSelectedQuiz(quiz);
                    setShowDeleteDialog(true);
                  }}
                  onViewResults={handleViewResults}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Exam</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedQuiz?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteExam}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Results Dialog */}
      <Dialog open={showResultsDialog} onOpenChange={setShowResultsDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedQuiz?.title} - Results</DialogTitle>
            <DialogDescription>
              View and download exam results
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="border rounded-md p-3">
                  <div className="text-xs text-muted-foreground mb-1">Attempts</div>
                  <div className="font-semibold">{quizResults.totalAttempts}</div>
                </div>
                <div className="border rounded-md p-3">
                  <div className="text-xs text-muted-foreground mb-1">Avg. Score</div>
                  <div className="font-semibold">
                    {quizResults.averageScore.toFixed(1)}
                  </div>
                </div>
                <div className="border rounded-md p-3">
                  <div className="text-xs text-muted-foreground mb-1">Highest</div>
                  <div className="font-semibold">{quizResults.highestScore}</div>
                </div>
              </div>
              
              {quizResults.totalAttempts > 0 ? (
                <Button className="w-full" onClick={handleDownloadResults}>
                  <DownloadCloud className="mr-2 h-4 w-4" />
                  Download Results (.csv)
                </Button>
              ) : (
                <div className="text-center text-sm text-muted-foreground">
                  No student has attempted this exam yet
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </TeacherLayout>
  );
};

interface ExamTableProps {
  quizzes: Quiz[];
  onToggleActive: (quiz: Quiz) => void;
  onDeleteDialogOpen: (quiz: Quiz) => void;
  onViewResults: (quiz: Quiz) => void;
}

const ExamTable = ({ quizzes, onToggleActive, onDeleteDialogOpen, onViewResults }: ExamTableProps) => {
  if (quizzes.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No exams found</p>
      </div>
    );
  }
  
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead className="hidden md:table-cell">Created On</TableHead>
          <TableHead className="hidden md:table-cell">Duration</TableHead>
          <TableHead className="hidden md:table-cell">Questions</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {quizzes.map((quiz) => (
          <TableRow key={quiz.id}>
            <TableCell className="font-medium">{quiz.title}</TableCell>
            <TableCell className="hidden md:table-cell">
              {format(new Date(quiz.createdOn), 'dd MMM yyyy')}
            </TableCell>
            <TableCell className="hidden md:table-cell">{quiz.duration} mins</TableCell>
            <TableCell className="hidden md:table-cell">{quiz.totalMarks}</TableCell>
            <TableCell>
              <div className="flex items-center space-x-2">
                <Switch 
                  checked={quiz.isActive} 
                  onCheckedChange={() => onToggleActive(quiz)} 
                  aria-label="Toggle active"
                />
                <Label>
                  <Badge className={quiz.isActive ? "bg-green-500" : "bg-gray-400"}>
                    {quiz.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </Label>
              </div>
            </TableCell>
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onViewResults(quiz)}>
                    <Eye className="mr-2 h-4 w-4" />
                    <span>View Results</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <FileText className="mr-2 h-4 w-4" />
                    <span>View Questions</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => onDeleteDialogOpen(quiz)}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash className="mr-2 h-4 w-4" />
                    <span>Delete Exam</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default ManageExams;
