// app/(tabs)/cadastros.tsx
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View
} from "react-native";
import {
  criarCategoria,
  listarCategorias,
  removerCategoria,
  type Categoria,
} from "../_services/categorias";

export default function CadastrosScreen() {
  const [itens, setItens] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [descricao, setDescricao] = useState("");
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null);

  async function carregar() {
    try {
      setLoading(true);
      const dados = await listarCategorias();
      setItens(dados);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  async function onRefresh() {
    setRefreshing(true);
    await carregar();
    setRefreshing(false);
  }

  async function excluir(id: number) {
    await removerCategoria(id);
    await carregar();
  }

  function abrirModal() {
    setErro(null);
    setDescricao("");
    setShowModal(true);
  }

  async function salvarCategoria() {
    const nome = descricao.trim();
    if (!nome) {
      setErro("Informe a descrição");
      return;
    }
    try {
      setSalvando(true);
      await criarCategoria(nome);
      setShowModal(false);
      await carregar();
    } catch (e: any) {
      const msg = String(e?.message ?? e);
      if (msg.toLocaleUpperCase().includes("unique")) {
        setErro("já existe uma categoria com esse nome");
      } else {
        setErro("Ocorreu um erro ao salvar os dados. Tente novamente");
      }
      

    } finally {
      setSalvando(false);
    }

  }
  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
        <Text style={{ marginTop: 8, opacity: 0.6 }}>Carregando categorias…</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 16, marginTop: 40 }}>
      <Text style={{ fontSize: 18, fontWeight: "700", marginBottom: 12 }}>
        Categorias
      </Text>

      <FlatList
        data={itens}
        keyExtractor={(item) => String(item.id)}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        ListEmptyComponent={
          <Text style={{ opacity: 0.6 }}>Nenhuma categoria cadastrada.</Text>
        }
        renderItem={({ item }) => (
          <View
            style={
              styles.card
            }
          >
            <Text style={{ fontSize: 16 }}>{item.descricao}</Text>

            <Pressable onPress={() =>
              Alert.alert("Excluir",
                `Excluir "${item.descricao}"`,
                [
                  { text: "Cancelar", style: "cancel" },
                  { text: "Excluir", style: "destructive", onPress: () => excluir(item.id) }
                ])}>
              <Text style={{ color: "crimson", fontWeight: "600" }}>Excluir</Text>
            </Pressable>
          </View>
        )}
      />

      <Pressable style={styles.fab} onPress={abrirModal}>
        <Ionicons name="add" size={28} color="#fff"></Ionicons>
      </Pressable>
      <Modal visible={showModal} transparent animationType="slide" onRequestClose={() => setShowModal(false)}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalBackdrop}>
            <KeyboardAvoidingView behavior={Platform.select({ ios: "padding", android: undefined })} style={{ width: "100%" }}  >
              <View style={styles.modalCard}>
                <Text style={styles.modalTitle}>Nova Categoria</Text>
                <TextInput placeholder="Descricao"
                  value={descricao}
                  onChangeText={(t) => {
                    setDescricao(t);
                    if (erro) setErro(null)
                  }}
                  autoFocus
                  autoCapitalize="sentences"
                  style={styles.input}
                  editable={!salvando}>

                </TextInput>
                {erro ? <Text style={styles.error}>{erro}</Text> : null}
                <View style={styles.modalActions}>
                  <Pressable style={[styles.btn, styles.btnGhost]}
                    onPress={() => setShowModal(false)}
                    disabled={salvando}>
                    <Text style={[styles.btnText, { color: "#111" }]}>Cancelar</Text>
                  </Pressable>
                  <Pressable style={[styles.btnPrimary, styles.btn]} onPress={salvarCategoria} disabled={salvando}>
                    {salvando ? (<ActivityIndicator color="#fff"></ActivityIndicator>)
                      : (<Text style={[styles.btnPrimary, { color: "#fff" }]}>salvarCategoria</Text>)}
                  </Pressable>
                </View>
              </View>

            </KeyboardAvoidingView>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

    </View>

  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  muted: { marginTop: 8, opacity: 0.6 },
  title: { fontSize: 18, fontWeight: "700", marginBottom: 12 },
  card: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  fab: {
    position: "absolute",
    right: 24,
    bottom: 24,
    backgroundColor: "#0a84ff",
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  modalCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    gap: 12,
  },
  modalTitle: { fontSize: 18, fontWeight: "700" },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
  },
  error: { color: "crimson", marginTop: 4 },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 4,
  },
  btn: {
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  btnGhost: {
    backgroundColor: "#f2f2f2",
  },
  btnPrimary: {
    backgroundColor: "#0a84ff",
  },
  btnText: { fontWeight: "700" },
});