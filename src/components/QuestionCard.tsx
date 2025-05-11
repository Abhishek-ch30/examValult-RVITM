import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Question } from '@/types';

interface QuestionCardProps {
  question: Question;
  questionNumber: number;
  onAnswerSelect: (questionId: string, selectedOption: number) => void;
  selectedOption?: number;
  showResult?: boolean;
}

const QuestionCard = ({ 
  question, 
  questionNumber, 
  onAnswerSelect,
  selectedOption,
  showResult = false
}: QuestionCardProps) => {
  const [selected, setSelected] = useState<number | undefined>(selectedOption);
  
  // Add anti-copying measures
  useEffect(() => {
    const preventCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      return false;
    };
    
    const preventShortcuts = (e: KeyboardEvent) => {
      // Prevent Ctrl+C, Ctrl+X, and F12
      if (
        ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'x' || e.key === 'v')) ||
        e.key === 'F12' ||
        e.key === 'PrintScreen'
      ) {
        e.preventDefault();
        return false;
      }
    };
    
    const preventContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };
    
    const preventDrag = (e: DragEvent) => {
      e.preventDefault();
      return false;
    };
    
    const preventSelection = () => {
      if (window.getSelection) {
        if (window.getSelection()?.empty) {
          window.getSelection()?.empty();
        } else if (window.getSelection()?.removeAllRanges) {
          window.getSelection()?.removeAllRanges();
        }
      }
    };
    
    // Add event listeners
    document.addEventListener('copy', preventCopy);
    document.addEventListener('cut', preventCopy);
    document.addEventListener('keydown', preventShortcuts);
    document.addEventListener('contextmenu', preventContextMenu);
    document.addEventListener('dragstart', preventDrag);
    document.addEventListener('select', preventSelection);
    
    // Add CSS to prevent selection
    const style = document.createElement('style');
    style.innerHTML = `
      .no-select {
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
      }
    `;
    document.head.appendChild(style);
    
    // Apply no-select to all question elements
    const questionElements = document.querySelectorAll('.question-text, .option-text');
    questionElements.forEach(el => el.classList.add('no-select'));
    
    // Cleanup
    return () => {
      document.removeEventListener('copy', preventCopy);
      document.removeEventListener('cut', preventCopy);
      document.removeEventListener('keydown', preventShortcuts);
      document.removeEventListener('contextmenu', preventContextMenu);
      document.removeEventListener('dragstart', preventDrag);
      document.removeEventListener('select', preventSelection);
      document.head.removeChild(style);
    };
  }, []);
  
  const handleOptionSelect = (optionIndex: number) => {
    if (showResult) return; // Disable selection if showing results
    setSelected(optionIndex);
    onAnswerSelect(question.id, optionIndex);
  };
  
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'hard':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };
  
  const getOptionClass = (optionIndex: number) => {
    if (!showResult) return '';
    
    if (optionIndex === question.correctAnswer) {
      return 'bg-green-100 border-green-500';
    }
    
    if (optionIndex === selected && optionIndex !== question.correctAnswer) {
      return 'bg-red-100 border-red-500';
    }
    
    return '';
  };

  return (
    <Card className="mb-6 shadow-md hover:shadow-lg transition-shadow animate-scale-in">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl font-medium">Question {questionNumber}</CardTitle>
        <Badge className={getDifficultyColor(question.difficulty) + " capitalize"}>
          {question.difficulty}
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="mb-4 text-lg question-text no-select">{question.questionText}</div>
        <RadioGroup value={selected?.toString()} className="space-y-3">
          {question.options.map((option, index) => (
            <div 
              key={index} 
              className={`flex items-center border rounded-md p-3 cursor-pointer transition-all hover:border-primary ${
                selected === index ? 'border-primary bg-primary/10' : ''
              } ${getOptionClass(index)}`}
              onClick={() => handleOptionSelect(index)}
            >
              <RadioGroupItem 
                value={index.toString()} 
                id={"option-" + question.id + "-" + index} 
                disabled={showResult}
              />
              <Label 
                htmlFor={"option-" + question.id + "-" + index} 
                className="pl-2 cursor-pointer flex-1 option-text no-select"
              >
                {option}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </CardContent>
    </Card>
  );
};

export default QuestionCard;