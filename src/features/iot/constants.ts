// Metadata for all MQTT sensor fields — labels, units, optional alert thresholds.

export interface FieldMeta {
  label: string;
  unit: string;
  group: 'ar' | 'solo' | 'agua' | 'vibracao';
  alertHigh?: number; // alert if value > this
  alertLow?: number;  // alert if value < this
  decimals?: number;
}

export const FIELD_META: Record<string, FieldMeta> = {
  // ─── Ar (air) ───────────────────────────────────────────────────────
  ar_temperatura:          { label: 'Temperatura do Ar',        unit: '°C',    group: 'ar',       alertHigh: 38,   decimals: 1 },
  ar_humidade:             { label: 'Humidade Relativa do Ar',  unit: '%',     group: 'ar',       alertLow:  15,   alertHigh: 95, decimals: 1 },
  ar_luz_solar:            { label: 'Luz Solar',                unit: 'lux',   group: 'ar',       decimals: 0 },
  ar_co2:                  { label: 'Dióxido de Carbono',       unit: 'ppm',   group: 'ar',       alertHigh: 1000, decimals: 0 },
  ar_intensidade_uv:       { label: 'Intensidade UV',           unit: 'mW/m²', group: 'ar',       decimals: 2 },
  ar_indice_uv:            { label: 'Índice UV',                unit: '',      group: 'ar',       alertHigh: 8,    decimals: 1 },
  ar_pressao_atmosferica:  { label: 'Pressão Atmosférica',      unit: 'hPa',   group: 'ar',       decimals: 1 },

  // ─── Solo (soil) ────────────────────────────────────────────────────
  solo_temperatura:        { label: 'Temperatura do Solo',      unit: '°C',    group: 'solo',     decimals: 1 },
  solo_humidade:           { label: 'Humidade do Solo',         unit: '%',     group: 'solo',     alertLow: 15,    decimals: 1 },
  solo_condutividade:      { label: 'Condutividade do Solo',    unit: 'µS/cm', group: 'solo',     alertHigh: 2000, decimals: 0 },
  solo_ph:                 { label: 'pH do Solo',               unit: '',      group: 'solo',     alertLow: 5.5,   alertHigh: 7.5, decimals: 1 },
  solo_potassio:           { label: 'Potássio no Solo',         unit: 'mg/L',  group: 'solo',     decimals: 2 },
  solo_fosforo:            { label: 'Fósforo no Solo',          unit: 'mg/L',  group: 'solo',     decimals: 2 },
  solo_azoto:              { label: 'Azoto no Solo',            unit: 'mg/L',  group: 'solo',     decimals: 2 },
  solo_quantidade_chuva:   { label: 'Quantidade de Chuva',      unit: 'mm',    group: 'solo',     decimals: 1 },

  // ─── Água (water) ───────────────────────────────────────────────────
  agua_cloro_residual:     { label: 'Cloro Residual',           unit: 'mg/L',  group: 'agua',     alertHigh: 0.5,  decimals: 2 },
  agua_ph:                 { label: 'pH da Água',               unit: '',      group: 'agua',     alertLow: 6.5,   alertHigh: 9.5, decimals: 1 },
  agua_turvacao:           { label: 'Turvação',                 unit: 'NTU',   group: 'agua',     alertHigh: 4,    decimals: 2 },
  agua_nivel:              { label: 'Nível de Água',            unit: 'm',     group: 'agua',     decimals: 2 },

  // ─── Vibração (t1) ──────────────────────────────────────────────────
  solo_vibracao_x:         { label: 'Vibração X',               unit: 'g',     group: 'vibracao', decimals: 3 },
  solo_vibracao_y:         { label: 'Vibração Y',               unit: 'g',     group: 'vibracao', decimals: 3 },
  solo_vibracao_z:         { label: 'Vibração Z',               unit: 'g',     group: 'vibracao', decimals: 3 },
  solo_presenca_chuva:     { label: 'Presença de Chuva',        unit: '',      group: 'vibracao' },
};

export const PARCELA_LABELS: Record<string, string> = {
  point1: 'Rio Torto',
  point2: 'Padrela',
  point3: 'Praia Fluvial de Rio Torto',
  all:    'Todas as Parcelas',
};

export const TOPICO_LABELS: Record<string, string> = {
  t1: 'Vibração e Chuva (por segundo)',
  t2: 'Ar, Solo e Água (30 min)',
};

export const OPERADOR_LABELS: Record<string, string> = {
  '>':  'maior que',
  '<':  'menor que',
  '>=': 'maior ou igual a',
  '<=': 'menor ou igual a',
  '=':  'igual a',
};

export const FUNCAO_LABELS: Record<string, string> = {
  avg: 'Média',
  sum: 'Soma',
  min: 'Mínimo',
  max: 'Máximo',
};

// Fields available per parcela+topico combination
export const FIELDS_BY_PARCELA_TOPICO: Record<string, string[]> = {
  'point1:t1': ['solo_vibracao_x', 'solo_vibracao_y', 'solo_vibracao_z', 'solo_presenca_chuva'],
  'point2:t1': ['solo_vibracao_x', 'solo_vibracao_y', 'solo_vibracao_z', 'solo_presenca_chuva'],
  'point1:t2': ['ar_temperatura', 'ar_humidade', 'ar_luz_solar', 'ar_co2', 'ar_intensidade_uv', 'ar_indice_uv', 'ar_pressao_atmosferica', 'solo_temperatura', 'solo_humidade', 'solo_condutividade', 'solo_ph', 'solo_potassio', 'solo_fosforo', 'solo_azoto', 'solo_quantidade_chuva'],
  'point2:t2': ['ar_temperatura', 'ar_humidade', 'ar_luz_solar', 'ar_co2', 'ar_intensidade_uv', 'ar_indice_uv', 'ar_pressao_atmosferica', 'solo_temperatura', 'solo_humidade', 'solo_condutividade', 'solo_ph', 'solo_potassio', 'solo_fosforo', 'solo_azoto', 'solo_quantidade_chuva'],
  'point3:t2': ['agua_cloro_residual', 'agua_ph', 'agua_turvacao', 'agua_nivel'],
  'all:t1':    ['solo_vibracao_x', 'solo_vibracao_y', 'solo_vibracao_z', 'solo_presenca_chuva'],
  'all:t2':    ['ar_temperatura', 'ar_humidade', 'ar_luz_solar', 'ar_co2', 'ar_intensidade_uv', 'ar_indice_uv', 'ar_pressao_atmosferica', 'solo_temperatura', 'solo_humidade', 'solo_condutividade', 'solo_ph', 'solo_potassio', 'solo_fosforo', 'solo_azoto', 'solo_quantidade_chuva', 'agua_cloro_residual', 'agua_ph', 'agua_turvacao', 'agua_nivel'],
};
