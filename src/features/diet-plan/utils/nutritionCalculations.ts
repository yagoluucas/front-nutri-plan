import {
    IAlimentoDetail,
    IMeal,
    IMealFood,
    IMacroTotals,
    INutriente,
    INutrientTotal,
} from "../types/dietPlan.types";

const EMPTY_TOTALS: IMacroTotals = { cho: 0, ptn: 0, lip: 0, kcal: 0 };

function normalizeText(value: string) {
    return value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
}

function calculateNutrients(nutrients: INutriente[], totalGramas: number): INutrientTotal[] {
    const multiplier = totalGramas / 100;

    return nutrients.map((nutrient) => ({
        nomeComponente: nutrient.nomeComponente,
        valorCalculado: nutrient.valorPor100G !== null ? nutrient.valorPor100G * multiplier : 0,
        unidadeUtilizada: nutrient.unidadeUtilizada,
    }));
}

function extractMacros(nutrients: INutrientTotal[]): IMacroTotals {
    let cho: number | null = null;
    let ptn: number | null = null;
    let lip: number | null = null;
    let kcal: number | null = null;

    for (const nutrient of nutrients) {
        const name = normalizeText(nutrient.nomeComponente);
        const unit = normalizeText(nutrient.unidadeUtilizada);
        const value = nutrient.valorCalculado;

        if (kcal === null && name.includes("energia") && unit === "kcal") {
            kcal = value;
        }

        if (name.includes("carboidrato disponiv")) {
            cho = value;
        } else if (cho === null && name.includes("carboidrato")) {
            cho = value;
        }

        if (ptn === null && (name.includes("proteina") || name.startsWith("prote"))) {
            ptn = value;
        }

        if (lip === null && (
            name.includes("lipidi") ||
            name.includes("lipideo") ||
            name.includes("gordura total")
        )) {
            lip = value;
        }
    }

    return {
        cho: cho ?? 0,
        ptn: ptn ?? 0,
        lip: lip ?? 0,
        kcal: kcal ?? 0,
    };
}

export function buildMealFood(
    detail: IAlimentoDetail,
    medidaIndex: number,
    quantity: number,
    id?: string,
): IMealFood {
    const medida = detail.medidasCaseiras[medidaIndex];
    const totalGramas = quantity * medida.total;
    const nutrientesCompletos = calculateNutrients(detail.nutrientes, totalGramas);

    return {
        id: id ?? crypto.randomUUID(),
        codigoAlimento: detail.codigoAlimento,
        nomeAlimento: detail.nomeAlimento,
        medidasCaseiras: detail.medidasCaseiras,
        medidaSelecionada: medida,
        quantidade: quantity,
        totalGramas,
        macros: extractMacros(nutrientesCompletos),
        nutrientesCompletos,
        nutrientesOriginais: detail.nutrientes,
    };
}

export function recalculateMealFood(base: IMealFood, medidaIndex: number, quantity: number): IMealFood {
    const medida = base.medidasCaseiras[medidaIndex];
    const totalGramas = quantity * medida.total;

    if (base.nutrientesOriginais?.length) {
        const nutrientesCompletos = calculateNutrients(base.nutrientesOriginais, totalGramas);

        return {
            ...base,
            medidaSelecionada: medida,
            quantidade: quantity,
            totalGramas,
            macros: extractMacros(nutrientesCompletos),
            nutrientesCompletos,
        };
    }

    const ratio = base.totalGramas > 0 ? totalGramas / base.totalGramas : 0;

    return {
        ...base,
        medidaSelecionada: medida,
        quantidade: quantity,
        totalGramas,
        macros: {
            cho: base.macros.cho * ratio,
            ptn: base.macros.ptn * ratio,
            lip: base.macros.lip * ratio,
            kcal: base.macros.kcal * ratio,
        },
        nutrientesCompletos: base.nutrientesCompletos.map((nutrient) => ({
            ...nutrient,
            valorCalculado: nutrient.valorCalculado * ratio,
        })),
    };
}

export function calculateMealMacros(foods: IMealFood[]): IMacroTotals {
    return foods.reduce((acc, food) => ({
        cho: acc.cho + food.macros.cho,
        ptn: acc.ptn + food.macros.ptn,
        lip: acc.lip + food.macros.lip,
        kcal: acc.kcal + food.macros.kcal,
    }), { ...EMPTY_TOTALS });
}

export function calculatePlanMicronutrients(meals: IMeal[]): INutrientTotal[] {
    const totals = new Map<string, INutrientTotal>();

    for (const meal of meals) {
        for (const food of meal.alimentos) {
            for (const nutrient of food.nutrientesCompletos) {
                if (nutrient.valorCalculado <= 0) {
                    continue;
                }

                const key = `${normalizeText(nutrient.nomeComponente)}|${normalizeText(nutrient.unidadeUtilizada)}`;
                const current = totals.get(key);

                if (current) {
                    current.valorCalculado += nutrient.valorCalculado;
                } else {
                    totals.set(key, { ...nutrient });
                }
            }
        }
    }

    return [...totals.values()].sort((first, second) => (
        first.nomeComponente.localeCompare(second.nomeComponente, "pt-BR")
    ));
}
