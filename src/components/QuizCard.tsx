
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock } from 'lucide-react';
import { Quiz } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';

interface QuizCardProps {
  quiz: Quiz;
  isTeacher?: boolean;
  onAction?: (quiz: Quiz) => void;
  actionLabel?: string;
}

const QuizCard = ({ quiz, isTeacher = false, onAction, actionLabel = 'Take Quiz' }: QuizCardProps) => {
  const navigate = useNavigate();
  
  const handleAction = () => {
    if (onAction) {
      onAction(quiz);
    } else {
      navigate(isTeacher ? `/teacher/quiz/${quiz.id}` : `/student/exam/${quiz.id}`);
    }
  };
  
  return (
    <Card className="shadow-md hover:shadow-lg transition-all duration-300 h-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-xl font-bold">{quiz.title}</CardTitle>
        <CardDescription>{quiz.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="grid gap-2">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 opacity-70" />
            <span>Created {formatDistanceToNow(new Date(quiz.createdOn), { addSuffix: true })}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 opacity-70" />
            <span>{quiz.duration} minutes</span>
          </div>
          <div className="mt-2">
            <div className="font-medium">Total marks: {quiz.totalMarks}</div>
            <div className="text-sm opacity-80">By: {quiz.createdBy}</div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleAction} 
          className="w-full gradient-primary"
          disabled={!quiz.isActive && !isTeacher}
        >
          {!quiz.isActive && !isTeacher ? 'Not Available' : actionLabel}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default QuizCard;
