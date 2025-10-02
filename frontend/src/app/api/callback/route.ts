import { NextRequest, NextResponse } from 'next/server';

// Shared state dengan get-latest-scan
let latestScan: { tagId?: string; ndefText?: string; tagType?: string; nik?: string } = {};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tagid = searchParams.get('tagid');
  const text = searchParams.get('text');
  const type = searchParams.get('type');

  // Simpan data ke latestScan
  latestScan = {
    tagId: tagid || 'N/A',
    ndefText: text || 'No NDEF Text',
    tagType: type || 'ISO14443_TYPE_A',
    nik: text || tagid || '3374061234567890',
  };

  console.log('NFC Data Received:', latestScan);

  // Redirect langsung dengan JavaScript untuk menghindari dialog
  const queryParams = new URLSearchParams({
    tagId: latestScan.tagId ?? 'N/A',
    ndefText: latestScan.ndefText ?? 'No NDEF Text',  
    tagType: latestScan.tagType ?? 'ISO14443_TYPE_A',
    nik: latestScan.nik ?? '3374061234567890',
    source: 'nfc-scan'
  }).toString();
  
  const redirectUrl = `https://a181b33da136.ngrok-free.app/nfc-result?${queryParams}`;
  
  // Return JavaScript redirect yang langsung execute
  const jsRedirectHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>NFC Scan Complete</title>
      </head>
      <body>
        <script>
          // Langsung redirect tanpa delay
          window.location.replace('${redirectUrl}');
        </script>
        <noscript>
          <meta http-equiv="refresh" content="0;url=${redirectUrl}">
        </noscript>
      </body>
    </html>
  `;
  
  return new NextResponse(jsRedirectHtml, {
    status: 200,
    headers: { 
      'Content-Type': 'text/html',
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    },
  });
}
