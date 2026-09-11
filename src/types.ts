export interface Product {
  id: string;
  name: string;
  description: string;
  photoUrl: string;
  gallery?: string[];
  price: number;
  currency: string;
  category: string;
  tags: string[];
  features: string[];
  demoUrl: string;
  eventType: string; // e.g., "Planificación Diaria", "Bodas & Eventos", "Emprendimiento", "Académico", "Finanzas"
  status: 'activo' | 'borrador';
  updatedAt: string;
  isFree?: boolean;
  downloadUrl?: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  slug: string;
}

export interface AdminSettings {
  whatsappNumber: string; // e.g. "5491123456789"
  whatsappMessageTemplate: string; // "Hola Oriccia! Me interesa adquirir..."
  spreadsheetId: string;
  spreadsheetName: string;
  spreadsheetUrl: string;
  authorizedEmails: string[];
  lastSyncTime: string | null;
  logoUrl?: string; // Custom logo image URL or base64 data
}

export interface CustomerInquiry {
  id: string;
  productId: string;
  productName: string;
  productPrice: number;
  currency: string;
  date: string;
  status: 'Iniciada por WhatsApp' | 'Concretada' | 'Pendiente';
}
