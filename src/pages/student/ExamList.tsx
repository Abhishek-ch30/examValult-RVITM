
import { useEffect, useState } from 'react';
import StudentLayout from '@/components/StudentLayout';
import PageHeader from '@/components/PageHeader';
import QuizCard from '@/components/QuizCard';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';
import { quizService, initializeDemoData } from '@/services/mockServices';
import { Quiz } from '@/types';
import { Search } from 'lucide-react';

const ExamList = () => {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
  
  useEffect(() => {
    // Initialize demo data if needed
    initializeDemoData();
    
    // Fetch active quizzes
    const activeQuizzes = quizService.getActiveQuizzes();
    setQuizzes(activeQuizzes);
  }, []);
  
  const sortedAndFilteredQuizzes = quizzes
    .filter(quiz => {
      return quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quiz.description.toLowerCase().includes(searchTerm.toLowerCase());
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.createdOn).getTime() - new Date(a.createdOn).getTime();
        case 'title':
          return a.title.localeCompare(b.title);
        case 'duration':
          return a.duration - b.duration;
        default:
          return 0;
      }
    });
  
  const handleQuizSelect = (quiz: Quiz) => {
    navigate(`/student/exam/${quiz.id}`);
  };

  return (
    <StudentLayout activeTab="exams">
      <div className="animate-fade-in">
        <PageHeader
          title="Available Exams"
          description="Browse and enroll in available exams"
        />
        
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search exams..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="w-full sm:w-48">
            <Label htmlFor="sort-by" className="sr-only">
              Sort by
            </Label>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger id="sort-by">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Latest first</SelectItem>
                <SelectItem value="title">Title (A-Z)</SelectItem>
                <SelectItem value="duration">Duration (Shortest first)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {sortedAndFilteredQuizzes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedAndFilteredQuizzes.map((quiz) => (
              <QuizCard
                key={quiz.id}
                quiz={quiz}
                onAction={handleQuizSelect}
                actionLabel="Take Exam"
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-2xl font-medium text-muted-foreground mb-2">No exams available</h3>
            <p className="text-muted-foreground">
              {searchTerm 
                ? `No exams match your search for "${searchTerm}"`
                : "There are no available exams at the moment. Please check back later."}
            </p>
          </div>
        )}
      </div>
    </StudentLayout>
  );
};

export default ExamList;
