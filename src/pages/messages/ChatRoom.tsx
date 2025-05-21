// ChatRoomPage.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Send, Avatar } from 'lucide-react';
import { formatDate } from '../../lib/utils';
import { useAuthStore } from '../../store/authStore';
import axios from 'axios';

type Message = {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  createdAt: string;
};

type Thread = {
  id: string;
  participant: { id: string; name: string; role: string };
};

const ChatRoomPage: React.FC<{ threadId: string }> = ({ threadId }) => {
  const { user, Token: token } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const api = "http://127.0.0.1:7000/law/";

  // Fetch messages when threadId changes
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await axios.get(
          `${api}threads/${threadId}/messages/`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setMessages(response.data);
        scrollToBottom();
      } catch (error) {
        console.error('Failed to fetch messages:', error);
        setMessages([]);
      }
    };
    fetchMessages();
  }, [threadId, token]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Send message logic
  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    try {
      const response = await axios.post(
        `${api}threads/${threadId}/messages/`,
        { content: newMessage },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessages((prev) => [...prev, response.data]);
      setNewMessage('');
      scrollToBottom();
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message');
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-white">
      <div className="border-b border-gray-200 p-4 flex items-center">
        {/* Assuming the participant details come from the thread */}
        <Avatar name="Participant Name" size="md" className="mr-3" />
        <div>
          <h3 className="text-lg font-semibold">Participant Name</h3>
          <p className="text-sm text-gray-500">Role</p>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs px-4 py-2 rounded-lg ${
                msg.senderId === user?.id ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-900'
              }`}
            >
              <div className="text-xs font-semibold">{msg.senderName}</div>
              <div>{msg.content}</div>
              <div className="text-xs text-gray-500 text-right">{formatDate(msg.createdAt, 'h:mm a')}</div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="border-t border-gray-200 p-4 flex items-center space-x-2">
        <input
          type="text"
          placeholder="Type your message..."
          className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleSendMessage();
            }
          }}
        />
        <button
          onClick={handleSendMessage}
          className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-md"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default ChatRoomPage;
