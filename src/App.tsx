import React, { useState, useEffect, useMemo } from 'react';
import { Product, Category, AdminSettings } from './types';
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES, INITIAL_SETTINGS } from './data/initialProducts';
import { initAuth } from './lib/firebase';
import { logWhatsAppInquiry, fetchPublicProductsFromSheet } from './lib/googleSheets';
import { User } from 'firebase/auth';
import { Navbar } from './components/Navbar';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { InteractiveDemoModal } from './components/InteractiveDemoModal';
import { AdminModal } from './components/AdminModal';
import { OricciaLogo } from './components/OricciaLogo';
import { Heart, Filter, ChevronRight, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  // Local persistence for catalog & settings
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('oriccia_products');
    if (saved) {
      try {
        const parsed: Product[] = JSON.parse(saved);
        // Exclude default placeholder sample products so site starts completely clean
        const sampleIds = new Set(['oriccia-001', 'oriccia-002', 'oriccia-003', 'oriccia-004', 'oriccia-005', 'oriccia-006']);
        const cleaned = parsed.filter((p) => !sampleIds.has(p.id));
        if (cleaned.length !== parsed.length) {
          localStorage.setItem('oriccia_products', JSON.stringify(cleaned));
          return cleaned;
        }
        return parsed;
      } catch (e) {
        console.error('Error loading saved products', e);
      }
    }
    return INITIAL_PRODUCTS;
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('oriccia_categories');
    if (saved) {
      try {
        const parsed: Category[] = JSON.parse(saved);
        const hasInvitaciones = parsed.some(
          (c) => c.slug === 'invitaciones' || c.name.toLowerCase() === 'invitaciones digitales'
        );
        if (!hasInvitaciones) {
          const invCat: Category = {
            id: 'cat-invitaciones',
            name: 'Invitaciones Digitales',
            description: 'Invitaciones interactivas para bodas, 15 años, cumpleaños, bautismos y celebraciones.',
            slug: 'invitaciones',
          };
          return [parsed[0], invCat, ...parsed.slice(1)];
        }
        return parsed;
      } catch (e) {
        console.error('Error loading saved categories', e);
      }
    }
    return INITIAL_CATEGORIES;
  });

  const [settings, setSettings] = useState<AdminSettings>(() => {
    const saved = localStorage.getItem('oriccia_settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (!parsed.spreadsheetId && INITIAL_SETTINGS.spreadsheetId) {
          parsed.spreadsheetId = INITIAL_SETTINGS.spreadsheetId;
        }
        if (!parsed.spreadsheetUrl && INITIAL_SETTINGS.spreadsheetUrl) {
          parsed.spreadsheetUrl = INITIAL_SETTINGS.spreadsheetUrl;
        }
        return parsed;
      } catch (e) {
        console.error('Error loading saved settings', e);
      }
    }
    return INITIAL_SETTINGS;
  });

  // Auth state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoadingPublicCatalog, setIsLoadingPublicCatalog] = useState(false);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('todas');
  const [selectedEventType, setSelectedEventType] = useState('todos');

  // Modals state
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [demoProduct, setDemoProduct] = useState<Product | null>(null);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  // Auto-sync products from public Google Sheet on load (for incognito, new visitors, and mobile)
  useEffect(() => {
    const sheetId =
      settings.spreadsheetId || INITIAL_SETTINGS.spreadsheetId || '1oHNcbXnSOKVdzLEucmrr5WVlYbONrIlBzJVt36ztXws';
    if (!sheetId) return;

    setIsLoadingPublicCatalog(true);
    fetchPublicProductsFromSheet(sheetId)
      .then((res) => {
        if (res.success && res.data && res.data.length > 0) {
          setProducts(res.data);
          try {
            localStorage.setItem('oriccia_products', JSON.stringify(res.data));
          } catch (storageErr) {
            console.warn('Could not save fetched products to localStorage', storageErr);
          }
        }
      })
      .catch((err) => {
        console.warn('Could not auto-sync catalog from public sheet:', err);
      })
      .finally(() => {
        setIsLoadingPublicCatalog(false);
      });
  }, [settings.spreadsheetId]);

  // Initialize Firebase Auth listener
  useEffect(() => {
    const unsubscribe = initAuth(
      (user, accessToken) => {
        setCurrentUser(user);
        if (accessToken) setToken(accessToken);
      },
      () => {
        setCurrentUser(null);
        setToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('oriccia_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('oriccia_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('oriccia_settings', JSON.stringify(settings));
  }, [settings]);

  // Category is Invitaciones Digitales
  const isInvitacionesCategoryActive = useMemo(() => {
    if (selectedCategory === 'invitaciones') return true;
    const cat = categories.find((c) => c.slug === selectedCategory);
    return cat?.name.toLowerCase() === 'invitaciones digitales';
  }, [selectedCategory, categories]);

  // Reset event filter on category change
  useEffect(() => {
    setSelectedEventType('todos');
  }, [selectedCategory]);

  // Event types options for Invitaciones Digitales
  const eventTypes = useMemo(() => {
    return ['todos', 'Boda', '15 años', 'cumpleaños', 'Bautismo', 'baby shower', 'Etc'];
  }, []);

  // Filtered products list
  const filteredProducts = useMemo(() => {
    return products.filter((prod) => {
      // Must be active for public clients (or admin preview)
      if (prod.status === 'borrador') return false;

      // Category filter
      if (selectedCategory !== 'todas') {
        const catObj = categories.find((c) => c.slug === selectedCategory);
        if (catObj && prod.category.toLowerCase() !== catObj.name.toLowerCase()) {
          return false;
        }
      }

      // Event type filter (applies to Invitaciones Digitales)
      if (isInvitacionesCategoryActive && selectedEventType !== 'todos') {
        if (prod.eventType?.toLowerCase() !== selectedEventType.toLowerCase()) {
          return false;
        }
      }

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchName = prod.name.toLowerCase().includes(query);
        const matchDesc = prod.description.toLowerCase().includes(query);
        const matchCat = prod.category.toLowerCase().includes(query);
        const matchEvent = prod.eventType.toLowerCase().includes(query);
        const matchTags = prod.tags.some((t) => t.toLowerCase().includes(query));
        const matchFeatures = prod.features.some((f) => f.toLowerCase().includes(query));

        if (!matchName && !matchDesc && !matchCat && !matchEvent && !matchTags && !matchFeatures) {
          return false;
        }
      }

      return true;
    });
  }, [products, categories, selectedCategory, selectedEventType, searchQuery]);

  // WhatsApp order dispatch handler
  const handleOrderWhatsApp = (product: Product, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    // Clean phone number
    const cleanPhone = settings.whatsappNumber.replace(/[^0-9]/g, '');

    // Format message
    let message = settings.whatsappMessageTemplate || '¡Hola Oriccia! Me interesa adquirir *{productName}* ({price} {currency}). ¿Podrías indicarme los métodos de pago disponibles?';
    message = message
      .replace('{productName}', product.name)
      .replace('{price}', product.price.toFixed(2))
      .replace('{currency}', product.currency);

    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;

    // Log to Google Sheets if spreadsheet is connected
    if (token && settings.spreadsheetId) {
      logWhatsAppInquiry(token, settings.spreadsheetId, product);
    }

    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#242926] flex flex-col selection:bg-[#1C3B2B] selection:text-[#FAF7F2]">
      {/* Top Navbar */}
      <Navbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        whatsappNumber={settings.whatsappNumber}
        logoUrl={settings.logoUrl}
      />

      {/* Main Catalog View */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        {/* Categories Bar (delicate pills) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-[0.15em] text-[#6B726C] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C48B8B]" />
              Explorar por Categoría
            </h2>
            <span className="text-xs text-[#8C948D] font-serif italic">
              {filteredProducts.length} {filteredProducts.length === 1 ? 'artículo' : 'artículos'}
            </span>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            {categories.map((cat) => {
              const isActive = selectedCategory === cat.slug;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-150 border ${
                    isActive
                      ? 'bg-[#1C3B2B] text-[#FAF7F2] border-[#1C3B2B] shadow-xs'
                      : 'bg-white text-[#4A524C] border-[#E8E1D7] hover:bg-[#FAF4F2] hover:border-[#C48B8B]/40 hover:text-[#664646]'
                  }`}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>

          {/* Secondary Event Type Filter (solo para Invitaciones Digitales) */}
          {isInvitacionesCategoryActive && (
            <div className="flex items-center gap-2 overflow-x-auto text-xs py-1">
              <span className="text-[11px] text-[#8C948D] flex items-center gap-1 shrink-0">
                <Filter className="w-3 h-3 text-[#C48B8B]" />
                Tipo de evento:
              </span>
              {eventTypes.map((evt) => (
                <button
                  key={evt}
                  onClick={() => setSelectedEventType(evt)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] transition-colors shrink-0 ${
                    selectedEventType === evt
                      ? 'bg-[#FAF2F2] text-[#7A4B4B] font-semibold border border-[#EEDCDC]'
                      : 'text-[#6B726C] hover:text-[#7A4B4B] hover:bg-[#FAF4F2]'
                  }`}
                >
                  {evt === 'todos' ? 'Todos' : evt}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Cards Grid (Small, delicate, romantic) */}
        {isLoadingPublicCatalog && products.length === 0 ? (
          <div className="text-center py-20 px-6 bg-white/70 rounded-2xl border border-[#E8E1D7] max-w-sm mx-auto space-y-3.5 shadow-2xs">
            <div className="w-7 h-7 border-2 border-[#1C3B2B]/20 border-t-[#1C3B2B] rounded-full animate-spin mx-auto" />
            <h3 className="text-sm font-semibold text-[#1C3B2B] font-romantic">
              Cargando catálogo de productos...
            </h3>
            <p className="text-xs text-[#8C948D]">
              Obteniendo los artículos más recientes desde tu planilla
            </p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 px-6 bg-white/80 rounded-2xl border border-[#E8E1D7] max-w-lg mx-auto space-y-3.5 shadow-2xs">
            <span className="text-3xl">✨</span>
            <h3 className="text-lg font-semibold text-[#1C3B2B] font-romantic">
              Catálogo Listo para Publicar
            </h3>
            <p className="text-xs text-[#6B726C] max-w-sm mx-auto leading-relaxed">
              El sitio está listo y limpio para tus productos reales o recursos gratuitos. Puedes comenzar a agregarlos desde el panel de administración.
            </p>
            <div className="pt-1">
              <button
                onClick={() => setIsAdminModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1C3B2B] text-[#FAF7F2] text-xs font-semibold hover:bg-[#152D1F] transition-all shadow-xs"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Abrir Panel de Administración</span>
              </button>
            </div>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 sm:gap-6">
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((prod) => (
                <ProductCard
                  key={prod.id}
                  product={prod}
                  onSelect={(p) => setSelectedProduct(p)}
                  onOrderWhatsApp={(p, e) => handleOrderWhatsApp(p, e)}
                />
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="text-center py-16 px-4 bg-white/70 rounded-2xl border border-[#E8E1D7] max-w-md mx-auto space-y-3">
            <span className="text-3xl">🌿</span>
            <h3 className="text-base font-semibold text-[#1C3B2B] font-romantic">
              No se encontraron artículos
            </h3>
            <p className="text-xs text-[#6B726C]">
              Prueba cambiando la categoría seleccionada o los términos de búsqueda.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('todas');
                setSelectedEventType('todos');
                setSearchQuery('');
              }}
              className="px-4 py-2 rounded-lg bg-[#1C3B2B] text-[#FAF7F2] text-xs font-medium hover:bg-[#152D1F] transition-colors"
            >
              Restablecer filtros
            </button>
          </div>
        )}

        {/* Brand Banner / Romantic Note */}
        <section className="bg-white rounded-2xl border border-[#E8E1D7] p-8 sm:p-10 text-center space-y-3.5 max-w-3xl mx-auto shadow-2xs">
          <div className="w-10 h-10 rounded-full bg-[#FAF4F4] border border-[#EEDCDC] flex items-center justify-center mx-auto text-[#C48B8B] shadow-2xs">
            <Heart className="w-4 h-4 fill-[#C48B8B]/25" />
          </div>
          <h3 className="text-2xl sm:text-3xl text-[#1C3B2B] font-romantic">
            Atención Personalizada en Oriccia
          </h3>
          <p className="text-xs sm:text-sm text-[#5A635B] leading-relaxed max-w-xl mx-auto">
            ¿Buscas una plantilla personalizada para tu boda, negocio o evento especial? Contáctanos de forma directa a través de WhatsApp y diseñamos la papelería digital ideal para ti.
          </p>
          <div className="pt-2">
            <a
              href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent('¡Hola Oriccia! Me gustaría consultar por un diseño personalizado.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1C3B2B] text-[#FAF7F2] text-xs font-semibold hover:bg-[#152D1F] transition-all shadow-xs"
            >
              <span>Escribir al WhatsApp</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E8E1D7] bg-[#F5EFEB] py-10 px-4 sm:px-6 lg:px-8 mt-12 text-center space-y-4">
        <div className="flex flex-col items-center">
          <img
            src={settings.logoUrl || '/assets/images/logo.png'}
            alt="Oriccia"
            className="h-7 w-auto max-w-[180px] object-contain mb-1 opacity-90 hover:opacity-100 transition-opacity"
            onError={(e) => {
              // If image fails, hide it and let text or fallback show
              (e.target as HTMLElement).style.display = 'none';
            }}
            referrerPolicy="no-referrer"
          />
          <span className="text-[10px] uppercase tracking-[0.2em] text-[#8C948D] mt-0.5 flex items-center gap-1.5">
            <span className="w-1 h-1 rounded-full bg-[#C48B8B]" />
            Papeterie & Planners Digitales
            <span className="w-1 h-1 rounded-full bg-[#C48B8B]" />
          </span>
        </div>

        <p className="text-xs text-[#6B726C] max-w-md mx-auto leading-relaxed">
          Herramientas y papelería digital diseñadas para ayudarte a planificar y organizar tus proyectos y momentos especiales.
        </p>

        <div className="flex items-center justify-center gap-2 text-[11px] text-[#A3ABA4] pt-2">
          <span>© {new Date().getFullYear()} Oriccia. Todos los derechos reservados.</span>
          <button
            onClick={() => setIsAdminModalOpen(true)}
            className="text-[#A3ABA4]/40 hover:text-[#C48B8B] p-1 transition-colors rounded hover:bg-[#FAF2F2]"
            title="Administración"
            aria-label="Acceso administrativo"
          >
            <Lock className="w-3 h-3" />
          </button>
        </div>
      </footer>

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onOrderWhatsApp={(prod) => handleOrderWhatsApp(prod)}
        onOpenDemo={(prod) => {
          setSelectedProduct(null);
          setDemoProduct(prod);
        }}
      />

      {/* Interactive Demo Modal */}
      <InteractiveDemoModal
        product={demoProduct}
        isOpen={!!demoProduct}
        onClose={() => setDemoProduct(null)}
        onOrderWhatsApp={(prod) => handleOrderWhatsApp(prod)}
      />

      {/* Admin Panel / Auth Protection Modal */}
      <AdminModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        currentUser={currentUser}
        token={token}
        products={products}
        categories={categories}
        settings={settings}
        onUpdateProducts={setProducts}
        onUpdateCategories={setCategories}
        onUpdateSettings={setSettings}
        onAuthSuccess={(user, accessToken) => {
          setCurrentUser(user);
          setToken(accessToken);
        }}
        onAuthLogout={() => {
          setCurrentUser(null);
          setToken(null);
        }}
      />
    </div>
  );
}
