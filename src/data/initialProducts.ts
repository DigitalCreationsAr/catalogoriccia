import { Product, Category, AdminSettings } from '../types';

export const INITIAL_CATEGORIES: Category[] = [
  { id: 'cat-all', name: 'Todas', slug: 'todas' },
  { id: 'cat-invitaciones', name: 'Invitaciones Digitales', description: 'Invitaciones interactivas para bodas, 15 años, cumpleaños, bautismos y celebraciones.', slug: 'invitaciones' },
  { id: 'cat-agendas', name: 'Agendas Digitales', description: 'Planners interactivos hipervinculados para GoodNotes, Notability y tablets.', slug: 'agendas' },
  { id: 'cat-cuadernos', name: 'Cuadernos & Planners', description: 'Hojas punteadas, cuadriculadas y planners temáticos sin fechas fijas.', slug: 'cuadernos' },
  { id: 'cat-plantillas', name: 'Plantillas de Diseño', description: 'Templates editables en Canva y vectores para creadores y marcas.', slug: 'plantillas' },
  { id: 'cat-eventos', name: 'Bodas & Eventos', description: 'Organizadores románticos para matrimonios, recepciones y celebraciones.', slug: 'eventos' },
  { id: 'cat-stickers', name: 'Stickers & Kits', description: 'Elementos ilustrados botánicos, washis digitales y widgets decorativos.', slug: 'stickers' },
  { id: 'cat-freebies', name: 'Freebies & Imprimibles', description: 'Recursos, guías y stickers descargables de regalo.', slug: 'freebies' },
];

export const INITIAL_PRODUCTS: Product[] = [];

export const INITIAL_SETTINGS: AdminSettings = {
  whatsappNumber: '+5491123456789', // Editable in admin panel
  whatsappMessageTemplate: '¡Hola Oriccia! Me interesa adquirir *{productName}* ({price} {currency}). ¿Podrías indicarme los métodos de pago disponibles?',
  spreadsheetId: '1oHNcbXnSOKVdzLEucmrr5WVlYbONrIlBzJVt36ztXws',
  spreadsheetName: 'Oriccia - Catálogo e Inventario Digital',
  spreadsheetUrl: 'https://docs.google.com/spreadsheets/d/1oHNcbXnSOKVdzLEucmrr5WVlYbONrIlBzJVt36ztXws/edit',
  authorizedEmails: ['rara.digitalcreations@gmail.com'],
  lastSyncTime: null,
};
