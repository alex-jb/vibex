"use client";

/**
 * Web Push Notification helpers.
 *
 * Flow:
 * 1. User clicks "Enable notifications"
 * 2. We request permission via Notification.requestPermission()
 * 3. We subscribe to push via service worker's pushManager
 * 4. The subscription is sent to /api/push/subscribe for server storage
 * 5. Server can later send push via web-push library
 *
 * For now we implement the client side. Server-side push sending
 * requires a VAPID key pair configured in env vars.
 */

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";

/**
 * Check if push notifications are supported and permission state.
 */
export function getPushState(): "unsupported" | "denied" | "granted" | "default" {
  if (typeof window === "undefined") return "unsupported";
  if (!("Notification" in window)) return "unsupported";
  if (!("serviceWorker" in navigator)) return "unsupported";
  return Notification.permission;
}

/**
 * Request notification permission and subscribe to push.
 * Returns the PushSubscription or null on failure.
 */
export async function subscribeToPush(): Promise<PushSubscription | null> {
  if (getPushState() === "unsupported") return null;

  const permission = await Notification.requestPermission();
  if (permission !== "granted") return null;

  try {
    const registration = await navigator.serviceWorker.ready;

    // Check for existing subscription
    let subscription = await registration.pushManager.getSubscription();
    if (subscription) return subscription;

    // No VAPID key = skip server push, just use local notifications
    if (!VAPID_PUBLIC_KEY) return null;

    // Subscribe with VAPID
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY).buffer as ArrayBuffer,
    });

    // Send subscription to server
    await fetch("/api/push/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(subscription.toJSON()),
    });

    return subscription;
  } catch {
    return null;
  }
}

/**
 * Send a local notification (no server push needed).
 * Used as fallback when VAPID is not configured.
 */
export function showLocalNotification(title: string, body?: string, url?: string) {
  if (getPushState() !== "granted") return;

  navigator.serviceWorker.ready.then((reg) => {
    reg.showNotification(title, {
      body,
      icon: "/icon.svg",
      badge: "/icon.svg",
      data: { url },
      tag: `vibex-${Date.now()}`,
    });
  });
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
