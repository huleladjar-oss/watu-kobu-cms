'use client';

import { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAssets } from '@/context/AssetContext';
// import { useValidation } from '@/context/ValidationContext';
import { useAuth } from '@/context/AuthContext';
import { ArrowLeft, MapPin, Camera, Send, AlertCircle } from 'lucide-react';

export default function MobileReportPage() {
    const params = useParams();
    const router = useRouter();
    const { assets } = useAssets();
    // Note: submitVisitReport expects VisitReport structure, data assembly handled separately
    const { user } = useAuth();

    const taskId = params.id as string;

    // Find the asset/task
    const task = useMemo(() => {
        return assets.find((a) => a.id === taskId);
    }, [assets, taskId]);

    // Check if collateral exists
    const hasCollateral = useMemo(() => {
        if (!task) return false;
        return task.collateralAddress &&
            task.collateralAddress !== '-' &&
            task.collateralAddress !== '0' &&
            task.collateralAddress.trim() !== '';
    }, [task]);

    // Form state - Interview
    const [problemDescription, setProblemDescription] = useState('');
    const [commitmentDate, setCommitmentDate] = useState('');

    // Form state - Collateral Check
    const [collateralStatus, setCollateralStatus] = useState('Dihuni');
    const [collateralCondition, setCollateralCondition] = useState('Terawat');
    const [hasElectricity, setHasElectricity] = useState('Ya');
    const [hasWater, setHasWater] = useState('Ya');
    const [isMarketable, setIsMarketable] = useState('Ya');
    const [nearSchool, setNearSchool] = useState(false);
    const [nearMall, setNearMall] = useState(false);
    const [nearHospital, setNearHospital] = useState(false);
    const [nearCityCenter, setNearCityCenter] = useState(false);

    // Form state - Evidence
    const [gpsLocation, setGpsLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [gpsLoading, setGpsLoading] = useState(false);
    const [photoFront, setPhotoFront] = useState<File | null>(null);
    const [photoSide, setPhotoSide] = useState<File | null>(null);
    const [photoWithDebtor, setPhotoWithDebtor] = useState<File | null>(null);

    // Validation errors
    const [errors, setErrors] = useState<string[]>([]);

    // Capture GPS location
    const captureGPS = () => {
        setGpsLoading(true);
        setErrors([]);

        if (!navigator.geolocation) {
            setErrors(['GPS tidak tersedia di perangkat ini']);
            setGpsLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setGpsLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                });
                setGpsLoading(false);
            },
            (error) => {
                setErrors(['Gagal mengambil lokasi GPS: ' + error.message]);
                setGpsLoading(false);
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    // Handle file upload
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setPhoto: (file: File | null) => void) => {
        const file = e.target.files?.[0] || null;
        setPhoto(file);
    };

    // Validate and submit
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        const newErrors: string[] = [];

        // Validation
        if (!problemDescription.trim()) newErrors.push('Permasalahan wajib diisi');
        if (!commitmentDate) newErrors.push('Komitmen Realisasi wajib diisi');
        if (!gpsLocation) newErrors.push('GPS lokasi wajib diambil');
        if (!photoFront) newErrors.push('Foto Depan wajib diupload');
        if (!photoSide) newErrors.push('Foto Samping wajib diupload');
        if (!photoWithDebtor) newErrors.push('Foto Bersama Debitur wajib diupload');

        if (newErrors.length > 0) {
            setErrors(newErrors);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        if (!user || !task || isSubmitting) return;
        setIsSubmitting(true);

        try {
            // Build notes from interview + collateral assessment
            const notes = [
                `Permasalahan: ${problemDescription}`,
                `Komitmen: ${commitmentDate}`,
                hasCollateral ? `Agunan: ${collateralStatus}, ${collateralCondition}` : '',
                hasCollateral ? `Listrik: ${hasElectricity}, Air: ${hasWater}, Marketable: ${isMarketable}` : '',
            ].filter(Boolean).join(' | ');

            // Determine outcome
            const outcome = photoWithDebtor ? 'BERTEMU' : 'TIDAK_BERTEMU';

            const response = await fetch('/api/reports/visit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    assetId: task.id,
                    outcome,
                    notes,
                    gpsLat: gpsLocation?.lat ?? null,
                    gpsLng: gpsLocation?.lng ?? null,
                    evidencePhoto: photoFront?.name || null,
                    commitmentDate: commitmentDate || null,
                }),
            });

            const result = await response.json();

            if (!result.success) {
                setErrors([result.error || 'Gagal mengirim laporan']);
                setIsSubmitting(false);
                return;
            }

            // Redirect to success page
            router.push('/mobile/report/success');
        } catch (error) {
            console.error('Submit error:', error);
            setErrors(['Gagal mengirim laporan. Periksa koneksi internet.']);
            setIsSubmitting(false);
        }
    };

    if (!task) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle size={48} className="text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">Tugas tidak ditemukan</p>
                    <button
                        onClick={() => router.back()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Kembali
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Mobile Container */}
            <div className="max-w-md mx-auto bg-white min-h-screen shadow-sm pb-32">
                {/* Header */}
                <div className="bg-slate-900 text-white px-6 py-4 sticky top-0 z-20">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => router.back()}
                            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div className="flex-1">
                            <h1 className="text-lg font-semibold">Laporan Kunjungan</h1>
                            <p className="text-xs text-slate-300">{task.debtorName}</p>
                        </div>
                    </div>
                </div>

                {/* Error Display */}
                {errors.length > 0 && (
                    <div className="mx-6 mt-4 bg-red-50 border-2 border-red-300 rounded-lg p-4">
                        <p className="text-sm font-bold text-red-700 mb-2 flex items-center gap-2">
                            <AlertCircle size={16} />
                            Periksa Form:
                        </p>
                        <ul className="text-sm text-red-600 space-y-1">
                            {errors.map((error, idx) => (
                                <li key={idx}>• {error}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Content */}
                <div className="px-6 py-6 space-y-6">

                    {/* CARD 1: Data Debitur (Read Only) */}
                    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                        <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <div className="w-1 h-5 bg-slate-600 rounded-full" />
                            DATA DEBITUR
                        </h3>

                        <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 mb-1">Cabang</label>
                                    <input
                                        type="text"
                                        value={task.branch}
                                        disabled
                                        className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-sm text-gray-600 font-medium cursor-not-allowed"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 mb-1">Kantor Wilayah</label>
                                    <input
                                        type="text"
                                        value={task.region}
                                        disabled
                                        className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-sm text-gray-600 font-medium cursor-not-allowed"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">No Account</label>
                                <input
                                    type="text"
                                    value={task.loanId}
                                    disabled
                                    className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-sm text-gray-600 font-mono font-medium cursor-not-allowed"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Nama Debitur</label>
                                <input
                                    type="text"
                                    value={task.debtorName}
                                    disabled
                                    className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-sm text-gray-600 font-medium cursor-not-allowed"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">No Telepon</label>
                                <input
                                    type="text"
                                    value={task.phone || '-'}
                                    disabled
                                    className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-sm text-gray-600 font-medium cursor-not-allowed"
                                />
                            </div>
                        </div>
                    </div>

                    {/* CARD 2: Hasil Wawancara */}
                    <div className="bg-white border-2 border-blue-200 rounded-xl p-5 shadow-sm">
                        <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <div className="w-1 h-5 bg-blue-600 rounded-full" />
                            HASIL WAWANCARA
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Permasalahan <span className="text-red-600">*</span>
                                </label>
                                <textarea
                                    value={problemDescription}
                                    onChange={(e) => setProblemDescription(e.target.value)}
                                    placeholder="Jelaskan penyebab macet, kendala pembayaran, dll..."
                                    rows={4}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-900 bg-white outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Komitmen Realisasi <span className="text-red-600">*</span>
                                </label>
                                <input
                                    type="date"
                                    value={commitmentDate}
                                    onChange={(e) => setCommitmentDate(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-900 bg-white outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* CARD 3: Cek Fisik Agunan */}
                    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                        <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <div className="w-1 h-5 bg-green-600 rounded-full" />
                            CEK FISIK AGUNAN
                        </h3>

                        {!hasCollateral ? (
                            <div className="bg-amber-50 border border-amber-300 rounded-lg p-4">
                                <p className="text-sm text-amber-800 font-semibold flex items-center gap-2">
                                    <AlertCircle size={16} />
                                    Kredit Tanpa Agunan - Bagian ini tidak perlu diisi
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 mb-1">Alamat Agunan</label>
                                    <input
                                        type="text"
                                        value={task.collateralAddress}
                                        disabled
                                        className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-sm text-gray-600 font-medium cursor-not-allowed"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                                        <select
                                            value={collateralStatus}
                                            onChange={(e) => setCollateralStatus(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-sm text-gray-900 bg-white outline-none"
                                        >
                                            <option value="Dihuni">Dihuni</option>
                                            <option value="Kosong">Kosong</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Kondisi</label>
                                        <select
                                            value={collateralCondition}
                                            onChange={(e) => setCollateralCondition(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-sm text-gray-900 bg-white outline-none"
                                        >
                                            <option value="Terawat">Terawat</option>
                                            <option value="Rusak">Rusak</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-2">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 mb-2">Listrik</label>
                                        <select
                                            value={hasElectricity}
                                            onChange={(e) => setHasElectricity(e.target.value)}
                                            className="w-full px-2 py-2 border border-gray-300 rounded-lg text-xs text-gray-900 bg-white outline-none"
                                        >
                                            <option value="Ya">Ya</option>
                                            <option value="Tidak">Tidak</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 mb-2">Air</label>
                                        <select
                                            value={hasWater}
                                            onChange={(e) => setHasWater(e.target.value)}
                                            className="w-full px-2 py-2 border border-gray-300 rounded-lg text-xs text-gray-900 bg-white outline-none"
                                        >
                                            <option value="Ya">Ya</option>
                                            <option value="Tidak">Tidak</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 mb-2">Marketable</label>
                                        <select
                                            value={isMarketable}
                                            onChange={(e) => setIsMarketable(e.target.value)}
                                            className="w-full px-2 py-2 border border-gray-300 rounded-lg text-xs text-gray-900 bg-white outline-none"
                                        >
                                            <option value="Ya">Ya</option>
                                            <option value="Tidak">Tidak</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                                        Fasilitas Umum (Radius &lt; 5km)
                                    </label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={nearSchool}
                                                onChange={(e) => setNearSchool(e.target.checked)}
                                                className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                                            />
                                            <span className="text-sm text-gray-700">Sekolah</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={nearMall}
                                                onChange={(e) => setNearMall(e.target.checked)}
                                                className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                                            />
                                            <span className="text-sm text-gray-700">Mall</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={nearHospital}
                                                onChange={(e) => setNearHospital(e.target.checked)}
                                                className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                                            />
                                            <span className="text-sm text-gray-700">Rumah Sakit</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={nearCityCenter}
                                                onChange={(e) => setNearCityCenter(e.target.checked)}
                                                className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                                            />
                                            <span className="text-sm text-gray-700">Pusat Kota</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* CARD 4: Bukti Kunjungan */}
                    <div className="bg-white border-2 border-amber-200 rounded-xl p-5 shadow-sm">
                        <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <div className="w-1 h-5 bg-amber-600 rounded-full" />
                            BUKTI KUNJUNGAN
                        </h3>

                        <div className="space-y-4">
                            {/* GPS Location */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-3">
                                    Koordinat GPS <span className="text-red-600">*</span>
                                </label>

                                {!gpsLocation ? (
                                    <button
                                        onClick={captureGPS}
                                        disabled={gpsLoading}
                                        className="w-full py-3 bg-amber-500 hover:bg-amber-600 disabled:bg-gray-300 text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors"
                                    >
                                        <MapPin size={20} />
                                        {gpsLoading ? 'Mengambil Lokasi...' : 'Ambil Lokasi Terkini'}
                                    </button>
                                ) : (
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between bg-green-50 border border-green-300 rounded-lg p-3">
                                            <div>
                                                <p className="text-xs text-green-700 font-semibold mb-1">✓ Lokasi Tersimpan</p>
                                                <p className="text-sm text-gray-700 font-mono">
                                                    {gpsLocation.lat.toFixed(6)}, {gpsLocation.lng.toFixed(6)}
                                                </p>
                                            </div>
                                            <button
                                                onClick={captureGPS}
                                                className="text-xs text-amber-600 font-semibold hover:underline px-2"
                                            >
                                                Ulang
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Photos */}
                            <div className="space-y-3">
                                <label className="block text-sm font-semibold text-gray-700">
                                    Foto Dokumentasi <span className="text-red-600">*</span>
                                </label>

                                {/* Photo 1: Front */}
                                <div>
                                    <label className="flex items-center justify-between p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 cursor-pointer transition-colors">
                                        <div className="flex items-center gap-3">
                                            <Camera size={20} className="text-gray-500" />
                                            <div>
                                                <p className="text-sm font-semibold text-gray-700">Foto Depan</p>
                                                {photoFront && (
                                                    <p className="text-xs text-green-600">✓ {photoFront.name}</p>
                                                )}
                                            </div>
                                        </div>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            capture="environment"
                                            onChange={(e) => handleFileChange(e, setPhotoFront)}
                                            className="hidden"
                                        />
                                        <span className="text-xs text-blue-600 font-semibold">
                                            {photoFront ? 'Ganti' : 'Pilih'}
                                        </span>
                                    </label>
                                </div>

                                {/* Photo 2: Side */}
                                <div>
                                    <label className="flex items-center justify-between p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 cursor-pointer transition-colors">
                                        <div className="flex items-center gap-3">
                                            <Camera size={20} className="text-gray-500" />
                                            <div>
                                                <p className="text-sm font-semibold text-gray-700">Foto Samping</p>
                                                {photoSide && (
                                                    <p className="text-xs text-green-600">✓ {photoSide.name}</p>
                                                )}
                                            </div>
                                        </div>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            capture="environment"
                                            onChange={(e) => handleFileChange(e, setPhotoSide)}
                                            className="hidden"
                                        />
                                        <span className="text-xs text-blue-600 font-semibold">
                                            {photoSide ? 'Ganti' : 'Pilih'}
                                        </span>
                                    </label>
                                </div>

                                {/* Photo 3: With Debtor */}
                                <div>
                                    <label className="flex items-center justify-between p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 cursor-pointer transition-colors">
                                        <div className="flex items-center gap-3">
                                            <Camera size={20} className="text-gray-500" />
                                            <div>
                                                <p className="text-sm font-semibold text-gray-700">Foto Bersama Debitur</p>
                                                {photoWithDebtor && (
                                                    <p className="text-xs text-green-600">✓ {photoWithDebtor.name}</p>
                                                )}
                                            </div>
                                        </div>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            capture="user"
                                            onChange={(e) => handleFileChange(e, setPhotoWithDebtor)}
                                            className="hidden"
                                        />
                                        <span className="text-xs text-blue-600 font-semibold">
                                            {photoWithDebtor ? 'Ganti' : 'Pilih'}
                                        </span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Submit Button (Fixed Footer) */}
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-[0_-4px_10px_rgba(0,0,0,0.1)] z-[999]">
                    <div className="max-w-md mx-auto">
                        <button
                            onClick={handleSubmit}
                            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md flex items-center justify-center gap-2 transition-all active:scale-95"
                        >
                            <Send size={20} />
                            <span>KIRIM LAPORAN KE ADMIN</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
