'use client';

import { useState, useEffect, useMemo } from 'react';
// Force sync trigger 2026-01-29
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Search, MessageSquare, ChevronRight, GraduationCap, X, Check, Eye, EyeOff, Clock } from 'lucide-react';
import Image from 'next/image';

export default function Home() {
    const [view, setView] = useState<'login' | 'student-dashboard' | 'teacher-dashboard'>('login');
    const [loginStep, setLoginStep] = useState<'role' | 'select' | 'password'>('role');
    const [loginRole, setLoginRole] = useState<'student' | 'teacher' | null>(null);
    const [password, setPassword] = useState('');
    const [loginError, setLoginError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [tempUser, setTempUser] = useState<any>(null);
    const [user, setUser] = useState<any>(null);
    const [students, setStudents] = useState<any[]>([]);
    const [teachers, setTeachers] = useState<any[]>([]);
    const [bookings, setBookings] = useState<any[]>([]);
    const [messages, setMessages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
    const [editingContent, setEditingContent] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isBooking, setIsBooking] = useState(false);
    const [settings, setSettings] = useState({ resetDay1: 1, resetDay2: 4, resetTime: "00:00" });
    const [isUpdatingSettings, setIsUpdatingSettings] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [resS, resT, resB, resM] = await Promise.all([
                fetch('/api/students'),
                fetch('/api/teachers'),
                fetch('/api/bookings'),
                fetch('/api/messages')
            ]);

            const [dataS, dataT, dataB, dataM] = await Promise.all([
                resS.json(), resT.json(), resB.json(), resM.json()
            ]);

            setStudents(Array.isArray(dataS) ? dataS : []);
            setTeachers(Array.isArray(dataT) ? dataT : []);
            setBookings(Array.isArray(dataB) ? dataB : []);
            setMessages(Array.isArray(dataM) ? dataM : []);

            if (dataB.error || dataM.error || dataS.error || dataT.error) {
                console.error("API Error detected:", dataB.error || dataM.error || dataS.error || dataT.error);
            }

            const resSettings = await fetch('/api/settings');
            const dataSet = await resSettings.json();
            if (dataSet && !dataSet.error) {
                setSettings({
                    resetDay1: dataSet.resetDay1 ?? 1,
                    resetDay2: dataSet.resetDay2 ?? 4,
                    resetTime: dataSet.resetTime || "00:00"
                });
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const updateSettings = async (newSettings: any) => {
        setSettings(newSettings); // Optimistic update
        setIsUpdatingSettings(true);
        try {
            const res = await fetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newSettings)
            });
            if (res.ok) {
                const data = await res.json();
                setSettings(data);
                // fetchData(); // Removed to avoid jumpy UI
            }
        } catch (e) {
            alert('Fehler beim Speichern der Einstellungen');
            fetchData(); // Revert on error
        } finally {
            setIsUpdatingSettings(false);
        }
    };

    const getDayName = (day: number) => {
        const days = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
        return days[day];
    };

    const filteredItems = useMemo(() => {
        const list = loginRole === 'student' ? students : teachers;
        if (!searchTerm || !Array.isArray(list)) return [];
        return list.filter(item =>
            item.name && item.name.toLowerCase().includes(searchTerm.toLowerCase())
        ).slice(0, 10);
    }, [searchTerm, loginRole, students, teachers]);

    const handleBooking = async (room: string) => {
        if (isBooking) return;
        setIsBooking(true);
        try {
            const res = await fetch('/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ studentId: user._id, room })
            });
            const d = await res.json();
            if (res.ok) {
                // Optimistic update for student UI
                setBookings(prev => [...prev, d]);
                await fetchData();
            } else {
                alert(d.error || 'Fehler beim Buchen');
            }
        } catch (e) {
            alert('Fehler beim Buchen');
        } finally {
            setIsBooking(false);
        }
    };

    const postMessage = async (content: string) => {
        try {
            await fetch('/api/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sender: user.name, content })
            });
            fetchData();
        } catch (e) {
            alert('Fehler beim Senden der Nachricht');
        }
    };

    const deleteMessage = async (id: string) => {
        if (!confirm('Nachricht wirklich löschen?')) return;
        try {
            const res = await fetch(`/api/messages/${id}`, { method: 'DELETE' });
            if (res.ok) fetchData();
        } catch (e) {
            alert('Fehler beim Löschen');
        }
    };

    const updateMessage = async (id: string) => {
        try {
            const res = await fetch(`/api/messages/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: editingContent })
            });
            if (res.ok) {
                setEditingMessageId(null);
                fetchData();
            }
        } catch (e) {
            alert('Fehler beim Aktualisieren');
        }
    };

    const removeBooking = async (id: string) => {
        if (!confirm('Diesen Schüler wirklich aus dem Kurs entfernen?')) return;
        try {
            const res = await fetch(`/api/bookings/${id}`, { method: 'DELETE' });
            if (res.ok) fetchData();
        } catch (e) {
            alert('Fehler beim Entfernen');
        }
    };

    const handleLogin = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setLoginError('');
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: tempUser._id, password, role: loginRole })
            });

            if (res.ok) {
                const data = await res.json();
                setUser(data.user);
                setView(loginRole === 'student' ? 'student-dashboard' : 'teacher-dashboard');
            } else {
                const data = await res.json();
                setLoginError(data.error || 'Login fehlgeschlagen');
            }
        } catch (e) {
            setLoginError('Serververbindung fehlgeschlagen');
        }
    };

    if (loading) return (
        <div className="flex flex-col h-screen items-center justify-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
            <p className="text-slate-500 font-medium">Laden...</p>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto">
            <AnimatePresence mode="wait">
                {view === 'login' && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="max-w-md mx-auto py-12"
                    >
                        <div className="text-center mb-10">
                            <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">Fit für den Abschluss</h1>
                            <p className="text-slate-500 mt-2 italic">Bitte wähle deinen Zugang</p>
                        </div>

                        {loginStep === 'role' && (
                            <div className="grid grid-cols-1 gap-4">
                                <button
                                    onClick={() => { setLoginRole('student'); setLoginStep('select'); }}
                                    className="white-card p-6 flex flex-col items-center space-y-4 hover:border-pink-500 transition-all group"
                                >
                                    <div className="p-4 bg-pink-50 rounded-full group-hover:bg-pink-100 transition-colors">
                                        <Users className="w-8 h-8 text-pink-600" />
                                    </div>
                                    <div className="text-center">
                                        <span className="block text-xl font-bold text-slate-800">Ich bin Schüler*in</span>
                                        <span className="text-sm text-slate-400">Einwahl in Kurse</span>
                                    </div>
                                </button>

                                <button
                                    onClick={() => { setLoginRole('teacher'); setLoginStep('select'); }}
                                    className="white-card p-6 flex flex-col items-center space-y-4 hover:border-blue-500 transition-all group"
                                >
                                    <div className="p-4 bg-blue-50 rounded-full group-hover:bg-blue-100 transition-colors">
                                        <GraduationCap className="w-8 h-8 text-blue-600" />
                                    </div>
                                    <div className="text-center">
                                        <span className="block text-xl font-bold text-slate-800">Ich bin Lehrer*in</span>
                                        <span className="text-sm text-slate-400">Verwaltung & Infos</span>
                                    </div>
                                </button>
                            </div>
                        )}

                        {loginStep === 'select' && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="white-card p-8">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="font-bold text-xl text-slate-800">
                                        {loginRole === 'student' ? 'Schüler*in wählen' : 'Lehrer*in wählen'}
                                    </h2>
                                    <button onClick={() => { setLoginStep('role'); setLoginRole(null); setSearchTerm(''); }} className="text-slate-400 hover:text-slate-600">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Search className="h-5 w-5 text-slate-400" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Namenssuche..."
                                        className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        autoFocus
                                    />

                                    {filteredItems.length > 0 ? (
                                        <div className="mt-4 border border-slate-100 rounded-lg overflow-hidden shadow-sm">
                                            {filteredItems.map((item) => (
                                                <button
                                                    key={item._id}
                                                    onClick={() => {
                                                        setTempUser(item);
                                                        setLoginStep('password');
                                                        setPassword('');
                                                        setLoginError('');
                                                    }}
                                                    className="w-full text-left px-4 py-3 hover:bg-pink-50 border-b border-slate-50 last:border-0 flex justify-between items-center transition-colors"
                                                >
                                                    <span className="font-medium text-slate-700">{item.name}</span>
                                                    {loginRole === 'student' && <span className="text-xs text-slate-400">Klasse {item.className}</span>}
                                                </button>
                                            ))}
                                        </div>
                                    ) : (students.length === 0 && teachers.length === 0) ? (
                                        <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
                                            <p className="text-sm text-amber-700 font-medium text-center">
                                                Datenbank leer. Bitte <code className="bg-amber-100 px-1 rounded">/api/seed</code> aufrufen!
                                            </p>
                                        </div>
                                    ) : searchTerm.length > 2 && (
                                        <p className="text-sm text-red-500 mt-4 text-center">Name nicht gefunden.</p>
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {loginStep === 'password' && (
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="white-card p-8 text-center">
                                <div className="mb-6 flex flex-col items-center">
                                    <div className="w-16 h-16 bg-pink-50 text-pink-600 rounded-full flex items-center justify-center mb-4">
                                        <Users className="w-8 h-8" />
                                    </div>
                                    <h1 className="text-2xl font-bold text-slate-800">{tempUser.name}</h1>
                                    <p className="text-slate-500 text-sm">Bitte gib dein Passwort ein</p>
                                </div>

                                <form onSubmit={handleLogin} className="space-y-4">
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Dein Passwort"
                                            className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 pr-10"
                                            autoFocus
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                                        >
                                            {showPassword ? (
                                                <EyeOff className="w-5 h-5" />
                                            ) : (
                                                <Eye className="w-5 h-5" />
                                            )}
                                        </button>
                                    </div>
                                    {loginError && (
                                        <p className="text-sm text-red-500 font-bold bg-red-50 p-2 rounded border border-red-100 italic">
                                            {loginError}
                                        </p>
                                    )}
                                    <button type="submit" className="w-full btn-primary py-3">Einloggen</button>
                                    <button
                                        type="button"
                                        onClick={() => setLoginStep('select')}
                                        className="text-slate-400 text-sm hover:text-slate-600 block mx-auto underline"
                                    >
                                        Zurück zur Auswahl
                                    </button>
                                </form>
                            </motion.div>
                        )}
                    </motion.div>
                )}

                {view === 'student-dashboard' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 py-8">
                        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-3xl font-bold text-slate-800">Hallo, {user.name}</h1>
                                <p className="text-slate-500">Klasse {user.className} • <span className="text-pink-600 font-semibold">Aktive Einwahl</span></p>
                            </div>
                            <button
                                onClick={() => {
                                    setView('login');
                                    setUser(null);
                                    setLoginRole(null);
                                    setSearchTerm('');
                                    setLoginStep('role');
                                }}
                                className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-all"
                            >
                                Abmelden
                            </button>
                        </header>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {['Mathe', 'Deutsch', 'Englisch'].map(room => {
                                const count = Array.isArray(bookings) ? bookings.filter((b: any) => b.room === room).length : 0;
                                const isBooked = Array.isArray(bookings) && user ? bookings.some((b: any) => b.student?._id === user._id && b.room === room) : false;
                                return (
                                    <div key={room} className={`white-card p-6 flex flex-col justify-between h-full transition-all ${isBooked ? 'ring-2 ring-emerald-500 ring-offset-4' : ''}`}>
                                        <div>
                                            <div className="flex justify-between items-start mb-6">
                                                <h3 className="text-2xl font-bold text-slate-800">{room}</h3>
                                                <div className={`px-3 py-1 rounded-full text-xs font-bold ${count >= 25 ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                                    {count}/25 Plätze
                                                </div>
                                            </div>
                                            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden mb-8">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${(count / 25) * 100}%` }}
                                                    className={`h-full transition-all duration-1000 ${count >= 25 ? 'bg-red-500' : 'bg-pink-500'}`}
                                                />
                                            </div>
                                        </div>

                                        <button
                                            disabled={(count >= 25 && !isBooked) || isBooking}
                                            onClick={() => handleBooking(room)}
                                            className={`w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 ${isBooked
                                                ? 'bg-emerald-500 text-white cursor-default shadow-lg shadow-emerald-200'
                                                : (count >= 25 || isBooking)
                                                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                                    : 'bg-slate-900 text-white hover:bg-slate-800 active:scale-95'
                                                }`}
                                        >
                                            {isBooking ? (
                                                <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Reserviere...</>
                                            ) : isBooked ? (
                                                <><Check className="w-6 h-6" /> Eingetragen</>
                                            ) : count >= 25 ? 'Raum Voll' : 'Platz reservieren'}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="white-card overflow-hidden">
                            <div className="bg-slate-50 p-4 border-b border-slate-100 flex items-center gap-2">
                                <MessageSquare className="w-5 h-5 text-blue-500" />
                                <h3 className="font-bold text-slate-800">Schwarzes Brett (Infos für Schüler*innen)</h3>
                            </div>
                            <div className="p-6">
                                {!Array.isArray(messages) || messages.length === 0 ? (
                                    <p className="text-slate-400 italic text-center py-4">Derzeit keine neuen Mitteilungen.</p>
                                ) : (
                                    <div className="space-y-4">
                                        {messages.map((m, i) => (
                                            <div key={i} className="p-5 rounded-xl bg-slate-50 border border-slate-100">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="font-bold text-slate-700">{m.sender}</span>
                                                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                                                        {new Date(m.createdAt).toLocaleDateString()} um {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                                <p className="text-slate-600 leading-relaxed text-sm">{m.content}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}

                {view === 'teacher-dashboard' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 py-8">
                        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-2xl font-bold text-slate-800 uppercase tracking-tight">Lehrer*innen-Zentrale</h1>
                                <p className="text-slate-500 font-medium">{user.name} <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full ml-2">{user.role}</span></p>
                            </div>
                            <button
                                onClick={() => {
                                    setView('login');
                                    setUser(null);
                                    setLoginRole(null);
                                    setSearchTerm('');
                                    setLoginStep('role');
                                }}
                                className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-all"
                            >
                                Abmelden
                            </button>
                        </header>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="white-card flex flex-col">
                                <div className="bg-slate-50 p-4 border-b border-slate-100 font-bold text-slate-800">
                                    Rundschreiben verfassen
                                </div>
                                <div className="p-6 flex-1">
                                    <form onSubmit={(e: any) => {
                                        e.preventDefault();
                                        if (!e.target.msg.value.trim()) return;
                                        postMessage(e.target.msg.value);
                                        e.target.msg.value = '';
                                    }} className="space-y-4 h-full flex flex-col">
                                        <textarea
                                            name="msg"
                                            required
                                            placeholder="Deine Nachricht an alle Schüler*innen..."
                                            className="w-full flex-1 min-h-[160px] bg-slate-50 border border-slate-200 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:bg-white transition-all resize-none"
                                        />
                                        <button type="submit" className="btn-primary w-full py-4 text-lg">Mitteilung veröffentlichen</button>
                                    </form>
                                </div>
                            </div>

                            <div className="white-card">
                                <div className="bg-slate-50 p-4 border-b border-slate-100 font-bold text-slate-800 flex justify-between items-center">
                                    <span>Verwaltung & Berichte</span>
                                </div>
                                <div className="p-4 bg-amber-50/50 border-b border-amber-100">
                                    <div className="flex items-start gap-3">
                                        <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                                        <div>
                                            <h4 className="font-bold text-amber-900 text-sm">Automatischer Listen-Reset</h4>
                                            <p className="text-amber-800 text-xs mt-1 leading-relaxed">
                                                Die Kurs-Einschreibungen werden automatisch archiviert und die Plätze freigegeben:
                                                <br />
                                                • Immer am <strong>{getDayName(settings.resetDay1)} um {settings.resetTime} Uhr</strong>
                                                <br />
                                                • Immer am <strong>{getDayName(settings.resetDay2)} um {settings.resetTime} Uhr</strong>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-0">
                                    <div className="border-b border-slate-100 p-4 bg-slate-50/50">
                                        <h4 className="text-sm font-bold text-slate-600 mb-4 uppercase tracking-wider">Aktuelle Mitteilungen</h4>
                                        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                                            {!Array.isArray(messages) || messages.length === 0 ? (
                                                <p className="text-slate-400 italic text-sm text-center py-4">Noch keine Nachrichten veröffentlicht.</p>
                                            ) : (
                                                messages.map((m) => (
                                                    <div key={m._id} className="p-4 rounded-xl bg-white border border-slate-100 shadow-sm">
                                                        {editingMessageId === m._id ? (
                                                            <div className="space-y-2">
                                                                <textarea
                                                                    value={editingContent}
                                                                    onChange={(e) => setEditingContent(e.target.value)}
                                                                    className="w-full text-sm border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-pink-500 outline-none"
                                                                    rows={3}
                                                                />
                                                                <div className="flex gap-2">
                                                                    <button onClick={() => updateMessage(m._id)} className="px-3 py-1 bg-emerald-500 text-white text-xs font-bold rounded-lg hover:bg-emerald-600">Speichern</button>
                                                                    <button onClick={() => setEditingMessageId(null)} className="px-3 py-1 bg-slate-100 text-slate-500 text-xs font-bold rounded-lg hover:bg-slate-200">Abbrechen</button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <>
                                                                <div className="flex justify-between items-start mb-2">
                                                                    <span className="font-bold text-slate-700 text-sm">{m.sender}</span>
                                                                    <div className="flex gap-1">
                                                                        <button
                                                                            onClick={() => { setEditingMessageId(m._id); setEditingContent(m.content); }}
                                                                            className="p-1.5 text-slate-400 hover:text-blue-500 transition-colors"
                                                                            title="Bearbeiten"
                                                                        >
                                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-5M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>
                                                                        </button>
                                                                        <button
                                                                            onClick={() => deleteMessage(m._id)}
                                                                            className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                                                                            title="Löschen"
                                                                        >
                                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                                <p className="text-slate-600 text-sm italic">&quot;{m.content}&quot;</p>
                                                            </>
                                                        )}
                                                    </div>
                                                )
                                                ))}
                                        </div>
                                    </div>

                                    <div className="p-4">
                                        <h4 className="text-sm font-bold text-slate-600 mb-4 uppercase tracking-wider">Kurs-Listen</h4>
                                        <div className="divide-y divide-slate-100">
                                            {['Mathe', 'Deutsch', 'Englisch'].map(room => {
                                                const roomBookings = Array.isArray(bookings) ? bookings.filter((b: any) => b.room === room) : [];
                                                return (
                                                    <details key={room} className="group overflow-hidden">
                                                        <summary className="p-4 cursor-pointer list-none flex justify-between items-center hover:bg-slate-50 transition-colors rounded-lg">
                                                            <div className="flex items-center gap-4">
                                                                <span className="font-bold text-slate-800">{room}</span>
                                                                <span className="text-[10px] bg-slate-200 px-2 py-0.5 rounded-full text-slate-600 font-bold">
                                                                    {roomBookings.length}/25
                                                                </span>
                                                            </div>
                                                            <ChevronRight className="w-4 h-4 group-open:rotate-90 text-slate-400 transition-transform" />
                                                        </summary>
                                                        <div className="p-4 pt-2">
                                                            {roomBookings.length === 0 ? (
                                                                <p className="text-slate-400 italic text-xs py-2 text-center">Noch keine Einschreibungen.</p>
                                                            ) : (
                                                                <div className="bg-slate-50 rounded-lg overflow-hidden border border-slate-100">
                                                                    <table className="w-full text-left text-[11px]">
                                                                        <thead className="bg-slate-100 text-slate-500 uppercase font-bold">
                                                                            <tr>
                                                                                <th className="px-3 py-2">Name</th>
                                                                                <th className="px-3 py-2">Klasse</th>
                                                                                <th className="px-3 py-2 text-right">Aktion</th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody className="divide-y divide-slate-100">
                                                                            {roomBookings.map((b, i) => (
                                                                                <tr key={i} className="hover:bg-white/50 transition-colors">
                                                                                    <td className="px-3 py-2 font-medium text-slate-700">{b.student?.name}</td>
                                                                                    <td className="px-3 py-2 text-slate-500">{b.student?.className}</td>
                                                                                    <td className="px-3 py-2 text-right">
                                                                                        <button
                                                                                            onClick={() => removeBooking(b._id)}
                                                                                            className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                                                                                            title="Entfernen"
                                                                                        >
                                                                                            <X className="w-4 h-4" />
                                                                                        </button>
                                                                                    </td>
                                                                                </tr>
                                                                            ))}
                                                                        </tbody>
                                                                    </table>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </details>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div className="p-4 bg-slate-50 border-t border-slate-100">
                                        <h4 className="text-sm font-bold text-slate-600 mb-4 uppercase tracking-wider flex items-center gap-2">
                                            <Clock className="w-4 h-4" /> Reset-Zeitpunkt festlegen
                                        </h4>
                                        <div className="grid grid-cols-3 gap-4">
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-bold text-slate-400 uppercase">Tag 1</label>
                                                <select
                                                    value={settings.resetDay1}
                                                    disabled={isUpdatingSettings}
                                                    onChange={(e) => updateSettings({ ...settings, resetDay1: parseInt(e.target.value) })}
                                                    className="w-full bg-white border border-slate-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-pink-500 outline-none disabled:opacity-50"
                                                >
                                                    {[1, 2, 3, 4, 5, 6, 0].map(d => (
                                                        <option key={d} value={d}>{getDayName(d)}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-bold text-slate-400 uppercase">Tag 2</label>
                                                <select
                                                    value={settings.resetDay2}
                                                    disabled={isUpdatingSettings}
                                                    onChange={(e) => updateSettings({ ...settings, resetDay2: parseInt(e.target.value) })}
                                                    className="w-full bg-white border border-slate-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-pink-500 outline-none disabled:opacity-50"
                                                >
                                                    {[1, 2, 3, 4, 5, 6, 0].map(d => (
                                                        <option key={d} value={d}>{getDayName(d)}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-bold text-slate-400 uppercase">Uhrzeit</label>
                                                <input
                                                    type="time"
                                                    value={settings.resetTime}
                                                    disabled={isUpdatingSettings}
                                                    onChange={(e) => updateSettings({ ...settings, resetTime: e.target.value })}
                                                    className="w-full bg-white border border-slate-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-pink-500 outline-none disabled:opacity-50"
                                                />
                                            </div>
                                        </div>
                                        {isUpdatingSettings && <p className="text-[10px] text-pink-600 font-bold mt-2 animate-pulse">Speichere Änderungen...</p>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
