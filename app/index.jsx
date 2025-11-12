// app/index.tsx
import { Redirect } from "expo-router";

export default function Index() {
  // Abre direto na aba Cadastros
  return <Redirect href="/home" />;
}
