'use client';

import { useState } from 'react';
import {
    User,
    Gavel,
    Bell,
    Shield,
    History,
    Mail,
    Phone,
    Pencil,
    RotateCcw,
    Save,
    MessageSquare,
    Smartphone,
    Zap,
    Plus,
    MoreVertical,
    Lock,
    CheckCircle,
    XCircle,
    Search,
    Download,
    Calendar,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';

// Settings Menu Item Type
interface MenuItem {
    id: string;
    label: string;
    icon: React.ElementType;
}

// Menu Items
const menuItems: MenuItem[] = [
    { id: 'profile', label: 'General Profile', icon: User },
    { id: 'rules', label: 'Operational Rules', icon: Gavel },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'permissions', label: 'Role Permissions', icon: Shield },
    { id: 'audit', label: 'Audit Log', icon: History },
];

// Toggle Switch Component
function ToggleSwitch({
    label,
    description,
    defaultChecked = false,
}: {
    label: string;
    description: string;
    defaultChecked?: boolean;
}) {
    const [isChecked, setIsChecked] = useState(defaultChecked);

    return (
        <div className="flex items-center justify-between py-4 border-b border-slate-100 last:border-0">
            <div className="flex-1 pr-4">
                <h5 className="text-sm font-medium text-slate-900">{label}</h5>
                <p className="text-xs text-slate-500 mt-1">{description}</p>
            </div>
            <button
                type="button"
                onClick={() => setIsChecked(!isChecked)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${isChecked ? 'bg-green-500' : 'bg-slate-200'
                    }`}
            >
                <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isChecked ? 'translate-x-5' : 'translate-x-0'
                        }`}
                />
            </button>
        </div>
    );
}

// Inline Toggle Switch (for notification items)
function InlineToggle({ defaultChecked = false }: { defaultChecked?: boolean }) {
    const [isChecked, setIsChecked] = useState(defaultChecked);

    return (
        <button
            type="button"
            onClick={() => setIsChecked(!isChecked)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${isChecked ? 'bg-blue-600' : 'bg-slate-200'
                }`}
        >
            <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isChecked ? 'translate-x-5' : 'translate-x-0'
                    }`}
            />
        </button>
    );
}

// Input with Suffix Component
function InputWithSuffix({
    label,
    suffix,
    defaultValue,
    labelColor = 'text-slate-700',
}: {
    label: string;
    suffix: string;
    defaultValue: string | number;
    labelColor?: string;
}) {
    return (
        <div>
            <label className={`block text-sm font-medium ${labelColor} mb-2`}>{label}</label>
            <div className="relative">
                <input
                    type="text"
                    defaultValue={defaultValue}
                    className="block w-full rounded-lg border border-slate-300 pr-16 pl-4 py-2.5 text-sm focus:border-blue-500 focus:ring-blue-500"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 bg-white">
                    {suffix}
                </span>
            </div>
        </div>
    );
}

