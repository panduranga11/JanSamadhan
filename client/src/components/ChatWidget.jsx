import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Send, Shield, Loader2, MessageCircle, WifiOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { getSocket, connectSocket } from '../services/socketService';
import { useTranslation } from 'react-i18next';

// Avatar color palette (stable per user id)
const AVATAR_COLORS = [
  'bg-blue-100 text-blue-700', 'bg-pink-100 text-pink-700',
  'bg-green-100 text-green-700', 'bg-yellow-100 text-yellow-700',
  'bg-purple-100 text-purple-700', 'bg-orange-100 text-orange-700',
];
const colorFor = (id) => AVATAR_COLORS[(parseInt(id, 36) || 0) % AVATAR_COLORS.length];

const initialsFor = (name = '') =>
  name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || '??';

const ChatWidget = ({ title, compact = false }) => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const chatTitle = title || t('chat.title');
  const scrollRef = useRef(null);
  const typingTimer = useRef(null);
  const socketRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [onlineCount, setOnlineCount] = useState(0);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, typingUsers]);

  // Load historical messages from REST API
  useEffect(() => {
    api.get('/chat')
      .then((data) => {
        const list = Array.isArray(data) ? data : (data?.messages || []);
        setMessages(list.map(normalizeMsg));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Connect Socket.IO when user is logged in
  useEffect(() => {
    if (!user) return;

    const socket = connectSocket();
    if (!socket) return;
    socketRef.current = socket;

    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);

    const onReceiveMessage = (msg) => {
      setMessages((prev) => {
        // Avoid duplicates (optimistic update)
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, normalizeMsg(msg)];
      });
      // Remove typing user when they send
      setTypingUsers((prev) => prev.filter((u) => u !== msg.sender));
    };

    const onUserTyping = ({ userName }) => {
      setTypingUsers((prev) =>
        prev.includes(userName) ? prev : [...prev, userName]
      );
      clearTimeout(typingTimer.current);
      typingTimer.current = setTimeout(() => setTypingUsers([]), 3000);
    };

    const onOnlineCount = ({ count }) => setOnlineCount(count);
    const onError = ({ message }) => console.warn('Chat error:', message);

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('receiveMessage', onReceiveMessage);
    socket.on('userTyping', onUserTyping);
    socket.on('onlineCount', onOnlineCount);
    socket.on('error', onError);

    if (socket.connected) setConnected(true);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('receiveMessage', onReceiveMessage);
      socket.off('userTyping', onUserTyping);
      socket.off('onlineCount', onOnlineCount);
      socket.off('error', onError);
    };
  }, [user]);

  const normalizeMsg = (msg) => ({
    id: msg.id,
    text: msg.text || msg.message,
    sender: msg.sender || msg.full_name || 'Unknown',
    role: msg.role || 'user',
    time: msg.time || msg.created_at,
    userId: msg.user_id || msg.userId,
    avatarUrl: msg.avatar_url || msg.avatarUrl,
  });

  const handleSend = useCallback(() => {
    if (!input.trim() || !user) return;

    const socket = getSocket();
    if (!socket?.connected) return;

    const text = input.trim();
    setInput('');

    // No optimistic update — backend broadcasts receiveMessage back to ALL
    // including sender, so the message appears via socket with correct side alignment
    socket.emit('sendMessage', { text });
  }, [input, user]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTyping = () => {
    const socket = getSocket();
    if (socket?.connected) socket.emit('typing');
  };

  const formatTime = (ts) => {
    if (!ts) return '';
    try {
      return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return ts;
    }
  };

  const isMe = (msg) =>
    msg.isMe || (user && (msg.userId === user.id || msg.userId === String(user.id)));

  return (
    <div className={`flex flex-col bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden ${compact ? 'h-[500px]' : 'h-[calc(100vh-8rem)]'}`}>

      {/* Header */}
      <div className="p-4 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-brand-primary" />
            <h2 className="font-bold text-lg text-gray-800 dark:text-white">{chatTitle}</h2>
            {connected ? (
              <span className="flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
              </span>
            ) : (
              <WifiOff className="w-4 h-4 text-red-400" />
            )}
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            {connected
              ? onlineCount > 0 ? `${onlineCount} ${t('chat.online')} • ${t('chat.publicChannel')}` : t('chat.publicChannel')
              : t('chat.reconnecting')}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50/50 dark:bg-gray-950/30">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="w-6 h-6 animate-spin text-brand-primary" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-400 text-sm py-10">
            {t('chat.noMessages')}
          </div>
        ) : (
          messages.map((msg) => {
            const me = isMe(msg);
            return (
              <div key={msg.id} className={`flex gap-3 ${me ? 'flex-row-reverse' : ''}`}>
                {/* Avatar */}
                {msg.avatarUrl ? (
                  <img src={msg.avatarUrl} alt={msg.sender}
                    className="w-8 h-8 rounded-full object-cover shrink-0 shadow-sm" />
                ) : (
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 shadow-sm ${me ? 'bg-brand-primary text-white' : colorFor(msg.userId || msg.sender)}`}>
                    {initialsFor(msg.sender)}
                  </div>
                )}

                {/* Bubble */}
                <div className={`flex flex-col ${me ? 'items-end' : 'items-start'} max-w-[80%]`}>
                  <div className="flex items-baseline gap-1.5 mb-1">
                    <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                      {me ? 'You' : msg.sender}
                      {(msg.role === 'admin' || msg.role === 'super_admin') && (
                        <span className="ml-1 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-100 text-blue-800">
                          <Shield size={9} className="mr-0.5" /> Official
                        </span>
                      )}
                    </span>
                    <span className="text-[10px] text-gray-400">{formatTime(msg.time)}</span>
                  </div>
                  <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                    me
                      ? 'bg-brand-primary text-white rounded-tr-none'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-100 dark:border-gray-700 rounded-tl-none'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* Typing indicator */}
        {typingUsers.length > 0 && (
          <div className="flex gap-3 items-center">
            <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xs text-gray-400 shrink-0">
              ...
            </div>
            <div className="flex flex-col items-start">
              <span className="text-xs text-gray-400 mb-1">{typingUsers.join(', ')} {typingUsers.length === 1 ? t('chat.typing') : t('chat.typingMultiple')}...</span>
              <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 px-4 py-2.5 rounded-2xl rounded-tl-none shadow-sm flex gap-1 items-center">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
        {user ? (
          connected ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => { setInput(e.target.value); handleTyping(); }}
                onKeyDown={handleKeyDown}
                placeholder={t('chat.placeholder')}
                className="flex-1 bg-gray-100 dark:bg-gray-800 border-transparent focus:bg-white dark:focus:bg-gray-700 focus:border-brand-primary/30 focus:ring-4 focus:ring-brand-primary/10 rounded-full px-5 py-3 outline-none transition-all text-sm text-gray-900 dark:text-white"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="bg-brand-primary hover:bg-brand-primaryDark disabled:opacity-50 disabled:cursor-not-allowed text-white p-3 rounded-full transition-transform active:scale-95 shadow-md shadow-brand-primary/20"
              >
                <Send size={18} />
              </button>
            </div>
          ) : (
            <div className="text-center text-xs text-gray-400 py-2">
              <Loader2 className="w-4 h-4 animate-spin mx-auto mb-1" />
              {t('chat.connecting')}
            </div>
          )
        ) : (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-center border border-gray-100 dark:border-gray-700">
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">{t('chat.loginPrompt')}</p>
            <div className="flex justify-center gap-3">
              <Link to="/login" className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 text-sm font-bold rounded-full hover:border-brand-primary hover:text-brand-primary transition-all">
                {t('common.login')}
              </Link>
              <Link to="/register" className="px-4 py-2 bg-brand-primary text-white text-sm font-bold rounded-full hover:bg-brand-primaryDark shadow-lg shadow-brand-primary/20 transition-all">
                {t('common.register')}
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatWidget;
