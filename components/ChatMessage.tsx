import React from 'react';
import { Message } from '../types';
import { User, Cpu, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';

  // Helper to determine status icon based on text content (simple heuristic for the "Expert" persona)
  const getStatusIcon = (text: string) => {
    if (text.includes("✅ COMPATIBLE")) return <CheckCircle2 className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />;
    if (text.includes("❌ INCOMPATIBLE")) return <XCircle className="w-5 h-5 text-red-500 mt-1 flex-shrink-0" />;
    if (text.includes("⚠️ WARNING")) return <AlertTriangle className="w-5 h-5 text-yellow-400 mt-1 flex-shrink-0" />;
    return <Cpu className="w-5 h-5 text-cyan-400 mt-1 flex-shrink-0" />;
  };

  // Basic markdown parser for bolding and newlines
  const renderContent = (text: string) => {
    return text.split('\n').map((line, i) => (
      <React.Fragment key={i}>
        {line.split(/(\*\*.*?\*\*)/).map((part, j) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={j} className="text-white font-bold">{part.slice(2, -2)}</strong>;
            }
            return <span key={j}>{part}</span>;
        })}
        <br />
      </React.Fragment>
    ));
  };

  return (
    <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[85%] md:max-w-[75%] gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 rounded border flex items-center justify-center 
          ${isUser 
            ? 'bg-indigo-600 border-indigo-500 text-white' 
            : 'bg-slate-800 border-slate-700 text-cyan-400'
          }`}>
          {isUser ? <User size={16} /> : <Cpu size={16} />}
        </div>

        {/* Message Bubble */}
        <div className={`flex flex-col p-4 rounded-lg border text-sm md:text-base shadow-sm
          ${isUser 
            ? 'bg-indigo-900/50 border-indigo-700/50 text-indigo-50 rounded-tr-none' 
            : 'bg-slate-900 border-slate-800 text-slate-300 rounded-tl-none font-mono'
          }`}>
          
          {/* Header for AI response to show visual status immediately */}
          {!isUser && (
            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-800">
               {getStatusIcon(message.text)}
               <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">Analysis Result</span>
            </div>
          )}

          <div className="leading-relaxed opacity-90">
            {renderContent(message.text)}
          </div>
          
          <span className="text-[10px] opacity-40 mt-2 text-right w-full block">
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    </div>
  );
};