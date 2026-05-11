export interface WeeklyEarning {
  week: string; // Ex: "Semana 1"
  earnings: number;
}

export interface HourDistribution {
  name: string; // "Regular", "Extra", "Noturno"
  value: number; // Horas
  color: string;
}

export interface AnalyticsDTO {
  totalEarnings: number;
  projectedEarnings: number;
  totalHours: number;
  averageEntryTime: string;
  weeklyEarnings: WeeklyEarning[];
  hourDistribution: HourDistribution[];
}
