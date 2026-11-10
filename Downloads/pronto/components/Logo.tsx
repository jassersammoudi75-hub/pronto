export default function Logo() {
  return (
    <span className="flex items-center gap-2 text-2xl font-black tracking-tight">
      <svg width="34" height="34" viewBox="0 0 34 34" aria-hidden>
        <rect width="34" height="34" rx="9" fill="#FF6A00" />
        <path d="M12 25V9h7a5 5 0 0 1 0 10h-4" fill="none" stroke="#000" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M5 14h4M4 19h5" stroke="#000" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
      <span>PRONTO</span>
    </span>
  );
}
