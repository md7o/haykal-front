/**
 * Local file upload handler (frontend only)
 * Creates local URLs for files without backend upload
 */

export interface UploadedAsset {
  url: string;
  filename: string;
  mimetype: string;
}

/**
 * Simulates file upload by creating a local object URL
 * Files are stored in memory and can be accessed via the returned URL
 */
export const uploadFile = async (file: File): Promise<UploadedAsset> => {
  // Create a local object URL for the file
  const localUrl = URL.createObjectURL(file);

  // Return mock asset data
  return {
    url: localUrl,
    filename: file.name,
    mimetype: file.type || "application/octet-stream",
  };
};
