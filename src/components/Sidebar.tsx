import React, { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import DepthSelector from './DepthSelector';
import debounce from 'lodash/debounce';
import { motion, AnimatePresence } from 'framer-motion';
import { Skeleton } from "./ui/skeleton";
import Image from 'next/image';

interface LeafNodeInfo {
  name: string;
  percentage: string;
}

interface SidebarProps {
  onSelectLeafNode: (leafNode: string) => void;
  selectedLeafNode: string | null;
  currentDepth: number;
  maxDepth: number;
  onDepthChange: (depth: number) => void;
  darkMode: boolean;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  onSelectLeafNode, 
  selectedLeafNode,  
  currentDepth,
  maxDepth,
  onDepthChange,
  darkMode,
  loading,
  setLoading
}) => {
  const [leafNodes, setLeafNodes] = useState<LeafNodeInfo[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchLeafNodes = useCallback(async (depth: number) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/getLeafNodes?depth=${depth}`);
      if (!response.ok) {
        throw new Error('Failed to fetch leaf nodes');
      }
      const data = await response.json();
      setLeafNodes(data);
    } catch (err) {
      console.error('Error fetching Leaf Nodes:', err);
      onDepthChange(1);
    } finally {
      setLoading(false);
    }
  }, [onDepthChange, setLoading]);

  const debouncedFetchLeafNodes = useCallback(
    debounce((depth: number) => {
      fetchLeafNodes(depth);
    }, 300),
    [fetchLeafNodes]
  );

  useEffect(() => {
    debouncedFetchLeafNodes(currentDepth);
    return () => debouncedFetchLeafNodes.cancel();
  }, [currentDepth, debouncedFetchLeafNodes]);

  return (
    <div className={`h-full flex flex-col ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'}`}>
      <h2 className={`text-2xl font-bold p-4 ${darkMode ? 'text-white' : 'text-black'}`}>Leaf Nodes</h2>
      <div className="px-4 mb-4">
        <DepthSelector
          maxDepth={maxDepth}
          currentDepth={currentDepth}
          onDepthChange={onDepthChange}
          darkMode={darkMode}
        />
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentDepth}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
          className="flex-grow overflow-y-auto"
        >
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <Image
                src="/loading.gif"
                alt="Loading..."
                width={100}
                height={100}
                className="rounded-full"
              />
            </div>
          ) : (
            leafNodes.map((node) => (
              <Button
                key={node.name}
                variant={selectedLeafNode === node.name ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start p-2 text-left whitespace-normal break-words",
                  selectedLeafNode === node.name
                    ? "dark:bg-white dark:text-gray-800"
                    : "dark:text-white dark:hover:bg-gray-700"
                )}
                onClick={() => onSelectLeafNode(node.name)}
              >
                <span className="flex justify-between w-full">
                  <span>{node.name}</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {node.percentage}%
                  </span>
                </span>
              </Button>
            ))
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default React.memo(Sidebar);