import React, { useEffect, useMemo, useRef } from "react";

function classNames(...values) {
  return values.filter(Boolean).join(" ");
}

function formatDistance(meters) {
  if (!Number.isFinite(meters)) return "-";
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(2)} km`;
}

function useAttention({ active, enableSound, enableVibration }) {
  const playedRef = useRef(false);

  useEffect(() => {
    if (!active) {
      playedRef.current = false;
      return;
    }

    // Try vibration first (mobile)
    if (enableVibration && typeof navigator !== "undefined" && navigator.vibrate) {
      try {
        navigator.vibrate([200, 100, 200]);
      } catch {}
    }

    // Use WebAudio to play a short tone (no asset needed)
    if (enableSound && !playedRef.current && typeof window !== "undefined") {
      try {
        const AudioContextRef = window.AudioContext || window.webkitAudioContext;
        if (AudioContextRef) {
          const ctx = new AudioContextRef();
          const duration = 0.35; // seconds
          const oscillator = ctx.createOscillator();
          const gain = ctx.createGain();
          oscillator.type = "sine";
          oscillator.frequency.value = 880; // A5
          gain.gain.setValueAtTime(0.0001, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.05);
          gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
          oscillator.connect(gain);
          gain.connect(ctx.destination);
          oscillator.start();
          oscillator.stop(ctx.currentTime + duration);
          oscillator.onended = () => ctx.close();
          playedRef.current = true;
        }
      } catch {}
    }
  }, [active, enableSound, enableVibration]);
}

export default function AlertNotification({
  visible,
  onClose,
  onAcknowledge,
  spot,
  distanceMeters,
  urgent = false,
  enableSound = true,
  enableVibration = true,
}) {
  const severity = spot?.severity ?? "low";
  const title = spot?.title || spot?.locationText || "Nearby blackspot";
  const locationText = spot?.locationText || "";

  useAttention({ active: visible && urgent, enableSound, enableVibration });

  const severityStyles = useMemo(() => {
    switch (severity) {
      case "high":
        return {
          badge: "bg-red-100 text-red-700",
          ring: "ring-red-500/30",
          icon: "text-red-600",
          gradient: "from-red-500/10",
        };
      case "medium":
        return {
          badge: "bg-amber-100 text-amber-700",
          ring: "ring-amber-500/30",
          icon: "text-amber-600",
          gradient: "from-amber-500/10",
        };
      default:
        return {
          badge: "bg-emerald-100 text-emerald-700",
          ring: "ring-emerald-500/30",
          icon: "text-emerald-600",
          gradient: "from-emerald-500/10",
        };
    }
  }, [severity]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-auto w-[min(92vw,480px)] transition-all duration-300 ease-out transform">
        <div className={classNames(
          "relative overflow-hidden rounded-xl border bg-white shadow-xl ring-2",
          severityStyles.ring
        )}>
          <div className={classNames(
            "absolute inset-0 bg-gradient-to-r",
            severityStyles.gradient,
            urgent ? "animate-pulse" : ""
          )} />

          <div className="relative p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <div className={classNames("mt-0.5", severityStyles.icon)}>
                <span aria-hidden>⚠️</span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-stone-900 truncate">{title}</h3>
                  <span className={classNames("px-2 py-0.5 rounded text-xs font-medium capitalize", severityStyles.badge)}>
                    {severity}
                  </span>
                </div>
                {locationText ? (
                  <div className="text-xs text-stone-600 mt-0.5 truncate">{locationText}</div>
                ) : null}

                <div className="mt-2 text-sm text-stone-800">
                  Distance: <span className="font-medium">{formatDistance(distanceMeters)}</span>
                </div>

                {urgent ? (
                  <div className="mt-1 text-xs text-red-700">Approaching blackspot. Exercise caution.</div>
                ) : null}
              </div>

              <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                <button
                  type="button"
                  onClick={onAcknowledge}
                  className="rounded-md px-3 py-1.5 text-sm bg-stone-900 text-white hover:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  Acknowledge
                </button>
                <button
                  type="button"
                  aria-label="Dismiss alert"
                  onClick={onClose}
                  className="rounded-md px-3 py-1.5 text-sm bg-stone-100 text-stone-800 hover:bg-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


