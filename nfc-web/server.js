const express = require('express');
const cors = require('cors');
const callbackUrl = encodeURIComponent('http://10.10.79.60:3000/nfc-callback?tagid={TAG-ID}&text={NDEF-TEXT}');
const app = express();

app.use(cors());
app.use(express.static('public'));

// endpoint callback NFC Tools
app.get('/nfc-callback', (req, res) => {
  const { tagid, text } = req.query;
  console.log('NFC Data:', { tagid, text });
  res.send(`Terima data NFC: ${tagid} / ${text}`);
});

app.listen(3000, () => console.log('Server running at http://localhost:3000'));