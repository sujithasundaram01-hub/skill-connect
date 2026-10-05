import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Connection, Message } from '../types/index.js';
import { useAuth } from '../context/AuthContext.js';
import { useToast } from '../context/ToastContext.js';
import { apiRequest } from '../api/client.js';
import { ReviewModal } from '../components/reviews/ReviewModal.js';
import { io, Socket } from 'socket.io-client';
import {
  MessageSquare,
  Send,
  User,
  Check,
  CheckCheck,
  CheckCircle2,
  Star,
  ShieldAlert,
  GraduationCap,
  Clock,
  ArrowLeft,
} from 'lucide-react';

export const MessagesPage: React.FC = () => {
  const { user, token } = useAuth();
  const { success, error } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const selectedConnectionId = searchParams.get('connection');

  const [connections, setConnections] = useState<Connection[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentConnection, setCurrentConnection] = useState<any>(null);
  const [isBlocked, setIsBlocked] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [isLoadingConns, setIsLoadingConns] = useState(true);
  const [isLoadingMsgs, setIsLoadingMsgs] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize Socket.io
  useEffect(() => {
    if (!token) return;

    const socket = io('/', {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    socket.on('new_message', (msg: Message) => {
      setMessages((prev) => {
        // avoid duplicate if already in state
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
      scrollToBottom();
    });

    return () => {
      socket.disconnect();
    };
  }, [token]);

  // Load all connections
  const fetchConnections = useCallback(async () => {
    try {
      const res = await apiRequest('/connections');
      if (res.success) {
        setConnections(res.connections || []);
      }
    } catch (err) {
      console.error('Fetch connections error:', err);
    } finally {
      setIsLoadingConns(false);
    }
  }, []);

  useEffect(() => {
    fetchConnections();
  }, [fetchConnections]);

  // Load messages for selected connection
  const fetchMessages = useCallback(async (connId: string) => {
    setIsLoadingMsgs(true);
    try {
      const res = await apiRequest(`/messages/${connId}`);
      if (res.success) {
        setMessages(res.messages || []);
        setCurrentConnection(res.connection || null);
        setIsBlocked(res.isBlocked || false);

        // Join socket room
        if (socketRef.current) {
          socketRef.current.emit('join_conversation', connId);
        }
      } else {
        error(res.message);
      }
    } catch {
      error('Failed to load messages.');
    } finally {
      setIsLoadingMsgs(false);
    }
  }, [error]);

  useEffect(() => {
    if (selectedConnectionId) {
      fetchMessages(selectedConnectionId);
    } else if (connections.length > 0 && !selectedConnectionId) {
      // Auto-select first connection
      setSearchParams({ connection: connections[0].id });
    }
  }, [selectedConnectionId, connections, fetchMessages, setSearchParams]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedConnectionId || isSending) return;

    const textToSend = messageText.trim();
    setMessageText('');
    setIsSending(true);

    try {
      const res = await apiRequest(`/messages/${selectedConnectionId}`, {
        method: 'POST',
        body: JSON.stringify({ message: textToSend }),
      });

      if (res.success && res.message) {
        setMessages((prev) => [...prev, res.message]);

        // Broadcast to socket room
        if (socketRef.current) {
          socketRef.current.emit('send_message', {
            connectionId: selectedConnectionId,
            message: res.message,
          });
        }

        scrollToBottom();
      } else {
        error(res.message || 'Failed to send message.');
        setMessageText(textToSend); // Restore
      }
    } catch {
      error('Failed to send message.');
      setMessageText(textToSend);
    } finally {
      setIsSending(false);
    }
  };

  // Update status from within message header
  const handleUpdateStatus = async (status: 'Started' | 'Learning' | 'Completed') => {
    if (!selectedConnectionId) return;

    try {
      const res = await apiRequest(`/connections/${selectedConnectionId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });

      if (res.success) {
        success(res.message);
        setCurrentConnection((prev: any) => ({ ...prev, status }));
        fetchConnections();
      } else {
        error(res.message);
      }
    } catch {
      error('Failed to update status.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden h-[82vh] flex flex-col md:flex-row">
        {/* Left Column: Conversations List */}
        <div
          className={`w-full md:w-80 lg:w-96 border-r border-stone-200 flex flex-col ${
            selectedConnectionId ? 'hidden md:flex' : 'flex'
          }`}
        >
          <div className="p-4 border-b border-stone-100 flex items-center justify-between">
            <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-brand-600" />
              Connected Learners ({connections.length})
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-stone-100">
            {isLoadingConns ? (
              <div className="p-6 text-center text-xs text-stone-400">Loading conversations...</div>
            ) : connections.length > 0 ? (
              connections.map((conn) => {
                const isSelected = conn.id === selectedConnectionId;
                return (
                  <button
                    key={conn.id}
                    onClick={() => setSearchParams({ connection: conn.id })}
                    className={`w-full text-left p-4 transition flex items-start gap-3 hover:bg-stone-50 ${
                      isSelected ? 'bg-brand-50/70 border-r-4 border-brand-600' : ''
                    }`}
                  >
                    {conn.partner.profilePhoto ? (
                      <img
                        src={conn.partner.profilePhoto}
                        alt={conn.partner.name}
                        className="w-10 h-10 rounded-full object-cover border border-stone-200 shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-brand-600 text-white font-bold flex items-center justify-center text-sm shrink-0">
                        {conn.partner.name.charAt(0).toUpperCase()}
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-stone-900 truncate">
                          {conn.partner.name}
                        </h4>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                            conn.status === 'Completed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-stone-100 text-stone-600'
                          }`}
                        >
                          {conn.status}
                        </span>
                      </div>

                      <p className="text-xs font-semibold text-brand-700 truncate mt-0.5">
                        {conn.skill.skillName}
                      </p>

                      <p className="text-xs text-stone-500 truncate mt-1">
                        {conn.lastMessage
                          ? conn.lastMessage.message
                          : 'Connected! Say hello and coordinate.'}
                      </p>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="p-8 text-center text-xs text-stone-400 space-y-2">
                <p>No active connections yet.</p>
                <Link
                  to="/explore"
                  className="inline-block text-xs font-bold text-brand-600 hover:underline"
                >
                  Explore skills to connect
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Chat Window */}
        <div
          className={`flex-1 flex flex-col bg-stone-50/50 ${
            !selectedConnectionId ? 'hidden md:flex' : 'flex'
          }`}
        >
          {currentConnection ? (
            <>
              {/* Chat Header */}
              <div className="p-4 bg-white border-b border-stone-200 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSearchParams({})}
                    className="md:hidden p-1.5 rounded-lg text-stone-500 hover:bg-stone-100"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>

                  {currentConnection.partner?.profilePhoto ? (
                    <img
                      src={currentConnection.partner.profilePhoto}
                      alt={currentConnection.partner.name}
                      className="w-10 h-10 rounded-full object-cover border border-stone-200"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-brand-600 text-white font-bold flex items-center justify-center text-sm">
                      {currentConnection.partner?.name?.charAt(0).toUpperCase()}
                    </div>
                  )}

                  <div>
                    <h3 className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
                      {currentConnection.partner?.name}
                      {currentConnection.partner?.verificationStatus && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 fill-emerald-100" />
                      )}
                    </h3>
                    <p className="text-xs text-stone-500">
                      Topic: <strong className="text-stone-700">{currentConnection.skill?.skillName}</strong>
                    </p>
                  </div>
                </div>

                {/* Progress actions in chat header */}
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-xl ${
                      currentConnection.status === 'Completed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : currentConnection.status === 'Learning'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {currentConnection.status}
                  </span>

                  {currentConnection.status === 'Started' && (
                    <button
                      onClick={() => handleUpdateStatus('Learning')}
                      className="px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 text-xs font-semibold transition"
                    >
                      Start Learning
                    </button>
                  )}

                  {currentConnection.status === 'Learning' && (
                    <button
                      onClick={() => handleUpdateStatus('Completed')}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Mark Completed
                    </button>
                  )}

                  {currentConnection.status === 'Completed' && (
                    <button
                      onClick={() => setReviewModalOpen(true)}
                      className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition shadow-xs flex items-center gap-1"
                    >
                      <Star className="w-3.5 h-3.5" />
                      Leave Review
                    </button>
                  )}
                </div>
              </div>

              {/* Blocked Alert Banner if applicable */}
              {isBlocked && (
                <div className="p-3 bg-rose-50 border-b border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>
                    Messaging is currently disabled due to member safety block preferences.
                  </span>
                </div>
              )}

              {/* Messages Thread */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                {isLoadingMsgs ? (
                  <div className="py-12 flex justify-center">
                    <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : messages.length > 0 ? (
                  messages.map((m) => {
                    const isMe = m.senderId === user?.id;
                    return (
                      <div
                        key={m.id}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-md sm:max-w-lg rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed shadow-2xs ${
                            isMe
                              ? 'bg-brand-600 text-white rounded-br-xs'
                              : 'bg-white border border-stone-200 text-stone-800 rounded-bl-xs'
                          }`}
                        >
                          <p>{m.message}</p>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-stone-400 mt-1 px-1">
                          <span>
                            {new Date(m.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          {isMe && (
                            <span>
                              {m.readStatus ? (
                                <CheckCheck className="w-3 h-3 text-brand-600 inline" />
                              ) : (
                                <Check className="w-3 h-3 inline" />
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="py-16 text-center text-xs text-stone-400 space-y-1">
                    <p className="font-semibold text-stone-600">No messages exchanged yet.</p>
                    <p>Say hello to coordinate times, location, or online meeting links!</p>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input Box */}
              {!isBlocked ? (
                <form
                  onSubmit={handleSendMessage}
                  className="p-3 bg-white border-t border-stone-200 flex items-center gap-2"
                >
                  <input
                    type="text"
                    placeholder="Type a friendly message to coordinate your learning..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    className="flex-1 px-4 py-2.5 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-stone-50"
                  />
                  <button
                    type="submit"
                    disabled={!messageText.trim() || isSending}
                    className="p-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-40 text-white shadow-xs transition active:scale-95"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                <div className="p-3 bg-stone-100 text-center text-xs text-stone-500 font-medium">
                  Messaging restricted
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-stone-400 space-y-3">
              <MessageSquare className="w-12 h-12 text-stone-300" />
              <h3 className="text-base font-bold text-stone-700">Select a Conversation</h3>
              <p className="text-xs text-stone-500 max-w-sm">
                Choose a learner or teacher from the list to coordinate sessions and track learning progress.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Review Modal */}
      {currentConnection && (
        <ReviewModal
          connectionId={currentConnection.id}
          partnerName={currentConnection.partner?.name || 'Partner'}
          skillName={currentConnection.skill?.skillName || 'Skill'}
          isOpen={reviewModalOpen}
          onClose={() => setReviewModalOpen(false)}
          onSuccess={() => {
            fetchConnections();
            if (selectedConnectionId) fetchMessages(selectedConnectionId);
          }}
        />
      )}
    </div>
  );
};
