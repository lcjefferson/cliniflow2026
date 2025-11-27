'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, Send, Instagram, Loader2, UserPlus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Conversation {
    id: string;
    channel: string;
    contactName: string;
    contactPhone?: string | null;
    lastMessage?: string | null;
    lastMessageAt?: Date | null;
    unreadCount: number;
}

interface Message {
    id: string;
    content: string;
    direction: string;
    createdAt: Date;
}

export default function OmnichannelPage() {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [messageText, setMessageText] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [channelFilter, setChannelFilter] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const fetchConversations = useCallback(async () => {
        try {
            const url = channelFilter
                ? `/api/omnichannel/conversations?channel=${channelFilter}`
                : '/api/omnichannel/conversations';
            const response = await fetch(url);
            if (response.ok) {
                const data = await response.json();
                setConversations(data);
                if (!selectedConversation && data.length > 0) {
                    setSelectedConversation(data[0]);
                }
            }
        } catch (error) {
            console.error('Error fetching conversations:', error);
        } finally {
            setLoading(false);
        }
    }, [channelFilter, selectedConversation]);

    useEffect(() => {
        fetchConversations();
        const interval = setInterval(fetchConversations, 5000);
        return () => clearInterval(interval);
    }, [fetchConversations]);

    useEffect(() => {
        if (selectedConversation) {
            fetchMessages(selectedConversation.id);
        }
    }, [selectedConversation]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };


    const fetchMessages = async (conversationId: string) => {
        try {
            const response = await fetch(`/api/omnichannel/conversations/${conversationId}/messages`);
            if (response.ok) {
                const data = await response.json();
                setMessages(data);
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    const handleSendMessage = async () => {
        if (!messageText.trim() || !selectedConversation) return;

        try {
            setSending(true);
            const response = await fetch(`/api/omnichannel/conversations/${selectedConversation.id}/messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: messageText }),
            });

            if (response.ok) {
                setMessageText('');
                fetchMessages(selectedConversation.id);
                fetchConversations();
            } else {
                toast.error('Erro ao enviar mensagem');
            }
        } catch (error) {
            console.error('Error sending message:', error);
            toast.error('Erro ao enviar mensagem');
        } finally {
            setSending(false);
        }
    };

    const handleConvertToLead = async () => {
        if (!selectedConversation) return;

        try {
            const response = await fetch(`/api/omnichannel/conversations/${selectedConversation.id}/convert`, {
                method: 'POST',
            });

            if (response.ok) {
                toast.success('Conversa convertida em lead com sucesso!');
                fetchConversations();
            } else {
                const error = await response.json();
                toast.error(error.error || 'Erro ao converter conversa');
            }
        } catch (error) {
            console.error('Error converting conversation:', error);
            toast.error('Erro ao converter conversa');
        }
    };

    const formatTime = (date: Date | null | undefined) => {
        if (!date) return '';
        const d = new Date(date);
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        } else if (diffDays === 1) {
            return 'Ontem';
        } else {
            return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">Omnichannel</h1>
                <p className="text-gray-700">Gerencie conversas do WhatsApp e Instagram</p>
            </div>

            {/* Main Chat Interface */}
            <div className="grid gap-6 lg:grid-cols-12 h-[calc(100vh-250px)]">
                {/* Conversations List */}
                <div className="lg:col-span-4">
                    <Card className="h-full flex flex-col">
                        <CardContent className="p-4 flex-1 flex flex-col">
                            {/* Filter Tabs */}
                            <div className="flex gap-2 mb-4">
                                <Button
                                    variant={channelFilter === null ? 'primary' : 'secondary'}
                                    size="sm"
                                    className="flex-1"
                                    onClick={() => setChannelFilter(null)}
                                >
                                    Todas
                                </Button>
                                <Button
                                    variant={channelFilter === 'whatsapp' ? 'primary' : 'secondary'}
                                    size="sm"
                                    className="flex-1"
                                    onClick={() => setChannelFilter('whatsapp')}
                                >
                                    WhatsApp
                                </Button>
                                <Button
                                    variant={channelFilter === 'instagram' ? 'primary' : 'secondary'}
                                    size="sm"
                                    className="flex-1"
                                    onClick={() => setChannelFilter('instagram')}
                                >
                                    Instagram
                                </Button>
                            </div>

                            {/* Conversations */}
                            {loading ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
                                </div>
                            ) : conversations.length === 0 ? (
                                <div className="text-center py-12 text-gray-500">
                                    <p>Nenhuma conversa encontrada</p>
                                    <p className="text-sm mt-2">Configure o Omnichannel nas Configurações</p>
                                </div>
                            ) : (
                                <div className="flex-1 overflow-y-auto space-y-2 scrollbar-thin">
                                    {conversations.map((conversation) => (
                                        <div
                                            key={conversation.id}
                                            onClick={() => setSelectedConversation(conversation)}
                                            className={cn(
                                                'flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all',
                                                selectedConversation?.id === conversation.id
                                                    ? 'bg-blue-50 border border-blue-100'
                                                    : 'hover:bg-gray-50 border border-transparent'
                                            )}
                                        >
                                            <div className="relative">
                                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-primary-600">
                                                    <span className="text-sm font-semibold text-white">
                                                        {conversation.contactName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                                    </span>
                                                </div>
                                                {conversation.channel === 'whatsapp' ? (
                                                    <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-green-500 flex items-center justify-center border-2 border-white">
                                                        <MessageSquare className="h-3 w-3 text-white" />
                                                    </div>
                                                ) : (
                                                    <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-pink-500 flex items-center justify-center border-2 border-white">
                                                        <Instagram className="h-3 w-3 text-white" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-1">
                                                    <h3 className="font-semibold text-gray-900 truncate">{conversation.contactName}</h3>
                                                    <span className="text-xs text-gray-700">{formatTime(conversation.lastMessageAt)}</span>
                                                </div>
                                                <p className="text-sm text-gray-700 truncate">{conversation.lastMessage || 'Sem mensagens'}</p>
                                            </div>
                                            {conversation.unreadCount > 0 && (
                                                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-500">
                                                    <span className="text-xs font-semibold text-white">{conversation.unreadCount}</span>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Chat Area */}
                <div className="lg:col-span-8">
                    {selectedConversation ? (
                        <Card className="h-full flex flex-col">
                            {/* Chat Header */}
                            <div className="p-4 border-b border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-primary-600">
                                            <span className="text-sm font-semibold text-white">
                                                {selectedConversation.contactName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                            </span>
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900">{selectedConversation.contactName}</h3>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-gray-600">
                                                    {selectedConversation.channel === 'whatsapp' ? 'WhatsApp' : 'Instagram'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <Button variant="secondary" size="sm" onClick={handleConvertToLead}>
                                        <UserPlus className="h-4 w-4 mr-2" />
                                        Converter em Lead
                                    </Button>
                                </div>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin bg-gray-50">
                                {messages.map((msg) => (
                                    <div
                                        key={msg.id}
                                        className={cn(
                                            'flex',
                                            msg.direction === 'OUTBOUND' ? 'justify-end' : 'justify-start'
                                        )}
                                    >
                                        <div
                                            className={cn(
                                                'max-w-[70%] rounded-2xl px-4 py-3',
                                                msg.direction === 'OUTBOUND'
                                                    ? 'bg-primary-500 text-white'
                                                    : 'bg-white text-gray-900 border border-gray-200'
                                            )}
                                        >
                                            <p className="text-sm">{msg.content}</p>
                                            <span className={cn(
                                                'text-xs mt-1 block',
                                                msg.direction === 'OUTBOUND' ? 'text-blue-100' : 'text-gray-500'
                                            )}>
                                                {formatTime(msg.createdAt)}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Message Input */}
                            <div className="p-4 border-t border-gray-200">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Digite sua mensagem..."
                                        className="input-premium flex-1"
                                        value={messageText}
                                        onChange={(e) => setMessageText(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                        disabled={sending}
                                    />
                                    <Button onClick={handleSendMessage} disabled={sending || !messageText.trim()}>
                                        {sending ? (
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                        ) : (
                                            <Send className="h-5 w-5" />
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ) : (
                        <Card className="h-full flex items-center justify-center">
                            <div className="text-center text-gray-500">
                                <MessageSquare className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                                <p>Selecione uma conversa para começar</p>
                            </div>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
