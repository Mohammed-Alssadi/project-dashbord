import { useState, useEffect } from 'react';
import { storeProfileApi } from '../services/storeProfileApi';
import type { StoreProfile } from '../types/storeProfile.types';
import { toast } from 'sonner';

export const useStoreProfile = () => {
  const [profile, setProfile] = useState<StoreProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async (force: boolean = false) => {
    try {
      setLoading(true);
      setError(null);
      const response = await storeProfileApi.getStoreProfile(force);
      if (response.success) {
        setProfile(response.data);
      } else {
        setError('فشل في جلب بيانات المتجر');
        toast.error('فشل في جلب بيانات المتجر');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'حدث خطأ أثناء الاتصال بالخادم');
      toast.error(err.response?.data?.message || 'حدث خطأ أثناء الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return { profile, loading, error, refetch: fetchProfile };
};
