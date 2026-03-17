import { createContext, useContext, useCallback, useEffect, useRef, useState } from "react";

const EnrollmentsContext = createContext(null);

export const EnrollmentsProvider = ({ children }) => {
  const [listeners, setListeners] = useState([]);
  const channelRef = useRef(null);
  const tabIdRef = useRef(
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random()}`
  );
  const storageKey = "enrollments:event";

  // Register a listener for updates
  const registerListener = useCallback((listener) => {
    setListeners((prev) => [...prev, listener]);

    // Return unregister function
    return () => {
      setListeners((prev) => prev.filter((l) => l !== listener));
    };
  }, []);

  const broadcast = (payload) => {
    if (channelRef.current) {
      channelRef.current.postMessage(payload);
      return;
    }
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(storageKey, JSON.stringify({ ...payload, ts: Date.now() }));
    }
  };

  // Notify new inscription
  const notifyNewInscription = useCallback(
    (inscription) => {
      listeners.forEach((listener) => {
        if (listener.onNewInscription) {
          listener.onNewInscription(inscription);
        }
      });
      broadcast({ type: "new-inscription", inscription, originId: tabIdRef.current });
    },
    [listeners]
  );

  // Notify email update
  const notifyEmailUpdate = useCallback(
    (identification, newEmail) => {
      listeners.forEach((listener) => {
        if (listener.onEmailUpdate) {
          listener.onEmailUpdate(identification, newEmail);
        }
      });
      broadcast({ type: "email-update", identification, newEmail, originId: tabIdRef.current });
    },
    [listeners]
  );

  useEffect(() => {
    const handleMessage = (data) => {
      if (!data || data.originId === tabIdRef.current) return;
      if (data.type === "new-inscription") {
        listeners.forEach((listener) => {
          if (listener.onNewInscription) {
            listener.onNewInscription(data.inscription);
          }
        });
      }
      if (data.type === "email-update") {
        listeners.forEach((listener) => {
          if (listener.onEmailUpdate) {
            listener.onEmailUpdate(data.identification, data.newEmail);
          }
        });
      }
    };

    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      const channel = new BroadcastChannel("enrollments");
      channelRef.current = channel;
      channel.onmessage = (event) => handleMessage(event.data);
      return () => {
        channel.close();
        channelRef.current = null;
      };
    }

    const onStorage = (event) => {
      if (event.key !== storageKey || !event.newValue) return;
      try {
        const data = JSON.parse(event.newValue);
        handleMessage(data);
      } catch (_) {
        // ignore
      }
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [listeners]);

  return (
    <EnrollmentsContext.Provider
      value={{
        registerListener,
        notifyNewInscription,
        notifyEmailUpdate,
      }}
    >
      {children}
    </EnrollmentsContext.Provider>
  );
};

export const useEnrollmentsContext = () => {
  const context = useContext(EnrollmentsContext);
  if (!context) {
    // Return no-op functions if not wrapped
    return {
      registerListener: () => () => {},
      notifyNewInscription: () => {},
      notifyEmailUpdate: () => {},
    };
  }
  return context;
};

