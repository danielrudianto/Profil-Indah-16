export interface StockReportModel {
  document: {
    mutation: StockReportMutation[];
    totalInput: number;
    totalOutput: number;
    initialStock: number;
    finalStock: number;
  };
  input: {
    mutation: StockReportMutation[];
    totalInput: number;
    totalOutput: number;
    initialStock: number;
    finalStock: number;
  };
}

interface StockReportMutation {
  name: string;
  date: string | Date;
  createdAt: string | Date;
  opponent: string;
  displayQuantity: number;
  quantity: number;
  unit: string;
  stock: number;
  defaultUnit: string;
}
