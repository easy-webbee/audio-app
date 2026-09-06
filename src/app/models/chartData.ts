export interface StockData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  MA5: number;
  MA120: number;
  MA10: number;
  MA20: number;
  MA50: number;
  MA100: number;
  MA200: number;
  MA300?: number;
  RSI: number;
  StochRSI_K: number;
  StochRSI_D: number;
  MACDLine: number;
  SignalLine: number;
  divergence: number;
  MACDDivergence: any;
  MA50_Angle?: any;
  MA20_Angle?: any;
}
export interface StockQuoteFMP {
  symbol: string;
  price: number;
  name: string;
  change: number;
  changesPercentage: number;
  exchange: string;
}

export interface CompanyProfile {
  symbol: string;
  name: string;
  marketCap: number;
}

interface Watchlist {
  [key: string]: {
    BULL: string[];
    BEAR: string[];
  };
}

export const watchlist = [
  'AAL',
  'AAPL',
  'AMD',
  'AMZN',
  'AVGO',
  'BABA',
  'BULL',
  'CNC',
  'COIN',
  'CRCL',
  'CRWD',
  'CRWV',
  'DELL',
  'DJT',
  'ETOR',
  'FIG',
  'FUTU',
  'GLW',
  'GOOGL',
  'HIMS',
  'HOOD',
  'INTC',
  'ISRG',
  'LCID',
  'LULU',
  'MARA',
  'META',
  'MRVL',
  'MSFT',
  'MSTR',
  'MU',
  'NBIS',
  'NFLX',
  'NOW',
  'NVDA',
  'OKLO',
  'ORCL',
  'PDD',
  'PLTR',
  'QCOM',
  'QQQ',
  'RDDT',
  'RIVN',
  'SMCI',
  'SNAP',
  'SOXX',
  'SPY',
  'TSLA',
  'TSM',
  'TTD',
  'UBER',
  'UNH',
  'VRT',
  'XOM',
  'SPCX',
  'GLXY',
  'ADBE',
  'IBM',
  'RBLX',
  'IREN',
  'SOFI',
  'NU',
  'FN'
];

export const watchlistBB: Watchlist = {
  SMCI: { BULL: ['SMCX', 'SMCL'], BEAR: ['SMCZ'] },
  TSLA: {
    BULL: ['TSLL', 'TSLR', 'TSL', 'TSLI'],
    BEAR: ['TSLQ', 'TSLS', 'TSDD'],
  },
  MSTR: { BULL: ['MSTX', 'MSTU', 'MSTR'], BEAR: ['MSTZ', 'MSDD'] },
  SOXX: { BULL: ['SOXL'], BEAR: ['SOXS'] },
  CRWV: { BULL: ['CWVX'], BEAR: ['CORD'] },
  XOM: { BULL: ['XOMX'], BEAR: ['XOMZ'] },
  AAPL: { BULL: ['AAPU', 'AAPB', 'AAPX'], BEAR: ['AAPD'] },
  NVDA: { BULL: ['NVDL', 'NVDB'], BEAR: ['NVD'] },
  AMZN: { BULL: ['AMZU', 'AMZZ'], BEAR: ['AMZD'] },
  MSFT: { BULL: ['MSFU', 'MSFL'], BEAR: ['MSFD'] },
  QQQ: { BULL: ['TQQQ', 'QLD'], BEAR: ['SQQQ', 'QID', 'PSQ'] },
  SPY: { BULL: ['SSO', 'UPRO'], BEAR: ['SH', 'SPXU', 'SDS'] },
  AMD: { BULL: ['AMDL'], BEAR: ['DAMD'] },
  PLTR: { BULL: ['PLTD', 'PLTG', 'PLTU', 'PTIR', 'PLTA'], BEAR: ['PLTZ'] },
  COIN: { BULL: ['CONL', 'COIA'], BEAR: ['CONI'] },
  NBIS: { BULL: ['NBIL', 'NEBX', 'NBIG'], BEAR: ['NBIZ'] },
  QCOM: { BULL: ['QCML', 'QCMU'], BEAR: ['QCMD'] },
  TSM: { BULL: ['TSMU', 'TSMX'], BEAR: ['TSMZ', 'STSM'] },
  SPCX: {
    BULL: ['SPCH', 'SPCU', 'LOFF', 'SPAL', 'SPCF'],
    BEAR: ['SSPC', 'SPCQ', 'SPCG'],
  },
  NFLX: { BULL: ['NFXL', 'NFLU'], BEAR: ['NFXS'] },
  DJT: { BULL: ['DJTU'], BEAR: [] },
  TTD: { BULL: ['TTDU'], BEAR: [] },
  INTC: { BULL: ['INTW'], BEAR: [] },
  UNH: { BULL: ['UNHG'], BEAR: [] },
  AVGO: { BULL: ['AVGX', 'AVGU'], BEAR: [] },
  ORCL: { BULL: ['ORCX'], BEAR: [] },
  BABA: { BULL: ['BABX'], BEAR: [] },
  BULL: { BULL: ['BULX'], BEAR: [] },
  CRWD: { BULL: ['CRWL'], BEAR: [] },
  DELL: { BULL: ['DLLL'], BEAR: [] },
  ETOR: { BULL: ['ETRL'], BEAR: [] },
  GOOGL: { BULL: ['GOU'], BEAR: [] },
  ISRG: { BULL: ['ISUL'], BEAR: [] },
  LCID: { BULL: ['LCDL'], BEAR: [] },
  MARA: { BULL: ['MRAL'], BEAR: [] },
  META: { BULL: ['FBL', 'METU'], BEAR: [] },
  MRVL: { BULL: ['MVLL', 'MRVU'], BEAR: [] },
  MU: { BULL: ['MULL'], BEAR: [] },
  NOW: { BULL: ['NOWL'], BEAR: [] },
  PDD: { BULL: ['PDDL'], BEAR: [] },
  RDDT: { BULL: ['RDTL'], BEAR: [] },
  RIVN: { BULL: ['RVNL'], BEAR: [] },
  UBER: { BULL: ['UBRL'], BEAR: [] },
  VRT: { BULL: ['VRTL'], BEAR: [] },
  CRCL: { BULL: ['CRCA'], BEAR: [] },
  SNAP: { BULL: ['SNAG'], BEAR: [] },
  CNC: { BULL: ['CNCG'], BEAR: [] },
  HIMS: { BULL: ['HIMZ'], BEAR: [] },
  FUTU: { BULL: ['FUTG'], BEAR: [] },
  OKLO: { BULL: ['OKLL'], BEAR: [] },
  HOOD: { BULL: ['ROBN'], BEAR: [] },
  FIG: { BULL: ['FIGG'], BEAR: [] },
  LULU: { BULL: ['LULG'], BEAR: [] },
  GLW: { BULL: ['GLWG'], BEAR: [] },
  AAL: { BULL: ['AALG'], BEAR: [] },
  GLXY: { BULL: ['GLXU', 'GLGG'], BEAR: [] },
  ADBE: { BULL: ['ADBG', 'ADBU'], BEAR: [] },
  IBM: { BULL: ['IBX'], BEAR: [] },
  RBLX: { BULL: ['RBLU'], BEAR: [] },
  IREN: { BULL: ['IRE','IREX','IREG'], BEAR: ['IREZ'] },
  SOFI: { BULL: ['SOFX','SOFA'], BEAR: [] },
  NU: { BULL: ['NUG',], BEAR: [] },
  FN: { BULL: ['FNG',], BEAR: [] },
};
