import { createContext, useContext, useCallback, useState } from 'react';

const EnrollmentsContext = createContext(null);

export const EnrollmentsProvider = ({ children }) => {
  const [listeners, setListeners] = useState([]);

  // Registrar un listener para actualizaciones
  const registerListener = useCallback((listener) => {
    setListeners(prev => [...prev, listener]);
    
    // Retornar función para desregistrar
    return () => {
      setListeners(prev => prev.filter(l => l !== listener));
    };
  }, []);

  // Notificar que se creó una nueva inscripción
  const notifyNewInscription = useCallback((inscription) => {
    console.log("📢 [EnrollmentsContext] Notificando nueva inscripción:", inscription);
    listeners.forEach(listener => {
      if (listener.onNewInscription) {
        listener.onNewInscription(inscription);
      }
    });
  }, [listeners]);

  // Notificar que se actualizó el email de una inscripción
  const notifyEmailUpdate = useCallback((identification, newEmail) => {
    console.log("📢 [EnrollmentsContext] Notificando actualización de email:", { identification, newEmail });
    listeners.forEach(listener => {
      if (listener.onEmailUpdate) {
        listener.onEmailUpdate(identification, newEmail);
      }
    });
  }, [listeners]);

  return (
    <EnrollmentsContext.Provider value={{ 
      registerListener, 
      notifyNewInscription,
      notifyEmailUpdate 
    }}>
      {children}
    </EnrollmentsContext.Provider>
  );
};

export const useEnrollmentsContext = () => {
  const context = useContext(EnrollmentsContext);
  if (!context) {
    // Si no hay contexto, retornar funciones vacías (para que no rompa si no está envuelto)
    return {
      registerListener: () => () => {},
      notifyNewInscription: () => {},
      notifyEmailUpdate: () => {},
    };
  }
  return context;
};
