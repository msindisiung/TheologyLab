"use client";

import { useEffect, useState } from "react";
import { getSupabase } from "../lib/supabase";

export default function Home() {
  const [status, setStatus] = useState("Checking Supabase connection...");

  useEffect(() => {
    try {
      const supabase = getSupabase();

      supabase.auth.getUser().then(({ error }) => {
        if (error) {
          setStatus("Supabase connected, but no user is signed in.");
        } else {
          setStatus("Supabase connection successful.");
        }
      });
    } catch (error) {
      setStatus(
        error instanceof Error
          ? `Supabase error: ${error.message}`
          : "Unknown Supabase error."
      );
    }
  }, []);

  return (
    <main style={{ padding: 40, fontFamily: "system-ui" }}>
      <h1>TheologyLab</h1>
      <p>{status}</p>
    </main>
  );
}
