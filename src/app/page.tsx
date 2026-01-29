'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, LogIn, MessageSquare, ChevronRight, School, BookOpen, GraduationCap } from 'lucide-react';
import Image from 'next/image';

export default function Home() {
    const [view, setView] = useState<'login' | 'student-dashboard' | 'teacher-dashboard'>('login');
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
            alert('Error booking room');
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
            alert('Error posting message');
        }
    };

    if (loading) return <div className="flex h-screen items-center justify-center">Laden...</div>;

    return (
        <div className="space-y-8">
            <AnimatePresence mode="wait">
                {view === 'login' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="max-w-md mx-auto space-y-6"
                    >
                        <div className="text-center space-y-2">
                            <h1 className="text-4xl font-bold text-gradient">Kursmanager</h1>
                            <p className="opacity-60 text-lg">Willkommen bei der KGS Pattensen</p>
                        </div>

                        <div className="glass-card p-8 space-y-6">
                            <div className="space-y-4">
                                <label className="block text-sm font-medium opacity-70">Schüler / Lehrer Login</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        onClick={() => {
                                            const name = prompt("Dein Name (aus der Liste)?");
                                            const found = students.find((s: any) => s.name.toLowerCase().includes(name?.toLowerCase() || ''));
                                            if (found) { setUser(found); setView('student-dashboard'); }
                                            else alert("Name nicht gefunden");
                                        }}
                                        className="flex flex-col items-center p-6 space-y-3 glass-card hover:bg-white/10 transition-colors border-none bg-white/5"
                                    >
                                        <Users className="w-8 h-8 text-pink-500" />
                                        <span className="font-semibold">Schüler</span>
                                    </button>
                                    <button
                                        onClick={() => {
                                            const name = prompt("Dein Name (Lehrer)?");
                                            const found = teachers.find((t: any) => t.name.toLowerCase().includes(name?.toLowerCase() || ''));
                                            if (found) { setUser(found); setView('teacher-dashboard'); }
                                            else alert("Lehrer nicht gefunden");
                                        }}
                                        className="flex flex-col items-center p-6 space-y-3 glass-card hover:bg-white/10 transition-colors border-none bg-white/5"
                                    >
                                        <GraduationCap className="w-8 h-8 text-blue-400" />
                                        <span className="font-semibold">Lehrer</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {view === 'student-dashboard' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-8"
                    >
                        <div className="flex justify-between items-end">
                            <div>
                                <h2 className="text-3xl font-bold">Hallo, {user.name}</h2>
                                <p className="opacity-60">Klasse {user.className}</p>
                            </div>
                            <button onClick={() => setView('login')} className="text-sm opacity-50 hover:opacity-100 underline">Abmelden</button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {['Mathe', 'Deutsch', 'Englisch'].map(room => {
                                const count = bookings.filter((b: any) => b.room === room).length;
                                const isBooked = bookings.find((b: any) => b.student._id === user._id && b.room === room);
                                return (
                                    <div key={room} className="glass-card p-6 space-y-4 flex flex-col justify-between">
                                        <div>
                                            <div className="flex justify-between items-center mb-4">
                                                <h3 className="text-xl font-bold">{room}</h3>
                                                <span className={`px-2 py-1 rounded text-xs ${count >= 25 ? 'bg-red-500/20 text-red-500' : 'bg-green-500/20 text-green-500'}`}>
                                                    {count}/25 Plätze
                                                </span>
                                            </div>
                                            <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-pink-500 transition-all duration-500"
                                                    style={{ width: `${(count / 25) * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                        <button
                                            disabled={count >= 25 && !isBooked}
                                            onClick={() => handleBooking(room)}
                                            className={`w-full mt-4 py-3 rounded-lg font-bold transition-all ${isBooked
                                                    ? 'bg-green-500 text-white cursor-default'
                                                    : 'bg-white/10 hover:bg-pink-500 hover:text-white'
                                                }`}
                                        >
                                            {isBooked ? 'Eingeschrieben' : count >= 25 ? 'Voll' : 'Einschreiben'}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="glass-card p-6 space-y-4">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <MessageSquare className="w-5 h-5 text-blue-400" />
                                Nachrichten der Lehrer
                            </h3>
                            <div className="space-y-3">
                                {messages.length === 0 ? (
                                    <p className="opacity-40 italic">Keine Nachrichten vorhanden.</p>
                                ) : (
                                    messages.map((m, i) => (
                                        <div key={i} className="p-4 rounded-lg bg-white/5 border border-white/10">
                                            <div className="flex justify-between text-xs opacity-50 mb-1">
                                                <span>{m.sender}</span>
                                                <span>{new Date(m.createdAt).toLocaleString()}</span>
                                            </div>
                                            <p>{m.content}</p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}

                {view === 'teacher-dashboard' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-8"
                    >
                        <div className="flex justify-between items-end">
                            <div>
                                <h2 className="text-2xl font-bold">Lehrer-Bereich: {user.name}</h2>
                                <p className="opacity-60">Status: {user.role}</p>
                            </div>
                            <button onClick={() => setView('login')} className="text-sm opacity-50 hover:opacity-100 underline">Abmelden</button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="glass-card p-6 space-y-4">
                                <h3 className="text-xl font-bold">Nachricht senden</h3>
                                <form onSubmit={(e: any) => {
                                    e.preventDefault();
                                    postMessage(e.target.msg.value);
                                    e.target.msg.value = '';
                                }} className="space-y-4">
                                    <textarea
                                        name="msg"
                                        placeholder="Wichtige Info an alle Schüler..."
                                        className="w-full h-32 bg-white/5 border border-white/10 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-pink-500"
                                    />
                                    <button type="submit" className="btn-primary w-full">Nachricht senden</button>
                                </form>
                            </div>

                            <div className="glass-card p-6 space-y-4">
                                <h3 className="text-xl font-bold">Raumbelegung</h3>
                                <div className="space-y-4">
                                    {['Mathe', 'Deutsch', 'Englisch'].map(room => {
                                        const roomBookings = bookings.filter((b: any) => b.room === room);
                                        return (
                                            <details key={room} className="group glass-card border-none bg-white/5 overflow-hidden">
                                                <summary className="p-4 cursor-pointer list-none flex justify-between items-center bg-white/5">
                                                    <span className="font-bold">{room} ({roomBookings.length}/25)</span>
                                                    <ChevronRight className="w-5 h-5 group-open:rotate-90 transition-transform" />
                                                </summary>
                                                <div className="p-4 space-y-2 border-t border-white/10">
                                                    {roomBookings.length === 0 ? <p className="opacity-40 italic">Noch niemand eingetragen.</p> :
                                                        roomBookings.map((b, i) => (
                                                            <div key={i} className="text-sm flex justify-between">
                                                                <span>{b.student.name}</span>
                                                                <span className="opacity-50">({b.student.className})</span>
                                                            </div>
                                                        ))
                                                    }
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
