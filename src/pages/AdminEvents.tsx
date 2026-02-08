import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  X,
  Clock,
  ExternalLink,
  Calendar,
  MapPin,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEvents } from "@/hooks/use-events";
import { useToast } from "@/hooks/use-toast";
import type { CommunityEvent } from "@/data/events";
import { formatPrice } from "@/lib/format-price";

const AdminEventCard = ({
  event,
  onApprove,
  onReject,
  onDelete,
}: {
  event: CommunityEvent;
  onApprove?: () => void;
  onReject?: () => void;
  onDelete?: () => void;
}) => {
  const dateObj = new Date(event.date + "T00:00:00");
  const formattedDate = dateObj.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="p-4 rounded-xl border-2 border-border bg-card space-y-3">
      {/* Flyer preview */}
      {event.flyer_url && (
        <div className="rounded-lg overflow-hidden border border-border">
          <img
            src={event.flyer_url}
            alt="Event flyer"
            className="w-full aspect-video object-cover"
          />
        </div>
      )}

      {/* Header */}
      <div className="flex items-start gap-3">
        <span className="text-2xl">{event.emoji}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">{event.title}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            by {event.created_by_name}
          </p>
          {event.price_cents > 0 && (
            <p className="text-[11px] font-semibold text-primary mt-0.5">
              {formatPrice(event.price_cents)}
            </p>
          )}
        </div>
        <Badge
          variant={
            event.status === "pending"
              ? "secondary"
              : event.status === "approved"
              ? "default"
              : "destructive"
          }
          className="text-[10px] flex-shrink-0"
        >
          {event.status}
        </Badge>
      </div>

      {/* Meta */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-0.5">
          <Calendar className="w-3 h-3" />
          {formattedDate}
        </span>
        <span className="flex items-center gap-0.5">
          <Clock className="w-3 h-3" />
          {event.time}
        </span>
        <span className="flex items-center gap-0.5">
          <MapPin className="w-3 h-3" />
          {event.location}
        </span>
      </div>

      {/* Description preview */}
      {event.description && (
        <p className="text-xs text-muted-foreground line-clamp-2">
          {event.description}
        </p>
      )}

      {/* External link */}
      {event.external_link && (
        <a
          href={event.external_link}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs text-primary hover:underline"
        >
          <ExternalLink className="w-3 h-3" />
          View source link
        </a>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 pt-1">
        {event.status === "pending" && (
          <>
            <Button
              size="sm"
              className="flex-1 rounded-lg gap-1 h-9 text-xs"
              onClick={onApprove}
            >
              <Check className="w-3.5 h-3.5" />
              Approve
            </Button>
            <Button
              size="sm"
              variant="destructive"
              className="flex-1 rounded-lg gap-1 h-9 text-xs"
              onClick={onReject}
            >
              <X className="w-3.5 h-3.5" />
              Reject
            </Button>
          </>
        )}
        {event.status !== "pending" && onDelete && (
          <Button
            size="sm"
            variant="outline"
            className="rounded-lg gap-1 h-9 text-xs"
            onClick={onDelete}
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </Button>
        )}
      </div>
    </div>
  );
};

const AdminEvents = () => {
  const navigate = useNavigate();
  const {
    pendingEvents,
    approvedEvents,
    rejectedEvents,
    updateEventStatus,
    deleteEvent,
    loading,
  } = useEvents();
  const { toast } = useToast();

  const handleApprove = (id: string, title: string) => {
    updateEventStatus(id, "approved");
    toast({ title: "Event approved ✅", description: `"${title}" is now live.` });
  };

  const handleReject = (id: string, title: string) => {
    updateEventStatus(id, "rejected");
    toast({ title: "Event rejected", description: `"${title}" has been rejected.` });
  };

  const handleDelete = (id: string, title: string) => {
    deleteEvent(id);
    toast({ title: "Event deleted", description: `"${title}" has been removed.` });
  };

  return (
    <div className="flex flex-col min-h-screen bg-background max-w-lg mx-auto shadow-xl">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 py-4 bg-secondary">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 rounded-lg hover:bg-accent transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h2 className="text-sm font-semibold text-foreground flex-1">
          Admin · Event Review
        </h2>
      </header>

      <main className="flex-1 overflow-y-auto">
        <div className="bg-card rounded-t-3xl -mt-1 shadow-lg mt-3">
          <Tabs defaultValue="pending" className="px-5 pt-5">
            <TabsList className="w-full bg-secondary/60 rounded-xl h-11">
              <TabsTrigger
                value="pending"
                className="flex-1 rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm text-xs font-semibold"
              >
                <Clock className="w-3.5 h-3.5 mr-1.5" />
                Pending ({pendingEvents.length})
              </TabsTrigger>
              <TabsTrigger
                value="approved"
                className="flex-1 rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm text-xs font-semibold"
              >
                <Check className="w-3.5 h-3.5 mr-1.5" />
                Live ({approvedEvents.length})
              </TabsTrigger>
              <TabsTrigger
                value="rejected"
                className="flex-1 rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm text-xs font-semibold"
              >
                <X className="w-3.5 h-3.5 mr-1.5" />
                Rejected ({rejectedEvents.length})
              </TabsTrigger>
            </TabsList>

            {/* Pending */}
            <TabsContent value="pending" className="mt-4 space-y-3 pb-6">
              {loading ? (
                <div className="flex justify-center py-10">
                  <span className="w-6 h-6 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
                </div>
              ) : pendingEvents.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-3xl mb-2">✅</p>
                  <p className="text-sm text-muted-foreground">
                    No events awaiting review.
                  </p>
                </div>
              ) : (
                pendingEvents.map((evt) => (
                  <AdminEventCard
                    key={evt.id}
                    event={evt}
                    onApprove={() => handleApprove(evt.id, evt.title)}
                    onReject={() => handleReject(evt.id, evt.title)}
                  />
                ))
              )}
            </TabsContent>

            {/* Approved */}
            <TabsContent value="approved" className="mt-4 space-y-3 pb-6">
              {approvedEvents.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-3xl mb-2">📅</p>
                  <p className="text-sm text-muted-foreground">
                    No live events.
                  </p>
                </div>
              ) : (
                approvedEvents.map((evt) => (
                  <AdminEventCard
                    key={evt.id}
                    event={evt}
                    onDelete={() => handleDelete(evt.id, evt.title)}
                  />
                ))
              )}
            </TabsContent>

            {/* Rejected */}
            <TabsContent value="rejected" className="mt-4 space-y-3 pb-6">
              {rejectedEvents.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-3xl mb-2">🗑️</p>
                  <p className="text-sm text-muted-foreground">
                    No rejected events.
                  </p>
                </div>
              ) : (
                rejectedEvents.map((evt) => (
                  <AdminEventCard
                    key={evt.id}
                    event={evt}
                    onDelete={() => handleDelete(evt.id, evt.title)}
                  />
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default AdminEvents;
