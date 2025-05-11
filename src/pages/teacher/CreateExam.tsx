
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import TeacherLayout from '@/components/TeacherLayout';
import PageHeader from '@/components/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Plus, Trash2, ChevronDown, ChevronUp, Save } from 'lucide-react';
import { toast } from 'sonner';
import { quizService, questionService } from '@/services/mockServices';
import { Question } from '@/types';

const CreateExam = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [examTitle, setExamTitle] = useState('');
  const [examDescription, setExamDescription] = useState('');
  const [examDuration, setExamDuration] = useState(30); // minutes
  const [isActive, setIsActive] = useState(true);
  
  const [questions, setQuestions] = useState<Omit<Question, 'id' | 'quizId'>[]>([{
    questionText: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    difficulty: 'medium'
  }]);
  
  const addQuestion = () => {
    setQuestions([
      ...questions, 
      {
        questionText: '',
        options: ['', '', '', ''],
        correctAnswer: 0,
        difficulty: 'medium'
      }
    ]);
  };
  
  const removeQuestion = (index: number) => {
    if (questions.length === 1) {
      toast.error('Exam must have at least one question');
      return;
    }
    
    setQuestions(questions.filter((_, i) => i !== index));
  };
  
  const moveQuestionUp = (index: number) => {
    if (index === 0) return;
    
    const newQuestions = [...questions];
    const temp = newQuestions[index];
    newQuestions[index] = newQuestions[index - 1];
    newQuestions[index - 1] = temp;
    
    setQuestions(newQuestions);
  };
  
  const moveQuestionDown = (index: number) => {
    if (index === questions.length - 1) return;
    
    const newQuestions = [...questions];
    const temp = newQuestions[index];
    newQuestions[index] = newQuestions[index + 1];
    newQuestions[index + 1] = temp;
    
    setQuestions(newQuestions);
  };
  
  const updateQuestionText = (index: number, text: string) => {
    const newQuestions = [...questions];
    newQuestions[index].questionText = text;
    setQuestions(newQuestions);
  };
  
  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].options[optionIndex] = value;
    setQuestions(newQuestions);
  };
  
  const updateCorrectAnswer = (questionIndex: number, value: number) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].correctAnswer = value;
    setQuestions(newQuestions);
  };
  
  const updateDifficulty = (questionIndex: number, value: 'easy' | 'medium' | 'hard') => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].difficulty = value;
    setQuestions(newQuestions);
  };
  
  const validateExam = () => {
    if (!examTitle.trim()) {
      toast.error('Exam title is required');
      return false;
    }
    
    if (examDuration < 5) {
      toast.error('Exam duration must be at least 5 minutes');
      return false;
    }
    
    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      
      if (!question.questionText.trim()) {
        toast.error(`Question ${i + 1} text is required`);
        return false;
      }
      
      for (let j = 0; j < question.options.length; j++) {
        if (!question.options[j].trim()) {
          toast.error(`Option ${j + 1} for Question ${i + 1} is required`);
          return false;
        }
      }
    }
    
    return true;
  };
  
  const handleSubmit = () => {
    if (!validateExam() || !user) return;
    
    try {
      // Create the quiz
      const quiz = quizService.create({
        title: examTitle,
        description: examDescription,
        createdBy: user.name,
        createdOn: new Date().toISOString(),
        duration: examDuration,
        totalMarks: questions.length,
        isActive
      });
      
      // Add questions
      questionService.bulkCreate(quiz.id, questions);
      
      toast.success('Exam created successfully!');
      navigate('/teacher/manage-exams');
    } catch (error) {
      console.error('Error creating exam:', error);
      toast.error('Failed to create exam. Please try again.');
    }
  };

  return (
    <TeacherLayout activeTab="create">
      <div className="animate-fade-in">
        <PageHeader
          title="Create New Exam"
          description="Define exam details and add questions"
        />
        
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Exam Details</CardTitle>
              <CardDescription>
                Provide the basic information about the exam
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="exam-title">Exam Title</Label>
                <Input 
                  id="exam-title" 
                  placeholder="Enter exam title" 
                  value={examTitle}
                  onChange={(e) => setExamTitle(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="exam-description">Exam Description</Label>
                <Textarea 
                  id="exam-description" 
                  placeholder="Enter exam description" 
                  value={examDescription}
                  onChange={(e) => setExamDescription(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Exam Duration (minutes): {examDuration}</Label>
                <Slider
                  value={[examDuration]}
                  onValueChange={(value) => setExamDuration(value[0])}
                  min={5}
                  max={180}
                  step={5}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="exam-status">Exam Status</Label>
                <RadioGroup defaultValue="active" value={isActive ? "active" : "inactive"} onValueChange={(v) => setIsActive(v === "active")}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="active" id="active" />
                    <Label htmlFor="active">Active</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="inactive" id="inactive" />
                    <Label htmlFor="inactive">Inactive</Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
          </Card>
          
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Questions</h2>
              <Button onClick={addQuestion}>
                <Plus className="mr-2 h-4 w-4" />
                Add Question
              </Button>
            </div>
            
            {questions.map((question, questionIndex) => (
              <Card key={questionIndex} className="relative">
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    <span>Question {questionIndex + 1}</span>
                    <div className="flex space-x-1">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => moveQuestionUp(questionIndex)}
                        disabled={questionIndex === 0}
                      >
                        <ChevronUp className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => moveQuestionDown(questionIndex)}
                        disabled={questionIndex === questions.length - 1}
                      >
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => removeQuestion(questionIndex)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor={`question-${questionIndex}`}>Question Text</Label>
                    <Textarea 
                      id={`question-${questionIndex}`} 
                      placeholder="Enter the question" 
                      value={question.questionText}
                      onChange={(e) => updateQuestionText(questionIndex, e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Options</Label>
                    <div className="space-y-3">
                      {question.options.map((option, optionIndex) => (
                        <div key={optionIndex} className="flex items-center space-x-2">
                          <RadioGroup
                            value={question.correctAnswer.toString()}
                            onValueChange={(value) => updateCorrectAnswer(questionIndex, parseInt(value))}
                          >
                            <RadioGroupItem 
                              value={optionIndex.toString()} 
                              id={`q${questionIndex}-option${optionIndex}`} 
                            />
                          </RadioGroup>
                          <Input 
                            placeholder={`Option ${optionIndex + 1}`} 
                            value={option}
                            onChange={(e) => updateOption(questionIndex, optionIndex, e.target.value)}
                            className="flex-1"
                          />
                        </div>
                      ))}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Select the radio button next to the correct answer
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor={`difficulty-${questionIndex}`}>Difficulty</Label>
                    <Select 
                      value={question.difficulty} 
                      onValueChange={(value) => updateDifficulty(questionIndex, value as 'easy' | 'medium' | 'hard')}
                    >
                      <SelectTrigger id={`difficulty-${questionIndex}`}>
                        <SelectValue placeholder="Select difficulty" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            <div className="flex justify-end">
              <Button variant="outline" className="mr-2" onClick={() => navigate('/teacher/dashboard')}>
                Cancel
              </Button>
              <Button className="gradient-primary" onClick={handleSubmit}>
                <Save className="mr-2 h-4 w-4" />
                Create Exam
              </Button>
            </div>
          </div>
        </div>
      </div>
    </TeacherLayout>
  );
};

export default CreateExam;
