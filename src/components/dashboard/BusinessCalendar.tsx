import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  addCalendarEvent,
  deleteCalendarEvent,
  listEventsByMonth,
  toggleCalendarEventComplete,
} from "@/integrations/firebase/firestoreCalendar";
import { listOrdersByDateRange } from "@/integrations/firebase/firestoreOrders";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { format, isSameDay, startOfMonth, endOfMonth } from "date-fns";
import { 
  Plus, 
  CalendarDays, 
  Clock, 
  CheckCircle2, 
  Bell, 
  StickyNote,
  Cake,
  Trash2,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CalendarEvent {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  event_date: string;
  event_time: string | null;
  event_type: string;
  is_completed: boolean;
  color: string;
}

interface Order {
  id: string;
  customer_name: string;
  cake_type: string;
  event_date: string;
  status: string;
}

export function BusinessCalendar() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    event_type: "reminder",
    event_time: "",
    color: "primary",
  });

  useEffect(() => {
    fetchData();
  }, [user, selectedDate]);

  const fetchData = async () => {
    if (!user) return;
    
    try {
      const monthStart = startOfMonth(selectedDate);
      const monthEnd = endOfMonth(selectedDate);
      const startISO = monthStart.toISOString().split("T")[0];
      const endISO = monthEnd.toISOString().split("T")[0];
      
      const [eventsData, ordersData] = await Promise.all([
        listEventsByMonth(startISO, endISO),
        listOrdersByDateRange(startISO, endISO),
      ]);

      setEvents(eventsData || []);
      setOrders(ordersData || []);
    } catch (error) {
      console.error("Error fetching calendar data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEvent = async () => {
    if (!user || !newEvent.title.trim()) {
      toast.error("Please enter a title for the event");
      return;
    }

    try {
      await addCalendarEvent({
        user_id: user.uid,
        title: newEvent.title,
        description: newEvent.description || null,
        event_date: format(selectedDate, "yyyy-MM-dd"),
        event_time: newEvent.event_time || null,
        event_type: newEvent.event_type,
        color: newEvent.color,
        is_completed: false,
      });

      toast.success("Event added successfully");
      setIsAddDialogOpen(false);
      setNewEvent({
        title: "",
        description: "",
        event_type: "reminder",
        event_time: "",
        color: "primary",
      });
      fetchData();
    } catch (error) {
      toast.error("Failed to add event");
    }
  };

  const handleToggleComplete = async (event: CalendarEvent) => {
    try {
      await toggleCalendarEventComplete(event.id, !event.is_completed);
      setEvents(prev =>
        prev.map(e =>
          e.id === event.id ? { ...e, is_completed: !e.is_completed } : e
        )
      );
    } catch (error) {
      toast.error("Failed to update event");
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      await deleteCalendarEvent(eventId);
      setEvents(prev => prev.filter(e => e.id !== eventId));
      toast.success("Event deleted");
    } catch (error) {
      toast.error("Failed to delete event");
    }
  };

  // Get events and orders for the selected date
  const selectedDateEvents = events.filter(event =>
    isSameDay(new Date(event.event_date), selectedDate)
  );
  const selectedDateOrders = orders.filter(order =>
    isSameDay(new Date(order.event_date), selectedDate)
  );

  // Get dates that have events or orders
  const datesWithItems = [
    ...events.map(e => new Date(e.event_date)),
    ...orders.map(o => new Date(o.event_date)),
  ];

  const getEventIcon = (type: string) => {
    switch (type) {
      case "reminder":
        return <Bell className="h-4 w-4" />;
      case "todo":
        return <CheckCircle2 className="h-4 w-4" />;
      case "note":
        return <StickyNote className="h-4 w-4" />;
      default:
        return <CalendarDays className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "in_progress":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "delivered":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <Card className="col-span-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="font-display text-xl flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-primary" />
          Business Calendar
        </CardTitle>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Event
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                Add Event for {format(selectedDate, "MMMM d, yyyy")}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Title</label>
                <Input
                  placeholder="Event title..."
                  value={newEvent.title}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, title: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Type</label>
                <Select
                  value={newEvent.event_type}
                  onValueChange={(value) =>
                    setNewEvent({ ...newEvent, event_type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="reminder">
                      <span className="flex items-center gap-2">
                        <Bell className="h-4 w-4" /> Reminder
                      </span>
                    </SelectItem>
                    <SelectItem value="todo">
                      <span className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4" /> To-Do
                      </span>
                    </SelectItem>
                    <SelectItem value="note">
                      <span className="flex items-center gap-2">
                        <StickyNote className="h-4 w-4" /> Note
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Time (optional)</label>
                <Input
                  type="time"
                  value={newEvent.event_time}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, event_time: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  placeholder="Add details..."
                  value={newEvent.description}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, description: e.target.value })
                  }
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleAddEvent}>Add Event</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calendar */}
          <div className="lg:col-span-1">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              className="rounded-md border p-3 pointer-events-auto"
              modifiers={{
                hasItems: datesWithItems,
              }}
              modifiersStyles={{
                hasItems: {
                  fontWeight: "bold",
                  textDecoration: "underline",
                  textDecorationColor: "hsl(var(--primary))",
                },
              }}
            />
          </div>

          {/* Selected Day Details */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h3 className="font-display text-lg font-semibold mb-4">
                {format(selectedDate, "EEEE, MMMM d, yyyy")}
              </h3>

              {/* Orders for the day */}
              {selectedDateOrders.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                    <Cake className="h-4 w-4" />
                    Orders ({selectedDateOrders.length})
                  </h4>
                  <div className="space-y-2">
                    {selectedDateOrders.map((order) => (
                      <div
                        key={order.id}
                        className="flex items-center justify-between p-3 bg-accent/30 rounded-lg border border-accent"
                      >
                        <div>
                          <p className="font-medium">{order.customer_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {order.cake_type}
                          </p>
                        </div>
                        <Badge className={cn("capitalize", getStatusColor(order.status))}>
                          {order.status.replace("_", " ")}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Events for the day */}
              {selectedDateEvents.length > 0 ? (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                    <CalendarDays className="h-4 w-4" />
                    Events & Reminders ({selectedDateEvents.length})
                  </h4>
                  <div className="space-y-2">
                    {selectedDateEvents.map((event) => (
                      <div
                        key={event.id}
                        className={cn(
                          "flex items-start justify-between p-3 rounded-lg border transition-colors",
                          event.is_completed
                            ? "bg-muted/30 border-muted"
                            : "bg-card border-border hover:border-primary/30"
                        )}
                      >
                        <div className="flex items-start gap-3">
                          {event.event_type === "todo" && (
                            <Checkbox
                              checked={event.is_completed}
                              onCheckedChange={() => handleToggleComplete(event)}
                              className="mt-1"
                            />
                          )}
                          <div>
                            <div className="flex items-center gap-2">
                              {getEventIcon(event.event_type)}
                              <p
                                className={cn(
                                  "font-medium",
                                  event.is_completed && "line-through text-muted-foreground"
                                )}
                              >
                                {event.title}
                              </p>
                            </div>
                            {event.event_time && (
                              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                <Clock className="h-3 w-3" />
                                {event.event_time}
                              </p>
                            )}
                            {event.description && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {event.description}
                              </p>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => handleDeleteEvent(event.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                selectedDateOrders.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <CalendarDays className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No events or orders for this day</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3"
                      onClick={() => setIsAddDialogOpen(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add something
                    </Button>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}