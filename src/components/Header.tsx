import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Moon, Sun, Plus, Trash2, Download } from "lucide-react";

interface HeaderProps {
  selectedLeafNode: string | null;
  expandAll: boolean;
  setExpandAll: (expand: boolean) => void;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  onProcessArticles: (prompt: string) => Promise<void>;
  isProcessing: boolean;
  entries: Entry[];
  apiProvider: 'anthropic' | 'openai';
  setApiProvider: (provider: 'anthropic' | 'openai') => void;
}

interface QuestionPair {
  itemName: string;
  question: string;
}

interface Entry {
  Leaf_Nodes: string;
  OpenAI_Summary: string;
  ArticleBody: string;
  AIResponse?: string;
}

const Header: React.FC<HeaderProps> = ({
  selectedLeafNode,
  expandAll,
  setExpandAll,
  darkMode,
  setDarkMode,
  onProcessArticles,
  isProcessing,
  entries,
  apiProvider,
  setApiProvider
}) => {
  const [questionPairs, setQuestionPairs] = useState<QuestionPair[]>([
    { itemName: "", question: "" },
  ]);

  const handleAddPair = () => {
    setQuestionPairs([...questionPairs, { itemName: "", question: "" }]);
  };

  const handleRemovePair = (index: number) => {
    const newPairs = questionPairs.filter((_, i) => i !== index);
    setQuestionPairs(newPairs);
  };

  const handlePairChange = (index: number, field: 'itemName' | 'question', value: string) => {
    const newPairs = [...questionPairs];
    newPairs[index][field] = value;
    setQuestionPairs(newPairs);
  };

  const handleProcessArticles = () => {
    const jsonPrompt = questionPairs.reduce((acc, pair) => {
      if (pair.itemName && pair.question) {
        acc[pair.itemName] = pair.question;
      }
      return acc;
    }, {} as Record<string, string>);

    const promptString = "Respond in a json format: " + JSON.stringify(jsonPrompt);
    onProcessArticles(promptString);
  };

  const handleDownloadJSON = () => {
    const resultsData = entries.map(entry => {
      let extractedValues: any;
      if (entry.AIResponse) {
        try {
          extractedValues = JSON.parse(entry.AIResponse);
        } catch (error) {
          console.error('Failed to parse AIResponse:', error);
          extractedValues = entry.AIResponse;
        }
      } else {
        extractedValues = null;
      }
  
      return {
        Leaf_Nodes: entry.Leaf_Nodes,
        Extracted_Values: extractedValues
      };
    });
  
    const fullResults = {
      info: {
        SelectedLeafNode: selectedLeafNode,
        SelectedAPIProvider: apiProvider
      },
      data: resultsData
    };
  
    const jsonString = JSON.stringify(fullResults, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'result.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-md p-4">
      <div className="flex flex-col space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold dark:text-white">{selectedLeafNode || 'Select a Leaf Node'}</h1>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Button
                onClick={handleDownloadJSON}
                variant="outline"
                size="sm"
                className="bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600"
                disabled={entries.length === 0 || !entries.some(entry => entry.AIResponse)}
              >
                <Download className="h-4 w-4 mr-2" /> Download JSON
              </Button>
              <div className="flex items-center space-x-2">
                  <Switch
                    id="api-provider"
                    checked={apiProvider === 'anthropic'}
                    onCheckedChange={(checked) => setApiProvider(checked ? 'anthropic' : 'openai')}
                    className="dark:bg-gray-600"
                  />
                  <Label 
                    htmlFor="api-provider" 
                    className="text-gray-700 dark:text-gray-300 flex items-center cursor-pointer"
                  >
                    {apiProvider === 'anthropic' ? 'Anthropic' : 'OpenAI'}
                  </Label>
                </div>
              <Switch
                id="expand-all"
                checked={expandAll}
                onCheckedChange={setExpandAll}
                className="dark:bg-gray-600"
              />
              <Label 
                htmlFor="expand-all" 
                className="text-gray-700 dark:text-gray-300 flex items-center cursor-pointer"
              >
                {expandAll ? 'Collapse All' : 'Expand All'}
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="dark-mode"
                checked={darkMode}
                onCheckedChange={setDarkMode}
                className="dark:bg-gray-600"
              />
              <Label 
                htmlFor="dark-mode" 
                className="text-gray-700 dark:text-gray-300 cursor-pointer"
              >
                {darkMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              </Label>
            </div>
          </div>
        </div>
        <div className="flex flex-col space-y-2">
          <Label className="text-gray-700 dark:text-gray-300">Enter Questions:</Label>
          {questionPairs.map((pair, index) => (
            <div key={index} className="flex space-x-2">
              <Input
                placeholder="e.g., Sale Value"
                value={pair.itemName}
                onChange={(e) => handlePairChange(index, 'itemName', e.target.value)}
                className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 border-gray-300 dark:border-gray-600 w-1/3"
              />
              <Input
                placeholder="e.g., What is the value of the sale?        (Only respond in $ amounts, Answer None if applicable)"
                value={pair.question}
                onChange={(e) => handlePairChange(index, 'question', e.target.value)}
                className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 border-gray-300 dark:border-gray-600 w-2/3"
              />
              <Button
                onClick={() => handleRemovePair(index)}
                variant="ghost"
                size="icon"
                className="text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                disabled={questionPairs.length === 1}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button
            onClick={handleAddPair}
            variant="outline"
            className="bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600"
          >
            <Plus className="h-4 w-4 mr-2" /> Add Question
          </Button>
          <Button 
            onClick={handleProcessArticles} 
            disabled={isProcessing} 
            className="bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-700 dark:hover:bg-blue-600"
          >
            {isProcessing ? 'Processing...' : 'Process Questions'}
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;