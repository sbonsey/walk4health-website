import { put } from '@vercel/blob';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { image, filename, contentType } = req.body;
    
    if (!image || !filename) {
      return res.status(400).json({ error: 'Missing image or filename' });
    }

    // Convert base64 to buffer if needed
    let imageBuffer;
    if (typeof image === 'string' && image.startsWith('data:')) {
      // Handle base64 data URL
      const base64Data = image.split(',')[1];
      imageBuffer = Buffer.from(base64Data, 'base64');
    } else if (Buffer.isBuffer(image)) {
      imageBuffer = image;
    } else {
      return res.status(400).json({ error: 'Invalid image format' });
    }

    // Generate unique filename with timestamp
    const timestamp = Date.now();
    const uniqueFilename = `${timestamp}-${filename}`;
    
    // Upload to Vercel Blob
    const blob = await put(uniqueFilename, imageBuffer, {
      access: 'public',
      contentType: contentType || 'image/jpeg',
    });

    console.log('✅ Image uploaded successfully:', {
      filename: uniqueFilename,
      url: blob.url,
      size: blob.size
    });

    res.status(200).json({ 
      success: true, 
      url: blob.url,
      filename: uniqueFilename,
      size: blob.size
    });
  } catch (error) {
    console.error('❌ Image upload failed:', error);
    res.status(500).json({ 
      error: 'Upload failed', 
      details: error.message 
    });
  }
}
