import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, type AuthSession, type AuthUser } from "@/lib/auth";

export function useAuth() {
  const initial = auth.peek();
  const [session, setSession] = useState<AuthSession | null>(initial.session);
  const [loading, setLoading] = useState(!initial.loaded);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.subscribe((s) => {
      setSession(s);
      setLoading(false);
    });
    auth.getSession().then((s) => {
      setSession(s);
      setLoading(false);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await auth.signOut();
    navigate("/");
  };

  const user: AuthUser | null = session?.user ?? null;
  return { user, session, loading, signOut };
}