// Profile Form Component
function ProfileForm() {
    return (
        <div className="space-y-10">
            {/* Company Branding Section */}
            <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
                {/* Logo */}
                <div className="relative group shrink-0">
                    <div className="w-28 h-28 rounded-full bg-[#0F172A] flex items-center justify-center overflow-hidden ring-4 ring-white shadow-lg">
                        <span className="text-white text-3xl font-bold tracking-tight">WK</span>
                    </div>
                    <button
                        type="button"
                        className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow-lg transition-transform hover:scale-105 cursor-pointer"
                        title="Change Logo"
                    >
                        <Pencil size={16} />
                    </button>
                </div>

                {/* Company Info */}
                <div className="flex-1 text-center md:text-left pt-2">
                    <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                        PT. WATU KOBU MULTINIAGA
                    </h3>
                    <p className="text-slate-500 text-sm mb-4">
                        Mitra Penagihan Terpercaya & Amanah
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                            ✓ Verified Agency
                        </span>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                            Partner Since 2018
                        </span>
                    </div>
                </div>
            </div>

            <hr className="border-slate-100" />

            {/* Contact Information Section */}
            <div>
                <div className="mb-6">
                    <h3 className="text-lg font-semibold text-slate-900">Contact Information</h3>
                    <p className="text-sm text-slate-500">
                        Public contact details for agency correspondence.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Official Email
                        </label>
                        <div className="relative">
                            <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="email"
                                defaultValue="corp@watukobu.co.id"
                                className="block w-full rounded-lg border border-slate-300 pl-10 pr-4 py-2.5 text-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Phone Number
                        </label>
                        <div className="relative">
                            <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                defaultValue="+62 21 555-0199"
                                className="block w-full rounded-lg border border-slate-300 pl-10 pr-4 py-2.5 text-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        Head Office Address
                    </label>
                    <textarea
                        rows={3}
                        defaultValue="Jl. Jend. Sudirman Kav. 52-53, SCBD, Jakarta Selatan 12190, Indonesia"
                        className="block w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-blue-500 resize-none"
                    />
                </div>
            </div>

            <hr className="border-slate-100" />

            {/* Legal Details Section */}
            <div>
                <div className="mb-6">
                    <h3 className="text-lg font-semibold text-slate-900">Legal Details</h3>
                    <p className="text-sm text-slate-500">
                        Official company registration and licensing information.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            NPWP Company
                        </label>
                        <input
                            type="text"
                            defaultValue="01.234.567.8-012.000"
                            className="block w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            OJK License Number
                        </label>
                        <input
                            type="text"
                            defaultValue="KEP-123/D.05/2018"
                            className="block w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>
                </div>
            </div>

            <div className="pt-4 flex justify-end">
                <button
                    type="button"
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium shadow-sm transition-colors cursor-pointer"
                >
                    <Save size={16} />
                    Save Changes
                </button>
            </div>
        </div>
    );
}

// Rules Form Component
function RulesForm() {
    return (
        <div className="space-y-8">
            {/* Section 1: Aging Criteria */}
            <div className="bg-slate-50 rounded-xl p-6 border border-slate-100">
                <div className="flex items-center gap-2 mb-6">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs font-bold">1</span>
                    <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                        Klasifikasi Keterlambatan (Aging)
                    </h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <InputWithSuffix label="Warning Threshold" suffix="Days" defaultValue={30} labelColor="text-yellow-600" />
                    <InputWithSuffix label="NPL / Macet Threshold" suffix="Days" defaultValue={90} labelColor="text-orange-600" />
                    <InputWithSuffix label="Write-Off Limit" suffix="Days" defaultValue={180} labelColor="text-red-600" />
                </div>
                <div className="mt-4 flex items-start gap-2 text-slate-500 text-xs bg-white p-3 rounded-lg border border-slate-200">
                    <span className="text-blue-500">ℹ</span>
                    <p>Asset status akan diperbarui otomatis pada tengah malam berdasarkan threshold keterlambatan ini.</p>
                </div>
            </div>

            {/* Section 2: Commission Scheme */}
            <div className="bg-slate-50 rounded-xl p-6 border border-slate-100">
                <div className="flex items-center gap-2 mb-6">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs font-bold">2</span>
                    <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Insentif Kolektor</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <InputWithSuffix label="Base Commission (Lancar)" suffix="%" defaultValue="2.5" />
                    <InputWithSuffix label="Hard Collection (Macet)" suffix="%" defaultValue="5.0" />
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Bonus Target Achievement</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">Rp</span>
                            <input
                                type="text"
                                defaultValue="1.000.000"
                                className="block w-full rounded-lg border border-slate-300 pl-10 pr-4 py-2.5 text-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Section 3: Automation Settings */}
            <div className="bg-slate-50 rounded-xl p-6 border border-slate-100">
                <div className="flex items-center gap-2 mb-4">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs font-bold">3</span>
                    <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Otomatisasi Sistem</h4>
                </div>
                <div className="bg-white rounded-lg border border-slate-200 px-4">
                    <ToggleSwitch label="Auto-Assign New Cases" description="Distribusikan kasus baru ke kolektor terdekat secara otomatis." defaultChecked={true} />
                    <ToggleSwitch label="Auto-Send SMS Reminder" description="Kirim SMS ke debitur H-3 jatuh tempo." defaultChecked={false} />
                    <ToggleSwitch label="Weekend Visits Allowed" description="Izinkan input kunjungan di hari Sabtu/Minggu." defaultChecked={true} />
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button type="button" className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-slate-300 text-slate-700 text-sm font-medium hover:bg-slate-50 cursor-pointer">
                    <RotateCcw size={16} />
                    Reset to Default
                </button>
                <button type="button" className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium shadow-md cursor-pointer">
                    <Save size={16} />
                    Save Changes
                </button>
            </div>
        </div>
    );
}

