export interface ReportRowDTO {
  date: string;
  companyName: string;
  entry: string;
  lunch: string;
  exit: string;
  totalHours: string;
  overtimeHours: string;
  nightHours: string;
  earnings: string;
}

export interface ReportDataDTO {
  userName: string;
  monthYear: string;
  rows: ReportRowDTO[];
  totals: {
    hours: string;
    earnings: string;
  };
}
