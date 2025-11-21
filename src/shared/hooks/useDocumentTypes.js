import { useState, useEffect } from 'react';
import ApiClient from '../services/apiClient'; 

export const useDocumentTypes = () => {
  const [documentTypes, setDocumentTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDocumentTypes = async () => {
      try {
        setLoading(true);
        const response = await ApiClient.get('/document-types'); // Usa el endpoint relativo

        if (response.success) {
          setDocumentTypes(response.data);
        } else {
          throw new Error(response.message || 'Error del servidor');
        }
      } catch (err) {
        setError(err.message);
        console.error('Error fetching document types:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDocumentTypes();
  }, []);

  return { documentTypes, loading, error };
};