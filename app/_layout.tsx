// app/_layout.tsx
import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { ensureMigrations } from "./_lib/migrations"; // ajuste o caminho

export default function RootLayout() {
  const [ready, setReady] = useState(false);
  const [err, setErr] = useState<null | string>(null);

  useEffect(() => {
    (async () => {
      try {
        await ensureMigrations();
      } catch (e: any) {
        console.error("Migration error:", e);
        setErr(String(e?.message ?? e));
      } finally {
        setReady(true);
      }
    })();
  }, []);

  if (!ready) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
        {err && <Text style={{ marginTop: 8, color: "crimson" }}>{err}</Text>}
      </View>
    );
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
