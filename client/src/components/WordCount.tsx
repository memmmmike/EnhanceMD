import React, { useMemo } from 'react';
import { ClockIcon, DocumentTextIcon, LanguageIcon } from '@heroicons/react/24/outline';

interface WordCountProps {
  content: string;
  className?: string;
}

export const WordCount: React.FC<WordCountProps> = ({ content, className = '' }) => {
  const stats = useMemo(() => {
    // Remove markdown syntax for accurate count
    const plainText = content
      .replace(/```[\s\S]*?```/g, '') // Remove code blocks
      .replace(/`[^`]+`/g, '') // Remove inline code
      .replace(/!\[.*?\]\(.*?\)/g, '') // Remove images
      .replace(/\[([^\]]+)\]\(.*?\)/g, '$1') // Replace links with text
      .replace(/^#+\s+/gm, '') // Remove headers
      .replace(/^[-*]\s+/gm, '') // Remove list markers
      .replace(/^\|.*\|$/gm, '') // Remove table rows
      .replace(/^\s*[-:]+\s*$/gm, '') // Remove table separators
      .replace(/\*\*([^*]+)\*\*/g, '$1') // Remove bold
      .replace(/\*([^*]+)\*/g, '$1') // Remove italic
      .replace(/^>\s+/gm, '') // Remove blockquote markers
      .replace(/\n+/g, ' ') // Replace newlines with spaces
      .replace(/\s+/g, ' ') // Normalize spaces
      .trim();

    // Calculate statistics
    const words = plainText.split(/\s+/).filter(word => word.length > 0);
    const wordCount = words.length;
    const charCount = plainText.length;
    const charCountWithSpaces = content.length;
    
    // Average reading speed: 200-250 words per minute
    // Using 225 as average
    const readingTimeMinutes = Math.ceil(wordCount / 225);
    const readingTime = readingTimeMinutes === 1 ? '1 min' : `${readingTimeMinutes} mins`;

    // Calculate paragraphs and sentences (approximate)
    const paragraphs = content.split(/\n\n+/).filter(p => p.trim()).length;
    const sentences = plainText.split(/[.!?]+/).filter(s => s.trim()).length;

    return {
      words: wordCount,
      characters: charCount,
      charactersWithSpaces: charCountWithSpaces,
      readingTime,
      paragraphs,
      sentences,
      averageWordLength: wordCount > 0 ? (charCount / wordCount).toFixed(1) : '0'
    };
  }, [content]);

  return (
    <div className={`flex items-center gap-4 text-xs ${className}`}>
      <div className="flex items-center gap-1.5 text-gray-400">
        <DocumentTextIcon className="w-3.5 h-3.5" />
        <span>{stats.words.toLocaleString()} words</span>
      </div>
      
      <div className="w-px h-3 bg-gray-600" />
      
      <div className="flex items-center gap-1.5 text-gray-400">
        <LanguageIcon className="w-3.5 h-3.5" />
        <span>{stats.characters.toLocaleString()} chars</span>
      </div>
      
      <div className="w-px h-3 bg-gray-600" />
      
      <div className="flex items-center gap-1.5 text-gray-400">
        <ClockIcon className="w-3.5 h-3.5" />
        <span>{stats.readingTime} read</span>
      </div>
      
      {/* Detailed stats on hover */}
      <div className="group relative">
        <button className="text-gray-500 hover:text-gray-300 transition-colors text-[10px] font-medium px-1.5 py-0.5 rounded border border-gray-700 hover:border-gray-600">
          More
        </button>
        
        <div className="absolute bottom-full right-0 mb-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none">
          <div className="bg-gray-800 rounded-lg shadow-xl border border-gray-700 p-3 w-48">
            <div className="space-y-1.5 text-[11px]">
              <div className="flex justify-between">
                <span className="text-gray-400">Words:</span>
                <span className="text-white font-medium">{stats.words.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Characters:</span>
                <span className="text-white font-medium">{stats.characters.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">With spaces:</span>
                <span className="text-white font-medium">{stats.charactersWithSpaces.toLocaleString()}</span>
              </div>
              <div className="border-t border-gray-700 my-1.5" />
              <div className="flex justify-between">
                <span className="text-gray-400">Paragraphs:</span>
                <span className="text-white font-medium">{stats.paragraphs}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Sentences:</span>
                <span className="text-white font-medium">{stats.sentences}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Avg word length:</span>
                <span className="text-white font-medium">{stats.averageWordLength}</span>
              </div>
              <div className="border-t border-gray-700 my-1.5" />
              <div className="flex justify-between">
                <span className="text-gray-400">Reading time:</span>
                <span className="text-white font-medium">{stats.readingTime}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};