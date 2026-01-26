/**
 * Converts a Base64 encoded string into a Blob object.
 * Handles both raw Base64 strings and data URLs with Base64 content.
 *
 * @param base64 - The Base64 encoded string
 * @param mimeType - The MIME type for the Blob (default: 'application/octet-stream')
 * @returns A Blob object containing the decoded data
 */
export const base64ToBlob = (base64: string, mimeType = 'application/octet-stream'): Blob => {
  // Remove data URL prefix if present
  const cleanedBase64 = base64.includes(',') ? base64.split(',')[1] : base64;

  // Decode Base64 → binary string
  const binary = atob(cleanedBase64);

  const len = binary.length;
  const bytes = new Uint8Array(len);

  // Convert binary string → bytes
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  return new Blob([bytes], { type: mimeType });
};

/**
 * Triggers a file download from an object URL.
 * Note: The caller is responsible for revoking the object URL with URL.revokeObjectURL() to free memory.
 *
 * @param objectUrl - The object URL to download from
 * @param fileName - The name to save the file as
 */
export const downloadFromObjectUrl = (objectUrl: string, fileName: string): void => {
  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
