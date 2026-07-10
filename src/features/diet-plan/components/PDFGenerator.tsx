"use client";

import React, { useSyncExternalStore } from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFDownloadLink,
  Image,
} from "@react-pdf/renderer";
import { IDietPlanState } from "../types/dietPlan.types";
import { NutritionistProfile } from "../../profile/types/profile.types";
import Button from "@/src/components/ui/Button";
import { Download } from "lucide-react";

// Create styles for PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
    padding: 40,
    fontFamily: "Helvetica", // Basic font
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E4E4E7",
    paddingBottom: 10,
  },
  headerContent: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  profileImage: {
    width: 58,
    height: 58,
    borderRadius: 29,
    objectFit: "cover",
  },
  profileFallback: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#CDEAE1",
    alignItems: "center",
    justifyContent: "center",
  },
  profileInitials: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#059669",
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#059669", // Brand green
    marginBottom: 5,
  },
  patientInfo: {
    fontSize: 12,
    color: "#52525B",
    marginBottom: 3,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#09090B",
    marginBottom: 6,
    marginTop: 8,
  },
  orientationBox: {
    marginTop: 12,
    marginBottom: 8,
    padding: 10,
    backgroundColor: "#F0FDF4",
    borderRadius: 4,
  },
  orientationText: {
    fontSize: 10,
    color: "#166534",
    marginBottom: 3,
    lineHeight: 1.35,
  },
  mealContainer: {
    marginTop: 15,
    marginBottom: 10,
    padding: 10,
    backgroundColor: "#FAFAFA",
    borderRadius: 4,
  },
  mealHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#E4E4E7",
    paddingBottom: 5,
    marginBottom: 5,
  },
  mealTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#09090B",
  },
  mealTime: {
    fontSize: 12,
    color: "#52525B",
  },
  mealObs: {
    fontSize: 10,
    fontStyle: "italic",
    color: "#71717A",
    marginBottom: 8,
  },
  foodRow: {
    flexDirection: "row",
    marginBottom: 4,
    paddingVertical: 2,
  },
  foodBullet: {
    width: 10,
    fontSize: 10,
    color: "#059669",
  },
  foodName: {
    fontSize: 11,
    color: "#09090B",
    flex: 1,
  },
  foodAmount: {
    fontSize: 10,
    color: "#52525B",
    width: 150,
    textAlign: "right",
  },
  optionTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#047857",
    marginTop: 6,
    marginBottom: 4,
  },
  substitutionBox: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#E4E4E7",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: "center",
    fontSize: 10,
    color: "#A1A1AA",
    borderTopWidth: 1,
    borderTopColor: "#F4F4F5",
    paddingTop: 10,
  },
});

const FOOD_NAME_SOURCE_PATTERNS = [
  /\s*,?\s*Brasil\s*\([^)]*(?:amostra|amostras|m[eé]dia|mediana)[^)]*\)/gi,
  /\s*\([^)]*(?:amostra|amostras|m[eé]dia|mediana|brasil)[^)]*\)/gi,
  /\s*(?:,|-|–)\s*Brasil\s*$/gi,
];

function getInitials(name?: string) {
  const initials = (name || "Nutri Plan")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((item) => item[0])
    .join("")
    .toUpperCase();

  return initials || "NP";
}

function sanitizeFileName(value?: string) {
  const normalized = (value || "paciente")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9_-]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 60);

  return normalized || "paciente";
}

