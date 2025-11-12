// app/(tabs)/lancamentos.tsx
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, FlatList, KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Categoria, listarCategorias } from "../_services/categorias";
import { criarLancamento, Lancamento, listarLancamentos, removerLancamento } from "../_services/lancamentos";
import { listarTiposPagRec, TipoPagRec } from "../_services/tipoPagRec";



const todayiso = () => {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}


export default function LancamentosScreen() {
  const [data, setData] = useState(todayiso());
  const [valor, setValor] = useState("");
  const [categoriaId, setCategoriaId] = useState<number | null>(null);
  const [tipoPagRecId, setTipoPagRecId] = useState<number | null>(null);
  const [tipo, setTipo] = useState<"D" | "C">("C");
  const [observacao, setObservacao] = useState("");

  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [tipos, setTipos] = useState<TipoPagRec[]>([])
  const [loadingOpt, setLoadingOpt] = useState(true)

  const [lista, setLista] = useState<(Lancamento & { categoria: string, tipopagrec: string })[]>([])
  const [loadingList, setLoadingList] = useState(true)
  const [showCatModal, setShowCatModal] = useState(false)
  const [showTipoModal, setShowTipoModal] = useState(false)

  async function carregrOpcoes() {
    setLoadingOpt(true);
    try {
      const [cats, tps] = await Promise.all([listarCategorias(), listarTiposPagRec()]);
      setCategorias(cats);
      setTipos(tps);
      if (cats.length && categoriaId == null) setCategoriaId(cats[0].id);
      if (tps.length && tipoPagRecId == null) setTipoPagRecId(tps[0].id);

    } finally {
      setLoadingOpt(false)
    }
  }

  async function carregarLista() {
    setLoadingList(true);
    try {
      const dados = await listarLancamentos(50);
      setLista(dados);
    } finally { setLoadingList(false) }
  }
  useEffect(() => {
    (async () => {
      await carregrOpcoes();
      await carregarLista();
    })()
  }, [])

  const catSelecionada = useMemo(
    () => categorias.find((c) => c.id === categoriaId)?.descricao ?? "Selecionar", [categoriaId, setCategoriaId]
  )

  const tipoSelecionado = useMemo(
    () => tipos.find((t) => t.id === tipoPagRecId)?.descricao ?? "Selecionar", [tipoPagRecId, setTipoPagRecId]
  )
  async function salvar() {
    if (!data.trim() || !/ˆ\d{4}-\d{2}-\d{2}$/.test(data.trim())) {
      Alert.alert("Informe a data no formato YYYY-MM-DD");
    }
    const v = Number(valor.replace(",", "."));
    if (!Number.isFinite(v || v <= 0)) {
      Alert.alert("Informe um valor maior que 0");
    }
    if (!categoriaId) {
      Alert.alert("Informe a categoria");
    }
    if (!tipoPagRecId) {
      Alert.alert("Informe o tipo de pagamento");
    }



    await criarLancamento({

      data: data.trim(),
      valor: v,
      categoria_id: categoriaId,
      tipopagrec_id: tipoPagRecId,
      tipo,
      observacao: observacao.trim() || null
    });
    setValor("");
    setObservacao("");
    await carregarLista();
    Alert.alert("Dados salvos com sucesso");

  }

  async function excluirLancamento(id: number) {
    Alert.alert(
      "Excluir lançamento?", "Tem certeza que deseja excluir?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir", style: "destructive", onPress: async () => {
            await removerLancamento(id);
            await carregarLista();
          }
        }
      ]
    )
  }
  return (
    <KeyboardAvoidingView style={{ flex: 1, marginTop: 50 }}
      behavior={Platform.select({ ios: "padding", android: undefined })}>

      <FlatList
        ListHeaderComponent={<View style={{ padding: 16, gap: 8 }}>
          <Text style={styles.title}>Novo Lançamento</Text>
          {/*data */}
          <View style={styles.row}>
            <Text style={styles.label}>Data</Text>
            <TextInput placeholder="YYYY-MM-DD" value={data} onChangeText={setData} autoCapitalize="none" keyboardType="numbers-and-punctuation" style={styles.input}>

            </TextInput>
          </View>
          {/*valor */}
          <View style={styles.row}>
            <Text style={styles.label}>Valor</Text>
            <TextInput placeholder="0,00" value={valor} onChangeText={setValor} keyboardType="decimal-pad" style={styles.input}>

            </TextInput>
          </View>

          {/*Categoria */}
          <View style={styles.row}>
            <Text style={styles.label}>Categoria</Text>
            <Pressable style={[styles.input, styles.select]} onPress={() => setShowCatModal(true)}
              disabled={loadingOpt}>
              <Text>{loadingOpt ? "Carregando" : catSelecionada} </Text>
              <Ionicons name="chevron-down" size={18}></Ionicons>
            </Pressable>
          </View>
          {/*tipo pagamento */}
          <View style={styles.row}>
            <Text style={styles.label}>Tipo Pagamento</Text>
            <Pressable style={[styles.input, styles.select]} onPress={() => setShowTipoModal(true)}
              disabled={loadingOpt}>
              <Text>{loadingOpt ? "Carregando" : tipoSelecionado} </Text>
              <Ionicons name="chevron-down" size={18}></Ionicons>
            </Pressable>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Tipo</Text>
            <View style={{ flexDirection: "row", gap: 8 }}>
              <Pressable
                style={[styles.chip, tipo === "D" && styles.chipActive]} onPress={() => setTipo("D")}>
                <Text style={[styles.chipText, tipo === "D" && styles.chipTextActive]}>Debito</Text>
              </Pressable>
              <Pressable
                style={[styles.chip, tipo === "C" && styles.chipActive]} onPress={() => setTipo("C")}>
                <Text style={[styles.chipText, tipo === "D" && styles.chipTextActive]}>Credito</Text>
              </Pressable>
            </View>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Observação</Text>
            <TextInput placeholder="(opcional)" value={observacao} onChangeText={setObservacao} style={[styles.input, { height: 80, textAlignVertical: "top" }]}>

            </TextInput>
          </View>
          <Pressable style={styles.btnPrimary} onPress={salvar}>
            <Text style={{ color: "#fff", fontWeight: "700" }}>Salvar</Text>
          </Pressable>
          <View style={{ height: 8 }}></View>
          <Text style={styles.subtitle}>Últimos lançamentos</Text>
        </View>


        }
        data={lista}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ paddingHorizontal: 17, paddingBottom: 24 }}
        ListEmptyComponent={loadingList ? null : (<Text style={{ opacity: 0.6, paddingHorizontal: 16 }}>Sem lançamentos</Text>)}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: "700" }}>
                {item.tipo === "D" ? "- " : "+ "}
                {item.valor.toFixed(2).replace(".", ",")}
              </Text>
              <Text style={{ opacity: 0.7, fontSize: 12 }}>{item.data}</Text>
              <Text style={{ marginTop: 4 }}>{item.categoria} + {item.tipopagrec} </Text>
              {item.observacao ? (<Text style={{ opacity: 0.8, marginTop: 4 }}>{item.observacao}</Text>) : null}
            </View>
            <Pressable 
            onPress={() => excluirLancamento(item.id)}
            style={styles.trashBtn} 
            hitSlop={10}
            
            >
              <Ionicons name="trash-outline" size={20} color="d11a2a"></Ionicons>
            </Pressable>
          </View>
        )}
        ListFooterComponent={loadingList ? <ActivityIndicator style={{ marginTop: 8 }}></ActivityIndicator> : null}

      >



      </FlatList>
      <Modal visible={showCatModal} transparent animationType="fade" onRequestClose={() => setShowCatModal(false)}>
        <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPressOut={() => setShowCatModal(false)}>
          <View style={styles.modalCard} onStartShouldSetResponder={() => true}>
            <Text style={styles.modalTitle}>Selecione a categoria</Text>
            {loadingOpt ? (<ActivityIndicator />) :
              (<FlatList data={categorias} keyExtractor={(i) => String(i.id)}
                renderItem={({ item }) => (
                  <Pressable style={styles.option} onPress={() => {
                    setCategoriaId(item.id);
                    setShowCatModal(false)
                  }

                  }>
                    <Text>{item.descricao}</Text>
                    {categoriaId === item.id && <Ionicons name="checkmark" size={18}></Ionicons>}
                  </Pressable>
                )}
              />
              )}
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal visible={showTipoModal} transparent animationType="fade" onRequestClose={() => setShowTipoModal(false)}>
        <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPressOut={() => setShowTipoModal(false)}>
          <View style={styles.modalCard} onStartShouldSetResponder={() => true}>
            <Text style={styles.modalTitle}>Selecione o tipo</Text>
            {loadingOpt ? (<ActivityIndicator />) :
              (<FlatList data={tipos} keyExtractor={(i) => String(i.id)}
                renderItem={({ item }) => (
                  <Pressable style={styles.option} onPress={() => {
                    setTipoPagRecId(item.id);
                    setShowTipoModal(false)
                  }

                  }>
                    <Text>{item.descricao}</Text>
                    {categoriaId === item.id && <Ionicons name="checkmark" size={18}></Ionicons>}
                  </Pressable>
                )}
              />
              )}
          </View>
        </TouchableOpacity>
      </Modal>
    </KeyboardAvoidingView>
  );
}



const styles = StyleSheet.create({
  title: { fontSize: 18, fontWeight: "700" },
  subtitle: { fontSize: 16, fontWeight: "700" },
  row: { gap: 6, marginTop: 8 },
  label: { fontSize: 13, opacity: 0.8 },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
  },
  select: { justifyContent: "space-between" },
  chip: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 20,
    paddingHorizontal: 14,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  chipActive: {
    borderColor: "#0a84ff",
    backgroundColor: "#e7f0ff",
  },
  chipText: { fontWeight: "600" },
  chipTextActive: { color: "#0a84ff" },
  btnPrimary: {
    marginTop: 12,
    backgroundColor: "#0a84ff",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  card: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 12,
    padding: 12,
    backgroundColor: "#fff",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    padding: 20,
  },
  modalCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    maxHeight: "70%",
  },
  modalTitle: { fontSize: 16, fontWeight: "700", marginBottom: 10 },
  option: {
    padding: 12,
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 10,
    backgroundColor: "#fff",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  trashBtn: {
    padding: 8,
    borderRadius: 8,
    alignSelf: "flex-start"
  }
});
