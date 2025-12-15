import { useState, useEffect } from "react";

const STORAGE_KEY = "beeonme_search_history";
const MAX_HISTORY = 10;

export interface SearchHistoryItem {
  query: string;
  timestamp: number;
  type: "text" | "hashtag" | "user" | "community";
}

export function useSearchHistory() {
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as SearchHistoryItem[];
        setHistory(parsed);
      }
    } catch (error) {
      console.error("Failed to load search history:", error);
    }
  }, []);

  // Save to localStorage whenever history changes
  const saveHistory = (newHistory: SearchHistoryItem[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
      setHistory(newHistory);
    } catch (error) {
      console.error("Failed to save search history:", error);
    }
  };

  const addToHistory = (query: string, type: SearchHistoryItem["type"] = "text") => {
    if (!query || !query.trim()) return;

    const newItem: SearchHistoryItem = {
      query: query.trim(),
      timestamp: Date.now(),
      type,
    };

    // Remove duplicates and add to front
    const filtered = history.filter(
      (item) => item.query.toLowerCase() !== newItem.query.toLowerCase()
    );
    const newHistory = [newItem, ...filtered].slice(0, MAX_HISTORY);
    
    saveHistory(newHistory);
  };

  const removeFromHistory = (query: string) => {
    const newHistory = history.filter(
      (item) => item.query.toLowerCase() !== query.toLowerCase()
    );
    saveHistory(newHistory);
  };

  const clearHistory = () => {
    saveHistory([]);
  };

  return {
    history,
    addToHistory,
    removeFromHistory,
    clearHistory,
  };
}
