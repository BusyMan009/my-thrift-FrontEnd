import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';
import { io } from 'socket.io-client';
import Alert from './Alert';
import API_BASE_URL from './config/api';

const ChatPage = () => {
  const navigate = useNavigate();
  const { chatId } = useParams();
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);
  const sendingMessageRef = useRef(false);
  
  const [activeFilter, setActiveFilter] = useState('all');
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChat, setSelectedChat] = useState(null);
  const [selectedChatId, setSelectedChatId] = useState(chatId || null);
  const [message, setMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [showChatList, setShowChatList] = useState(!chatId);
  const [chatDetailsLoading, setChatDetailsLoading] = useState(false);

  // Initialize WebSocket
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) return;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setCurrentUser(payload);
    } catch (error) {
      return;
    }

    if (!socketRef.current) {
      socketRef.current = io(API_BASE_URL, {
        transports: ['websocket', 'polling'],
        upgrade: true,
        timeout: 20000,
        forceNew: true
      }); 

      const payload = JSON.parse(atob(token.split('.')[1]));
      
      socketRef.current.on('connect', () => {
        setIsConnected(true);
        socketRef.current.emit('join', payload.userId);
        
        if (selectedChatId) {
          socketRef.current.emit('join_chat', selectedChatId);
        }
      });
      
      socketRef.current.on('disconnect', (reason) => {
        setIsConnected(false);
      });

      socketRef.current.on('connect_error', (error) => {
        setIsConnected(false);
      });
      
      socketRef.current.on('new_message', (data) => {
        const { chatId: messageChatId, message: newMessage, lastMessage, lastActivity } = data;
        
        setSelectedChat(prevChat => {
          if (!prevChat || prevChat._id !== messageChatId) return prevChat;
          
          const messageExists = prevChat.messages.some(msg => 
            msg.timestamp === newMessage.timestamp && 
            msg.content === newMessage.content && 
            msg.sender._id === newMessage.sender._id
          );
          
          if (messageExists) return prevChat;
          
          return {
            ...prevChat,
            messages: [...prevChat.messages, newMessage]
          };
        });
        
        setChats(prevChats => prevChats.map(chat => 
          chat._id === messageChatId 
            ? { 
                ...chat, 
                lastMessage: lastMessage,
                lastActivity: lastActivity
              }
            : chat
        ));
      });
      
      socketRef.current.on('chat_list_update', (data) => {
        const { userId, chatId: updatedChatId, lastMessage, lastActivity } = data;
        
        if (userId === payload.userId) {
          setChats(prevChats => prevChats.map(chat => 
            chat._id === updatedChatId 
              ? { 
                  ...chat, 
                  lastMessage: lastMessage,
                  lastActivity: lastActivity
                }
              : chat
          ));
        }
      });
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (socketRef.current && isConnected && selectedChatId) {
      socketRef.current.emit('join_chat', selectedChatId);
    }
    
    return () => {
      if (socketRef.current && selectedChatId) {
        socketRef.current.emit('leave_chat', selectedChatId);
      }
    };
  }, [selectedChatId, isConnected]);

  const fetchChats = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("authToken");
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/api/chats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true'
        }
      });

      setChats(response.data);
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Session expired. Please login again.');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError('Failed to load chats');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchChatDetails = async (chatId) => {
    try {
      setChatDetailsLoading(true);
      const token = localStorage.getItem("authToken");
      if (!token) return;

      const response = await axios.get(`${API_BASE_URL}/api/chats/${chatId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true'
        }
      });

      setSelectedChat(response.data);
    } catch (err) {
      setError('Failed to load chat details');
    } finally {
      setChatDetailsLoading(false);
    }
  };

  useEffect(() => {
    fetchChats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedChatId) {
      fetchChatDetails(selectedChatId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChatId]);

  const [shouldAutoScroll, setShouldAutoScroll] = useState(false);
  
  useEffect(() => {
    if (selectedChat?.messages && shouldAutoScroll) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      setShouldAutoScroll(false);
    }
  }, [selectedChat?.messages, shouldAutoScroll]);

  useEffect(() => {
    if (selectedChat?.messages?.length > 0) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [selectedChatId]);

  const filteredChats = chats.filter(chat => {
    const matchesSearch = (chat.otherUser?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        chat.lastMessage?.content?.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (activeFilter === 'unread') {
      return matchesSearch && chat.unreadCount > 0;
    }
    
    return matchesSearch;
  });

  const selectChat = (chat) => {
    setSelectedChatId(chat._id);
    setShowChatList(false);
    window.history.pushState({}, '', `/chat/${chat._id}`);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!message.trim() || sendingMessageRef.current || !selectedChatId || !isConnected) {
      return;
    }

    const messageContent = message.trim();
    sendingMessageRef.current = true;
    setSendingMessage(true);
    setMessage('');
    
    const tempMessageId = Date.now() + Math.random();
    const tempMessage = {
      _id: tempMessageId,
      content: messageContent,
      sender: { _id: currentUser?.userId, name: currentUser?.name || 'You' },
      timestamp: new Date().toISOString(),
      isRead: false,
      isTemporary: true
    };
    
    setSelectedChat(prevChat => (prevChat ? {
      ...prevChat,
      messages: [...(prevChat?.messages || []), tempMessage]
    } : prevChat));
    
    setShouldAutoScroll(true);

    try {
      const token = localStorage.getItem("authToken");
      
      await axios.post(
        `${API_BASE_URL}/api/chats/${selectedChatId}/message`,
        { content: messageContent },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true'
          }
        }
      );

      // Server should emit updated message; remove temporary message if needed
      setSelectedChat(prevChat => (prevChat ? {
        ...prevChat,
        messages: prevChat?.messages?.filter(msg => msg._id !== tempMessageId) || []
      } : prevChat));

    } catch (err) {
      setError('Failed to send message');
      setMessage(messageContent);
      
      setSelectedChat(prevChat => (prevChat ? {
        ...prevChat,
        messages: prevChat?.messages?.filter(msg => msg._id !== tempMessageId) || []
      } : prevChat));
    } finally {
      sendingMessageRef.current = false;
      setSendingMessage(false);
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffInHours = (now - date) / (1000 * 60 * 60);
      
      if (diffInHours < 24) {
        return formatDistanceToNow(date, { addSuffix: true });
      } else {
        return date.toLocaleDateString();
      }
    } catch (error) {
      return '';
    }
  };

  const formatMessageTime = (timestamp) => {
    if (!timestamp) return '';
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
    } catch (error) {
      return '';
    }
  };

  const UserAvatar = ({ user }) => {
    const getInitials = (name) => {
      if (!name) return '?';
      const words = name.trim().split(' ');
      if (words.length >= 2) {
        return words[0].charAt(0) + words[1].charAt(0);
      }
      return name.charAt(0);
    };

    return (
      <div className="relative w-14 h-14 flex-shrink-0">
        {user?.profileImage ? (
          <img 
            className="w-full h-full object-cover rounded-full shadow-lg" 
            alt={user?.name || 'avatar'} 
            src={user.profileImage}
            onError={(e) => {
              e.target.style.display = 'none';
              const parent = e.target.parentElement;
              if (parent && !parent.querySelector('.fallback-avatar')) {
                const div = document.createElement('div');
                div.className = 'fallback-avatar w-full h-full rounded-full bg-gradient-to-br from-[#834d1a] to-[#6d3e15] flex items-center justify-center shadow-lg';
                div.innerHTML = `<span class="text-white font-semibold text-lg">${getInitials(user?.name)}</span>`;
                parent.appendChild(div);
              }
            }}
          />
        ) : (
          <div className="w-full h-full rounded-full bg-gradient-to-br from-[#834d1a] to-[#6d3e15] flex items-center justify-center shadow-lg">
            <span className="text-white font-semibold text-lg">
              {getInitials(user?.name)}
            </span>
          </div>
        )}
        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-3 border-white shadow-sm"></div>
      </div>
    );
  };

  const otherUser = selectedChat?.participants?.find(p => p._id !== currentUser?.userId);

  return (
    <div className="h-screen flex bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {error && (
        <Alert message={error} type="error" onClose={() => setError(null)} />
      )}

      {!isConnected && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-3 rounded-full shadow-xl backdrop-blur-lg bg-opacity-90">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <span className="font-medium">Connecting...</span>
            </div>
          </div>
        </div>
      )}

      {/* Chat List */}
      <div className={`${showChatList ? 'flex w-full md:w-80' : 'hidden md:flex md:w-80'} bg-white/80 backdrop-blur-xl shadow-2xl flex-col`}>
        
        {/* Header */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[#834d1a] via-[#a15a25] to-[#834d1a]"></div>
          <div className="relative flex h-20 items-center justify-between px-6 text-white">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate(-1)} 
                className="p-2 rounded-full hover:bg-white/20 transition-all duration-300"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m15 18-6-6 6-6"/>
                </svg>
              </button>
              <div>
                <h1 className="text-2xl font-bold">Messages</h1>
                <p className="text-white/80 text-sm">{chats.length} conversations</p>
              </div>
            </div>
            
            <button 
              onClick={fetchChats} 
              disabled={loading} 
              className="p-2 rounded-full hover:bg-white/20 transition-all duration-300"
            >
              <div className={`w-6 h-6 text-white ${loading ? 'animate-spin' : ''}`}>
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="p-6">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur-xl group-focus-within:blur-2xl transition-all duration-500"></div>
            <div className="relative">
              <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#834d1a] transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
              <input 
                className="w-full h-14 pl-12 pr-4 bg-white/70 backdrop-blur-sm rounded-2xl focus:bg-white focus:ring-4 focus:ring-[#834d1a]/20 focus:outline-none border border-gray-100 transition-all duration-300 placeholder-gray-400"
                placeholder="Search conversations..." 
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-3 px-6 pb-4">
          <button 
            onClick={() => setActiveFilter('all')}
            className={`px-6 py-3 rounded-full font-medium transition-all duration-300 transform hover:scale-105 ${
              activeFilter === 'all' 
                ? 'bg-gradient-to-r from-[#834d1a] to-[#6d3e15] text-white shadow-lg' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All ({chats.length})
          </button>
          <button 
            onClick={() => setActiveFilter('unread')}
            className={`px-6 py-3 rounded-full font-medium transition-all duration-300 transform hover:scale-105 ${
              activeFilter === 'unread' 
                ? 'bg-gradient-to-r from-[#834d1a] to-[#6d3e15] text-white shadow-lg' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Unread ({chats.filter(c => c.unreadCount > 0).length})
          </button>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <div className="relative">
                <div className="w-12 h-12 border-4 border-[#834d1a]/20 rounded-full"></div>
                <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-[#834d1a] rounded-full animate-spin"></div>
              </div>
              <p className="text-gray-500 font-medium">Loading conversations...</p>
            </div>
          ) : filteredChats.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-gray-600 mb-1">No conversations yet</p>
                <p className="text-gray-400">Start a new conversation</p>
              </div>
            </div>
          ) : (
            <div className="space-y-1 px-3">
              {filteredChats.map((chat) => (
                <div 
                  key={chat._id} 
                  className={`group flex items-center p-4 cursor-pointer rounded-2xl transition-all duration-300 hover:bg-white/60 hover:shadow-md transform hover:-translate-y-0.5 ${
                    selectedChatId === chat._id 
                      ? 'bg-gradient-to-r from-[#F8F5E9] to-white shadow-lg border border-[#834d1a]/20' 
                      : ''
                  }`}
                  onClick={() => selectChat(chat)}
                >
                  <UserAvatar user={chat.otherUser} />
                  
                  <div className="flex-1 min-w-0 ml-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 truncate text-lg group-hover:text-[#834d1a] transition-colors">
                        {chat.otherUser?.name || 'Unknown User'}
                      </h3>
                      <span className="text-xs text-gray-500 font-medium bg-gray-100 px-2 py-1 rounded-full">
                        {formatTime(chat.lastActivity)}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600 truncate max-w-48">
                        {chat.lastMessage?.content || 'No messages yet'}
                      </p>
                      
                      {chat.unreadCount > 0 && (
                        <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs w-6 h-6 flex items-center justify-center font-bold rounded-full shadow-lg animate-pulse">
                          {chat.unreadCount > 9 ? '9+' : chat.unreadCount}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chat Detail Area */}
      <div className={`${!showChatList ? 'flex w-full' : 'hidden md:flex md:flex-1'} flex-col bg-gradient-to-br from-gray-50 to-white`}>
        {chatDetailsLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="relative inline-flex">
                <div className="w-16 h-16 border-4 border-[#834d1a]/20 rounded-full"></div>
                <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-[#834d1a] rounded-full animate-spin"></div>
              </div>
              <p className="text-gray-600 font-medium">Loading conversation...</p>
            </div>
          </div>
        ) : selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-white via-[#F8F5E9] to-white"></div>
              <div className="relative flex h-20 items-center justify-between px-6 backdrop-blur-xl">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setShowChatList(true)} 
                    className="md:hidden p-2 rounded-full hover:bg-white/80 transition-all duration-300"
                  >
                    <svg className="w-6 h-6 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="m15 18-6-6 6-6"/>
                    </svg>
                  </button>
                  
                  <UserAvatar user={otherUser} />
                  
                  <div>
                    <h2 className="font-bold text-lg text-gray-900">
                      {otherUser?.name || 'Unknown User'}
                    </h2>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                      <p className="text-sm text-gray-500">
                        {isConnected ? 'Online' : 'Offline'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button className="p-3 rounded-full hover:bg-white/80 transition-all duration-300 hover:scale-110">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </button>
                  <button className="p-3 rounded-full hover:bg-white/80 transition-all duration-300 hover:scale-110">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                  <button className="p-3 rounded-full hover:bg-white/80 transition-all duration-300 hover:scale-110">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6" style={{ backgroundColor: '#F8F5E9' }}>
              {selectedChat?.messages?.map((msg, index) => {
                const isMyMessage = msg.sender._id === currentUser?.userId;
                
                return (
                  <div key={msg._id || index} className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom duration-300`}>
                    <div className={`group max-w-xs lg:max-w-md px-6 py-4 shadow-lg backdrop-blur-sm transform transition-all duration-300 hover:scale-105 ${
                      isMyMessage 
                        ? 'bg-gradient-to-br from-[#834d1a] to-[#6d3e15] text-white rounded-3xl rounded-bl-lg' 
                        : 'bg-white/90 text-gray-900 rounded-3xl rounded-br-lg border border-gray-100'
                    } ${msg.isTemporary ? 'opacity-70' : ''}`}>
                      <p className="text-sm leading-relaxed break-words">{msg.content}</p>
                      <div className={`flex items-center justify-end mt-2 text-xs font-medium ${
                        isMyMessage ? 'text-white/80' : 'text-gray-500'
                      }`}>
                        <span>{formatMessageTime(msg.timestamp)}</span>
                        {isMyMessage && (
                          <div className="ml-2 flex items-center">
                            {msg.isTemporary ? (
                              <div className="w-3 h-3 border border-white/50 border-t-white rounded-full animate-spin"></div>
                            ) : (
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-6 bg-white/80 backdrop-blur-xl">
              <form onSubmit={handleSendMessage} className="flex items-center gap-4">
                <div className="flex-1 relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-3xl blur-xl group-focus-within:blur-2xl transition-all duration-500"></div>
                  <input
                    type="text"
                    value={message}
                    style={{color:"black"}}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="relative w-full px-6 py-4 bg-white/70 backdrop-blur-sm rounded-3xl focus:bg-white focus:ring-4 focus:ring-[#834d1a]/20 focus:outline-none border border-gray-100 transition-all duration-300"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!message.trim() || sendingMessageRef.current || !isConnected}
                  className="relative w-14 h-14 bg-gradient-to-r from-[#834d1a] to-[#6d3e15] text-white rounded-full hover:from-[#6d3e15] hover:to-[#834d1a] transition-all duration-300 disabled:opacity-50 flex items-center justify-center shadow-xl hover:shadow-2xl transform hover:scale-110 disabled:hover:scale-100"
                >
                  {sendingMessage ? (
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  )}
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-6 max-w-md">
              <div className="relative">
                <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100 flex items-center justify-center shadow-2xl">
                  <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
              </div>
              
              <div className="space-y-3">
                <h3 className="text-2xl font-bold text-gray-700">Select a conversation</h3>
                <p className="text-gray-500 leading-relaxed">
                  Choose a conversation from your list to start chatting
                </p>
              </div>

              <div className="flex justify-center">
                <div className="px-6 py-3 bg-gradient-to-r from-[#834d1a]/10 to-[#6d3e15]/10 rounded-full text-[#834d1a] font-medium">
                  Your messages will appear here
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
