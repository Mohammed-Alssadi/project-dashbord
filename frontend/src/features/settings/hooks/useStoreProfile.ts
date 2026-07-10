import { useEffect } from 'react';
import { useStoreProfileStore } from '../store/storeProfileStore';

export const useStoreProfile = () => {
  const profile = useStoreProfileStore(s => s.profile);
  const loading = useStoreProfileStore(s => s.loading);
  const error = useStoreProfileStore(s => s.error);
  const fetchProfile = useStoreProfileStore(s => s.fetchProfile);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return { profile, loading, error, refetch: fetchProfile };
};

