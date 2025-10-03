// server.js
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 6732;

// Middleware untuk JSON dan URL encoded (form)
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// In-memory "database"
let users = [];    // { uid, nama, createdAt }
let tickets = [];  // { uid, event, createdAt }

// Utility: normalisasi input untuk ambil uid dari berbagai kemungkinan payload
function extractUidFromBody(bodyOrQuery) {
  if (!bodyOrQuery) return null;
  // cek beberapa kemungkinan key yang mungkin dikirim oleh NFC Tools PRO atau custom task
  const candidates = [
    'uid', 'UID', 'Uid',
    'tagid', 'TAG-ID', 'TAGID', 'tagId', 'tag',
    '{UID}', '{TAG-ID}', 'id'
  ];

  for (const key of candidates) {
    if (bodyOrQuery[key]) return String(bodyOrQuery[key]);
  }

  // NFC Tools kadang mengirim payload JSON string in a field. Try to detect
  if (typeof bodyOrQuery === 'string') {
    // coba ekstrak hex-like uid (contoh: 04A1B2C3...)
    const m = bodyOrQuery.match(/([0-9A-F]{6,})/i);
    if (m) return m[1];
  }

  return null;
}

// --- Endpoints ---

// Register manual (POST /api/register)
// Menerima JSON atau form body. Field utama: uid, nama
app.post('/api/register', (req, res) => {
  // ambil uid robustly
  const uid = extractUidFromBody(req.body) || null;
  const nama = req.body.nama || req.body.name || req.body.fullname || req.body.NAMA || null;

  console.log("📥 /api/register request body:", req.body);

  if (!uid || !nama) {
    return res.status(400).json({ success: false, message: 'UID dan Nama diperlukan' });
  }

  const exists = users.find(u => u.uid === uid);
  if (exists) {
    return res.json({ success: false, message: 'UID sudah terdaftar', user: exists });
  }

  const newUser = { uid, nama, createdAt: new Date().toISOString() };
  users.push(newUser);
  console.log("✅ UID berhasil ditambahkan:", newUser);

  return res.json({ success: true, user: newUser });
});

// Assign ticket (POST /api/assign-ticket)
app.post('/api/assign-ticket', (req, res) => {
  const uid = extractUidFromBody(req.body);
  const event = req.body.event || req.body.nama_event || req.body.eventName || null;

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

// Check ticket (POST /api/check-ticket)
app.post('/api/check-ticket', (req, res) => {
  const uid = extractUidFromBody(req.body);
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

// GET all users (GET /api/users)
app.get('/api/users', (req, res) => {
  return res.json(users);
});

// GET latest user (GET /api/latest)
app.get('/api/latest', (req, res) => {
  if (users.length === 0) return res.json({ success: false, message: 'Belum ada user' });
  const last = users[users.length - 1];
  return res.json({ success: true, user: last });
});

// Callback from NFC Tools PRO (GET /api/callback)
// sesuai dokumentasi wakdev: NFC Tools biasanya memanggil callback URL lewat GET
app.get('/api/callback', (req, res) => {
  console.log("📥 /api/callback (GET) raw query:", req.query);

  const uid = extractUidFromBody(req.query);
  // juga ambil possible ndef text
  const ndefText = req.query.text || req.query['NDEF-TEXT'] || req.query.ndef || req.query.name || '';

  if (!uid) {
    console.log("❌ Callback GET tanpa tagid diterima:", req.query);
    return res.status(400).json({ success: false, message: 'TAG-ID diperlukan' });
  }

  // Auto-register jika belum ada
  let user = users.find(u => u.uid === uid);
  if (!user) {
    user = { uid, nama: ndefText || "Unknown", createdAt: new Date().toISOString() };
    users.push(user);
    console.log("✅ UID baru ditambahkan via callback(GET):", user);
  } else {
    console.log("ℹ️ UID sudah terdaftar (callback GET):", uid);
    if ((!user.nama || user.nama === "Unknown") && ndefText) {
      user.nama = ndefText;
      console.log("ℹ️ Nama user diupdate dari callback(GET):", user);
    }
  }

  // Balasan JSON (NFC Tools menerima berbagai respons)
  return res.json({ success: true, message: 'Callback diterima', user });
});

// ALSO accept POST callback (POST /api/callback) — karena NFC Tools Task bisa dikonfigurasi POST
app.post('/api/callback', (req, res) => {
  console.log("📥 /api/callback (POST) raw body:", req.body);

  const uid = extractUidFromBody(req.body);
  const ndefText = req.body.text || req.body['NDEF-TEXT'] || req.body.ndef || req.body.name || '';

  if (!uid) {
    console.log("❌ Callback POST tanpa uid diterima:", req.body);
    return res.status(400).json({ success: false, message: 'UID diperlukan' });
  }

  let user = users.find(u => u.uid === uid);
  if (!user) {
    user = { uid, nama: ndefText || "Unknown", createdAt: new Date().toISOString() };
    users.push(user);
    console.log("✅ UID baru ditambahkan via callback(POST):", user);
  } else {
    console.log("ℹ️ UID sudah terdaftar (callback POST):", uid);
    if ((!user.nama || user.nama === "Unknown") && ndefText) {
      user.nama = ndefText;
      console.log("ℹ️ Nama user diupdate dari callback(POST):", user);
    }
  }

  return res.json({ success: true, message: 'Callback POST diterima', user });
});

// Optional: clear data (for testing) — GET /api/clear?secret=yourtestsecret
app.get('/api/clear', (req, res) => {
  const secret = req.query.secret || '';
  // simple protection so it won't be accidentally called in prod
  if (secret !== 'clear-all-testing') {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }
  users = [];
  tickets = [];
  return res.json({ success: true, message: 'Data cleared (testing only)' });
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT} (PORT=${PORT})`);
});
