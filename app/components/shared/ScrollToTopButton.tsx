'use client';

import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

export default function ScrollToTopButton() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShow(window.scrollY > 300);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!show) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="right-8 bottom-8 z-50 fixed flex justify-center items-center bg-brand hover:bg-brand-hover shadow-lg hover:shadow-xl active:shadow-2xl rounded-full w-12 h-12 font-bold text-white transition-colors hover:cursor-pointer"
      title="Voltar ao Topo"
      aria-label="Voltar ao Topo"
    >
      <ArrowUp size={18} />
    </button>
  );
}