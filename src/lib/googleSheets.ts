import { Product } from '../types';
import { uploadImageToGoogleDrive } from './googleDrive';

export interface SheetOperationResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Ensures that no cell content exceeds Google Sheets' 50,000 character limit.
 * If an un-uploaded base64 string is encountered, replaces it with a clean fallback URL so Sheets never throws a 400 error.
 */
function sanitizeSheetCell(val: any, isPhoto = false): string {
  if (val === null || val === undefined) return '';
  const str = String(val);
  if (str.length > 48000) {
    if (isPhoto || str.startsWith('data:image/')) {
      return 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80';
    }
    return str.slice(0, 48000);
  }
  return str;
}

const HEADERS = [
  'ID',
  'Nombre',
  'Categoria',
  'Tipo_Evento',
  'Precio',
  'Moneda',
  'Foto_URL',
  'Descripcion',
  'Funciones',
  'Etiquetas',
  'Demo_URL',
  'Estado',
  'Ultima_Actualizacion',
  'Es_Gratuito',
  'Enlace_Descarga',
];

const INQUIRY_HEADERS = [
  'Fecha y Hora',
  'ID Producto',
  'Nombre del Producto',
  'Precio',
  'Moneda',
  'Accion',
];

/**
 * Creates a brand-new formatted Google Sheet on the admin's Google Drive.
 */
export async function createOricciaSpreadsheet(
  accessToken: string,
  initialProducts: Product[] = []
): Promise<SheetOperationResult<{ spreadsheetId: string; spreadsheetUrl: string }>> {
  try {
    const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        properties: {
          title: 'Oriccia - Catálogo e Inventario Digital',
        },
        sheets: [
          {
            properties: {
              sheetId: 0,
              title: 'Catalogo_Productos',
              gridProperties: {
                frozenRowCount: 1,
              },
            },
          },
          {
            properties: {
              sheetId: 1,
              title: 'Consultas_WhatsApp',
              gridProperties: {
                frozenRowCount: 1,
              },
            },
          },
        ],
      }),
    });

    if (!createRes.ok) {
      const err = await createRes.json();
      return {
        success: false,
        error: err.error?.message || 'Error al crear la planilla de Google Sheets.',
      };
    }

    const createdData = await createRes.json();
    const spreadsheetId = createdData.spreadsheetId;
    const spreadsheetUrl = createdData.spreadsheetUrl;

    // Upload any base64 images to Google Drive first to avoid cell character limit
    for (const p of initialProducts) {
      if (p.photoUrl && p.photoUrl.startsWith('data:image/')) {
        try {
          const uploadRes = await uploadImageToGoogleDrive(accessToken, p.photoUrl, `${p.id}_foto.jpg`);
          if (uploadRes.success && uploadRes.url) {
            p.photoUrl = uploadRes.url;
          }
        } catch (e) {
          console.warn('Could not auto-upload initial photo to drive', e);
        }
      }
    }

    // Prepare sanitized rows for Catalogo_Productos
    const productRows = initialProducts.map((p) => [
      sanitizeSheetCell(p.id),
      sanitizeSheetCell(p.name),
      sanitizeSheetCell(p.category),
      sanitizeSheetCell(p.eventType),
      sanitizeSheetCell(p.price.toString()),
      sanitizeSheetCell(p.currency),
      sanitizeSheetCell(p.photoUrl, true),
      sanitizeSheetCell(p.description),
      sanitizeSheetCell(p.features.join(' | ')),
      sanitizeSheetCell(p.tags.join(', ')),
      sanitizeSheetCell(p.demoUrl),
      sanitizeSheetCell(p.status),
      sanitizeSheetCell(p.updatedAt),
      sanitizeSheetCell(p.isFree ? 'SI' : 'NO'),
      sanitizeSheetCell(p.downloadUrl || ''),
    ]);

    const valuesToInsert = [HEADERS, ...productRows];

    // Populate headers & initial products in Catalogo_Productos
    await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Catalogo_Productos!A1:O${valuesToInsert.length}?valueInputOption=USER_ENTERED`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values: valuesToInsert,
        }),
      }
    );

    // Populate headers in Consultas_WhatsApp
    await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Consultas_WhatsApp!A1:F1?valueInputOption=USER_ENTERED`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values: [INQUIRY_HEADERS],
        }),
      }
    );

    // Apply romantic dark-green & beige styling to header rows
    try {
      await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requests: [
            {
              repeatCell: {
                range: {
                  sheetId: 0,
                  startRowIndex: 0,
                  endRowIndex: 1,
                },
                cell: {
                  userEnteredFormat: {
                    backgroundColor: { red: 0.11, green: 0.23, blue: 0.17 }, // Dark English Green
                    textFormat: {
                      foregroundColor: { red: 0.98, green: 0.97, blue: 0.95 }, // Soft Beige
                      bold: true,
                      fontSize: 10,
                    },
                    horizontalAlignment: 'CENTER',
                  },
                },
                fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)',
              },
            },
            {
              repeatCell: {
                range: {
                  sheetId: 1,
                  startRowIndex: 0,
                  endRowIndex: 1,
                },
                cell: {
                  userEnteredFormat: {
                    backgroundColor: { red: 0.11, green: 0.23, blue: 0.17 },
                    textFormat: {
                      foregroundColor: { red: 0.98, green: 0.97, blue: 0.95 },
                      bold: true,
                      fontSize: 10,
                    },
                    horizontalAlignment: 'CENTER',
                  },
                },
                fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)',
              },
            },
          ],
        }),
      });
    } catch (styleErr) {
      console.warn('Optional header styling skipped', styleErr);
    }

    return {
      success: true,
      data: {
        spreadsheetId,
        spreadsheetUrl,
      },
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Error inesperado al conectar con Google Sheets.',
    };
  }
}

