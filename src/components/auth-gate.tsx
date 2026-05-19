"use client";

import { useState, useSyncExternalStore, type FormEvent, type ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { verifyPassword } from "@/lib/auth";

const STORAGE_KEY = "curriculum-unlocked";

const listeners = new Set<() => void>();

function subscribe(callback: () => void): () => void {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

function readUnlocked(): boolean {
  return localStorage.getItem(STORAGE_KEY) === "true";
}

function serverUnlocked(): boolean {
  return false;
}

function unlock() {
  localStorage.setItem(STORAGE_KEY, "true");
  listeners.forEach((listener) => listener());
}

export function AuthGate({ children }: { children: ReactNode }) {
  const unlocked = useSyncExternalStore(subscribe, readUnlocked, serverUnlocked);
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);
  const [checking, setChecking] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setChecking(true);
    const ok = await verifyPassword(value);
    setChecking(false);
    if (ok) {
      unlock();
    } else {
      setError(true);
      setValue("");
    }
  }

  if (unlocked) return <>{children}</>;

  return (
    <div className="flex min-h-screen w-full items-center justify-center px-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Curriculum</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <Input
              type="password"
              value={value}
              autoFocus
              placeholder="Password"
              aria-label="Password"
              onChange={(event) => {
                setValue(event.target.value);
                setError(false);
              }}
            />
            {error ? (
              <p className="text-[13px] text-destructive">Incorrect password</p>
            ) : null}
            <Button
              type="submit"
              className="min-h-[44px]"
              disabled={checking || value.length === 0}
            >
              {checking ? "Checking" : "Unlock"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
