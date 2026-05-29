import { generateWord } from '../../lib/wordGenerator';

export const config = {
  api: {
    bodyParser: { sizeLimit: '2mb' },
    responseLimit: '10mb',
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const data = req.body;
    const buffer = await generateWord(data);
    const shipName = data.ship_name || '新造船';
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(`船体部仕様書_${shipName}.docx`)}`);
    res.send(buffer);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
}
