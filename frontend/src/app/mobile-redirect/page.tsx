"use client";
import { useEffect } from 'react';

export default function MobileRedirect() {
  useEffect(() => {
    // Coba buka aplikasi mobile via Expo Go (ke halaman utama/scan)
    window.location.href = 'exp://192.168.212.201:8081';
    
    // Fallback ke nfc-result setelah 3 detik
    setTimeout(() => {
      window.location.href = '/nfc-result';
    }, 3000);
  }, []);

  return (
    <div style={{ textAlign: 'center', padding: '50px', backgroundColor: '#f0f0f0' }}>
      <h2>Membuka Aplikasi Mobile...</h2>
      <p>Mencoba membuka aplikasi melalui Expo Go...</p>
      <p>Jika aplikasi tidak terbuka dalam 3 detik, Anda akan diarahkan kembali ke halaman hasil.</p>
      <div style={{ marginTop: '20px' }}>
        <a 
          href="exp://192.168.212.201:8081"
          style={{
            backgroundColor: '#4CAF50',
            color: 'white',
            padding: '10px 20px',
            textDecoration: 'none',
            borderRadius: '4px',
            marginRight: '10px'
          }}
        >
          Buka di Expo Go
        </a>
        <a 
          href="/nfc-result"
          style={{
            backgroundColor: '#008CBA',
            color: 'white',
            padding: '10px 20px',
            textDecoration: 'none',
            borderRadius: '4px'
          }}
        >
          Kembali ke Hasil
        </a>
      </div>
    </div>
  );
}
