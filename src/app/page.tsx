'use client';

import { useState, useEffect, useMemo } from 'react';
// Force sync trigger 2026-01-29
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Search, MessageSquare, ChevronRight, GraduationCap, X, Check } from 'lucide-react';
import Image from 'next/image';

export default function Home() {
    const [view, setView] = useState<'login' | 'student-dashboard' | 'teacher-dashboard'>('login');
    const [loginRole, setLoginRole] = useState<'student' | 'teacher' | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [user, setUser] = useState<any>(null);
    const [students, setStudents] = useState<any[]>([]);
    const [teachers, setTeachers] = useState<any[]>([]);
    const [bookings, setBookings] = useState<any[]>([]);
    const [messages, setMessages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

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
            setStudents(await resS.json());
            setTeachers(await resT.json());
            setBookings(await resB.json());
            setMessages(await resM.json());
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const filteredItems = useMemo(() => {
        const list = loginRole === 'student' ? students : teachers;
        if (!searchTerm) return [];
        return list.filter(item =>
            item.name.toLowerCase().includes(searchTerm.toLowerCase())
        ).slice(0, 10);
    }, [searchTerm, loginRole, students, teachers]);

    const handleBooking = async (room: string) => {
        try {
            const res = await fetch('/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ studentId: user._id, room })
            });
            if (res.ok) {
                fetchData();
            } else {
                const d = await res.json();
                alert(d.error);
            }
        } catch (e) {
            alert('Fehler beim Buchen');
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
                            <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">Kursmanager</h1>
                            <p className="text-slate-500 mt-2 italic">Bitte wähle deinen Zugang</p>
                        </div>

                        {!loginRole ? (
                            <div className="grid grid-cols-1 gap-4">
                                <button
                                    onClick={() => setLoginRole('student')}
                                    className="white-card p-6 flex flex-col items-center space-y-4 hover:border-pink-500 transition-all group"
                                >
                                    <div className="p-4 bg-pink-50 rounded-full group-hover:bg-pink-100 transition-colors">
                                        <Users className="w-8 h-8 text-pink-600" />
                                    </div>
                                    <div className="text-center">
                                        <span className="block text-xl font-bold text-slate-800">Ich bin Schüler</span>
                                        <span className="text-sm text-slate-400">Einwahl in Kurse</span>
                                    </div>
                                </button>

                                <button
                                    onClick={() => setLoginRole('teacher')}
                                    className="white-card p-6 flex flex-col items-center space-y-4 hover:border-blue-500 transition-all group"
                                >
                                    <div className="p-4 bg-blue-50 rounded-full group-hover:bg-blue-100 transition-colors">
                                        <GraduationCap className="w-8 h-8 text-blue-600" />
                                    </div>
                                    <div className="text-center">
                                        <span className="block text-xl font-bold text-slate-800">Ich bin Lehrer</span>
                                        <span className="text-sm text-slate-400">Verwaltung & Infos</span>
                                    </div>
                                </button>
                            </div>
                        ) : (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="white-card p-8">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="font-bold text-xl text-slate-800">
                                        {loginRole === 'student' ? 'Schüler Login' : 'Lehrer Login'}
                                    </h2>
                                    <button onClick={() => { setLoginRole(null); setSearchTerm(''); }} className="text-slate-400 hover:text-slate-600">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Search className="h-5 w-5 text-slate-400" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Dein Name suchen..."
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
                                                        setUser(item);
                                                        setView(loginRole === 'student' ? 'student-dashboard' : 'teacher-dashboard');
                                                    }}
                                                    className="w-full text-left px-4 py-3 hover:bg-pink-50 border-b border-slate-50 last:border-0 flex justify-between items-center transition-colors"
                                                >
                                                    <span className="font-medium text-slate-700">{item.name}</span>
                                                    {loginRole === 'student' && <span className="text-xs text-slate-400">Klasse {item.className}</span>}
                                                </button>
                                            ))}
                                        </div>
                                    ) : searchTerm.length > 2 && (
                                        <p className="text-sm text-red-500 mt-4 text-center">Name nicht in der Liste gefunden.</p>
                                    )}
                                </div>
                                <p className="mt-6 text-xs text-slate-400 leading-relaxed">
                                    Hinweis: Falls dein Name fehlt, wende dich bitte an das Sekretariat.
                                </p>
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
                                onClick={() => { setView('login'); setUser(null); setLoginRole(null); setSearchTerm(''); }}
                                className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-all"
                            >
                                Abmelden
                            </button>
                        </header>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {['Mathe', 'Deutsch', 'Englisch'].map(room => {
                                const roomBookings = bookings.filter((b: any) => b.room === room);
                                const count = roomBookings.length;
                                const isBooked = bookings.find((b: any) => b.student?._id === user._id && b.room === room);

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
                                            disabled={count >= 25 && !isBooked}
                                            onClick={() => handleBooking(room)}
                                            className={`w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 ${isBooked
                                                ? 'bg-emerald-500 text-white cursor-default shadow-lg shadow-emerald-200'
                                                : 'bg-slate-900 text-white hover:bg-slate-800 active:scale-95'
                                                }`}
                                        >
                                            {isBooked ? (
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
                                <h3 className="font-bold text-slate-800">Schwarzes Brett (Lehrer-Infos)</h3>
                            </div>
                            <div className="p-6">
                                {messages.length === 0 ? (
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
                                <h1 className="text-2xl font-bold text-slate-800 uppercase tracking-tight">Lehrer-Zentrale</h1>
                                <p className="text-slate-500 font-medium">{user.name} <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full ml-2">{user.role}</span></p>
                            </div>
                            <button
                                onClick={() => { setView('login'); setUser(null); setLoginRole(null); setSearchTerm(''); }}
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
                                            placeholder="Deine Nachricht an alle Schüler..."
                                            className="w-full flex-1 min-h-[160px] bg-slate-50 border border-slate-200 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:bg-white transition-all resize-none"
                                        />
                                        <button type="submit" className="btn-primary w-full py-4 text-lg">Mitteilung veröffentlichen</button>
                                    </form>
                                </div>
                            </div>

                            <div className="white-card">
                                <div className="bg-slate-50 p-4 border-b border-slate-100 font-bold text-slate-800">
                                    Kurs-Teilnehmerlisten
                                </div>
                                <div className="divide-y divide-slate-100">
                                    {['Mathe', 'Deutsch', 'Englisch'].map(room => {
                                        const roomBookings = bookings.filter((b: any) => b.room === room);
                                        return (
                                            <details key={room} className="group overflow-hidden">
                                                <summary className="p-6 cursor-pointer list-none flex justify-between items-center hover:bg-slate-50 transition-colors">
                                                    <div className="flex items-center gap-4">
                                                        <span className="text-xl font-bold text-slate-800">{room}</span>
                                                        <span className="text-xs bg-slate-200 px-2 py-1 rounded-full text-slate-600 font-bold">
                                                            {roomBookings.length} / 25
                                                        </span>
                                                    </div>
                                                    <ChevronRight className="w-5 h-5 group-open:rotate-90 text-slate-400 transition-transform" />
                                                </summary>
                                                <div className="px-6 pb-6 pt-2">
                                                    {roomBookings.length === 0 ? (
                                                        <p className="text-slate-400 italic text-sm py-2">Noch keine Einschreibungen.</p>
                                                    ) : (
                                                        <div className="bg-slate-50 rounded-lg overflow-hidden border border-slate-100">
                                                            <table className="w-full text-left text-sm">
                                                                <thead className="bg-slate-100 text-slate-500 uppercase text-[10px] font-bold">
                                                                    <tr>
                                                                        <th className="px-4 py-3">Schüler</th>
                                                                        <th className="px-4 py-3">Klasse</th>
                                                                        <th className="px-4 py-3 text-right">Eingetragen am</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody className="divide-y divide-slate-100">
                                                                    {roomBookings.map((b, i) => (
                                                                        <tr key={i} className="hover:bg-white/50 transition-colors">
                                                                            <td className="px-4 py-3 font-medium text-slate-700">{b.student?.name}</td>
                                                                            <td className="px-4 py-3 text-slate-500">{b.student?.className}</td>
                                                                            <td className="px-4 py-3 text-right text-slate-400 text-xs">
                                                                                {new Date(b.createdAt).toLocaleDateString()}
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
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
