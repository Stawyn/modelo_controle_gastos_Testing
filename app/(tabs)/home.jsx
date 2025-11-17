import { useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Svg, { Circle } from "react-native-svg";
import { obterResumoLancamentos } from "../_services/lancamentos";

const formatCurrency = (value) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  }).format(value);

const palette = {
  entradas: "#16a34a",
  saidas: "#dc2626",
  cards: "#f8fafc",
};

export default function Home() {
  const [resumo, setResumo] = useState({ entradas: 0, saidas: 0 });
  const [loading, setLoading] = useState(true);

  const saldo = useMemo(
    () => resumo.entradas - resumo.saidas,
    [resumo.entradas, resumo.saidas]
  );

  const hasData = resumo.entradas > 0 || resumo.saidas > 0;

  async function carregarResumo() {
    setLoading(true);
    try {
      const dados = await obterResumoLancamentos();
      setResumo(dados);
    } catch (error) {
      console.error("Erro ao carregar resumo", error);
    } finally {
      setLoading(false);
    }
  }

  // Toda vez que voltamos para a aba Home, recarregamos o saldo atualizado
  useFocusEffect(
    useCallback(() => {
      carregarResumo();
    }, [])
  );

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.headerTitle}>Visão geral</Text>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Saldo atual</Text>
          {loading ? (
            <ActivityIndicator />
          ) : (
            <Text
              style={[
                styles.balanceValue,
                saldo >= 0 ? styles.positive : styles.negative,
              ]}
            >
              {formatCurrency(saldo)}
            </Text>
          )}

          <View style={styles.balanceBreakdown}>
            <ResumoLinha
              titulo="Entradas"
              valor={resumo.entradas}
              cor={palette.entradas}
            />
            <ResumoLinha
              titulo="Saídas"
              valor={resumo.saidas}
              cor={palette.saidas}
            />
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Entradas x Saídas</Text>
          {loading ? (
            <ActivityIndicator />
          ) : hasData ? (
            <View style={styles.chartWrapper}>
              <DonutChart entradas={resumo.entradas} saidas={resumo.saidas} />
              <View style={styles.centerLabel}>
                <Text style={styles.centerLabelTop}>Total</Text>
                <Text style={styles.centerLabelValue}>
                  {formatCurrency(resumo.entradas + resumo.saidas)}
                </Text>
              </View>
            </View>
          ) : (
            <Text style={styles.emptyState}>
              Cadastre seus primeiros lançamentos para visualizar o gráfico.
            </Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function ResumoLinha({ titulo, valor, cor }) {
  return (
    <View style={styles.summaryRow}>
      <View style={[styles.legendDot, { backgroundColor: cor }]} />
      <View style={styles.summaryCopy}>
        <Text style={styles.summaryLabel}>{titulo}</Text>
        <Text style={styles.summaryValue}>{formatCurrency(valor)}</Text>
      </View>
    </View>
  );
}

// DonutChart simplifica a explicação no vídeo: cada arco representa uma fatia do total.
function DonutChart({ entradas, saidas }) {
  const radius = 90;
  const strokeWidth = 28;
  const circumference = 2 * Math.PI * radius;
  const total = entradas + saidas;
  const entradasLength = (entradas / total) * circumference || 0;
  const saidasLength = (saidas / total) * circumference || 0;

  return (
    <Svg width={240} height={240}>
      {/* Base em cinza claro indica a trilha do gráfico */}
      <Circle
        cx="120"
        cy="120"
        r={radius}
        stroke="#cbd5f5"
        strokeWidth={strokeWidth}
        fill="transparent"
      />
      {/* Fatia verde = créditos */}
      {entradas > 0 && (
        <Circle
          cx="120"
          cy="120"
          r={radius}
          stroke={palette.entradas}
          strokeWidth={strokeWidth}
          strokeDasharray={`${entradasLength} ${circumference - entradasLength}`}
          strokeDashoffset={0}
          strokeLinecap="round"
          fill="transparent"
          rotation={-90}
          originX="120"
          originY="120"
        />
      )}
      {/* Fatia vermelha = débitos */}
      {saidas > 0 && (
        <Circle
          cx="120"
          cy="120"
          r={radius}
          stroke={palette.saidas}
          strokeWidth={strokeWidth}
          strokeDasharray={`${saidasLength} ${circumference - saidasLength}`}
          strokeDashoffset={-entradasLength}
          strokeLinecap="round"
          fill="transparent"
          rotation={-90}
          originX="120"
          originY="120"
        />
      )}
    </Svg>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#e2e8f0" },
  container: {
    padding: 20,
    gap: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0f172a",
  },
  card: {
    backgroundColor: palette.cards,
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    gap: 16,
  },
  cardLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#475569",
  },
  balanceValue: {
    fontSize: 36,
    fontWeight: "800",
  },
  positive: { color: palette.entradas },
  negative: { color: palette.saidas },
  balanceBreakdown: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 10,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  summaryCopy: { flex: 1 },
  summaryLabel: {
    color: "#475569",
    fontSize: 13,
    fontWeight: "600",
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a",
  },
  chartWrapper: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 260,
  },
  centerLabel: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  centerLabelTop: {
    color: "#475569",
    fontSize: 12,
    fontWeight: "600",
  },
  centerLabelValue: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0f172a",
  },
  emptyState: {
    textAlign: "center",
    color: "#94a3b8",
    fontWeight: "600",
  },
});
