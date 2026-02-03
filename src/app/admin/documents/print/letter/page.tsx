'use client';

import { useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAssets } from '@/context/AssetContext';

// Format Rupiah
function formatRupiah(amount: number): string {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
}

export default function LetterPrintPage() {
    const searchParams = useSearchParams();
    const letterType = searchParams.get('type') || '';
    const assetId = searchParams.get('assetId') || '';
    const { assets } = useAssets();

    // Find the selected asset/debtor
    const selectedAsset = useMemo(() => {
        return assets.find((a) => a.id === assetId);
    }, [assets, assetId]);

    // Auto-print when page loads
    useEffect(() => {
        if (selectedAsset) {
            const timer = setTimeout(() => {
                window.print();
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [selectedAsset]);

    // Generate letter number
    const letterNumber = `${Math.floor(100 + Math.random() * 900)}/WK-COLL/${new Date().getFullYear()}`;
    const currentDate = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

    // Letter type configuration
    const letterConfig: Record<string, { title: string; subject: string; body: (asset: any) => string }> = {
        surat_tugas: {
            title: 'SURAT TUGAS PENAGIHAN',
            subject: 'Penugasan Penagihan Kredit',
            body: (asset) => `
Dengan ini kami menugaskan kepada Petugas Penagihan untuk melakukan kunjungan dan penagihan kepada:

<b>Nama Debitur:</b> ${asset.debtorName}
<b>No. Rekening:</b> ${asset.loanId}
<b>Cabang:</b> ${asset.branch}
<b>Alamat:</b> ${asset.identityAddress}

<b>Total Kewajiban:</b> ${formatRupiah(asset.totalArrears)}

Petugas penagihan diharapkan untuk:
1. Melakukan kunjungan ke alamat debitur
2. Melakukan negosiasi pembayaran tunggakan
3. Mengumpulkan bukti foto dan GPS koordinat
4. Melaporkan hasil kunjungan melalui sistem

Demikian surat tugas ini dibuat untuk dilaksanakan sebagaimana mestinya.
            `
        },
        somasi_1: {
            title: 'SURAT PERINGATAN PERTAMA (SOMASI I)',
            subject: 'Peringatan Pembayaran Tunggakan Kredit',
            body: (asset) => `
Yang Terhormat,<br/>
<b>${asset.debtorName}</b><br/>
${asset.identityAddress}

Dengan hormat,

Berdasarkan catatan kami, hingga saat ini terdapat tunggakan pembayaran kredit atas nama Saudara/i dengan rincian sebagai berikut:

<b>No. Rekening:</b> ${asset.loanId}
<b>Cabang:</b> ${asset.branch}
<b>Jenis Kredit:</b> ${asset.creditType}
<b>Total Tunggakan Pokok:</b> ${formatRupiah(asset.principalArrears || 0)}
<b>Tunggakan Bunga:</b> ${formatRupiah(asset.interestArrears || 0)}
<b>Denda:</b> ${formatRupiah(asset.penaltyArrears || 0)}
<b>TOTAL KEWAJIBAN:</b> <span style="color: #dc2626; font-weight: bold;">${formatRupiah(asset.totalArrears)}</span>

Melalui surat ini, kami meminta Saudara/i untuk segera menyelesaikan seluruh tunggakan tersebut <b>paling lambat 7 (tujuh) hari kerja</b> sejak tanggal surat ini diterbitkan.

Pembayaran dapat dilakukan di kantor cabang ${asset.branch} atau melalui transfer ke rekening perusahaan yang telah ditentukan.

Apabila dalam jangka waktu yang ditentukan Saudara/i tidak melakukan pembayaran, maka kami akan melanjutkan dengan langkah hukum yang berlaku, termasuk namun tidak terbatas pada penyitaan agunan.

Demikian surat peringatan ini kami sampaikan. Atas perhatian dan kerjasamanya, kami ucapkan terima kasih.
            `
        },
        somasi_2: {
            title: 'SURAT PERINGATAN KEDUA (SOMASI II)',
            subject: 'Peringatan Terakhir Pembayaran Tunggakan Kredit',
            body: (asset) => `
Yang Terhormat,<br/>
<b>${asset.debtorName}</b><br/>
${asset.identityAddress}

Dengan hormat,

Menindaklanjuti Surat Peringatan Pertama yang telah kami sampaikan sebelumnya, hingga saat ini kami belum menerima pembayaran tunggakan kredit atas nama Saudara/i.

<b>No. Rekening:</b> ${asset.loanId}
<b>Cabang:</b> ${asset.branch}
<b>TOTAL KEWAJIBAN:</b> <span style="color: #dc2626; font-weight: bold;">${formatRupiah(asset.totalArrears)}</span>

<b style="color: #dc2626;">INI ADALAH PERINGATAN TERAKHIR.</b>

Kami memberikan kesempatan terakhir kepada Saudara/i untuk menyelesaikan tunggakan selambat-lambatnya <b>3 (tiga) hari kerja</b> sejak surat ini diterbitkan.

Apabila Saudara/i tidak melakukan pembayaran dalam jangka waktu tersebut, maka:
1. Kami akan melakukan penarikan/penyitaan agunan sesuai ketentuan yang berlaku
2. Nama Saudara/i akan dilaporkan ke Otoritas Jasa Keuangan (OJK) 
3. Data tunggakan akan dilaporkan ke Sistem Layanan Informasi Keuangan (SLIK)
4. Proses hukum pidana dan perdata akan segera ditempuh

<b>KAMI SANGAT MENYARANKAN AGAR SAUDARA/I SEGERA MENGHUBUNGI KAMI UNTUK PENYELESAIAN TERBAIK.</b>

Demikian surat peringatan terakhir ini kami sampaikan dengan tegas.
            `
        },
        somasi_3: {
            title: 'SURAT PERINGATAN KETIGA (SOMASI III) - FINAL',
            subject: 'Pemberitahuan Eksekusi Agunan',
            body: (asset) => `
Yang Terhormat,<br/>
<b>${asset.debtorName}</b><br/>
${asset.identityAddress}

Dengan hormat,

Mengacu pada Surat Peringatan Pertama dan Kedua yang telah kami kirimkan namun tidak memperoleh tanggapan, dengan ini kami sampaikan bahwa:

<b>No. Rekening:</b> ${asset.loanId}
<b>Total Kewajiban:</b> <span style="color: #dc2626; font-weight: bold; font-size: 18px;">${formatRupiah(asset.totalArrears)}</span>

<b style="color: #dc2626; font-size: 16px;">PROSES EKSEKUSI AGUNAN AKAN SEGERA DILAKSANAKAN</b>

Berdasarkan:
- Perjanjian Kredit yang telah ditandatangani
- Undang-Undang Hak Tanggungan
- Ketentuan Otoritas Jasa Keuangan (OJK)

Kami akan melakukan:
1. <b>Penyitaan dan Pelelangan Agunan</b> sesuai prosedur hukum yang berlaku
2. <b>Pelaporan ke SLIK/BI Checking</b> yang akan berdampak pada histori kredit Saudara/i
3. <b>Penuntutan Pidana</b> atas tindak pidana penipuan dan penggelapan (jika terbukti)

<b>INI ADALAH KESEMPATAN TERAKHIR</b> untuk menyelesaikan kewajiban dalam <b>24 JAM</b>.

Hubungi kami segera di nomor: 021-XXXX-XXXX atau datang langsung ke kantor cabang ${asset.branch}.

Demikian surat ini kami sampaikan. Segala konsekuensi hukum menjadi tanggung jawab Saudara/i sepenuhnya.
            `
        }
    };

    const config = letterConfig[letterType] || letterConfig.somasi_1;

    if (!selectedAsset) {
        return (
            <div style={{ padding: '40px', textAlign: 'center' }}>
                <h3>Data debitur tidak ditemukan</h3>
                <p>Silakan kembali dan pilih debitur yang valid.</p>
            </div>
        );
    }

    return (
        <html lang="id">
            <head>
                <title>{config.title} - {selectedAsset.debtorName}</title>
                <style>{`
                    @page {
                        size: A4;
                        margin: 20mm;
                    }

                    * {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                    }

                    body {
                        font-family: 'Times New Roman', serif;
                        font-size: 12pt;
                        line-height: 1.6;
                        color: #000;
                        background: #fff;
                    }

                    .container {
                        max-width: 100%;
                        margin: 0 auto;
                    }

                    /* Kop Surat */
                    .letterhead {
                        border-bottom: 3px double #000;
                        padding-bottom: 15px;
                        margin-bottom: 30px;
                        display: flex;
                        align-items: center;
                        gap: 20px;
                    }

                    .logo-box {
                        flex: 0 0 80px;
                        height: 80px;
                        background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
                        border-radius: 8px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-weight: bold;
                        color: white;
                        font-size: 28px;
                    }

                    .company-info {
                        flex: 1;
                    }

                    .company-name {
                        font-size: 18pt;
                        font-weight: bold;
                        color: #1e40af;
                        margin-bottom: 5px;
                    }

                    .company-address {
                        font-size: 10pt;
                        color: #333;
                        line-height: 1.4;
                    }

                    /* Letter Metadata */
                    .letter-meta {
                        margin: 30px 0;
                        font-size: 11pt;
                    }

                    .letter-meta table {
                        width: 100%;
                    }

                    .letter-meta td {
                        padding: 3px 0;
                    }

                    .letter-meta td:first-child {
                        width: 120px;
                        font-weight: bold;
                    }

                    .letter-title {
                        text-align: center;
                        font-size: 14pt;
                        font-weight: bold;
                        text-decoration: underline;
                        margin: 30px 0 20px;
                        text-transform: uppercase;
                    }

                    .letter-subject {
                        margin: 20px 0;
                        font-size: 11pt;
                    }

                    .letter-subject strong {
                        display: inline-block;
                        width: 80px;
                    }

                    /* Letter Body */
                    .letter-body {
                        text-align: justify;
                        margin: 20px 0;
                        font-size: 11pt;
                        line-height: 1.8;
                    }

                    .letter-body b {
                        font-weight: bold;
                    }

                    /* Signature */
                    .signature-section {
                        margin-top: 60px;
                        display: flex;
                        justify-content: flex-end;
                    }

                    .signature-box {
                        width: 250px;
                        text-align: center;
                    }

                    .signature-label {
                        margin-bottom: 80px;
                        font-weight: bold;
                    }

                    .signature-name {
                        border-top: 1px solid #000;
                        padding-top: 5px;
                        font-weight: bold;
                    }

                    .signature-title {
                        font-size: 10pt;
                        color: #666;
                    }

                    /* Print styles */
                    @media print {
                        body {
                            -webkit-print-color-adjust: exact;
                            print-color-adjust: exact;
                        }

                        .no-print {
                            display: none;
                        }
                    }

                    /* Screen-only styles */
                    @media screen {
                        body {
                            padding: 20px;
                            background: #f3f4f6;
                        }

                        .container {
                            background: white;
                            padding: 40px;
                            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                            max-width: 800px;
                            margin: 0 auto;
                        }

                        .print-button {
                            position: fixed;
                            top: 20px;
                            right: 20px;
                            padding: 12px 24px;
                            background: #3b82f6;
                            color: white;
                            border: none;
                            border-radius: 8px;
                            font-weight: bold;
                            cursor: pointer;
                            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                            font-family: Arial, sans-serif;
                        }

                        .print-button:hover {
                            background: #2563eb;
                        }
                    }
                `}</style>
            </head>
            <body>
                <button className="print-button no-print" onClick={() => window.print()}>
                    🖨️ Print / Save as PDF
                </button>

                <div className="container">
                    {/* Kop Surat */}
                    <div className="letterhead">
                        <div className="logo-box">WK</div>
                        <div className="company-info">
                            <div className="company-name">PT. WATU KOBU MULTINIAGA</div>
                            <div className="company-address">
                                Gedung Collection Center<br />
                                Jl. Raya Industri No. 123, Jakarta Selatan 12345<br />
                                Telp: (021) 1234-5678 | Email: collection@watukobu.co.id
                            </div>
                        </div>
                    </div>

                    {/* Letter Metadata */}
                    <div className="letter-meta">
                        <table>
                            <tbody>
                                <tr>
                                    <td>Nomor</td>
                                    <td>: {letterNumber}</td>
                                </tr>
                                <tr>
                                    <td>Tanggal</td>
                                    <td>: {currentDate}</td>
                                </tr>
                                <tr>
                                    <td>Hal</td>
                                    <td>: <b>{config.subject}</b></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Letter Title */}
                    <div className="letter-title">{config.title}</div>

                    {/* Letter Body */}
                    <div className="letter-body" dangerouslySetInnerHTML={{ __html: config.body(selectedAsset) }} />

                    {/* Signature Section */}
                    <div className="signature-section">
                        <div className="signature-box">
                            <div className="signature-label">Hormat kami,<br />PT. Watu Kobu Multiniaga</div>
                            <div className="signature-name">Collection Manager</div>
                            <div className="signature-title">Divisi Penagihan</div>
                        </div>
                    </div>
                </div>
            </body>
        </html>
    );
}
