'use client'

import React, { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import Sidebar from './Sidebar';
import Header from './Header';
import MainContent from './MainContent';
import LoadingModal from './LoadingModal';

interface Entry {
  Leaf_Nodes: string;
  OpenAI_Summary: string;
  ArticleBody: string;
  AnthropicResult?: string;
}

const MainLayout = () => {
  const [selectedLeafNode, setSelectedLeafNode] = useState<string | null>(null);
  const [expandAll, setExpandAll] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingModalOpen, setIsLoadingModalOpen] = useState(false);

  useEffect(() => {
    if (selectedLeafNode) {
      fetchEntries();
    }
  }, [selectedLeafNode]);

  const fetchEntries = async () => {
    if (!selectedLeafNode) return;

    setLoading(true);
    setError(null);
    setIsLoadingModalOpen(true);
    try {
      const response = await fetch(`/api/getEntries?leafNode=${encodeURIComponent(selectedLeafNode)}`);
      if (!response.ok) {
        throw new Error('Failed to fetch entries');
      }
      const data = await response.json();
      setEntries(data);
    } catch (err) {
      console.error('Error fetching entries:', err);
      setError('Failed to load entries. Please try again later.');
    } finally {
      setLoading(false);
      setIsLoadingModalOpen(false);
    }
  };

  const processArticles = async (prompt: string) => {
    setIsProcessing(true);
    setIsLoadingModalOpen(true);
    try {
      const articleBodies = entries.map(entry => entry.ArticleBody);
      const response = await fetch('/api/AnthropicAPI', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          articles: articleBodies,
          prompt,
        }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to process articles: ${response.status} ${response.statusText}. Details: ${JSON.stringify(errorData)}`);
      }
  
      const data = await response.json();
      
      const updatedEntries = entries.map((entry, index) => ({
        ...entry,
        AnthropicResult: data.results[index],
      }));
      
      setEntries(updatedEntries);
      console.log('Processed entries:', updatedEntries);
    } catch (error) {
      console.error('Error processing articles:', error);
      // Optionally, you can set an error state here to display to the user
      // setError(error.message);
    } finally {
      setIsProcessing(false);
      setIsLoadingModalOpen(false);
    }
  };
  return (
    <div className={`flex h-screen bg-gray-100 dark:bg-gray-900 ${darkMode ? 'dark' : ''}`}>
      {/* Mobile Sidebar */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="lg:hidden fixed top-4 left-4 z-50 dark:bg-gray-800 dark:text-white">
            <Menu className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[300px] sm:w-[400px] p-0 dark:bg-gray-800">
          <Sidebar
            onSelectLeafNode={setSelectedLeafNode}
            selectedLeafNode={selectedLeafNode}
          />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-64 h-screen overflow-hidden dark:bg-gray-800">
        <Sidebar
          onSelectLeafNode={setSelectedLeafNode}
          selectedLeafNode={selectedLeafNode}
        />
      </div>

      <div className="flex flex-col flex-1 overflow-hidden">
        <Header 
          selectedLeafNode={selectedLeafNode} 
          expandAll={expandAll}
          setExpandAll={setExpandAll}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          onProcessArticles={processArticles}
          isProcessing={isProcessing}
          entries={entries}
        />
        <MainContent 
          selectedLeafNode={selectedLeafNode}
          expandAll={expandAll}
          entries={entries}
          darkMode={darkMode}
        />
      </div>

      <LoadingModal 
        isOpen={isLoadingModalOpen}
        message={isProcessing ? "Processing articles..." : "Loading data..."}
      />
    </div>
  );
};

export default MainLayout;