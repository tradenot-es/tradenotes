import { useState, useEffect } from "react";
import { db } from "@/lib/api";
import { useAuth } from "./useAuth";

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<{ nickname: string | null } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadProfile();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      const { data, error } = await db
        .from('profiles')
        .select('nickname')
        .eq('id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      setProfile({ nickname: data?.nickname || null });
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const displayName = profile?.nickname || "Trader";

  return { profile, displayName, loading };
}
