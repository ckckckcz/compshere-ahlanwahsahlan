# KAI Connect

KAI Connect adalah sebuah platform berbasis web yang dirancang untuk mendukung digitalisasi layanan Kereta Api Indonesia (KAI) dengan menghadirkan pengalaman perjalanan yang lebih efisien, modern, dan ramah pengguna. Sistem ini memadukan teknologi OCR, Artificial Intelligence, dan visualisasi peta untuk menjawab kebutuhan penumpang sekaligus memperkuat operasional KAI.

## Struktur Direktori
```text
.
├── frontend/                 Aplikasi Next.js untuk antarmuka web
├── backend/
│   ├── main.py               Titik masuk Flask untuk REST API
│   ├── api.py                Registrasi rute autentikasi, profil, pembayaran, dan OCR
│   ├── controller/           Logika fitur (pengguna, keluarga, kursi, deteksi)
│   ├── model/                Akses data Supabase
│   ├── model_detection/      Model YOLO untuk KTP dan KK
│   ├── rag/                  Paket FastAPI chatbot berbasis RAG
│   └── server/               Aplikasi FastAPI yang mengekspos layanan RAG
└── nfc-web/                  (Persiapan Next Development dan Sudah Terintegrasi Dengan NFC Tools PRO)
```

## Frontend Web
- Dibangun dengan Next.js 15, React 19, Tailwind CSS 4, Radix UI, GSAP, dan Supabase JS.
- Struktur modul utama berada di `frontend/src/{app,components,data,lib}`.
- Menyediakan halaman onboarding, pemesanan, dan widget chatbot yang terhubung ke layanan AI.
- Cara menjalankan:
  ```bash
  cd frontend
  pnpm install
  pnpm dev
  # aplikasi tersedia di http://localhost:3000
  ```

## Backend REST
- Memakai Flask sebagai kerangka kerja utama dengan dukungan Flask-CORS untuk berbagi sumber antar domain.
- Otentikasi dan manajemen pengguna menggunakan Supabase Python SDK serta Authlib untuk OAuth Google.
- Integrasi pembayaran dilakukan melalui Midtransclient.
- Deteksi dokumen memanfaatkan Ultralytics YOLO, EasyOCR, Pillow, dan NumPy.
- Endpoint utama meliputi login, registrasi, pembaruan profil dengan unggahan foto, pengelolaan keluarga, kursi, transaksi, serta `POST /api/send/{ktp|kk}` untuk ekstraksi data identitas.
- Langkah eksekusi:
  ```bash
  cd backend
  pip install -r requirements.txt
  flask --app main run --port 5000
  ```
  Disarankan menyiapkan variabel konfigurasi privat sebelum menjalankan layanan.

## Layanan AI
### Deteksi Dokumen & OCR
- Model YOLO terbaru tersedia di:
  - [`backend/model_detection/model_ktp.pt`](backend/model_detection/model_ktp.pt)
  - [`backend/model_detection/model_kk.pt`](backend/model_detection/model_kk.pt)
  - [`backend/model_detection/best.pt`](backend/model_detection/best.pt)
- Alur proses berada di `backend/controller/detection_controller.py` dengan keluaran nama, NIK, dan jenis kelamin (atau daftar anggota keluarga untuk KK).

### Chatbot RAG
- Modul FastAPI dapat ditemukan pada `backend/server/main.py`, sementara logika RAG berada di `backend/rag/`.
- Penyimpanan pengetahuan berada di [`backend/rag/data/knowledge`](backend/rag/data/knowledge).
- Vektor embedding disimpan di [`backend/rag/storage/index.npz`](backend/rag/storage/index.npz) dan metadata terkait di [`backend/rag/storage/meta.json`](backend/rag/storage/meta.json).
- Model bahasa diakses melalui OpenRouter dengan lapisan proxy pada `backend/rag/routers/openrouter_proxy.py`, sedangkan percakapan lengkap tersedia melalui `POST /rag/chat`.
- Untuk menjalankan layanan RAG:
  ```bash
  cd backend/server
  pip install -r requirements.txt
  uvicorn server.main:app --reload --port 8000
  ```

## Integrasi Frontend dan Backend
- Frontend memanggil REST API Flask untuk otentikasi, pengambilan profil, unggahan dokumen, dan transaksi pembayaran.
- Pemanggilan OCR dilakukan dengan mengunggah berkas ke `POST /api/send/ktp` atau `POST /api/send/kk`, lalu hasilnya dipakai untuk mengisi formulir penumpang.
- Widget chatbot melakukan permintaan ke `POST /rag/chat` guna memperoleh respons yang menggabungkan konteks pengetahuan internal dengan riwayat percakapan pengguna.
- Keduanya saling terhubung melalui konfigurasi basis URL yang disesuaikan pada saat deploy.

## Teknologi Utama
- **Frontend**
  - Next.js 15
  - React 19
  - TypeScript
  - Tailwind CSS 4
  - Radix UI
  - GSAP
  - Supabase JS
  - React Hook Form
  - Shadcn UI
- **Backend**
  - Flask & Flask-CORS
  - Supabase Python SDK
  - Authlib
  - Midtransclient
  - Ultralytics YOLO
  - EasyOCR
  - NumPy
  - FastAPI
  - Uvicorn
