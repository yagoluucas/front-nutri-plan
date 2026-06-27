export interface INutriente {
    nomeComponente: string;
    valorPor100G: number | null;
    unidadeUtilizada: string;
}

export interface IMedidaCaseira {
    nomeMedida: string;
    total: number;
    unidadeMedida: string;
    tipoMedida: "Caseira" | "Tecnica";
}

export interface IAlimentoDetail {
    codigoAlimento: string;
    nomeAlimento: string;
    linkAlimento: string;
    grupo: string | null;
    marca: string | null;
    nutrientes: INutriente[];
    medidasCaseiras: IMedidaCaseira[];
}

export interface IAlimentoAutocomplete {
    codigoAlimento: string;
    nomeAlimento: string;
}

export interface IMealFood {
    id: string; // uuid for local list management
    codigoAlimento: string;
    nomeAlimento: string;
    medidaSelecionada: IMedidaCaseira;
    quantidade: number;
    totalGramas: number;
    // Pre-calculated macros for this food based on quantity and measure
    macros: {
        cho: number;
        ptn: number;
        lip: number;
        kcal: number;
    };
    nutrientesCompletos: {
        nomeComponente: string;
        valorCalculado: number;
        unidadeUtilizada: string;
    }[];
}

export interface IMeal {
    id: string; // uuid
    nome: string;
    horario: string; // "HH:MM"
    observacoes: string;
    alimentos: IMealFood[];
    // Totals for the meal
    totalMacros: {
        cho: number;
        ptn: number;
        lip: number;
        kcal: number;
    };
}

export interface IPatientData {
    nome: string;
    sexo: string;
    email: string;
    objetivo: string;
    observacoes: string;
}

export interface IDietPlanState {
    paciente: IPatientData;
    refeicoes: IMeal[];
    // Grand totals for the entire plan
    totalMacros: {
        cho: number;
        ptn: number;
        lip: number;
        kcal: number;
    };
}
