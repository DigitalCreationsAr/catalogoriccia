import React, { useState, useRef } from 'react';
import { Product, Category, AdminSettings } from '../types';
import { User } from 'firebase/auth';
import {
  Plus,
  Trash2,
  Edit2,
  FileSpreadsheet,
  ExternalLink,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  LogOut,
  FolderPlus,
  MessageCircle,
  HelpCircle,
  Upload,
  Image as ImageIcon,
  Link as LinkIcon,
  Gift,
  Download,
  Tag,
} from 'lucide-react';
import { ConfirmationModal } from './ConfirmationModal';
import { OricciaLogo } from './OricciaLogo';
import {
  createOricciaSpreadsheet,
  fetchProductsFromSheet,
  saveProductsToSheet,
} from '../lib/googleSheets';

interface AdminPanelProps {
  user: User;
  token: string | null;
  products: Product[];
  categories: Category[];
  settings: AdminSettings;
  onUpdateProducts: (products: Product[]) => void;
  onUpdateCategories: (categories: Category[]) => void;
  onUpdateSettings: (settings: AdminSettings) => void;
  onLogout: () => void;
  onClose: () => void;
}

export function AdminPanel({
  user,
  token,
  products,
  categories,
  settings,
  onUpdateProducts,
  onUpdateCategories,
  onUpdateSettings,
  onLogout,
  onClose,
}: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'productos' | 'categorias' | 'sheets' | 'ajustes'>('productos');
  const [isEditingProduct, setIsEditingProduct] = useState<boolean>(false);
  const [currentProduct, setCurrentProduct] = useState<Partial<Product> | null>(null);
  const [productModalTab, setProductModalTab] = useState<'standard' | 'free'>('standard');

  // Category modal
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');

  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    isDestructive?: boolean;
    action: () => Promise<void> | void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    action: () => {},
  });

  // Sync state
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Settings form state
  const [whatsappNumberInput, setWhatsappNumberInput] = useState(settings.whatsappNumber);
  const [whatsappMsgInput, setWhatsappMsgInput] = useState(settings.whatsappMessageTemplate);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [manualSheetId, setManualSheetId] = useState(settings.spreadsheetId);

  // Photo upload states
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const logoFileInputRef = useRef<HTMLInputElement | null>(null);
  const [imageInputMethod, setImageInputMethod] = useState<'file' | 'url'>('file');
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [isProcessingImage, setIsProcessingImage] = useState(false);

  const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Por favor selecciona un archivo de imagen válido (.jpg, .jpeg, .png, .webp, .svg)');
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => {
        const base64 = ev.target?.result as string;
        if (base64) {
          const newSettings = { ...settings, logoUrl: base64 };
          onUpdateSettings(newSettings);
          setSyncStatusMsg({ type: 'success', text: '¡Logotipo personalizado cargado con éxito!' });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResetLogo = () => {
    const newSettings = { ...settings, logoUrl: undefined };
    onUpdateSettings(newSettings);
    setSyncStatusMsg({ type: 'success', text: 'Se ha restablecido el logo predeterminado.' });
  };

  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen válido (.jpg, .jpeg, .png, .webp)');
      return;
    }

    setIsProcessingImage(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 1200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = (height * MAX_WIDTH) / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = (width * MAX_HEIGHT) / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = Math.round(width);
        canvas.height = Math.round(height);
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.86);
          setCurrentProduct((prev) => (prev ? { ...prev, photoUrl: compressedDataUrl } : prev));
        }
        setIsProcessingImage(false);
      };
      img.onerror = () => {
        setIsProcessingImage(false);
        alert('No se pudo procesar la imagen seleccionada.');
      };
      if (typeof event.target?.result === 'string') {
        img.src = event.target.result;
      }
    };
    reader.onerror = () => {
      setIsProcessingImage(false);
      alert('Error al leer el archivo de imagen.');
    };
    reader.readAsDataURL(file);
  };

  const renderPhotoField = (label = 'Foto del producto (URL o JPG) *') => (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-semibold text-[#1C3B2B]">{label}</label>
        <div className="flex items-center bg-[#F5EFEB] p-0.5 rounded-lg text-[11px]">
          <button
            type="button"
            onClick={() => setImageInputMethod('file')}
            className={`px-2.5 py-1 rounded-md font-medium transition-all flex items-center gap-1.5 ${
              imageInputMethod === 'file'
                ? 'bg-white text-[#1C3B2B] shadow-xs'
                : 'text-[#6B726C] hover:text-[#1C3B2B]'
            }`}
          >
            <Upload className="w-3 h-3" />
            Subir archivo JPG / PNG
          </button>
          <button
            type="button"
            onClick={() => setImageInputMethod('url')}
            className={`px-2.5 py-1 rounded-md font-medium transition-all flex items-center gap-1.5 ${
              imageInputMethod === 'url'
                ? 'bg-white text-[#1C3B2B] shadow-xs'
                : 'text-[#6B726C] hover:text-[#1C3B2B]'
            }`}
          >
            <LinkIcon className="w-3 h-3" />
            Pegar enlace URL
          </button>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={(e) => {
          if (e.target.files?.[0]) {
            processImageFile(e.target.files[0]);
          }
        }}
        className="hidden"
      />

      {imageInputMethod === 'file' ? (
        <div>
          {currentProduct?.photoUrl ? (
            <div className="p-3 bg-[#FAF8F5] border border-[#E8E1D7] rounded-xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={currentProduct.photoUrl}
                  alt="Vista previa"
                  className="w-16 h-16 rounded-lg object-cover border border-[#E8E1D7] shrink-0 bg-white"
                />
                <div className="min-w-0">
                  <span className="text-xs font-semibold text-[#1C3B2B] block truncate">
                    Foto cargada con éxito
                  </span>
                  <span className="text-[11px] text-[#6B726C] block">
                    Optimizada en alta calidad para el catálogo
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2.5 py-1.5 text-xs font-medium text-[#1C3B2B] bg-white border border-[#E8E1D7] hover:border-[#1C3B2B] rounded-lg transition-colors flex items-center gap-1"
                >
                  <Upload className="w-3 h-3" />
                  Cambiar foto
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentProduct({ ...currentProduct, photoUrl: '' })}
                  className="p-1.5 text-[#C88A8A] hover:text-[#B33A3A] hover:bg-[#F5EFEB] rounded-lg transition-colors"
                  title="Quitar foto"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDraggingImage(true);
              }}
              onDragLeave={() => setIsDraggingImage(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDraggingImage(false);
                if (e.dataTransfer.files?.[0]) {
                  processImageFile(e.dataTransfer.files[0]);
                }
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`p-6 border-2 border-dashed rounded-xl text-center cursor-pointer transition-colors ${
                isDraggingImage
                  ? 'border-[#2B523E] bg-[#F5EFEB]'
                  : 'border-[#E8E1D7] hover:border-[#2B523E] bg-[#FAF8F5]'
              }`}
            >
              {isProcessingImage ? (
                <div className="flex flex-col items-center justify-center gap-2 py-2">
                  <RefreshCw className="w-6 h-6 text-[#2B523E] animate-spin" />
                  <span className="text-xs text-[#2B523E] font-medium">Optimizando imagen...</span>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-1.5">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#2B523E] shadow-xs mb-1">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-medium text-[#1C3B2B]">
                    Arrastra tu foto JPG / PNG aquí o{' '}
                    <span className="text-[#2B523E] underline font-semibold">haz clic para buscar</span>
                  </p>
                  <p className="text-[11px] text-[#8C948D]">Compatible con archivos JPG, JPEG, PNG y WebP</p>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div>
          <input
            type="text"
            value={currentProduct?.photoUrl || ''}
            onChange={(e) => setCurrentProduct({ ...currentProduct, photoUrl: e.target.value })}
            placeholder="https://images.unsplash.com/... o enlace directo de imagen"
            className="w-full px-3 py-2 text-xs bg-white border border-[#E8E1D7] rounded-lg focus:outline-none focus:border-[#1C3B2B]"
          />
          {currentProduct?.photoUrl && (
            <div className="mt-2 flex items-center gap-3">
              <img
                src={currentProduct.photoUrl}
                alt="Vista previa"
                className="w-14 h-14 rounded-lg object-cover border border-[#E8E1D7]"
              />
              <span className="text-[11px] text-[#6B726C]">Vista previa del enlace</span>
            </div>
          )}
        </div>
      )}
    </div>
  );

  // Handlers for Products
  const handleOpenAddProduct = () => {
    const initialCategory = categories.find((c) => c.slug !== 'todas')?.name || 'Invitaciones Digitales';
    const isInv = initialCategory.trim().toLowerCase() === 'invitaciones digitales';
    setImageInputMethod('file');
    setProductModalTab('standard');
    setCurrentProduct({
      id: `oriccia-${Date.now().toString().slice(-4)}`,
      name: '',
      description: '',
      photoUrl: '',
      price: 15.0,
      currency: 'USD',
      category: initialCategory,
      eventType: isInv ? 'Boda' : '',
      tags: ['Digital', 'Minimalista', 'Elegante'],
      features: [
        'Hipervínculos interactivos fluidos',
        'Diseño responsivo para móviles y tablets',
        'Botón de confirmación de asistencia (RSVP)',
      ],
      demoUrl: '',
      downloadUrl: '',
      isFree: false,
      status: 'activo',
      updatedAt: new Date().toISOString().split('T')[0],
    });
    setIsEditingProduct(true);
  };

  const handleOpenEditProduct = (prod: Product) => {
    setCurrentProduct({ ...prod });
    if (prod.isFree || (prod.price === 0 && Boolean(prod.downloadUrl))) {
      setProductModalTab('free');
    } else {
      setProductModalTab('standard');
    }
    if (prod.photoUrl?.startsWith('data:')) {
      setImageInputMethod('file');
    } else if (prod.photoUrl?.startsWith('http')) {
      setImageInputMethod('url');
    } else {
      setImageInputMethod('file');
    }
    setIsEditingProduct(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProduct?.name) return;
    if (!currentProduct.photoUrl) {
      alert('Por favor sube una foto en JPG o ingresa un enlace para la imagen del producto.');
      return;
    }

    const isFree = productModalTab === 'free' || Boolean(currentProduct.isFree);

    if (isFree && !currentProduct.downloadUrl) {
      alert('Por favor introduce un enlace de descarga para este artículo gratuito (ej. enlace de Google Drive, Dropbox o archivo PDF).');
      return;
    }

    const updatedList = [...products];
    const index = updatedList.findIndex((p) => p.id === currentProduct.id);
    const isInvitacion = currentProduct.category?.trim().toLowerCase() === 'invitaciones digitales';

    const readyProduct: Product = {
      id: currentProduct.id || `oriccia-${Date.now().toString().slice(-4)}`,
      name: currentProduct.name || (isFree ? 'Nuevo Recurso Gratuito' : 'Nuevo Producto'),
      description: currentProduct.description || '',
      photoUrl: currentProduct.photoUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
      price: isFree ? 0 : (Number(currentProduct.price) || 0),
      currency: currentProduct.currency || 'USD',
      category: currentProduct.category || (isFree ? 'Freebies & Imprimibles' : 'Invitaciones Digitales'),
      eventType: !isFree && isInvitacion ? (currentProduct.eventType || 'Boda') : '',
      tags: Array.isArray(currentProduct.tags) ? currentProduct.tags : [],
      features: Array.isArray(currentProduct.features) ? currentProduct.features : [],
      demoUrl: currentProduct.demoUrl || '',
      downloadUrl: currentProduct.downloadUrl || '',
      isFree: isFree,
      status: (currentProduct.status as 'activo' | 'borrador') || 'activo',
      updatedAt: new Date().toISOString().split('T')[0],
    };

    if (index >= 0) {
      updatedList[index] = readyProduct;
    } else {
      updatedList.unshift(readyProduct);
    }

    onUpdateProducts(updatedList);
    setIsEditingProduct(false);
    setCurrentProduct(null);

    // Auto push to sheets if sheet is linked
    if (token && settings.spreadsheetId) {
      saveProductsToSheet(token, settings.spreadsheetId, updatedList).catch(console.error);
    }
  };

  const handleDeleteProductPrompt = (prod: Product) => {
    setConfirmDialog({
      isOpen: true,
      title: `Eliminar "${prod.name}"`,
      message: `¿Estás seguro de que deseas eliminar este producto digital del catálogo? Esta acción no se puede deshacer.`,
      confirmLabel: 'Eliminar producto',
      isDestructive: true,
      action: async () => {
        const remaining = products.filter((p) => p.id !== prod.id);
        onUpdateProducts(remaining);
        if (token && settings.spreadsheetId) {
          await saveProductsToSheet(token, settings.spreadsheetId, remaining);
        }
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  // Handlers for Categories
  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    const slug = newCatName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const newCategory: Category = {
      id: `cat-${Date.now()}`,
      name: newCatName.trim(),
      description: newCatDesc.trim(),
      slug,
    };

    onUpdateCategories([...categories, newCategory]);
    setNewCatName('');
    setNewCatDesc('');
    setIsAddingCategory(false);
  };

  const handleDeleteCategory = (cat: Category) => {
    if (cat.slug === 'todas') return;
    setConfirmDialog({
      isOpen: true,
      title: `Eliminar categoría "${cat.name}"`,
      message: `Los productos en esta categoría no serán eliminados, pero quedarán sin categoría específica. ¿Continuar?`,
      confirmLabel: 'Eliminar',
      isDestructive: true,
      action: () => {
        onUpdateCategories(categories.filter((c) => c.id !== cat.id));
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  // Google Sheets integration actions
  const handleCreateSheetPrompt = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Crear Planilla en Google Drive',
      message: `Se creará un nuevo archivo de Google Sheets titulado "Oriccia - Catálogo e Inventario Digital" en tu cuenta (${user.email}) con las columnas y productos actuales organizados. ¿Deseas continuar?`,
      confirmLabel: 'Crear Planilla',
      isDestructive: false,
      action: async () => {
        if (!token) {
          setSyncStatusMsg({
            type: 'error',
            text: 'Se requiere iniciar sesión con Google para acceder a Google Drive y Sheets.',
          });
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
          return;
        }

        setIsSyncing(true);
        setSyncStatusMsg(null);

        const result = await createOricciaSpreadsheet(token, products);

        setIsSyncing(false);
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));

        if (result.success && result.data) {
          const updatedSettings: AdminSettings = {
            ...settings,
            spreadsheetId: result.data.spreadsheetId,
            spreadsheetUrl: result.data.spreadsheetUrl,
            lastSyncTime: new Date().toLocaleTimeString('es-ES'),
          };
          onUpdateSettings(updatedSettings);
          setManualSheetId(result.data.spreadsheetId);
          setSyncStatusMsg({
            type: 'success',
            text: '¡Planilla creada exitosamente en tu Google Drive! Ahora puedes sincronizar el catálogo o editarlo desde tu celular/PC.',
          });
        } else {
          setSyncStatusMsg({
            type: 'error',
            text: result.error || 'No se pudo crear la planilla de Google Sheets.',
          });
        }
      },
    });
  };

  const handlePullFromSheet = async () => {
    if (!token || !settings.spreadsheetId) {
      setSyncStatusMsg({
        type: 'error',
        text: 'Debes tener una planilla vinculada para descargar los productos.',
      });
      return;
    }

    setIsSyncing(true);
    setSyncStatusMsg(null);

    const result = await fetchProductsFromSheet(token, settings.spreadsheetId);
    setIsSyncing(false);

    if (result.success && result.data) {
      if (result.data.length === 0) {
        setSyncStatusMsg({
          type: 'error',
          text: 'La planilla no contiene filas de productos.',
        });
      } else {
        onUpdateProducts(result.data);
        onUpdateSettings({
          ...settings,
          lastSyncTime: new Date().toLocaleTimeString('es-ES'),
        });
        setSyncStatusMsg({
          type: 'success',
          text: `Se sincronizaron con éxito ${result.data.length} productos desde Google Sheets.`,
        });
      }
    } else {
      setSyncStatusMsg({
        type: 'error',
        text: result.error || 'Error al obtener datos desde Google Sheets.',
      });
    }
  };

  const handlePushToSheetPrompt = () => {
    if (!settings.spreadsheetId) return;
    setConfirmDialog({
      isOpen: true,
      title: 'Actualizar Google Sheets',
      message: `Se sobrescribirán las filas de la planilla de Google Sheets con los ${products.length} productos actuales del catálogo. ¿Deseas continuar?`,
      confirmLabel: 'Actualizar Planilla',
      action: async () => {
        if (!token) return;
        setIsSyncing(true);
        setSyncStatusMsg(null);
        const result = await saveProductsToSheet(token, settings.spreadsheetId, products);
        setIsSyncing(false);
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));

        if (result.success) {
          onUpdateSettings({
            ...settings,
            lastSyncTime: new Date().toLocaleTimeString('es-ES'),
          });
          setSyncStatusMsg({
            type: 'success',
            text: 'Planilla actualizada correctamente con los productos de Oriccia.',
          });
        } else {
          setSyncStatusMsg({
            type: 'error',
            text: result.error || 'Error al guardar en Google Sheets.',
          });
        }
      },
    });
  };

  const handleLinkManualSheet = () => {
    if (!manualSheetId.trim()) return;
    let cleanId = manualSheetId.trim();
    // Support full Google Sheets URLs like https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit
    if (cleanId.includes('/d/')) {
      const match = cleanId.match(/\/d\/([a-zA-Z0-9-_]+)/);
      if (match && match[1]) {
        cleanId = match[1];
      }
    }

    const updated = {
      ...settings,
      spreadsheetId: cleanId,
      spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${cleanId}`,
    };
    onUpdateSettings(updated);
    setSyncStatusMsg({
      type: 'success',
      text: 'ID de planilla vinculado. Haz clic en "Descargar datos" para comprobar la conexión.',
    });
  };

  // Settings Save
  const handleSaveStoreSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings({
      ...settings,
      whatsappNumber: whatsappNumberInput.trim(),
      whatsappMessageTemplate: whatsappMsgInput.trim(),
    });
    setSyncStatusMsg({
      type: 'success',
      text: 'Ajustes de tienda guardados correctamente.',
    });
  };

  const handleAddAdminEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminEmail.trim() || !newAdminEmail.includes('@')) return;
    const email = newAdminEmail.toLowerCase().trim();
    if (settings.authorizedEmails.includes(email)) return;

    onUpdateSettings({
      ...settings,
      authorizedEmails: [...settings.authorizedEmails, email],
    });
    setNewAdminEmail('');
  };

  const handleRemoveAdminEmail = (emailToRemove: string) => {
    onUpdateSettings({
      ...settings,
      authorizedEmails: settings.authorizedEmails.filter((e) => e !== emailToRemove),
    });
  };

  return (
    <div className="flex flex-col h-full bg-[#FAF7F2] text-[#2C332D]">
      {/* Admin Top Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-[#F5EFEB] border-b border-[#E8E1D7]">
        <div className="flex items-center gap-3">
          {user.photoURL ? (
            <img
              src={user.photoURL}
              alt={user.displayName || 'Admin'}
              className="w-9 h-9 rounded-full border border-[#1C3B2B]/20"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-[#1C3B2B] text-[#FAF7F2] flex items-center justify-center font-serif text-sm">
              O
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-[#1C3B2B] font-romantic">
                Panel de Administración Oriccia
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-[#1C3B2B] text-[#FAF7F2] font-medium">
                Admin
              </span>
            </div>
            <p className="text-xs text-[#6B726C] truncate max-w-xs">{user.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onLogout}
            className="px-3 py-1.5 rounded-lg border border-[#E8E1D7] text-xs font-medium text-[#6B726C] hover:text-red-700 hover:bg-white flex items-center gap-1.5 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Cerrar Sesión</span>
          </button>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg bg-[#1C3B2B] text-[#FAF7F2] text-xs font-medium hover:bg-[#152D1F] transition-colors"
          >
            Volver a la Tienda
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#E8E1D7] bg-[#FAF7F2] px-6">
        {[
          { key: 'productos', label: `Productos (${products.length})` },
          { key: 'categorias', label: `Categorías (${categories.length})` },
          { key: 'sheets', label: 'Google Sheets' },
          { key: 'ajustes', label: 'Ajustes & WhatsApp' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setActiveTab(tab.key as any);
              setSyncStatusMsg(null);
            }}
            className={`py-3 px-4 text-xs font-medium border-b-2 transition-all ${
              activeTab === tab.key
                ? 'border-[#1C3B2B] text-[#1C3B2B] font-semibold'
                : 'border-transparent text-[#6B726C] hover:text-[#1C3B2B]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Feedback banner */}
      {syncStatusMsg && (
        <div
          className={`mx-6 mt-4 p-3 rounded-xl flex items-center gap-2.5 text-xs ${
            syncStatusMsg.type === 'success'
              ? 'bg-[#EBF0EC] text-[#1C3B2B] border border-[#2B523E]/20'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {syncStatusMsg.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-[#1C3B2B]" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 text-red-700" />
          )}
          <span className="flex-1">{syncStatusMsg.text}</span>
          <button
            onClick={() => setSyncStatusMsg(null)}
            className="text-[10px] font-semibold hover:underline"
          >
            Entendido
          </button>
        </div>
      )}

      {/* Tab 1: PRODUCTOS */}
      {activeTab === 'productos' && (
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-[#1C3B2B]">Inventario del Catálogo</h3>
              <p className="text-xs text-[#6B726C]">
                Agrega, edita o elimina artículos digitales y agendas para tus clientes.
              </p>
            </div>
            <button
              onClick={handleOpenAddProduct}
              className="px-4 py-2 bg-[#1C3B2B] text-[#FAF7F2] hover:bg-[#152D1F] rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              Nuevo Producto
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((prod) => (
              <div
                key={prod.id}
                className="bg-white rounded-xl border border-[#E8E1D7] p-3 flex gap-3 items-center hover:border-[#1C3B2B]/40 transition-all shadow-2xs"
              >
                <img
                  src={prod.photoUrl}
                  alt={prod.name}
                  className="w-16 h-16 rounded-lg object-cover bg-[#F5EFEB] shrink-0"
                  referrerPolicy="no-referrer"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="px-1.5 py-0.5 rounded text-[9px] bg-[#F5EFEB] text-[#1C3B2B] font-medium">
                      {prod.category}
                    </span>
                    {prod.status === 'borrador' && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] bg-amber-50 text-amber-800">
                        Borrador
                      </span>
                    )}
                  </div>
                  <h4 className="text-xs font-semibold text-[#1C3B2B] truncate mt-1">{prod.name}</h4>
                  <div className="text-xs font-bold text-[#2B523E] mt-0.5 flex items-center gap-1.5">
                    {prod.isFree || prod.price === 0 ? (
                      <span className="px-1.5 py-0.5 bg-[#EEDCDC] text-[#7A5050] text-[10px] font-bold rounded-md uppercase">
                        Gratis (Freebie)
                      </span>
                    ) : (
                      <span>
                        {prod.price.toFixed(2)} {prod.currency}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => handleOpenEditProduct(prod)}
                    className="p-1.5 text-[#6B726C] hover:text-[#1C3B2B] hover:bg-[#F5EFEB] rounded-md transition-colors"
                    title="Editar producto"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteProductPrompt(prod)}
                    className="p-1.5 text-[#6B726C] hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                    title="Eliminar producto"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: CATEGORIAS */}
      {activeTab === 'categorias' && (
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-[#1C3B2B]">Categorías de Productos</h3>
              <p className="text-xs text-[#6B726C]">
                Gestiona las categorías en las que se divide el catálogo de Oriccia.
              </p>
            </div>
            <button
              onClick={() => setIsAddingCategory(true)}
              className="px-4 py-2 bg-[#1C3B2B] text-[#FAF7F2] hover:bg-[#152D1F] rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
            >
              <FolderPlus className="w-3.5 h-3.5" />
              Nueva Categoría
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {categories.map((cat) => {
              const count =
                cat.slug === 'todas'
                  ? products.length
                  : products.filter((p) => p.category.toLowerCase() === cat.name.toLowerCase()).length;

              return (
                <div
                  key={cat.id}
                  className="bg-white rounded-xl border border-[#E8E1D7] p-4 flex justify-between items-start"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-[#1C3B2B]">{cat.name}</h4>
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-[#F5EFEB] text-[#6B726C]">
                        {count} {count === 1 ? 'producto' : 'productos'}
                      </span>
                    </div>
                    {cat.description && (
                      <p className="text-xs text-[#6B726C] mt-1">{cat.description}</p>
                    )}
                  </div>
                  {cat.slug !== 'todas' && (
                    <button
                      onClick={() => handleDeleteCategory(cat)}
                      className="p-1.5 text-[#8C948D] hover:text-red-700 hover:bg-red-50 rounded-md"
                      title="Eliminar categoría"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: GOOGLE SHEETS */}
      {activeTab === 'sheets' && (
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="bg-white rounded-2xl border border-[#E8E1D7] p-6 space-y-6">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-[#EBF0EC] text-[#1C3B2B]">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-[#1C3B2B]">
                    Google Sheets & Inventario en la Nube
                  </h3>
                  <p className="text-xs text-[#6B726C]">
                    Permite gestionar todo tu catálogo, stock y pedidos directamente en una hoja de cálculo accesible desde cualquier dispositivo (celular, tablet o computadora).
                  </p>
                </div>
              </div>

              {settings.spreadsheetId && (
                <a
                  href={`https://docs.google.com/spreadsheets/d/${settings.spreadsheetId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-[#F5EFEB] hover:bg-[#EAE2D8] text-[#1C3B2B] border border-[#E8E1D7] rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all"
                >
                  Abrir Planilla en Google Sheets
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>

            {/* Connection status card */}
            <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E8E1D7] flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-semibold text-[#6B726C] uppercase tracking-wider block">
                  Estado de Conexión:
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      settings.spreadsheetId ? 'bg-emerald-600' : 'bg-amber-500'
                    }`}
                  />
                  <span className="text-sm font-medium text-[#1C3B2B]">
                    {settings.spreadsheetId
                      ? `Conectada: ${settings.spreadsheetName || 'Planilla Oriccia'}`
                      : 'Sin planilla vinculada'}
                  </span>
                </div>
                {settings.lastSyncTime && (
                  <p className="text-[11px] text-[#8C948D] mt-1">
                    Última sincronización: {settings.lastSyncTime}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                {!settings.spreadsheetId ? (
                  <button
                    onClick={handleCreateSheetPrompt}
                    disabled={isSyncing}
                    className="px-4 py-2.5 bg-[#1C3B2B] text-[#FAF7F2] hover:bg-[#152D1F] rounded-lg text-xs font-semibold flex items-center gap-2 shadow-sm transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    Crear Planilla Oriccia en Google Drive (1 Clic)
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handlePullFromSheet}
                      disabled={isSyncing}
                      className="px-3.5 py-2 bg-white hover:bg-[#F5EFEB] border border-[#E8E1D7] text-[#1C3B2B] rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                      Descargar de Sheets
                    </button>
                    <button
                      onClick={handlePushToSheetPrompt}
                      disabled={isSyncing}
                      className="px-3.5 py-2 bg-[#1C3B2B] text-[#FAF7F2] hover:bg-[#152D1F] rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      Subir y Actualizar Sheets
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Manual link option */}
            <div className="pt-4 border-t border-[#E8E1D7] space-y-3">
              <h4 className="text-xs font-semibold text-[#1C3B2B] uppercase tracking-wider">
                Vincular Planilla Existente por ID o Enlace
              </h4>
              <div className="flex gap-2 max-w-xl">
                <input
                  type="text"
                  value={manualSheetId}
                  onChange={(e) => setManualSheetId(e.target.value)}
                  placeholder="Pega el enlace o ID de tu Google Sheet..."
                  className="flex-1 px-3 py-2 text-xs bg-white border border-[#E8E1D7] rounded-lg focus:outline-none focus:border-[#1C3B2B]"
                />
                <button
                  onClick={handleLinkManualSheet}
                  className="px-4 py-2 bg-[#F5EFEB] hover:bg-[#EAE2D8] border border-[#E8E1D7] text-[#1C3B2B] rounded-lg text-xs font-medium transition-colors"
                >
                  Vincular
                </button>
              </div>
            </div>

            {/* How it works info box */}
            <div className="p-4 rounded-xl bg-[#F5EFEB]/70 border border-[#E8E1D7] space-y-2">
              <h5 className="text-xs font-semibold text-[#1C3B2B] flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-[#1C3B2B]" />
                ¿Cómo funciona la sincronización con Google Sheets?
              </h5>
              <ul className="text-[11px] text-[#4A524C] space-y-1 list-disc pl-4 leading-relaxed">
                <li>
                  Tu archivo en Google Sheets contiene dos hojas: <strong>Catalogo_Productos</strong> y <strong>Consultas_WhatsApp</strong>.
                </li>
                <li>
                  Puedes modificar precios, nombres y descripciones directamente desde la app de Google Sheets en tu celular o tablet.
                </li>
                <li>
                  Al pulsar <strong>Descargar de Sheets</strong>, el catálogo web adoptará inmediatamente tus cambios.
                </li>
                <li>
                  Cada vez que un cliente presione el botón de WhatsApp para comprar un artículo, se registra automáticamente una fila en <strong>Consultas_WhatsApp</strong> para tu control de pedidos.
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: AJUSTES & WHATSAPP */}
      {activeTab === 'ajustes' && (
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Brand Logo Upload Card */}
          <div className="bg-white rounded-2xl border border-[#E8E1D7] p-6 space-y-4 max-w-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-[#1C3B2B] flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-[#1C3B2B]" />
                  Logotipo de la Tienda
                </h3>
                <p className="text-xs text-[#6B726C] mt-1">
                  Sube directamente el archivo de tu imagen de logo (JPG, PNG o SVG). Se mostrará de inmediato en el menú principal y pie de página.
                </p>
              </div>
            </div>

            {/* Current Logo Preview */}
            <div className="p-4 bg-[#FAF7F2] rounded-xl border border-[#E8E1D7] flex items-center justify-between gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-[11px] font-medium text-[#6B726C] uppercase tracking-wider">
                  Vista previa activa:
                </span>
                <div className="h-12 flex items-center bg-white/60 px-4 rounded-lg border border-[#E8E1D7]/50">
                  {settings.logoUrl ? (
                    <img
                      src={settings.logoUrl}
                      alt="Logo activo"
                      className="h-9 w-auto max-w-[220px] object-contain"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <OricciaLogo className="h-8 w-auto" />
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="file"
                  ref={logoFileInputRef}
                  onChange={handleLogoFileUpload}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => logoFileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#1C3B2B] hover:bg-[#152D1F] text-[#FAF7F2] rounded-lg text-xs font-semibold shadow-2xs transition-colors"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Subir mi imagen de logo
                </button>
                {settings.logoUrl && (
                  <button
                    type="button"
                    onClick={handleResetLogo}
                    className="px-3 py-2 bg-white hover:bg-red-50 border border-[#E8E1D7] text-red-600 rounded-lg text-xs font-medium transition-colors"
                  >
                    Restablecer
                  </button>
                )}
              </div>
            </div>

            <div className="text-[11px] text-[#8C948D] bg-white rounded-lg border border-[#E8E1D7]/70 p-3 leading-relaxed">
              💡 <strong>Tip:</strong> Puedes seleccionar directamente tu archivo <code>logo 3.jpg</code> o cualquier PNG transparente desde tu equipo.
            </div>
          </div>

          <form onSubmit={handleSaveStoreSettings} className="bg-white rounded-2xl border border-[#E8E1D7] p-6 space-y-5 max-w-2xl">
            <h3 className="text-sm font-semibold text-[#1C3B2B] flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-[#1C3B2B]" />
              Configuración de Ventas por WhatsApp
            </h3>

            <div>
              <label className="text-xs font-medium text-[#4A524C] block mb-1">
                Número de WhatsApp para pedidos (con código de país sin espacios):
              </label>
              <input
                type="text"
                value={whatsappNumberInput}
                onChange={(e) => setWhatsappNumberInput(e.target.value)}
                placeholder="+5491123456789"
                className="w-full px-3 py-2 text-xs bg-white border border-[#E8E1D7] rounded-lg focus:outline-none focus:border-[#1C3B2B]"
              />
              <span className="text-[10px] text-[#8C948D] mt-1 block">
                Ejemplo: +54 9 11 2345 6789 (Argentina), +56 9 1234 5678 (Chile), +52 1 55 1234 5678 (México)
              </span>
            </div>

            <div>
              <label className="text-xs font-medium text-[#4A524C] block mb-1">
                Plantilla del mensaje inicial de WhatsApp:
              </label>
              <textarea
                rows={3}
                value={whatsappMsgInput}
                onChange={(e) => setWhatsappMsgInput(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-[#E8E1D7] rounded-lg focus:outline-none focus:border-[#1C3B2B]"
              />
              <span className="text-[10px] text-[#8C948D] mt-1 block">
                Variables disponibles: <code>{'{productName}'}</code>, <code>{'{price}'}</code>, <code>{'{currency}'}</code>
              </span>
            </div>

            <button
              type="submit"
              className="px-4 py-2 bg-[#1C3B2B] text-[#FAF7F2] hover:bg-[#152D1F] rounded-lg text-xs font-semibold shadow-xs"
            >
              Guardar Ajustes de WhatsApp
            </button>
          </form>

          {/* Authorized Admin Emails */}
          <div className="bg-white rounded-2xl border border-[#E8E1D7] p-6 space-y-4 max-w-2xl">
            <h3 className="text-sm font-semibold text-[#1C3B2B]">
              Cuentas de Administradores Autorizados
            </h3>
            <p className="text-xs text-[#6B726C]">
              Solo estas cuentas de Google podrán acceder al panel de administración.
            </p>

            <form onSubmit={handleAddAdminEmail} className="flex gap-2">
              <input
                type="email"
                value={newAdminEmail}
                onChange={(e) => setNewAdminEmail(e.target.value)}
                placeholder="nuevo.admin@gmail.com"
                className="flex-1 px-3 py-2 text-xs bg-white border border-[#E8E1D7] rounded-lg focus:outline-none focus:border-[#1C3B2B]"
              />
              <button
                type="submit"
                className="px-3.5 py-2 bg-[#F5EFEB] hover:bg-[#EAE2D8] border border-[#E8E1D7] text-[#1C3B2B] rounded-lg text-xs font-medium"
              >
                Agregar Administrador
              </button>
            </form>

            <div className="space-y-2 pt-2">
              {settings.authorizedEmails.map((email) => (
                <div
                  key={email}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-[#FAF7F2] border border-[#E8E1D7] text-xs"
                >
                  <span className="font-medium text-[#2C332D]">{email}</span>
                  {email.toLowerCase() !== 'rara.digitalcreations@gmail.com' && (
                    <button
                      onClick={() => handleRemoveAdminEmail(email)}
                      className="text-[#8C948D] hover:text-red-700"
                      title="Quitar permiso"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal for Product Add / Edit */}
      {isEditingProduct && currentProduct && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-[#FAF7F2] rounded-2xl shadow-2xl border border-[#E8E1D7] overflow-hidden my-6">
            <div className="px-6 py-4 border-b border-[#E8E1D7] bg-[#F5EFEB] flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-[#1C3B2B] font-romantic">
                  {currentProduct.id && products.some((p) => p.id === currentProduct.id)
                    ? `Editar: ${currentProduct.name}`
                    : 'Nuevo Artículo Digital Oriccia'}
                </h3>
                <p className="text-[11px] text-[#6B726C] mt-0.5">
                  Gestiona productos de catálogo estándar para venta o recursos gratuitos para tus visitantes.
                </p>
              </div>
              <button
                onClick={() => {
                  setIsEditingProduct(false);
                  setCurrentProduct(null);
                }}
                className="p-1.5 text-[#6B726C] hover:text-[#1C3B2B] rounded-lg transition-colors"
                title="Cerrar modal"
              >
                ✕
              </button>
            </div>

            {/* Modal Tabs Header */}
            <div className="px-6 pt-3 bg-[#F5EFEB] border-b border-[#E8E1D7] flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setProductModalTab('standard');
                  setCurrentProduct({
                    ...currentProduct,
                    isFree: false,
                    price: currentProduct.price && currentProduct.price > 0 ? currentProduct.price : 15.0,
                  });
                }}
                className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-all border-b-2 flex items-center gap-2 ${
                  productModalTab === 'standard'
                    ? 'bg-[#FAF7F2] text-[#1C3B2B] border-[#1C3B2B] shadow-2xs'
                    : 'text-[#6B726C] hover:text-[#1C3B2B] border-transparent'
                }`}
              >
                <Tag className="w-3.5 h-3.5" />
                <span>Artículo Estándar / Venta</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setProductModalTab('free');
                  setCurrentProduct({
                    ...currentProduct,
                    isFree: true,
                    price: 0,
                    category:
                      currentProduct.category && currentProduct.category !== 'Invitaciones Digitales'
                        ? currentProduct.category
                        : 'Freebies & Imprimibles',
                  });
                }}
                className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-all border-b-2 flex items-center gap-2 ${
                  productModalTab === 'free'
                    ? 'bg-[#FAF7F2] text-[#7A5050] border-[#7A5050] shadow-2xs'
                    : 'text-[#6B726C] hover:text-[#1C3B2B] border-transparent'
                }`}
              >
                <Gift className="w-3.5 h-3.5 text-[#7A5050]" />
                <span>Artículos Gratuitos</span>
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-6 overflow-y-auto max-h-[75vh] space-y-4">
              {productModalTab === 'standard' ? (
                /* TAB 1: ARTÍCULO ESTÁNDAR / VENTA */
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-[#1C3B2B] block mb-1">
                        Nombre del producto *
                      </label>
                      <input
                        type="text"
                        required
                        value={currentProduct.name || ''}
                        onChange={(e) => setCurrentProduct({ ...currentProduct, name: e.target.value })}
                        placeholder="Ej. Agenda Digital Éthérée 2025"
                        className="w-full px-3 py-2 text-xs bg-white border border-[#E8E1D7] rounded-lg focus:outline-none focus:border-[#1C3B2B]"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-[#1C3B2B] block mb-1">
                        Categoría *
                      </label>
                      <select
                        value={currentProduct.category || ''}
                        onChange={(e) => {
                          const nextCategory = e.target.value;
                          const isInv = nextCategory.trim().toLowerCase() === 'invitaciones digitales';
                          setCurrentProduct({
                            ...currentProduct,
                            category: nextCategory,
                            eventType: isInv ? currentProduct.eventType || 'Boda' : '',
                          });
                        }}
                        className="w-full px-3 py-2 text-xs bg-white border border-[#E8E1D7] rounded-lg focus:outline-none focus:border-[#1C3B2B]"
                      >
                        {categories
                          .filter((c) => c.slug !== 'todas')
                          .map((cat) => (
                            <option key={cat.id} value={cat.name}>
                              {cat.name}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>

                  <div
                    className={`grid grid-cols-1 ${
                      currentProduct.category?.trim().toLowerCase() === 'invitaciones digitales'
                        ? 'sm:grid-cols-3'
                        : 'sm:grid-cols-2'
                    } gap-4`}
                  >
                    <div>
                      <label className="text-xs font-semibold text-[#1C3B2B] block mb-1">
                        Precio *
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        required
                        value={currentProduct.price ?? 15}
                        onChange={(e) =>
                          setCurrentProduct({
                            ...currentProduct,
                            price: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-full px-3 py-2 text-xs bg-white border border-[#E8E1D7] rounded-lg focus:outline-none focus:border-[#1C3B2B]"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-[#1C3B2B] block mb-1">
                        Moneda
                      </label>
                      <select
                        value={currentProduct.currency || 'USD'}
                        onChange={(e) =>
                          setCurrentProduct({ ...currentProduct, currency: e.target.value })
                        }
                        className="w-full px-3 py-2 text-xs bg-white border border-[#E8E1D7] rounded-lg focus:outline-none focus:border-[#1C3B2B]"
                      >
                        <option value="USD">USD ($)</option>
                        <option value="ARS">ARS ($)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="MXN">MXN ($)</option>
                        <option value="CLP">CLP ($)</option>
                      </select>
                    </div>

                    {currentProduct.category?.trim().toLowerCase() === 'invitaciones digitales' && (
                      <div>
                        <label className="text-xs font-semibold text-[#1C3B2B] block mb-1">
                          Tipo de Evento *
                        </label>
                        <select
                          value={currentProduct.eventType || 'Boda'}
                          onChange={(e) =>
                            setCurrentProduct({ ...currentProduct, eventType: e.target.value })
                          }
                          className="w-full px-3 py-2 text-xs bg-white border border-[#E8E1D7] rounded-lg focus:outline-none focus:border-[#1C3B2B]"
                        >
                          <option value="Boda">Boda</option>
                          <option value="15 años">15 años</option>
                          <option value="cumpleaños">cumpleaños</option>
                          <option value="Bautismo">Bautismo</option>
                          <option value="baby shower">baby shower</option>
                          <option value="Etc">Etc</option>
                        </select>
                      </div>
                    )}
                  </div>

                  {/* Photo Input */}
                  {renderPhotoField('Foto Principal del Producto *')}

                  {/* Description */}
                  <div>
                    <label className="text-xs font-semibold text-[#1C3B2B] block mb-1">
                      Descripción del producto *
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={currentProduct.description || ''}
                      onChange={(e) =>
                        setCurrentProduct({ ...currentProduct, description: e.target.value })
                      }
                      placeholder="Describe la agenda o plantilla, estilo y propósito..."
                      className="w-full px-3 py-2 text-xs bg-white border border-[#E8E1D7] rounded-lg focus:outline-none focus:border-[#1C3B2B]"
                    />
                  </div>

                  {/* Features */}
                  <div>
                    <label className="text-xs font-semibold text-[#1C3B2B] block mb-1">
                      Funciones destacadas (una por línea):
                    </label>
                    <textarea
                      rows={3}
                      value={currentProduct.features ? currentProduct.features.join('\n') : ''}
                      onChange={(e) =>
                        setCurrentProduct({
                          ...currentProduct,
                          features: e.target.value
                            .split('\n')
                            .map((f) => f.trim())
                            .filter(Boolean),
                        })
                      }
                      placeholder="Hipervínculos entre meses y días&#10;Compatibilidad con GoodNotes&#10;Incluye set de stickers botánicos"
                      className="w-full px-3 py-2 text-xs bg-white border border-[#E8E1D7] rounded-lg focus:outline-none focus:border-[#1C3B2B]"
                    />
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="text-xs font-semibold text-[#1C3B2B] block mb-1">
                      Etiquetas (separadas por comas):
                    </label>
                    <input
                      type="text"
                      value={currentProduct.tags ? currentProduct.tags.join(', ') : ''}
                      onChange={(e) =>
                        setCurrentProduct({
                          ...currentProduct,
                          tags: e.target.value
                            .split(',')
                            .map((t) => t.trim())
                            .filter(Boolean),
                        })
                      }
                      placeholder="GoodNotes, Notability, Imprimible, 2025"
                      className="w-full px-3 py-2 text-xs bg-white border border-[#E8E1D7] rounded-lg focus:outline-none focus:border-[#1C3B2B]"
                    />
                  </div>

                  {/* Demo URL */}
                  <div>
                    <label className="text-xs font-semibold text-[#1C3B2B] block mb-1">
                      Enlace de Demostración (opcional):
                    </label>
                    <input
                      type="text"
                      value={currentProduct.demoUrl || ''}
                      onChange={(e) =>
                        setCurrentProduct({ ...currentProduct, demoUrl: e.target.value })
                      }
                      placeholder="https://tu-sitio.com/demo-agenda"
                      className="w-full px-3 py-2 text-xs bg-white border border-[#E8E1D7] rounded-lg focus:outline-none focus:border-[#1C3B2B]"
                    />
                  </div>

                  {/* Status */}
                  <div>
                    <label className="text-xs font-semibold text-[#1C3B2B] block mb-1">Estado</label>
                    <select
                      value={currentProduct.status || 'activo'}
                      onChange={(e) =>
                        setCurrentProduct({
                          ...currentProduct,
                          status: e.target.value as 'activo' | 'borrador',
                        })
                      }
                      className="w-full px-3 py-2 text-xs bg-white border border-[#E8E1D7] rounded-lg focus:outline-none focus:border-[#1C3B2B]"
                    >
                      <option value="activo">Activo (visible en catálogo)</option>
                      <option value="borrador">Borrador (oculto)</option>
                    </select>
                  </div>
                </>
              ) : (
                /* TAB 2: ARTÍCULOS GRATUITOS (FREEBIES) */
                <>
                  <div className="p-3.5 bg-[#FAF4F4] border border-[#EEDCDC] rounded-xl flex items-start gap-3">
                    <Gift className="w-5 h-5 text-[#7A5050] shrink-0 mt-0.5" />
                    <div className="text-xs text-[#7A5050] leading-relaxed">
                      <p className="font-semibold text-[#5A3838]">Pestaña de Artículos Gratuitos (Freebies)</p>
                      <p className="text-[11px] text-[#7A5050] mt-0.5">
                        Agrega aquí recursos de descarga libre (stickers, guías, planners muestra o imprimibles). Se mostrarán con el distintivo &quot;Gratis&quot; y un botón de descarga directa sin cobro.
                      </p>
                    </div>
                  </div>

                  {/* Name & Category */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-[#1C3B2B] block mb-1">
                        Nombre del producto *
                      </label>
                      <input
                        type="text"
                        required
                        value={currentProduct.name || ''}
                        onChange={(e) => setCurrentProduct({ ...currentProduct, name: e.target.value })}
                        placeholder="Ej. Kit de Stickers Botánicos Digitales"
                        className="w-full px-3 py-2 text-xs bg-white border border-[#E8E1D7] rounded-lg focus:outline-none focus:border-[#1C3B2B]"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-[#1C3B2B] block mb-1">
                        Categoría *
                      </label>
                      <select
                        value={currentProduct.category || 'Freebies & Imprimibles'}
                        onChange={(e) => setCurrentProduct({ ...currentProduct, category: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-white border border-[#E8E1D7] rounded-lg focus:outline-none focus:border-[#1C3B2B]"
                      >
                        {categories
                          .filter((c) => c.slug !== 'todas')
                          .map((cat) => (
                            <option key={cat.id} value={cat.name}>
                              {cat.name}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>

                  {/* Photo URL or JPG */}
                  {renderPhotoField('Foto del producto (URL o JPG) *')}

                  {/* Description */}
                  <div>
                    <label className="text-xs font-semibold text-[#1C3B2B] block mb-1">
                      Descripción del producto *
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={currentProduct.description || ''}
                      onChange={(e) => setCurrentProduct({ ...currentProduct, description: e.target.value })}
                      placeholder="Describe qué contiene el archivo gratuito, formato y consejos de instalación..."
                      className="w-full px-3 py-2 text-xs bg-white border border-[#E8E1D7] rounded-lg focus:outline-none focus:border-[#1C3B2B]"
                    />
                  </div>

                  {/* Features / Functions */}
                  <div>
                    <label className="text-xs font-semibold text-[#1C3B2B] block mb-1">
                      Funciones y contenido incluido (una por línea):
                    </label>
                    <textarea
                      rows={3}
                      value={currentProduct.features ? currentProduct.features.join('\n') : ''}
                      onChange={(e) =>
                        setCurrentProduct({
                          ...currentProduct,
                          features: e.target.value
                            .split('\n')
                            .map((f) => f.trim())
                            .filter(Boolean),
                        })
                      }
                      placeholder="Archivo digital descargable en alta resolución&#10;Compatible con GoodNotes, Notability y tablets&#10;Licencia de uso personal incluida"
                      className="w-full px-3 py-2 text-xs bg-white border border-[#E8E1D7] rounded-lg focus:outline-none focus:border-[#1C3B2B]"
                    />
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="text-xs font-semibold text-[#1C3B2B] block mb-1">
                      Etiquetas (separadas por comas):
                    </label>
                    <input
                      type="text"
                      value={currentProduct.tags ? currentProduct.tags.join(', ') : ''}
                      onChange={(e) =>
                        setCurrentProduct({
                          ...currentProduct,
                          tags: e.target.value
                            .split(',')
                            .map((t) => t.trim())
                            .filter(Boolean),
                        })
                      }
                      placeholder="Freebie, Imprimible, Regalo, Stickers, PDF"
                      className="w-full px-3 py-2 text-xs bg-white border border-[#E8E1D7] rounded-lg focus:outline-none focus:border-[#1C3B2B]"
                    />
                  </div>

                  {/* Download URL */}
                  <div>
                    <label className="text-xs font-semibold text-[#1C3B2B] block mb-1">
                      Enlace de descarga *
                    </label>
                    <div className="relative">
                      <Download className="w-4 h-4 text-[#8C948D] absolute left-3 top-2.5" />
                      <input
                        type="url"
                        required={productModalTab === 'free'}
                        value={currentProduct.downloadUrl || ''}
                        onChange={(e) => setCurrentProduct({ ...currentProduct, downloadUrl: e.target.value })}
                        placeholder="https://drive.google.com/file/d/... o enlace directo (Dropbox, Notion, PDF)"
                        className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-[#E8E1D7] rounded-lg focus:outline-none focus:border-[#1C3B2B]"
                      />
                    </div>
                    <p className="text-[11px] text-[#6B726C] mt-1">
                      Tus clientes podrán descargar el archivo directamente mediante este enlace sin costo.
                    </p>
                  </div>

                  {/* Status */}
                  <div>
                    <label className="text-xs font-semibold text-[#1C3B2B] block mb-1">Estado</label>
                    <select
                      value={currentProduct.status || 'activo'}
                      onChange={(e) =>
                        setCurrentProduct({
                          ...currentProduct,
                          status: e.target.value as 'activo' | 'borrador',
                        })
                      }
                      className="w-full px-3 py-2 text-xs bg-white border border-[#E8E1D7] rounded-lg focus:outline-none focus:border-[#1C3B2B]"
                    >
                      <option value="activo">Activo (visible en catálogo para descarga directa)</option>
                      <option value="borrador">Borrador (oculto)</option>
                    </select>
                  </div>
                </>
              )}

              <div className="flex justify-end gap-2 pt-4 border-t border-[#E8E1D7]">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditingProduct(false);
                    setCurrentProduct(null);
                  }}
                  className="px-4 py-2 text-xs text-[#6B726C] hover:bg-[#EAE2D8] rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#1C3B2B] text-[#FAF7F2] hover:bg-[#152D1F] rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5"
                >
                  {productModalTab === 'free' ? (
                    <>
                      <Gift className="w-3.5 h-3.5 text-[#EEDCDC]" />
                      <span>Guardar Artículo Gratuito</span>
                    </>
                  ) : (
                    <span>Guardar Producto</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal for adding Category */}
      {isAddingCategory && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs">
          <div className="w-full max-w-md bg-[#FAF7F2] rounded-2xl shadow-xl border border-[#E8E1D7] p-6 space-y-4">
            <h3 className="text-base font-semibold text-[#1C3B2B]">Nueva Categoría</h3>
            <form onSubmit={handleAddCategory} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-[#4A524C] block mb-1">
                  Nombre de la categoría *
                </label>
                <input
                  type="text"
                  required
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="Ej. Journals & Diarios Íntimos"
                  className="w-full px-3 py-2 text-xs bg-white border border-[#E8E1D7] rounded-lg focus:outline-none focus:border-[#1C3B2B]"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-[#4A524C] block mb-1">
                  Descripción breve (opcional)
                </label>
                <input
                  type="text"
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  placeholder="Planners de gratitud y reflexión"
                  className="w-full px-3 py-2 text-xs bg-white border border-[#E8E1D7] rounded-lg focus:outline-none focus:border-[#1C3B2B]"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingCategory(false)}
                  className="px-3 py-1.5 text-xs text-[#6B726C]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#1C3B2B] text-[#FAF7F2] rounded-lg text-xs font-semibold"
                >
                  Crear Categoría
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Mandatory confirmation dialog for destructive actions */}
      <ConfirmationModal
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmLabel={confirmDialog.confirmLabel}
        isDestructive={confirmDialog.isDestructive}
        onConfirm={confirmDialog.action}
        onCancel={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
