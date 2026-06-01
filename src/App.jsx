import { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

// ── Supabase ──────────────────────────────────────────────────────────────
const SUPABASE_URL = "https://cwzcfovndjofpqgbjatw.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN3emNmb3ZuZGpvZnBxZ2JqYXR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2OTgxMzcsImV4cCI6MjA5NDI3NDEzN30.O0YV2a0gvfAgX3TGENU3ytWKnOWHzXPgT-hSSYsnkHw";
const WHATSAPP_CONTATO = "5531996999797";

// Storage customizado — usa sessionStorage como primário (não limpo pelo Chrome Android)
// e localStorage como backup para persistência entre sessões
const customStorage = {
  getItem: (key) => {
    try {
      return sessionStorage.getItem(key) || localStorage.getItem(key);
    } catch { return null; }
  },
  setItem: (key, value) => {
    try {
      sessionStorage.setItem(key, value);
      localStorage.setItem(key, value);
    } catch {}
  },
  removeItem: (key) => {
    try {
      sessionStorage.removeItem(key);
      localStorage.removeItem(key);
    } catch {}
  },
};

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
    storage: customStorage,
  }
});

// ── Offline-first Storage ─────────────────────────────────────────────────
const DB = {
  get: (k) => { try { return JSON.parse(localStorage.getItem(k)) || null; } catch { return null; } },
  set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2);

// ── Icons ─────────────────────────────────────────────────────────────────
const Icon = ({ name, size = 20, color = "currentColor" }) => {
  const d = {
    home:    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
    doc:     <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>,
    list:    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>,
    farm:    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
    plus:    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
    back:    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>,
    check:   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
    trash:   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>,
    edit:    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
    close:   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    search:  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
    wa:      <svg width={size} height={size} viewBox="0 0 24 24" fill={color}><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>,
    chevron: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>,
    note:    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
    cow:     <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="13" rx="7" ry="6"/><circle cx="9" cy="11" r="1" fill={color}/><circle cx="15" cy="11" r="1" fill={color}/><path d="M8 7c0-2 1-4 4-4s4 2 4 4"/><path d="M9 19c-1 1.5-2 2-3 2"/><path d="M15 19c1 1.5 2 2 3 2"/></svg>,
    reload:  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>,
    logout:  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
    bell:    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>,
    key:     <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>,
    semen:   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="3" ry="4"/><path d="M12 9c0 6-6 9-6 9h12s-6-3-6-9z"/><line x1="12" y1="18" x2="12" y2="22"/></svg>,
    user:    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    dg: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M9 12l2 2 4-4"/><path d="M3.6 9h16.8M3.6 15h16.8"/></svg>,
  };
  return d[name] || null;
};

