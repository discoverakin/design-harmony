import { useCallback } from "react";
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout as StripeEmbeddedCheckout,
} from "@stripe/react-stripe-js";
import { X } from "lucide-react";
import { stripePromise } from "@/lib/stripe";

interface EmbeddedCheckoutProps {
  clientSecret: string;
  onClose: () => void;
}

const EmbeddedCheckout = ({ clientSecret, onClose }: EmbeddedCheckoutProps) => {
  const fetchClientSecret = useCallback(() => clientSecret, [clientSecret]);

  if (!stripePromise) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-card rounded-2xl p-6 max-w-lg w-full mx-4">
          <p className="text-sm text-destructive">Stripe is not configured.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-card rounded-2xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">Complete Payment</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-accent transition-colors"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
        <div className="p-4">
          <EmbeddedCheckoutProvider
            stripe={stripePromise}
            options={{ fetchClientSecret }}
          >
            <StripeEmbeddedCheckout />
          </EmbeddedCheckoutProvider>
        </div>
      </div>
    </div>
  );
};

export default EmbeddedCheckout;
