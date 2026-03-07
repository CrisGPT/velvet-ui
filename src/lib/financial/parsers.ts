import type {
  EstadoCuentaData,
  EstadoResultadosData,
  BalanceGeneralData,
  BankTransaction,
} from "./types";

type Row = Record<string, unknown>;

function num(val: unknown): number {
  if (val == null) return 0;
  const n = typeof val === "number" ? val : parseFloat(String(val).replace(/[$,\s]/g, ""));
  return isNaN(n) ? 0 : n;
}

function str(val: unknown): string {
  return val == null ? "" : String(val).trim();
}

function findCol(headers: string[], ...candidates: string[]): string | null {
  const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");
  for (const c of candidates) {
    const cn = norm(c);
    const found = headers.find(h => norm(h).includes(cn));
    if (found) return found;
  }
  return null;
}

function extractDates(rows: Row[], headers: string[]): { start: string; end: string } {
  const dateCol = findCol(headers, "fecha", "date", "periodo", "fecha valor");
  if (!dateCol) return { start: "", end: "" };

  const dates = rows
    .map(r => str(r[dateCol]))
    .filter(d => d.length > 0)
    .sort();

  return { start: dates[0] || "", end: dates[dates.length - 1] || "" };
}

// ─── Estado de Cuenta Parser ───
export function parseEstadoCuenta(rows: Row[], headers: string[], bank: string | null): EstadoCuentaData {
  const fechaCol = findCol(headers, "fecha", "date", "fecha valor", "fecha operacion");
  const conceptoCol = findCol(headers, "concepto", "descripcion", "detalle", "movimiento");
  const refCol = findCol(headers, "referencia", "ref", "numero");
  const cargoCol = findCol(headers, "cargo", "retiro", "debito", "debe");
  const abonoCol = findCol(headers, "abono", "deposito", "credito", "haber");
  const saldoCol = findCol(headers, "saldo", "balance");

  const transacciones: BankTransaction[] = rows.map(r => ({
    fecha: str(r[fechaCol || ""]),
    concepto: str(r[conceptoCol || ""]),
    referencia: str(r[refCol || ""]),
    cargo: num(r[cargoCol || ""]),
    abono: num(r[abonoCol || ""]),
    saldo: num(r[saldoCol || ""]),
  })).filter(t => t.fecha || t.concepto || t.cargo || t.abono);

  const totalCargos = transacciones.reduce((s, t) => s + t.cargo, 0);
  const totalAbonos = transacciones.reduce((s, t) => s + t.abono, 0);
  const saldos = transacciones.filter(t => t.saldo !== 0);
  const saldoInicial = saldos.length > 0 ? saldos[0].saldo : 0;
  const saldoFinal = saldos.length > 0 ? saldos[saldos.length - 1].saldo : 0;

  const { start, end } = extractDates(rows, headers);

  // Try to find account number and holder from first rows or headers
  const cuentaCol = findCol(headers, "cuenta", "account", "no cuenta", "numero de cuenta");
  const titularCol = findCol(headers, "titular", "nombre", "cliente", "razon social");

  return {
    tipo: "estado_cuenta",
    banco: bank || "Desconocido",
    cuenta: cuentaCol ? str(rows[0]?.[cuentaCol]) : "",
    titular: titularCol ? str(rows[0]?.[titularCol]) : "",
    periodoInicio: start,
    periodoFin: end,
    saldoInicial,
    saldoFinal,
    totalCargos,
    totalAbonos,
    transacciones,
  };
}

// ─── Estado de Resultados Parser ───
export function parseEstadoResultados(rows: Row[], headers: string[]): EstadoResultadosData {
  // Two modes: tabular (rows with concept + value columns) or structured (one row per concept)
  const conceptCol = findCol(headers, "concepto", "cuenta", "rubro", "partida", "descripcion");
  const valueCol = findCol(headers, "monto", "valor", "importe", "total", "saldo", "cantidad");

  let data: Record<string, number> = {};

  if (conceptCol && valueCol) {
    // Concept-value pairs
    for (const r of rows) {
      const concept = str(r[conceptCol]).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const value = num(r[valueCol]);
      data[concept] = value;
    }
  } else {
    // Try to read as flat key-value from headers
    for (const h of headers) {
      const hn = h.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      if (rows[0]) data[hn] = num(rows[0][h]);
    }
  }

  const find = (...keys: string[]): number => {
    for (const k of keys) {
      const kn = k.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      for (const [dk, dv] of Object.entries(data)) {
        if (dk.includes(kn)) return dv;
      }
    }
    return 0;
  };

  const ventas = find("ventas", "ingresos", "revenue", "ventas netas", "ingresos netos");
  const costoDeVentas = find("costo de ventas", "costo ventas", "cost of goods", "cogs");
  const utilidadBruta = find("utilidad bruta", "gross profit") || (ventas - costoDeVentas);
  const gastosOperativos = find("gastos operativos", "gastos de operacion", "operating expenses", "gastos administracion");
  const ebit = find("ebit", "utilidad operativa", "utilidad de operacion", "operating income") || (utilidadBruta - gastosOperativos);
  const gastosFinancieros = find("gastos financieros", "intereses", "interest expense");
  const impuestos = find("impuestos", "isr", "income tax", "provision impuestos");
  const utilidadNeta = find("utilidad neta", "net income", "resultado neto", "resultado del ejercicio") || (ebit - gastosFinancieros - impuestos);
  const otrosIngresos = find("otros ingresos", "other income");
  const otrosGastos = find("otros gastos", "other expenses");
  const depreciacion = find("depreciacion", "amortizacion", "depreciation");

  const { start, end } = extractDates(rows, headers);

  const empresaCol = findCol(headers, "empresa", "razon social", "compania", "company");

  return {
    tipo: "estado_resultados",
    empresa: empresaCol ? str(rows[0]?.[empresaCol]) : "",
    periodoInicio: start || "",
    periodoFin: end || "",
    ventas,
    costoDeVentas,
    utilidadBruta,
    gastosOperativos,
    ebit,
    gastosFinancieros,
    impuestos,
    utilidadNeta,
    otrosIngresos,
    otrosGastos,
    depreciacion,
  };
}

