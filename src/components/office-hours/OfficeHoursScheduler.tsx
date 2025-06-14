
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar, Clock, Users, Plus, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface OfficeHoursSchedulerProps {
  classId?: string;
  isTeacherView?: boolean;
}

interface OfficeHour {
  id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  max_participants: number;
  is_recurring: boolean;
  recurrence_pattern?: string;
  teacher_id: string;
  class_id?: string;
  bookings?: Array<{
    id: string;
    student_id: string;
    booking_status: string;
    profiles?: {
      full_name: string;
    };
  }>;
}

export const OfficeHoursScheduler: React.FC<OfficeHoursSchedulerProps> = ({
  classId,
  isTeacherView = false
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<OfficeHour | null>(null);
  const [bookingQuestions, setBookingQuestions] = useState('');

  const [newSlot, setNewSlot] = useState({
    title: '',
    description: '',
    start_time: '',
    end_time: '',
    max_participants: 5,
    is_recurring: false,
    recurrence_pattern: ''
  });

  // Fetch office hours
  const { data: officeHours, isLoading } = useQuery({
    queryKey: ['office-hours', classId, user?.id],
    queryFn: async () => {
      let query = supabase
        .from('office_hours')
        .select(`
          *,
          office_hours_bookings(
            id,
            student_id,
            booking_status,
            profiles!office_hours_bookings_student_id_fkey(full_name)
          )
        `)
        .order('start_time', { ascending: true });

      if (classId) {
        query = query.eq('class_id', classId);
      }

      if (isTeacherView) {
        query = query.eq('teacher_id', user?.id);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as OfficeHour[];
    },
    enabled: !!user
  });

  // Create office hour slot mutation
  const createSlotMutation = useMutation({
    mutationFn: async (slotData: typeof newSlot) => {
      const { error } = await supabase
        .from('office_hours')
        .insert({
          ...slotData,
          teacher_id: user?.id,
          class_id: classId
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['office-hours'] });
      toast({
        title: "Success",
        description: "Office hours slot created successfully"
      });
      setIsDialogOpen(false);
      setNewSlot({
        title: '',
        description: '',
        start_time: '',
        end_time: '',
        max_participants: 5,
        is_recurring: false,
        recurrence_pattern: ''
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Book office hours mutation
  const bookSlotMutation = useMutation({
    mutationFn: async ({
      officeHourId,
      questions
    }: {
      officeHourId: string;
      questions: string;
    }) => {
      const { error } = await supabase
        .from('office_hours_bookings')
        .insert({
          office_hours_id: officeHourId,
          student_id: user?.id,
          questions,
          booking_status: 'confirmed'
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['office-hours'] });
      toast({
        title: "Success",
        description: "Office hours booked successfully"
      });
      setSelectedSlot(null);
      setBookingQuestions('');
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleCreateSlot = () => {
    if (!newSlot.title || !newSlot.start_time || !newSlot.end_time) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    createSlotMutation.mutate(newSlot);
  };

  const handleBookSlot = (slot: OfficeHour) => {
    bookSlotMutation.mutate({
      officeHourId: slot.id,
      questions: bookingQuestions
    });
  };

  const formatDateTime = (dateTimeString: string) => {
    return new Date(dateTimeString).toLocaleString();
  };

  const getAvailableSpots = (slot: OfficeHour) => {
    const confirmedBookings = slot.bookings?.filter(b => b.booking_status === 'confirmed').length || 0;
    return slot.max_participants - confirmedBookings;
  };

  const isUserBooked = (slot: OfficeHour) => {
    return slot.bookings?.some(b => b.student_id === user?.id && b.booking_status === 'confirmed');
  };

  if (isLoading) {
    return <div className="text-center py-4">Loading office hours...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Office Hours</h2>
          <p className="text-gray-600">
            {isTeacherView ? 'Manage your office hours' : 'Book time with your instructors'}
          </p>
        </div>
        {isTeacherView && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Slot
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Office Hours Slot</DialogTitle>
                <DialogDescription>
                  Set up a new office hours time slot for students to book
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={newSlot.title}
                    onChange={(e) => setNewSlot(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Weekly Office Hours"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newSlot.description}
                    onChange={(e) => setNewSlot(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Optional description..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="start_time">Start Time</Label>
                    <Input
                      id="start_time"
                      type="datetime-local"
                      value={newSlot.start_time}
                      onChange={(e) => setNewSlot(prev => ({ ...prev, start_time: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="end_time">End Time</Label>
                    <Input
                      id="end_time"
                      type="datetime-local"
                      value={newSlot.end_time}
                      onChange={(e) => setNewSlot(prev => ({ ...prev, end_time: e.target.value }))}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="max_participants">Max Participants</Label>
                  <Input
                    id="max_participants"
                    type="number"
                    min="1"
                    max="20"
                    value={newSlot.max_participants}
                    onChange={(e) => setNewSlot(prev => ({ ...prev, max_participants: parseInt(e.target.value) }))}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCreateSlot} disabled={createSlotMutation.isPending}>
                  Create Slot
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Office Hours List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {officeHours && officeHours.length > 0 ? (
          officeHours.map((slot) => (
            <Card key={slot.id}>
              <CardHeader>
                <CardTitle className="text-lg">{slot.title}</CardTitle>
                {slot.description && (
                  <CardDescription>{slot.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2 text-sm">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDateTime(slot.start_time)}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Clock className="h-4 w-4" />
                  <span>
                    {new Date(slot.end_time).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-sm">
                    <Users className="h-4 w-4" />
                    <span>{getAvailableSpots(slot)} spots left</span>
                  </div>
                  {isUserBooked(slot) && (
                    <Badge variant="default">Booked</Badge>
                  )}
                </div>
                
                {!isTeacherView && !isUserBooked(slot) && getAvailableSpots(slot) > 0 && (
                  <Button
                    className="w-full"
                    size="sm"
                    onClick={() => setSelectedSlot(slot)}
                  >
                    Book This Slot
                  </Button>
                )}

                {isTeacherView && slot.bookings && slot.bookings.length > 0 && (
                  <div className="pt-2 border-t">
                    <p className="text-sm font-medium mb-2">Bookings:</p>
                    <div className="space-y-1">
                      {slot.bookings
                        .filter(b => b.booking_status === 'confirmed')
                        .map((booking) => (
                        <div key={booking.id} className="text-xs text-gray-600">
                          {booking.profiles?.full_name || 'Anonymous'}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center text-gray-500 py-8">
            {isTeacherView ? 'No office hours scheduled yet' : 'No office hours available'}
          </div>
        )}
      </div>

      {/* Booking Dialog */}
      {selectedSlot && (
        <Dialog open={!!selectedSlot} onOpenChange={() => setSelectedSlot(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Book Office Hours</DialogTitle>
              <DialogDescription>
                {selectedSlot.title} - {formatDateTime(selectedSlot.start_time)}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="questions">Questions or Topics</Label>
                <Textarea
                  id="questions"
                  value={bookingQuestions}
                  onChange={(e) => setBookingQuestions(e.target.value)}
                  placeholder="What would you like to discuss? (Optional)"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={() => handleBookSlot(selectedSlot)}
                disabled={bookSlotMutation.isPending}
              >
                Book Slot
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
