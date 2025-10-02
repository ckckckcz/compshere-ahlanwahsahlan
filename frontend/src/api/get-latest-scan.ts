import { NextApiRequest, NextApiResponse } from 'next';

let latestScan: { tagId?: string; ndefText?: string; tagType?: string; nik?: string } = {};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    res.status(200).json(latestScan);
  } else if (req.method === 'POST') {
    latestScan = req.body;
    res.status(200).json({ message: 'Data updated' });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}