// ─── Balance General Parser ───
export function parseBalanceGeneral(rows: Row[], headers: string[]): BalanceGeneralData {
  const conceptCol = findCol(headers, "concepto", "cuenta", "rubro", "partida", "descripcion");
  const valueCol = findCol(headers, "monto", "valor", "importe", "total", "saldo", "cantidad");

  let data: Record<string, number> = {};

  if (conceptCol && valueCol) {
    for (const r of rows) {
      const concept = str(r[conceptCol]).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const value = num(r[valueCol]);
      data[concept] = value;
    }
  } else {
    for (const h of headers) {
      const hn = h.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      if (rows[0]) data[hn] = num(rows[0][h]);
    }
  }

  const find = (...keys: string[]): number => {
    for (const k of keys) {
      const kn = k.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      for (const [dk, dv] of Object.entries(data)) {
        if (dk.includes(kn)) return dv;
      }
    }
    return 0;
  };

  const efectivo = find("efectivo", "caja", "bancos", "cash", "efectivo y equivalentes");
  const cuentasPorCobrar = find("cuentas por cobrar", "clientes", "accounts receivable");
  const inventarios = find("inventarios", "inventario", "inventory");
  const otrosActivosCirculantes = find("otros activos circulantes", "other current assets");
  const activoCirculante = find("activo circulante", "current assets", "activos corrientes") || (efectivo + cuentasPorCobrar + inventarios + otrosActivosCirculantes);
  const activoFijo = find("activo fijo", "propiedad planta", "fixed assets", "inmuebles maquinaria", "activo no circulante");
  const otrosActivosNoCorrientes = find("otros activos no corrientes", "intangibles", "other non-current");
  const activosTotales = find("activo total", "activos totales", "total assets") || (activoCirculante + activoFijo + otrosActivosNoCorrientes);

  const cuentasPorPagar = find("cuentas por pagar", "proveedores", "accounts payable");
  const deudaCortoPlazo = find("deuda corto plazo", "prestamos corto plazo", "short term debt", "porcion circulante");
  const otrosPasivosCirculantes = find("otros pasivos circulantes", "other current liabilities");
  const pasivoCirculante = find("pasivo circulante", "current liabilities", "pasivos corrientes") || (cuentasPorPagar + deudaCortoPlazo + otrosPasivosCirculantes);
  const deudaLargoPlazo = find("deuda largo plazo", "prestamos largo plazo", "long term debt");
  const otrosPasivosNoCorrientes = find("otros pasivos no corrientes", "other non-current liabilities");
  const pasivoTotal = find("pasivo total", "pasivos totales", "total liabilities") || (pasivoCirculante + deudaLargoPlazo + otrosPasivosNoCorrientes);

  const capitalSocial = find("capital social", "share capital", "capital pagado");
  const utilidadesRetenidas = find("utilidades retenidas", "retained earnings", "resultados acumulados");
  const capitalContable = find("capital contable", "patrimonio", "stockholders equity", "total equity") || (capitalSocial + utilidadesRetenidas);

  const fechaCol = findCol(headers, "fecha", "date", "periodo", "al");
  const empresaCol = findCol(headers, "empresa", "razon social", "compania");

  return {
    tipo: "balance_general",
    empresa: empresaCol ? str(rows[0]?.[empresaCol]) : "",
    fecha: fechaCol ? str(rows[0]?.[fechaCol]) : "",
    efectivo,
    cuentasPorCobrar,
    inventarios,
    otrosActivosCirculantes,
    activoCirculante,
    activoFijo,
    otrosActivosNoCorrientes,
    activosTotales,
    cuentasPorPagar,
    deudaCortoPlazo,
    otrosPasivosCirculantes,
    pasivoCirculante,
    deudaLargoPlazo,
    otrosPasivosNoCorrientes,
    pasivoTotal,
    capitalSocial,
    utilidadesRetenidas,
    capitalContable,
  };
}
