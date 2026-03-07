import * as XLSX from "xlsx";

export interface ParsedSheet {
  headers: string[];
  rows: Record<string, unknown>[];
  rawContent: string;
}

export async function readFinancialFile(file: File): Promise<ParsedSheet> {
  const arrayBuffer = await file.arrayBuffer();
  const wb = XLSX.read(arrayBuffer, { type: "array", cellDates: true });

  // Take first sheet
  const sheetName = wb.SheetNames[0];
  if (!sheetName) throw new Error("El archivo no contiene hojas de datos.");

  const sheet = wb.Sheets[sheetName];
  if (!sheet) throw new Error("No se pudo leer la hoja de datos.");

  // Convert to JSON with headers
  const jsonData = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });
  const headers = jsonData.length > 0 ? Object.keys(jsonData[0]) : [];

  // Also get raw text for content analysis
  const rawContent = XLSX.utils.sheet_to_csv(sheet).slice(0, 2000);

  return {
    headers,
    rows: jsonData,
    rawContent,
  };
}

export function computeFileHash(content: string): string {
  // Simple hash for duplicate detection
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
}
