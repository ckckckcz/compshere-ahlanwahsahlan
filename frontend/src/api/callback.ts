import { NextApiRequest, NextApiResponse } from 'next';
let latestScan: { tagId?: string; ndefText?: string; tagType?: string; nik?: string } = {};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { tagid, text, type } = req.query;

    // Simpan data ke latestScan
    latestScan = {
      tagId: tagid as string || 'N/A',
      ndefText: text as string || 'No NDEF Text',
      tagType: type as string || 'Unknown',
      nik: (text as string) || (tagid as string) || '3374061234567890',
    };

    console.log('NFC Data Received:', latestScan);


    const queryParams = new URLSearchParams({
      tagId: latestScan.tagId ?? 'N/A',
      ndefText: latestScan.ndefText ?? 'No NDEF Text',
      tagType: latestScan.tagType ?? 'Unknown',
      nik: latestScan.nik ?? '3374061234567890',
    }).toString();
    res.redirect(302, `${queryParams}`);
  } else {
    res.status(405).send('Method Not Allowed');
  }
}