// Notifications Form Component
function NotificationsForm() {
    const [waApiKey, setWaApiKey] = useState('');

    return (
        <div className="space-y-8">
            {/* Section 1: Notification Channels */}
            <div className="bg-slate-50 rounded-xl p-6 border border-slate-100">
                <div className="flex items-center gap-2 mb-6">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs font-bold">1</span>
                    <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                        Notification Channels (System Wide)
                    </h4>
                </div>

                <div className="bg-white rounded-lg border border-slate-200 divide-y divide-slate-100">
                    {/* Email Notifications */}
                    <div className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                                <Mail size={20} className="text-blue-600" />
                            </div>
                            <div>
                                <h5 className="text-sm font-medium text-slate-900">Email Notifications</h5>
                                <p className="text-xs text-slate-500">Send alerts to registered email addresses</p>
                            </div>
                        </div>
                        <InlineToggle defaultChecked={true} />
                    </div>

                    {/* WhatsApp Business API */}
                    <div className="p-4">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
                                    <MessageSquare size={20} className="text-green-600" />
                                </div>
                                <div>
                                    <h5 className="text-sm font-medium text-slate-900">WhatsApp Business API</h5>
                                    <p className="text-xs text-slate-500">Send notifications via WhatsApp</p>
                                </div>
                            </div>
                            <InlineToggle defaultChecked={true} />
                        </div>
                        <div className="ml-13 pl-13">
                            <label className="block text-xs font-medium text-slate-600 mb-1.5">API Key</label>
                            <div className="flex gap-2">
                                <input
                                    type="password"
                                    value={waApiKey}
                                    onChange={(e) => setWaApiKey(e.target.value)}
                                    placeholder="Enter WhatsApp API Key"
                                    className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                                <button
                                    type="button"
                                    className="px-3 py-2 text-xs font-medium text-blue-600 border border-blue-200 bg-blue-50 rounded-lg hover:bg-blue-100 cursor-pointer"
                                >
                                    Test Connection
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Mobile Push Notifications */}
                    <div className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center">
                                <Smartphone size={20} className="text-purple-600" />
                            </div>
                            <div>
                                <h5 className="text-sm font-medium text-slate-900">Mobile Push Notifications</h5>
                                <p className="text-xs text-slate-500">Send push notifications to mobile app</p>
                            </div>
                        </div>
                        <InlineToggle defaultChecked={true} />
                    </div>
                </div>
            </div>

            {/* Section 2: Alert Triggers */}
            <div className="bg-slate-50 rounded-xl p-6 border border-slate-100">
                <div className="flex items-center gap-2 mb-6">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs font-bold">2</span>
                    <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                        Alert Triggers (Manager Alerts)
                    </h4>
                </div>

                <div className="bg-white rounded-lg border border-slate-200 p-4 space-y-4">
                    {/* Payment Received */}
                    <label className="flex items-start gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            defaultChecked={true}
                            className="mt-0.5 w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                        />
                        <div>
                            <span className="text-sm font-medium text-slate-900">Payment Received &gt; Rp 10.000.000</span>
                            <p className="text-xs text-slate-500">Get notified when large payments are received</p>
                        </div>
                    </label>

                    {/* Asset Status Change */}
                    <label className="flex items-start gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            defaultChecked={true}
                            className="mt-0.5 w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                        />
                        <div>
                            <span className="text-sm font-medium text-slate-900">Asset Status changes to &apos;Macet/Loss&apos;</span>
                            <p className="text-xs text-slate-500">Alert when asset becomes non-performing</p>
                        </div>
                    </label>

                    {/* Daily Morning Briefing */}
                    <label className="flex items-start gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            defaultChecked={false}
                            className="mt-0.5 w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                        />
                        <div>
                            <span className="text-sm font-medium text-slate-900">Daily Morning Briefing (08:00 AM)</span>
                            <p className="text-xs text-slate-500">Receive daily summary report every morning</p>
                        </div>
                    </label>
                </div>
            </div>

            {/* Section 3: Collector Reminders */}
            <div className="bg-slate-50 rounded-xl p-6 border border-slate-100">
                <div className="flex items-center gap-2 mb-6">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs font-bold">3</span>
                    <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                        Collector Reminders
                    </h4>
                </div>

                <div className="bg-white rounded-lg border border-slate-200 p-4">
                    <div className="flex items-center gap-3 mb-3">
                        <Zap size={20} className="text-amber-500" />
                        <label className="text-sm font-medium text-slate-900">Send Visit Reminder to Collectors</label>
                    </div>
                    <select className="w-full md:w-64 rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 bg-white focus:border-blue-500 focus:ring-blue-500 cursor-pointer">
                        <option value="h-1" className="text-slate-900 bg-white">H-1 (Day before scheduled visit)</option>
                        <option value="same-day" className="text-slate-900 bg-white">Same Day 07:00 AM</option>
                        <option value="h-2" className="text-slate-900 bg-white">H-2 (Two days before)</option>
                        <option value="disabled" className="text-slate-900 bg-white">Disabled</option>
                    </select>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button type="button" className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-slate-300 text-slate-700 text-sm font-medium hover:bg-slate-50 cursor-pointer">
                    <RotateCcw size={16} />
                    Reset to Default
                </button>
                <button type="button" className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium shadow-md cursor-pointer">
                    <Save size={16} />
                    Save Preferences
                </button>
            </div>
        </div>
    );
}

