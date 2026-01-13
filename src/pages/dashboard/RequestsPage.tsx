import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { Search, Mail, Phone, Calendar, Cake, Users, DollarSign, MessageSquare, Image, Check, X, Clock, Trash2 } from "lucide-react";

interface RequestImage {
  id: string;
  image_url: string;
}

interface OrderRequest {
  id: string;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string;
  cake_type: string;
  event_type: string | null;
  event_date: string;
  servings: number | null;
  budget: string | null;
  request_details: string | null;
  status: string;
  created_at: string;
}

export default function RequestsPage() {
  const [requests, setRequests] = useState<OrderRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedRequest, setSelectedRequest] = useState<OrderRequest | null>(null);
  const [requestImages, setRequestImages] = useState<RequestImage[]>([]);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("order_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load order requests");
      console.error(error);
    } else {
      setRequests(data || []);
    }
    setLoading(false);
  };

  const fetchRequestImages = async (requestId: string) => {
    const { data, error } = await supabase
      .from("order_request_images")
      .select("*")
      .eq("request_id", requestId);

    if (!error && data) {
      setRequestImages(data);
    }
  };

  const openDetailDialog = async (request: OrderRequest) => {
    setSelectedRequest(request);
    await fetchRequestImages(request.id);
    setDetailDialogOpen(true);
  };

  const updateRequestStatus = async (requestId: string, newStatus: string) => {
    const { error } = await supabase
      .from("order_requests")
      .update({ status: newStatus })
      .eq("id", requestId);

    if (error) {
      toast.error("Failed to update status");
    } else {
      toast.success(`Request marked as ${newStatus}`);
      fetchRequests();
      if (selectedRequest?.id === requestId) {
        setSelectedRequest({ ...selectedRequest, status: newStatus });
      }
    }
  };

  const deleteRequest = async (requestId: string) => {
    const { error } = await supabase
      .from("order_requests")
      .delete()
      .eq("id", requestId);

    if (error) {
      toast.error("Failed to delete request");
    } else {
      toast.success("Request deleted");
      setDetailDialogOpen(false);
      fetchRequests();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "bg-blue-500";
      case "contacted":
        return "bg-yellow-500";
      case "confirmed":
        return "bg-green-500";
      case "declined":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "new":
        return <Clock className="w-3 h-3" />;
      case "contacted":
        return <Mail className="w-3 h-3" />;
      case "confirmed":
        return <Check className="w-3 h-3" />;
      case "declined":
        return <X className="w-3 h-3" />;
      default:
        return null;
    }
  };

  const filteredRequests = requests.filter((request) => {
    const matchesSearch =
      request.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.cake_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.customer_email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || request.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-display font-semibold">Order Requests</h1>
          <p className="text-muted-foreground">
            Manage incoming order requests from the website
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search by name, email, or cake type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="contacted">Contacted</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="declined">Declined</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Requests Grid */}
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading...</div>
        ) : filteredRequests.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No order requests found
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRequests.map((request) => (
              <Card
                key={request.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => openDetailDialog(request)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg font-medium">
                      {request.customer_name}
                    </CardTitle>
                    <Badge className={`${getStatusColor(request.status)} text-white flex items-center gap-1`}>
                      {getStatusIcon(request.status)}
                      {request.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Cake className="w-4 h-4" />
                    <span>{request.cake_type}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>{format(new Date(request.event_date), "MMM d, yyyy")}</span>
                  </div>
                  {request.event_type && (
                    <div className="text-sm text-muted-foreground">
                      {request.event_type}
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground pt-2">
                    Submitted {format(new Date(request.created_at), "MMM d, yyyy 'at' h:mm a")}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Detail Dialog */}
        <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-display text-xl">
                Order Request Details
              </DialogTitle>
            </DialogHeader>
            {selectedRequest && (
              <div className="space-y-6">
                {/* Status Actions */}
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant={selectedRequest.status === "new" ? "default" : "outline"}
                    onClick={() => updateRequestStatus(selectedRequest.id, "new")}
                  >
                    <Clock className="w-4 h-4 mr-1" /> New
                  </Button>
                  <Button
                    size="sm"
                    variant={selectedRequest.status === "contacted" ? "default" : "outline"}
                    onClick={() => updateRequestStatus(selectedRequest.id, "contacted")}
                  >
                    <Mail className="w-4 h-4 mr-1" /> Contacted
                  </Button>
                  <Button
                    size="sm"
                    variant={selectedRequest.status === "confirmed" ? "default" : "outline"}
                    onClick={() => updateRequestStatus(selectedRequest.id, "confirmed")}
                  >
                    <Check className="w-4 h-4 mr-1" /> Confirmed
                  </Button>
                  <Button
                    size="sm"
                    variant={selectedRequest.status === "declined" ? "default" : "outline"}
                    onClick={() => updateRequestStatus(selectedRequest.id, "declined")}
                  >
                    <X className="w-4 h-4 mr-1" /> Declined
                  </Button>
                </div>

                {/* Customer Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-muted-foreground">Customer</label>
                    <p className="font-medium">{selectedRequest.customer_name}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                      <Mail className="w-3 h-3" /> Email
                    </label>
                    <p>{selectedRequest.customer_email || "—"}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                      <Phone className="w-3 h-3" /> Phone
                    </label>
                    <p>{selectedRequest.customer_phone}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> Event Date
                    </label>
                    <p>{format(new Date(selectedRequest.event_date), "MMMM d, yyyy")}</p>
                  </div>
                </div>

                {/* Order Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                      <Cake className="w-3 h-3" /> Cake Type
                    </label>
                    <p>{selectedRequest.cake_type}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-muted-foreground">Event Type</label>
                    <p>{selectedRequest.event_type || "—"}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                      <Users className="w-3 h-3" /> Servings
                    </label>
                    <p>{selectedRequest.servings || "—"}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                      <DollarSign className="w-3 h-3" /> Budget
                    </label>
                    <p>{selectedRequest.budget || "—"}</p>
                  </div>
                </div>

                {/* Request Details */}
                {selectedRequest.request_details && (
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" /> Vision & Details
                    </label>
                    <p className="text-sm whitespace-pre-wrap bg-muted p-3 rounded-md">
                      {selectedRequest.request_details}
                    </p>
                  </div>
                )}

                {/* Vision Board Images */}
                {requestImages.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                      <Image className="w-3 h-3" /> Inspiration Images
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {requestImages.map((img) => (
                        <img
                          key={img.id}
                          src={img.image_url}
                          alt="Inspiration"
                          className="w-24 h-24 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => setPreviewImage(img.image_url)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Delete */}
                <div className="pt-4 border-t">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteRequest(selectedRequest.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-1" /> Delete Request
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Image Preview Dialog */}
        <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
          <DialogContent className="max-w-4xl p-2">
            {previewImage && (
              <img
                src={previewImage}
                alt="Full size"
                className="w-full h-auto rounded-lg"
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
