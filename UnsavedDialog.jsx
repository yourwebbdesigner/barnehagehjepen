import React from 'react';

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
