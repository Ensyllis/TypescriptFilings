'use client'

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown, ChevronUp } from "lucide-react";

interface Entry {
  Leaf_Nodes: string;
  OpenAI_Summary: string;
  ArticleBody: string;
  AIResponse?: string;
}

interface MainContentProps {
  selectedLeafNode: string | null;
  expandAll: boolean;
  entries: Entry[];
  darkMode: boolean;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  apiProvider: 'anthropic' | 'openai';
}

const MainContent: React.FC<MainContentProps> = ({ 
  selectedLeafNode, 
  expandAll, 
  entries, 
  darkMode, 
  currentPage,
  totalPages,
  pageSize,
  apiProvider
}) => {
  const [expandedEntries, setExpandedEntries] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (expandAll) {
      setExpandedEntries(new Set(entries.map((_, index) => index)));
    } else {
      setExpandedEntries(new Set());
    }
  }, [expandAll, entries.length]);

  const toggleExpand = (index: number) => {
    setExpandedEntries(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  if (!selectedLeafNode) {
    return (
      <div className={`p-4 ${darkMode ? 'text-white bg-gray-800' : 'text-black bg-white'}`}>
        Please select a Leaf Node to view entries.
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className={`p-4 ${darkMode ? 'text-white bg-gray-800' : 'text-black bg-white'}`}>
        No entries found for this Leaf Node.
      </div>
    );
  }


  return (
    <div className="p-4 space-y-4 overflow-auto dark:bg-gray-900">
      {entries.map((entry, index) => {
        const entryNumber = (currentPage - 1) * pageSize + index + 1;
        return (
          <Card key={index} className="overflow-hidden dark:bg-gray-800 dark:text-white">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="dark:text-white">{`Entry ${entryNumber}`}</CardTitle>
            <button
              onClick={() => toggleExpand(index)}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors duration-200"
            >
              {expandedEntries.has(index) ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
          </CardHeader>
          <CardContent>
            <CardDescription className="dark:text-gray-300 mb-4">{entry.OpenAI_Summary}</CardDescription>
            
            {entry.AIResponse && (
              <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
                <h4 className="font-semibold mb-2 dark:text-white">
                  {apiProvider === 'openai' ? 'OpenAI' : 'Anthropic'} Response:
                </h4>
                <p className="text-sm whitespace-pre-wrap dark:text-gray-300">{entry.AIResponse}</p>
              </div>
            )}
            
            {expandedEntries.has(index) && (
              <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-600 rounded-md">
                <h4 className="font-semibold mb-2 dark:text-white">Full Article:</h4>
                <p className="text-sm whitespace-pre-wrap dark:text-gray-300">{entry.ArticleBody}</p>
              </div>
            )}
          </CardContent>
        </Card>
        );
      })}
    </div>
  );
};

export default MainContent;