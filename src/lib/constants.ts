export const PERSONAS = ['Virgilio', 'Moglie', 'Figlio', 'Famiglia', 'Da Dividere', 'Entrata'] as const;
export type Persona = typeof PERSONAS[number];

export const CATEGORIES = [
  'Abbigliamento', 'Abbonamenti Apple', 'Abbonamenti Giornali', 'Abbonamenti Streaming',
  'Acqua/Luce', 'Acquisto Vario', 'Altre Entrate', 'Altro Gigi', 'Assicurazione',
  'Assicurazione Auto', 'Bar e Caffè', 'Bar/Snack', 'Bollettini/Utenze',
  'Box Auto/Parcheggio', 'Carburante', 'Casa Santa Severa', 'Cinema/Spettacoli',
  'Commissioni Bancarie', 'Cura Personale', 'Farmacia', 'Fast Food', 'Fiori/Regali',
  'Food Delivery', 'Formazione Professionale', 'Gaming/App Online', 'Gas/Energia',
  'Hobby Nautica', 'Hosting/Domini Web', 'Internet/Telefono', 'Lavanderia',
  'Libri/Media', 'Manutenzione Casa', 'Monopattino (Lime)', 'Ottica/Vista',
  'Pedaggi/Telepass', 'Prelievo Contante', 'Reddito Lavoro', 'Regali/Aiuti Familiari',
  'Rimborso', 'Ristorante', 'Ristorazione/Bar', 'Scuola Figlio', 'Settimana Bianca',
  'Shopping', 'Software/Abbonamenti', 'Spedizione', 'Spesa Alimentare',
  'Spese Casa', 'Spese Lavoro', 'Spese Personali', 'Sport Figlio', 'Sport/Palestra',
  'Tabacchi/Edicola', 'Tasse (IRPEF/IMU)', 'Tasse Comunali', 'Taxi/Parcheggi',
  'Tecnologia', 'Telefonia/Smartphone', 'Tempo Libero', 'Trasporti',
  'Trasporto Pubblico', 'Viaggio Compleanno Gigi', 'Viaggi e Vacanze', 'Visite Mediche'
] as const;

export const FONTI = ['Intesa', 'BNL', 'PayPal', 'Carta Gigi'] as const;

export const PERSONA_COLORS: Record<string, string> = {
  'Virgilio': '#3498DB',
  'Moglie': '#E91E63',
  'Figlio': '#2ECC71',
  'Famiglia': '#F39C12',
  'Da Dividere': '#9B59B6',
  'Entrata': '#27AE60',
};

export const COLORS = {
  RED: '#C0392B',
  GREEN: '#27AE60',
  BLUE: '#3498DB',
  DARK_BLUE: '#1A3C5E',
  YELLOW: '#FFF2CC',
  PINK: '#FCE4EC',
  PURPLE: '#EDE7F6',
  ZEBRA: '#F2F7FC',
  CHART_RED: '#E74C3C',
  CHART_GREEN: '#27AE60',
  CHART_BLUE: '#3498DB',
};

export const DEFAULT_THRESHOLDS = [
  { categoria: 'Gaming/App Online', monthlyLimit: 50, isActive: true },
  { categoria: 'Bar e Caffè', monthlyLimit: 150, isActive: true },
  { categoria: 'Ristorante', monthlyLimit: 200, isActive: true },
  { categoria: 'Commissioni Bancarie', monthlyLimit: 30, isActive: true },
];
