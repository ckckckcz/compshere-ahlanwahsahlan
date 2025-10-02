"use client";
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

const NfcResultPage = () => {
  const [nfcData, setNfcData] = useState<any>(null);
  const searchParams = useSearchParams();

  const tagId = searchParams.get('tagId');
  const ndefText = searchParams.get('ndefText');
  const tagType = searchParams.get('tagType');
  const nik = searchParams.get('nik');
  const nama = searchParams.get('nama');
  const tempatLahir = searchParams.get('tempatLahir');
  const tanggalLahir = searchParams.get('tanggalLahir');
  const jenisKelamin = searchParams.get('jenisKelamin');
  const alamat = searchParams.get('alamat');
  const rt = searchParams.get('rt');
  const rw = searchParams.get('rw');
  const kelurahan = searchParams.get('kelurahan');
  const kecamatan = searchParams.get('kecamatan');
  const agama = searchParams.get('agama');
  const statusPerkawinan = searchParams.get('statusPerkawinan');
  const pekerjaan = searchParams.get('pekerjaan');
  const kewarganegaraan = searchParams.get('kewarganegaraan');
  const berlakuHingga = searchParams.get('berlakuHingga');
  const source = searchParams.get('source');

  useEffect(() => {
    if (tagId || ndefText || tagType || nik) {
      setNfcData({
        tagId: tagId || 'N/A',
        ndefText: ndefText || 'No NDEF Text',
        tagType: tagType || 'Unknown',
        nik: nik || 'N/A',
        nama, tempatLahir, tanggalLahir, jenisKelamin, alamat, rt, rw, kelurahan, kecamatan, agama,
        statusPerkawinan, pekerjaan, kewarganegaraan, berlakuHingga,
        isDummy: source === 'dummy-test',
      });
    }
  }, [tagId, ndefText, tagType, nik, nama, tempatLahir, tanggalLahir, jenisKelamin, alamat, rt, rw, kelurahan, kecamatan, agama, statusPerkawinan, pekerjaan, kewarganegaraan, berlakuHingga, source]);

  const expoGoLink = 'exp://192.168.3.204:8081';
  const handleScanAgain = () => window.location.href = expoGoLink;
  const copyExpoLink = () => navigator.clipboard.writeText(expoGoLink).then(() => alert('Link Expo Go berhasil dicopy!'));

  return (
    <div style={{ textAlign: 'center', padding: '50px', backgroundColor: '#f0f0f0' }}>
      <h1>Hasil Scan e-KTP</h1>
      <p>Data NFC yang diterima dari e-KTP:</p>
      {nfcData ? (
        <div style={{ marginTop: '20px' }}>
          {nfcData.isDummy && (
            <div style={{ backgroundColor: '#fff3cd', border: '1px solid #ffeaa7', borderRadius: '4px', padding: '10px', marginBottom: '15px' }}>
              <strong>⚠️ DUMMY DATA untuk Testing</strong>
            </div>
          )}
          <h3>Data NFC Teknis:</h3>
          <div style={{ textAlign: 'left', maxWidth: '400px', margin: '0 auto', backgroundColor: 'white', padding: '15px', borderRadius: '8px' }}>
            <p><strong>TAG ID:</strong> {nfcData.tagId}</p>
            <p><strong>NDEF Text:</strong> {nfcData.ndefText}</p>
            <p><strong>Tag Type:</strong> {nfcData.tagType}</p>
          </div>
          {nfcData.nama && (
            <>
              <h3 style={{ marginTop: '25px' }}>Data e-KTP:</h3>
              <div style={{ textAlign: 'left', maxWidth: '500px', margin: '0 auto', backgroundColor: 'white', padding: '20px', borderRadius: '8px', border: '2px solid #4CAF50' }}>
                <p><strong>NIK:</strong> {nfcData.nik}</p>
                <p><strong>Nama:</strong> {nfcData.nama || 'N/A'}</p>
                <p><strong>Tempat/Tgl Lahir:</strong> {nfcData.tempatLahir || 'N/A'}, {nfcData.tanggalLahir || 'N/A'}</p>
                <p><strong>Jenis Kelamin:</strong> {nfcData.jenisKelamin || 'N/A'}</p>
                <p><strong>Alamat:</strong> {nfcData.alamat || 'N/A'}</p>
                <p><strong>RT/RW:</strong> {nfcData.rt || 'N/A'}/{nfcData.rw || 'N/A'}</p>
                <p><strong>Kel/Desa:</strong> {nfcData.kelurahan || 'N/A'}</p>
                <p><strong>Kecamatan:</strong> {nfcData.kecamatan || 'N/A'}</p>
                <p><strong>Agama:</strong> {nfcData.agama || 'N/A'}</p>
                <p><strong>Status Perkawinan:</strong> {nfcData.statusPerkawinan || 'N/A'}</p>
                <p><strong>Pekerjaan:</strong> {nfcData.pekerjaan || 'N/A'}</p>
                <p><strong>Kewarganegaraan:</strong> {nfcData.kewarganegaraan || 'N/A'}</p>
                <p><strong>Berlaku Hingga:</strong> {nfcData.berlakuHingga || 'N/A'}</p>
              </div>
            </>
          )}
        </div>
      ) : (
        <p style={{ marginTop: '20px' }}>Belum ada data NFC. Mulai scan dengan tombol di bawah.</p>
      )}
      <div style={{ marginTop: '20px' }}>
        <button onClick={handleScanAgain} style={{ backgroundColor: '#4CAF50', color: 'white', padding: '15px 32px', border: 'none', fontSize: '16px', cursor: 'pointer', borderRadius: '4px', marginRight: '10px' }}>
          {nfcData ? 'Scan e-KTP Lagi' : 'Mulai Scan e-KTP'}
        </button>
        <button onClick={copyExpoLink} style={{ backgroundColor: '#FF9800', color: 'white', padding: '15px 20px', border: 'none', fontSize: '14px', cursor: 'pointer', borderRadius: '4px' }}>
          Copy Link Expo Go
        </button>
      </div>
      <p style={{ fontSize: '12px', color: '#666', marginTop: '15px' }}>Expo Go Link: <code>{expoGoLink}</code></p>
    </div>
  );
};

export default NfcResultPage;