/**
 * Reads products from an existing Google Sheet.
 */
export async function fetchProductsFromSheet(
  accessToken: string,
  spreadsheetId: string
): Promise<SheetOperationResult<Product[]>> {
  try {
    // First inspect sheet titles
    const metaRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!metaRes.ok) {
      const err = await metaRes.json();
      return {
        success: false,
        error: err.error?.message || 'No se pudo acceder a la planilla especificada.',
      };
    }

    const meta = await metaRes.json();
    const sheetName =
      meta.sheets?.find((s: any) => s.properties.title === 'Catalogo_Productos')?.properties
        .title || meta.sheets?.[0]?.properties.title || 'Sheet1';

    const res = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetName}!A2:O500`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (!res.ok) {
      const err = await res.json();
      return {
        success: false,
        error: err.error?.message || 'Error al leer las filas de productos.',
      };
    }

    const data = await res.json();
    const rows = data.values || [];

    const products: Product[] = rows
      .filter((row: any[]) => row && row[0] && row[1])
      .map((row: any[], index: number) => {
        const id = row[0]?.toString().trim() || `prod-${index + 1}`;
        const name = row[1]?.toString().trim() || 'Sin título';
        const category = row[2]?.toString().trim() || 'General';
        const eventType = row[3]?.toString().trim() || 'Planificación Diaria';
        const price = parseFloat(row[4]?.toString().replace(/[^0-9.]/g, '') || '0') || 0;
        const currency = row[5]?.toString().trim() || '$';
        const photoUrl = row[6]?.toString().trim() || '';
        const description = row[7]?.toString().trim() || '';
        const features = row[8]
          ? row[8]
              .toString()
              .split('|')
              .map((f: string) => f.trim())
              .filter(Boolean)
          : [];
        const tags = row[9]
          ? row[9]
              .toString()
              .split(',')
              .map((t: string) => t.trim())
              .filter(Boolean)
          : [];
        const demoUrl = row[10]?.toString().trim() || '';
        const status =
          row[11]?.toString().toLowerCase().trim() === 'borrador' ? 'borrador' : 'activo';
        const updatedAt = row[12]?.toString().trim() || new Date().toISOString().split('T')[0];
        const isFree =
          row[13]?.toString().toUpperCase().trim() === 'SI' ||
          row[13]?.toString().toLowerCase().trim() === 'true' ||
          (price === 0 && Boolean(row[14]?.toString().trim()));
        const downloadUrl = row[14]?.toString().trim() || '';

        return {
          id,
          name,
          category,
          eventType,
          price,
          currency,
          photoUrl,
          description,
          features,
          tags,
          demoUrl,
          status,
          updatedAt,
          isFree,
          downloadUrl,
        };
      });

    return {
      success: true,
      data: products,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Error de conexión con Google Sheets.',
    };
  }
}

/**
 * Saves/overwrites the product catalog to the Google Sheet.
 */
export async function saveProductsToSheet(
  accessToken: string,
  spreadsheetId: string,
  products: Product[]
): Promise<SheetOperationResult<boolean>> {
  try {
    const sheetName = 'Catalogo_Productos';

    // Upload any base64 images to Google Drive to obtain permanent, lightweight URLs
    for (const p of products) {
      if (p.photoUrl && p.photoUrl.startsWith('data:image/')) {
        try {
          const driveResult = await uploadImageToGoogleDrive(
            accessToken,
            p.photoUrl,
            `${p.id || 'producto'}_imagen.jpg`
          );
          if (driveResult.success && driveResult.url) {
            p.photoUrl = driveResult.url;
          }
        } catch (uploadErr) {
          console.warn('Could not auto-upload photo to Google Drive:', uploadErr);
        }
      }
    }

    // Format and sanitize rows to strictly respect Google Sheets' 50,000 character limit per cell
    const rows = products.map((p) => [
      sanitizeSheetCell(p.id),
      sanitizeSheetCell(p.name),
      sanitizeSheetCell(p.category),
      sanitizeSheetCell(p.eventType),
      sanitizeSheetCell(p.price.toString()),
      sanitizeSheetCell(p.currency),
      sanitizeSheetCell(p.photoUrl, true),
      sanitizeSheetCell(p.description),
      sanitizeSheetCell(p.features.join(' | ')),
      sanitizeSheetCell(p.tags.join(', ')),
      sanitizeSheetCell(p.demoUrl),
      sanitizeSheetCell(p.status),
      sanitizeSheetCell(p.updatedAt),
      sanitizeSheetCell(p.isFree ? 'SI' : 'NO'),
      sanitizeSheetCell(p.downloadUrl || ''),
    ]);

    const values = [HEADERS, ...rows];

    // Clear previous rows
    await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetName}!A1:O500:clear`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // Write updated values
    const res = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetName}!A1:O${values.length}?valueInputOption=USER_ENTERED`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values,
        }),
      }
    );

    if (!res.ok) {
      const err = await res.json();
      return {
        success: false,
        error: err.error?.message || 'Error al guardar los productos en Google Sheets.',
      };
    }

    return { success: true, data: true };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Error inesperado al guardar en Google Sheets.',
    };
  }
}

/**
 * Fetches products publicly from a shared Google Sheet (requires "Anyone with link - Viewer").
 * Works in Incognito, on mobile devices, and for all public visitors without needing login.
 */
export async function fetchPublicProductsFromSheet(
  spreadsheetId: string
): Promise<SheetOperationResult<Product[]>> {
  if (!spreadsheetId) {
    return { success: false, error: 'ID de planilla no provisto.' };
  }

  try {
    const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:json&sheet=Catalogo_Productos`;
    const res = await fetch(url);
    if (!res.ok) {
      return { success: false, error: 'No se pudo acceder a la planilla pública.' };
    }

    const text = await res.text();
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start === -1 || end === -1) {
      return { success: false, error: 'Respuesta inválida de Google Sheets.' };
    }

    const json = JSON.parse(text.substring(start, end + 1));
    const rawRows = json.table?.rows || [];
    const products: Product[] = [];

    for (let index = 0; index < rawRows.length; index++) {
      const c = rawRows[index]?.c || [];
      const getVal = (colIndex: number): string => {
        const cell = c[colIndex];
        if (!cell) return '';
        if (cell.f !== undefined && cell.f !== null) return String(cell.f).trim();
        if (cell.v !== undefined && cell.v !== null) return String(cell.v).trim();
        return '';
      };

      const id = getVal(0) || `oriccia-${Date.now().toString().slice(-4)}`;
      const name = getVal(1);
      if (!name) continue;

      const category = getVal(2) || 'Invitaciones Digitales';
      const eventType = getVal(3) || '';
      const priceRaw = getVal(4);
      const price = parseFloat(priceRaw.replace(/[^0-9.]/g, '') || '0') || 0;
      const currency = getVal(5) || 'USD';
      const photoUrl = getVal(6) || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80';
      const description = getVal(7) || '';
      const featuresStr = getVal(8);
      const features = featuresStr
        ? featuresStr.split('|').map((f) => f.trim()).filter(Boolean)
        : [
            'Hipervínculos interactivos fluidos',
            'Diseño responsivo para móviles y tablets',
            'Botón de confirmación de asistencia (RSVP)',
          ];
      const tagsStr = getVal(9);
      const tags = tagsStr
        ? tagsStr.split(',').map((t) => t.trim()).filter(Boolean)
        : ['Digital', 'Minimalista', 'Elegante'];
      const demoUrl = getVal(10) || '';
      const rawStatus = (getVal(11) || 'activo').toLowerCase();
      const status: 'activo' | 'borrador' = rawStatus === 'borrador' ? 'borrador' : 'activo';
      const updatedAt = getVal(12) || new Date().toISOString().split('T')[0];
      const isFreeStr = getVal(13).toUpperCase();
      const isFree =
        isFreeStr === 'SI' || isFreeStr === 'SÍ' || isFreeStr === 'TRUE' || isFreeStr === '1';
      const downloadUrl = getVal(14) || '';

      products.push({
        id,
        name,
        category,
        eventType,
        price,
        currency,
        photoUrl,
        description,
        features,
        tags,
        demoUrl,
        status,
        updatedAt,
        isFree,
        downloadUrl,
      });
    }

    return {
      success: true,
      data: products,
    };
  } catch (error: any) {
    console.error('Error in fetchPublicProductsFromSheet:', error);
    return {
      success: false,
      error: error.message || 'Error inesperado al leer planilla pública.',
    };
  }
}

/**
 * Appends a customer inquiry record when someone clicks WhatsApp order button.
 */
export async function logWhatsAppInquiry(
  accessToken: string | null,
  spreadsheetId: string | null,
  product: Product
): Promise<void> {
  if (!accessToken || !spreadsheetId) return;

  try {
    const timestamp = new Date().toLocaleString('es-ES', { timeZone: 'America/Argentina/Buenos_Aires' });
    const row = [
      timestamp,
      product.id,
      product.name,
      product.price.toString(),
      product.currency,
      'Click en WhatsApp (Consulta de Compra)',
    ];

    await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Consultas_WhatsApp!A:F:append?valueInputOption=USER_ENTERED`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values: [row],
        }),
      }
    );
  } catch (err) {
    console.warn('Could not log WhatsApp inquiry to sheet:', err);
  }
}
