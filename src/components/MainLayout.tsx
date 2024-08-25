'use client'

import React, { useState, useEffect, useCallback } from 'react';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import Pagination from './Pagination';
import Sidebar from './Sidebar';
import Header from './Header';
import MainContent from './MainContent';
import LoadingModal from './LoadingModal';
import { on } from 'events';

interface Entry {
  Leaf_Nodes: string;
  OpenAI_Summary: string;
  ArticleBody: string;
  AIResponse?: string;
}

const MainLayout = () => {
  const [selectedLeafNode, setSelectedLeafNode] = useState<string | null>(null);
  const [expandAll, setExpandAll] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(false);
  const [sidebarLoading, setSidebarLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingModalOpen, setIsLoadingModalOpen] = useState(false);
  const [apiProvider, setApiProvider] = useState<'anthropic' | 'openai'>('openai');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(100);
  const [currentDepth, setCurrentDepth] = useState(1);
  const [maxDepth, setMaxDepth] = useState(1);

  useEffect(() => {
    fetchMaxDepth();
  }, []);

  useEffect(() => {
    if (selectedLeafNode) {
      fetchEntries();
    }
  }, [selectedLeafNode, currentPage, pageSize]);

  const fetchMaxDepth = async () => {
    try {
      const response = await fetch('/api/getMaxDepth');
      if (!response.ok) {
        throw new Error('Failed to fetch max depth');
      }
      const data = await response.json();
      console.log('Fetched maxDepth:', data); // Add this line
      setMaxDepth(data.maxDepth);
    } catch (err) {
      console.error('Error fetching max depth:', err);
      setError('Failed to load max depth. Please try again later.');
    }
  };

  const fetchEntries = async () => {
    if (!selectedLeafNode) return;
  
    setLoading(true);
    setError(null);
    setIsLoadingModalOpen(true);
    try {
      const response = await fetch(`/api/getEntries?leafNode=${encodeURIComponent(selectedLeafNode)}&page=${currentPage}&pageSize=${pageSize}`);
      if (!response.ok) {
        throw new Error('Failed to fetch entries');
      }
      const data = await response.json();
      setEntries(data.entries);
      setTotalPages(data.totalPages);
    } catch (err) {
      console.error('Error fetching entries:', err);
      setError('Failed to load entries. Please try again later.');
    } finally {
      setLoading(false);
      setIsLoadingModalOpen(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleDepthChange = useCallback((newDepth: number) => {
    console.log('Depth change requested:', newDepth);
    setCurrentDepth(newDepth);
  }, []);

  const processArticles = async (prompt: string) => {
    setIsProcessing(true);
    setIsLoadingModalOpen(true);
    try {
      const articleBodies = entries.map(entry => entry.ArticleBody);
      const response = await fetch(`/api/${apiProvider === 'openai' ? 'OpenAIAPI' : 'AnthropicAPI'}`, {
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
        AIResponse: data.results[index],
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
            currentDepth={currentDepth}
            maxDepth={maxDepth}
            onDepthChange={handleDepthChange}
            darkMode={darkMode}
            loading={sidebarLoading}
            setLoading={setSidebarLoading}
          />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-64 h-screen overflow-hidden dark:bg-gray-800">
        <Sidebar
          onSelectLeafNode={setSelectedLeafNode}
          selectedLeafNode={selectedLeafNode}
          currentDepth={currentDepth}
          maxDepth={maxDepth}
          onDepthChange={handleDepthChange}
          darkMode={darkMode}
          loading={sidebarLoading}
          setLoading={setSidebarLoading}
        />
      </div>

      <div className="flex flex-col flex-1 overflow-auto">
        <Header 
          selectedLeafNode={selectedLeafNode} 
          expandAll={expandAll}
          setExpandAll={setExpandAll}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          onProcessArticles={processArticles}
          isProcessing={isProcessing}
          entries={entries}
          apiProvider={apiProvider}
          setApiProvider={setApiProvider}
        />
        <MainContent 
          selectedLeafNode={selectedLeafNode}
          expandAll={expandAll}
          entries={entries}
          darkMode={darkMode}
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          apiProvider={apiProvider}
        />
        <div className={`
            ${darkMode 
              ? 'bg-gray-800 border-t border-gray-700' 
              : 'bg-gray-50 border-t border-gray-200'
            } 
            transition-colors duration-200
        `}>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            darkMode={darkMode}
          />
        </div>
        
      </div>

      <LoadingModal 
        isOpen={isLoadingModalOpen}
        message={isProcessing ? "Processing articles..." : "Loading data..."}
      />
    </div>
  );
};

export default MainLayout;