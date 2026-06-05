import { useState, useEffect } from 'react';

// Gjenbrukbar hook for å beskytte mot utilsiktet navigasjon med ulagrede endringer.
// Brukes i alle plan-editorer: UkeplanSide, ArsplanSide, MaanedsplanSide, etc.
export function useUnsavedGuard() {
  const [harEndringer, setHarEndringer] = useState(false);
  const [bekreftDest, setBekreftDest] = useState(null); // { dest, naviger }

  // Blokkér nettleserfane-lukking ved ulagrede endringer
  useEffect(() => {
    if (!harEndringer) return;
    const handler = (e) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [harEndringer]);

  // Sjekk om vi kan navigere – vis dialog hvis det er ulagrede endringer
  const sjekkNavigasjon = (dest, navigerFn) => {
    if (!harEndringer) { navigerFn(dest); return; }
    setBekreftDest({ dest, naviger: navigerFn });
  };

  const bekreftNavigasjon = () => {
    if (!bekreftDest) return;
    setHarEndringer(false);
    bekreftDest.naviger(bekreftDest.dest);
    setBekreftDest(null);
  };

  const avbrytNavigasjon = () => setBekreftDest(null);

  const nullstillGuard = () => { setHarEndringer(false); setBekreftDest(null); };

  return {
    harEndringer,
    setHarEndringer,
    bekreftDest,
    sjekkNavigasjon,
    bekreftNavigasjon,
    avbrytNavigasjon,
    nullstillGuard,
  };
}
