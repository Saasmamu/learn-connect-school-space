
import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Send, Users, Hash } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ClassChatRoomProps {
  classId: string;
  className?: string;
}

interface ChatMessage {
  id: string;
  message: string;
  message_type: string;
  sent_at: string;
  sender_id: string;
  profiles?: {
    full_name: string;
    avatar_url?: string;
  };
}

interface ChatRoom {
  id: string;
  name: string;
  description?: string;
  room_type: string;
  is_active: boolean;
}

export const ClassChatRoom: React.FC<ClassChatRoomProps> = ({
  classId,
  className
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [message, setMessage] = useState('');
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);

  // Fetch chat rooms for the class
  const { data: rooms, isLoading: roomsLoading } = useQuery({
    queryKey: ['chat-rooms', classId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chat_rooms')
        .select('*')
        .eq('class_id', classId)
        .eq('is_active', true)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data as ChatRoom[];
    }
  });

  // Fetch messages for selected room
  const { data: messages, isLoading: messagesLoading } = useQuery({
    queryKey: ['chat-messages', selectedRoom],
    queryFn: async () => {
      if (!selectedRoom) return [];
      
      const { data, error } = await supabase
        .from('chat_messages')
        .select(`
          *,
          profiles!chat_messages_sender_id_profiles_id_fkey(full_name, avatar_url)
        `)
        .eq('room_id', selectedRoom)
        .order('sent_at', { ascending: true })
        .limit(100);
      
      if (error) throw error;
      return data as ChatMessage[];
    },
    enabled: !!selectedRoom
  });

  // Create default room if none exists
  const createRoomMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase
        .from('chat_rooms')
        .insert({
          class_id: classId,
          name: `${className || 'Class'} General Chat`,
          description: 'General discussion for the class',
          room_type: 'class',
          created_by: user?.id
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (newRoom) => {
      queryClient.invalidateQueries({ queryKey: ['chat-rooms', classId] });
      setSelectedRoom(newRoom.id);
    }
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (messageText: string) => {
      if (!selectedRoom) return;
      
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          room_id: selectedRoom,
          sender_id: user?.id,
          message: messageText,
          message_type: 'text'
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-messages', selectedRoom] });
      setMessage('');
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Select first room or create one if none exists
  useEffect(() => {
    if (rooms && rooms.length > 0 && !selectedRoom) {
      setSelectedRoom(rooms[0].id);
    } else if (rooms && rooms.length === 0 && !createRoomMutation.isPending) {
      createRoomMutation.mutate();
    }
  }, [rooms, selectedRoom]);

  // Set up real-time subscription
  useEffect(() => {
    if (!selectedRoom) return;

    const channel = supabase
      .channel(`room-${selectedRoom}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `room_id=eq.${selectedRoom}`
      }, () => {
        queryClient.invalidateQueries({ queryKey: ['chat-messages', selectedRoom] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedRoom, queryClient]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !selectedRoom) return;
    
    sendMessageMutation.mutate(message);
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (roomsLoading) {
    return <div className="text-center py-4">Loading chat...</div>;
  }

  return (
    <div className="flex h-96 border rounded-lg overflow-hidden">
      {/* Room List Sidebar */}
      <div className="w-1/4 border-r bg-gray-50">
        <div className="p-3 border-b">
          <h3 className="font-semibold text-sm">Chat Rooms</h3>
        </div>
        <div className="p-2 space-y-1">
          {rooms?.map((room) => (
            <button
              key={room.id}
              onClick={() => setSelectedRoom(room.id)}
              className={`w-full text-left p-2 rounded text-sm hover:bg-gray-100 ${
                selectedRoom === room.id ? 'bg-blue-100 text-blue-700' : ''
              }`}
            >
              <div className="flex items-center space-x-2">
                <Hash className="h-3 w-3" />
                <span className="truncate">{room.name}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 flex flex-col">
        {selectedRoom && (
          <>
            {/* Chat Header */}
            <div className="p-3 border-b bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Hash className="h-4 w-4" />
                  <span className="font-medium">
                    {rooms?.find(r => r.id === selectedRoom)?.name}
                  </span>
                </div>
                <Badge variant="outline">
                  <Users className="h-3 w-3 mr-1" />
                  {messages?.length || 0} messages
                </Badge>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {messagesLoading ? (
                <div className="text-center py-4">Loading messages...</div>
              ) : messages && messages.length > 0 ? (
                messages.map((msg) => (
                  <div key={msg.id} className="flex items-start space-x-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={msg.profiles?.avatar_url} />
                      <AvatarFallback className="text-xs">
                        {msg.profiles?.full_name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">
                          {msg.profiles?.full_name || 'Anonymous'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatTime(msg.sent_at)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mt-1">{msg.message}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-8">
                  No messages yet. Start the conversation!
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <form onSubmit={handleSendMessage} className="p-3 border-t bg-white">
              <div className="flex space-x-2">
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message..."
                  disabled={sendMessageMutation.isPending}
                />
                <Button
                  type="submit"
                  size="sm"
                  disabled={!message.trim() || sendMessageMutation.isPending}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
