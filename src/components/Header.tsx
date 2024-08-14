import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Moon, Sun, ChevronDown, ChevronUp } from "lucide-react";

interface HeaderProps {
  selectedLeafNode: string | null;
  expandAll: boolean;
  setExpandAll: (expand: boolean) => void;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  onProcessArticles: (prompt: string) => Promise<void>;
  isProcessing: boolean;
}

const Header: React.FC<HeaderProps> = ({
  selectedLeafNode,
  expandAll,
  setExpandAll,
  darkMode,
  setDarkMode,
  onProcessArticles,
  isProcessing
}) => {
  const [prompt, setPrompt] = useState('');

  const handleProcessArticles = () => {
    if (prompt.trim()) {
      onProcessArticles(prompt);
    }
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-md p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold dark:text-white">{selectedLeafNode || 'Select a Leaf Node'}</h1>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="expand-all"
              checked={expandAll}
              onCheckedChange={setExpandAll}
            />
            <Label htmlFor="expand-all" className="dark:text-white flex items-center">
              {expandAll ? (
                <>
                  Collapse All
                </>
              ) : (
                <>
                  Expand All
                </>
              )}
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="dark-mode"
              checked={darkMode}
              onCheckedChange={setDarkMode}
            />
            <Label htmlFor="dark-mode" className="dark:text-white">
              {darkMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </Label>
          </div>
          <Input
            type="text"
            placeholder="Enter LLM prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="dark:bg-gray-700 dark:text-white"
          />
          <Button 
            onClick={handleProcessArticles} 
            disabled={isProcessing} 
            className="dark:bg-blue-600 dark:hover:bg-blue-700"
          >
            {isProcessing ? 'Processing...' : 'Process'}
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;