// Permissions Form Component
function PermissionsForm() {
    // User data
    const users = [
        { id: 1, name: 'Alex Morgan', email: 'alex.m@watukobu.co.id', role: 'Manager', roleColor: 'emerald', active: true, locked: true },
        { id: 2, name: 'Sarah Jenkins', email: 'sarah.j@watukobu.co.id', role: 'Admin Staff', roleColor: 'purple', active: true, locked: false },
        { id: 3, name: 'Budi Santoso', email: 'budi.s@watukobu.co.id', role: 'Field Collector', roleColor: 'blue', active: true, locked: false },
    ];

    // Permission matrix data - manager: all true (locked), admin: editable, collector: limited
    const permissions = [
        { feature: 'User Management', description: 'Add/Edit users', manager: true, admin: false, collector: false },
        { feature: 'Financial Reports', description: 'View sensitive revenue data', manager: true, admin: true, collector: false },
        { feature: 'Asset Write-Off', description: 'Mark asset as loss', manager: true, admin: false, collector: false },
        { feature: 'System Configuration', description: 'Edit rules/settings', manager: true, admin: false, collector: false },
        { feature: 'Field Validation', description: 'Approve/Reject visits', manager: true, admin: true, collector: false },
        { feature: 'View Assigned Tasks', description: 'Access task list', manager: true, admin: true, collector: true },
    ];

    // Role capabilities - Manager (Superuser)
    const managerCapabilities = [
        { label: 'Full System Access', allowed: true },
        { label: 'Manage All Users', allowed: true },
        { label: 'Financial Reports & Export', allowed: true },
        { label: 'System Configuration', allowed: true },
    ];

    // Role capabilities - Admin Staff (Operational)
    const adminCapabilities = [
        { label: 'View Dashboard & Reports', allowed: true },
        { label: 'Field Visit Validation', allowed: true },
        { label: 'Manage User Accounts', allowed: false },
        { label: 'System Configuration', allowed: false },
    ];

    // Role capabilities - Field Collector
    const collectorCapabilities = [
        { label: 'View Assigned Tasks', allowed: true },
        { label: 'Update Collection Status', allowed: true },
        { label: 'View Full Reports', allowed: false },
        { label: 'Manage Users', allowed: false },
    ];

    return (
        <div className="space-y-8">
            {/* Header with Invite Button */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h3 className="text-lg font-bold text-slate-900">User Access Control</h3>
                    <p className="text-sm text-slate-500 mt-1">Manage active users and invite new members to the platform.</p>
                </div>
                <button
                    type="button"
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium shadow-sm transition-colors cursor-pointer"
                >
                    <Plus size={18} />
                    Invite New User
                </button>
            </div>

            {/* User Table */}
            <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-medium border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-3 font-semibold tracking-wider">User</th>
                            <th className="px-6 py-3 font-semibold tracking-wider">Role</th>
                            <th className="px-6 py-3 font-semibold tracking-wider">Status</th>
                            <th className="px-6 py-3 font-semibold tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                        {users.map((user, index) => (
                            <tr
                                key={user.id}
                                className={`hover:bg-slate-50 transition-colors ${index % 2 === 1 ? 'bg-slate-50/50' : ''}`}
                            >
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-9 h-9 rounded-full overflow-hidden flex items-center justify-center text-sm font-bold ${user.roleColor === 'emerald' ? 'bg-emerald-100 text-emerald-600' :
                                            user.roleColor === 'purple' ? 'bg-purple-100 text-purple-600' :
                                                'bg-blue-100 text-blue-600'
                                            }`}>
                                            {user.name.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-slate-900">{user.name}</p>
                                            <p className="text-xs text-slate-500">{user.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.roleColor === 'emerald' ? 'bg-emerald-100 text-emerald-800' :
                                        user.roleColor === 'purple' ? 'bg-purple-100 text-purple-800' :
                                            'bg-blue-100 text-blue-800'
                                        }`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    {user.locked ? (
                                        <div className="flex items-center gap-2 text-emerald-600">
                                            <Lock size={16} />
                                            <span className="text-sm font-medium">Superuser</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center">
                                            <InlineToggle defaultChecked={user.active} />
                                            <span className="ml-3 text-sm font-medium text-slate-600">Active</span>
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    {!user.locked && (
                                        <button className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
                                            <MoreVertical size={20} />
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Role Capabilities */}
            <div className="bg-slate-50 rounded-lg p-6 border border-slate-100">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-bold text-slate-800">Role Capabilities</h3>
                    <button className="text-sm text-blue-600 hover:text-blue-700 font-medium cursor-pointer">
                        Edit Definitions
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Manager (Superuser) */}
                    <div>
                        <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                            Manager (Superuser)
                        </h4>
                        <ul className="space-y-2">
                            {managerCapabilities.map((cap, index) => (
                                <li key={index} className={`flex items-center gap-2 text-sm ${cap.allowed ? 'text-slate-600' : 'text-slate-400 line-through'}`}>
                                    {cap.allowed ? (
                                        <CheckCircle size={18} className="text-green-500" />
                                    ) : (
                                        <XCircle size={18} className="text-slate-300" />
                                    )}
                                    {cap.label}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Admin Staff */}
                    <div>
                        <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                            Admin Staff
                        </h4>
                        <ul className="space-y-2">
                            {adminCapabilities.map((cap, index) => (
                                <li key={index} className={`flex items-center gap-2 text-sm ${cap.allowed ? 'text-slate-600' : 'text-slate-400 line-through'}`}>
                                    {cap.allowed ? (
                                        <CheckCircle size={18} className="text-green-500" />
                                    ) : (
                                        <XCircle size={18} className="text-slate-300" />
                                    )}
                                    {cap.label}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Field Collector */}
                    <div>
                        <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                            Field Collector
                        </h4>
                        <ul className="space-y-2">
                            {collectorCapabilities.map((cap, index) => (
                                <li key={index} className={`flex items-center gap-2 text-sm ${cap.allowed ? 'text-slate-600' : 'text-slate-400 line-through'}`}>
                                    {cap.allowed ? (
                                        <CheckCircle size={18} className="text-green-500" />
                                    ) : (
                                        <XCircle size={18} className="text-slate-300" />
                                    )}
                                    {cap.label}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            {/* Access Control Matrix */}
            <div className="bg-slate-50 rounded-lg p-6 border border-slate-100">
                <div className="mb-4">
                    <h3 className="text-base font-bold text-slate-800">Access Control Matrix</h3>
                    <p className="text-sm text-slate-500 mt-1">Manage feature access levels for each user role.</p>
                </div>

                <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-100 text-slate-600 text-xs uppercase font-semibold border-b border-slate-200">
                            <tr>
                                <th className="px-4 py-3 tracking-wider">Feature / Module</th>
                                <th className="px-4 py-3 tracking-wider text-center">
                                    <div className="flex flex-col items-center">
                                        <span>Manager</span>
                                        <span className="text-[10px] text-emerald-600 font-normal normal-case">(Superuser)</span>
                                    </div>
                                </th>
                                <th className="px-4 py-3 tracking-wider text-center">Admin Staff</th>
                                <th className="px-4 py-3 tracking-wider text-center">Field Collector</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {permissions.map((perm, index) => (
                                <tr key={index} className={index % 2 === 1 ? 'bg-slate-50/50' : 'bg-white'}>
                                    <td className="px-4 py-3">
                                        <div>
                                            <p className="text-sm font-medium text-slate-900">{perm.feature}</p>
                                            <p className="text-xs text-slate-500">{perm.description}</p>
                                        </div>
                                    </td>
                                    {/* Manager Column - All checked, all disabled (Superuser) */}
                                    <td className="px-4 py-3 text-center">
                                        <input
                                            type="checkbox"
                                            checked={true}
                                            disabled={true}
                                            className="w-4 h-4 text-emerald-600 rounded border-slate-300 cursor-not-allowed opacity-60"
                                            readOnly
                                        />
                                    </td>
                                    {/* Admin Staff Column - Editable with specific defaults */}
                                    <td className="px-4 py-3 text-center">
                                        <input
                                            type="checkbox"
                                            defaultChecked={perm.admin}
                                            className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                                        />
                                    </td>
                                    {/* Field Collector Column - Editable with limited defaults */}
                                    <td className="px-4 py-3 text-center">
                                        <input
                                            type="checkbox"
                                            defaultChecked={perm.collector}
                                            className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Legend */}
                <div className="mt-4 flex items-center gap-6 text-xs text-slate-500">
                    <div className="flex items-center gap-2">
                        <input type="checkbox" checked disabled className="w-3 h-3 text-emerald-600 rounded opacity-60 cursor-not-allowed" readOnly />
                        <span>Locked (Superuser)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <input type="checkbox" defaultChecked className="w-3 h-3 text-blue-600 rounded cursor-pointer" />
                        <span>Editable</span>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button type="button" className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-slate-300 text-slate-700 text-sm font-medium hover:bg-slate-50 cursor-pointer">
                    <RotateCcw size={16} />
                    Reset to Default
                </button>
                <button type="button" className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium shadow-md cursor-pointer">
                    <Save size={16} />
                    Save Permissions
                </button>
            </div>
        </div>
    );
}

// Audit Log Form Component
function AuditLogForm() {
    // Audit log data
    const logEntries = [
        {
            id: 1,
            timestamp: 'Oct 24, 10:30 AM',
            user: 'Alex Morgan',
            userInitials: 'AM',
            userColor: 'emerald',
            action: 'Updated Operational Rules',
            module: 'Config',
            ipAddress: '192.168.1.105',
            status: 'success',
        },
        {
            id: 2,
            timestamp: 'Oct 24, 09:45 AM',
            user: 'Sarah Jenkins',
            userInitials: 'SJ',
            userColor: 'purple',
            action: 'Validated Visit Report #8821',
            module: 'Validation',
            ipAddress: '192.168.1.42',
            status: 'success',
        },
        {
            id: 3,
            timestamp: 'Oct 24, 09:15 AM',
            user: 'Unknown',
            userInitials: '??',
            userColor: 'red',
            action: 'Failed Login Attempt (admin@watukobu.co.id)',
            module: 'Security',
            ipAddress: '103.45.67.89',
            status: 'failed',
        },
        {
            id: 4,
            timestamp: 'Oct 24, 08:30 AM',
            user: 'Budi Santoso',
            userInitials: 'BS',
            userColor: 'blue',
            action: 'Synced Offline Data (12 visits)',
            module: 'Mobile',
            ipAddress: 'Mobile/4G',
            status: 'success',
        },
        {
            id: 5,
            timestamp: 'Oct 24, 08:00 AM',
            user: 'Sarah Jenkins',
            userInitials: 'SJ',
            userColor: 'purple',
            action: 'Exported Financial Report Q3-2026',
            module: 'Reports',
            ipAddress: '192.168.1.42',
            status: 'success',
        },
        {
            id: 6,
            timestamp: 'Oct 23, 11:45 PM',
            user: 'System',
            userInitials: 'SY',
            userColor: 'slate',
            action: 'Daily Backup Created',
            module: 'System',
            ipAddress: 'Localhost',
            status: 'success',
        },
    ];

    return (
        <div className="space-y-6 flex flex-col h-full">
            {/* Header with Filters */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h3 className="text-lg font-bold text-slate-900">System Activity Logs</h3>
                    <p className="text-sm text-slate-500 mt-1">Track all user activities and system changes for security compliance.</p>
                </div>
            </div>

            {/* Toolbar Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                {/* Search Input */}
                <div className="relative flex-1">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by user or activity..."
                        className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 bg-white focus:border-blue-500 focus:ring-blue-500"
                    />
                </div>

                {/* Date Range - Native Date Pickers */}
                <div className="flex items-center gap-2">
                    <input
                        type="date"
                        className="px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 bg-white focus:border-blue-500 focus:ring-blue-500 cursor-pointer"
                    />
                    <span className="text-slate-400 text-sm">-</span>
                    <input
                        type="date"
                        className="px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 bg-white focus:border-blue-500 focus:ring-blue-500 cursor-pointer"
                    />
                </div>

                {/* Filter Dropdown */}
                <select className="px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 bg-white focus:border-blue-500 focus:ring-blue-500 cursor-pointer">
                    <option value="all">All Events</option>
                    <option value="login">Login</option>
                    <option value="data">Data Change</option>
                    <option value="security">Security</option>
                </select>

                {/* Export Button */}
                <button
                    type="button"
                    className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition-colors cursor-pointer"
                >
                    <Download size={16} />
                    Export Log
                </button>
            </div>

            {/* Log Table */}
            <div className="border border-slate-200 rounded-lg overflow-hidden flex-1">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-medium border-b border-slate-200">
                        <tr>
                            <th className="px-4 py-3 font-semibold tracking-wider whitespace-nowrap">Timestamp</th>
                            <th className="px-4 py-3 font-semibold tracking-wider">User</th>
                            <th className="px-4 py-3 font-semibold tracking-wider">Activity</th>
                            <th className="px-4 py-3 font-semibold tracking-wider">Module</th>
                            <th className="px-4 py-3 font-semibold tracking-wider">IP Address</th>
                            <th className="px-4 py-3 font-semibold tracking-wider text-right">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                        {logEntries.map((log, index) => (
                            <tr
                                key={log.id}
                                className={`hover:bg-slate-50 transition-colors ${index % 2 === 1 ? 'bg-slate-50/50' : ''}`}
                            >
                                <td className="px-4 py-3 text-sm text-slate-500 whitespace-nowrap">
                                    {log.timestamp}
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold ${log.userColor === 'emerald' ? 'bg-emerald-100 text-emerald-600' :
                                            log.userColor === 'purple' ? 'bg-purple-100 text-purple-600' :
                                                log.userColor === 'blue' ? 'bg-blue-100 text-blue-600' :
                                                    log.userColor === 'red' ? 'bg-red-100 text-red-600' :
                                                        'bg-slate-800 text-slate-200'
                                            }`}>
                                            {log.userInitials}
                                        </div>
                                        <span className="text-sm font-medium text-slate-900">{log.user}</span>
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-sm font-medium text-slate-700">
                                    {log.action}
                                </td>
                                <td className="px-4 py-3">
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600">
                                        {log.module}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-sm font-mono text-slate-500">
                                    {log.ipAddress}
                                </td>
                                <td className="px-4 py-3 text-right">
                                    {log.status === 'success' ? (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                            Success
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                                            Failed
                                        </span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                <p className="text-sm text-slate-500">
                    Showing <span className="font-medium text-slate-900">1-10</span> of{' '}
                    <span className="font-medium text-slate-900">2,450</span> logs
                </p>
                <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden">
                    <button className="px-3 py-1.5 text-sm text-slate-500 bg-white hover:bg-slate-50 border-r border-slate-200 transition-colors flex items-center gap-1 cursor-pointer">
                        <ChevronLeft size={16} />
                        Previous
                    </button>
                    <button className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 border-r border-blue-600">
                        1
                    </button>
                    <button className="px-3 py-1.5 text-sm text-slate-600 bg-white hover:bg-slate-50 border-r border-slate-200 transition-colors cursor-pointer">
                        2
                    </button>
                    <button className="px-3 py-1.5 text-sm text-slate-600 bg-white hover:bg-slate-50 border-r border-slate-200 transition-colors cursor-pointer">
                        3
                    </button>
                    <button className="px-3 py-1.5 text-sm text-slate-500 bg-white hover:bg-slate-50 transition-colors flex items-center gap-1 cursor-pointer">
                        Next
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}

// Main Configuration Page Component
export default function ConfigurationPage() {
    const [activeTab, setActiveTab] = useState('profile');

    // Get dynamic header based on active tab
    const getHeaderInfo = () => {
        switch (activeTab) {
            case 'profile':
                return {
                    title: 'General Profile',
                    subtitle: 'Configure agency branding, contact information, and legal details.',
                };
            case 'rules':
                return {
                    title: 'Operational Rules',
                    subtitle: 'Configure global operational logic and thresholds for the system.',
                };
            case 'notifications':
                return {
                    title: 'Notification Preferences',
                    subtitle: 'Manage alert thresholds and notification delivery channels.',
                };
            case 'permissions':
                return {
                    title: 'User & Role Management',
                    subtitle: 'Manage user access and system role capabilities.',
                };
            case 'audit':
                return {
                    title: 'System Audit Log',
                    subtitle: 'View and analyze system activities and security events.',
                };
            default:
                return {
                    title: 'Configuration',
                    subtitle: 'System settings and preferences.',
                };
        }
    };

    const headerInfo = getHeaderInfo();

    // Render active form
    const renderForm = () => {
        switch (activeTab) {
            case 'profile':
                return <ProfileForm />;
            case 'rules':
                return <RulesForm />;
            case 'notifications':
                return <NotificationsForm />;
            case 'permissions':
                return <PermissionsForm />;
            case 'audit':
                return <AuditLogForm />;
            default:
                return <ProfileForm />;
        }
    };

    return (
        <div className="max-w-7xl mx-auto flex flex-col gap-6">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-[#0F172A]">{headerInfo.title}</h2>
                <p className="text-slate-500 text-sm mt-1">{headerInfo.subtitle}</p>
            </div>

            {/* Main Settings Container */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 min-h-[600px] flex flex-col md:flex-row overflow-hidden">
                {/* Left Sidebar - Settings Menu */}
                <div className="w-full md:w-1/4 border-r border-slate-200 bg-slate-50/50">
                    <div className="p-6">
                        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
                            Settings Menu
                        </h3>
                        <nav className="flex flex-col space-y-1">
                            {menuItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = activeTab === item.id;
                                const isClickable = ['profile', 'rules', 'notifications', 'permissions', 'audit'].includes(item.id);

                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => isClickable && setActiveTab(item.id)}
                                        disabled={!isClickable}
                                        className={`w-full group flex items-center px-3 py-2.5 text-sm font-medium rounded-r-md transition-all ${isActive
                                            ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600'
                                            : isClickable
                                                ? 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 border-l-4 border-transparent cursor-pointer'
                                                : 'text-slate-400 border-l-4 border-transparent cursor-not-allowed'
                                            }`}
                                    >
                                        <Icon
                                            size={18}
                                            className={`mr-3 ${isActive
                                                ? 'text-blue-600'
                                                : isClickable
                                                    ? 'text-slate-400 group-hover:text-slate-500'
                                                    : 'text-slate-300'
                                                }`}
                                        />
                                        {item.label}
                                    </button>
                                );
                            })}
                        </nav>
                    </div>
                </div>

                {/* Right Content - Form */}
                <div className="w-full md:w-3/4 p-8">
                    {renderForm()}
                </div>
            </div>

            {/* Footer */}
            <footer className="mt-6 py-6 text-center text-xs text-slate-400">
                <p>© 2026 PT. WATU KOBU MULTINIAGA. All rights reserved. System Configuration.</p>
            </footer>
        </div>
    );
}
