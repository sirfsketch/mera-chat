/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, type Chat } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

interface Message {
  sender: 'user' | 'bot';
  text: string;
}

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
  const chatRef = useRef<Chat | null>(null);

  useEffect(() => {
    chatRef.current = ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: 'You are a helpful assistant that speaks in Hinglish, with a Mumbai street style. Use words like \'apun\', \'bidu\', \'bantai\', \'kya bolreli public\', \'tension nahi lene ka\', \'ekdum rapchik\', \'jhakas\'. Your personality is friendly, a bit cheeky, and very helpful. Keep responses short and to the point.',
      },
    });
  }, []);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { sender: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setLoading(true);

    try {
      if (!chatRef.current) {
        throw new Error('Chat session not initialized');
      }
      
      const response = await chatRef.current.sendMessage({ message: currentInput });
      const text = response.text;

      const botMessage: Message = { sender: 'bot', text: text ?? "Arre, bolneko kuch samajh nahi aaya." };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        sender: 'bot',
        text: 'Arre bidu, server mein kuch lafda ho gaya. Thoda time ruk ke try kar.',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="app-container" className="bg-slate-900 text-white min-h-screen flex flex-col font-sans">
      <header id="app-header" className="bg-slate-800 p-4 border-b border-slate-700">
        <h1 id="app-title" className="text-2xl font-bold text-center text-emerald-400">Mumbai Bantai Chat</h1>
        <p id="app-tagline" className="text-center text-slate-400 text-sm">Apun se kuch bhi pooch, bidu!</p>
      </header>

      <main id="chat-container" className="flex-1 p-4 overflow-y-auto">
        <div id="message-list" className="space-y-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              id={`message-${index}`}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-lg p-3 rounded-2xl ${msg.sender === 'user' ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-200'}`}>
                <p>{msg.text}</p>
              </div>
            </div>
          ))}
          {loading && (
             <div id="loading-indicator" className="flex justify-start">
                <div className="bg-slate-700 text-slate-200 p-3 rounded-2xl">
                    <p>Soch rela hai, ek minute...</p>
                </div>
            </div>
          )}
        </div>
      </main>

      <footer id="input-container" className="p-4 bg-slate-800 border-t border-slate-700">
        <div className="flex items-center space-x-2">
          <input
            id="chat-input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !loading && sendMessage()}
            placeholder="Idhar type kar..."
            className="flex-1 p-3 bg-slate-700 rounded-xl border border-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white"
            disabled={loading}
          />
          <button
            id="send-button"
            onClick={sendMessage}
            disabled={loading}
            className="px-6 py-3 bg-emerald-600 rounded-xl hover:bg-emerald-700 disabled:bg-slate-600 disabled:cursor-not-allowed font-semibold transition-colors">
            Bhej
          </button>
        </div>
      </footer>
    </div>
  );
}
