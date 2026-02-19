import React, { useState, useEffect, useRef } from 'react';
import { Send, User, MessageCircle, MoreVertical, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const ChatWidget = ({ title = "Community Discussion", compact = false }) => {
    const { user } = useAuth();
    const scrollRef = useRef(null);

    // Mock initial messages resembling a public chat
    const [messages, setMessages] = useState([
        { 
            id: 1, 
            text: "Has anyone noticed the streetlights are off in Sector 4?", 
            sender: "Rahul Sharma", 
            role: "resident",
            time: "10:30 AM",
            initials: "RS",
            color: "bg-blue-100 text-blue-600"
        },
        { 
            id: 2, 
            text: "Yes! I reported it yesterday. Hopefully, they fix it soon.", 
            sender: "Priya Singh", 
            role: "resident",
            time: "10:32 AM",
            initials: "PS",
            color: "bg-pink-100 text-pink-600"
        },
        { 
            id: 3, 
            text: "We have received the complaint. A team has been dispatched to Sector 4.", 
            sender: "Admin", 
            role: "official",
            time: "10:35 AM",
            initials: "AD",
            color: "bg-brand-primary text-white" 
        }
    ]);
    const [input, setInput] = useState("");

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = () => {
        if (!input.trim() || !user) return;
        
        const newMessage = {
            id: Date.now(),
            text: input,
            sender: user.name || "User", // Use actual logged-in name
            role: user.role || "resident",
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            initials: user.name ? user.name.charAt(0).toUpperCase() : "U",
            color: "bg-purple-600 text-white", // Own message color
            isMe: true
        };

        setMessages([...messages, newMessage]);
        setInput("");

        // Simulate random community response for liveliness
        if (Math.random() > 0.7) {
            setTimeout(() => {
                 setMessages(prev => [...prev, {
                    id: Date.now() + 1,
                    text: "Thanks for the update!",
                    sender: "Suresh Kumar",
                    role: "resident",
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    initials: "SK",
                    color: "bg-green-100 text-green-600"
                 }]);
            }, 2000);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleSend();
    };

    return (
        <div className={`flex flex-col bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden ${compact ? 'h-[500px]' : 'h-[calc(100vh-8rem)]'}`}>
             {/* Header */}
             <div className="p-4 border-b border-gray-100 bg-white flex justify-between items-center sticky top-0 z-10">
                 <div>
                    <div className="flex items-center gap-2">
                        <h2 className="font-bold text-lg text-gray-800">{title}</h2>
                        <span className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                    </div>
                    <p className="text-xs text-gray-500">32 neighbors online • Public Channel</p>
                 </div>
                 <button className="text-gray-400 hover:text-gray-600">
                     <MoreVertical size={20} />
                 </button>
             </div>
             
             {/* Messages Area */}
             <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto space-y-6 bg-gray-50/50">
                <div className="text-center text-xs text-gray-400 my-4">
                    <span>Today</span>
                </div>

                 {messages.map((msg) => (
                     <div key={msg.id} className={`flex gap-3 ${msg.isMe ? 'flex-row-reverse' : ''}`}>
                         {/* Avatar */}
                         <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 shadow-sm ${msg.color}`}>
                             {msg.initials}
                         </div>

                         {/* Message Bubble */}
                         <div className={`flex flex-col ${msg.isMe ? 'items-end' : 'items-start'} max-w-[80%]`}>
                             <div className="flex items-baseline gap-2 mb-1">
                                 <span className="text-xs font-bold text-gray-700">
                                     {msg.sender}
                                     {msg.role === 'official' && (
                                         <span className="ml-1 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-100 text-blue-800">
                                             <Shield size={10} className="mr-0.5" /> Official
                                         </span>
                                     )}
                                 </span>
                                 <span className="text-[10px] text-gray-400">{msg.time}</span>
                             </div>
                             
                             <div className={`px-4 py-2 rounded-2xl text-sm leading-relaxed shadow-sm ${
                                 msg.isMe 
                                    ? 'bg-brand-primary text-white rounded-tr-none' 
                                    : 'bg-white text-gray-700 border border-gray-100 rounded-tl-none'
                             }`}>
                                 {msg.text}
                             </div>
                         </div>
                     </div>
                 ))}
             </div>

             {/* Input Area */}
             <div className="p-4 bg-white border-t border-gray-100">
                 {user ? (
                    <div className="flex items-center gap-2">
                        <input 
                            type="text" 
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Type a message to the community..."
                            className="flex-1 bg-gray-100 border-transparent focus:bg-white focus:border-brand-primary/30 focus:ring-4 focus:ring-brand-primary/10 rounded-full px-5 py-3 outline-none transition-all text-sm text-gray-900"
                        />
                        <button 
                            onClick={handleSend}
                            disabled={!input.trim()}
                            className="bg-brand-primary hover:bg-brand-primaryDark disabled:opacity-50 disabled:cursor-not-allowed text-white p-3 rounded-full transition-transform transform active:scale-95 shadow-md shadow-brand-primary/20"
                        >
                            <Send size={18} />
                        </button>
                    </div>
                 ) : (
                     <div className="bg-gray-50 rounded-xl p-4 text-center border border-gray-100">
                         <p className="text-gray-600 text-sm mb-3">Join the conversation to post messages.</p>
                         <div className="flex justify-center gap-3">
                             <Link to="/login" className="px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-bold rounded-full hover:border-brand-primary hover:text-brand-primary transition-all">
                                 Log In
                             </Link>
                             <Link to="/register" className="px-4 py-2 bg-brand-primary text-white text-sm font-bold rounded-full hover:bg-brand-primaryDark shadow-lg shadow-brand-primary/20 transition-all">
                                 Sign Up
                             </Link>
                         </div>
                     </div>
                 )}
             </div>
        </div>
    );
};

export default ChatWidget;
