import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import Sidebar from '../../components/Sidebar';
import { sendMessage, getChatHistory, closeSession, type ChatMessage } from '../../models/chatbot.api';

export default function ChatbotPage() {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputMessage, setInputMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [error, setError] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const userRole = localStorage.getItem('role') || 'USER';

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'nearest' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        try {
            setInitialLoading(true);
            const history = await getChatHistory();
            setMessages(history);
        } catch (err: any) {
            console.error('Lỗi tải lịch sử:', err);
            setError(err.message || 'Không thể tải lịch sử chat');
        } finally {
            setInitialLoading(false);
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!inputMessage.trim()) return;

        const userMessage = inputMessage.trim();
        setInputMessage('');
        setLoading(true);
        setError('');

        // Add user message optimistically
        const tempUserMsg: ChatMessage = {
            id: Date.now(),
            role: 'USER',
            content: userMessage,
            createdAt: new Date().toISOString(),
            sessionId: 0,
        };
        setMessages(prev => [...prev, tempUserMsg]);

        try {
            const response = await sendMessage(userMessage);

            // Add assistant response
            const assistantMsg: ChatMessage = {
                id: Date.now() + 1,
                role: 'ASSISTANT',
                content: response.message,
                createdAt: response.timestamp,
                sessionId: 0,
            };

            setMessages(prev => [...prev, assistantMsg]);
        } catch (err: any) {
            setError(err.message || 'Không thể gửi tin nhắn');
            // Remove optimistic user message on error
            setMessages(prev => prev.filter(m => m.id !== tempUserMsg.id));
        } finally {
            setLoading(false);
        }
    };

    const handleCloseSession = async () => {
        if (!confirm('Bạn có chắc muốn đóng phiên chat này?')) return;

        try {
            await closeSession();
            setMessages([]);
            alert('Đã đóng phiên chat thành công');
        } catch (err: any) {
            setError(err.message || 'Không thể đóng phiên chat');
        }
    };

    if (initialLoading) {
        return (
            <div className="flex bg-[#07150D] h-screen overflow-hidden">
                <Sidebar />
                <main className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mb-4"></div>
                        <p className="text-gray-400">Đang tải lịch sử chat...</p>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="flex bg-[#07150D] h-screen overflow-hidden">
            <Sidebar />

            {/* Main Chat Container */}
            <main className="flex-1 flex flex-col overflow-hidden">

                {/* Header - Fixed */}
                <div className="flex-shrink-0 bg-[#0E2219] border-b border-[#1E3A2B] px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                            <span className="material-icons text-green-500">smart_toy</span>
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-white">Carbon Credit Assistant</h1>
                            <p className="text-sm text-gray-400">
                                {userRole === 'FARMER' ? 'Tư vấn cho chủ nông trại' : 'Tư vấn về Carbon Credit'}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={handleCloseSession}
                        className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition flex items-center gap-2 border border-red-500/30"
                    >
                        <span className="material-icons text-sm">close</span>
                        Đóng phiên
                    </button>
                </div>

                {/* Messages Area - Scrollable */}
                <div className="flex-1 overflow-y-auto px-6 py-4">
                    {messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
                                <span className="material-icons text-5xl text-green-500">chat</span>
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">Chào mừng đến với Chatbot AI</h2>
                            <p className="text-gray-400 max-w-md">
                                Tôi có thể giúp bạn hiểu về carbon credit, cách tính toán, và tư vấn loại cây phù hợp.
                                Hãy đặt câu hỏi bất kỳ!
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4 max-w-4xl mx-auto pb-6">
                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex ${msg.role === 'USER' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[75%] rounded-2xl px-5 py-3 ${msg.role === 'USER'
                                            ? 'bg-green-500 text-black'
                                            : 'bg-[#0E2219] text-white border border-[#1E3A2B]'
                                            }`}
                                    >
                                        {msg.role === 'ASSISTANT' ? (
                                            <div className="prose prose-invert prose-sm max-w-none">
                                                <ReactMarkdown>{msg.content}</ReactMarkdown>
                                            </div>
                                        ) : (
                                            <p className="whitespace-pre-wrap">{msg.content}</p>
                                        )}
                                        <p className="text-xs mt-2 opacity-60">
                                            {new Date(msg.createdAt).toLocaleTimeString('vi-VN', {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </p>
                                    </div>
                                </div>
                            ))}

                            {loading && (
                                <div className="flex justify-start">
                                    <div className="bg-[#0E2219] border border-[#1E3A2B] rounded-2xl px-5 py-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
                                            <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                            <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Spacer to prevent last message from being hidden */}
                            <div className="h-20"></div>
                            <div ref={messagesEndRef} />
                        </div>
                    )}
                </div>

                {/* Error Message - Fixed */}
                {error && (
                    <div className="flex-shrink-0 px-6 py-2 bg-[#07150D]">
                        <div className="bg-red-900/20 border border-red-500 text-red-200 px-4 py-2 rounded-lg text-sm flex items-center gap-2 max-w-4xl mx-auto">
                            <span className="material-icons text-sm">error</span>
                            {error}
                        </div>
                    </div>
                )}

                {/* Input Area - Fixed */}
                <div className="flex-shrink-0 bg-[#0E2219] border-t border-[#1E3A2B] px-6 py-4">
                    <div className="max-w-4xl mx-auto">
                        <form onSubmit={handleSendMessage} className="flex gap-3">
                            <input
                                type="text"
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                placeholder="Nhập câu hỏi của bạn..."
                                disabled={loading}
                                className="flex-1 px-4 py-3 bg-[#071811] border border-[#1E3A2B] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
                            />
                            <button
                                type="submit"
                                disabled={loading || !inputMessage.trim()}
                                className="px-6 py-3 bg-green-500 hover:bg-green-600 text-black font-semibold rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                                        Đang gửi...
                                    </>
                                ) : (
                                    <>
                                        <span className="material-icons">send</span>
                                        Gửi
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-3 text-xs text-gray-500 text-center">
                            💡 Bạn đang dùng với tư cách: <span className="text-green-400 font-semibold">
                                {userRole === 'FARMER' ? 'Chủ nông trại' : 'Người dùng'}
                            </span>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
