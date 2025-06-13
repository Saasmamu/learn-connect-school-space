
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus } from 'lucide-react';

interface Question {
  id: string;
  question_text: string;
  question_type: 'mcq' | 'short_answer' | 'essay' | 'file_upload';
  points: number;
  options?: string[];
  correct_answer?: string;
  question_order: number;
}

interface QuestionBuilderProps {
  questions: Question[];
  onQuestionsChange: (questions: Question[]) => void;
}

export const QuestionBuilder: React.FC<QuestionBuilderProps> = ({
  questions,
  onQuestionsChange,
}) => {
  const addQuestion = () => {
    const newQuestion: Question = {
      id: crypto.randomUUID(),
      question_text: '',
      question_type: 'mcq',
      points: 1,
      options: ['', '', '', ''],
      correct_answer: '',
      question_order: questions.length,
    };
    onQuestionsChange([...questions, newQuestion]);
  };

  const updateQuestion = (index: number, updates: Partial<Question>) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], ...updates };
    onQuestionsChange(updated);
  };

  const removeQuestion = (index: number) => {
    const updated = questions.filter((_, i) => i !== index);
    onQuestionsChange(updated);
  };

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    const updated = [...questions];
    const options = [...(updated[questionIndex].options || [])];
    options[optionIndex] = value;
    updated[questionIndex] = { ...updated[questionIndex], options };
    onQuestionsChange(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Questions</h3>
        <Button onClick={addQuestion} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Question
        </Button>
      </div>

      {questions.map((question, index) => (
        <Card key={question.id}>
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle className="text-base">Question {index + 1}</CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{question.question_type}</Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeQuestion(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Question Type</label>
                <Select
                  value={question.question_type}
                  onValueChange={(value: any) => updateQuestion(index, { question_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mcq">Multiple Choice</SelectItem>
                    <SelectItem value="short_answer">Short Answer</SelectItem>
                    <SelectItem value="essay">Essay</SelectItem>
                    <SelectItem value="file_upload">File Upload</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Points</label>
                <Input
                  type="number"
                  value={question.points}
                  onChange={(e) => updateQuestion(index, { points: parseInt(e.target.value) || 1 })}
                  min="1"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Question Text</label>
              <Textarea
                value={question.question_text}
                onChange={(e) => updateQuestion(index, { question_text: e.target.value })}
                placeholder="Enter your question..."
                rows={3}
              />
            </div>

            {question.question_type === 'mcq' && (
              <div className="space-y-3">
                <label className="text-sm font-medium">Answer Options</label>
                {question.options?.map((option, optionIndex) => (
                  <div key={optionIndex} className="flex items-center gap-2">
                    <Input
                      value={option}
                      onChange={(e) => updateOption(index, optionIndex, e.target.value)}
                      placeholder={`Option ${String.fromCharCode(65 + optionIndex)}`}
                    />
                    <input
                      type="radio"
                      name={`correct-${question.id}`}
                      checked={question.correct_answer === option}
                      onChange={() => updateQuestion(index, { correct_answer: option })}
                    />
                    <span className="text-sm text-gray-500">Correct</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
