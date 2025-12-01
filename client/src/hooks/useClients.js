import { useState, useEffect, useCallback } from 'react';
import { clientsApi } from '../services/api';

export function useClients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchClients = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await clientsApi.list();
      setClients(data.clients);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  return { clients, loading, error, refetch: fetchClients };
}

export function useClient(clientId) {
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchClient = useCallback(async () => {
    if (!clientId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await clientsApi.get(clientId);
      setClient(data.client);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    fetchClient();
  }, [fetchClient]);

  const addPlatform = async (platform) => {
    await clientsApi.addPlatform(clientId, platform);
    await fetchClient();
  };

  const removePlatform = async (platform) => {
    await clientsApi.removePlatform(clientId, platform);
    await fetchClient();
  };

  return { client, loading, error, refetch: fetchClient, addPlatform, removePlatform };
}
