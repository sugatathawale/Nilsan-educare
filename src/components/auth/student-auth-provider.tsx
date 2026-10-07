"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";
import type { AppUser } from "@/lib/auth-types";
import {
  fetchStudentSession,
  loginStudent,
  logoutStudent,
  signupStudent
} from "@/lib/student-auth";
import type { StudentSignupInput } from "@/lib/auth-types";

type StudentAuthContextValue = {
  user: AppUser | null;
  loading: boolean;
  refresh: () => Promise<void>;
  login: (email: string, password: string) => Promise<AppUser>;
  signup: (input: StudentSignupInput) => Promise<AppUser>;
  logout: () => Promise<void>;
};

const StudentAuthContext = createContext<StudentAuthContextValue | null>(null);

export function StudentAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const session = await fetchStudentSession();
    setUser(session);
  }, []);

  useEffect(() => {
    let active = true;

    async function boot() {
      const session = await fetchStudentSession();
      if (!active) return;
      setUser(session);
      setLoading(false);
    }

    void boot();
    return () => {
      active = false;
    };
  }, []);

  const value = useMemo<StudentAuthContextValue>(
    () => ({
      user,
      loading,
      refresh,
      login: async (email, password) => {
        const next = await loginStudent(email, password);
        setUser(next);
        return next;
      },
      signup: async (input) => {
        const next = await signupStudent(input);
        setUser(next);
        return next;
      },
      logout: async () => {
        await logoutStudent();
        setUser(null);
      }
    }),
    [user, loading, refresh]
  );

  return (
    <StudentAuthContext.Provider value={value}>
      {children}
    </StudentAuthContext.Provider>
  );
}

export function useStudentAuth() {
  const ctx = useContext(StudentAuthContext);
  if (!ctx) {
    throw new Error("useStudentAuth must be used within StudentAuthProvider");
  }
  return ctx;
}
