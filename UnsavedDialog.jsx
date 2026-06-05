import React from 'react';

// Konfliktdialog – vises når en annen enhet/tab har lagret nyere data siden denne sesjonen lastet
export function KonfliktDialog({ vis, onLastInn, onOverskriver, lasterInn }) {
  if (!vis) return null;
  return (
    <div className="fade" style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",zIndex:400,display:"flex",alignItems:"center",justifyContent:"center",padding:18}}>
      <div role="alertdialog" aria-modal="true" onClick={e=>e.stopPropagation()} style={{background:"var(--c-w)",borderRadius:14,padding:22,maxWidth:380,width:"100%",boxShadow:"0 10px 40px rgba(0,0,0,0.25)"}}>
        <div style={{fontFamily:"'Fredoka One',cursive",fontSize:18,color:"#e65100",marginBottom:8}}>⚠️ Planene er endret</div>
        <p style={{fontSize:13,color:"var(--c-t)",lineHeight:1.6,marginBottom:6}}>
          En annen enhet eller fane har lagret nyere endringer siden du åpnet denne siden.
        </p>
        <p style={{fontSize:12,color:"var(--c-gr)",lineHeight:1.5,marginBottom:16,background:"#fff8e1",borderRadius:8,padding:"8px 10px"}}>
          Henter du inn de nyeste planene, mister du dine ulagrede endringer her. Lagrer du likevel, overskrives de nyere endringene.
        </p>
        <div style={{display:"flex",gap:8}}>
          <button autoFocus onClick={onLastInn} disabled={lasterInn} style={{flex:1,padding:"11px",background:"#2c5b8e",color:"#fff",border:"none",borderRadius:10,fontWeight:800,fontSize:13,cursor:"pointer",fontFamily:"'Nunito',sans-serif",opacity:lasterInn?0.6:1}}>
            {lasterInn?"Laster...":"⬇ Hent nyeste"}
          </button>
          <button onClick={onOverskriver} disabled={lasterInn} style={{flex:1,padding:"11px",background:"#fdecea",color:"#c62828",border:"none",borderRadius:10,fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"'Nunito',sans-serif"}}>
            Lagre likevel
          </button>
        </div>
      </div>
    </div>
  );
}

// Delt bekreftelsesdialog for ulagrede endringer – brukes i alle plan-editorer
export function UnsavedDialog({ bekreftDest, onBekreft, onAvbryt }) {
  if (!bekreftDest) return null;
  return (
    <div className="fade" style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:400,display:"flex",alignItems:"center",justifyContent:"center",padding:18}}>
      <div role="alertdialog" aria-modal="true" aria-labelledby="unsaved-tittel" onClick={e=>e.stopPropagation()} style={{background:"var(--c-w)",borderRadius:14,padding:22,maxWidth:340,width:"100%",boxShadow:"0 10px 40px rgba(0,0,0,0.25)"}}>
        <div id="unsaved-tittel" style={{fontFamily:"'Fredoka One',cursive",fontSize:18,color:"#c62828",marginBottom:8}}>⚠️ Ulagrede endringer</div>
        <p style={{fontSize:13,color:"var(--c-t)",lineHeight:1.6,marginBottom:16}}>Du har endringer som ikke er lagret. Vil du forlate uten å lagre?</p>
        <div style={{display:"flex",gap:8}}>
          <button autoFocus onClick={onAvbryt} style={{flex:1,padding:"11px",background:"var(--c-lg2)",color:"var(--c-t)",border:"none",borderRadius:10,fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"'Nunito',sans-serif"}}>Bli her</button>
          <button onClick={onBekreft} style={{flex:1,padding:"11px",background:"#c62828",color:"#fff",border:"none",borderRadius:10,fontWeight:800,fontSize:13,cursor:"pointer",fontFamily:"'Nunito',sans-serif"}}>Forlat uten å lagre</button>
        </div>
      </div>
    </div>
  );
}
