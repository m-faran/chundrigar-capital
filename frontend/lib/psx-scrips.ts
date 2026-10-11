export type SectorCategory =
  | "Banks"
  | "Oil & Gas"
  | "Fertilizer"
  | "Cement"
  | "Tech"
  | "Power"
  | "Pharma"
  | "Automobile"
  | "Textile"
  | "Chemicals"
  | "Food & Consumer"
  | "Financials"
  | "Other";

export interface ScripMeta {
  name: string;
  sector: SectorCategory;
}

export const PSX_SCRIPS: Record<string, ScripMeta> = {
  // Commercial Banks
  ABL: { name: "Allied Bank Limited", sector: "Banks" },
  AKBL: { name: "Askari Bank Limited", sector: "Banks" },
  BAFL: { name: "Bank Alfalah Limited", sector: "Banks" },
  BAHL: { name: "Bank AL Habib Limited", sector: "Banks" },
  BML: { name: "BankIslami Pakistan Limited", sector: "Banks" },
  BOP: { name: "The Bank of Punjab", sector: "Banks" },
  FABL: { name: "Faysal Bank Limited", sector: "Banks" },
  HBL: { name: "Habib Bank Limited", sector: "Banks" },
  HMB: { name: "Habib Metropolitan Bank Ltd", sector: "Banks" },
  MCB: { name: "MCB Bank Limited", sector: "Banks" },
  MEBL: { name: "Meezan Bank Limited", sector: "Banks" },
  NBP: { name: "National Bank of Pakistan", sector: "Banks" },
  SCBPL: { name: "Standard Chartered Bank (Pak)", sector: "Banks" },
  UBL: { name: "United Bank Limited", sector: "Banks" },

  // Oil & Gas (Exploration, Refining & Marketing)
  OGDC: { name: "Oil & Gas Development Co", sector: "Oil & Gas" },
  PPL: { name: "Pakistan Petroleum Limited", sector: "Oil & Gas" },
  MARI: { name: "Mari Petroleum Company Ltd", sector: "Oil & Gas" },
  POL: { name: "Pakistan Oilfields Limited", sector: "Oil & Gas" },
  PSO: { name: "Pakistan State Oil Company", sector: "Oil & Gas" },
  APL: { name: "Attock Petroleum Limited", sector: "Oil & Gas" },
  ATRL: { name: "Attock Refinery Limited", sector: "Oil & Gas" },
  CNERGY: { name: "Cnergyico PK Limited", sector: "Oil & Gas" },
  SNGP: { name: "Sui Northern Gas Pipelines", sector: "Oil & Gas" },
  SSGC: { name: "Sui Southern Gas Company", sector: "Oil & Gas" },

  // Fertilizer
  ENGRO: { name: "Engro Corporation Limited", sector: "Fertilizer" },
  EFERT: { name: "Engro Fertilizers Limited", sector: "Fertilizer" },
  FFC: { name: "Fauji Fertilizer Company", sector: "Fertilizer" },
  FATIMA: { name: "Fatima Fertilizer Company", sector: "Fertilizer" },

  // Cement
  LUCK: { name: "Lucky Cement Limited", sector: "Cement" },
  DGKC: { name: "D.G. Khan Cement Co", sector: "Cement" },
  MLCF: { name: "Maple Leaf Cement Factory", sector: "Cement" },
  FCCL: { name: "Fauji Cement Company", sector: "Cement" },
  CHCC: { name: "Cherat Cement Company", sector: "Cement" },
  BWCL: { name: "Bestway Cement Limited", sector: "Cement" },
  KOHC: { name: "Kohat Cement Company", sector: "Cement" },
  PIOC: { name: "Pioneer Cement Limited", sector: "Cement" },
  POWER: { name: "Power Cement Limited", sector: "Cement" },
  THCCL: { name: "Thatta Cement Company", sector: "Cement" },

  // Technology & Telecommunications
  SYS: { name: "Systems Limited", sector: "Tech" },
  TRG: { name: "TRG Pakistan Limited", sector: "Tech" },
  AIRLINK: { name: "Air Link Communication", sector: "Tech" },
  PTC: { name: "Pakistan Telecommunication Co", sector: "Tech" },

  // Power Generation & Distribution
  HUBC: { name: "The Hub Power Company", sector: "Power" },
  KEL: { name: "K-Electric Limited", sector: "Power" },
  KAPCO: { name: "Kot Addu Power Company", sector: "Power" },
  NCPL: { name: "Nishat Chunian Power Limited", sector: "Power" },
  NPL: { name: "Nishat Power Limited", sector: "Power" },

  // Pharmaceuticals & Healthcare
  ABOT: { name: "Abbott Laboratories (Pakistan)", sector: "Pharma" },
  GLAXO: { name: "GlaxoSmithKline Pakistan", sector: "Pharma" },
  HALEON: { name: "Haleon Pakistan Limited", sector: "Pharma" },
  SEARL: { name: "The Searle Company Limited", sector: "Pharma" },
  AGP: { name: "AGP Limited", sector: "Pharma" },
  CPHL: { name: "Citi Pharma Limited", sector: "Pharma" },
  HINOON: { name: "Highnoon Laboratories", sector: "Pharma" },
  SHFA: { name: "Shifa International Hospitals", sector: "Pharma" },

  // Automobile & Parts
  INDU: { name: "Indus Motor Company", sector: "Automobile" },
  HCAR: { name: "Honda Atlas Cars (Pakistan)", sector: "Automobile" },
  MTL: { name: "Millat Tractors Limited", sector: "Automobile" },
  ATLH: { name: "Atlas Honda Limited", sector: "Automobile" },
  SAZEW: { name: "Sazgar Engineering Works", sector: "Automobile" },
  GAL: { name: "Ghandhara Automobiles Ltd", sector: "Automobile" },
  GHNI: { name: "Ghandhara Industries Ltd", sector: "Automobile" },
  THALL: { name: "Thal Limited", sector: "Automobile" },
  SRVI: { name: "Service Industries Limited", sector: "Automobile" },

  // Textile Composite & Spinning
  ILP: { name: "Interloop Limited", sector: "Textile" },
  NML: { name: "Nishat Mills Limited", sector: "Textile" },
  KTML: { name: "Kohinoor Textile Mills", sector: "Textile" },
  GADT: { name: "Gadoon Textile Mills", sector: "Textile" },
  IBFL: { name: "Ibrahim Fibres Limited", sector: "Textile" },
  IMAGE: { name: "Image Pakistan Limited", sector: "Textile" },
  BNWM: { name: "Bannu Woollen Mills Ltd", sector: "Textile" },
  YOUW: { name: "Yousaf Weaving Mills", sector: "Textile" },

  // Chemicals
  LCI: { name: "Lucky Core Industries Ltd", sector: "Chemicals" },
  LOTCHEM: { name: "Lotte Chemical Pakistan", sector: "Chemicals" },

  // Food & Personal Care / Consumer
  NESTLE: { name: "Nestle Pakistan Limited", sector: "Food & Consumer" },
  COLG: { name: "Colgate-Palmolive (Pakistan)", sector: "Food & Consumer" },
  NATF: { name: "National Foods Limited", sector: "Food & Consumer" },
  FFL: { name: "Fauji Foods Limited", sector: "Food & Consumer" },
  MUREB: { name: "Murree Brewery Company", sector: "Food & Consumer" },
  UPFL: { name: "Unilever Pakistan Foods", sector: "Food & Consumer" },
  SSOM: { name: "SS Oil Mills Limited", sector: "Food & Consumer" },
  PAKT: { name: "Pakistan Tobacco Company", sector: "Food & Consumer" },

  // Financials, REIT & Insurance
  AICL: { name: "Adamjee Insurance Co", sector: "Financials" },
  AHCL: { name: "Arif Habib Corporation", sector: "Financials" },
  PSX: { name: "Pakistan Stock Exchange Ltd", sector: "Financials" },
  DCR: { name: "Dolmen City REIT", sector: "Financials" },
  TPLRF1: { name: "TPL Properties REIT Fund", sector: "Financials" },
  JVDC: { name: "Javedan Corporation Ltd", sector: "Financials" },
  FHAM: { name: "First Habib Modaraba", sector: "Financials" },
  HGFA: { name: "Habib Metropolitan Modaraba", sector: "Financials" },
  PGLC: { name: "Pak Gulf Leasing Company", sector: "Financials" },

  // Other / Engineering / Materials
  ISL: { name: "International Steels Ltd", sector: "Other" },
  INIL: { name: "International Industries Ltd", sector: "Other" },
  PAEL: { name: "Pak Elektron Limited", sector: "Other" },
  PKGS: { name: "Packages Limited", sector: "Other" },
  TGL: { name: "Tariq Glass Industries", sector: "Other" },
  GHGL: { name: "Ghani Glass Limited", sector: "Other" },
  JDWS: { name: "JDW Sugar Mills Limited", sector: "Other" },
  PIBTL: { name: "Pak Intl Bulk Terminal", sector: "Other" },
  PSEL: { name: "Pakistan Services Limited", sector: "Other" },
};

/**
 * Normalizes ticker symbols by stripping PSX corporate action suffix tags
 * (e.g. "OGDCXD" -> "OGDC", "ENGROH" -> "ENGRO", "LUCKXD" -> "LUCK")
 * and returns the official company metadata.
 */
export function getScripMeta(symbol: string): ScripMeta {
  if (!symbol) return { name: "", sector: "Other" };

  const exact = PSX_SCRIPS[symbol];
  if (exact) return exact;

  // Clean trailing PSX corporate action suffixes (XD, XR, XB, H)
  const cleaned = symbol
    .replace(/(XD|XR|XB|XBC)$/i, "")
    .replace(/(H|R|B)$/i, "");

  const match = PSX_SCRIPS[cleaned];
  if (match) return match;

  return {
    name: symbol,
    sector: "Other",
  };
}
