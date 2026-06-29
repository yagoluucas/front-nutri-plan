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
    medidasCaseiras: IMedidaCaseira[]; // all available measures for editing
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

export interface IMacroTotals {
    cho: number;
    ptn: number;
    lip: number;
    kcal: number;
}

export interface IMealOption {
    id: string;
    titulo: string;
    observacoes: string;
    alimentos: IMealFood[];
    totalMacros: IMacroTotals;
}

export interface IMeal {
    id: string; // uuid
    nome: string;
    horario: string; // "HH:MM"
    observacoes: string;
    alimentos: IMealFood[];
    substituicao?: IMealOption;
    // Totals for the meal
    totalMacros: IMacroTotals;
}

export interface IPatientData {
    nome: string;
    email: string;
    dataNascimento?: string;
}

export interface IDietPlanState {
    id?: string;
    titulo: string;
    objetivoDoPlano: string;
    orientacoesGerais: string;
    paciente: IPatientData;
    refeicoes: IMeal[];
    // Grand totals for the entire plan
    totalMacros: IMacroTotals;
}
