import React, { useState, useEffect } from "react";
import {
  Bell,
  Check,
  X,
  Calendar,
  Package,
  MapPin,
  User,
  IndianRupee,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { getAuthHeaders } from "@/lib/auth";

interface BookingDetails {
  booking_id: number;
  booking_status: string;
  farmer: {
    name: string;
    phone: string;
    location: string;
  };
  storage: {
    name: string;
    location: string;
  };
  booking: {
    start_time: string;
    end_time: string;
    quantity: string;
    produce: string;
    notes?: string;
    total_cost: number;
  };
}

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  details: BookingDetails;
  timestamp: string;
  read: boolean;
  actionable?: boolean;
}

interface NotificationPanelProps {
  managerId: number;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({ managerId }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchNotifications = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/notifications/manager/${managerId}`,
        {
          headers: getAuthHeaders(),
        },
      );
      if (!response.ok) {
        throw new Error(`Failed to fetch notifications: ${response.status}`);
      }
      const data = await response.json();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unread_count || 0);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      toast({
        title: "Error loading notifications",
        description: "Could not load notifications. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/notifications/manager/${managerId}/${notificationId}/read`,
        {
          method: "PUT",
          headers: getAuthHeaders(),
        },
      );

      if (response.ok) {
        // Update local state
        setNotifications((prev) =>
          prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n)),
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const confirmBooking = async (bookingId: number, notificationId: string) => {
    setActionLoading(`confirm_${bookingId}`);
    try {
      const response = await fetch(
        `http://localhost:5000/api/notifications/manager/${managerId}/booking/${bookingId}/confirm`,
        {
          method: "PUT",
          headers: getAuthHeaders(),
        },
      );

      if (response.ok) {
        toast({
          title: "Booking Confirmed",
          description: "The booking has been confirmed successfully.",
          variant: "default",
        });

        // Refresh notifications to get updated status
        await fetchNotifications();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to confirm booking");
      }
    } catch (error) {
      console.error("Error confirming booking:", error);
      toast({
        title: "Error confirming booking",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const rejectBooking = async (bookingId: number, notificationId: string) => {
    setActionLoading(`reject_${bookingId}`);
    try {
      const response = await fetch(
        `http://localhost:5000/api/notifications/manager/${managerId}/booking/${bookingId}/reject`,
        {
          method: "PUT",
          headers: getAuthHeaders(),
          body: JSON.stringify({
            reason: "Rejected by manager", // You can make this more sophisticated with a modal for reason input
          }),
        },
      );

      if (response.ok) {
        toast({
          title: "Booking Rejected",
          description: "The booking has been rejected.",
          variant: "default",
        });

        // Refresh notifications to get updated status
        await fetchNotifications();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to reject booking");
      }
    } catch (error) {
      console.error("Error rejecting booking:", error);
      toast({
        title: "Error rejecting booking",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [managerId]);

  const displayedNotifications = showAll
    ? notifications
    : notifications.slice(0, 5);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500">
            Loading notifications...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notifications
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fetchNotifications()}
            className="text-blue-600 hover:text-blue-800"
          >
            Refresh
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {notifications.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <Bell className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            No notifications yet
          </div>
        ) : (
          <div className="space-y-4">
            {displayedNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`border rounded-lg p-4 ${
                  notification.read
                    ? "bg-gray-50"
                    : "bg-blue-50 border-blue-200"
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                      {notification.title}
                      {!notification.read && (
                        <Badge variant="secondary" className="text-xs">
                          New
                        </Badge>
                      )}
                      {/* Booking Status Badge */}
                      <Badge
                        variant={
                          notification.details.booking_status === "pending"
                            ? "outline"
                            : notification.details.booking_status ===
                                "confirmed"
                              ? "default"
                              : "destructive"
                        }
                        className="text-xs"
                      >
                        {notification.details.booking_status === "pending"
                          ? "Pending Approval"
                          : notification.details.booking_status === "confirmed"
                            ? "Confirmed"
                            : notification.details.booking_status ===
                                "cancelled"
                              ? "Rejected"
                              : notification.details.booking_status}
                      </Badge>
                    </h4>
                    <p className="text-sm text-gray-600">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {formatDate(notification.timestamp)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {!notification.read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => markAsRead(notification.id)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Booking Details */}
                <div className="bg-white rounded-md p-3 space-y-2 text-sm">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Farmer Info */}
                    <div>
                      <h5 className="font-medium text-gray-700 mb-2 flex items-center gap-1">
                        <User className="w-4 h-4" />
                        Farmer Details
                      </h5>
                      <div className="space-y-1 text-sm">
                        <p>
                          <strong>Name:</strong>{" "}
                          {notification.details.farmer.name}
                        </p>
                        <p>
                          <strong>Phone:</strong>{" "}
                          {notification.details.farmer.phone}
                        </p>
                        <p className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {notification.details.farmer.location}
                        </p>
                      </div>
                    </div>

                    {/* Booking Info */}
                    <div>
                      <h5 className="font-medium text-gray-700 mb-2 flex items-center gap-1">
                        <Package className="w-4 h-4" />
                        Booking Details
                      </h5>
                      <div className="space-y-1 text-sm">
                        <p>
                          <strong>Produce:</strong>{" "}
                          {notification.details.booking.produce}
                        </p>
                        <p>
                          <strong>Quantity:</strong>{" "}
                          {notification.details.booking.quantity}
                        </p>
                        <p className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(
                            notification.details.booking.start_time,
                          )}{" "}
                          - {formatDate(notification.details.booking.end_time)}
                        </p>
                        <p className="flex items-center gap-1 font-semibold text-green-600">
                          <IndianRupee className="w-3 h-3" />
                          {formatCurrency(
                            notification.details.booking.total_cost,
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  {notification.details.booking.notes && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-sm">
                        <strong>Notes:</strong>{" "}
                        {notification.details.booking.notes}
                      </p>
                    </div>
                  )}

                  {/* Action Buttons for Pending Bookings */}
                  {notification.actionable &&
                    notification.details.booking_status === "pending" && (
                      <div className="mt-4 pt-3 border-t flex gap-3">
                        <Button
                          onClick={() =>
                            confirmBooking(
                              notification.details.booking_id,
                              notification.id,
                            )
                          }
                          disabled={
                            actionLoading ===
                            `confirm_${notification.details.booking_id}`
                          }
                          className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                          size="sm"
                        >
                          {actionLoading ===
                          `confirm_${notification.details.booking_id}` ? (
                            "Confirming..."
                          ) : (
                            <>
                              <CheckCircle className="w-4 h-4" />
                              Confirm Booking
                            </>
                          )}
                        </Button>
                        <Button
                          onClick={() =>
                            rejectBooking(
                              notification.details.booking_id,
                              notification.id,
                            )
                          }
                          disabled={
                            actionLoading ===
                            `reject_${notification.details.booking_id}`
                          }
                          variant="destructive"
                          className="flex items-center gap-2"
                          size="sm"
                        >
                          {actionLoading ===
                          `reject_${notification.details.booking_id}` ? (
                            "Rejecting..."
                          ) : (
                            <>
                              <XCircle className="w-4 h-4" />
                              Reject Booking
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                </div>
              </div>
            ))}

            {notifications.length > 5 && (
              <div className="text-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAll(!showAll)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  {showAll ? "Show Less" : `Show All (${notifications.length})`}
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NotificationPanel;
