import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Send } from 'lucide-react';
import { Avatar } from '../../components/ui/Avatar';
import { useAuthStore } from '../../store/authStore';
import axios from 'axios';
import { formatDate } from '../../lib/utils';

type Message = {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  createdAt: string;
};

type UserSummary = {
  id: string;
  name?: string;
  role?: string;
  first_name?: string;
  last_name?: string;
  username?: string;
};

const Messages: React.FC = () => {
  const { user, Token: token } = useAuthStore();

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [allUsers, setAllUsers] = useState<UserSummary[]>([]);
  const [apiAvailable, setApiAvailable] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const socketRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [selectedUser, setSelectedUser] = useState<UserSummary | null>(null);
  const [selectedCase, setSelectedCase] = useState<number | null>(null);

  const api = "http://127.0.0.1:7000/law/";
  const MESSAGE_POLLING_INTERVAL = 3000;

  const handleScroll = useCallback(() => {
    if (messagesEndRef.current && messagesEndRef.current.parentElement) {
      const { scrollTop, scrollHeight, clientHeight } = messagesEndRef.current.parentElement;
      setIsAtBottom(scrollTop + clientHeight >= scrollHeight - 10);
    }
  }, []);

  useEffect(() => {
    const messageContainer = messagesEndRef.current?.parentElement;
    if (messageContainer) {
      messageContainer.addEventListener('scroll', handleScroll);
      return () => messageContainer.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  const scrollToBottom = useCallback(() => {
    if (isAtBottom && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isAtBottom]);

  // Fetch users based on user role
  const fetchUsers = useCallback(async () => {
    if (!user) return;
    const url = user.role === 'lawyer' ? 'http://127.0.0.1:7000/users/clients/' : 'http://127.0.0.1:7000/users/lawyers/';
    try {
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAllUsers(response.data.filter((u: UserSummary) => u.id !== user.id));
    } catch {
      setAllUsers([]);
      setError('Failed to fetch users');
    }
  }, [token, user]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Fetch messages for selected case and user
  const fetchMessages = useCallback(async () => {
    if (!selectedUser || !selectedCase || !token) return;
    try {
      const response = await axios.get(`${api}messages/`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { receiver: selectedUser.id, case: selectedCase },
      });
      setMessages(response.data);
    } catch (err) {
      console.error('Failed to fetch messages', err);
    }
  }, [selectedUser, selectedCase, token]);

  useEffect(() => {
    fetchMessages();
  }, [selectedUser, selectedCase, fetchMessages]);

  // WebSocket setup for real-time communication
  useEffect(() => {
    if (!selectedUser || !selectedCase) return;

    const wsProtocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const wsUrl = `${wsProtocol}://127.0.0.1:8000/ws/chat/${selectedUser.id}/`;

    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;

    socket.onopen = () => console.log('WebSocket connected');
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.message) {
        setMessages((prev) => [...prev, data]);
      }
    };
    socket.onclose = () => console.log('WebSocket disconnected');

    return () => {
      socket.close();
    };
  }, [selectedUser, selectedCase]);

  // Fetch accepted cases for the lawyer
  const [availableCases, setAvailableCases] = useState([]);
  const fetchAcceptedCases = useCallback(async () => {
    if (!user || !token) return;
    try {
      const url =
        user.role === 'lawyer'
          ? `http://127.0.0.1:7000/law/lawyer-cases/`
          : `http://127.0.0.1:7000/law/client-cases/`;

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const accepted = response.data.filter((c: any) => c.status === 'accepted');
      setAvailableCases(accepted);
    } catch (error) {
      console.error('Failed to fetch accepted cases', error);
      setAvailableCases([]);
    }
  }, [user, token]);

  useEffect(() => {
    fetchAcceptedCases();
  }, [fetchAcceptedCases]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedUser || !selectedCase || !user) return;

    const messageContent = newMessage.trim();
    setNewMessage('');

    const messagePayload = {
      message: messageContent,
      sender: user.id,
      receiver: selectedUser.id,
      case_id: selectedCase,
    };

    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(messagePayload));
    } else {
      try {
        const response = await axios.post(`${api}messages/`, {
          content: messageContent,
          sender: user.id,
          receiver: selectedUser.id,
          case: selectedCase,
        }, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMessages(prev => [...prev, response.data]);
      } catch (err) {
        console.error('HTTP message send failed', err);
      }
    }
  };

  // Case selection dropdown
  const handleCaseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value;
    setSelectedCase(Number(selected));
  };

  return (
    <div>
      {/* Case Selection */}
      <select onChange={handleCaseChange}>
        <option value="">Select Case</option>
        {availableCases.map((c) => (
          <option key={c.id} value={c.id}>
            {c.title}
          </option>
        ))}
      </select>

      {/* Messages List */}
      <div>
        {messages.map((message) => (
          <div key={message.id}>
            <Avatar />
            <div>
              <strong>{message.senderName}</strong>
              <p>{message.content}</p>
              <span>{formatDate(message.createdAt)}</span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <input
        ref={inputRef}
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        placeholder="Type a message"
      />
      <button onClick={handleSendMessage}>
        <Send />
      </button>
    </div>
  );
};

export default Messages;
