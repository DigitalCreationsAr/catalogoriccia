/**
 * Utility to upload product images and files directly to Google Drive
 * using the authenticated Google user's access token and the drive.file scope.
 */

export interface DriveUploadResult {
  success: boolean;
  url?: string;
  fileId?: string;
  error?: string;
}

/**
 * Uploads a base64 Data URL or Blob to Google Drive and makes it viewable
 * via direct Google CDN link (https://lh3.googleusercontent.com/d/{fileId}).
 */
export async function uploadImageToGoogleDrive(
  accessToken: string,
  dataUrlOrBlob: string | Blob,
  fileName = `oriccia_img_${Date.now()}.jpg`
): Promise<DriveUploadResult> {
  if (!accessToken) {
    return { success: false, error: 'Token de acceso no disponible para Google Drive.' };
  }

  try {
    let blob: Blob;
    let mimeType = 'image/jpeg';

    if (typeof dataUrlOrBlob === 'string') {
      // If it's already a regular web URL, no upload needed
      if (!dataUrlOrBlob.startsWith('data:')) {
        return { success: true, url: dataUrlOrBlob };
      }

      // Parse base64
      const match = dataUrlOrBlob.match(/^data:([^;]+);base64,(.+)$/);
      if (match) {
        mimeType = match[1] || 'image/jpeg';
        const base64Data = match[2];
        const binaryString = atob(base64Data);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        blob = new Blob([bytes], { type: mimeType });
      } else {
        const fetchRes = await fetch(dataUrlOrBlob);
        blob = await fetchRes.blob();
        mimeType = blob.type || 'image/jpeg';
      }
    } else {
      blob = dataUrlOrBlob;
      mimeType = blob.type || 'image/jpeg';
    }

    // Step 1: Create file metadata
    const metaRes = await fetch('https://www.googleapis.com/drive/v3/files', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: fileName,
        mimeType: mimeType,
        description: 'Imagen cargada desde el catálogo Oriccia',
      }),
    });

    if (!metaRes.ok) {
      const err = await metaRes.json().catch(() => ({}));
      return {
        success: false,
        error: err.error?.message || 'No se pudo crear el archivo en Google Drive.',
      };
    }

    const metaData = await metaRes.json();
    const fileId = metaData.id;

    // Step 2: Upload media content
    const uploadRes = await fetch(
      `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': mimeType,
        },
        body: blob,
      }
    );

    if (!uploadRes.ok) {
      const err = await uploadRes.json().catch(() => ({}));
      return {
        success: false,
        error: err.error?.message || 'No se pudo subir el contenido binario a Google Drive.',
      };
    }

    // Step 3: Set public reader permission so anyone can view the image
    try {
      await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}/permissions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role: 'reader',
          type: 'anyone',
        }),
      });
    } catch (permErr) {
      console.warn('Could not set public permission on Google Drive file:', permErr);
    }

    // Direct Google CDN thumbnail URL (works reliably in <img> tags and Google Sheets)
    const directUrl = `https://lh3.googleusercontent.com/d/${fileId}`;

    return {
      success: true,
      url: directUrl,
      fileId,
    };
  } catch (error: any) {
    console.error('Error in uploadImageToGoogleDrive:', error);
    return {
      success: false,
      error: error.message || 'Error inesperado al subir imagen a Google Drive.',
    };
  }
}
