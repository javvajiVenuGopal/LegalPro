import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Send } from 'lucide-react';
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

type Thread = {
  id: string;
  participants: UserSummary[];
  participant?: UserSummary;
  caseAccepted?: boolean;
  case:string
};

const Messages: React.FC = () => {
  const { user, Token: token } = useAuthStore();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [selectedThread, setSelectedThread] = useState<Thread | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [allUsers, setAllUsers] = useState<UserSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const API_BASE = "http://127.0.0.1:7000/law/";
  const THREAD_POLL_INTERVAL = 10000;
  const MESSAGE_POLL_INTERVAL = 3000;

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const getDisplayName = (participant: UserSummary): string =>
    participant?.name ||
    `${participant?.first_name || ''} ${participant?.last_name || ''}`.trim() ||
    participant?.username || '';

  const fetchUsers = useCallback(async () => {
    if (!user) return;
    const url =
      user.role === 'lawyer'
        ? 'http://127.0.0.1:7000/users/clients/'
        : 'http://127.0.0.1:7000/users/lawyers/';

    try {
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAllUsers(response.data.filter((u: UserSummary) => u.id !== user.id));
    } catch {
      setAllUsers([]);
    }
  }, [user, token]);
//this fetch all the users that are not the current user

  // const fetchThreads = useCallback(async () => {
  //   if (!user || !token) return;

  //   try {
  //     const response = await axios.get(`${API_BASE}threads/`, {
  //       headers: { Authorization: `Bearer ${token}` },
  //     });

  //     const threads = response.data.map((thread: Thread) => {
  //       const other = thread.participants.find((p) => p.id !== user.id);
  //       return { ...thread, participant: other };
  //     });

  //     setThreads(threads);
  //   } catch (error) {
  //     console.error('Error fetching threads:', error);
  //   }
  // }, [user, token]);

  const fetchThreads = useCallback(async () => {
  if (!user || !token) return;

  try {
    const response = await axios.get(`${API_BASE}threads/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    //console.log(response.data);
    const threads = response.data.map((thread: Thread) => {
      const other = thread.participants.find((p) => p!== user.id);
      
      //console.log("other",other)
      // Assuming there's a field `case` in the thread which contains case information (accepted status)
      return {
        ...thread,
        participant: other,
        caseAccepted: (thread.case?true:false) // Add case acceptance status
      };
    });
  //console.log("df",threads);

    setThreads(threads);
  } catch (error) {
    console.error('Error fetching threads:', error);
  }
}, [user, token]);
console.log("df",threads);
// Only show users from threads where a case has been accepted
const usersFromAcceptedThreads = threads
  .filter((thread) => thread.caseAccepted)
  .map((thread) => thread.participant!)
  .filter(
    (user, index, self) =>
      index === self.findIndex((u) => u.id === user.id) // Remove duplicates
  );
 //console.log("Threads:", threads);
 //console.log("Users from accepted threads:", usersFromAcceptedThreads);
  const fetchMessages = useCallback(
  async (showLoading: boolean = false) => {
    if (!selectedThread || !token) return;

    if (showLoading) setIsLoading(true); // ✅ Only show loading spinner when explicitly asked

    try {
      const response = await axios.get(`${API_BASE}messages/`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { thread: selectedThread.id },
      });
     
      const newMessages =  response.data.filter((msg) => msg.content?.trim() !== '');
      setMessages(newMessages);
      scrollToBottom();
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      if (showLoading) setIsLoading(false); // ✅ Reset only if it was set
    }
  },
  [selectedThread, token, scrollToBottom]
);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedThread || !user) return;

    const content = newMessage.trim();
    setNewMessage('');

    const tempMsg: Message = {
      id: `temp-${Date.now()}`,
      senderId: user.id,
      senderName: user.name || 'You',
      content,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempMsg]);
    scrollToBottom();
    console.log(selectedThread)
    const payload = {
      content,
      case:selectedThread.case,
      
      thread: selectedThread.id,
      receiver: selectedThread?.participant,
      sender: user.id,
    };

    try {
      await axios.post(`${API_BASE}messages/`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      await fetchMessages();
    } catch (error: any) {
      console.error('Error sending message:', error.response?.data || error.message);
    }
  };
//this is method all lawyer or client can see each other message
  // const handleStartChat = async (participantId: string) => {
  //   if (!user || !token) return;

  //   const existingThread = threads.find(
  //     (thread) => thread.participants.some((p) => p.id === participantId)
  //   );

  //   if (existingThread) {
  //     setSelectedThread(existingThread);
  //     setMessages([]);
  //     setTimeout(() => fetchMessages(), 0);
  //     return;
  //   }

  //   const participant = allUsers.find((u) => u.id === participantId);
  //   if (!participant) return;

  //   try {
  //     const response = await axios.post(
  //       `${API_BASE}threads/`,
  //       {
  //         participants: [user.id, participantId],
  //       },
  //       {
  //         headers: { Authorization: `Bearer ${token}` },
  //       }
  //     );

  //     const thread = {
  //       ...response.data,
  //       participant,
  //     };

  //     setThreads((prev) => [...prev, thread]);
  //     setSelectedThread(thread);
  //     setMessages([]);
  //     setTimeout(() => fetchMessages(), 0);
  //   } catch (error) {
  //     console.error('Error starting chat:', error);
  //   }
  // };
const handleStartChat = async (participantId: string) => {
  if (!user || !token) return;

  const participant = allUsers.find((u) => u.id === participantId);
  //console.log(participant);
  if (!participant) return;

  // Check if the case has been accepted
  // const caseAccepted = participant.case; // Assuming 'case' object has 'accepted' field
  // if (!caseAccepted) {
  //   alert("You cannot start a chat with this client until the case is accepted.");
  //   return;
  // }

  // Proceed with starting the chat
  const existingThread = threads.find(
  (thread) => thread.participants.includes(participant.id)
);

  console.log(existingThread);

  if (existingThread) {
    setSelectedThread(existingThread);
    setMessages([]);
    setTimeout(() => fetchMessages(), 0);
    return;
  }

  try {
    const response = await axios.post(
      `${API_BASE}threads/`,
      {
        participants: [user.id, participantId],
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const thread = {
      ...response.data,
      participant,
    };

    setThreads((prev) => [...prev, thread]);
    setSelectedThread(thread);
    setMessages([]);
    setTimeout(() => fetchMessages(), 0);
  } catch (error) {
    console.error('Error starting chat:', error);
  }
};

  useEffect(() => {
    fetchUsers();
    fetchThreads();
  }, [fetchUsers, fetchThreads]);

  useEffect(() => {
    if (selectedThread) {
      fetchMessages();
    }
    console.log(selectedThread)
  }, [selectedThread, fetchMessages]);
const u=allUsers.find((u) => u.id === parseInt(selectedThread?.participant))
  useEffect(() => {
    const interval = setInterval(() => {
      fetchThreads();
    }, THREAD_POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchThreads]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (selectedThread) fetchMessages();
    }, MESSAGE_POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [selectedThread, fetchMessages]);


  const filteredThreads = threads.filter((t) =>
    getDisplayName(t.participant!).toLowerCase().includes(searchTerm.toLowerCase())
  );
 

const acceptedUsers = usersFromAcceptedThreads
  .map(id => allUsers.find(user => user.id === id))
  .filter(Boolean);
  console.log(acceptedUsers)
  
  return (
    <div className="h-full flex">
      <aside className="w-80 border-r p-4 space-y-4">
        <input
          type="text"
          placeholder="Search..."
          className="w-full border rounded px-3 py-2"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div>
          <h4 className="text-sm font-semibold mb-2">Start New Chat</h4>
          {acceptedUsers.map((user) => (
            <button
              key={user.id}
              onClick={() => handleStartChat(user.id)}
              className="flex items-center w-full p-2 hover:bg-gray-100 rounded"
            >
              <Avatar name={getDisplayName(user)} size="sm" className="mr-2" />
              <span>{getDisplayName(user)}</span>
            </button>
          ))}
        </div>
        <div className="overflow-y-auto flex-1">
          {/* all thread will display here */}
          {/* {filteredThreads.map((thread) => (
            <button
              key={thread.id}
              onClick={() => {
                setSelectedThread(thread);
                setMessages([]);
                setTimeout(() => fetchMessages(), 0);
              }}
              className={`w-full text-left p-3 rounded hover:bg-gray-50 ${
                selectedThread?.id === thread.id ? 'bg-blue-100' : ''
              }`}
            >
              <div className="flex items-center">
                <Avatar name={getDisplayName(thread.participant!)} size="md" className="mr-3" />
                <div>
                  <div className="font-semibold">{getDisplayName(thread.participant!)}</div>
                </div>
              </div>
            </button>
          ))} */}


          <div className="overflow-y-auto flex-1">
  {/* {filteredThreads.map((thread) => (
    <button
      key={thread.id}
      onClick={() => {
        setSelectedThread(thread);
        setMessages([]);
        setTimeout(() => fetchMessages(), 0);
      }}
      className={`w-full text-left p-3 rounded hover:bg-gray-50 ${
        selectedThread?.id === thread.id ? 'bg-blue-100' : ''
      }`}
    >
      <div className="flex items-center">
        <Avatar name={getDisplayName(thread.participant!)} size="md" className="mr-3" />
        <div>
          {/* <div className="font-semibold">{getDisplayName(thread.participant!)}</div>
          {/* Display case status */}
          {/* {thread.caseAccepted !== undefined && (
            <p className="text-sm text-gray-500">
              {thread.caseAccepted
                ? 'Case accepted'
                : 'Case not accepted'}
            </p>
          )} 
        </div> 
      </div>
    </button>
  ))} */}
</div>

        </div>
      </aside>

      {/* <main className="flex-1 flex flex-col">
        {selectedThread ? (
          <>
            <header className="border-b px-4 py-3 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Avatar name={getDisplayName(selectedThread.participant!)} size="md" />
                <div className="font-semibold">{getDisplayName(selectedThread.participant!)}</div>
              </div>
            </header>
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2">
  {isLoading ? (
    <p>Loading messages...</p>
  ) : (
    messages.map((msg) => {
      const isCurrentUser = msg?.receiver !== user?.id;
      
      return (
        <div
          key={msg.id}
          className={`w-full flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`max-w-sm p-3 rounded-lg shadow ${
              isCurrentUser
                ? 'bg-blue-500 text-white rounded-br-none'
                : 'bg-gray-200 text-black rounded-bl-none'
            }`}
          >
            <div>{msg.content}</div>
            <div className="text-[10px] text-right mt-1 opacity-70">
              {formatDate(msg.createdAt)}
            </div>
          </div>
        </div>
      );
    })
  )}
  <div ref={messagesEndRef} />
