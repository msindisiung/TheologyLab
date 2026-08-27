"use client";

import { useState } from "react";
import { getSupabase } from "../lib/supabase";

export default function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function signIn() {
    setMessage("Signing in...");

    const supabase = getSupabase();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage("Sign in failed: " + error.message);
      return;
    }

    setMessage("Signed in successfully!");
  }

  return (
    <main
      style={{
        maxWidth: 500,
        margin: "80px auto",
        padding: 30,
        fontFamily: "system-ui",
      }}
    >
      <h1>TheologyLab</h1>
      <p>Sign in to your research workspace</p>

      <input
        type="email"
        placeholder="Email address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{
          width: "100%",
          padding: 12,
          marginTop: 20,
          boxSizing: "border-box",
        }}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{
          width: "100%",
          padding: 12,
          marginTop: 12,
          boxSizing: "border-box",
        }}
      />

      <button
        onClick={signIn}
        style={{
          width: "100%",
          padding: 12,
          marginTop: 16,
          cursor: "pointer",
        }}
      >
        Sign in
      </button>

      {message && <p style={{ marginTop: 20 }}>{message}</p>}
    </main>
  );
}
