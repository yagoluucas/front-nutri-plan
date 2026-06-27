"use client";

import React, { useSyncExternalStore } from 'react';
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink } from '@react-pdf/renderer';
import { IDietPlanState } from '../types/dietPlan.types';
import Button from '@/src/components/ui/Button';
import { Download } from 'lucide-react';

// Create styles for PDF
const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: '#FFFFFF',
        padding: 40,
        fontFamily: 'Helvetica', // Basic font
    },
    header: {
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#E4E4E7',
        paddingBottom: 10,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#059669', // Brand green
        marginBottom: 5,
    },
    patientInfo: {
        fontSize: 12,
        color: '#52525B',
        marginBottom: 3,
    },
    mealContainer: {
        marginTop: 15,
        marginBottom: 10,
        padding: 10,
        backgroundColor: '#FAFAFA',
        borderRadius: 4,
    },
    mealHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderBottomColor: '#E4E4E7',
        paddingBottom: 5,
        marginBottom: 5,
    },
    mealTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#09090B',
    },
    mealTime: {
        fontSize: 12,
        color: '#52525B',
    },
    mealObs: {
        fontSize: 10,
        fontStyle: 'italic',
        color: '#71717A',
        marginBottom: 8,
    },
    foodRow: {
        flexDirection: 'row',
        marginBottom: 4,
        paddingVertical: 2,
    },
    foodBullet: {
        width: 10,
        fontSize: 10,
        color: '#059669',
    },
    foodName: {
        fontSize: 11,
        color: '#09090B',
        flex: 1,
    },
    foodAmount: {
        fontSize: 10,
        color: '#52525B',
        width: 150,
        textAlign: 'right',
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 40,
        right: 40,
        textAlign: 'center',
        fontSize: 10,
        color: '#A1A1AA',
        borderTopWidth: 1,
        borderTopColor: '#F4F4F5',
        paddingTop: 10,
    }
});

// PDF Document Component
const DietPlanDocument = ({ data }: { data: IDietPlanState }) => (
    <Document>
        <Page size="A4" style={styles.page}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Plano Alimentar</Text>
                <Text style={styles.patientInfo}>Paciente: {data.paciente.nome || "Não informado"}</Text>
                {data.paciente.objetivo && <Text style={styles.patientInfo}>Objetivo: {data.paciente.objetivo}</Text>}
                <Text style={styles.patientInfo}>Data: {new Date().toLocaleDateString('pt-BR')}</Text>
            </View>

            {/* Meals */}
            {data.refeicoes.map((meal) => (
                <View key={meal.id} style={styles.mealContainer}>
                    <View style={styles.mealHeader}>
                        <Text style={styles.mealTitle}>{meal.nome}</Text>
                        <Text style={styles.mealTime}>{meal.horario}</Text>
                    </View>
                    
                    {meal.observacoes && (
                        <Text style={styles.mealObs}>Obs: {meal.observacoes}</Text>
                    )}

                    {meal.alimentos.map((food, index) => (
                        <View key={food.id || index} style={styles.foodRow}>
                            <Text style={styles.foodBullet}>•</Text>
                            <Text style={styles.foodName}>{food.nomeAlimento}</Text>
                            <Text style={styles.foodAmount}>
                                {food.quantidade}x {food.medidaSelecionada.nomeMedida} ({food.totalGramas.toFixed(0)}g)
                            </Text>
                        </View>
                    ))}
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
    disabled?: boolean;
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

export default function PDFGenerator({ data, disabled }: PDFGeneratorProps) {
    const isClient = useSyncExternalStore(
        subscribeToClientMount,
        getClientSnapshot,
        getServerSnapshot,
    );

    if (!isClient) {
        return (
            <Button disabled={true} className="w-full sm:w-auto">
                <Download size={18} className="mr-2" />
                Exportar PDF
            </Button>
        );
    }

    return (
        <PDFDownloadLink
            document={<DietPlanDocument data={data} />}
            fileName={`plano_${data.paciente.nome?.replace(/\s+/g, '_') || 'paciente'}.pdf`}
            className="w-full sm:w-auto"
        >
            {({ loading }) => (
                <Button 
                    variant="primary" 
                    disabled={disabled || loading} 
                    className="w-full sm:w-auto"
                >
                    <Download size={18} className="mr-2" />
                    {loading ? 'Gerando...' : 'Exportar PDF'}
                </Button>
            )}
        </PDFDownloadLink>
    );
}
