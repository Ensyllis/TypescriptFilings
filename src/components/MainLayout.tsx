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
  const [aiResponses, setAiResponses] = useState<string[]>([]);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingModalOpen, setIsLoadingModalOpen] = useState(false);

  useEffect(() => {
    if (selectedLeafNode) {
      fetchEntries();
    }
  }, [selectedLeafNode]);

  useEffect(() => {
    if (selectedLeafNode && entries.length > 0) {
      const filtered = entries.filter(entry => 
        entry.Leaf_Nodes.split(', ').includes(selectedLeafNode)
      );
      setFilteredEntries(filtered);
    }
  }, [selectedLeafNode, entries]);

  const fetchEntries = async () => {
    setLoading(true);
    setError(null);
    setIsLoadingModalOpen(true);
    try {
      const response = await fetch('/api/readCSV');
      if (!response.ok) {
        throw new Error('Failed to fetch CSV data');
      }
      const data = await response.json();
      
      const filteredEntries = data.records.filter((entry: Entry) => 
        entry.Leaf_Nodes.split(', ').includes(selectedLeafNode!)
      );
      
      setEntries(filteredEntries);
    } catch (err) {
      console.error('Error fetching CSV data:', err);
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
      const articleBodies = filteredEntries.map(entry => entry.ArticleBody);
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
        throw new Error('Failed to process articles');
      }
  
      const data = await response.json();
      
      const updatedEntries = filteredEntries.map((entry, index) => ({
        ...entry,
        AnthropicResult: data.results[index],
      }));
      
      setFilteredEntries(updatedEntries);
      console.log('Processed entries:', updatedEntries);
    } catch (error) {
      console.error('Error processing articles:', error);
    } finally {
      setIsProcessing(false);
      setIsLoadingModalOpen(false);
    }
  };

  console.log('Current AI responses:', aiResponses);

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
        />
        <MainContent 
          selectedLeafNode={selectedLeafNode}
          expandAll={expandAll}
          entries={filteredEntries}
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