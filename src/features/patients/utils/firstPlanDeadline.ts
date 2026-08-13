export const FIRST_PLAN_NEAR_DEADLINE_DAYS = 10;
export const FIRST_PLAN_ON_SCHEDULE_DAYS = 20;

export type FirstPlanDeadlineStatus =
    | "critical"
    | "nearDeadline"
    | "onSchedule"
    | "outsideAlert";

interface FirstPlanDeadlineInput {
    date?: string;
    isDelivered: boolean;
    referenceDate?: Date;
}

interface FirstPlanDeadline {
    deadline: Date | null;
    remainingDays: number | null;
    status: FirstPlanDeadlineStatus;
}

function parseLocalDate(value?: string) {
    if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return null;
    }

    const [year, month, day] = value.split("-").map(Number);
    const date = new Date(year, month - 1, day);

    if (
        date.getFullYear() !== year
        || date.getMonth() !== month - 1
        || date.getDate() !== day
    ) {
        return null;
    }

    return date;
}

function getStartOfDay(date: Date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function getFirstPlanDeadline({
    date: value,
    isDelivered,
    referenceDate = new Date(),
}: FirstPlanDeadlineInput): FirstPlanDeadline {
    const deadline = parseLocalDate(value);

    if (isDelivered || !deadline) {
        return {
            deadline,
            remainingDays: null,
            status: "outsideAlert",
        };
    }

    const remainingDays = Math.round(
        (deadline.getTime() - getStartOfDay(referenceDate).getTime()) / 86_400_000,
    );

    if (remainingDays < 0) {
        return { deadline, remainingDays, status: "critical" };
    }

    if (remainingDays <= FIRST_PLAN_NEAR_DEADLINE_DAYS) {
        return { deadline, remainingDays, status: "nearDeadline" };
    }

    if (remainingDays <= FIRST_PLAN_ON_SCHEDULE_DAYS) {
        return { deadline, remainingDays, status: "onSchedule" };
    }

    return { deadline, remainingDays, status: "outsideAlert" };
}
