// app/chat/page.tsx
'use client';

import { useState, useRef } from 'react';

export default function ChatPage() {
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState<{ sender: 'user' | 'AI'; text: string; image?: string }[]>([]);
  const [file, setFile] = useState<{ mime_type: string; data: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!message.trim() && !file?.data) return;

    const userMsg = message.trim();
    setChat((prev) => [
      ...prev,
      { sender: 'user', text: userMsg, image: file ? `data:${file.mime_type};base64,${file.data}` : undefined },
    ]);
    setMessage('');
    setFile(null);
    setLoading(true);

    const body: any = {
      contents: [
        {
          parts: [
            { text: userMsg },
            ...(file ? [{ inline_data: file }] : []),
          ],
        },
      ],
    };

    try {
      const res = await fetch('/api/auth/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      setChat((prev) => [...prev, { sender: 'AI', text: data.response }]);
    } catch (err) {
      setChat((prev) => [...prev, { sender: 'AI', text: 'Error fetching response' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result?.toString().split(',')[1];
      if (base64) {
        setFile({ mime_type: file.type, data: base64 });
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-4">
      <div className="w-full max-w-2xl space-y-4">
        <div className="space-y-3 overflow-y-auto max-h-[70vh] border border-gray-700 rounded-lg p-4">
          {chat.map((msg, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-lg ${
                msg.sender === 'user' ? 'bg-blue-600 text-right' : 'bg-gray-700 text-left'
              }`}
            >
              <div>{msg.text}</div>
              {msg.image && (
                <img
                  src={msg.image}
                  alt="uploaded"
                  className="mt-2 max-w-xs rounded border"
                />
              )}
            </div>
          ))}
          {loading && <div className="p-3 bg-gray-600 rounded-lg text-left">AI is thinking...</div>}
        </div>

        <div className="flex gap-2 items-center">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            className="flex-1 p-2 rounded bg-white text-black"
            placeholder="Type your message..."
          />
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleFile}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-yellow-500 hover:bg-yellow-600 text-black px-3 py-2 rounded"
          >
            Image
          </button>
          <button
            onClick={sendMessage}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