function formatFoodDisplayName(value?: string) {
  const originalName = value?.trim();
  if (!originalName) return "Alimento";

  const cleanedName = FOOD_NAME_SOURCE_PATTERNS.reduce(
    (name, pattern) => name.replace(pattern, ""),
    originalName,
  )
    .replace(/\s*,\s*/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();

  const displayName = cleanedName || originalName;

  return displayName.charAt(0).toLocaleUpperCase("pt-BR") + displayName.slice(1);
}

function splitTextLines(value?: string) {
  if (!value || !value.trim()) return [];
  return value
    .split(/\r?\n/)
    .map((line) => line.trim() || "\u00A0");
}

// PDF Document Component
const DietPlanDocument = ({
  data,
  profile,
}: {
  data: IDietPlanState;
  profile?: NutritionistProfile;
}) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          {profile?.fotoPerfil || profile?.imagemPerfil ? (
            // eslint-disable-next-line jsx-a11y/alt-text
            <Image
              src={profile.fotoPerfil || profile.imagemPerfil || ""}
              style={styles.profileImage}
            />
          ) : (
            <View style={styles.profileFallback}>
              <Text style={styles.profileInitials}>
                {getInitials(profile?.nome)}
              </Text>
            </View>
          )}
          <View style={styles.headerText}>
            <Text style={styles.title}>Plano Alimentar</Text>
            <Text style={styles.patientInfo}>
              {profile?.nome || "Nutricionista"} -{" "}
              {profile?.profissao || "Nutricionista"}
              {profile?.crn ? ` | ${profile.crn}` : ""}
            </Text>
            <Text style={styles.patientInfo}>
              Paciente: {data.paciente.nome || "Não informado"}
            </Text>
            {data.objetivoDoPlano && (
              <Text style={styles.patientInfo}>
                Objetivo: {data.objetivoDoPlano}
              </Text>
            )}
            <Text style={styles.patientInfo}>
              Data: {new Date().toLocaleDateString("pt-BR")}
            </Text>
          </View>
        </View>
      </View>

      {splitTextLines(data.orientacoesGerais).length > 0 && (
        <View style={styles.orientationBox}>
          <Text style={styles.sectionTitle}>Orientações gerais</Text>
          {splitTextLines(data.orientacoesGerais).map((line, index) => (
            <Text key={`${line}-${index}`} style={styles.orientationText}>
              {line}
            </Text>
          ))}
        </View>
      )}

      {/* Meals */}
      {[...data.refeicoes]
        .sort((firstMeal, secondMeal) =>
          firstMeal.horario.localeCompare(secondMeal.horario),
        )
        .map((meal) => (
          <View key={meal.id} style={styles.mealContainer}>
            <View style={styles.mealHeader}>
              <Text style={styles.mealTitle}>{meal.nome}</Text>
              <Text style={styles.mealTime}>{meal.horario}</Text>
            </View>

            {meal.observacoes && (
              <Text style={styles.mealObs}>Obs: {meal.observacoes}</Text>
            )}

            <Text style={styles.optionTitle}>Opcao principal</Text>
            {meal.alimentos.map((food, index) => (
              <View key={food.id || index} style={styles.foodRow}>
                <Text style={styles.foodBullet}>•</Text>
                <Text style={styles.foodName}>
                  {formatFoodDisplayName(food.nomeAlimento)}
                </Text>
                <Text style={styles.foodAmount}>
                  {food.quantidade}x {food.medidaSelecionada.nomeMedida} (
                  {food.totalGramas.toFixed(0)}g)
                </Text>
              </View>
            ))}
            {meal.substituicao && (
              <View style={styles.substitutionBox}>
                <Text style={styles.optionTitle}>
                  {meal.substituicao.titulo}
                </Text>
                {meal.substituicao.observacoes && (
                  <Text style={styles.mealObs}>
                    Obs: {meal.substituicao.observacoes}
                  </Text>
                )}
                {meal.substituicao.alimentos.map((food, index) => (
                  <View key={food.id || index} style={styles.foodRow}>
                    <Text style={styles.foodBullet}>-</Text>
                    <Text style={styles.foodName}>
                      {formatFoodDisplayName(food.nomeAlimento)}
                    </Text>
                    <Text style={styles.foodAmount}>
                      {food.quantidade}x {food.medidaSelecionada.nomeMedida} (
                      {food.totalGramas.toFixed(0)}g)
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        ))}

      {/* Footer */}
      <Text style={styles.footer}>
        Gerado por Nutri Plan - A evolução no acompanhamento nutricional
      </Text>
    </Page>
  </Document>
);

interface PDFGeneratorProps {
  data: IDietPlanState;
  profile?: NutritionistProfile;
  disabled?: boolean;
  label?: string;
  buttonClassName?: string;
}

function subscribeToClientMount() {
  return () => undefined;
}

function getClientSnapshot() {
  return true;
}

function getServerSnapshot() {
  return false;
}

export default function PDFGenerator({
  data,
  profile,
  disabled,
  label = "Exportar PDF",
  buttonClassName = "",
}: PDFGeneratorProps) {
  const isClient = useSyncExternalStore(
    subscribeToClientMount,
    getClientSnapshot,
    getServerSnapshot,
  );

  if (!isClient) {
    return (
      <Button disabled={true} className={`${buttonClassName}`.trim()}>
        <Download size={18} className="mr-2" />
        {label}
      </Button>
    );
  }

  return (
    <PDFDownloadLink
      document={<DietPlanDocument data={data} profile={profile} />}
      fileName={`plano_${sanitizeFileName(data.paciente.nome)}.pdf`}
      className=""
    >
      {({ loading }) => (
        <Button
          variant="primary"
          disabled={disabled || loading}
          className={`${buttonClassName}`.trim()}
        >
          <Download size={18} className="mr-2" />
          {loading ? "Gerando..." : label}
        </Button>
      )}
    </PDFDownloadLink>
  );
}