// ── CSS ───────────────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=DM+Serif+Display:ital@0;1&family=Baloo+2:wght@500;600;700;800&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --g:#1b6b3a; --gl:#2a8a4e; --gp:#eaf5ee; --gm:#c6e6d2;
    --r:#c0392b; --rl:#fdecea;
    --y:#92650a; --yl:#fdf3dc;
    --gr0:#f7f9f8; --gr1:#eef2f0; --gr2:#d8e3dd; --gr3:#9ab5a6; --gr4:#5c7a6a; --gr5:#1e3329;
    --w:#fff; --sh:0 2px 12px rgba(0,0,0,.10); --shm:0 6px 24px rgba(0,0,0,.14);
    --r8:10px; --r12:14px; --r16:18px; --f:'Inter',sans-serif;
  }
  body { font-family:var(--f); background:var(--gr0); color:var(--gr5); -webkit-font-smoothing:antialiased; }
  .app { max-width:430px; margin:0 auto; min-height:100vh; background:var(--w); display:flex; flex-direction:column; }

  /* Auth screens */
  .auth-screen { min-height:100vh; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:24px; background:linear-gradient(160deg,#0a1a0f 0%,#163020 50%,#1b3a22 100%); }
  .auth-logo-img { width:248px; height:248px; object-fit:contain; margin-bottom:20px; }
  .auth-logo { font-family:var(--f); font-size:32px; font-weight:800; color:#fff; margin-bottom:6px; }
  .auth-logo span { color:#6fcf8e; }
  .auth-sub { font-size:14px; color:rgba(255,255,255,.5); margin-bottom:36px; }
  .auth-card { background:var(--w); border-radius:24px; padding:28px 24px; width:100%; max-width:380px; box-shadow:0 24px 64px rgba(0,0,0,.35); }
  .auth-title { font-size:20px; font-weight:800; margin-bottom:4px; }
  .auth-desc { font-size:13px; color:var(--gr4); margin-bottom:20px; }
  .auth-tabs { display:flex; border-bottom:2px solid var(--gr2); margin-bottom:20px; }
  .auth-tab { flex:1; padding:10px; text-align:center; font-size:15px; font-weight:600; color:var(--gr3); cursor:pointer; border-bottom:2px solid transparent; margin-bottom:-2px; }
  .auth-tab.on { color:var(--g); border-bottom-color:var(--g); }
  .auth-err { background:var(--rl); color:var(--r); border-radius:var(--r8); padding:10px 12px; font-size:14px; margin-bottom:14px; }
  .auth-ok { background:var(--gp); color:var(--g); border-radius:var(--r8); padding:10px 12px; font-size:14px; margin-bottom:14px; }
  .invite-box { background:var(--gr0); border:2px dashed var(--gr2); border-radius:var(--r12); padding:16px; margin-bottom:16px; text-align:center; }
  .invite-title { font-size:13px; font-weight:700; color:var(--gr4); margin-bottom:8px; text-transform:uppercase; letter-spacing:.5px; }
  .invite-codes { display:flex; flex-wrap:wrap; gap:6px; justify-content:center; }
  .invite-code { background:var(--g); color:#fff; padding:4px 12px; border-radius:99px; font-size:12px; font-weight:700; font-family:monospace; }
  
  /* Semen bank */
  .semen-card { background:var(--w); border:1.5px solid var(--gr2); border-radius:var(--r12); padding:14px; margin-bottom:10px; }
  .semen-raca { font-size:11px; font-weight:800; color:var(--g); text-transform:uppercase; letter-spacing:.5px; margin-bottom:6px; }
  .semen-item { display:flex; align-items:center; justify-content:space-between; padding:8px 0; border-bottom:1px solid var(--gr1); }
  .semen-item:last-child { border-bottom:none; padding-bottom:0; }
  .semen-nome { font-size:15px; font-weight:600; }
  .semen-qty { font-size:22px; font-weight:800; color:var(--g); min-width:40px; text-align:center; }
  .semen-qty.low { color:var(--r); }
  .semen-qty-btn { width:32px; height:32px; border-radius:50%; border:1.5px solid var(--gr2); background:var(--gr0); font-size:18px; font-weight:700; cursor:pointer; display:flex; align-items:center; justify-content:center; }
  
  /* Autocomplete */
  .autocomplete { position:relative; }
  .autocomplete-list { position:absolute; top:100%; left:0; right:0; background:var(--w); border:1.5px solid var(--g); border-radius:0 0 var(--r8) var(--r8); z-index:100; max-height:160px; overflow-y:auto; box-shadow:var(--shm); }
  .autocomplete-item { padding:10px 12px; font-size:13px; cursor:pointer; border-bottom:1px solid var(--gr1); }
  .autocomplete-item:hover { background:var(--gp); }
  
  /* Profile */
  .profile-section { background:var(--w); border:1.5px solid var(--gr2); border-radius:var(--r12); padding:16px; margin-bottom:12px; }
  .profile-label { font-size:10px; font-weight:800; color:var(--gr4); text-transform:uppercase; letter-spacing:.5px; margin-bottom:4px; }
  .profile-value { font-size:15px; font-weight:600; color:var(--gr5); }
  
  /* Terms modal */
  .terms-content { max-height:60vh; overflow-y:auto; font-size:13px; line-height:1.7; color:var(--gr4); }
  .terms-content h3 { color:var(--gr5); font-size:14px; margin:16px 0 6px; }

  /* Header */
  .hdr { background:linear-gradient(160deg,#0a1a0f 0%,#163020 50%,#1b3a22 100%); color:#fff; padding:0 16px 0 0; display:flex; align-items:center; gap:12px; position:sticky; top:0; z-index:50; box-shadow:0 2px 12px rgba(0,0,0,.22); min-height:72px; overflow:hidden; }
  .hdr-logo { height:46px; width:46px; object-fit:cover; flex-shrink:0; border-radius:12px; margin-left:14px; }
  .hdr-title { flex:1; font-family:'Baloo 2',sans-serif; font-size:21px; font-weight:600; font-style:normal; line-height:1.1; letter-spacing:0; }
  .hdr-title em { font-style:normal; font-weight:800; letter-spacing:.5px; }
  .hdr-sub { font-family:'Inter',sans-serif; font-size:12px; opacity:.65; font-weight:400; font-style:normal; }
  .hdr-btn { width:38px; height:38px; border-radius:50%; border:none; display:flex; align-items:center; justify-content:center; cursor:pointer; background:rgba(255,255,255,.18); color:#fff; flex-shrink:0; }
  .hdr-btn.danger { background:rgba(220,50,50,.28); }
  .hdr-btn.light { background:var(--gr1); color:var(--gr5); }

  /* Nav */
  .nav { position:fixed; bottom:0; left:50%; transform:translateX(-50%); width:100%; max-width:430px; background:var(--w); border-top:1.5px solid var(--gr2); display:flex; z-index:50; box-shadow:0 -2px 12px rgba(0,0,0,.07); }
  .nav-btn { flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:10px 0 8px; border:none; background:none; color:var(--gr3); font-family:var(--f); font-size:11px; font-weight:700; gap:3px; cursor:pointer; }
  .nav-btn.on { color:var(--g); }

  /* Screen */
  .scr { flex:1; overflow-y:auto; padding:16px; padding-bottom:90px; }
  @keyframes fadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  .scr { animation:fadeUp .18s ease; }

  /* Cards */
  .card { background:var(--w); border:1.5px solid var(--gr2); border-radius:var(--r12); padding:16px; margin-bottom:10px; cursor:pointer; transition:border-color .15s,box-shadow .15s; }
  .card:active { border-color:var(--g); box-shadow:0 2px 12px rgba(27,107,58,.12); }
  .card-title { font-size:16px; font-weight:700; margin-bottom:2px; }
  .card-sub { font-size:13px; color:var(--gr4); line-height:1.6; }
  .row { display:flex; align-items:center; gap:8px; }
  .rowsb { display:flex; align-items:center; justify-content:space-between; gap:8px; }

  /* Badges */
  .badge { display:inline-flex; align-items:center; font-size:12px; font-weight:700; padding:3px 9px; border-radius:99px; white-space:nowrap; }
  .b-g { background:var(--gp); color:var(--g); }
  .b-r { background:var(--rl); color:var(--r); }
  .b-gr { background:var(--gr1); color:var(--gr4); }

  /* Buttons */
  .btn { display:inline-flex; align-items:center; justify-content:center; gap:6px; border:none; border-radius:var(--r8); font-family:var(--f); font-size:14px; font-weight:700; cursor:pointer; padding:11px 18px; }
  .btn:active { opacity:.82; }
  .btn-p { background:linear-gradient(135deg,#1b6b3a,#145430); color:#fff; box-shadow:0 2px 8px rgba(27,107,58,.25); }
  .btn-gh { background:var(--gr1); color:var(--gr5); }
  .btn-d { background:var(--rl); color:var(--r); }
  .btn-wa { background:#25D366; color:#fff; }
  .btn-full { width:100%; }
  .btn-sm { padding:8px 13px; font-size:13px; }

  .fab { position:fixed; bottom:76px; right:16px; width:52px; height:52px; border-radius:50%; background:var(--g); color:#fff; border:none; box-shadow:var(--shm); cursor:pointer; display:flex; align-items:center; justify-content:center; z-index:60; }

  /* Form */
  .fg { margin-bottom:14px; }
  .fl { display:block; font-size:12px; font-weight:700; color:var(--gr4); text-transform:uppercase; letter-spacing:.5px; margin-bottom:5px; }
  .fi { width:100%; border:1.5px solid var(--gr2); border-radius:var(--r8); padding:11px 13px; font-family:var(--f); font-size:15px; color:var(--gr5); background:var(--w); outline:none; box-sizing:border-box; min-width:0; }
  .fi:focus { border-color:var(--g); box-shadow:0 0 0 3px var(--gp); }
  .fi-ta { min-height:80px; resize:vertical; }
  .fi-sel { appearance:none; background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239ab5a6' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E"); background-repeat:no-repeat; background-position:right 10px center; }
  input[type="date"], input[type="time"] { -webkit-appearance:none; appearance:none; }
  .frow { display:flex; gap:10px; }
  .frow .fg { flex:1; }
  .form-box { border:2px solid var(--g); border-radius:var(--r12); padding:16px; margin-top:12px; background:var(--gp); width:100%; overflow:hidden; }
  .form-box-title { font-size:14px; font-weight:800; color:var(--g); margin-bottom:14px; }

  .sec { font-size:11px; font-weight:700; color:var(--gr3); text-transform:uppercase; letter-spacing:.6px; margin:20px 0 10px; display:flex; align-items:center; gap:8px; }
  .sec::after { content:''; flex:1; height:1px; background:var(--gr2); }

  /* Timeline */
  .tl { display:flex; align-items:flex-start; }
  .tl-step { flex:1; display:flex; flex-direction:column; align-items:center; position:relative; }
  .tl-step::after { content:''; position:absolute; top:13px; left:50%; width:100%; height:2px; background:var(--gr2); z-index:0; }
  .tl-step:last-child::after { display:none; }
  .tl-dot { width:26px; height:26px; border-radius:50%; border:2px solid var(--gr2); background:var(--w); display:flex; align-items:center; justify-content:center; font-size:9px; font-weight:800; color:var(--gr3); position:relative; z-index:1; }
  .tl-dot.done { border-color:var(--g); background:var(--g); color:#fff; }
  .tl-lbl { font-size:10px; font-weight:700; color:var(--gr3); margin-top:4px; }
  .tl-lbl.done { color:var(--g); }
  .tl-date { font-size:9px; color:var(--gr3); }

  /* Animal card */
  .ac { border:1.5px solid var(--gr2); border-radius:var(--r12); margin-bottom:8px; overflow:hidden; background:var(--w); }
  .ac-head { display:flex; align-items:center; gap:10px; padding:12px 14px; cursor:pointer; }
  .ac-av { width:42px; height:42px; border-radius:50%; background:var(--gp); display:flex; align-items:center; justify-content:center; font-weight:800; font-size:14px; color:var(--g); flex-shrink:0; }
  .ac-info { flex:1; min-width:0; }
  .ac-name { font-size:15px; font-weight:700; }
  .ac-meta { font-size:12px; color:var(--gr4); margin-top:2px; line-height:1.5; }
  .ac-body { border-top:1px solid var(--gr1); padding:14px; background:var(--gr0); }

  /* Manejo */
  .manejos { display:flex; gap:8px; }
  .mj { flex:1; text-align:center; padding:8px 4px; border-radius:var(--r8); border:1.5px solid var(--gr2); font-size:13px; font-weight:800; color:var(--gr3); background:var(--w); cursor:pointer; user-select:none; }
  .mj.on { border-color:var(--g); background:var(--g); color:#fff; }

  /* Diag */
  .diag-row { display:flex; gap:8px; }
  .diag-btn { flex:1; padding:10px 6px; border-radius:var(--r8); border:1.5px solid var(--gr2); font-family:var(--f); font-size:13px; font-weight:700; cursor:pointer; background:var(--w); color:var(--gr4); }
  .diag-btn.p { border-color:var(--g); background:var(--gp); color:var(--g); }
  .diag-btn.v { border-color:var(--r); background:var(--rl); color:var(--r); }
  .diag-btn.pend { border-color:var(--gr3); background:var(--gr1); color:var(--gr5); }

  /* Stats */
  .stats { display:grid; grid-template-columns:repeat(4,1fr); gap:8px; margin-bottom:16px; }
  .stat { background:var(--gr0); border:1px solid var(--gr2); border-radius:var(--r8); padding:12px 6px; text-align:center; }
  .stat-n { font-size:24px; font-weight:800; color:var(--g); line-height:1; }
  .stat-l { font-size:11px; color:var(--gr4); margin-top:3px; font-weight:600; }

  .prog { background:var(--gr2); border-radius:99px; height:5px; overflow:hidden; margin-top:6px; }
  .prog-fill { height:100%; border-radius:99px; background:var(--g); transition:width .4s; }

  .info-box { background:var(--gp); border:1px solid var(--gm); border-radius:var(--r12); padding:12px 14px; margin-bottom:14px; }
  .div { height:1px; background:var(--gr2); margin:12px 0; }

  .empty { text-align:center; padding:40px 20px; color:var(--gr3); }
  .empty svg { opacity:.35; margin-bottom:10px; }
  .empty-t { font-size:15px; font-weight:700; color:var(--gr4); margin-bottom:4px; }
  .empty-s { font-size:13px; }

  .overlay { position:fixed; inset:0; background:rgba(0,0,0,.45); z-index:200; display:flex; align-items:flex-end; justify-content:center; }
  .modal { background:var(--w); border-radius:24px 24px 0 0; width:100%; max-width:430px; max-height:92vh; overflow-y:auto; padding:20px 16px; }
  .modal-hdr { display:flex; align-items:center; justify-content:space-between; margin-bottom:16px; }
  .modal-title { font-size:17px; font-weight:800; }

  .toast { position:fixed; top:70px; left:50%; transform:translateX(-50%); background:var(--gr5); color:#fff; padding:10px 22px; border-radius:99px; font-size:14px; font-weight:600; z-index:300; white-space:nowrap; box-shadow:var(--shm); }

  /* Notification banner */
  .notif-banner { background:var(--yl); border:1px solid #e8c96a; border-radius:var(--r8); padding:10px 14px; margin-bottom:10px; display:flex; align-items:center; gap:10px; font-size:13px; font-weight:600; color:var(--y); }
`;

// ── helpers ───────────────────────────────────────────────────────────────
const fmt = (d) => d ? new Date(d + "T12:00:00").toLocaleDateString("pt-BR") : "—";
const fmtDH = (d, h) => {
  if (!d) return "—";
  const date = new Date(d + "T12:00:00").toLocaleDateString("pt-BR", {day:"2-digit",month:"2-digit"});
  return h ? `${date} ${h}h` : date;
};
const calcDiasParida = (dataUltimoParto) => {
  if (!dataUltimoParto) return null;
  const diff = Math.floor((new Date() - new Date(dataUltimoParto + "T12:00:00")) / 86400000);
  return diff >= 0 ? diff : null;
};

// ── Notification helpers ──────────────────────────────────────────────────
const agendaNotificacoes = (protocolos) => {
  if (!("Notification" in window)) return;
  if (Notification.permission !== "granted") return;

  protocolos.forEach(p => {
    [["D0", p.d0], ["D8", p.d8], ["D10", p.d10], ["IA (Inseminação)", p.ia]].forEach(([label, date]) => {
      if (!date) return;
      const target = new Date(date + "T08:00:00");
      const aviso = new Date(target);
      aviso.setDate(aviso.getDate() - 1);
      const agora = new Date();
      const diff = aviso - agora;
      if (diff > 0 && diff < 86400000 * 2) {
        setTimeout(() => {
          new Notification("🐄 Controle IATF", {
            body: `Amanhã é o ${label} do protocolo! Verifique o cronograma.`,
            icon: "/icon-512.png"
          });
        }, Math.max(diff, 0));
      }
    });
  });
};

const pedirPermissaoNotificacao = async () => {
  try {
    if (!("Notification" in window)) return false;
    if (Notification.permission === "denied") return false; // já bloqueado, não pede de novo
    if (Notification.permission === "granted") return true;
    const perm = await Notification.requestPermission();
    return perm === "granted";
  } catch { return false; }
};

// ── Landing Page ──────────────────────────────────────────────────────────
const LANDING_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600;700&display=swap');
  .lp * { box-sizing:border-box; margin:0; padding:0; }
  .lp { min-height:100vh; background:linear-gradient(160deg,#0a1a0f 0%,#163020 50%,#1b3a22 100%); font-family:'DM Sans',sans-serif; color:#fff; overflow-x:hidden; }
  .lp-nav { position:fixed; top:0; left:0; right:0; z-index:100; display:flex; align-items:center; justify-content:space-between; padding:16px 24px; background:rgba(14,31,20,.85); backdrop-filter:blur(12px); border-bottom:1px solid rgba(255,255,255,.07); }
  .lp-logo { font-family:'DM Serif Display',serif; font-size:20px; color:#fff; }
  .lp-logo span { color:#6fcf8e; }
  .lp-nav-btn { background:var(--g,#1b6b3a); color:#fff; border:none; border-radius:99px; padding:9px 22px; font-family:'DM Sans',sans-serif; font-size:14px; font-weight:600; cursor:pointer; }
  .lp-hero { min-height:100vh; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; padding:100px 24px 60px; }
  .lp-badge { display:inline-flex; align-items:center; gap:6px; background:rgba(27,107,58,.3); border:1px solid rgba(111,207,142,.25); border-radius:99px; padding:6px 16px; font-size:12px; font-weight:600; color:#6fcf8e; letter-spacing:.5px; text-transform:uppercase; margin-bottom:28px; }
  .lp-h1 { font-family:'DM Serif Display',serif; font-size:clamp(38px,8vw,68px); line-height:1.08; letter-spacing:-1px; color:#fff; max-width:700px; margin-bottom:20px; }
  .lp-h1 em { font-style:italic; color:#6fcf8e; }
  .lp-sub { font-size:clamp(14px,2.5vw,17px); color:rgba(255,255,255,.6); max-width:480px; line-height:1.65; margin-bottom:36px; }
  .lp-btn { display:inline-flex; align-items:center; justify-content:center; gap:8px; background:#1b6b3a; color:#fff; border:none; border-radius:14px; padding:15px 32px; font-family:'DM Sans',sans-serif; font-size:16px; font-weight:700; cursor:pointer; box-shadow:0 8px 32px rgba(27,107,58,.4); margin-bottom:12px; width:100%; max-width:320px; }
  .lp-hint { font-size:12px; color:rgba(255,255,255,.35); margin-bottom:40px; }
  .lp-features { display:grid; grid-template-columns:repeat(auto-fit,minmax(260px,1fr)); gap:14px; max-width:900px; margin:0 auto; padding:0 24px 80px; }
  .lp-feat { background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.08); border-radius:18px; padding:24px; text-align:left; }
  .lp-feat-icon { font-size:24px; margin-bottom:12px; }
  .lp-feat-title { font-size:16px; font-weight:700; margin-bottom:6px; }
  .lp-feat-desc { font-size:13px; color:rgba(255,255,255,.5); line-height:1.6; }
  .lp-footer { border-top:1px solid rgba(255,255,255,.06); padding:32px 24px; text-align:center; color:rgba(255,255,255,.3); font-size:13px; }
  .lp-footer a { color:#6fcf8e; text-decoration:none; }
`;

function LandingPage({ onEnterApp }) {
  return (
    <div className="lp">
      <style>{LANDING_CSS}</style>
      <nav className="lp-nav">
        <img src="/favicon-simbolo-180.png" alt="Controle IATF" style={{width:36,height:36,objectFit:"cover",borderRadius:9}}/>
        <button className="lp-nav-btn" onClick={onEnterApp}>Entrar</button>
      </nav>

      <div className="lp-hero">
        <div className="lp-badge">🟢 Funciona offline · Para veterinários</div>
        <h1 className="lp-h1">O app do veterinário para <em>controle de IATF</em></h1>
        <p className="lp-sub">Gerencie protocolos, cadastre animais, calcule datas automaticamente e envie relatórios pelo WhatsApp — direto do campo.</p>
        <button className="lp-btn" onClick={onEnterApp}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
          Acessar o sistema
        </button>
        <p className="lp-hint">📱 Instale como app no iPhone e Android</p>
      </div>

      <div className="lp-features">
        {[
          ["📋","Protocolo completo","D0, D8 e IA com data e horário. Cronograma visual em tempo real."],
          ["🐄","Ficha individual","Nome, brinco, ECC, raça, touro utilizado e observações clínicas."],
          ["📅","Datas automáticas","DG previsto (35 dias) e parto previsto (283 dias) calculados na hora."],
          ["📲","Relatório via WhatsApp","Um toque gera e envia o relatório completo ao proprietário."],
          ["📡","Funciona offline","Use no campo sem internet. Sincroniza quando voltar a conexão."],
          ["🏡","Múltiplas fazendas","Gerencie quantas propriedades quiser com histórico completo."],
        ].map(([icon,title,desc])=>(
          <div key={title} className="lp-feat">
            <div className="lp-feat-icon">{icon}</div>
            <div className="lp-feat-title">{title}</div>
            <div className="lp-feat-desc">{desc}</div>
          </div>
        ))}
      </div>

      <footer className="lp-footer">
        <img src="/favicon-simbolo-180.png" alt="Controle IATF" style={{width:52,height:52,objectFit:"cover",borderRadius:13,marginBottom:8}}/>
        <p>Desenvolvido para médicos veterinários · <a href="https://controleiatf.com.br">controleiatf.com.br</a></p>
        <p style={{marginTop:6}}>© 2026 Controle IATF · Todos os direitos reservados</p>
      </footer>
    </div>
  );
}


// ── Trial helpers ─────────────────────────────────────────────────────────
const TRIAL_DIAS = 7;
const PRECO_MENSAL      = "R$ 97,00";   // mensal no cartão (renovação automática)
const PRECO_ANUAL_PIX   = "R$ 790,00";  // anual à vista no PIX
const PRECO_ANUAL_ANO   = "R$ 790,00";  // preço único anual (PIX e cartão)
const PRECO_ANUAL_CARTAO= "R$ 790,00";  // anual no cartão (10x de R$ 79,00 sem juros)
const PRECO_ANUAL_PARCELA="R$ 79,00";   // valor de cada parcela (10x)
const ECONOMIA_ANUAL    = "R$ 374,00";  // 97×12 − 790
const MP_PUBLIC_KEY = "APP_USR-a18e7639-8d8e-4631-af31-d214b0c38cc8";
const EDGE_FUNCTION_URL = "https://cwzcfovndjofpqgbjatw.supabase.co/functions/v1/criar-preferencia-mp";
const EDGE_PAGAMENTO_URL = "https://cwzcfovndjofpqgbjatw.supabase.co/functions/v1/quick-task";
const EDGE_ASSINATURA_URL = "https://cwzcfovndjofpqgbjatw.supabase.co/functions/v1/criar-assinatura";
const EDGE_PIX_URL = "https://cwzcfovndjofpqgbjatw.supabase.co/functions/v1/quick-task";
const EDGE_CHECK_PIX_URL = "https://cwzcfovndjofpqgbjatw.supabase.co/functions/v1/check-pix";

function diasRestantesTrial(createdAt) {
  if (!createdAt) return TRIAL_DIAS;
  const criado = new Date(createdAt);
  if (isNaN(criado.getTime())) return TRIAL_DIAS;
  const hoje = new Date();
  const diff = Math.floor((hoje - criado) / 86400000);
  return Math.max(0, TRIAL_DIAS - diff);
}

function formatPhone(v) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2)  return d.length ? `(${d}` : "";
  if (d.length <= 6)  return `(${d.slice(0,2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0,2)}) ${d.slice(2,6)}-${d.slice(6)}`;
  return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`;
}

// ── Decodificadores de erro do Mercado Pago ──────────────────────────────
function decodeMPCause(code, description) {
  const MAP = {
    "324": "CPF inválido. Verifique o número do CPF informado.",
    "325": "CPF inválido (dígito verificador incorreto). Verifique e tente novamente.",
    "326": "CPF não encontrado no sistema. Verifique o número.",
    "E301": "Token do cartão inválido ou expirado. Preencha os dados do cartão novamente.",
    "E302": "Código de segurança (CVV) inválido.",
    "316":  "Nome do titular inválido.",
    "E303": "Número de parcelas inválido.",
  };
  return MAP[String(code)] ?? `Erro MP (${code}): ${description ?? "verifique os dados e tente novamente."}`;
}

function decodeMPApiError(result) {
  // MP retornou erro na requisição (400, 401, 422) — pagamento não foi criado
  if (result?.error === "unauthorized" || result?._mp_http_status === 401) {
    return "Credencial do Mercado Pago inválida. Contate o suporte técnico.";
  }
  if (result?.cause?.length) {
    return decodeMPCause(result.cause[0].code, result.cause[0].description);
  }
  if (result?.message) return `Erro no pagamento: ${result.message}`;
  return `Erro ao processar pagamento (HTTP ${result?._mp_http_status ?? "?"}).`;
}

function decodeMPPaymentStatus(result) {
  // MP criou o pagamento mas ele foi recusado — aparece no painel MP
  const detail = String(result?.status_detail ?? "");
  const ref = result?.id ? ` (Ref MP: ${result.id})` : "";
  if (detail.includes("insufficient_amount"))   return `Saldo insuficiente no cartão.${ref}`;
  if (detail.includes("bad_filled_date"))       return `Data de vencimento inválida.${ref}`;
  if (detail.includes("bad_filled_security"))   return `Código de segurança (CVV) inválido.${ref}`;
  if (detail.includes("bad_filled_card_number"))return `Número do cartão inválido.${ref}`;
  if (detail.includes("bad_filled"))            return `Dados do cartão inválidos.${ref}`;
  if (detail.includes("max_attempts"))          return `Muitas tentativas recusadas. Tente outro cartão.${ref}`;
  if (detail.includes("cc_rejected_high_risk")) return `Pagamento bloqueado pelo antifraude do Mercado Pago${ref}. Causas comuns: conta MP vendedora nova/não verificada, muitas tentativas com o mesmo cartão, ou e-mail do comprador igual ao da conta vendedora. Tente: (1) outro cartão, (2) pagar via PIX, ou (3) verifique pendências no painel do Mercado Pago.`;
  if (detail.includes("cc_rejected_other"))     return `Cartão recusado pelo banco emissor.${ref}`;
  if (detail.includes("rejected"))              return `Cartão recusado: ${detail}.${ref}`;
  if (result?.status === "in_process" || result?.status === "pending") return "Pagamento em análise — você receberá confirmação em breve.";
  return `Pagamento não aprovado${detail ? `: ${detail}` : ""}.${ref}`;
}

// ── Helpers de pagamento ─────────────────────────────────────────────────
function validarCPF(cpf) {
  const c = cpf.replace(/\D/g, "");
  if (c.length !== 11 || /^(\d)\1+$/.test(c)) return false;
  let s = 0;
  for (let i = 0; i < 9; i++) s += Number(c[i]) * (10 - i);
  let r = (s * 10) % 11; if (r === 10 || r === 11) r = 0;
  if (r !== Number(c[9])) return false;
  s = 0;
  for (let i = 0; i < 10; i++) s += Number(c[i]) * (11 - i);
  r = (s * 10) % 11; if (r === 10 || r === 11) r = 0;
  return r === Number(c[10]);
}
function formatCPF(v) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0,3)}.${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6)}`;
  return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6,9)}-${d.slice(9)}`;
}
function formatCEP(v) {
  const d = v.replace(/\D/g, "").slice(0, 8);
  return d.length <= 5 ? d : `${d.slice(0,5)}-${d.slice(5)}`;
}

// ── Tela de pagamento com Mercado Pago Bricks ────────────────────────────
function PaywallScreen({ user, perfil, onLogout, pagLoading, setPagLoading, setPerfil }) {
  const [erro, setErro] = useState("");
  const [plano, setPlano] = useState("anual");
  const [step, setStep] = useState("planos"); // "planos" | "pagamento" | "pix" | "pago"
  const [processando, setProcessando] = useState(false);
  const [pixData, setPixData] = useState(null);
  const [pixPolling, setPixPolling] = useState(false);
  const [brickKey, setBrickKey] = useState(0);
  const brickRef = useRef(null);
  const [cpf, setCpf] = useState("");
  const [nascimento, setNascimento] = useState("");
  const [cep, setCep] = useState("");
  const [numero, setNumero] = useState("");
  const [cpfErro, setCpfErro] = useState("");
  const [pixTriggerPaywall, setPixTriggerPaywall] = useState(0);

  const msgWA = plano === "anual"
    ? `Olá! Quero assinar o Controle IATF no plano Anual por ${PRECO_ANUAL_PIX} (PIX) ou ${PRECO_ANUAL_CARTAO} em 10x no cartão.`
    : `Olá! Quero assinar o Controle IATF no plano Mensal por ${PRECO_MENSAL}/mês.`;

  // Gera PIX via quick-task (mesma função do cartão, rota PIX interna)
  const handlePix = async () => {
    setProcessando(true);
    setErro("");
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const authToken = session?.access_token || "";
      const res = await fetch(EDGE_PIX_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${authToken}` },
        body: JSON.stringify({ payment_method_id: "pix", plano, email: user?.email, userId: user?.id }),
      });
      const data = await res.json();
      if (!res.ok) { setErro("Erro ao gerar PIX: " + (data.error || "tente novamente")); return; }
      if (!data?.qr_code) { setErro("QR Code não retornado. Tente novamente."); return; }
      setPixData(data);
      setPixPolling(true);
    } catch(e) {
      setErro("Erro: " + e.message);
    } finally {
      setProcessando(false);
    }
  };

  // Polling do PIX a cada 5s
  useEffect(() => {
    if (!pixPolling || !pixData?.payment_id) return;
    const interval = setInterval(async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const authToken = session?.access_token || "";
        const res = await fetch(EDGE_CHECK_PIX_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${authToken}` },
          body: JSON.stringify({ payment_id: pixData.payment_id, userId: user?.id, plano }),
        });
        const data = await res.json();
        if (data.status === "approved") {
          clearInterval(interval);
          setPixPolling(false);
          // Persiste assinante=true no Supabase para sobreviver ao logout/login
          await supabase.from("perfis").update({ assinante: true, plano }).eq("id", user?.id);
          if (setPerfil) setPerfil(x => ({ ...x, assinante: true, plano }));
          setStep("pago");
        }
      } catch(e) { console.error("polling pix:", e); }
    }, 5000);
    return () => clearInterval(interval);
  }, [pixPolling, pixData]);

  // Auto-dispara PIX — pixTriggerPaywall garante re-disparo mesmo se step já era "pix"
  useEffect(() => {
    if (step === "pix" && !processando) handlePix();
  }, [step, pixTriggerPaywall]);

  // Inicializa o Brick de pagamento
  useEffect(() => {
    if (step !== "pagamento") return;

    let destroyed = false;
    setErro("");
    setProcessando(false);

    // Destrói instância anterior antes de criar nova (evita esqueleto cinza após reload)
    try { brickRef.current?.unmount?.(); } catch(_) {}
    brickRef.current = null;
    const container = document.getElementById("cardPayment-container");
    if (container) container.innerHTML = "";

    const initBrick = async () => {
      // Aguarda 300ms para garantir que instância anterior foi completamente destruída
      await new Promise(r => setTimeout(r, 300));
      if (destroyed) return;
      if (!window.MercadoPago) {
        setTimeout(initBrick, 500);
        return;
      }
      // Cria nova instância do MercadoPago a cada vez para evitar estado corrompido
      const mp = new window.MercadoPago(MP_PUBLIC_KEY, { locale: "pt-BR" });
      const bricksBuilder = mp.bricks();
      // Anual: R$ 790,00 (mesmo valor PIX e cartão) — 10x de R$ 79,00 sem juros
      const valor = plano === "anual" ? 790.00 : 97.00;

      const _cpfDigits = cpf.replace(/\D/g, "");
      const _waDig = (perfil?.whatsapp || "").replace(/\D/g, "");
      try { brickRef.current = await bricksBuilder.create("cardPayment", "cardPayment-container", {
        initialization: {
          amount: valor,
          payer: {
            email: user?.email || "",
            firstName: perfil?.nome || "",
            lastName: perfil?.sobrenome || "",
            ...(_cpfDigits ? { identification: { type: "CPF", number: _cpfDigits } } : {}),
            ...(_waDig.length >= 10 ? { phone: { areaCode: _waDig.slice(0,2), number: _waDig.slice(2) } } : {}),
          },
        },
        customization: {
          paymentMethods: { minInstallments: 1, maxInstallments: plano === "anual" ? 10 : 1 },
          visual: { style: { theme: "default" }, hidePaymentButton: false, hideFormTitle: false },
        },
        callbacks: {
          onReady: () => { setProcessando(false); },
          onError: (err) => {
            console.error("[Brick onError]", err);
            setProcessando(false);
            setErro("Erro no formulário: " + (err?.message || "tente novamente"));
          },
          onSubmit: async (submitData) => {
            setProcessando(true);
            setErro("");

            // Extrai formData — Bricks v2 embala em { formData:{...} }, versões antigas passam direto
            const fd = (submitData?.formData && typeof submitData.formData === "object")
              ? submitData.formData
              : (submitData || {});

            console.log("[Brick onSubmit] token=%s method=%s installments=%s payer=%s",
              fd.token?.slice(0, 14) + "***",
              fd.payment_method_id || fd.paymentMethodId,
              fd.installments,
              JSON.stringify({ email: fd.payer?.email, identification: fd.payer?.identification }),
            );

            try {
              if (!fd.token) {
                setErro("Cartão não tokenizado. Preencha todos os dados do cartão e tente novamente.");
                throw new Error("token ausente");
              }
              // Valida dados do titular (antifraude MP)
              if (!validarCPF(cpf)) {
                setErro("CPF do titular inválido. Preencha o CPF corretamente acima.");
                throw new Error("cpf inválido");
              }
              if (cep.replace(/\D/g,"").length !== 8 || !numero.trim()) {
                setErro("Preencha CEP e número do titular acima.");
                throw new Error("endereço incompleto");
              }

              // getSession com timeout — evita travar em rede ruim
              let authToken = "";
              try {
                const sessRes = await Promise.race([
                  supabase.auth.getSession(),
                  new Promise((_, r) => setTimeout(() => r(new Error("timeout_sessao")), 8000)),
                ]);
                authToken = sessRes?.data?.session?.access_token || "";
              } catch (sessErr) {
                if (sessErr.message !== "timeout_sessao") throw sessErr;
                console.warn("[Brick] getSession timeout — prosseguindo sem token de sessão");
              }

              const payMethodId = fd.payment_method_id || fd.paymentMethodId || "";
              const issuerId    = fd.issuer_id ?? fd.issuerId;

              // Nome do titular: prioriza o que o Brick coletou (nome exato do cartão)
              const cardholderFull = (fd.cardholderName || fd.holderName || fd.payer?.name || "").trim();
              const nameParts = cardholderFull ? cardholderFull.split(/\s+/) : [];
              const cardFirst = nameParts[0] || "";
              const cardLast  = nameParts.slice(1).join(" ") || "";

              const _cpfNum = cpf.replace(/\D/g, "");
              const telDig = (perfil?.whatsapp || "").replace(/\D/g, "");
              const payload = {
                token: fd.token,
                plano,
                email:  user?.email,
                userId: user?.id,
                installments:      Number(fd.installments) || 1,
                payment_method_id: payMethodId,
                issuer_id: issuerId != null ? String(issuerId) : undefined,
                payer: {
                  email:      user?.email || fd.payer?.email || "",
                  first_name: cardFirst || perfil?.nome || "",
                  last_name:  cardLast  || perfil?.sobrenome || "",
                  identification: { type: "CPF", number: _cpfNum || (fd.payer?.identification?.number || "") },
                  date_of_birth: nascimento || undefined,
                  phone: telDig.length >= 10 ? { area_code: telDig.slice(0,2), number: telDig.slice(2) } : undefined,
                  ...(cep ? { address: { zip_code: cep.replace(/\D/g,""), street_number: numero || "S/N" } } : {}),
                },
              };

              const url = plano === "mensal" ? EDGE_ASSINATURA_URL : EDGE_PAGAMENTO_URL;
              console.log("[Brick onSubmit] POST →", url);

              const controller = new AbortController();
              const tId = setTimeout(() => controller.abort(), 25000);
              let res;
              try {
                res = await fetch(url, {
                  method: "POST",
                  headers: { "Content-Type": "application/json", "Authorization": `Bearer ${authToken}` },
                  body: JSON.stringify(payload),
                  signal: controller.signal,
                });
              } finally { clearTimeout(tId); }

              const result = await res.json().catch(() => ({ error: "Resposta do servidor não é JSON." }));
              console.log("[Brick onSubmit] edge http=%s _mp_http=%s ambiente=%s status=%s detail=%s id=%s cause=%s",
                res.status, result?._mp_http_status, result?._mp_ambiente, result?.status, result?.status_detail, result?.id,
                JSON.stringify(result?.cause ?? []),
              );

              // ── Erro de servidor (nossa edge function falhou antes de chamar o MP) ──
              if (!res.ok) {
                const msg = result?.error || `Erro interno do servidor (HTTP ${res.status}). Tente novamente ou contate o suporte.`;
                setErro(msg);
                throw new Error(msg);
              }

              // ── Detecta mismatch de ambiente MP (ACCESS_TOKEN de teste + chave pública de produção) ──
              if (result?._mp_ambiente === "teste") {
                const msg = "Erro de configuração: servidor usando credencial de TESTE do Mercado Pago. Acesse Supabase → Edge Functions → Secrets e atualize MP_ACCESS_TOKEN para a chave de produção (APP_USR-...).";
                setErro(msg);
                throw new Error(msg);
              }

              // ── Log diagnóstico: qual conta MP está recebendo os pagamentos ──
              if (result?._mp_conta_email) {
                console.log("[Brick onSubmit] CONTA MP QUE RECEBE O PAGAMENTO: email=%s id=%s",
                  result._mp_conta_email, result._mp_conta_id ?? "?");
                // Detecta autocompra: comprador == vendedor (causa de cc_rejected_high_risk)
                const buyerEmail = (payerData.email || user?.email || "").trim().toLowerCase();
                const sellerEmail = String(result._mp_conta_email).trim().toLowerCase();
                if (buyerEmail && sellerEmail && buyerEmail === sellerEmail) {
                  const msg = `Autocompra detectada: o e-mail do comprador (${buyerEmail}) é o mesmo da conta Mercado Pago que recebe o pagamento. Use um e-mail diferente para o comprador ao testar.`;
                  setErro(msg);
                  throw new Error(msg);
                }
              }

              // ── MP rejeitou a requisição (credencial errada, CPF inválido, token inválido) ──
              const mpHttp = result?._mp_http_status ?? 200;
              if (mpHttp >= 400) {
                const msg = decodeMPApiError(result);
                setErro(msg + (result?._mp_conta_email ? `\n[Conta MP: ${result._mp_conta_email}]` : ""));
                throw new Error(msg);
              }

              // ── Pagamento criado no MP — verifica se foi aprovado ──
              // Só libera acesso em pagamentos efetivamente aprovados/autorizados
              // in_process/pending = análise — NÃO concede acesso ainda
              const okStatus = ["approved", "authorized"];
              const analiseStatus = ["in_process", "pending"];
              if (okStatus.includes(result?.status)) {
                await supabase.from("perfis").update({ assinante: true, plano }).eq("id", user?.id);
                if (setPerfil) setPerfil(x => ({ ...x, assinante: true, plano }));
                setStep("pago");
              } else if (analiseStatus.includes(result?.status)) {
                // Pagamento em análise: informa mas NÃO libera acesso
                setErro("Pagamento em análise pelo Mercado Pago. Você receberá a confirmação em breve. Acesso liberado automaticamente após aprovação.");
                throw new Error("em_analise");
              } else {
                const msg = decodeMPPaymentStatus(result);
                setErro(msg + (result?._mp_conta_email ? `\n[Conta MP: ${result._mp_conta_email}]` : ""));
                throw new Error(msg);
              }

            } catch (e) {
              if (e.name === "AbortError") {
                setErro("Tempo esgotado (25s). Verifique a conexão e tente novamente.");
              }
              // setErro já foi chamado nos blocos acima para todos os outros casos
              throw e; // o Brick precisa do throw para sair do estado "Processando"
            } finally {
              setProcessando(false);
            }
          },
        },
      }); } catch (createErr) {
        if (!destroyed) {
          console.error("[Brick] falha ao criar:", createErr);
          setErro("Erro ao carregar formulário de pagamento. Clique em 'Tentar novamente'.");
        }
      }
    };

    if (!window.MercadoPago) {
      // Evita carregar o SDK mais de uma vez
      if (!document.getElementById("mp-sdk-script")) {
        const script = document.createElement("script");
        script.id = "mp-sdk-script";
        script.src = "https://sdk.mercadopago.com/js/v2";
        script.onload = () => initBrick().catch(e => console.error("[initBrick]", e));
        document.head.appendChild(script);
      } else {
        const waitForMP = setInterval(() => {
          if (window.MercadoPago) { clearInterval(waitForMP); initBrick().catch(e => console.error("[initBrick]", e)); }
        }, 100);
      }
    } else {
      initBrick().catch(e => console.error("[initBrick]", e));
    }

    // Timeout de segurança: se onReady não disparar em 5s, some o loader
    const safetyTimer = setTimeout(() => setProcessando(false), 5000);

    return () => {
      destroyed = true;
      clearTimeout(safetyTimer);
      setProcessando(false); // garante reset do estado ao desmontar o Brick
      setErro("");
      try { brickRef.current?.unmount?.(); } catch(_) {}
      brickRef.current = null;
      const el = document.getElementById("cardPayment-container");
      if (el) el.innerHTML = "";
    };
  }, [step, plano, brickKey]);

  // Watchdog: se "Processando..." ficar preso por 30s, força reset e remonta o Brick
  useEffect(() => {
    if (!processando) return;
    const wd = setTimeout(() => {
      console.warn("[PaywallScreen watchdog] processando stuck 30s — forçando reset");
      setProcessando(false);
      setErro("Tempo esgotado. Clique em 'Tentar novamente' para recarregar o formulário.");
      setBrickKey(k => k + 1);
    }, 30000);
    return () => clearTimeout(wd);
  }, [processando]);

  // (StepBar removido — fluxo simplificado: planos → pagamento/pix → pago)

  // Logos de bandeiras aceitas
  const CardLogos = () => (
    <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap",justifyContent:"center"}}>
      {[
        {name:"Visa",bg:"#1a1f71",color:"#fff",style:{fontStyle:"italic",letterSpacing:-1}},
        {name:"Master",bg:"linear-gradient(90deg,#eb001b 40%,#f79e1b 60%)",color:"#fff"},
        {name:"Elo",bg:"#ffcb05",color:"#000"},
        {name:"Hiper",bg:"#e03021",color:"#fff"},
        {name:"Amex",bg:"#007bc1",color:"#fff"},
      ].map(b=>(
        <div key={b.name} style={{background:b.bg,borderRadius:4,padding:"2px 7px",fontSize:9,fontWeight:800,color:b.color,...(b.style||{}),height:20,display:"flex",alignItems:"center",boxShadow:"0 1px 3px rgba(0,0,0,0.2)"}}>
          {b.name}
        </div>
      ))}
    </div>
  );

  // Badge Mercado Pago
  const MPBadge = () => (
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:6,padding:"8px 12px",background:"#f0f8ff",borderRadius:8,border:"1px solid #bde0ff"}}>
      <svg width="18" height="18" viewBox="0 0 48 48" fill="none"><rect width="48" height="48" rx="8" fill="#009ee3"/><text x="50%" y="57%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="18" fontWeight="bold" fontFamily="sans-serif">MP</text></svg>
      <span style={{fontSize:11,fontWeight:700,color:"#006aad"}}>Powered by Mercado Pago</span>
    </div>
  );


  // Tela de sucesso
  if (step === "pago") return (
    <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24,background:"linear-gradient(160deg,#0a1a0f 0%,#163020 50%,#1b3a22 100%)"}}>
      <img src="/icon-512.png" alt="Controle IATF" style={{width:80,height:80,objectFit:"cover",borderRadius:18,marginBottom:20,boxShadow:"0 8px 24px rgba(0,0,0,.3)"}}/>
      <div style={{background:"#fff",borderRadius:24,padding:32,width:"100%",maxWidth:380,textAlign:"center"}}>
        <div style={{fontSize:56,marginBottom:12}}>🎉</div>
        <div style={{fontSize:22,fontWeight:800,color:"#15803d",marginBottom:8}}>Assinatura ativada com sucesso!</div>
        <div style={{fontSize:14,color:"#64748b",marginBottom:20,lineHeight:1.6}}>Seu acesso completo ao Controle IATF está ativo. Bom trabalho!</div>
        <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:20}}>
          {["✅ Protocolos ilimitados","✅ Diagnóstico de gestação","✅ Relatórios profissionais","✅ Banco de sêmen"].map(i=>(
            <div key={i} style={{fontSize:13,color:"#374151",textAlign:"left"}}>{i}</div>
          ))}
        </div>
        <button onClick={()=>window.location.reload()} style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,background:"#16a34a",color:"#fff",border:"none",borderRadius:12,padding:"15px 28px",fontFamily:"var(--f)",fontSize:15,fontWeight:700,cursor:"pointer",width:"100%",boxShadow:"0 4px 12px rgba(22,163,74,0.35)"}}>
          Acessar o app agora
        </button>
      </div>
    </div>
  );

  // Tela PIX
  if (step === "pix") {
    return (
      <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",padding:24,background:"linear-gradient(160deg,#0a1a0f 0%,#163020 50%,#1b3a22 100%)",overflowY:"auto"}}>
        <img src="/icon-512.png" alt="Controle IATF" style={{width:64,height:64,objectFit:"cover",borderRadius:15,marginTop:20,marginBottom:12,boxShadow:"0 8px 24px rgba(0,0,0,.3)"}}/>
        <div style={{background:"#fff",borderRadius:24,padding:24,width:"100%",maxWidth:420,marginBottom:24}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
            <button onClick={()=>{setStep("planos");setPixData(null);setPixPolling(false);}} style={{background:"var(--gr1)",border:"none",borderRadius:8,padding:"6px 12px",cursor:"pointer",fontFamily:"var(--f)",fontSize:13,fontWeight:600}}>← Voltar</button>
            <div style={{flex:1,textAlign:"center",fontSize:15,fontWeight:800,color:"#1e293b"}}>Pagar com PIX</div>
          </div>

          <div style={{background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:12,padding:"10px 14px",marginBottom:14}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontSize:13,fontWeight:700,color:"#15803d"}}>Total a pagar</span>
              <span style={{fontSize:18,fontWeight:800,color:"#15803d"}}>{plano==="anual"?PRECO_ANUAL_PIX:PRECO_MENSAL}</span>
            </div>
            {plano==="anual"&&<div style={{fontSize:11,color:"#059669",marginTop:2}}>à vista no PIX — valor exato cobrado pelo QR Code</div>}
          </div>

          {erro && <div style={{background:"var(--rl)",color:"var(--r)",borderRadius:8,padding:"10px 12px",fontSize:13,marginBottom:12}}>⚠️ {erro}</div>}
          {processando && !pixData && (
            <div style={{textAlign:"center",padding:24,color:"var(--g)",fontWeight:600}}>Gerando QR Code PIX...</div>
          )}
          {pixData && (
            <div style={{textAlign:"center",padding:"10px 0"}}>
              <div style={{fontSize:14,fontWeight:700,color:"#15803d",marginBottom:12}}>Escaneie o QR Code para pagar</div>
              {pixData.qr_code_base64 && (
                <img src={`data:image/png;base64,${pixData.qr_code_base64}`} alt="QR Code PIX"
                  style={{width:220,height:220,borderRadius:12,border:"2px solid #bbf7d0",marginBottom:12,display:"block",margin:"0 auto 12px"}}/>
              )}
              <div style={{fontSize:12,color:"#64748b",marginBottom:8}}>ou copie o código PIX abaixo:</div>
              <div style={{background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:8,padding:"8px 12px",fontSize:11,wordBreak:"break-all",marginBottom:12,textAlign:"left",color:"#374151"}}>
                {pixData.qr_code}
              </div>
              <button onClick={()=>{navigator.clipboard?.writeText(pixData.qr_code).then(()=>alert("Código copiado!"));}}
                style={{background:"#16a34a",color:"#fff",border:"none",borderRadius:10,padding:"12px 20px",fontWeight:700,cursor:"pointer",width:"100%",marginBottom:10,fontSize:14}}>
                Copiar código PIX
              </button>
              {pixPolling && <div style={{fontSize:12,color:"#64748b",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
                <span style={{display:"inline-block",width:8,height:8,borderRadius:"50%",background:"#16a34a",animation:"pulse 1.5s infinite"}}/>
                Aguardando confirmação do pagamento...
              </div>}
            </div>
          )}
          <div style={{marginTop:14}}><MPBadge/></div>
        </div>
      </div>
    );
  }

  if (step === "pagamento") return (
    <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",padding:24,background:"linear-gradient(160deg,#0a1a0f 0%,#163020 50%,#1b3a22 100%)",overflowY:"auto"}}>
      <img src="/icon-512.png" alt="Controle IATF" style={{width:64,height:64,objectFit:"cover",borderRadius:15,marginTop:20,marginBottom:12,boxShadow:"0 8px 24px rgba(0,0,0,.3)"}}/>
      <div style={{background:"#fff",borderRadius:24,padding:24,width:"100%",maxWidth:420,marginBottom:24}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
          <button onClick={()=>setStep("planos")} style={{background:"var(--gr1)",border:"none",borderRadius:8,padding:"6px 12px",cursor:"pointer",fontFamily:"var(--f)",fontSize:13,fontWeight:600}}>← Voltar</button>
          <div style={{flex:1,textAlign:"center",fontSize:15,fontWeight:800,color:"#1e293b"}}>Pagamento com cartão</div>
        </div>

        {/* Resumo do valor */}
        <div style={{background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:12,padding:"10px 14px",marginBottom:14}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{fontSize:13,fontWeight:700,color:"#15803d"}}>{plano==="anual"?"Plano Anual":"Plano Mensal"}</span>
            <span style={{fontSize:18,fontWeight:800,color:"#15803d"}}>{plano==="anual"?PRECO_ANUAL_CARTAO:PRECO_MENSAL}</span>
          </div>
          {plano==="anual"&&<div style={{fontSize:11,color:"#059669",marginTop:2}}>10x de {PRECO_ANUAL_PARCELA} sem juros · sem cobrança adicional</div>}
        </div>

        {/* Dados do titular — antifraude Mercado Pago */}
        <div style={{fontSize:11,fontWeight:700,color:"var(--g)",textTransform:"uppercase",letterSpacing:.5,marginBottom:8}}>Dados do titular</div>
        <div className="frow" style={{marginBottom:8}}>
          <div className="fg">
            <label className="fl">CPF *</label>
            <input className="fi" value={cpf} onChange={e=>{setCpf(formatCPF(e.target.value));setCpfErro("");}} placeholder="000.000.000-00" inputMode="numeric" maxLength={14}/>
            {cpfErro&&<div style={{color:"var(--r)",fontSize:11,marginTop:2}}>{cpfErro}</div>}
          </div>
          <div className="fg">
            <label className="fl">Nascimento *</label>
            <input className="fi" type="date" value={nascimento} onChange={e=>setNascimento(e.target.value)}/>
          </div>
        </div>
        <div className="frow" style={{marginBottom:10}}>
          <div className="fg" style={{flex:"0 0 150px"}}>
            <label className="fl">CEP *</label>
            <input className="fi" value={cep} onChange={e=>setCep(formatCEP(e.target.value))} placeholder="00000-000" inputMode="numeric" maxLength={9}/>
          </div>
          <div className="fg">
            <label className="fl">Número *</label>
            <input className="fi" value={numero} onChange={e=>setNumero(e.target.value)} placeholder="Ex: 142"/>
          </div>
        </div>

        {/* Logos das bandeiras */}
        <div style={{marginBottom:14}}><CardLogos/></div>

        {erro && (
          <div style={{marginBottom:12}}>
            <div style={{background:"#fef2f2",border:"1px solid #fecaca",color:"#dc2626",borderRadius:8,padding:"10px 12px",fontSize:13,marginBottom:8}}>
              ⚠️ {erro}
            </div>
            <button onClick={()=>{setErro("");setBrickKey(k=>k+1);}} style={{background:"#fef9c3",border:"1px solid #fde047",color:"#854d0e",borderRadius:8,padding:"8px 12px",fontSize:13,fontWeight:700,cursor:"pointer",width:"100%"}}>
              Tentar novamente
            </button>
          </div>
        )}

        <div style={{position:"relative"}}>
          <div id="cardPayment-container"/>
          {processando && <div style={{position:"absolute",inset:0,background:"rgba(255,255,255,0.9)",display:"flex",alignItems:"center",justifyContent:"center",borderRadius:12,zIndex:10}}>
            <div style={{textAlign:"center"}}>
              <div style={{fontSize:15,fontWeight:700,color:"#15803d",marginBottom:4}}>Processando pagamento...</div>
              <div style={{fontSize:12,color:"#64748b"}}>Não feche esta tela</div>
            </div>
          </div>}
        </div>

        <div style={{display:"flex",alignItems:"center",gap:8,padding:"10px 14px",background:"#f0fdf4",borderRadius:10,marginTop:14,marginBottom:10}}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          <span style={{fontSize:11,color:"#16a34a",fontWeight:600}}>Pagamento 100% seguro · criptografado</span>
        </div>

        {!pixData && (
          <button id="btn-pix" onClick={handlePix} disabled={processando}
            style={{display:"flex",alignItems:"center",justifyContent:"center",gap:6,fontSize:13,color:"#00897B",fontWeight:700,border:"1px solid rgba(0,137,123,.25)",background:"rgba(0,137,123,.07)",borderRadius:12,padding:"11px 16px",width:"100%",marginBottom:14,cursor:"pointer"}}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00897B" strokeWidth="2.5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
            Pagar com PIX
          </button>
        )}
        <MPBadge/>
      </div>
    </div>
  );

  // Tela de seleção de plano
  return (
    <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24,background:"linear-gradient(160deg,#0a1a0f 0%,#163020 50%,#1b3a22 100%)",overflowY:"auto"}}>
      <img src="/icon-512.png" alt="Controle IATF" style={{width:96,height:96,objectFit:"cover",borderRadius:22,marginBottom:12,boxShadow:"0 10px 28px rgba(0,0,0,.32)"}}/>
      <div style={{fontSize:13,color:"rgba(255,255,255,.5)",marginBottom:24}}>controleiatf.com.br</div>
      <div style={{background:"#fff",borderRadius:24,padding:28,width:"100%",maxWidth:380}}>
        <div style={{textAlign:"center",marginBottom:20}}>
          <div style={{fontSize:22,fontWeight:800,color:"var(--gr5)",marginBottom:6}}>Continue tendo controle total</div>
          <div style={{fontSize:13,color:"var(--gr4)",lineHeight:1.6}}>Assine e continue gerando relatórios profissionais, controlando protocolos e impressionando seus clientes.</div>
        </div>
        <div style={{display:"flex",background:"var(--gr1)",borderRadius:12,padding:4,marginBottom:16,gap:4}}>
          <button onClick={()=>setPlano("mensal")} style={{flex:1,padding:"10px 0",borderRadius:10,border:"none",fontFamily:"var(--f)",fontSize:14,fontWeight:700,cursor:"pointer",background:plano==="mensal"?"#fff":"transparent",color:plano==="mensal"?"var(--gr5)":"var(--gr4)"}}>Mensal</button>
          <button onClick={()=>setPlano("anual")} style={{flex:1,padding:"10px 0",borderRadius:10,border:"none",fontFamily:"var(--f)",fontSize:14,fontWeight:700,cursor:"pointer",background:plano==="anual"?"#1b6b3a":"transparent",color:plano==="anual"?"#fff":"var(--gr4)",position:"relative"}}>
            Anual
            {plano==="anual"&&<span style={{position:"absolute",top:-8,right:6,background:"#f59e0b",color:"#fff",fontSize:9,fontWeight:800,padding:"2px 6px",borderRadius:99}}>-32%</span>}
          </button>
        </div>
        <div style={{background:plano==="anual"?"var(--gp)":"var(--gr1)",border:`2px solid ${plano==="anual"?"var(--gm)":"var(--gr2)"}`,borderRadius:16,padding:"20px 16px",marginBottom:16,textAlign:"center"}}>
          {plano==="anual"&&<div style={{fontSize:11,fontWeight:800,color:"#1b6b3a",textTransform:"uppercase",letterSpacing:.5,marginBottom:4}}>⭐ Mais popular</div>}
          {plano==="anual"
            ?<>
              <div style={{fontSize:38,fontWeight:800,color:"#1b6b3a",lineHeight:1}}>{PRECO_ANUAL_ANO}<span style={{fontSize:16,fontWeight:500,color:"#5a8a6a"}}>/ano</span></div>
              <div style={{fontSize:13,color:"#059669",marginTop:4,fontWeight:600}}>PIX à vista · ou 10x de {PRECO_ANUAL_PARCELA} sem juros no cartão</div>
            </>
            :<>
              <div style={{fontSize:38,fontWeight:800,color:"#1b6b3a",lineHeight:1}}>{PRECO_MENSAL}<span style={{fontSize:16,fontWeight:500,color:"#5a8a6a"}}>/mês</span></div>
              <div style={{fontSize:13,color:"var(--gr4)",marginTop:4}}>renovação automática no cartão · cancele quando quiser</div>
            </>
          }
          {plano==="anual"&&<div style={{marginTop:8,background:"#1b6b3a",color:"#fff",borderRadius:99,padding:"4px 14px",fontSize:12,fontWeight:700,display:"inline-block"}}>Você economiza {ECONOMIA_ANUAL} por ano vs mensal</div>}
        </div>
        <div style={{marginBottom:16}}>
          {["✅ Protocolos e fazendas ilimitados","✅ Relatório profissional via WhatsApp","✅ Diagnóstico de gestação (DG)","✅ Controle de banco de sêmen","✅ Funciona offline no celular","✅ Cancele quando quiser"].map(item=>(
            <div key={item} style={{fontSize:13,color:"var(--gr5)",padding:"5px 0",borderBottom:"1px solid var(--gr1)"}}>{item}</div>
          ))}
        </div>
        <div style={{fontSize:12,color:"var(--gr4)",background:"var(--gr1)",borderRadius:8,padding:"8px 12px",marginBottom:16}}>
          💡 <strong>Se diluir o valor por animal, em todos os protocolos que você faz no ano, é mais barato do que qualquer hormônio.</strong> 💉
        </div>
        <button onClick={()=>{setBrickKey(k=>k+1);setStep("pagamento");}} style={{display:"flex",alignItems:"center",justifyContent:"center",gap:10,background:"#009ee3",color:"#fff",borderRadius:12,padding:"15px 20px",fontFamily:"var(--f)",fontSize:15,fontWeight:700,border:"none",cursor:"pointer",width:"100%",marginBottom:10}}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
          {plano==="anual"?`Pagar com cartão · ${PRECO_ANUAL_CARTAO} em 10x`:`Pagar com cartão · ${PRECO_MENSAL}`}
        </button>
        <button onClick={()=>{setPixData(null);setPixPolling(false);setPixTriggerPaywall(t=>t+1);setStep("pix");}}
          style={{display:"flex",alignItems:"center",justifyContent:"center",gap:6,fontSize:13,color:"#00897B",fontWeight:700,marginBottom:16,padding:"12px",background:"rgba(0,137,123,.08)",borderRadius:12,border:"1px solid rgba(0,137,123,.2)",width:"100%",cursor:"pointer"}}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00897B" strokeWidth="2.5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
          {plano==="anual"?`PIX à vista · ${PRECO_ANUAL_PIX}`:"Pagar com PIX"}
        </button>
        <div style={{textAlign:"center",fontSize:11,color:"var(--gr4)",marginBottom:16}}>🔒 Pagamento seguro · PIX ou cartão de crédito</div>
        <button onClick={onLogout} style={{background:"none",border:"none",color:"var(--gr4)",fontSize:13,cursor:"pointer",fontFamily:"var(--f)",width:"100%",textAlign:"center"}}>Sair da conta</button>
      </div>
    </div>
  );
}

// ── AUTH SCREEN ───────────────────────────────────────────────────────────
function AuthScreen({ onAuth }) {
  const [tab, setTab] = useState("login");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [nome, setNome] = useState("");
  const [sobrenome, setSobrenome] = useState("");
  const [cidade, setCidade] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [termos, setTermos] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [ok, setOk] = useState("");

  const handleLogin = async () => {
    setErro(""); setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password: senha });
      setLoading(false);
      if (error) { setErro("Email ou senha incorretos."); return; }
      onAuth(data.user);
    } catch(e) {
      setLoading(false);
      setErro("Erro de conexão: " + e.message);
    }
  };

  const handleCadastro = async () => {
    setErro(""); setLoading(true);
    if (!nome.trim()) { setErro("Informe seu nome."); setLoading(false); return; }
    if (!sobrenome.trim()) { setErro("Informe seu sobrenome."); setLoading(false); return; }
    if (!cidade.trim()) { setErro("Informe sua cidade / estado."); setLoading(false); return; }
    const foneDigits = whatsapp.replace(/\D/g, "");
    if (foneDigits.length < 10 || foneDigits.length > 11) {
      setErro("WhatsApp inválido. Use o formato (DDD) 99999-9999.");
      setLoading(false); return;
    }
    if (!termos) { setErro("Aceite os termos de uso para continuar."); setLoading(false); return; }
    if (senha.length < 6) { setErro("Senha deve ter no mínimo 6 caracteres."); setLoading(false); return; }
    try {
      const { data, error } = await supabase.auth.signUp({ email, password: senha, options: { data: { nome, sobrenome, cidade, whatsapp } } });
      if (error) { setLoading(false); setErro("Erro: " + error.message); return; }
      if (data?.user) {
        await supabase.from("perfis").upsert({ id: data.user.id, nome, sobrenome, cidade, whatsapp, email, created_at: new Date().toISOString() });
      }
      setLoading(false);
      setOk("Conta criada! Verifique sua caixa de email e clique no link de confirmação para ativar o acesso.");
    } catch(e) {
      setLoading(false);
      setErro("Erro de conexão: " + e.message);
    }
  };

  const handleRecuperar = async () => {
    setErro(""); setLoading(true);
    if (!email) { setErro("Informe seu email."); setLoading(false); return; }
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: "https://controleiatf.com.br/app",
      });
      setLoading(false);
      if (error) { setErro("Erro: " + error.message); return; }
      setOk("✅ Email de recuperação enviado! Verifique sua caixa de entrada.");
    } catch(e) {
      setLoading(false);
      setErro("Erro de conexão: " + e.message);
    }
  };

  return (
    <div className="auth-screen">
      <img src="/logo_sem_fundo.png" alt="Controle IATF" className="auth-logo-img"/>

      <div className="auth-card">
        <div className="auth-tabs">
          <div className={`auth-tab${tab==="login"?" on":""}`} onClick={()=>{setTab("login");setErro("");setOk("");}}>Entrar</div>
          <div className={`auth-tab${tab==="cadastro"?" on":""}`} onClick={()=>{setTab("cadastro");setErro("");setOk("");}}>Criar conta</div>
          {tab==="recuperar"&&<div className="auth-tab on" style={{color:"var(--g)"}}>Recuperar senha</div>}
        </div>

        {erro && <div className="auth-err">⚠️ {erro}</div>}
        {ok && <div className="auth-ok">✅ {ok}</div>}

        {tab === "cadastro" && (
          <div style={{background:"var(--gp)",border:"1px solid var(--gm)",borderRadius:"var(--r8)",padding:"10px 12px",marginBottom:14,fontSize:13,color:"var(--g)",fontWeight:600,textAlign:"center"}}>
            🎉 7 dias grátis · sem cartão de crédito · depois {PRECO_MENSAL}/mês ou {PRECO_ANUAL_PIX}/ano no PIX
          </div>
        )}

        {tab === "cadastro" && <>
          <div className="frow">
            <div className="fg"><label className="fl">Nome</label><input className="fi" value={nome} onChange={e=>setNome(e.target.value)} placeholder="Seu nome"/></div>
            <div className="fg"><label className="fl">Sobrenome</label><input className="fi" value={sobrenome} onChange={e=>setSobrenome(e.target.value)} placeholder="Sobrenome"/></div>
          </div>
          <div className="fg"><label className="fl">Cidade</label><input className="fi" value={cidade} onChange={e=>setCidade(e.target.value)} placeholder="Ex: Belo Horizonte - MG"/></div>
          <div className="fg"><label className="fl">WhatsApp *</label><input className="fi" type="tel" inputMode="numeric" value={whatsapp} onChange={e=>setWhatsapp(formatPhone(e.target.value))} placeholder="(31) 99999-9999" maxLength={15}/></div>
        </>}
        <div className="fg"><label className="fl">Email</label><input className="fi" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="seu@email.com"/></div>
        {tab !== "recuperar" && <div className="fg"><label className="fl">Senha</label><input className="fi" type="password" value={senha} onChange={e=>setSenha(e.target.value)} placeholder="Mínimo 6 caracteres"/></div>}
        {tab === "cadastro" && (
          <div style={{display:"flex",alignItems:"flex-start",gap:8,marginBottom:12,fontSize:12,color:"var(--gr4)"}}>
            <input type="checkbox" checked={termos} onChange={e=>setTermos(e.target.checked)} style={{marginTop:2,flexShrink:0}}/>
            <span>Li e aceito os <span style={{color:"var(--g)",fontWeight:700,cursor:"pointer"}} onClick={()=>window.open("https://controleiatf.com.br/termos","_blank")}>Termos de Uso</span> e a <span style={{color:"var(--g)",fontWeight:700,cursor:"pointer"}} onClick={()=>window.open("https://controleiatf.com.br/privacidade","_blank")}>Política de Privacidade</span></span>
          </div>
        )}

        <button className="btn btn-p btn-full" style={{marginTop:8}} onClick={tab==="login"?handleLogin:tab==="cadastro"?handleCadastro:handleRecuperar} disabled={loading}>
          {loading ? "Aguarde..." : tab==="login" ? "Entrar" : tab==="cadastro" ? "Criar conta grátis" : "Enviar link de recuperação"}
        </button>

        {tab === "login" && (
          <div style={{textAlign:"center",marginTop:14,fontSize:12,color:"var(--gr4)"}}>
            <span style={{color:"var(--g)",fontWeight:700,cursor:"pointer"}} onClick={()=>{setTab("recuperar");setErro("");setOk("");}}>Esqueceu a senha?</span>
            {" · "}
            Não tem conta? <span style={{color:"var(--g)",fontWeight:700,cursor:"pointer"}} onClick={()=>setTab("cadastro")}>Testar grátis por 7 dias</span>
          </div>
        )}
        {tab === "recuperar" && (
          <div style={{textAlign:"center",marginTop:14,fontSize:12,color:"var(--gr4)"}}>
            <span style={{color:"var(--g)",fontWeight:700,cursor:"pointer"}} onClick={()=>{setTab("login");setErro("");setOk("");}}>← Voltar para o login</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Lock Screen ───────────────────────────────────────────────────────────
function LockScreen({ user, onUnlock }) {
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);
  const [saindo, setSaindo] = useState(false);

  const desbloquear = async () => {
    if (!senha) { setErro("Informe sua senha."); return; }
    setLoading(true);
    setErro("");
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: senha,
      });
      if (error) {
        setErro("Senha incorreta. Tente novamente.");
        setSenha("");
      } else {
        onUnlock();
      }
    } catch(e) {
      setErro("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-screen">
      <img src="/logo_sem_fundo.png" alt="Controle IATF" className="auth-logo-img"/>
      <div className="auth-card">
        <div className="auth-title">🔒 Sessão bloqueada</div>
        <div className="auth-desc">Informe sua senha para continuar</div>
        <div style={{background:"var(--gr1)",borderRadius:"var(--r8)",padding:"10px 12px",marginBottom:16,fontSize:13,color:"var(--gr4)",wordBreak:"break-all"}}>
          {user.email}
        </div>
        {erro && <div className="auth-err">⚠️ {erro}</div>}
        <div className="fg">
          <label className="fl">Senha</label>
          <input
            className="fi" type="password" autoFocus
            value={senha} onChange={e => setSenha(e.target.value)}
            onKeyDown={e => e.key === "Enter" && desbloquear()}
            placeholder="Sua senha"
          />
        </div>
        <button className="btn btn-p btn-full" style={{marginTop:8}} onClick={desbloquear} disabled={loading}>
          {loading ? "Verificando..." : "Entrar"}
        </button>
        <div style={{textAlign:"center",marginTop:14,fontSize:12,color:"var(--gr4)"}}>
          <span
            style={{color:saindo?"var(--gr3)":"var(--g)",fontWeight:700,cursor:saindo?"default":"pointer"}}
            onClick={async () => {
              if (saindo) return;
              setSaindo(true);
              setErro("");
              try {
                await supabase.auth.signOut();
                // onAuthStateChange SIGNED_OUT vai limpar user e redirecionar
              } catch(e) {
                setErro("Erro ao sair. Verifique a conexão.");
                setSaindo(false);
              }
            }}
          >
            {saindo ? "Saindo..." : "Entrar com outra conta"}
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Google Analytics ─────────────────────────────────────────────────────
const GA_ID = "G-9NN9QMWW4K";
function initGA() {
  if (window._gaInited) return;
  window._gaInited = true;
  const s1 = document.createElement("script");
  s1.async = true;
  s1.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(s1);
  window.dataLayer = window.dataLayer || [];
  window.gtag = function(){window.dataLayer.push(arguments);};
  window.gtag("js", new Date());
  window.gtag("config", GA_ID);
}
function trackEvent(name, params={}) {
  if (window.gtag) window.gtag("event", name, params);
}

// ── MAIN APP ──────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(null);
  const [perfil, setPerfil] = useState(null);
  const [perfilCarregado, setPerfilCarregado] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pagLoading, setPagLoading] = useState(false);

  // Timer de segurança — reseta pagLoading após 8s em qualquer situação
  useEffect(() => {
    if (!pagLoading) return;
    const timer = setTimeout(() => setPagLoading(false), 8000);
    return () => clearTimeout(timer);
  }, [pagLoading]);
  const [dataKey, setDataKey] = useState(0);
  const [page, setPage] = useState(() => {
    if (window.location.pathname.includes("/app")) return "app";
    if (window.location.search.includes("pagamento=")) return "app";
    try {
      const ativo = localStorage.getItem("sessao_ativa") || sessionStorage.getItem("sessao_ativa");
      if (ativo === "1") return "app";
    } catch(e) {}
    return "landing";
  });
  const [fazendas,   setFazendas]   = useState([]);
  const [isMembro,   setIsMembro]   = useState(false);  // true se for membro convidado
  const [ownerIdRef, setOwnerIdRef] = useState(null);   // user_id do dono (se for membro)
  const [protocolos, setProtocolos] = useState([]);
  const [animais,    setAnimais]    = useState([]);
  const [semenBank,  setSemenBank]  = useState([]);
  const [tab,    setTab]    = useState("home");
  const [screen, setScreen] = useState(null);
  const [modal,  setModal]  = useState(null);
  const [toast,  setToast]  = useState(null);
  const [inactivityWarning, setInactivityWarning] = useState(false);
  const logoutInProgress = useRef(false);
  const resetInactivityRef = useRef(null);
  // locked: true sempre que app é aberto (sessionStorage limpo ao fechar)
  // ou após 30min inativo. Exige senha antes de mostrar dados.
  const [locked, setLocked] = useState(() => {
    try { return sessionStorage.getItem("app_unlocked") !== "1"; }
    catch { return true; }  // falha no storage → bloqueia por segurança
  });

  // Iniciar Google Analytics
  useEffect(() => { initGA(); }, []);

  // Reset global do pagLoading quando volta de qualquer tela externa
  useEffect(() => {
    const reset = () => setPagLoading(false);
    document.addEventListener("visibilitychange", reset);
    window.addEventListener("focus", reset);
    window.addEventListener("pageshow", reset);
    return () => {
      document.removeEventListener("visibilitychange", reset);
      window.removeEventListener("focus", reset);
      window.removeEventListener("pageshow", reset);
    };
  }, []);

  // Recarregar dados quando app volta ao foco — cobre wake-up do Android, BFCache e troca de conta.
  // Não depende de `user` para funcionar mesmo quando o estado ainda é null (abertura fresh do PWA).
  useEffect(() => {
    const onVisible = async () => {
      if (document.visibilityState !== "visible") return;
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return;
        // Atualiza user apenas se mudou (troca de conta ou primeira carga)
        setUser(u => (u?.id !== session.user.id ? session.user : u));
        setDataKey(k => k + 1);
      } catch(e) {
        console.warn("[visibilidade] erro ao recarregar sessão:", e);
      }
    };
    // pageshow cobre restores do BFCache (Android Chrome PWA)
    const onPageShow = (e) => { if (e.persisted) onVisible(); };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("pageshow", onPageShow);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("pageshow", onPageShow);
    };
  }, []);

  // Verificar token de convite na URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (!token) return;
    sessionStorage.setItem("convite_token", token);
    window.history.replaceState({}, "", "/");
  }, []);

  // Processar convite após login
  useEffect(() => {
    if (!user) return;
    const token = sessionStorage.getItem("convite_token");
    if (!token) return;
    sessionStorage.removeItem("convite_token");
    const processarConvite = async () => {
      const {data, error} = await supabase.from("membros_equipe").select("*").eq("token", token).eq("status", "pendente").single();
      if (error || !data) { ping("Convite inválido ou já utilizado."); return; }
      await supabase.from("membros_equipe").update({membro_id: user.id, status: "ativo"}).eq("id", data.id);
      ping("✅ Você entrou na equipe com sucesso!");
      setTimeout(() => setDataKey(k => k + 1), 1500);
    };
    processarConvite();
  }, [user]);

  // Check auth session
  useEffect(() => {
    if (window.location.search.includes("pagamento=")) {
      window.history.replaceState({}, "", "/app");
    }

    // Fallback de segurança: se getSession demorar demais, encerra o loading.
    // Se havia sessão ativa no localStorage, espera mais (8s) para evitar piscar
    // a tela de login para usuários autenticados em redes lentas.
    const tinha_sessao = (() => { try { return localStorage.getItem("sessao_ativa") === "1"; } catch { return false; } })();
    const safetyTimeout = setTimeout(() => setLoading(false), tinha_sessao ? 8000 : 4000);

    // getSession() verifica/renova o token. setLoading(false) é chamado
    // IMEDIATAMENTE após saber se há sessão — dados carregam em background
    // via o effect [user, dataKey]. Isso evita o "Carregando..." travado.
    supabase.auth.getSession().then(({ data: { session } }) => {
      clearTimeout(safetyTimeout);
      if (session?.user) {
        localStorage.setItem("sessao_ativa", "1");
        setPage("app");
        setUser(session.user);
        // dados carregados pelo effect [user, dataKey] — não bloqueia o loading aqui
      }
      setLoading(false);
    }).catch(() => {
      clearTimeout(safetyTimeout);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (logoutInProgress.current && _event === "TOKEN_REFRESHED") return;
      if (session?.user) {
        logoutInProgress.current = false;
        localStorage.setItem("sessao_ativa", "1");
        // SIGNED_IN via LockScreen.desbloquear: garante que locked é false
        // (LockScreen também chama onUnlock, mas o event pode chegar primeiro)
        try { sessionStorage.setItem("app_unlocked", "1"); } catch(_) {}
        setLocked(false);
        setUser(prev => {
          if (prev && prev.id !== session.user.id) {
            setFazendas([]); setProtocolos([]); setAnimais([]); setSemenBank([]);
            setPerfil(null); setPerfilCarregado(false);
          }
          return session.user;
        });
        setPage("app");
      } else if (_event === "SIGNED_OUT") {
        logoutInProgress.current = false;
        localStorage.removeItem("sessao_ativa");
        setUser(null);
        setPerfil(null);
        try { sessionStorage.removeItem("app_unlocked"); } catch(_) {}
        setLocked(true);
      }
      setLoading(false);
    });
    return () => { clearTimeout(safetyTimeout); subscription.unsubscribe(); };
  }, []);

  // Fallback removido — causava race condition com o effect principal de carregamento de dados
  // O effect [user, dataKey] garante recarregamento seguro incluindo verificação de membros de equipe

  // Pedir permissão de notificação e agendar
  useEffect(() => {
    if (!user) return;
    pedirPermissaoNotificacao();
    agendaNotificacoes(protocolos);
  }, [user, protocolos]);

  // Timer de inatividade — bloqueia o app após 30 min sem interação (exige senha)
  useEffect(() => {
    if (!user || locked) return;
    const TIMEOUT_MS = 30 * 60 * 1000;   // 30 minutos
    const WARN_MS    = 28 * 60 * 1000;   // aviso aos 28 min

    let warnTimer, lockTimer;

    const resetTimers = () => {
      clearTimeout(warnTimer);
      clearTimeout(lockTimer);
      setInactivityWarning(false);
      warnTimer = setTimeout(() => setInactivityWarning(true), WARN_MS);
      lockTimer = setTimeout(() => {
        setInactivityWarning(false);
        try { sessionStorage.removeItem("app_unlocked"); } catch(_) {}
        setLocked(true);
      }, TIMEOUT_MS);
    };
    resetInactivityRef.current = resetTimers;

    const EVENTS = ["click", "keydown", "scroll", "mousemove", "touchstart", "pointerdown"];
    EVENTS.forEach(e => document.addEventListener(e, resetTimers, { passive: true }));
    resetTimers();

    return () => {
      clearTimeout(warnTimer);
      clearTimeout(lockTimer);
      EVENTS.forEach(e => document.removeEventListener(e, resetTimers));
    };
  }, [user, locked]);

  // ── Carregar dados do Supabase quando usuário logar ──────────────────
  useEffect(() => {
    if (!user) return;
    const load = async (tentativa = 1) => {
      // Verificar membro de equipe
      const {data:membroData} = await supabase
        .from("membros_equipe")
        .select("owner_id")
        .eq("membro_id", user.id)
        .eq("status", "ativo")
        .single();

      let targetId = user.id;
      if (membroData?.owner_id) {
        setIsMembro(true);
        setOwnerIdRef(membroData.owner_id);
        targetId = membroData.owner_id;
      } else {
        setIsMembro(false);
        setOwnerIdRef(null);
      }

      const [perfilRes, fz, pr, an, sm] = await Promise.all([
        supabase.from("perfis").select("*").eq("id", user.id).single(),
        supabase.from("fazendas").select("*").eq("user_id", targetId).order("at", {ascending:false}),
        supabase.from("protocolos").select("*").eq("user_id", targetId).order("at", {ascending:false}),
        supabase.from("animais").select("*").eq("user_id", targetId).order("at", {ascending:false}),
        supabase.from("semen_bank").select("*").eq("user_id", targetId).order("at", {ascending:false}),
      ]);

      // Se erro de JWT/auth em qualquer query e ainda tem tentativas, retry após 1s
      const isJwtError = (r) => r?.error?.code === "PGRST301" || r?.error?.message?.includes("JWT") || (r?.data === null && r?.error);
      const temErroAuth = isJwtError(fz) || isJwtError(perfilRes) || isJwtError(pr) || isJwtError(an);
      if (temErroAuth && tentativa < 4) {
        setTimeout(() => load(tentativa + 1), 1000 * tentativa);
        return;
      }

      if (perfilRes.data) {
        setPerfil({...perfilRes.data, plano: perfilRes.data.plano||"individual"});
      } else if (!perfilRes.error || perfilRes.error.code === "PGRST116") {
        // PGRST116 = 0 rows found (Supabase .single() sem resultado)
        // Cria perfil a partir dos metadados do Auth
        const meta = user?.user_metadata || {};
        if (meta.nome || user?.email) {
          const novoPerfil = { id: user.id, nome: meta.nome||"", sobrenome: meta.sobrenome||"", cidade: meta.cidade||"", whatsapp: meta.whatsapp||"", email: user.email||"", plano: "individual" };
          await supabase.from("perfis").upsert(novoPerfil);
          setPerfil(novoPerfil);
        }
      }
      setPerfilCarregado(true);
      if (fz.data) setFazendas(fz.data.map(f=>({...f,fazendaId:f.fazenda_id,proprietario:f.proprietario||"",municipio:f.municipio||"",uf:f.uf||""})));
      if (pr.data) setProtocolos(pr.data.map(p=>({...p,fazendaId:p.fazenda_id})));
      const mappedAn3 = (an.data||[]).map(a=>({...a,protocoloId:a.protocolo_id,dataUltimoParto:a.data_ultimo_parto||"",dataServico:a.data_servico||"",obsProdutor:a.obs_produtor||"",protocolo_individual:a.protocolo_individual||"",novilha:a.novilha||false}));
      if (mappedAn3.length > 0) { setAnimais(mappedAn3); DB.set(`animais_${targetId}`, mappedAn3); }
      else { const loc = DB.get(`animais_${targetId}`) || []; if (loc.length > 0) setAnimais(loc); }
      if (sm.error) console.error("load semen_bank erro — code:", sm.error.code, "| message:", sm.error.message);
      if (sm.data) setSemenBank(sm.data.map(s=>({...s})));
    };
    load();
  }, [user, dataKey]);

  const ping = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2000); };
  const cacheAnimais = (list) => { if (user?.id) DB.set(`animais_${user.id}`, list); };
  const logout = () => {
    logoutInProgress.current = true;
    // Limpa estado local IMEDIATAMENTE — não aguarda rede (signOut pode travar no Android)
    setModal(null);
    setUser(null);
    setPerfil(null);
    setPerfilCarregado(false);
    setFazendas([]);
    setProtocolos([]);
    setAnimais([]);
    setSemenBank([]);
    setScreen(null);
    setPage("app");
    try {
      const sbKeys = Object.keys(localStorage).filter(k => k.includes("supabase") || k === "sessao_ativa");
      sbKeys.forEach(k => localStorage.removeItem(k));
      const sbSKeys = Object.keys(sessionStorage).filter(k => k.includes("supabase") || k === "sessao_ativa" || k === "app_unlocked");
      sbSKeys.forEach(k => sessionStorage.removeItem(k));
    } catch(_) {}
    setLocked(true);
    // Revoga o token no servidor em background — não bloqueia a UI
    supabase.auth.signOut().catch(() => {}).finally(() => {
      logoutInProgress.current = false;
    });
  };

  const addFazenda = async (f) => {
    if(isMembro){ ping("Apenas o dono pode criar fazendas."); return null; }
    const n={...f,id:uid(),at:Date.now()};
    setFazendas(x=>[n,...x]);
    const {error} = await supabase.from("fazendas").insert({
      id:n.id, user_id:user.id,
      nome:f.nome||"", proprietario:f.proprietario||"",
      municipio:f.municipio||"", uf:f.uf||"",
      telefone:f.telefone||"", email:f.email||"",
      obs:f.obs||"", at:n.at
    });
    if(error){ console.error("addFazenda erro:",error); ping("Erro ao salvar fazenda!"); }
    else ping("Fazenda cadastrada!");
    return n;
  };
  const updFazenda = async (id,ch) => {
    setFazendas(x=>x.map(f=>f.id===id?{...f,...ch}:f));
    await supabase.from("fazendas").update({...ch}).eq("id",id);
    ping("Fazenda atualizada!");
  };
  const delFazenda = async (id) => {
    if(isMembro){ ping("Apenas o dono pode excluir."); return; }
    const pids = protocolos.filter(p=>p.fazendaId===id).map(p=>p.id);
    setFazendas(x=>x.filter(f=>f.id!==id));
    setProtocolos(x=>x.filter(p=>p.fazendaId!==id));
    setAnimais(x=>{const l=x.filter(a=>!pids.includes(a.protocoloId));cacheAnimais(l);return l;});
    await supabase.from("fazendas").delete().eq("id",id);
    ping("Fazenda excluída.");
  };
  const addProtocolo = async (p) => {
    const n={...p,id:uid(),at:Date.now()};
    setProtocolos(x=>[n,...x]);
    const targetUserId = ownerIdRef || user.id;
    const {error} = await supabase.from("protocolos").insert({
      id:n.id, user_id:targetUserId, fazenda_id:p.fazendaId,
      passagens:p.passagens||"3", protocolo_tipo:p.protocolo_tipo||"",
      medicamento:p.medicamento||"", veterinario:p.veterinario||"",
      d0:p.d0||"", h0:p.h0||"", d8:p.d8||"", h8:p.h8||"",
      d10:p.d10||"", h10:p.h10||"", ia:p.ia||"", hia:p.hia||"",
      at:n.at
    });
    if(error) console.error("addProtocolo erro:",error);
    else { ping("Protocolo iniciado!"); trackEvent("protocolo_criado"); }
    return n;
  };
  const updProtocolo = async (id,ch) => {
    setProtocolos(x=>x.map(p=>p.id===id?{...p,...ch}:p));
    await supabase.from("protocolos").update({...ch}).eq("id",id);
    ping("Protocolo atualizado!");
  };
  const delProtocolo = async (id) => {
    if(isMembro){ ping("Apenas o dono pode excluir."); return; }
    setProtocolos(x=>x.filter(p=>p.id!==id));
    setAnimais(x=>{const l=x.filter(a=>a.protocoloId!==id);cacheAnimais(l);return l;});
    await supabase.from("protocolos").delete().eq("id",id);
    ping("Protocolo excluído.");
  };
  const addAnimal = async (a) => {
    const n={...a,id:uid(),at:Date.now()};
    setAnimais(x=>{const l=[n,...x];cacheAnimais(l);return l;});
    const targetUserId = ownerIdRef || user.id;
    const {error} = await supabase.from("animais").insert({
      id:n.id, user_id:targetUserId, protocolo_id:a.protocoloId,
      nome:a.nome||"", numero:a.numero||"", ecc:a.ecc||"",
      novilha:a.novilha||false,
      data_ultimo_parto:a.dataUltimoParto||"",
      raca:a.raca||"", data_servico:a.dataServico||"",
      touro:a.touro||"", partida:a.partida||"",
      diagnostico:a.diagnostico||"",
      obs:a.obs||"", obs_produtor:a.obsProdutor||"",
      protocolo_individual:a.protocolo_individual||"",
      at:n.at
    });
    if(error){ console.error("addAnimal erro:",error); ping("⚠️ Salvo localmente — sem conexão"); }
    else {
      ping("Animal adicionado!");
      // Decrementa estoque de sêmen quando touro é informado
      if (a.touro) {
        const item = semenBank.find(s =>
          s.touro.toLowerCase() === a.touro.toLowerCase() &&
          (!a.partida || s.partida === a.partida) &&
          (s.quantidade || 0) > 0
        );
        if (item) {
          const novaQty = (item.quantidade || 0) - 1;
          setSemenBank(x => x.map(s => s.id === item.id ? {...s, quantidade: novaQty} : s));
          await supabase.from("semen_bank").update({quantidade: novaQty}).eq("id", item.id);
        }
      }
    }
  };
  const updAnimal = async (id,ch) => {
    setAnimais(x=>{const l=x.map(a=>a.id===id?{...a,...ch}:a);cacheAnimais(l);return l;});
    // Mapear campos do frontend para colunas do banco
    const dbCh={};
    if(ch.diagnostico!==undefined) dbCh.diagnostico=ch.diagnostico;
    if(ch.nome!==undefined) dbCh.nome=ch.nome;
    if(ch.numero!==undefined) dbCh.numero=ch.numero;
    if(ch.ecc!==undefined) dbCh.ecc=ch.ecc;
    if(ch.novilha!==undefined) dbCh.novilha=ch.novilha;
    if(ch.dataUltimoParto!==undefined) dbCh.data_ultimo_parto=ch.dataUltimoParto;
    if(ch.raca!==undefined) dbCh.raca=ch.raca;
    if(ch.dataServico!==undefined) dbCh.data_servico=ch.dataServico;
    if(ch.touro!==undefined) dbCh.touro=ch.touro;
    if(ch.partida!==undefined) dbCh.partida=ch.partida;
    if(ch.obs!==undefined) dbCh.obs=ch.obs;
    if(ch.obsProdutor!==undefined) dbCh.obs_produtor=ch.obsProdutor;
    if(ch.protocolo_individual!==undefined) dbCh.protocolo_individual=ch.protocolo_individual;
    if(Object.keys(dbCh).length>0) await supabase.from("animais").update(dbCh).eq("id",id);
  };
  const delAnimal = async (id) => {
    if(isMembro){ ping("Apenas o dono pode excluir."); return; }
    setAnimais(x=>{const l=x.filter(a=>a.id!==id);cacheAnimais(l);return l;});
    await supabase.from("animais").delete().eq("id",id);
    ping("Removido.");
  };

  const addSemenDB = async (s) => {
    const n = {...s, id: uid(), at: Date.now()};
    setSemenBank(x => [...x, n]);
    const targetUserId = ownerIdRef || user.id;
    const {error} = await supabase.from("semen_bank").insert({
      id: n.id, user_id: targetUserId,
      touro: s.touro || "", raca: s.raca || "",
      partida: s.partida || "", quantidade: s.quantidade || 0,
      at: n.at,
    });
    if (error) {
      console.error("addSemen erro — code:", error.code, "| message:", error.message, "| details:", error.details, "| hint:", error.hint);
      setSemenBank(x => x.filter(item => item.id !== n.id));
      ping("⚠️ Erro ao salvar sêmen: " + (error.message || error.code || "verifique conexão"));
    } else {
      ping("Sêmen cadastrado!");
    }
  };
  const updSemenDB = async (id, ch) => {
    const {error} = await supabase.from("semen_bank").update(ch).eq("id", id);
    if (error) console.error("updSemen erro:", error);
  };
  const delSemenDB = async (id) => {
    setSemenBank(x => x.filter(s => s.id !== id));
    await supabase.from("semen_bank").delete().eq("id", id);
  };

  // ── Relatório Veterinário ─────────────────────────────────────────────
  const sendWA = (pid) => {
    const p  = protocolos.find(x=>x.id===pid);
    const f  = fazendas.find(x=>x.id===p?.fazendaId);
    const as = animais.filter(a=>a.protocoloId===pid);
    const pr = as.filter(a=>a.diagnostico==="P").length;
    const di = as.filter(a=>a.diagnostico).length;
    const tx = di>0?Math.round(pr/di*100):0;
    // Cabeçalho com todas as datas do protocolo
    const n=parseInt(p?.passagens||"3");
    let crono=`D0: ${fmtDH(p?.d0,p?.h0)}`;
    if(n>=3) crono+=` | D8: ${fmtDH(p?.d8,p?.h8)}`;
    if(n>=4) crono+=` | D10: ${fmtDH(p?.d10,p?.h10)}`;
    crono+=` | IA: ${fmtDH(p?.ia,p?.hia)}`;
    let t=`🐄 *RELATÓRIO VETERINÁRIO — IATF*
`;
    t+=`🏡 *${f?.nome||"—"}*
`;
    t+=`👤 Proprietário: ${f?.proprietario||"—"}
`;
    t+=`📍 ${f?.municipio||""}${f?.uf?" - "+f.uf:""}
`;
    t+=`🩺 Veterinário: ${p?.veterinario||"—"}
`;
    t+=`📅 ${crono}
`;
    if(p?.medicamento) t+=`💊 Protocolo: ${p.medicamento}
`;
    if(p?.ia){
      const dg=new Date(p.ia+"T12:00:00"); dg.setDate(dg.getDate()+35);
      const parto=new Date(p.ia+"T12:00:00"); parto.setDate(parto.getDate()+283);
      t+=`📋 DG previsto: ${dg.toLocaleDateString("pt-BR")}
`;
      t+=`🐮 Parto previsto: ${parto.toLocaleDateString("pt-BR")}
`;
    }
    t+=`
━━━━━━━━━
📊 *RESUMO*
`;
    t+=`• Total: ${as.length} vacas
`;
    t+=`• Prenhas (P+): ${pr}
`;
    t+=`• Vazias (V−): ${di-pr}
`;
    t+=`• *Taxa de prenhez: ${tx}%*
`;
    if(as.length>0){
      t+=`
━━━━━━━━━
📋 *INDIVIDUAL*
`;
      as.forEach(a=>{
        const st=a.diagnostico==="P"?"✅ Prenha":a.diagnostico==="V"?"❌ Vazia":"⏳ Pendente";
        const diasP=calcDiasParida(a.dataUltimoParto);
        const cat=a.novilha?"🌟 Novilha":(diasP!==null?`${diasP}d parida`:"");
        t+=`• ${a.nome}${a.numero?" #"+a.numero:""} — ECC ${a.ecc||"—"}${cat?" — "+cat:""} — ${st}`;
        if(a.touro) t+=`
  🐂 ${a.touro}${a.partida?" · Partida "+a.partida:""}`;
        if(a.raca) t+=`
  🐾 Raça: ${a.raca}`;
        if(a.protocolo_individual) t+=`
  ⚠️ Protocolo individual: ${a.protocolo_individual}`;
        if(a.obs) t+=`
  📝 Obs: ${a.obs}`;
        t+="\n";
      });
    }
    t+=`
_Gerado pelo Controle IATF — controleiatf.com.br_`;
    trackEvent("relatorio_whatsapp_enviado");
    return `https://api.whatsapp.com/send?text=${encodeURIComponent(t)}`;
  };

  // ── Relatório Produtor ────────────────────────────────────────────────
  const sendWAProdutor = (pid) => {
    const p  = protocolos.find(x=>x.id===pid);
    const f  = fazendas.find(x=>x.id===p?.fazendaId);
    const as = animais.filter(a=>a.protocoloId===pid);
    const pr = as.filter(a=>a.diagnostico==="P").length;
    const di = as.filter(a=>a.diagnostico).length;
    const tx = di>0?Math.round(pr/di*100):0;
    let t=`🐄 *RELATÓRIO IATF — ${f?.nome||"Fazenda"}*
`;
    t+=`👤 Proprietário: ${f?.proprietario||"—"}
`;
    t+=`📍 ${f?.municipio||""}${f?.uf?" - "+f.uf:""}
`;
    if(p?.ia){
      const dg=new Date(p.ia+"T12:00:00"); dg.setDate(dg.getDate()+35);
      const parto=new Date(p.ia+"T12:00:00"); parto.setDate(parto.getDate()+283);
      t+=`📋 DG previsto: ${dg.toLocaleDateString("pt-BR")}
`;
      t+=`🐮 Parto previsto: ${parto.toLocaleDateString("pt-BR")}
`;
    }
    t+=`
━━━━━━━━━
📊 *RESUMO*
`;
    t+=`• Total: ${as.length} vacas
`;
    t+=`• Prenhas (P+): ${pr}
`;
    t+=`• Vazias (V−): ${di-pr}
`;
    t+=`• *Taxa de prenhez: ${tx}%*
`;
    if(as.length>0){
      t+=`
━━━━━━━━━
🐄 *ANIMAIS*
`;
      as.forEach(a=>{
        const st=a.diagnostico==="P"?"✅ Prenha":a.diagnostico==="V"?"❌ Vazia":"⏳ Pendente";
        t+=`• ${a.nome}${a.numero?" #"+a.numero:""}`;
        if(a.touro) t+=` — 🐂 ${a.touro}`;
        t+=` — ${st}`;
        if(a.obsProdutor) t+=`
  💬 ${a.obsProdutor}`;
        t+="\n";
      });
    }
    t+=`
_Controle IATF — controleiatf.com.br_`;
    trackEvent("relatorio_produtor_enviado");
    return `https://api.whatsapp.com/send?text=${encodeURIComponent(t)}`;
  };

  // Notificações pendentes para hoje/amanhã
  const getNotificacoesPendentes = () => {
    const alertas = [];
    const hoje = new Date(); hoje.setHours(0,0,0,0);
    const amanha = new Date(hoje); amanha.setDate(amanha.getDate()+1);
    protocolos.forEach(p => {
      const f = fazendas.find(x=>x.id===p.fazendaId);
      [["D0",p.d0],["D8",p.d8],["D10",p.d10],["IA",p.ia]].forEach(([lbl,dt])=>{
        if(!dt) return;
        const d = new Date(dt+"T12:00:00"); d.setHours(0,0,0,0);
        const diff = Math.round((d-hoje)/86400000);
        if(diff===1) alertas.push(`⚠️ Amanhã: ${lbl} — ${f?.nome||"Fazenda"}`);
        if(diff===0) alertas.push(`🔔 Hoje: ${lbl} — ${f?.nome||"Fazenda"}`);
      });
    });
    return alertas;
  };

  if (loading) return <div className="app"><style>{CSS}</style><div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",color:"var(--g)",fontWeight:700}}>Carregando...</div></div>;

  // Mostra landing page se não está na rota /app
  if (page === "landing") return <LandingPage onEnterApp={() => { localStorage.setItem("sessao_ativa","1"); sessionStorage.setItem("sessao_ativa","1"); setPage("app"); }} />;

  if (!user) return <div className="app"><style>{CSS}</style><AuthScreen onAuth={u => { try { sessionStorage.setItem("app_unlocked","1"); } catch(_){} setLocked(false); setUser(u); }}/></div>;

  // Tela de bloqueio: sessão válida mas app foi fechado/reaberto ou ficou 30min inativo
  if (locked) return <div className="app"><style>{CSS}</style><LockScreen user={user} onUnlock={() => { try { sessionStorage.setItem("app_unlocked","1"); } catch(_){} setLocked(false); }}/></div>;

  // Verificar trial — usa created_at do perfil (mais confiável) ou do auth
  // Só verifica DEPOIS que o perfil foi carregado do Supabase para evitar
  // mostrar paywall incorretamente para assinantes durante o carregamento inicial
  const createdAtRef = perfil?.created_at || user.created_at;
  const diasRestantes = diasRestantesTrial(createdAtRef);
  const ehAssinante = perfil?.assinante === true;
  if (diasRestantes === 0 && !ehAssinante) {
    if (!perfilCarregado) return <div className="app"><style>{CSS}</style><div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",color:"var(--g)",fontWeight:700}}>Carregando...</div></div>;
    return <PaywallScreen user={user} perfil={perfil} onLogout={logout} pagLoading={pagLoading} setPagLoading={setPagLoading} setPerfil={setPerfil}/>;
  }

  if(screen?.type==="fazenda"){
    const f=fazendas.find(x=>x.id===screen.id);
    if(!f){setScreen(null);return null;}
    return <div className="app"><style>{CSS}</style>
      <FazendaScreen fazenda={f} protocolos={protocolos.filter(p=>p.fazendaId===f.id)}
        onBack={()=>setScreen(null)} onAddProtocolo={(p)=>addProtocolo({...p,fazendaId:f.id})}
        onUpdProtocolo={updProtocolo} onUpdFazenda={(ch)=>updFazenda(f.id,ch)}
        onOpenProtocolo={(id)=>setScreen({type:"protocolo",id})}
        onDelete={()=>{delFazenda(f.id);setScreen(null);}} setModal={setModal} ping={ping}/>
      {toast&&<div className="toast">{toast}</div>}
      {modal&&<Modal modal={modal} setModal={setModal}/>}
    </div>;
  }

  if(screen?.type==="protocolo"){
    const p=protocolos.find(x=>x.id===screen.id);
    const f=p&&fazendas.find(x=>x.id===p.fazendaId);
    if(!p){setScreen(null);return null;}
    return <div className="app"><style>{CSS}</style>
      <ProtocoloScreen protocolo={p} fazenda={f} animais={animais.filter(a=>a.protocoloId===p.id)}
        semenBank={semenBank}
        onBack={()=>setScreen({type:"fazenda",id:p.fazendaId})}
        onAddAnimal={(a)=>addAnimal({...a,protocoloId:p.id})}
        onUpdAnimal={updAnimal} onDelAnimal={delAnimal}
        onUpdProtocolo={(ch)=>updProtocolo(p.id,ch)}
        onDelProtocolo={()=>{delProtocolo(p.id);setScreen({type:"fazenda",id:p.fazendaId});}}
        onWA={()=>sendWA(p.id)} onWAProdutor={sendWAProdutor} setModal={setModal} ping={ping}/>
      {toast&&<div className="toast">{toast}</div>}
      {modal&&<Modal modal={modal} setModal={setModal}/>}
    </div>;
  }

  const totalA=animais.length, totalP=animais.filter(a=>a.diagnostico==="P").length;
  const totalD=animais.filter(a=>a.diagnostico).length, taxa=totalD>0?Math.round(totalP/totalD*100):0;
  const alertas = getNotificacoesPendentes();

  return <div className="app"><style>{CSS}</style>
    <div className="hdr">
      <img src="/favicon-simbolo-180.png" alt="Controle IATF" className="hdr-logo"/>
      <div style={{flex:1,display:"flex",flexDirection:"column",justifyContent:"center"}}>
        <div className="hdr-title">Controle<em style={{color:"#6fcf8e"}}> IATF</em></div>
        <div className="hdr-sub">{user.email}</div>
      </div>
      <button className="hdr-btn" title="Recarregar" onClick={()=>window.location.reload()}><Icon name="reload" size={18}/></button>
      <button className="hdr-btn" title="Sair" onClick={()=>setModal({type:"confirm",msg:"Deseja sair da sua conta?",onOk:logout})}><Icon name="logout" size={18}/></button>
    </div>

    {tab==="home"&&<div className="scr">
      <div style={{fontSize:20,fontWeight:800,marginBottom:2}}>Olá, {perfil?.nome || user?.user_metadata?.nome || "Doutor"}! 👋</div>
      <div style={{fontSize:12,color:"var(--gr4)",marginBottom:16}}>Resumo geral do sistema</div>

      {alertas.map((a,i)=><div key={i} className="notif-banner"><Icon name="bell" size={18}/>{a}</div>)}

      <div className="stats">
        <div className="stat"><div className="stat-n">{fazendas.length}</div><div className="stat-l">Fazendas</div></div>
        <div className="stat"><div className="stat-n">{protocolos.length}</div><div className="stat-l">Protocolos</div></div>
        <div className="stat"><div className="stat-n">{totalA}</div><div className="stat-l">Animais</div></div>
        <div className="stat"><div className="stat-n" style={{color:taxa>0?(taxa>=50?"var(--g)":"var(--y)"):"var(--gr3)"}}>{taxa>0?taxa+"%":"—"}</div><div className="stat-l">Prenhez</div></div>
      </div>
      {totalD>0&&<div className="info-box">
        <div style={{fontSize:11,fontWeight:700,color:"var(--g)",marginBottom:6,textTransform:"uppercase",letterSpacing:.4}}>Diagnóstico geral</div>
        <div className="rowsb" style={{fontSize:13,marginBottom:6}}>
          <span>✅ Prenhas: <strong>{totalP}</strong></span>
          <span>❌ Vazias: <strong>{totalD-totalP}</strong></span>
          <span style={{fontWeight:800,color:"var(--g)"}}>{taxa}%</span>
        </div>
        <div className="prog"><div className="prog-fill" style={{width:taxa+"%"}}/></div>
      </div>}
      {fazendas.length===0
        ?<div className="empty"><Icon name="farm" size={44}/><div className="empty-t">Nenhuma fazenda cadastrada</div><div className="empty-s">Vá em Fazendas para começar</div></div>
        :<><div className="sec">Fazendas recentes</div>
          {fazendas.slice(0,5).map(f=>{
            const ps=protocolos.filter(p=>p.fazendaId===f.id);
            const as=animais.filter(a=>ps.some(p=>p.id===a.protocoloId));
            return <div key={f.id} className="card" onClick={()=>setScreen({type:"fazenda",id:f.id})}>
              <div className="rowsb">
                <div><div className="card-title">{f.nome}</div><div className="card-sub">{f.proprietario} · {f.municipio}{f.uf?" - "+f.uf:""}</div></div>
                <div style={{display:"flex",flexDirection:"column",gap:4,alignItems:"flex-end"}}>
                  <span className="badge b-g">{as.length} animais</span>
                  <span className="badge b-gr">{ps.length} prot.</span>
                </div>
              </div>
            </div>;
          })}</>
      }
    </div>}

    {tab==="fazendas"&&<FazendasTab fazendas={fazendas} protocolos={protocolos} animais={animais} onOpen={(id)=>setScreen({type:"fazenda",id})} onAdd={addFazenda}/>}
    {tab==="biblioteca"&&<BibliotecaTab protocolos={protocolos} fazendas={fazendas} animais={animais} onOpen={(pid)=>setScreen({type:"protocolo",id:pid})} onWA={sendWA} sendWAProdutor={sendWAProdutor} onRelatorio={(pid)=>setModal({type:"relatorio",pid})}/>}
    {tab==="semen"&&<SemenTab semenBank={semenBank} setSemenBank={setSemenBank} onUpdQty={updSemenDB} onDel={delSemenDB} ping={ping}/>}
    {tab==="relatorios"&&<RelatoriosTab protocolos={protocolos} fazendas={fazendas} animais={animais} sendWA={sendWA} sendWAProdutor={sendWAProdutor}/>}
    {tab==="dg"&&<DGTab user={user} ping={ping}/>}
    {tab==="perfil"&&<PerfilTab user={user} perfil={perfil} setPerfil={setPerfil} ping={ping} logout={logout} setModal={setModal} diasRestantes={diasRestantes} ehAssinante={ehAssinante} isMembro={isMembro} ownerIdRef={ownerIdRef} pagLoading={pagLoading} setPagLoading={setPagLoading}/>}

    <nav className="nav">
      {[["home","home","Início"],["fazendas","farm","Fazendas"],["semen","semen","Sêmen"],["relatorios","doc","Relatórios"],["dg","dg","DG"],["perfil","user","Perfil"]].map(([key,icon,lbl])=>(
        <button key={key} className={`nav-btn${tab===key?" on":""}`} onClick={()=>setTab(key)}>
          <Icon name={icon} size={22}/>{lbl}
        </button>
      ))}
    </nav>

    {tab==="fazendas"&&<button className="fab" onClick={()=>setModal({type:"addFazenda",onSave:addFazenda})}><Icon name="plus" size={24}/></button>}
    {tab==="semen"&&<button className="fab" onClick={()=>setModal({type:"addSemen",onSave:addSemenDB})}><Icon name="plus" size={24}/></button>}
    {toast&&<div className="toast">{toast}</div>}
    {inactivityWarning&&<div style={{position:"fixed",bottom:72,left:0,right:0,display:"flex",justifyContent:"center",zIndex:9999,padding:"0 16px",pointerEvents:"none"}}>
      <div style={{background:"#1b3a22",color:"#fff",borderRadius:12,padding:"12px 16px",maxWidth:420,width:"100%",display:"flex",alignItems:"center",gap:10,boxShadow:"0 4px 24px rgba(0,0,0,0.4)",pointerEvents:"all"}}>
        <span style={{fontSize:13,flex:1,lineHeight:1.4}}>Sua sessão expirará em 2 minutos por inatividade. Toque aqui para continuar.</span>
        <button onClick={()=>{resetInactivityRef.current?.();}} style={{background:"#22c55e",color:"#fff",border:"none",borderRadius:8,padding:"6px 14px",fontSize:13,fontWeight:700,cursor:"pointer",flexShrink:0}}>Continuar</button>
      </div>
    </div>}
    {modal&&<Modal modal={modal} setModal={setModal} sendWA={sendWA} sendWAProdutor={sendWAProdutor}/>}
  </div>;
}

function FazendasTab({fazendas,protocolos,animais,onOpen,onAdd}){
  const[q,setQ]=useState("");
  const list=fazendas.filter(f=>f.nome.toLowerCase().includes(q.toLowerCase())||f.proprietario.toLowerCase().includes(q.toLowerCase())||(f.municipio||"").toLowerCase().includes(q.toLowerCase()));
  return <div className="scr">
    <div style={{position:"relative",marginBottom:12}}>
      <span style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",color:"var(--gr3)"}}><Icon name="search" size={16}/></span>
      <input className="fi" style={{paddingLeft:34}} placeholder="Buscar fazenda ou proprietário..." value={q} onChange={e=>setQ(e.target.value)}/>
    </div>
    {list.length===0&&<div className="empty"><Icon name="farm" size={44}/><div className="empty-t">{q?"Nenhum resultado":"Nenhuma fazenda"}</div><div className="empty-s">{q?"Tente outro termo":"Toque no + para cadastrar"}</div></div>}
    {list.map(f=>{
      const ps=protocolos.filter(p=>p.fazendaId===f.id);
      const as=animais.filter(a=>ps.some(p=>p.id===a.protocoloId));
      const pr=as.filter(a=>a.diagnostico==="P").length;
      return <div key={f.id} className="card" onClick={()=>onOpen(f.id)}>
        <div className="rowsb" style={{marginBottom:6}}>
          <div><div className="card-title">{f.nome}</div><div className="card-sub">👤 {f.proprietario}</div><div className="card-sub">📍 {f.municipio}{f.uf?" - "+f.uf:""}</div></div>
          <div style={{display:"flex",flexDirection:"column",gap:4,alignItems:"flex-end"}}>
            <span className="badge b-g">{as.length} animais</span>
            {pr>0&&<span className="badge b-g">✅ {pr} prenhas</span>}
          </div>
        </div>
        {f.telefone&&<div className="card-sub">📞 {f.telefone}</div>}
      </div>;
    })}
  </div>;
}

function FazendaScreen({fazenda,protocolos,onBack,onAddProtocolo,onUpdProtocolo,onUpdFazenda,onOpenProtocolo,onDelete,setModal,ping}){
  const[showForm,setShowForm]=useState(false);
  const[editFazenda,setEditFazenda]=useState(false);
  return <div>
    <div className="hdr">
      <button className="hdr-btn" onClick={onBack}><Icon name="back" size={20}/></button>
      <div style={{flex:1}}><div className="hdr-title">{fazenda.nome}</div><div className="hdr-sub">👤 {fazenda.proprietario}</div></div>
      <button className="hdr-btn" style={{marginRight:4}} onClick={()=>setEditFazenda(true)}><Icon name="edit" size={17}/></button>
      <button className="hdr-btn danger" onClick={()=>setModal({type:"confirm",msg:"Excluir fazenda e todos os dados?",onOk:onDelete})}><Icon name="trash" size={18}/></button>
    </div>
    <div className="scr">
      {editFazenda
        ?<FazendaForm initial={fazenda} onSave={(ch)=>{onUpdFazenda(ch);setEditFazenda(false);}} onCancel={()=>setEditFazenda(false)}/>
        :null
      }
      <div className="sec">Protocolos</div>
      {protocolos.length===0&&!showForm&&<div className="empty" style={{padding:"20px 0"}}><Icon name="note" size={36}/><div className="empty-t">Nenhum protocolo</div><div className="empty-s">Inicie o primeiro protocolo IATF</div></div>}
      {protocolos.map(p=><div key={p.id} className="card" onClick={()=>onOpenProtocolo(p.id)}>
        <div className="rowsb">
          <div><div className="card-title">Protocolo {new Date(p.at).toLocaleDateString("pt-BR")}</div>
            {p.veterinario&&<div className="card-sub">🩺 {p.veterinario}</div>}
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:4,alignItems:"flex-end"}}>
            {p.d0&&<span className="badge b-gr">D0: {fmtDH(p.d0,p.h0)}</span>}
            {p.ia&&<span className="badge b-g">IA: {fmtDH(p.ia,p.hia)}</span>}
          </div>
        </div>
      </div>)}
      {showForm
        ?<ProtocoloForm onSave={async (p)=>{const prot=await onAddProtocolo(p);setShowForm(false);if(prot?.id)onOpenProtocolo(prot.id);}} onCancel={()=>setShowForm(false)}/>
        :<button className="btn btn-p btn-full" style={{marginTop:8}} onClick={()=>setShowForm(true)}><Icon name="plus" size={16}/> Iniciar Novo Protocolo</button>
      }
    </div>
  </div>;
}

function FazendaForm({initial,onSave,onCancel}){
  const[f,setF]=useState(initial||{nome:"",proprietario:"",municipio:"",uf:"",endereco:"",telefone:""});
  const[err,setErr]=useState("");
  const s=(k,v)=>setF(x=>({...x,[k]:v}));
  return <div className="form-box">
    <div className="form-box-title">{initial?"✏️ Editar Dados da Fazenda":"🏡 Nova Fazenda"}</div>
    <div className="fg"><label className="fl">Nome da Fazenda *</label><input className="fi" value={f.nome} onChange={e=>s("nome",e.target.value)} placeholder="Ex: Fazenda Santa Fé"/></div>
    <div className="fg"><label className="fl">Proprietário *</label><input className="fi" value={f.proprietario} onChange={e=>s("proprietario",e.target.value)} placeholder="Nome completo"/></div>
    <div className="frow">
      <div className="fg" style={{flex:3}}><label className="fl">Município</label><input className="fi" value={f.municipio} onChange={e=>s("municipio",e.target.value)} placeholder="Ex: Uberlândia"/></div>
      <div className="fg" style={{flex:1}}><label className="fl">UF</label><input className="fi" value={f.uf} onChange={e=>s("uf",e.target.value.toUpperCase())} placeholder="MG" maxLength={2}/></div>
    </div>
    <div className="fg"><label className="fl">Endereço</label><input className="fi" value={f.endereco} onChange={e=>s("endereco",e.target.value)} placeholder="Estrada, km, referência..."/></div>
    <div className="fg"><label className="fl">Telefone</label><input className="fi" value={f.telefone} onChange={e=>s("telefone",e.target.value)} placeholder="(xx) 9xxxx-xxxx"/></div>
    {err&&<div style={{color:"var(--r)",fontSize:13,fontWeight:600,marginBottom:8,padding:"8px 10px",background:"var(--rl)",borderRadius:"var(--r8)"}}>⚠️ {err}</div>}
    <div className="row" style={{gap:8,marginTop:4}}>
      <button className="btn btn-gh" style={{flex:1}} onClick={onCancel}>Cancelar</button>
      <button className="btn btn-p" style={{flex:2}} onClick={()=>{if(!f.nome||!f.proprietario)return setErr("Preencha nome e proprietário");setErr("");onSave(f);}}><Icon name="check" size={16}/> Salvar</button>
    </div>
  </div>;
}

function ProtocoloForm({initial,onSave,onCancel}){
  // manejos: quantos campos intermediários entre D0 e IA
  // "2" = D0 + IA
  // "3" = D0 + 1 intermediário + IA
  // "4" = D0 + 2 intermediários + IA
  const[manejos,setManejos]=useState(initial?.passagens||"3");
  const[datas,setDatas]=useState(()=>{
    // datas[0]=D0, datas[1..n-2]=intermediários, datas[n-1]=IA
    const n=parseInt(initial?.passagens||"3");
    if(initial){
      if(n===2) return [{data:initial.d0||"",hora:initial.h0||""},{data:initial.ia||"",hora:initial.hia||""}];
      if(n===3) return [{data:initial.d0||"",hora:initial.h0||""},{data:initial.d8||"",hora:initial.h8||""},{data:initial.ia||"",hora:initial.hia||""}];
      if(n===4) return [{data:initial.d0||"",hora:initial.h0||""},{data:initial.d8||"",hora:initial.h8||""},{data:initial.d10||"",hora:initial.h10||""},{data:initial.ia||"",hora:initial.hia||""}];
    }
    return Array.from({length:n},()=>({data:"",hora:""}));
  });
  const[medicamento,setMedicamento]=useState(initial?.medicamento||"");
  const[veterinario,setVeterinario]=useState(initial?.veterinario||"");
  const[errProt,setErrProt]=useState("");
  const isEdit=!!initial;

  const diasDesdeD0=(dateStr)=>{
    if(!datas[0]?.data||!dateStr) return null;
    const diff=Math.round((new Date(dateStr+"T12:00:00")-new Date(datas[0].data+"T12:00:00"))/86400000);
    return diff>0?diff:null;
  };

  const handleManejos=(n)=>{
    setManejos(n);
    const ni=parseInt(n);
    setDatas(prev=>{
      const next=Array.from({length:ni},(_,i)=>prev[i]||{data:"",hora:""});
      return next;
    });
  };

  const setData=(idx,field,val)=>{
    setDatas(prev=>prev.map((d,i)=>i===idx?{...d,[field]:val}:d));
  };

  const handleSave=()=>{
    if(!datas[0]?.data){setErrProt("Informe a data do D0.");return;}
    const n=parseInt(manejos);
    const out={
      passagens:manejos,
      protocolo_tipo:`${manejos} manejos`,
      medicamento,
      veterinario,
      d0:datas[0]?.data||"",  h0:datas[0]?.hora||"",
      d8:n>=3?datas[1]?.data||"":"",  h8:n>=3?datas[1]?.hora||"":"",
      d10:n>=4?datas[2]?.data||"":"", h10:n>=4?datas[2]?.hora||"":"",
      ia:datas[n-1]?.data||"", hia:datas[n-1]?.hora||"",
    };
    onSave(out);
  };

  const nInt=parseInt(manejos);

  return <div className="form-box">
    <div className="form-box-title">{isEdit?"✏️ Editar Protocolo":"📋 Novo Protocolo IATF"}</div>

    {/* Escolha de manejos */}
    <div className="fg">
      <label className="fl">Quantos manejos?</label>
      <div style={{display:"flex",gap:8}}>
        {[["2","2 manejos"],["3","3 manejos"],["4","4 manejos"]].map(([n,lbl])=>(
          <div key={n} onClick={()=>handleManejos(n)} style={{flex:1,textAlign:"center",padding:"11px 6px",borderRadius:"var(--r8)",border:`1.5px solid ${manejos===n?"var(--g)":"var(--gr2)"}`,background:manejos===n?"var(--gp)":"var(--w)",fontWeight:700,fontSize:13,color:manejos===n?"var(--g)":"var(--gr4)",cursor:"pointer",transition:"all .15s"}}>
            {lbl}
          </div>
        ))}
      </div>
    </div>

    <div className="fg">
      <label className="fl">Protocolo medicamentoso utilizado</label>
      <textarea className="fi fi-ta" value={medicamento} onChange={e=>setMedicamento(e.target.value)} placeholder="Ex: D0 — Sincrogest + BE 1mg&#10;Próximo manejo — PGF2α + eCG 400UI&#10;IA"/>
    </div>

    <div className="div"/>

    {/* Campo D0 — sempre visível */}
    <div style={{background:"var(--w)",borderRadius:"var(--r8)",padding:"12px",marginBottom:10,border:"1px solid var(--gr2)"}}>
      <div style={{fontSize:11,fontWeight:800,color:"var(--g)",textTransform:"uppercase",letterSpacing:.5,marginBottom:10}}>D0 — Início do protocolo</div>
      <div style={{marginBottom:8}}><label className="fl">Data</label><div style={{display:"flex",gap:6}}><input type="date" className="fi" value={datas[0]?.data||""} onChange={e=>setData(0,"data",e.target.value)} style={{flex:1,fontSize:15,padding:"10px 12px"}}/>{datas[0]?.data&&<button type="button" onClick={()=>setData(0,"data","")} style={{background:"var(--gr2)",border:"none",borderRadius:8,padding:"0 12px",cursor:"pointer",color:"var(--gr4)"}}>✕</button>}</div></div>
      <div><label className="fl">Horário</label><div style={{display:"flex",gap:6}}><input type="time" className="fi" value={datas[0]?.hora||""} onChange={e=>setData(0,"hora",e.target.value)} style={{flex:1,fontSize:15,padding:"10px 12px"}}/>{datas[0]?.hora&&<button type="button" onClick={()=>setData(0,"hora","")} style={{background:"var(--gr2)",border:"none",borderRadius:8,padding:"0 12px",cursor:"pointer",color:"var(--gr4)"}}>✕</button>}</div></div>
    </div>

    {/* Campos intermediários — só aparecem se o campo anterior tiver data */}
    {Array.from({length:nInt-2},(_,i)=>{
      const idx=i+1;
      const prevData=datas[idx-1]?.data;
      if(!prevData) return null;
      const diasLabel=diasDesdeD0(datas[idx]?.data);
      const lbl=diasLabel!==null?`D${diasLabel}`:`Manejo ${idx+1}`;
      return <div key={idx} style={{background:"var(--w)",borderRadius:"var(--r8)",padding:"12px",marginBottom:10,border:"1px solid var(--gr2)"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
          <div style={{fontSize:11,fontWeight:800,color:"var(--g)",textTransform:"uppercase",letterSpacing:.5}}>
            {diasLabel!==null?`D${diasLabel} — Manejo ${idx+1}`:`Manejo ${idx+1}`}
          </div>
          {diasLabel===null&&datas[idx]?.data===""&&<span style={{fontSize:11,color:"var(--gr4)"}}>preencha a data para calcular</span>}
        </div>
        <div style={{marginBottom:8}}><label className="fl">Data</label><div style={{display:"flex",gap:6}}><input type="date" className="fi" value={datas[idx]?.data||""} onChange={e=>setData(idx,"data",e.target.value)} style={{flex:1,fontSize:15,padding:"10px 12px"}}/>{datas[idx]?.data&&<button type="button" onClick={()=>setData(idx,"data","")} style={{background:"var(--gr2)",border:"none",borderRadius:8,padding:"0 12px",cursor:"pointer",color:"var(--gr4)"}}>✕</button>}</div></div>
        <div><label className="fl">Horário</label><div style={{display:"flex",gap:6}}><input type="time" className="fi" value={datas[idx]?.hora||""} onChange={e=>setData(idx,"hora",e.target.value)} style={{flex:1,fontSize:15,padding:"10px 12px"}}/>{datas[idx]?.hora&&<button type="button" onClick={()=>setData(idx,"hora","")} style={{background:"var(--gr2)",border:"none",borderRadius:8,padding:"0 12px",cursor:"pointer",color:"var(--gr4)"}}>✕</button>}</div></div>
      </div>;
    })}

    {/* Campo IA — aparece após o último campo anterior ter data */}
    {datas[nInt-2]?.data&&<div style={{background:"var(--w)",borderRadius:"var(--r8)",padding:"12px",marginBottom:10,border:"1.5px solid var(--g)"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
        <div style={{fontSize:11,fontWeight:800,color:"var(--g)",textTransform:"uppercase",letterSpacing:.5}}>IA — Inseminação Artificial</div>
        {diasDesdeD0(datas[nInt-1]?.data)!==null&&<span style={{fontSize:11,fontWeight:800,background:"var(--gp)",color:"var(--g)",padding:"2px 8px",borderRadius:99}}>D{diasDesdeD0(datas[nInt-1]?.data)}</span>}
      </div>
      <div style={{marginBottom:8}}><label className="fl">Data</label><div style={{display:"flex",gap:6}}><input type="date" className="fi" value={datas[nInt-1]?.data||""} onChange={e=>setData(nInt-1,"data",e.target.value)} style={{flex:1,fontSize:15,padding:"10px 12px"}}/>{datas[nInt-1]?.data&&<button type="button" onClick={()=>setData(nInt-1,"data","")} style={{background:"var(--gr2)",border:"none",borderRadius:8,padding:"0 12px",cursor:"pointer",color:"var(--gr4)"}}>✕</button>}</div></div>
      <div><label className="fl">Horário</label><div style={{display:"flex",gap:6}}><input type="time" className="fi" value={datas[nInt-1]?.hora||""} onChange={e=>setData(nInt-1,"hora",e.target.value)} style={{flex:1,fontSize:15,padding:"10px 12px"}}/>{datas[nInt-1]?.hora&&<button type="button" onClick={()=>setData(nInt-1,"hora","")} style={{background:"var(--gr2)",border:"none",borderRadius:8,padding:"0 12px",cursor:"pointer",color:"var(--gr4)"}}>✕</button>}</div></div>
    </div>}

    <div className="div"/>
    <div className="fg"><label className="fl">Veterinário Responsável</label><input className="fi" value={veterinario} onChange={e=>setVeterinario(e.target.value)} placeholder="Nome do veterinário"/></div>
    {errProt&&<div style={{color:"var(--r)",fontSize:13,fontWeight:600,marginBottom:8,padding:"8px 10px",background:"var(--rl)",borderRadius:"var(--r8)"}}>⚠️ {errProt}</div>}
    <div className="row" style={{gap:8,marginTop:4}}>
      <button className="btn btn-gh" style={{flex:1}} onClick={onCancel}>Cancelar</button>
      <button className="btn btn-p" style={{flex:2}} onClick={handleSave}><Icon name="check" size={16}/> {isEdit?"Atualizar":"Salvar Protocolo"}</button>
    </div>
  </div>;
}

function ProtocoloScreen({protocolo:p,fazenda:f,animais,semenBank=[],onBack,onAddAnimal,onUpdAnimal,onDelAnimal,onUpdProtocolo,onDelProtocolo,onWA,onWAProdutor,setModal,ping}){
  const[showForm,setShowForm]=useState(false);
  const[editA,setEditA]=useState(null);
  const[editProt,setEditProt]=useState(false);
  const[q,setQ]=useState("");
  const list=animais.filter(a=>(a.nome+a.numero).toLowerCase().includes(q.toLowerCase()));
  const pr=animais.filter(a=>a.diagnostico==="P").length;
  const va=animais.filter(a=>a.diagnostico==="V").length;
  const di=animais.filter(a=>a.diagnostico).length;
  const tx=di>0?Math.round(pr/di*100):0;
  const isDone=(d)=>d&&new Date(d+"T12:00:00")<=new Date();
  return <div>
    <div className="hdr">
      <button className="hdr-btn" onClick={onBack}><Icon name="back" size={20}/></button>
      <div style={{flex:1}}><div className="hdr-title">{f?.nome}</div><div className="hdr-sub">Protocolo IATF · {p?.passagens||"3"} manejos</div></div>
      <button className="hdr-btn" style={{marginRight:4}} onClick={()=>setEditProt(true)}><Icon name="edit" size={17}/></button>
      <button className="hdr-btn danger" style={{marginRight:4}} onClick={()=>setModal({type:"confirm",msg:"Excluir este protocolo e todos os animais?",onOk:onDelProtocolo})}><Icon name="trash" size={17}/></button>

    </div>
    <div className="scr">
      {editProt
        ?<ProtocoloForm initial={p} onSave={(ch)=>{onUpdProtocolo(ch);setEditProt(false);}} onCancel={()=>setEditProt(false)}/>
        :<div className="info-box">
            <div className="rowsb" style={{marginBottom:10}}>
              <div style={{fontSize:11,fontWeight:700,color:"var(--gr4)",textTransform:"uppercase",letterSpacing:.4}}>Cronograma</div>
              <span style={{fontSize:11,color:"var(--g)",fontWeight:700,cursor:"pointer"}} onClick={()=>setEditProt(true)}>✏️ Editar</span>
            </div>
            <div className="tl">
              {(p.passagens==="4"
                ?[["D0",p.d0,p.h0],["D8",p.d8,p.h8],["D10",p.d10,p.h10],["IA",p.ia,p.hia]]
                :p.passagens==="2"
                  ?[["D0",p.d0,p.h0],["IA",p.ia,p.hia]]
                  :[["D0",p.d0,p.h0],["D8",p.d8,p.h8],["IA",p.ia,p.hia]]
              ).map(([lbl,dt,hr])=>{
                const done=isDone(dt);
                return <div key={lbl} className="tl-step">
                  <div className={`tl-dot${done?" done":""}`}>{done?<Icon name="check" size={11}/>:lbl}</div>
                  <div className={`tl-lbl${done?" done":""}`}>{lbl}</div>
                  {dt&&<div className="tl-date">{new Date(dt+"T12:00:00").toLocaleDateString("pt-BR",{day:"2-digit",month:"2-digit"})}</div>}
                  {hr&&<div className="tl-date">{hr}h</div>}
                </div>;
              })}
            </div>
            <div className="div" style={{margin:"10px 0 8px"}}/>
            <div style={{fontSize:12,color:"var(--gr5)"}}>
              {p.veterinario&&<div style={{marginBottom:6}}>🩺 {p.veterinario}</div>}
              {p.ia&&(()=>{
                const dg=new Date(p.ia+"T12:00:00"); dg.setDate(dg.getDate()+35);
                const parto=new Date(p.ia+"T12:00:00"); parto.setDate(parto.getDate()+283);
                const opts={day:"2-digit",month:"2-digit",year:"numeric"};
                return <div style={{display:"flex",flexDirection:"column",gap:6}}>
                  <div style={{background:"var(--yl)",border:"1px solid #e8c96a",borderRadius:"var(--r8)",padding:"7px 10px",fontSize:12,fontWeight:600,color:"var(--y)"}}>
                    📅 DG previsto: <strong>{dg.toLocaleDateString("pt-BR",opts)}</strong> <span style={{fontWeight:400,fontSize:11}}>(35 dias após IA)</span>
                  </div>
                  <div style={{background:"#e3f0ff",border:"1px solid #a8cff5",borderRadius:"var(--r8)",padding:"7px 10px",fontSize:12,fontWeight:600,color:"#1565c0"}}>
                    🐮 Parto previsto: <strong>{parto.toLocaleDateString("pt-BR",opts)}</strong> <span style={{fontWeight:400,fontSize:11}}>(283 dias após IA)</span>
                  </div>
                </div>;
              })()}
            </div>
          </div>
      }

      {di>0&&<div className="info-box">
        <div className="rowsb" style={{fontSize:13,marginBottom:6}}>
          <span>✅ Prenhas: <strong>{pr}</strong></span>
          <span>❌ Vazias: <strong>{va}</strong></span>
          <span style={{fontWeight:800,color:"var(--g)",fontSize:16}}>{tx}%</span>
        </div>
        <div className="prog"><div className="prog-fill" style={{width:tx+"%"}}/></div>
      </div>}

      <div className="sec">Animais ({animais.length})</div>
      <div style={{position:"relative",marginBottom:12}}>
        <span style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",color:"var(--gr3)"}}><Icon name="search" size={16}/></span>
        <input className="fi" style={{paddingLeft:34}} placeholder="Buscar por nome ou brinco..." value={q} onChange={e=>setQ(e.target.value)}/>
      </div>

      {list.map(a=><AnimalCard key={a.id} animal={a} protocolo={p}
        onUpdDiag={(d)=>{onUpdAnimal(a.id,{diagnostico:d});ping(d==="P"?"✅ Prenha registrada!":"❌ Vazia registrada");}}
        onEdit={()=>setEditA(a)}
        onDel={()=>setModal({type:"confirm",msg:`Remover ${a.nome}?`,onOk:()=>onDelAnimal(a.id)})}
      />)}

      {animais.length===0&&!showForm&&!editA&&<div className="empty"><Icon name="cow" size={44}/><div className="empty-t">Nenhum animal cadastrado</div><div className="empty-s">Adicione as vacas do protocolo</div></div>}

      {(showForm||editA)
        ?<AnimalForm initial={editA} semenBank={semenBank}
            onSave={(a)=>{if(editA){onUpdAnimal(editA.id,a);setEditA(null);ping("Animal atualizado!");}else{onAddAnimal(a);setShowForm(false);}}}
            onCancel={()=>{setShowForm(false);setEditA(null);}}/>
        :<button className="btn btn-p btn-full" style={{marginTop:8}} onClick={()=>setShowForm(true)}><Icon name="plus" size={16}/> Adicionar Animal</button>
      }

      {animais.length>0&&!showForm&&!editA&&<>
        <div className="sec" style={{marginTop:16}}>Relatório</div>
        <div className="row" style={{gap:8}}>
          <button className="btn btn-wa" style={{flex:1}} onClick={()=>{const url=onWA();if(url)window.open(url,"_blank");}}>
            <Icon name="wa" size={16} color="#fff"/> Vet
          </button>
          <button className="btn btn-wa" style={{flex:1,background:"#1e8a3e"}} onClick={()=>{const url=onWAProdutor(p.id);if(url)window.open(url,"_blank");}}>
            <Icon name="wa" size={16} color="#fff"/> Produtor
          </button>
        </div>
      </>}
    </div>
  </div>;
}

function AnimalCard({animal:a,onUpdDiag,onEdit,onDel,protocolo}){
  const[open,setOpen]=useState(false);
  const ini=(a.nome||"??").slice(0,2).toUpperCase();
  const diagBadge=a.diagnostico==="P"?<span className="badge b-g">✅ Prenha</span>:a.diagnostico==="V"?<span className="badge b-r">❌ Vazia</span>:<span className="badge b-gr">⏳ Pendente</span>;
  const dias=calcDiasParida(a.dataUltimoParto);
  // Cronograma automático do protocolo
  const crono=protocolo?(() => {
    const n=parseInt(protocolo.passagens||"3");
    const steps=n===2
      ?[["D0",protocolo.d0,protocolo.h0],["IA",protocolo.ia,protocolo.hia]]
      :n===4
        ?[["D0",protocolo.d0,protocolo.h0],["D8",protocolo.d8,protocolo.h8],["D10",protocolo.d10,protocolo.h10],["IA",protocolo.ia,protocolo.hia]]
        :[["D0",protocolo.d0,protocolo.h0],["D8",protocolo.d8,protocolo.h8],["IA",protocolo.ia,protocolo.hia]];
    return steps.filter(([,d])=>d);
  })():[];
  const hoje=new Date(); hoje.setHours(0,0,0,0);
  return <div className="ac">
    <div className="ac-head" onClick={()=>setOpen(o=>!o)}>
      <div className="ac-av">{ini}</div>
      <div className="ac-info">
        <div className="ac-name">{a.nome}{a.numero&&<span style={{color:"var(--gr3)",fontWeight:500}}> #{a.numero}</span>}
          {a.novilha&&<span style={{marginLeft:6,fontSize:10,fontWeight:700,color:"var(--y)",background:"var(--yl)",padding:"1px 6px",borderRadius:99}}>NOVILHA</span>}
        </div>
        <div className="ac-meta">
          ECC: {a.ecc||"—"} · {a.novilha?"Nunca pariu":(dias!==null?`${dias} dias parida`:"Sem data de parto")}
          {a.touro&&<><br/>🐂 {a.touro}</>}
        </div>
      </div>
      <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:6}}>
        {diagBadge}
        <Icon name="chevron" size={14} color="var(--gr3)"/>
      </div>
    </div>
    {open&&<div className="ac-body">
      {crono.length>0&&<>
        <div style={{fontSize:11,fontWeight:700,color:"var(--gr4)",textTransform:"uppercase",letterSpacing:.4,marginBottom:8}}>Cronograma do protocolo</div>
        <div style={{display:"flex",gap:0,marginBottom:14,position:"relative"}}>
          {crono.map(([lbl,dt,hr],i)=>{
            const d=new Date(dt+"T12:00:00"); d.setHours(0,0,0,0);
            const diff=Math.round((d-hoje)/86400000);
            const done=diff<0;
            const today=diff===0;
            return <div key={lbl} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",position:"relative"}}>
              {i<crono.length-1&&<div style={{position:"absolute",top:14,left:"50%",width:"100%",height:2,background:done?"var(--g)":"var(--gr2)",zIndex:0}}/>}
              <div style={{width:28,height:28,borderRadius:"50%",background:done?"var(--g)":today?"var(--y)":"var(--gr2)",color:done||today?"#fff":"var(--gr4)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:800,zIndex:1,border:today?"2px solid var(--y)":"none",boxShadow:today?"0 0 0 3px rgba(234,179,8,.2)":"none"}}>
                {done?"✓":lbl}
              </div>
              <div style={{fontSize:9,fontWeight:700,color:done?"var(--g)":today?"var(--y)":"var(--gr4)",marginTop:3}}>{lbl}</div>
              <div style={{fontSize:9,color:"var(--gr3)",marginTop:1}}>{new Date(dt+"T12:00:00").toLocaleDateString("pt-BR",{day:"2-digit",month:"2-digit"})}</div>
              {hr&&<div style={{fontSize:9,color:"var(--gr3)"}}>{hr}h</div>}
            </div>;
          })}
        </div>
      </>}
      <div style={{fontSize:11,fontWeight:700,color:"var(--gr4)",textTransform:"uppercase",letterSpacing:.4,marginBottom:6}}>Diagnóstico de gestação</div>
      <div className="diag-row" style={{marginBottom:14}}>
        <button className={`diag-btn${a.diagnostico==="P"?" p":""}`} onClick={()=>onUpdDiag("P")}>✅ Prenha (P+)</button>
        <button className={`diag-btn${a.diagnostico==="V"?" v":""}`} onClick={()=>onUpdDiag("V")}>❌ Vazia (V−)</button>
      </div>
      {(a.touro||a.obs||a.obsProdutor||a.protocolo_individual)&&<>
        {a.touro&&<div style={{fontSize:12,color:"var(--gr5)",marginBottom:6}}>🐂 <strong>{a.touro}</strong>{a.partida?" · Partida "+a.partida:""}</div>}
        {a.protocolo_individual&&<>
          <div style={{fontSize:11,fontWeight:700,color:"var(--y)",textTransform:"uppercase",letterSpacing:.4,marginBottom:4}}>⚠️ Protocolo individual</div>
          <div style={{fontSize:12,color:"var(--gr5)",background:"var(--yl)",border:"1px solid #e8c96a",borderRadius:"var(--r8)",padding:"8px 10px",marginBottom:10,lineHeight:1.5}}>{a.protocolo_individual}</div>
        </>}
        {a.obs&&<>
          <div style={{fontSize:11,fontWeight:700,color:"var(--gr4)",textTransform:"uppercase",letterSpacing:.4,marginBottom:4}}>🩺 Obs. Veterinário</div>
          <div style={{fontSize:13,color:"var(--gr5)",background:"var(--w)",border:"1px solid var(--gr2)",borderRadius:"var(--r8)",padding:"10px 12px",marginBottom:8,lineHeight:1.5}}>{a.obs}</div>
        </>}
        {a.obsProdutor&&<>
          <div style={{fontSize:11,fontWeight:700,color:"var(--g)",textTransform:"uppercase",letterSpacing:.4,marginBottom:4}}>👤 Obs. para o Produtor</div>
          <div style={{fontSize:13,color:"var(--gr5)",background:"var(--gp)",border:"1px solid var(--gm)",borderRadius:"var(--r8)",padding:"10px 12px",marginBottom:14,lineHeight:1.5}}>{a.obsProdutor}</div>
        </>}
      </>}
      <div className="div"/>
      <div className="row" style={{gap:8}}>
        <button className="btn btn-gh btn-sm" style={{flex:1}} onClick={onEdit}><Icon name="edit" size={14}/> Editar</button>
        <button className="btn btn-d btn-sm" style={{flex:1}} onClick={onDel}><Icon name="trash" size={14}/> Remover</button>
      </div>
    </div>}
  </div>;
}

function AnimalForm({onSave,onCancel,initial,semenBank=[]}){
  const[f,setF]=useState(initial||{nome:"",numero:"",ecc:"",novilha:false,dataUltimoParto:"",raca:"",dataServico:"",touro:"",partida:"",d0:false,d8:false,d10:false,ia:false,diagnostico:"",obs:"",obsProdutor:"",protocolo_individual:""});
  const[errAnimal,setErrAnimal]=useState("");
  const s=(k,v)=>setF(x=>({...x,[k]:v}));
  const[touroSuggestions,setTouroSuggestions]=useState([]);
  const onTouroChange=(v)=>{
    s("touro",v);
    if(v.length>=2){
      const matches=semenBank.filter(s=>s.touro.toLowerCase().includes(v.toLowerCase())&&s.quantidade>0);
      setTouroSuggestions(matches);
    } else setTouroSuggestions([]);
  };
  const selectTouro=(item)=>{
    s("touro",item.touro);
    s("partida",item.partida||"");
    setTouroSuggestions([]);
  };
  const dias=calcDiasParida(f.dataUltimoParto);
  return <div className="form-box" style={{marginTop:12}}>
    <div className="form-box-title">{initial?"✏️ Editar Animal":"🐄 Novo Animal"}</div>
    <div style={{fontSize:12,fontWeight:700,color:"var(--g)",marginBottom:8,textTransform:"uppercase",letterSpacing:.4}}>Identificação</div>
    <div className="frow">
      <div className="fg" style={{flex:2}}><label className="fl">Nome da Vaca *</label><input className="fi" value={f.nome} onChange={e=>s("nome",e.target.value)} placeholder="Ex: Mimosa"/></div>
      <div className="fg" style={{flex:1}}><label className="fl">Nº Brinco</label><input className="fi" value={f.numero} onChange={e=>s("numero",e.target.value)} placeholder="142"/></div>
    </div>
    <div className="frow">
      <div className="fg"><label className="fl">ECC (1–5)</label>
        <select className="fi fi-sel" value={f.ecc} onChange={e=>s("ecc",e.target.value)}>
          <option value="">—</option>
          {["1","1.5","2","2.5","3","3.5","4","4.5","5"].map(v=><option key={v}>{v}</option>)}
        </select>
      </div>
      <div className="fg"><label className="fl">Raça</label><input className="fi" value={f.raca} onChange={e=>s("raca",e.target.value)} placeholder="Nelore"/></div>
    </div>
    <div className="fg">
      <label className="fl">Categoria</label>
      <div style={{display:"flex",gap:8}}>
        <div onClick={()=>s("novilha",false)} style={{flex:1,textAlign:"center",padding:"9px 6px",borderRadius:"var(--r8)",border:`1.5px solid ${!f.novilha?"var(--g)":"var(--gr2)"}`,background:!f.novilha?"var(--gp)":"var(--w)",fontWeight:700,fontSize:13,color:!f.novilha?"var(--g)":"var(--gr4)",cursor:"pointer",userSelect:"none"}}>🐄 Vaca parida</div>
        <div onClick={()=>s("novilha",true)} style={{flex:1,textAlign:"center",padding:"9px 6px",borderRadius:"var(--r8)",border:`1.5px solid ${f.novilha?"var(--y)":"var(--gr2)"}`,background:f.novilha?"var(--yl)":"var(--w)",fontWeight:700,fontSize:13,color:f.novilha?"var(--y)":"var(--gr4)",cursor:"pointer",userSelect:"none"}}>🌟 Novilha</div>
      </div>
    </div>
    {!f.novilha&&<div className="fg">
      <label className="fl">Data do Último Parto</label>
      <input type="date" className="fi" value={f.dataUltimoParto||""} onChange={e=>s("dataUltimoParto",e.target.value)}/>
      {dias!==null&&<div style={{marginTop:6,padding:"6px 10px",background:"var(--gp)",border:"1px solid var(--gm)",borderRadius:"var(--r8)",fontSize:12,fontWeight:600,color:"var(--g)"}}>📆 {dias} dias de parida</div>}
    </div>}
    <div className="div"/>

    <div className="frow">
      <div className="fg autocomplete" style={{flex:2}}>
        <label className="fl">Touro utilizado</label>
        <input className="fi" value={f.touro||""} onChange={e=>onTouroChange(e.target.value)} placeholder="Digite para buscar no banco..."/>
        {touroSuggestions.length>0&&<div className="autocomplete-list">
          {touroSuggestions.map((item,i)=><div key={i} className="autocomplete-item" onClick={()=>selectTouro(item)}>
            🐂 {item.touro} <span style={{color:"var(--gr4)",fontSize:11}}>({item.raca} · {item.quantidade} doses)</span>
          </div>)}
        </div>}
      </div>
      <div className="fg" style={{flex:1}}><label className="fl">Nº Partida</label><input className="fi" value={f.partida||""} onChange={e=>s("partida",e.target.value)} placeholder="Ex: 2024/01"/></div>
    </div>

    <div className="div"/>
    <div style={{fontSize:12,fontWeight:700,color:"var(--g)",marginBottom:8,textTransform:"uppercase",letterSpacing:.4}}>Diagnóstico</div>
    <div className="fg">
      <label className="fl">Resultado</label>
      <div className="diag-row">
        <button className={`diag-btn${f.diagnostico===""?" pend":""}`} onClick={()=>s("diagnostico","")}>⏳ Pendente</button>
        <button className={`diag-btn${f.diagnostico==="P"?" p":""}`} onClick={()=>s("diagnostico","P")}>✅ P+</button>
        <button className={`diag-btn${f.diagnostico==="V"?" v":""}`} onClick={()=>s("diagnostico","V")}>❌ V−</button>
      </div>
    </div>
    <div className="div"/>
    <div className="fg">
      <label className="fl">Protocolo individual (se diferente do protocolo geral)</label>
      <textarea className="fi fi-ta" rows={2} value={f.protocolo_individual||""} onChange={e=>s("protocolo_individual",e.target.value)} placeholder="Ex: Esta vaca recebeu protocolo diferente: ..."/>
    </div>
    <div className="fg">
      <label className="fl">Observação do Veterinário</label>
      <textarea className="fi fi-ta" value={f.obs||""} onChange={e=>s("obs",e.target.value)} placeholder="Achados de ultrassom, anomalias, intercorrências..."/>
    </div>
    <div className="fg">
      <label className="fl">Observação para o Produtor</label>
      <textarea className="fi fi-ta" value={f.obsProdutor||""} onChange={e=>s("obsProdutor",e.target.value)} placeholder="Informações para o produtor sobre este animal..."/>
    </div>
    {errAnimal&&<div style={{color:"var(--r)",fontSize:13,fontWeight:600,marginBottom:8,padding:"8px 10px",background:"var(--rl)",borderRadius:"var(--r8)"}}>⚠️ {errAnimal}</div>}
    <div className="row" style={{gap:8,marginTop:4}}>
      <button className="btn btn-gh" style={{flex:1}} onClick={onCancel}>Cancelar</button>
      <button className="btn btn-p" style={{flex:2}} onClick={()=>{if(!f.nome){setErrAnimal("Informe o nome do animal.");return;}setErrAnimal("");onSave(f);}}><Icon name="check" size={16}/> {initial?"Atualizar":"Salvar Animal"}</button>
    </div>
  </div>;
}

function RelatoriosTab({protocolos,fazendas,animais,sendWA,sendWAProdutor}){
  const[selected,setSelected]=useState(null); // {pid, tipo} tipo="vet"|"prod"
  const[copied,setCopied]=useState(false);

  // Agrupar protocolos por fazenda/proprietário
  const grupos=fazendas.map(f=>{
    const prots=protocolos.filter(p=>p.fazendaId===f.id).sort((a,b)=>b.at-a.at);
    return {fazenda:f, protocolos:prots};
  }).filter(g=>g.protocolos.length>0);

  const getTexto=(pid,tipo)=>{
    try{ return tipo==="vet"?sendWA(pid):sendWAProdutor(pid); }catch(e){ return ""; }
  };

  const copiar=(pid,tipo)=>{
    const txt=getTexto(pid,tipo);
    // Converter URL do WhatsApp de volta para texto legível
    const decoded=decodeURIComponent(txt.replace("https://api.whatsapp.com/send?text=",""));
    navigator.clipboard?.writeText(decoded).then(()=>{setCopied(true);setTimeout(()=>setCopied(false),2000);});
  };

  const baixar=(pid,tipo,fazNome)=>{
    const txt=getTexto(pid,tipo);
    const decoded=decodeURIComponent(txt.replace("https://api.whatsapp.com/send?text=",""));
    const blob=new Blob([decoded],{type:"text/plain;charset=utf-8"});
    const url=URL.createObjectURL(blob);
    const a=document.createElement("a");
    a.href=url; a.download=`relatorio_${fazNome||"iatf"}_${new Date().toLocaleDateString("pt-BR").replace(/\//g,"-")}.txt`;
    a.click(); URL.revokeObjectURL(url);
  };

  const fmtData=(d)=>d?new Date(d+"T12:00:00").toLocaleDateString("pt-BR"):"—";

  if(selected){
    const p=protocolos.find(x=>x.id===selected.pid);
    const f=fazendas.find(x=>x.id===p?.fazendaId);
    const urlVet=getTexto(selected.pid,"vet");
    const urlProd=getTexto(selected.pid,"prod");
    const txtVet=decodeURIComponent(urlVet.replace("https://api.whatsapp.com/send?text=",""));
    const txtProd=decodeURIComponent(urlProd.replace("https://api.whatsapp.com/send?text=",""));
    const txt=selected.tipo==="vet"?txtVet:txtProd;
    const url=selected.tipo==="vet"?urlVet:urlProd;
    return <div className="scr">
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
        <button onClick={()=>setSelected(null)} style={{background:"none",border:"none",cursor:"pointer",padding:4}}><Icon name="back" size={22}/></button>
        <div>
          <div style={{fontSize:16,fontWeight:800}}>{selected.tipo==="vet"?"🩺 Relatório Veterinário":"🌾 Relatório Produtor"}</div>
          <div style={{fontSize:12,color:"var(--gr4)"}}>{f?.nome} · {fmtData(p?.d0)}</div>
        </div>
      </div>
      {/* Texto do relatório */}
      <div style={{background:"var(--gr1)",borderRadius:"var(--r8)",padding:16,marginBottom:16,fontFamily:"monospace",fontSize:13,lineHeight:1.7,whiteSpace:"pre-wrap",wordBreak:"break-word",maxHeight:"50vh",overflowY:"auto",border:"1px solid var(--gr2)"}}>
        {txt}
      </div>
      {/* Ações */}
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        <button onClick={()=>copiar(selected.pid,selected.tipo)} style={{display:"flex",alignItems:"center",gap:10,background:copied?"var(--g)":"var(--gp)",border:"1.5px solid var(--gm)",borderRadius:12,padding:"13px 16px",fontFamily:"var(--f)",fontSize:14,fontWeight:700,color:copied?"#fff":"var(--g)",cursor:"pointer"}}>
          {copied?"✅ Copiado!":"📋 Copiar texto"}
        </button>
        <button onClick={()=>baixar(selected.pid,selected.tipo,f?.nome)} style={{display:"flex",alignItems:"center",gap:10,background:"var(--gr1)",border:"1.5px solid var(--gr2)",borderRadius:12,padding:"13px 16px",fontFamily:"var(--f)",fontSize:14,fontWeight:700,color:"var(--gr5)",cursor:"pointer"}}>
          📄 Baixar como .txt
        </button>
        <a href={url} target="_blank" rel="noreferrer" style={{display:"flex",alignItems:"center",gap:10,background:"rgba(37,211,102,.1)",border:"1.5px solid rgba(37,211,102,.3)",borderRadius:12,padding:"13px 16px",fontFamily:"var(--f)",fontSize:14,fontWeight:700,color:"#25D366",textDecoration:"none"}}>
          💬 Enviar pelo WhatsApp
        </a>
      </div>
      {/* Mudar tipo */}
      <div style={{marginTop:16,display:"flex",gap:8}}>
        <button onClick={()=>setSelected(s=>({...s,tipo:"vet"}))} style={{flex:1,padding:"10px",borderRadius:10,border:`1.5px solid ${selected.tipo==="vet"?"var(--g)":"var(--gr2)"}`,background:selected.tipo==="vet"?"var(--gp)":"var(--w)",fontFamily:"var(--f)",fontSize:13,fontWeight:700,color:selected.tipo==="vet"?"var(--g)":"var(--gr4)",cursor:"pointer"}}>🩺 Veterinário</button>
        <button onClick={()=>setSelected(s=>({...s,tipo:"prod"}))} style={{flex:1,padding:"10px",borderRadius:10,border:`1.5px solid ${selected.tipo==="prod"?"var(--g)":"var(--gr2)"}`,background:selected.tipo==="prod"?"var(--gp)":"var(--w)",fontFamily:"var(--f)",fontSize:13,fontWeight:700,color:selected.tipo==="prod"?"var(--g)":"var(--gr4)",cursor:"pointer"}}>🌾 Produtor</button>
      </div>
    </div>;
  }

  return <div className="scr">
    <div style={{fontSize:18,fontWeight:800,marginBottom:4}}>📄 Relatórios</div>
    <div style={{fontSize:13,color:"var(--gr4)",marginBottom:20}}>Histórico de relatórios por proprietário</div>
    {grupos.length===0&&<div className="empty"><Icon name="doc" size={44}/><div className="empty-t">Nenhum relatório disponível</div><div className="empty-s">Crie protocolos nas fazendas para gerar relatórios</div></div>}
    {grupos.map(({fazenda:f,protocolos:prots})=>(
      <div key={f.id} style={{marginBottom:20}}>
        <div style={{fontSize:13,fontWeight:800,color:"var(--g)",textTransform:"uppercase",letterSpacing:.5,marginBottom:8,paddingBottom:6,borderBottom:"1px solid var(--gr2)"}}>{f.nome} · {f.proprietario||"—"}</div>
        {prots.map(p=>{
          const as=animais.filter(a=>a.protocoloId===p.id);
          const pr=as.filter(a=>a.diagnostico==="P").length;
          const di=as.filter(a=>a.diagnostico).length;
          const tx=di>0?Math.round(pr/di*100):null;
          return <div key={p.id} onClick={()=>setSelected({pid:p.id,tipo:"vet"})} style={{background:"var(--w)",border:"1px solid var(--gr2)",borderRadius:"var(--r8)",padding:"12px 14px",marginBottom:8,cursor:"pointer"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <div style={{fontSize:14,fontWeight:700}}>D0: {p.d0?new Date(p.d0+"T12:00:00").toLocaleDateString("pt-BR"):"—"} · IA: {p.ia?new Date(p.ia+"T12:00:00").toLocaleDateString("pt-BR"):"—"}</div>
                <div style={{fontSize:12,color:"var(--gr4)",marginTop:2}}>{as.length} animais · {p.veterinario||"Veterinário não informado"}</div>
              </div>
              <div style={{textAlign:"right"}}>
                {tx!==null&&<div style={{fontSize:14,fontWeight:800,color:tx>=50?"var(--g)":"var(--r)"}}>{tx}%</div>}
                <div style={{fontSize:10,color:"var(--gr3)"}}>{p.passagens} manejos</div>
              </div>
            </div>
          </div>;
        })}
      </div>
    ))}
  </div>;
}

function BibliotecaTab({protocolos=[],fazendas=[],animais=[],onOpen,onWA,sendWAProdutor,onRelatorio}){
  const sorted=[...protocolos].sort((a,b)=>b.at-a.at);
  return <div className="scr">
    <div style={{fontSize:18,fontWeight:800,marginBottom:4}}>Biblioteca 📚</div>
    <div style={{fontSize:12,color:"var(--gr4)",marginBottom:16}}>Todos os protocolos realizados</div>
    {sorted.length===0&&<div className="empty"><Icon name="list" size={44}/><div className="empty-t">Nenhum protocolo</div><div className="empty-s">Os protocolos aparecerão aqui</div></div>}
    {sorted.map(p=>{
      const f=fazendas.find(x=>x.id===p.fazendaId);
      const as=animais.filter(a=>a.protocoloId===p.id);
      const pr=as.filter(a=>a.diagnostico==="P").length;
      const di=as.filter(a=>a.diagnostico).length;
      const tx=di>0?Math.round(pr/di*100):null;
      return <div key={p.id} className="card">
        <div className="rowsb" style={{marginBottom:8}}>
          <div>
            <div className="card-title">{f?.nome||"Fazenda"}</div>
            <div className="card-sub">👤 {f?.proprietario}</div>
            <div className="card-sub">📅 {new Date(p.at).toLocaleDateString("pt-BR")} · D0: {fmt(p.d0)}</div>
          </div>
          {tx!==null&&<div style={{textAlign:"right"}}><div style={{fontSize:26,fontWeight:800,color:"var(--g)",lineHeight:1}}>{tx}%</div><div style={{fontSize:10,color:"var(--gr4)"}}>prenhez</div></div>}
        </div>
        <div className="row" style={{gap:6,marginBottom:8,flexWrap:"wrap"}}>
          <span className="badge b-gr">🐄 {as.length} vacas</span>
          {pr>0&&<span className="badge b-g">✅ {pr} prenhas</span>}
        </div>
        {tx!==null&&<div className="prog" style={{marginBottom:10}}><div className="prog-fill" style={{width:tx+"%"}}/></div>}
        <div className="row" style={{gap:6,flexWrap:"wrap"}}>
          <button className="btn btn-gh btn-sm" style={{flex:1}} onClick={()=>onOpen(p.id)}><Icon name="edit" size={14}/> Abrir</button>
        </div>
      </div>;
    })}
  </div>;
}

function SemenTab({semenBank,setSemenBank,onUpdQty,onDel,ping}){
  const[q,setQ]=useState("");
  const filtered=semenBank.filter(s=>(s.touro+(s.raca||"")).toLowerCase().includes(q.toLowerCase()));
  const updQty=(id,delta)=>{
    const item=semenBank.find(s=>s.id===id);
    const novaQty=Math.max(0,(item?.quantidade||0)+delta);
    setSemenBank(x=>x.map(s=>s.id===id?{...s,quantidade:novaQty}:s));
    if(onUpdQty) onUpdQty(id,{quantidade:novaQty});
  };
  const del=(id)=>{
    if(onDel) onDel(id);
    else setSemenBank(x=>x.filter(s=>s.id!==id));
  };
  // Agrupamento case-insensitive: "Nelore", "NELORE" e "nelore" ficam no mesmo grupo.
  // Usa a primeira grafia encontrada como nome de exibição.
  const gruposMap={};
  filtered.forEach(s=>{
    const key=(s.raca||"Sem raça").trim().toLowerCase();
    if(!gruposMap[key]) gruposMap[key]={nome:(s.raca||"Sem raça").trim(),items:[]};
    gruposMap[key].items.push(s);
  });
  // Ordena raças alfabeticamente, e touros dentro de cada raça também
  const grupos=Object.values(gruposMap)
    .sort((a,b)=>a.nome.localeCompare(b.nome,"pt-BR",{sensitivity:"base"}))
    .map(g=>({...g,items:[...g.items].sort((a,b)=>(a.touro||"").localeCompare(b.touro||"","pt-BR",{sensitivity:"base"}))}));
  const total=semenBank.reduce((a,s)=>(a+(s.quantidade||0)),0);
  return <div className="scr">
    <div style={{fontSize:18,fontWeight:800,marginBottom:2}}>Banco de Sêmen 🧪</div>
    <div style={{fontSize:12,color:"var(--gr4)",marginBottom:12}}>Total: <strong>{total} doses</strong> em estoque</div>
    <div style={{position:"relative",marginBottom:12}}>
      <span style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",color:"var(--gr3)"}}><Icon name="search" size={16}/></span>
      <input className="fi" style={{paddingLeft:34}} placeholder="Buscar touro ou raça..." value={q} onChange={e=>setQ(e.target.value)}/>
    </div>
    {semenBank.length===0&&<div className="empty"><Icon name="semen" size={44}/><div className="empty-t">Banco vazio</div><div className="empty-s">Toque no + para cadastrar o sêmen do botijão</div></div>}
    {grupos.map(g=><div key={g.nome} className="semen-card">
      <div className="semen-raca">🐂 {g.nome}</div>
      {g.items.map(s=><div key={s.id} className="semen-item">
        <div>
          <div className="semen-nome">{s.touro}</div>
          {s.partida&&<div style={{fontSize:11,color:"var(--gr4)"}}>Partida: {s.partida}</div>}
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <button className="semen-qty-btn" onClick={()=>updQty(s.id,-1)}>−</button>
          <div className={`semen-qty${(s.quantidade||0)<=3?" low":""}`}>{s.quantidade||0}</div>
          <button className="semen-qty-btn" onClick={()=>updQty(s.id,1)}>+</button>
          <button className="hdr-btn light" style={{width:28,height:28}} onClick={()=>del(s.id)}><Icon name="trash" size={13}/></button>
        </div>
      </div>)}
    </div>)}
  </div>;
}

function PerfilTab({user,perfil,setPerfil,ping,logout,setModal,diasRestantes,ehAssinante,isMembro,ownerIdRef,pagLoading,setPagLoading}){
  const[editing,setEditing]=useState(false);
  const[f,setF]=useState({nome:perfil?.nome||"",sobrenome:perfil?.sobrenome||"",cidade:perfil?.cidade||"",whatsapp:perfil?.whatsapp||""});
  const[saveErr,setSaveErr]=useState("");

  // Sincroniza f quando perfil carrega ou muda — ignora se o usuário está editando
  // para não apagar o que ele digitou durante um reload de dados em background
  useEffect(()=>{
    if(perfil && !editing) setF({nome:perfil.nome||"",sobrenome:perfil.sobrenome||"",cidade:perfil.cidade||"",whatsapp:perfil.whatsapp||""});
  },[perfil]);
  const[pagErro,setPagErro]=useState("");
  const[membros,setMembros]=useState([]);
  const[emailConvite,setEmailConvite]=useState("");
  const[convidando,setConvidando]=useState(false);

  // Reseta pagLoading sempre que o PerfilTab é montado (navegação entre abas)
  useEffect(() => {
    setPagLoading(false);
  }, []);

  // Carregar membros da equipe
  useEffect(()=>{
    if(!ehAssinante||isMembro) return;
    const loadMembros=async()=>{
      const {data}=await supabase.from("membros_equipe").select("*").eq("owner_id",user.id);
      if(data) setMembros(data);
    };
    loadMembros();
  },[ehAssinante,isMembro,user.id]);

  const convidar=async()=>{
    if(!emailConvite.trim()) return;
    setConvidando(true);
    const token=Math.random().toString(36).slice(2)+Date.now().toString(36);
    const id=Math.random().toString(36).slice(2);
    const {error}=await supabase.from("membros_equipe").insert({
      id, equipe_id:user.id, owner_id:user.id,
      email:emailConvite.trim(), status:"pendente", token
    });
    if(!error){
      setMembros(x=>[...x,{id,email:emailConvite.trim(),status:"pendente",token}]);
      setEmailConvite("");
      ping("Convite gerado!");
    }
    setConvidando(false);
  };

  const removerMembro=async(id)=>{
    await supabase.from("membros_equipe").delete().eq("id",id);
    setMembros(x=>x.filter(m=>m.id!==id));
    ping("Membro removido.");
  };

  const getLinkConvite=(token)=>`https://controleiatf.com.br/convite?token=${token}`;
  const getWAConvite=(token,email)=>`https://api.whatsapp.com/send?text=${encodeURIComponent(`Olá! Você foi convidado para a equipe do Controle IATF.%0AClique no link para aceitar:%0A${getLinkConvite(token)}`)}`;
  const save=async()=>{
    setSaveErr("");
    if(!f.nome.trim()){ setSaveErr("Informe seu nome."); return; }
    if(!f.sobrenome.trim()){ setSaveErr("Informe seu sobrenome."); return; }
    const foneDigits = f.whatsapp.replace(/\D/g,"");
    if(foneDigits.length < 10){ setSaveErr("WhatsApp inválido. Use o formato (DDD) 99999-9999."); return; }
    try {
      const {data:{session}} = await supabase.auth.getSession();
      if(!session){ setSaveErr("Sessão expirada. Faça login novamente."); return; }
      const {error} = await supabase.from("perfis").upsert({
        id: user.id,
        email: user.email,
        nome: f.nome.trim(),
        sobrenome: f.sobrenome.trim(),
        cidade: f.cidade.trim(),
        whatsapp: f.whatsapp,
      }, { onConflict: "id" });
      if(error){ setSaveErr("Erro ao salvar: "+error.message); console.error("[PerfilTab save]", error); return; }
      // Lê de volta para confirmar que o dado foi persistido
      const {data:novo} = await supabase.from("perfis").select("*").eq("id",user.id).single();
      if(novo) setPerfil(x=>({...x,...novo}));
      else setPerfil(x=>({...x,...f}));
      setEditing(false);
      ping("Perfil atualizado!");
    } catch(e) {
      setSaveErr("Erro ao salvar: "+e.message);
      console.error("[PerfilTab save] exception:", e);
    }
  };
  const [planoPerfilSel, setPlanoPerfilSel] = useState("anual");
  const [stepPerfil, setStepPerfil] = useState("planos"); // "planos" | "pagamento" | "pix" | "pago"
  const [processandoPerfil, setProcessandoPerfil] = useState(false);
  const [pixDataPerfil, setPixDataPerfil] = useState(null);
  const [pixPollingPerfil, setPixPollingPerfil] = useState(false);
  const [pixTrigger, setPixTrigger] = useState(0);
  const [cpfPerfil, setCpfPerfil] = useState("");
  const [nascimentoPerfil, setNascimentoPerfil] = useState("");
  const [cepPerfil, setCepPerfil] = useState("");
  const [numeroPerfil, setNumeroPerfil] = useState(""); // contador — força re-disparo mesmo se stepPerfil já era "pix"
  const [brickKeyPerfil, setBrickKeyPerfil] = useState(0);
  const brickRefPerfil = useRef(null); // ref para destruir instância anterior do Brick no perfil

  const handlePerfilPix = async () => {
    setProcessandoPerfil(true);
    setPagErro("");
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const authToken = session?.access_token || "";
      const res = await fetch(EDGE_PIX_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${authToken}` },
        body: JSON.stringify({ payment_method_id: "pix", plano: planoPerfilSel, email: user?.email, userId: user?.id }),
      });
      const data = await res.json();
      if (!res.ok) { setPagErro("Erro ao gerar PIX: " + (data.error || "tente novamente")); return; }
      if (!data?.qr_code) { setPagErro("QR Code não retornado. Tente novamente."); return; }
      setPixDataPerfil(data);
      setPixPollingPerfil(true);
    } catch(e) {
      setPagErro("Erro: " + e.message);
    } finally {
      setProcessandoPerfil(false);
    }
  };

  useEffect(() => {
    if (stepPerfil === "pix" && !processandoPerfil) handlePerfilPix();
  }, [stepPerfil, pixTrigger]);

  useEffect(() => {
    if (!pixPollingPerfil || !pixDataPerfil?.payment_id) return;
    const interval = setInterval(async () => {
      try {
        const {data:{session}} = await supabase.auth.getSession();
        const authToken = session?.access_token || "";
        const res = await fetch(EDGE_CHECK_PIX_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${authToken}` },
          body: JSON.stringify({ payment_id: pixDataPerfil.payment_id, userId: user?.id, plano: planoPerfilSel }),
        });
        const data = await res.json();
        if (data.status === "approved") {
          clearInterval(interval);
          setPixPollingPerfil(false);
          await supabase.from("perfis").update({ assinante: true, plano: planoPerfilSel }).eq("id", user?.id);
          setPerfil(x => ({ ...x, assinante: true, plano: planoPerfilSel }));
          setStepPerfil("pago");
        }
      } catch(e) { console.error("polling pix perfil:", e); }
    }, 5000);
    return () => clearInterval(interval);
  }, [pixPollingPerfil, pixDataPerfil]);

  // Inicializa Brick quando step muda para pagamento
  useEffect(() => {
    if (stepPerfil !== "pagamento") return;
    let destroyed = false;

    // Destrói instância anterior antes de criar nova (evita esqueleto cinza após reload)
    try { brickRefPerfil.current?.unmount?.(); } catch(_) {}
    brickRefPerfil.current = null;
    const containerPerfil = document.getElementById("cardPayment-perfil");
    if (containerPerfil) containerPerfil.innerHTML = "";

    const valor = planoPerfilSel === "anual" ? 790.00 : 97.00;
    const initBrick = async () => {
      await new Promise(r => setTimeout(r, 300));
      if (destroyed) return;
      if (!window.MercadoPago) { setTimeout(initBrick, 500); return; }
      const mp = new window.MercadoPago(MP_PUBLIC_KEY, { locale: "pt-BR" });
      const bricksBuilderPerfil = mp.bricks();
      const _waDig2 = (perfil?.whatsapp || "").replace(/\D/g, "");
      const _phoneInit2 = _waDig2.length >= 10 ? { areaCode: _waDig2.slice(0, 2), number: _waDig2.slice(2) } : undefined;
      try { brickRefPerfil.current = await bricksBuilderPerfil.create("cardPayment", "cardPayment-perfil", {
        initialization: {
          amount: valor,
          payer: {
            email: user?.email || "",
            firstName: perfil?.nome || "",
            lastName: perfil?.sobrenome || "",
            identification: { type: "CPF", number: "" },
            ...(_phoneInit2 ? { phone: _phoneInit2 } : {}),
          },
        },
        customization: {
          paymentMethods: { minInstallments: 1, maxInstallments: planoPerfilSel === "anual" ? 10 : 1 },
          visual: { style: { theme: "default" }, hidePaymentButton: false, hideFormTitle: false },
        },
        callbacks: {
          onReady: () => setProcessandoPerfil(false),
          onError: (err) => {
            console.error("[BrickPerfil onError]", err);
            setProcessandoPerfil(false);
            setPagErro("Erro no formulário: " + (err?.message || "tente novamente"));
          },
          onSubmit: async (submitData) => {
            setProcessandoPerfil(true); setPagErro("");

            const fd = (submitData?.formData && typeof submitData.formData === "object")
              ? submitData.formData : (submitData || {});

            console.log("[BrickPerfil onSubmit] token=%s method=%s installments=%s payer=%s",
              fd.token?.slice(0, 14) + "***",
              fd.payment_method_id || fd.paymentMethodId,
              fd.installments,
              JSON.stringify({ email: fd.payer?.email, identification: fd.payer?.identification }),
            );

            try {
              if (!fd.token) {
                setPagErro("Cartão não tokenizado. Preencha todos os dados do cartão e tente novamente.");
                throw new Error("token ausente");
              }
              // Valida dados do titular (antifraude MP)
              if (!validarCPF(cpfPerfil)) {
                setPagErro("CPF do titular inválido. Preencha o CPF corretamente acima.");
                throw new Error("cpf inválido");
              }
              if (cepPerfil.replace(/\D/g,"").length !== 8 || !numeroPerfil.trim()) {
                setPagErro("Preencha CEP e número do titular acima.");
                throw new Error("endereço incompleto");
              }

              let authToken = "";
              try {
                const sessRes = await Promise.race([
                  supabase.auth.getSession(),
                  new Promise((_, r) => setTimeout(() => r(new Error("timeout_sessao")), 8000)),
                ]);
                authToken = sessRes?.data?.session?.access_token || "";
              } catch (sessErr) {
                if (sessErr.message !== "timeout_sessao") throw sessErr;
                console.warn("[BrickPerfil] getSession timeout — prosseguindo sem token");
              }

              const edgeUrl     = planoPerfilSel === "mensal" ? EDGE_ASSINATURA_URL : EDGE_PAGAMENTO_URL;
              const payMethodId = fd.payment_method_id || fd.paymentMethodId || "";
              const issuerId    = fd.issuer_id ?? fd.issuerId;

              const cardholderFullP = (fd.cardholderName || fd.holderName || fd.payer?.name || "").trim();
              const namePartsP = cardholderFullP ? cardholderFullP.split(/\s+/) : [];
              const cardFirstP = namePartsP[0] || "";
              const cardLastP  = namePartsP.slice(1).join(" ") || "";

              const _cpfNumP = cpfPerfil.replace(/\D/g, "");
              const _telDigP = (perfil?.whatsapp || "").replace(/\D/g, "");
              const bodyPayload = {
                token: fd.token,
                plano: planoPerfilSel,
                email:  user?.email,
                userId: user?.id,
                installments:      Number(fd.installments) || 1,
                payment_method_id: payMethodId,
                issuer_id: issuerId != null ? String(issuerId) : undefined,
                payer: {
                  email:      user?.email || fd.payer?.email || "",
                  first_name: cardFirstP || user?.user_metadata?.nome      || perfil?.nome      || fd.payer?.firstName || fd.payer?.first_name || "",
                  last_name:  cardLastP  || user?.user_metadata?.sobrenome  || perfil?.sobrenome  || fd.payer?.lastName  || fd.payer?.last_name  || "",
                  identification: { type: "CPF", number: _cpfNumP || (fd.payer?.identification?.number || "") },
                  date_of_birth: nascimentoPerfil || undefined,
                  phone: _telDigP.length >= 10 ? { area_code: _telDigP.slice(0,2), number: _telDigP.slice(2) } : undefined,
                  ...(cepPerfil ? { address: { zip_code: cepPerfil.replace(/\D/g,""), street_number: numeroPerfil || "S/N" } } : {}),
                },
              };

              console.log("[BrickPerfil onSubmit] POST →", edgeUrl);
              const ctrl = new AbortController();
              const tid  = setTimeout(() => ctrl.abort(), 25000);
              let res;
              try {
                res = await fetch(edgeUrl, {
                  method: "POST",
                  headers: { "Content-Type": "application/json", "Authorization": `Bearer ${authToken}` },
                  body: JSON.stringify(bodyPayload),
                  signal: ctrl.signal,
                });
              } finally { clearTimeout(tid); }

              const result = await res.json().catch(() => ({ error: "Resposta do servidor não é JSON." }));
              console.log("[BrickPerfil onSubmit] edge http=%s _mp_http=%s ambiente=%s status=%s detail=%s id=%s cause=%s",
                res.status, result?._mp_http_status, result?._mp_ambiente, result?.status, result?.status_detail, result?.id,
                JSON.stringify(result?.cause ?? []),
              );

              if (!res.ok) {
                const msg = result?.error || `Erro interno do servidor (HTTP ${res.status}).`;
                setPagErro(msg); throw new Error(msg);
              }

              // ── Detecta mismatch de ambiente MP ──
              if (result?._mp_ambiente === "teste") {
                const msg = "Erro de configuração: servidor usando credencial de TESTE do Mercado Pago. Acesse Supabase → Edge Functions → Secrets e atualize MP_ACCESS_TOKEN para a chave de produção (APP_USR-...).";
                setPagErro(msg); throw new Error(msg);
              }

              // ── Log diagnóstico: qual conta MP está recebendo os pagamentos ──
              if (result?._mp_conta_email) {
                console.log("[BrickPerfil onSubmit] CONTA MP QUE RECEBE O PAGAMENTO: email=%s id=%s",
                  result._mp_conta_email, result._mp_conta_id ?? "?");
                const buyerEmail2 = (perfil?.email || user?.email || "").trim().toLowerCase();
                const sellerEmail2 = String(result._mp_conta_email).trim().toLowerCase();
                if (buyerEmail2 && sellerEmail2 && buyerEmail2 === sellerEmail2) {
                  const msg = `Autocompra detectada: o e-mail do comprador (${buyerEmail2}) é o mesmo da conta Mercado Pago vendedora. Use um e-mail diferente para testar.`;
                  setPagErro(msg); throw new Error(msg);
                }
              }

              const mpHttp = result?._mp_http_status ?? 200;
              if (mpHttp >= 400) {
                const msg = decodeMPApiError(result);
                setPagErro(msg + (result?._mp_conta_email ? `\n[Conta MP: ${result._mp_conta_email}]` : ""));
                throw new Error(msg);
              }

              const okStatus = ["approved", "authorized"];
              const analiseStatus = ["in_process", "pending"];
              if (okStatus.includes(result?.status)) {
                await supabase.from("perfis").update({ assinante: true, plano: planoPerfilSel }).eq("id", user?.id);
                setPerfil(x => ({ ...x, assinante: true, plano: planoPerfilSel }));
                setStepPerfil("pago");
              } else if (analiseStatus.includes(result?.status)) {
                setPagErro("Pagamento em análise pelo Mercado Pago. Você receberá a confirmação em breve. Acesso liberado automaticamente após aprovação.");
                throw new Error("em_analise");
              } else {
                const msg = decodeMPPaymentStatus(result);
                setPagErro(msg + (result?._mp_conta_email ? `\n[Conta MP: ${result._mp_conta_email}]` : ""));
                throw new Error(msg);
              }

            } catch (e) {
              if (e.name === "AbortError") {
                setPagErro("Tempo esgotado (25s). Verifique a conexão e tente novamente.");
              }
              throw e;
            } finally {
              setProcessandoPerfil(false);
            }
          },
        },
      }); } catch (createErr) {
        if (!destroyed) {
          console.error("[BrickPerfil] falha ao criar:", createErr);
          setPagErro("Erro ao carregar formulário de pagamento. Clique em 'Tentar novamente'.");
        }
      }
      if (destroyed) {
        try { brickRefPerfil.current?.unmount?.(); } catch(_) {}
        brickRefPerfil.current = null;
        const el = document.getElementById("cardPayment-perfil");
        if (el) el.innerHTML = "";
      }
    };
    if (!window.MercadoPago) {
      // Evita carregar o SDK mais de uma vez
      if (!document.getElementById("mp-sdk-script")) {
        const script = document.createElement("script");
        script.id = "mp-sdk-script";
        script.src = "https://sdk.mercadopago.com/js/v2";
        script.onload = () => initBrick().catch(e => console.error("[initBrickPerfil]", e));
        document.head.appendChild(script);
      } else {
        const waitForMP = setInterval(() => {
          if (window.MercadoPago) { clearInterval(waitForMP); initBrick().catch(e => console.error("[initBrickPerfil]", e)); }
        }, 100);
      }
    } else { initBrick().catch(e => console.error("[initBrickPerfil]", e)); }
    return () => {
      destroyed = true;
      setProcessandoPerfil(false); // garante reset do estado ao desmontar o Brick
      setPagErro("");
      try { brickRefPerfil.current?.unmount?.(); } catch(_) {}
      brickRefPerfil.current = null;
      const el = document.getElementById("cardPayment-perfil");
      if (el) el.innerHTML = "";
    };
  }, [stepPerfil, planoPerfilSel, brickKeyPerfil]);

  // Watchdog: se "Processando..." ficar preso por 30s, força reset e remonta o Brick
  useEffect(() => {
    if (!processandoPerfil) return;
    const wd = setTimeout(() => {
      console.warn("[PerfilTab watchdog] processando stuck 30s — forçando reset");
      setProcessandoPerfil(false);
      setPagErro("Tempo esgotado. Clique em 'Tentar novamente' para recarregar o formulário.");
      setBrickKeyPerfil(k => k + 1);
    }, 30000);
    return () => clearTimeout(wd);
  }, [processandoPerfil]);

  return <div className="scr">
    <div style={{fontSize:18,fontWeight:800,marginBottom:16}}>Meu Perfil 👤</div>
    <div className="profile-section">
      <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:16}}>
        <div style={{width:56,height:56,borderRadius:"50%",background:"var(--g)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,fontWeight:800,color:"#fff"}}>
          {(perfil?.nome||user?.email||"?")[0].toUpperCase()}
        </div>
        <div>
          <div style={{fontSize:18,fontWeight:800}}>{perfil?.nome||""} {perfil?.sobrenome||""}</div>
          <div style={{fontSize:13,color:"var(--gr4)"}}>{user?.email}</div>
        </div>
      </div>
      {ehAssinante
        ?<div style={{background:"var(--gp)",border:"1px solid var(--gm)",borderRadius:"var(--r8)",padding:"10px 12px",fontSize:13,fontWeight:600,color:"var(--g)",marginBottom:12}}>✅ Assinatura ativa — acesso completo</div>
        :<div style={{background:diasRestantes>3?"var(--gp)":diasRestantes>0?"var(--yl)":"var(--rl)",border:`1px solid ${diasRestantes>3?"var(--gm)":diasRestantes>0?"var(--y)":"var(--r)"}`,borderRadius:"var(--r8)",padding:"10px 12px",fontSize:13,fontWeight:600,color:diasRestantes>3?"var(--g)":diasRestantes>0?"var(--y)":"var(--r)",marginBottom:12}}>
          {diasRestantes>0?`⏳ ${diasRestantes} dia${diasRestantes===1?"":"s"} restante${diasRestantes===1?"":"s"} no trial`:"⚠️ Trial encerrado — assine para continuar"}
        </div>
      }
    </div>

    {/* Bloco de assinatura — oculto se já assinante */}
    {!ehAssinante&&<div style={{background:"var(--gp)",border:"1.5px solid var(--gm)",borderRadius:"var(--r12)",padding:16,marginBottom:12}}>
      <div style={{fontSize:13,fontWeight:800,color:"var(--g)",marginBottom:4}}>{diasRestantes>0?"💳 Garanta seu acesso antes do trial vencer":"💳 Assine e volte a ter controle total"}</div>
      <div style={{fontSize:12,color:"var(--gr4)",marginBottom:12,lineHeight:1.5}}>{diasRestantes>0?"Profissionalize sua rotina de IATF. Cancele quando quiser.":"Seu trial encerrou. Assine para continuar usando sem limites."}</div>

      {stepPerfil === "pago" ? (
        <div style={{textAlign:"center",padding:"16px 0"}}>
          <div style={{fontSize:32,marginBottom:8}}>🎉</div>
          <div style={{fontSize:16,fontWeight:800,color:"var(--g)",marginBottom:4}}>Pagamento confirmado!</div>
          <button onClick={()=>setStepPerfil("planos")} style={{background:"var(--g)",color:"#fff",border:"none",borderRadius:10,padding:"10px 20px",fontFamily:"var(--f)",fontSize:14,fontWeight:700,cursor:"pointer",marginTop:8}}>Continuar</button>
        </div>
      ) : stepPerfil === "pagamento" ? (
        <div>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
            <button onClick={()=>setStepPerfil("planos")} style={{background:"var(--gr1)",border:"none",borderRadius:8,padding:"6px 10px",cursor:"pointer",fontFamily:"var(--f)",fontSize:12,fontWeight:600}}>← Voltar</button>
            <div style={{flex:1,textAlign:"center",fontSize:13,fontWeight:800,color:"var(--gr5)"}}>Pagamento com cartão</div>
          </div>
          {/* Resumo */}
          <div style={{background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:10,padding:"10px 12px",marginBottom:12}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontSize:13,fontWeight:700,color:"#15803d"}}>{planoPerfilSel==="anual"?"Plano Anual":"Plano Mensal"}</span>
              <span style={{fontSize:16,fontWeight:800,color:"#15803d"}}>{planoPerfilSel==="anual"?PRECO_ANUAL_CARTAO:PRECO_MENSAL}</span>
            </div>
            {planoPerfilSel==="anual"&&<div style={{fontSize:11,color:"#059669",marginTop:2}}>10x de {PRECO_ANUAL_PARCELA} sem juros</div>}
          </div>
          {/* Dados antifraude */}
          <div style={{fontSize:11,fontWeight:700,color:"var(--g)",textTransform:"uppercase",letterSpacing:.5,marginBottom:8}}>Dados do titular</div>
          <div className="frow" style={{marginBottom:8}}>
            <div className="fg">
              <label className="fl">CPF *</label>
              <input className="fi" value={cpfPerfil} onChange={e=>setCpfPerfil(formatCPF(e.target.value))} placeholder="000.000.000-00" inputMode="numeric" maxLength={14}/>
            </div>
            <div className="fg">
              <label className="fl">Nascimento *</label>
              <input className="fi" type="date" value={nascimentoPerfil} onChange={e=>setNascimentoPerfil(e.target.value)}/>
            </div>
          </div>
          <div className="frow" style={{marginBottom:12}}>
            <div className="fg" style={{flex:"0 0 150px"}}>
              <label className="fl">CEP *</label>
              <input className="fi" value={cepPerfil} onChange={e=>setCepPerfil(formatCEP(e.target.value))} placeholder="00000-000" inputMode="numeric" maxLength={9}/>
            </div>
            <div className="fg">
              <label className="fl">Número *</label>
              <input className="fi" value={numeroPerfil} onChange={e=>setNumeroPerfil(e.target.value)} placeholder="Ex: 142"/>
            </div>
          </div>
          {pagErro&&<div style={{background:"var(--rl)",color:"var(--r)",borderRadius:8,padding:"8px 12px",fontSize:12,marginBottom:10}}>⚠️ {pagErro}</div>}
          {processandoPerfil&&<div style={{textAlign:"center",padding:"12px",color:"var(--g)",fontWeight:600,fontSize:13}}>Processando...</div>}
          <div id="cardPayment-perfil"/>
          <div style={{textAlign:"center",fontSize:11,color:"var(--gr4)",marginTop:8}}>🔒 Pagamento seguro via Mercado Pago</div>
          <button onClick={()=>{setPixDataPerfil(null);setPixPollingPerfil(false);setPixTrigger(t=>t+1);setStepPerfil("pix");}} style={{display:"block",textAlign:"center",fontSize:12,color:"#00897B",fontWeight:700,padding:"10px",background:"rgba(0,137,123,.08)",borderRadius:8,border:"1px solid rgba(0,137,123,.2)",marginTop:8,width:"100%",cursor:"pointer"}}>Pagar com PIX</button>
        </div>
      ) : stepPerfil === "pix" ? (
        <div style={{padding:"8px 0"}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
            <button onClick={()=>{setStepPerfil("planos");setPixDataPerfil(null);setPixPollingPerfil(false);}} style={{background:"var(--gr1)",border:"none",borderRadius:8,padding:"6px 10px",cursor:"pointer",fontFamily:"var(--f)",fontSize:12,fontWeight:600}}>← Voltar</button>
            <div style={{fontSize:13,fontWeight:700,color:"var(--g)"}}>{planoPerfilSel==="anual"?`Anual · ${PRECO_ANUAL_PIX} (PIX)`:`Mensal · ${PRECO_MENSAL}/mês`}</div>
          </div>
          {pagErro&&<div style={{background:"var(--rl)",color:"var(--r)",borderRadius:8,padding:"8px 12px",fontSize:12,marginBottom:8}}>⚠️ {pagErro}</div>}
          {processandoPerfil&&!pixDataPerfil&&<div style={{textAlign:"center",padding:"12px",color:"var(--g)",fontWeight:600,fontSize:13}}>Gerando QR Code PIX...</div>}
          {pixDataPerfil&&<div style={{textAlign:"center"}}>
            <div style={{fontSize:14,fontWeight:700,color:"var(--g)",marginBottom:10}}>Escaneie o QR Code para pagar</div>
            {pixDataPerfil.qr_code_base64&&<img src={`data:image/png;base64,${pixDataPerfil.qr_code_base64}`} alt="QR Code PIX" style={{width:200,height:200,borderRadius:12,border:"2px solid var(--gm)",display:"block",margin:"0 auto 10px"}}/>}
            <div style={{fontSize:11,color:"var(--gr4)",marginBottom:6}}>ou copie o código PIX:</div>
            <div style={{background:"var(--gr1)",borderRadius:8,padding:"8px",fontSize:10,wordBreak:"break-all",marginBottom:10,textAlign:"left"}}>{pixDataPerfil.qr_code}</div>
            <button onClick={()=>{navigator.clipboard?.writeText(pixDataPerfil.qr_code).then(()=>ping("Código copiado!"));}} style={{background:"var(--g)",color:"#fff",border:"none",borderRadius:8,padding:"10px",fontWeight:700,cursor:"pointer",width:"100%",marginBottom:6,fontFamily:"var(--f)"}}>Copiar código PIX</button>
            <div style={{fontSize:11,color:"var(--gr4)"}}>{pixPollingPerfil?"⏳ Aguardando confirmação do pagamento...":""}</div>
          </div>}
          <div style={{textAlign:"center",fontSize:11,color:"var(--gr4)",marginTop:8}}>Pagamento seguro via Mercado Pago</div>
        </div>
      ) : (
        <>
          <div style={{display:"flex",background:"var(--gr1)",borderRadius:10,padding:3,marginBottom:12,gap:3}}>
            <button onClick={()=>setPlanoPerfilSel("mensal")} style={{flex:1,padding:"9px 0",borderRadius:8,border:"none",fontFamily:"var(--f)",fontSize:13,fontWeight:700,cursor:"pointer",background:planoPerfilSel==="mensal"?"#fff":"transparent",color:planoPerfilSel==="mensal"?"var(--gr5)":"var(--gr4)"}}>Mensal</button>
            <button onClick={()=>setPlanoPerfilSel("anual")} style={{flex:1,padding:"9px 0",borderRadius:8,border:"none",fontFamily:"var(--f)",fontSize:13,fontWeight:700,cursor:"pointer",background:planoPerfilSel==="anual"?"var(--g)":"transparent",color:planoPerfilSel==="anual"?"#fff":"var(--gr4)",position:"relative"}}>
              Anual
              {planoPerfilSel==="anual"&&<span style={{position:"absolute",top:-7,right:4,background:"#f59e0b",color:"#fff",fontSize:9,fontWeight:800,padding:"2px 5px",borderRadius:99}}>-32%</span>}
            </button>
          </div>
          <div style={{background:"#fff",border:"1px solid var(--gm)",borderRadius:12,padding:"12px",marginBottom:8,textAlign:"center"}}>
            {planoPerfilSel==="anual"&&<div style={{fontSize:11,fontWeight:700,color:"var(--g)",marginBottom:2}}>⭐ PLANO ANUAL · MAIS POPULAR</div>}
            {planoPerfilSel==="anual"
              ?<>
                <div style={{fontSize:22,fontWeight:800,color:"var(--g)"}}>{PRECO_ANUAL_ANO}<span style={{fontSize:12,fontWeight:500,color:"var(--gr4)"}}>/ano</span></div>
                <div style={{fontSize:11,color:"#059669",marginTop:2,fontWeight:600}}>PIX à vista · ou 10x de {PRECO_ANUAL_PARCELA} sem juros · economize {ECONOMIA_ANUAL}</div>
              </>
              :<>
                <div style={{fontSize:22,fontWeight:800,color:"var(--g)"}}>{PRECO_MENSAL}<span style={{fontSize:12,fontWeight:500,color:"var(--gr4)"}}>/mês</span></div>
                <div style={{fontSize:11,color:"var(--gr4)",marginTop:2}}>cobrança mensal automática · cancele quando quiser</div>
              </>
            }
          </div>
          {pagErro&&<div style={{background:"var(--rl)",color:"var(--r)",borderRadius:"var(--r8)",padding:"8px 12px",fontSize:12,marginBottom:10}}>⚠️ {pagErro}</div>}
          <button onClick={()=>setStepPerfil("pagamento")} style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,background:"#009ee3",color:"#fff",borderRadius:"var(--r8)",padding:"12px 16px",fontFamily:"var(--f)",fontSize:14,fontWeight:700,border:"none",cursor:"pointer",width:"100%",marginBottom:8}}>
            <svg width="18" height="18" viewBox="0 0 48 48" fill="none"><rect width="48" height="48" rx="8" fill="#009ee3"/><text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="22" fontWeight="bold">MP</text></svg>
            {planoPerfilSel==="anual"?`Cartão · ${PRECO_ANUAL_CARTAO} em 10x`:`Assinar por ${PRECO_MENSAL}/mês`}
          </button>
          <button onClick={()=>{setPixDataPerfil(null);setPixPollingPerfil(false);setStepPerfil("pix");}} style={{display:"block",textAlign:"center",fontSize:12,color:"#00897B",fontWeight:700,padding:"10px",background:"rgba(0,137,123,.08)",borderRadius:8,border:"1px solid rgba(0,137,123,.2)",width:"100%",cursor:"pointer"}}>{planoPerfilSel==="anual"?`PIX à vista · ${PRECO_ANUAL_PIX}`:"Pagar com PIX"}</button>
        </>
      )}
    </div>}


    {/* Badge membro */}
    {isMembro&&<div style={{background:"var(--gp)",border:"1px solid var(--gm)",borderRadius:10,padding:"10px 12px",marginBottom:12,fontSize:13,color:"var(--g)",fontWeight:600}}>
      👥 Você é membro de uma equipe. Pode criar protocolos e animais, mas não pode excluir dados nem criar fazendas.
    </div>}

    {editing
      ?<div className="form-box">
        <div className="form-box-title">✏️ Editar Perfil</div>
        <div className="frow">
          <div className="fg"><label className="fl">Nome</label><input className="fi" value={f.nome} onChange={e=>setF(x=>({...x,nome:e.target.value}))}/></div>
          <div className="fg"><label className="fl">Sobrenome</label><input className="fi" value={f.sobrenome} onChange={e=>setF(x=>({...x,sobrenome:e.target.value}))}/></div>
        </div>
        <div className="fg"><label className="fl">Cidade</label><input className="fi" value={f.cidade} onChange={e=>setF(x=>({...x,cidade:e.target.value}))}/></div>
        <div className="fg"><label className="fl">WhatsApp *</label><input className="fi" type="tel" inputMode="numeric" value={f.whatsapp} onChange={e=>setF(x=>({...x,whatsapp:formatPhone(e.target.value)}))} placeholder="(31) 99999-9999" maxLength={15}/></div>
        {saveErr&&<div className="auth-err" style={{marginBottom:8}}>{saveErr}</div>}
        <div className="row" style={{gap:8,marginTop:8}}>
          <button className="btn btn-gh" style={{flex:1}} onClick={()=>setEditing(false)}>Cancelar</button>
          <button className="btn btn-p" style={{flex:2}} onClick={save}><Icon name="check" size={16}/> Salvar</button>
        </div>
      </div>
      :<div className="profile-section">
        <div className="profile-label">Cidade</div><div className="profile-value" style={{marginBottom:12}}>{perfil?.cidade||"—"}</div>
        <div className="profile-label">WhatsApp</div><div className="profile-value" style={{marginBottom:12}}>{perfil?.whatsapp||"—"}</div>
        <div className="profile-label">Email</div><div className="profile-value" style={{marginBottom:12}}>{user?.email}</div>
        <button className="btn btn-gh btn-full" style={{marginTop:4}} onClick={()=>setEditing(true)}><Icon name="edit" size={15}/> Editar dados</button>
      </div>
    }
    <button className="btn btn-d btn-full" style={{marginTop:8}} onClick={()=>setModal({type:"confirm",msg:"Deseja sair da sua conta?",onOk:logout})}>Sair da conta</button>

    <a href={`https://api.whatsapp.com/send?phone=${WHATSAPP_CONTATO}&text=${encodeURIComponent("Olá! Tenho uma dúvida sobre o Controle IATF.")}`}
      target="_blank" rel="noreferrer"
      style={{display:"flex",alignItems:"center",justifyContent:"center",gap:10,marginTop:12,padding:"12px 16px",background:"rgba(37,211,102,.1)",border:"1.5px solid rgba(37,211,102,.3)",borderRadius:"var(--r8)",textDecoration:"none",color:"#1a7a3c",fontWeight:700,fontSize:14}}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="#25d366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
      Dúvidas e sugestões — WhatsApp
    </a>

    <div style={{marginTop:16,fontSize:12,color:"var(--gr4)",textAlign:"center"}}>
      <span style={{cursor:"pointer",textDecoration:"underline"}} onClick={()=>setModal({type:"termos"})}>Termos de Uso</span>
      {" · "}
      <span style={{cursor:"pointer",textDecoration:"underline"}} onClick={()=>setModal({type:"privacidade"})}>Política de Privacidade</span>
    </div>
  </div>;
}

function WALink({url,onClose,bg,border,children}){
  if(!url||url==="#") return null;
  return <a href={url} target="_blank" rel="noreferrer" onClick={onClose}
    style={{display:"flex",alignItems:"center",gap:14,background:bg,border:border,
    borderRadius:14,padding:"16px 18px",cursor:"pointer",textAlign:"left",
    fontFamily:"var(--f)",width:"100%",textDecoration:"none",color:"inherit"}}>
    {children}
  </a>;
}
function Modal({modal,setModal,sendWA,sendWAProdutor}){
  const close=()=>setModal(null);
  return <div className="overlay" onClick={e=>{if(e.target===e.currentTarget)close();}}>
    <div className="modal">
      {modal.type==="addFazenda"&&<>
        <div className="modal-hdr"><div className="modal-title">🏡 Nova Fazenda</div><button className="hdr-btn light" onClick={close}><Icon name="close" size={18}/></button></div>
        <FazendaForm onSave={(f)=>{modal.onSave(f);close();}} onCancel={close}/>
      </>}
      {modal.type==="relatorio"&&(()=>{
        let urlVet="#", urlProd="#";
        try { urlVet=(sendWA&&sendWA(modal.pid))||"#"; } catch(e){}
        try { urlProd=(sendWAProdutor&&sendWAProdutor(modal.pid))||"#"; } catch(e){}
        return <>
          <div className="modal-hdr"><div className="modal-title">📲 Enviar Relatório</div><button className="hdr-btn light" onClick={close}><Icon name="close" size={18}/></button></div>
          <div style={{fontSize:13,color:"var(--gr4)",marginBottom:20}}>Escolha o tipo de relatório para enviar via WhatsApp</div>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            <a href={urlVet} target="_blank" rel="noreferrer" style={{display:"flex",alignItems:"center",gap:14,background:"var(--gp)",border:"1.5px solid var(--gm)",borderRadius:14,padding:"16px 18px",textAlign:"left",fontFamily:"var(--f)",width:"100%",textDecoration:"none",color:"inherit"}}>
              <span style={{fontSize:28}}>🩺</span>
              <div>
                <div style={{fontSize:15,fontWeight:800,color:"var(--gr5)"}}>Relatório Veterinário</div>
                <div style={{fontSize:12,color:"var(--gr4)",marginTop:2}}>Completo — protocolo, datas, ECC, raça, obs clínicas</div>
              </div>
            </a>
            <a href={urlProd} target="_blank" rel="noreferrer" style={{display:"flex",alignItems:"center",gap:14,background:"#f0fdf4",border:"1.5px solid #86efac",borderRadius:14,padding:"16px 18px",textAlign:"left",fontFamily:"var(--f)",width:"100%",textDecoration:"none",color:"inherit"}}>
              <span style={{fontSize:28}}>🌾</span>
              <div>
                <div style={{fontSize:15,fontWeight:800,color:"var(--gr5)"}}>Relatório Produtor</div>
                <div style={{fontSize:12,color:"var(--gr4)",marginTop:2}}>Enxuto — nome, touro, diagnóstico e obs para o produtor</div>
              </div>
            </a>
          </div>
        </>;
      })()}
      {modal.type==="confirm"&&<>
        <div className="modal-hdr"><div className="modal-title">⚠️ Confirmar</div><button className="hdr-btn light" onClick={close}><Icon name="close" size={18}/></button></div>
        <div style={{fontSize:14,color:"var(--gr4)",marginBottom:20}}>{modal.msg}</div>
        <div className="row" style={{gap:8}}>
          <button className="btn btn-gh" style={{flex:1}} onClick={close}>Cancelar</button>
          <button className="btn btn-d" style={{flex:1}} onClick={()=>{
            modal.onOk?.();
            close();
          }}>Confirmar</button>
        </div>
      </>}
      {modal.type==="addSemen"&&<>
        <div className="modal-hdr"><div className="modal-title">🧪 Novo Sêmen</div><button className="hdr-btn light" onClick={close}><Icon name="close" size={18}/></button></div>
        <SemenForm onSave={(s)=>{modal.onSave(s);close();}} onCancel={close}/>
      </>}
      {modal.type==="termos"&&<>
        <div className="modal-hdr"><div className="modal-title">📄 Termos de Uso</div><button className="hdr-btn light" onClick={close}><Icon name="close" size={18}/></button></div>
        <div className="terms-content">
          <h3>1. Aceitação dos Termos</h3>
          <p>Ao utilizar o Controle IATF, você concorda com estes termos de uso. O serviço é fornecido para fins profissionais de gerenciamento de protocolos IATF em medicina veterinária.</p>
          <h3>2. Uso do Serviço</h3>
          <p>O Controle IATF é uma ferramenta de apoio profissional. O veterinário é inteiramente responsável pelas decisões clínicas e protocolos aplicados. O aplicativo não substitui o julgamento clínico profissional.</p>
          <h3>3. Dados e Privacidade</h3>
          <p>Os dados inseridos no sistema são de responsabilidade do usuário. Tratamos seus dados conforme nossa Política de Privacidade e a Lei Geral de Proteção de Dados (LGPD).</p>
          <h3>4. Pagamento e Assinatura</h3>
          <p>Após o período trial de 7 dias, o serviço requer assinatura mensal. O cancelamento pode ser feito a qualquer momento.</p>
          <h3>5. Limitação de Responsabilidade</h3>
          <p>O Controle IATF não se responsabiliza por decisões tomadas com base nas informações do sistema. O profissional veterinário é o único responsável pelo diagnóstico e tratamento dos animais.</p>
          <h3>6. Contato</h3>
          <p>Dúvidas: contato@controleiatf.com.br</p>
        </div>
        <button className="btn btn-p btn-full" style={{marginTop:16}} onClick={close}>Entendido</button>
      </>}
      {modal.type==="privacidade"&&<>
        <div className="modal-hdr"><div className="modal-title">🔒 Política de Privacidade</div><button className="hdr-btn light" onClick={close}><Icon name="close" size={18}/></button></div>
        <div className="terms-content">
          <h3>1. Dados Coletados</h3>
          <p>Coletamos: nome, sobrenome, cidade, WhatsApp e email no cadastro. Dados de protocolos, fazendas e animais inseridos pelo usuário.</p>
          <h3>2. Uso dos Dados</h3>
          <p>Seus dados são usados exclusivamente para: operação do serviço, suporte ao usuário e melhorias do produto. Nunca vendemos ou compartilhamos seus dados com terceiros.</p>
          <h3>3. Armazenamento</h3>
          <p>Dados armazenados com segurança via Supabase (PostgreSQL), com criptografia em trânsito e em repouso.</p>
          <h3>4. Seus Direitos (LGPD)</h3>
          <p>Você pode solicitar acesso, correção ou exclusão dos seus dados a qualquer momento pelo email: contato@controleiatf.com.br</p>
          <h3>5. Cookies</h3>
          <p>Usamos apenas cookies essenciais para manutenção da sessão do usuário.</p>
        </div>
        <button className="btn btn-p btn-full" style={{marginTop:16}} onClick={close}>Entendido</button>
      </>}
    </div>
  </div>;
}

function SemenForm({onSave,onCancel}){
  const[f,setF]=useState({touro:"",raca:"",partida:"",quantidade:10});
  const[errSemen,setErrSemen]=useState("");
  const s=(k,v)=>setF(x=>({...x,[k]:v}));
  return <div>
    <div className="fg"><label className="fl">Nome do Touro *</label><input className="fi" value={f.touro} onChange={e=>s("touro",e.target.value)} placeholder="Ex: Capitão FIV da Boa Fé"/></div>
    <div className="frow">
      <div className="fg"><label className="fl">Raça *</label><input className="fi" value={f.raca} onChange={e=>s("raca",e.target.value)} placeholder="Ex: Nelore"/></div>
      <div className="fg"><label className="fl">Nº Partida</label><input className="fi" value={f.partida} onChange={e=>s("partida",e.target.value)} placeholder="2024/01"/></div>
    </div>
    <div className="fg"><label className="fl">Quantidade de doses</label><input className="fi" type="number" min="0" value={f.quantidade} onChange={e=>s("quantidade",parseInt(e.target.value)||0)}/></div>
    {errSemen&&<div style={{color:"var(--r)",fontSize:13,fontWeight:600,marginBottom:8,padding:"8px 10px",background:"var(--rl)",borderRadius:"var(--r8)"}}>⚠️ {errSemen}</div>}
    <div className="row" style={{gap:8,marginTop:8}}>
      <button className="btn btn-gh" style={{flex:1}} onClick={onCancel}>Cancelar</button>
      <button className="btn btn-p" style={{flex:2}} onClick={()=>{if(!f.touro||!f.raca){setErrSemen("Preencha touro e raça.");return;}setErrSemen("");onSave(f);}}><Icon name="check" size={16}/> Salvar</button>
    </div>
  </div>;
}

// ── DG Tab ────────────────────────────────────────────────────────────────
function DGTab({ user, ping }) {
  const storageKey = `dg_fazendas_${user?.id}`;
  // Inicializa do localStorage imediatamente — sem flash de "Carregando"
  const [fazendas, setFazendas] = useState(() => DB.get(storageKey) || []);
  const [dgLoading, setDgLoading] = useState(false);
  const [tela, setTela] = useState(null); // null = lista | {type:"fazenda", id} | {type:"nova"}
  // Contador de escritas locais — impede que o sync assíncrono sobrescreva dados novos
  const writeCountRef = useRef(0);
  const [saveStatus, setSaveStatus] = useState(null); // null | "saving" | "saved" | "error"
  const saveTimerRef = useRef(null);
  const setSaved = () => {
    setSaveStatus("saved");
    clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => setSaveStatus(null), 3000);
  };

  const cacheLocal = (fzList) => DB.set(storageKey, fzList);

  // Sincroniza com Supabase em background; migra do localStorage se necessário
  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    const capturedWrites = writeCountRef.current;
    const hasLocal = (DB.get(storageKey) || []).length > 0;
    if (!hasLocal) setDgLoading(true);

    const sync = async () => {
      try {
        const [fzRes, anRes] = await Promise.all([
          supabase.from("dg_fazendas").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
          supabase.from("dg_animais").select("*").eq("user_id", user.id),
        ]);
        if (cancelled) return;
        if (fzRes.error) throw fzRes.error;
        const fzData = fzRes.data || [];
        const anData = anRes.data || [];
        // Não sobrescreve se o usuário fez alterações locais durante o sync
        const semEscritasLocais = writeCountRef.current === capturedWrites;
        if (fzData.length === 0) {
          const local = DB.get(storageKey) || [];
          // Migra dados existentes do localStorage para o Supabase (primeira vez)
          if (local.length > 0) {
            for (const f of local) {
              await supabase.from("dg_fazendas").upsert({
                id: f.id, user_id: user.id, nome: f.nome,
                proprietario: f.proprietario || "", cidade: f.cidade || "",
                telefone: f.telefone || "",
                data_inseminacao: f.dataInseminacao || null,
                data_dg: f.dataDG || null,
                created_at: f.criadoEm || new Date().toISOString(),
              }, { onConflict: "id" });
              for (const a of (f.animais || [])) {
                await supabase.from("dg_animais").upsert({
                  id: a.id, fazenda_dg_id: f.id, user_id: user.id,
                  nome: a.nome, status: a.status || null,
                }, { onConflict: "id" });
              }
            }
          }
          if (!cancelled && semEscritasLocais && !hasLocal) { setFazendas(local); cacheLocal(local); }
        } else {
          const fzList = fzData.map(f => ({
            ...f,
            dataInseminacao: f.data_inseminacao || "",
            dataDG: f.data_dg || "",
            criadoEm: f.created_at,
            animais: anData.filter(a => a.fazenda_dg_id === f.id).map(a => ({
              id: a.id, nome: a.nome, status: a.status || null,
            })),
          }));
          if (!cancelled && semEscritasLocais) { setFazendas(fzList); cacheLocal(fzList); }
        }
      } catch (e) {
        console.error("[DGTab] Supabase sync:", e);
        if (!cancelled && !hasLocal) setFazendas(DB.get(storageKey) || []);
      } finally {
        if (!cancelled) setDgLoading(false);
      }
    };
    sync();
    return () => { cancelled = true; };
  }, [user?.id]);

  const addFazenda = async (dados) => {
    writeCountRef.current++;
    setSaveStatus("saving");
    const id = uid();
    const criadoEm = new Date().toISOString();
    const nova = { ...dados, id, animais: [], criadoEm };
    const newList = [...fazendas, nova];
    setFazendas(newList); cacheLocal(newList);
    ping("Fazenda cadastrada!");
    setTela({ type: "fazenda", id });
    const { error } = await supabase.from("dg_fazendas").insert({
      id, user_id: user.id, nome: dados.nome,
      proprietario: dados.proprietario || "", cidade: dados.cidade || "",
      telefone: dados.telefone || "",
      data_inseminacao: dados.dataInseminacao || null,
      data_dg: dados.dataDG || null,
      created_at: criadoEm,
    });
    if (error) { console.error("[DGTab addFazenda]", error); setSaveStatus("error"); } else { setSaved(); }
  };

  const updateFazenda = async (id, dados) => {
    writeCountRef.current++;
    setSaveStatus("saving");
    const newList = fazendas.map(f => f.id === id ? { ...f, ...dados } : f);
    setFazendas(newList); cacheLocal(newList);
    const upd = {};
    if (dados.dataInseminacao !== undefined) upd.data_inseminacao = dados.dataInseminacao || null;
    if (dados.dataDG !== undefined) upd.data_dg = dados.dataDG || null;
    if (dados.nome !== undefined) upd.nome = dados.nome;
    if (dados.proprietario !== undefined) upd.proprietario = dados.proprietario;
    if (dados.cidade !== undefined) upd.cidade = dados.cidade;
    if (dados.telefone !== undefined) upd.telefone = dados.telefone;
    if (Object.keys(upd).length) {
      const { error } = await supabase.from("dg_fazendas").update(upd).eq("id", id);
      if (error) { console.error("[DGTab updateFazenda]", error); setSaveStatus("error"); } else { setSaved(); }
    } else { setSaved(); }
  };

  const deleteFazenda = (id) => {
    writeCountRef.current++;
    const newList = fazendas.filter(f => f.id !== id);
    setFazendas(newList); cacheLocal(newList);
    setTela(null); ping("Fazenda removida");
    supabase.from("dg_fazendas").delete().eq("id", id)
      .then(({ error }) => { if (error) console.error("[DGTab deleteFazenda]", error); });
  };

  const addAnimal = async (fazId, animal) => {
    writeCountRef.current++;
    setSaveStatus("saving");
    const id = uid();
    const newAnimal = { ...animal, id };
    const newList = fazendas.map(f => f.id === fazId
      ? { ...f, animais: [...(f.animais || []), newAnimal] } : f);
    setFazendas(newList); cacheLocal(newList);
    const { error } = await supabase.from("dg_animais").insert({
      id, fazenda_dg_id: fazId, user_id: user.id,
      nome: animal.nome, status: animal.status || null,
    });
    if (error) { console.error("[DGTab addAnimal]", error); setSaveStatus("error"); } else { setSaved(); }
  };

  const updateAnimal = async (fazId, animalId, dados) => {
    writeCountRef.current++;
    setSaveStatus("saving");
    const newList = fazendas.map(f => f.id === fazId
      ? { ...f, animais: f.animais.map(a => a.id === animalId ? { ...a, ...dados } : a) } : f);
    setFazendas(newList); cacheLocal(newList);
    const upd = {};
    if (dados.nome !== undefined) upd.nome = dados.nome;
    if ("status" in dados) upd.status = dados.status;
    if (Object.keys(upd).length) {
      const { error } = await supabase.from("dg_animais").update(upd).eq("id", animalId);
      if (error) { console.error("[DGTab updateAnimal]", error); setSaveStatus("error"); } else { setSaved(); }
    } else { setSaved(); }
  };

  const deleteAnimal = async (fazId, animalId) => {
    writeCountRef.current++;
    setSaveStatus("saving");
    const newList = fazendas.map(f => f.id === fazId
      ? { ...f, animais: f.animais.filter(a => a.id !== animalId) } : f);
    setFazendas(newList); cacheLocal(newList);
    ping("Animal removido");
    const { error } = await supabase.from("dg_animais").delete().eq("id", animalId);
    if (error) { console.error("[DGTab deleteAnimal]", error); setSaveStatus("error"); } else { setSaved(); }
  };

  if (tela?.type === "fazenda") {
    const faz = fazendas.find(f => f.id === tela.id);
    if (!faz) { setTela(null); return null; }
    return <DGFazendaTela
      faz={faz}
      onBack={() => setTela(null)}
      onAddAnimal={(a) => addAnimal(faz.id, a)}
      onUpdateAnimal={(aid, d) => updateAnimal(faz.id, aid, d)}
      onDeleteAnimal={(aid) => deleteAnimal(faz.id, aid)}
      onDelete={() => deleteFazenda(faz.id)}
      onUpdateFazenda={(d) => updateFazenda(faz.id, d)}
      ping={ping}
      saveStatus={saveStatus}
    />;
  }

  if (tela?.type === "nova") {
    return <DGNovaFazenda onSave={addFazenda} onCancel={() => setTela(null)} />;
  }

  // Lista de fazendas DG
  return <div className="scr">
    <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 2 }}>Diagnóstico de Gestação</div>
    <div style={{ fontSize: 13, color: "var(--gr4)", marginBottom: 16 }}>Fazendas atendidas apenas para DG</div>

    {dgLoading && <div style={{textAlign:"center",padding:"32px 0",color:"var(--gr4)",fontSize:13}}>Carregando...</div>}

    {!dgLoading && fazendas.length === 0
      ? <div className="empty">
          <Icon name="dg" size={44} />
          <div className="empty-t">Nenhum DG cadastrado</div>
          <div className="empty-s">Toque no + para iniciar um novo diagnóstico</div>
        </div>
      : !dgLoading && fazendas.map(f => {
          const prenhas = (f.animais || []).filter(a => a.status === "P").length;
          const total = (f.animais || []).length;
          const taxa = total > 0 ? Math.round(prenhas / total * 100) : null;
          return <div key={f.id} className="card" onClick={() => setTela({ type: "fazenda", id: f.id })}>
            <div className="rowsb" style={{ marginBottom: 4 }}>
              <div>
                <div className="card-title">{f.nome}</div>
                <div className="card-sub">👤 {f.proprietario}</div>
                <div className="card-sub">📍 {f.cidade}</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end" }}>
                <span className="badge b-g">{total} animais</span>
                {taxa !== null && <span className="badge" style={{ background: taxa >= 50 ? "var(--gp)" : "var(--yl)", color: taxa >= 50 ? "var(--g)" : "var(--y)" }}>{taxa}% prenhez</span>}
              </div>
            </div>
            {f.telefone && <div className="card-sub">📞 {f.telefone}</div>}
            <div className="card-sub" style={{ marginTop: 4 }}>🗓 {new Date(f.criadoEm).toLocaleDateString("pt-BR")}</div>
          </div>;
        })
    }
    <div style={{ height: 80 }} />
    <button className="fab" onClick={() => setTela({ type: "nova" })}><Icon name="plus" size={24} /></button>
  </div>;
}

function DGNovaFazenda({ onSave, onCancel }) {
  const [f, setF] = useState({ nome: "", proprietario: "", cidade: "", telefone: "", dataInseminacao: "", dataDG: "" });
  const [errDG, setErrDG] = useState("");
  const s = (k, v) => setF(x => ({ ...x, [k]: v }));
  const salvar = () => {
    if (!f.nome.trim() || !f.proprietario.trim()) { setErrDG("Preencha nome da fazenda e proprietário."); return; }
    setErrDG("");
    onSave(f);
  };
  return <div className="scr">
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
      <button className="hdr-btn light" onClick={onCancel}><Icon name="back" size={20} /></button>
      <div style={{ fontSize: 18, fontWeight: 800 }}>Nova Fazenda DG</div>
    </div>
    <div className="fg"><label className="fl">Nome da Fazenda *</label><input className="fi" value={f.nome} onChange={e => s("nome", e.target.value)} placeholder="Ex: Fazenda Santa Luzia" /></div>
    <div className="fg"><label className="fl">Proprietário *</label><input className="fi" value={f.proprietario} onChange={e => s("proprietario", e.target.value)} placeholder="Ex: João da Silva" /></div>
    <div className="fg"><label className="fl">Cidade</label><input className="fi" value={f.cidade} onChange={e => s("cidade", e.target.value)} placeholder="Ex: Ipatinga - MG" /></div>
    <div className="fg"><label className="fl">Telefone</label><input className="fi" type="tel" inputMode="numeric" value={f.telefone} onChange={e => s("telefone", formatPhone(e.target.value))} placeholder="(31) 99999-9999" maxLength={15}/></div>
    <div className="frow">
      <div className="fg"><label className="fl">Data da Inseminação</label><input className="fi" value={f.dataInseminacao} onChange={e => s("dataInseminacao", e.target.value)} type="date" /></div>
      <div className="fg"><label className="fl">Data do DG</label><input className="fi" value={f.dataDG} onChange={e => s("dataDG", e.target.value)} type="date" /></div>
    </div>
    {errDG&&<div style={{color:"var(--r)",fontSize:13,fontWeight:600,marginBottom:8,padding:"8px 10px",background:"var(--rl)",borderRadius:"var(--r8)"}}>⚠️ {errDG}</div>}
    <div className="row" style={{ gap: 8, marginTop: 8 }}>
      <button className="btn btn-gh" style={{ flex: 1 }} onClick={onCancel}>Cancelar</button>
      <button className="btn btn-p" style={{ flex: 2 }} onClick={salvar}><Icon name="check" size={16} /> Salvar</button>
    </div>
  </div>;
}

function DGFazendaTela({ faz, onBack, onAddAnimal, onUpdateAnimal, onDeleteAnimal, onDelete, onUpdateFazenda, ping, saveStatus }) {
  const [novoAnimal, setNovoAnimal] = useState("");
  const [adicionando, setAdicionando] = useState(false);
  const [confirmarExclusao, setConfirmarExclusao] = useState(false);
  const [dataIns, setDataIns] = useState(faz.dataInseminacao || "");
  const [dataDG, setDataDG] = useState(faz.dataDG || "");
  const [busca, setBusca] = useState("");
  const animais = faz.animais || [];
  const animaisFiltrados = busca.trim()
    ? animais.filter(a => a.nome.toLowerCase().includes(busca.trim().toLowerCase()))
    : animais;
  const animaisOrdenados = [...animaisFiltrados].sort((a, b) => {
    const ordem = { P: 0, V: 1 };
    const sa = ordem[a.status] ?? 2;
    const sb = ordem[b.status] ?? 2;
    if (sa !== sb) return sa - sb;
    // Animais sem dígito no identificador (ex: "Gleide", "Aninha") vão para o final
    const da = /\d/.test(a.nome), db = /\d/.test(b.nome);
    if (da !== db) return da ? -1 : 1;
    return a.nome.localeCompare(b.nome, undefined, { numeric: true, sensitivity: "base" });
  });
  const prenhas = animais.filter(a => a.status === "P").length;
  const vazias = animais.filter(a => a.status === "V").length;
  const semDiag = animais.filter(a => !a.status).length;
  const total = animais.length;
  const taxa = total > 0 ? Math.round(prenhas / total * 100) : 0;

  const fmtData = (iso) => iso ? new Date(iso + "T12:00:00").toLocaleDateString("pt-BR") : "—";

  const salvarAnimal = () => {
    if (!novoAnimal.trim()) return;
    onAddAnimal({ nome: novoAnimal.trim(), status: null });
    setNovoAnimal("");
    setAdicionando(false);
    ping("Animal adicionado");
  };

  const salvarDatas = (campo, valor) => {
    if (campo === "ins") { setDataIns(valor); onUpdateFazenda({ dataInseminacao: valor }); }
    else { setDataDG(valor); onUpdateFazenda({ dataDG: valor }); }
    ping("Data salva");
  };

  const gerarRelatorio = () => {
    const agora = new Date().toLocaleDateString("pt-BR");
    const hora = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    const linhaAnimais = animais.map((a, i) =>
      `${String(i + 1).padStart(2, "0")}. ${a.nome} — ${a.status === "P" ? "✅ PRENHA" : a.status === "V" ? "❌ VAZIA" : "⏳ Pendente"}`
    ).join("\n");

    return `🐄 *DIAGNÓSTICO DE GESTAÇÃO*
━━━━━━━━━━━━━━━━━━━━━
📋 *DADOS DA PROPRIEDADE*
🏡 Fazenda: ${faz.nome}
👤 Proprietário: ${faz.proprietario}
📍 Cidade: ${faz.cidade || "—"}
📞 Telefone: ${faz.telefone || "—"}
💉 Data da Inseminação: ${fmtData(dataIns)}
🔬 Data do DG: ${fmtData(dataDG)}
🗓 Relatório emitido: ${agora} às ${hora}
━━━━━━━━━━━━━━━━━━━━━
📊 *RESUMO*
🔢 Total avaliado: ${total} animais
✅ Prenhas: ${prenhas}
❌ Vazias: ${vazias}${semDiag > 0 ? `\n⏳ Pendentes: ${semDiag}` : ""}
📈 Taxa de prenhez: ${taxa}%
━━━━━━━━━━━━━━━━━━━━━
🐄 *RESULTADO INDIVIDUAL*
${linhaAnimais}
━━━━━━━━━━━━━━━━━━━━━
_Relatório gerado pelo Controle IATF_
_controleiatf.com.br_`;
  };

  const enviarWA = () => {
    const txt = gerarRelatorio();
    window.open(`https://wa.me/?text=${encodeURIComponent(txt)}`, "_blank");
  };

  const baixarTxt = () => {
    const txt = gerarRelatorio().replace(/\*/g, "").replace(/_/g, "");
    const blob = new Blob([txt], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `DG_${faz.nome.replace(/\s+/g, "_")}_${new Date().toLocaleDateString("pt-BR").replace(/\//g, "-")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return <div className="scr">
    {/* Header da tela */}
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
      <button className="hdr-btn light" onClick={onBack}><Icon name="back" size={20} /></button>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 18, fontWeight: 800 }}>{faz.nome}</div>
        <div style={{ fontSize: 12, color: "var(--gr4)" }}>👤 {faz.proprietario} · 📍 {faz.cidade || "—"}</div>
      </div>
      {saveStatus === "saving" && <span style={{ fontSize: 11, color: "var(--y)", fontWeight: 600, whiteSpace: "nowrap" }}>● Salvando</span>}
      {saveStatus === "saved" && <span style={{ fontSize: 11, color: "var(--g)", fontWeight: 600, whiteSpace: "nowrap" }}>✓ Salvo</span>}
      {saveStatus === "error" && <span style={{ fontSize: 11, color: "var(--r)", fontWeight: 600, whiteSpace: "nowrap" }}>✗ Erro ao salvar</span>}
      <button className="btn btn-d btn-sm" onClick={() => setConfirmarExclusao(true)}>
        <Icon name="trash" size={14} />
      </button>
    </div>

    {/* Confirmar exclusão inline — substitui window.confirm que é bloqueado no iOS PWA */}
    {confirmarExclusao && <div style={{background:"var(--rl)",border:"1px solid #fca5a5",borderRadius:12,padding:"12px 14px",marginBottom:12}}>
      <div style={{fontSize:14,fontWeight:700,color:"var(--r)",marginBottom:10}}>⚠️ Excluir esta fazenda DG e todos os animais?</div>
      <div className="row" style={{gap:8}}>
        <button className="btn btn-gh" style={{flex:1}} onClick={()=>setConfirmarExclusao(false)}>Cancelar</button>
        <button className="btn btn-d" style={{flex:1}} onClick={()=>{setConfirmarExclusao(false);onDelete();}}>Excluir</button>
      </div>
    </div>}

    {/* Datas */}
    <div style={{ display:"flex", gap:8, marginBottom:16 }}>
      <div className="fg" style={{ flex:1, margin:0 }}>
        <label className="fl">💉 Data Inseminação</label>
        <input className="fi" type="date" value={dataIns}
          onChange={e => salvarDatas("ins", e.target.value)} />
      </div>
      <div className="fg" style={{ flex:1, margin:0 }}>
        <label className="fl">🔬 Data do DG</label>
        <input className="fi" type="date" value={dataDG}
          onChange={e => salvarDatas("dg", e.target.value)} />
      </div>
    </div>

    {/* Resumo */}
    {total > 0 && <div className="info-box" style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: "var(--g)", marginBottom: 8, textTransform: "uppercase", letterSpacing: .4 }}>Resumo do DG</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginBottom: 10 }}>
        <div className="stat"><div className="stat-n">{total}</div><div className="stat-l">Total</div></div>
        <div className="stat"><div className="stat-n" style={{ color: "var(--g)" }}>{prenhas}</div><div className="stat-l">Prenhas</div></div>
        <div className="stat"><div className="stat-n" style={{ color: "var(--r)" }}>{vazias}</div><div className="stat-l">Vazias</div></div>
        <div className="stat"><div className="stat-n" style={{ color: taxa >= 50 ? "var(--g)" : "var(--y)" }}>{taxa}%</div><div className="stat-l">Taxa</div></div>
      </div>
      <div className="prog"><div className="prog-fill" style={{ width: taxa + "%" }} /></div>
    </div>}

    {/* Animais */}
    <div className="sec">Animais ({total})</div>

    {animais.length > 0 && (
      <div style={{ marginBottom: 10 }}>
        <div style={{ position: "relative" }}>
          <input
            className="fi"
            value={busca}
            onChange={e => setBusca(e.target.value)}
            placeholder="Buscar por brinco ou nome..."
            style={{ paddingRight: busca ? 36 : undefined }}
          />
          {busca && <button onClick={() => setBusca("")} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--gr3)", fontSize: 16, padding: 0 }}>✕</button>}
        </div>
        {busca && <div style={{ fontSize: 12, color: "var(--gr4)", marginTop: 4 }}>{animaisFiltrados.length} de {animais.length} animais</div>}
      </div>
    )}

    {animais.length === 0 && !adicionando && <div className="empty">
      <div className="empty-t">Nenhum animal cadastrado</div>
      <div className="empty-s">Adicione os animais para iniciar o DG</div>
    </div>}

    {busca && animaisFiltrados.length === 0 && <div style={{ textAlign: "center", padding: "16px 0", color: "var(--gr4)", fontSize: 13 }}>Nenhum animal encontrado para "{busca}"</div>}

    {/* Ordenação alfanumérica por brinco, com marcados (P e V) primeiro */}
    {animaisOrdenados
      .map(a => <div key={a.id} style={{
        display: "flex", alignItems: "center", gap: 8, padding: "10px 14px",
        border: `1.5px solid ${a.status === "P" ? "var(--gm)" : a.status === "V" ? "#fca5a5" : "var(--gr2)"}`,
        borderRadius: 12, marginBottom: 8,
        background: a.status === "P" ? "var(--gp)" : a.status === "V" ? "var(--rl)" : "var(--w)"
      }}>
        <div style={{ flex: 1, fontSize: 15, fontWeight: 600 }}>{a.nome}</div>

        {/* Se não marcado: mostra os dois botões */}
        {!a.status && <>
          <button onClick={() => onUpdateAnimal(a.id, { status: "P" })}
            style={{ padding: "6px 12px", borderRadius: 99, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 13, background: "var(--gr1)", color: "var(--gr4)" }}>
            ✅ Prenha
          </button>
          <button onClick={() => onUpdateAnimal(a.id, { status: "V" })}
            style={{ padding: "6px 12px", borderRadius: 99, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 13, background: "var(--gr1)", color: "var(--gr4)" }}>
            ❌ Vazia
          </button>
        </>}

        {/* Se marcado: mostra só o status com opção de desmarcar */}
        {a.status === "P" && <button onClick={() => onUpdateAnimal(a.id, { status: null })}
          style={{ padding: "6px 14px", borderRadius: 99, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 13, background: "var(--g)", color: "#fff" }}>
          ✅ Prenha
        </button>}
        {a.status === "V" && <button onClick={() => onUpdateAnimal(a.id, { status: null })}
          style={{ padding: "6px 14px", borderRadius: 99, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 13, background: "var(--r)", color: "#fff" }}>
          ❌ Vazia
        </button>}

        <button onClick={() => onDeleteAnimal(a.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--gr3)", padding: 4 }}>
          <Icon name="trash" size={16} />
        </button>
      </div>)}

    {/* Adicionar animal */}
    {adicionando
      ? <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <input className="fi" style={{ flex: 1 }} autoFocus value={novoAnimal}
            onChange={e => setNovoAnimal(e.target.value)}
            onKeyDown={e => e.key === "Enter" && salvarAnimal()}
            placeholder="Nome ou nº do brinco..." />
          <button className="btn btn-p" onClick={salvarAnimal}><Icon name="check" size={16} /></button>
          <button className="btn btn-gh" onClick={() => { setAdicionando(false); setNovoAnimal(""); }}><Icon name="close" size={16} /></button>
        </div>
      : <button className="btn btn-gh btn-full" style={{ marginBottom: 16 }} onClick={() => setAdicionando(true)}>
          <Icon name="plus" size={16} /> Adicionar animal
        </button>
    }

    {/* Relatório */}
    {total > 0 && <>
      <div className="sec">Relatório</div>
      <div style={{ display: "flex", gap: 8 }}>
        <button className="btn btn-wa" style={{ flex: 1 }} onClick={enviarWA}>
          <Icon name="wa" size={16} color="#fff" /> WhatsApp
        </button>
        <button className="btn btn-gh" style={{ flex: 1 }} onClick={baixarTxt}>
          <Icon name="doc" size={16} /> Baixar .txt
        </button>
      </div>
    </>}

    <div style={{ height: 100 }} />
  </div>;
}
