// server.js
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 6732;

app.use(cors());
app.use(express.json());

// In-memory "database"
let users = [];    // { uid, nama, createdAt }
let tickets = [];  // { uid, event, createdAt }

// Register manual
app.post('/api/register', (req, res) => {
  const { uid, nama } = req.body;
  console.log("📥 /api/register request:", req.body);

  if (!uid || !nama) {
    return res.status(400).json({ success: false, message: 'UID dan Nama diperlukan' });
  }

  const exists = users.find(u => u.uid === uid);
  if (exists) {
    return res.json({ success: false, message: 'UID sudah terdaftar' });
  }

  const newUser = { uid, nama, createdAt: new Date().toISOString() };
  users.push(newUser);
  console.log("✅ UID berhasil ditambahkan:", newUser);

  return res.json({ success: true, user: newUser });
});

// Assign ticket
app.post('/api/assign-ticket', (req, res) => {
  const { uid, event } = req.body;
  console.log("📥 /api/assign-ticket request:", req.body);

  if (!uid || !event) {
    return res.status(400).json({ success: false, message: 'UID dan Event diperlukan' });
  }

  const user = users.find(u => u.uid === uid);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User belum terdaftar' });
  }

  const newTicket = { uid, event, createdAt: new Date().toISOString() };
  tickets.push(newTicket);
  console.log("✅ Tiket berhasil assign:", newTicket);

  return res.json({ success: true, ticket: newTicket });
});

// Check ticket
app.post('/api/check-ticket', (req, res) => {
  const { uid } = req.body;
  console.log("📥 /api/check-ticket request:", req.body);

  if (!uid) {
    return res.status(400).json({ success: false, message: 'UID diperlukan' });
  }

  const ticket = tickets.find(t => t.uid === uid);
  if (!ticket) {
    return res.json({ success: false, message: 'Belum ada tiket' });
  }

  const user = users.find(u => u.uid === uid) || { nama: null };
  console.log("✅ Tiket ditemukan:", { ...ticket, nama: user.nama });

  return res.json({ success: true, ticket: { ...ticket, nama: user.nama } });
});

// Get all users (useful to obtain latest scanned UID)
app.get('/api/users', (req, res) => {
  return res.json(users);
});

// Callback from NFC Tools PRO (WebAPP API GET)
// NFC Tools will call this URL replacing placeholders like {TAG-ID} and {NDEF-TEXT}
app.get('/api/callback', (req, res) => {
  console.log("📥 /api/callback raw query:", req.query);

  // read common param names (tolerant)
  const tag = req.query.tagid || req.query['TAG-ID'] || req.query.TAGID || req.query.tagId || req.query.tag;
  const ndefText = req.query.text || req.query['NDEF-TEXT'] || req.query.ndef || "";

  if (!tag) {
    console.log("❌ Callback tanpa tagid diterima");
    return res.status(400).json({ success: false, message: 'TAG-ID diperlukan' });
  }

  // auto-register if not exists
  let user = users.find(u => u.uid === tag);
  if (!user) {
    user = { uid: tag, nama: ndefText || "Unknown", createdAt: new Date().toISOString() };
    users.push(user);
    console.log("✅ UID baru ditambahkan via callback:", user);
  } else {
    console.log("ℹ️ UID sudah terdaftar (callback):", user.uid);
    if ((user.nama === "Unknown" || !user.nama) && ndefText) {
      user.nama = ndefText;
      console.log("ℹ️ Nama user diupdate dari callback:", user);
    }
  }

  // respond with JSON; NFC Tools accepts any valid HTTP response
  return res.json({
    success: true,
    message: "Callback diterima",
    user,
  });
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT} (PORT=${PORT})`);
});
