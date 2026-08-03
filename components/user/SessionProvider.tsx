"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type SessionUser = {
  id: string;
  email?: string;
  username: string;
  name: string;
  avatar: string | null;
  bio?: string | null;
  city?: string | null;
  role: string;
};

type Ctx = {
  user: SessionUser | null;
  unread: number;
  refresh: () => Promise<void>;
  setUnread: (n: number) => void;
  logout: () => Promise<void>;
};

const SessionContext = createContext<Ctx>({
  user: null,
  unread: 0,
  refresh: async () => {},
  setUnread: () => {},
  logout: async () => {},
});

export const useSession = () => useContext(SessionContext);

export default function SessionProvider({
  initialUser,
  initialUnread = 0,
  children,
}: {
  initialUser: SessionUser | null;
  initialUnread?: number;
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<SessionUser | null>(initialUser);
  const [unread, setUnread] = useState(initialUnread);

  // Sunucudan gelen oturum, gezinme sonrası tazelenir
  useEffect(() => {
    setUser(initialUser);
    setUnread(initialUnread);
  }, [initialUser, initialUnread]);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/account/me");
      const data = await res.json();
      setUser(data.user ?? null);
      setUnread(data.stats?.unread ?? 0);
    } catch {
      /* sessizce geç */
    }
  }, []);

  const logout = useCallback(async () => {
    await fetch("/api/account/logout", { method: "POST" }).catch(() => {});
    setUser(null);
    setUnread(0);
  }, []);

  const value = useMemo(
    () => ({ user, unread, refresh, setUnread, logout }),
    [user, unread, refresh, logout]
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}
