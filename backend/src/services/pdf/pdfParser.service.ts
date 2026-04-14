import pdfParse from 'pdf-parse';
import { logger } from '../../config/logger';

export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    const data = await pdfParse(buffer);
    const text = data.text.trim();

    if (!text || text.length < 50) {
      throw new Error('Could not extract readable text from PDF. Please try a different file.');
    }

    logger.debug(`PDF extracted: ${text.length} characters`);
    return text;
  } catch (err: any) {
    if (err.message.includes('Could not extract')) throw err;
    logger.error('PDF parse error:', err);
    throw new Error('Failed to read PDF. Ensure it is a text-based PDF, not a scanned image.');
  }
}
