'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
// Force sync trigger 2026-01-29
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Search, MessageSquare, ChevronRight, GraduationCap, X, Check, Eye, EyeOff, Clock } from 'lucide-react';
import Image from 'next/image';

// ... alle weiteren States und Hooks wie gehabt ...

// --- NEU: Helper für Zeitformat ---
const isValidTimeFormat = (time: string): boolean =>
  typeof time === 'string' && /^\d{2}:\d{2}$/.test(time);

// ...

const fetchData = async () => {
  try {
    const [resS, resT, resB, resM] = await Promise.all([
      fetch('/api/students', { headers: { 'Cache-Control': 'no-cache' } }),
      fetch('/api/teachers', { headers: { 'Cache-Control': 'no-cache' } }),
      fetch('/api/bookings', { headers: { 'Cache-Control': 'no-cache' } }),
      fetch('/api/messages', { headers: { 'Cache-Control': 'no-cache' } })
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
        resetTime: isValidTimeFormat(dataSet.resetTime) ? dataSet.resetTime : "00:00"
      });
    }
  } catch (e) {
    console.error(e);
  } finally {
    setLoading(false);
  }
};

// ... Rest so lassen wie im Commit 1505f3b ... (also: alle Original-Komponenten, JSX, Logic, usw.)
