import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface LeafNodeInfo {
  name: string;
  percentage: string;
}

interface SidebarProps {
  onSelectLeafNode: (leafNode: string) => void;
  selectedLeafNode: string | null;
}

const Sidebar: React.FC<SidebarProps> = ({ onSelectLeafNode, selectedLeafNode }) => {
  const [leafNodes, setLeafNodes] = useState<LeafNodeInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLeafNodes();
  }, []);

  const fetchLeafNodes = async () => {
    try {
      const response = await fetch('/api/getLeafNodes');
      if (!response.ok) {
        throw new Error('Failed to fetch leaf nodes');
      }
      const data = await response.json();
      setLeafNodes(data);
    } catch (err) {
      console.error('Error fetching Leaf Nodes:', err);
      setError('Failed to load Leaf Nodes. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return <div className="p-4 dark:text-white">Loading Leaf Nodes...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500 dark:text-red-400">{error}</div>;
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-800">
      <h2 className="text-2xl font-bold p-4 dark:text-white">Leaf Nodes</h2>
      <div className="flex-grow overflow-y-auto">
        {leafNodes.map((node) => (
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
        ))}
      </div>
    </div>
  );
};

export default Sidebar;