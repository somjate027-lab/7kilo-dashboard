import React, { useState, useRef } from 'react';
import { Send, RotateCw, ChevronDown, Zap, StopCircle } from 'lucide-react';
import { centerSystemPrompt, agentPrompts, agentLabels } from '../agents/centerAgent';

const AGENTS = {
  CENTER: { label: '🕵️ Center (7กิโล๊ะ)', prompt: centerSystemPrompt },
  ...Object.fromEntries(
    Object.entries(agentPrompts).map(([key, prompt]) => [
      key,
      { label: agentLabels[key], prompt }
    ])
  )
};

export default function AgentTester() {
  const [selectedAgent, setSelectedAgent] = useState('CENTER');
  const [showDropdown, setShowDropdown] = useState(false);
  const [inputText, setInputText] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState('llama-3.3-70b-versatile');
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const abortRef = useRef(null);

  const handleTest = async () => {
    if (!inputText.trim() || isLoading) return;
    setResponse('');
    setIsLoading(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const apiKey = import.meta.env.VITE_GROQ_API_KEY;
      if (!apiKey) throw new Error('VITE_GROQ_API_KEY not set');

      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        signal: controller.signal,
        body: JSON.stringify({
          model: selectedModel,
          stream: true,
          messages: [
            { role: 'system', content: AGENTS[selectedAgent].prompt },
            { role: 'user', content: inputText }
          ]
        })
      });

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        for (const line of lines) {
          const t = line.trim();
          if (!t || t === 'data: [DONE]') continue;
          if (t.startsWith('data: ')) {
            try {
              const delta = JSON.parse(t.slice(6)).choices[0]?.delta?.content || '';
              if (delta) setResponse(prev => prev + delta);
            } catch {}
          }
        }
      }
    } catch (err) {
      if (err.name !== 'AbortError') setResponse(`Error: ${err.message}`);
    } finally {
      setIsLoading(false);
      abortRef.current = null;
    }
  };

  return (
    <div className="flex-1 flex gap-4 p-6 bg-[#fcfdfe] overflow-hidden">

      {/* Left — Input Panel */}
      <div className="flex flex-col w-[420px] shrink-0 gap-4">

        {/* Agent Selector */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">เลือก Agent</div>
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="w-full flex items-center justify-between px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:border-indigo-300 transition-all cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-indigo-500 fill-indigo-100" />
                {AGENTS[selectedAgent].label}
              </span>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>
            {showDropdown && (
              <div className="absolute top-full mt-1 w-full bg-white border border-slate-150 rounded-xl shadow-lg z-10 overflow-hidden">
                {Object.entries(AGENTS).map(([key, val]) => (
                  <button
                    key={key}
                    onClick={() => { setSelectedAgent(key); setShowDropdown(false); setResponse(''); }}
                    className={`w-full text-left px-4 py-2.5 text-sm font-medium hover:bg-slate-50 transition-colors cursor-pointer ${selectedAgent === key ? 'text-indigo-600 bg-indigo-50/50' : 'text-slate-700'}`}
                  >
                    {val.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* System Prompt Preview */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex-1 overflow-hidden flex flex-col">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">System Prompt</div>
          <pre className="text-[11px] text-slate-500 whitespace-pre-wrap font-mono leading-relaxed overflow-y-auto flex-1 bg-slate-50 rounded-xl p-3">
            {AGENTS[selectedAgent].prompt}
          </pre>
        </div>

        {/* Model Selector */}
        <div className="relative">
          <button
            onClick={() => setShowModelDropdown(!showModelDropdown)}
            className="w-full flex items-center justify-between px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:border-indigo-300 transition-all cursor-pointer"
          >
            <span>{selectedModel}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>
          {showModelDropdown && (
            <div className="absolute bottom-full mb-1 w-full bg-white border border-slate-150 rounded-xl shadow-lg z-10 overflow-hidden">
              {['llama-3.3-70b-versatile', 'llama-3.1-70b-versatile', 'mixtral-8x7b-32768'].map(m => (
                <button key={m} onClick={() => { setSelectedModel(m); setShowModelDropdown(false); }}
                  className={`w-full text-left px-4 py-2 text-xs font-medium hover:bg-slate-50 cursor-pointer ${selectedModel === m ? 'text-indigo-600' : 'text-slate-700'}`}>
                  {m}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right — Chat Panel */}
      <div className="flex-1 flex flex-col bg-white border border-slate-200 rounded-2xl overflow-hidden">

        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
          <div className="text-sm font-bold text-slate-800">
            ทดสอบ — <span className="text-indigo-600">{AGENTS[selectedAgent].label}</span>
          </div>
          <button
            onClick={() => { setResponse(''); setInputText(''); }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-lg transition-all cursor-pointer border border-slate-100"
          >
            <RotateCw className="w-3.5 h-3.5" />
            Clear
          </button>
        </div>

        {/* Response Area */}
        <div className="flex-1 overflow-y-auto p-5">
          {response ? (
            <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{response}</div>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-300 text-sm">
              พิมพ์ข้อความแล้วกด Send เพื่อทดสอบ agent...
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-slate-100">
          <div className="flex gap-2">
            <textarea
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleTest(); } }}
              placeholder="พิมพ์ข้อความทดสอบ... (Enter = ส่ง)"
              className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-indigo-400 resize-none h-12"
              disabled={isLoading}
            />
            {isLoading ? (
              <button
                onClick={() => abortRef.current?.abort()}
                className="px-4 py-2 bg-rose-50 border border-rose-100 text-rose-500 rounded-xl text-xs font-bold hover:bg-rose-100 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <StopCircle className="w-4 h-4" />
                Stop
              </button>
            ) : (
              <button
                onClick={handleTest}
                disabled={!inputText.trim()}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${inputText.trim() ? 'bg-slate-900 text-white hover:bg-slate-800 shadow-md' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
              >
                <Send className="w-4 h-4" />
                Send
              </button>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