</div>

            <div className="p-3 border-t flex items-center space-x-2">
              <input
                type="text"
                className="flex-1 border rounded px-3 py-2"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newMessage.trim()) handleSendMessage();
                }}
              />
              <button
                onClick={handleSendMessage}
                className="bg-blue-500 text-white px-4 py-2 rounded"
              >
                <Send size={16} />
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p>Select a thread or start a new chat</p>
          </div>
        )}
      </main> */}

      <main className="flex-1 flex flex-col">
  {selectedThread ? (
    <>
      <header className="border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Avatar name={getDisplayName(u)} size="md" />
          <div className="font-semibold">{getDisplayName(u)}</div>
        </div>
        {/* Display case acceptance status in the header */}
        {selectedThread.caseAccepted !== undefined && (
          <p className="text-sm text-gray-500">
            {selectedThread.caseAccepted
              ? 'Case has been accepted'
              : 'Case has not been accepted'}
          </p>
        )}
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2">
        {isLoading ? (
          <p>Loading messages...</p>
        ) : (
          messages.map((msg) => {
            const isCurrentUser = msg?.receiver !== user?.id;

            return (
              <div
                key={msg.id}
                className={`w-full flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-sm p-3 rounded-lg shadow ${
                    isCurrentUser
                      ? 'bg-blue-500 text-white rounded-br-none'
                      : 'bg-gray-200 text-black rounded-bl-none'
                  }`}
                >
                  <div>{msg.content}</div>
                  <div className="text-[10px] text-right mt-1 opacity-70">
                    {msg.created_at && formatDate(msg.created_at)}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 border-t flex items-center space-x-2">
        <input
          type="text"
          className="flex-1 border rounded px-3 py-2"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && newMessage.trim()) handleSendMessage();
          }}
        />
        <button
          onClick={handleSendMessage}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          <Send size={16} />
        </button>
      </div>
    </>
  ) : (
    <div className="flex-1 flex items-center justify-center">
      <p>Select a thread or start a new chat</p>
    </div>
  )}
</main>

    </div>
  );
};

export default Messages;
