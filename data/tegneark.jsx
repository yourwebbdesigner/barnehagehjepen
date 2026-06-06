// Pedagogisk tegneoppgavebibliotek – Rammeplanens 7 fagområder
// 3 gjennomarbeidede oppgaver per fagområde = 21 tegneark totalt

const S = { f:"white", s:"#334155", sw:3.5, sc:"round", sj:"round" };
const T = { fontFamily:"Arial,Helvetica,sans-serif", stroke:"none" };

// ═══ KST: Kommunikasjon, språk og tekst ══════════════════════════════════════

const SvgFortellerrekke = ()=>(
  <svg viewBox="0 0 300 280" fill={S.f} stroke={S.s} strokeWidth={S.sw} strokeLinecap={S.sc} strokeLinejoin={S.sj}>
    <rect x="6" y="6" width="82" height="158" rx="10"/>
    <rect x="109" y="6" width="82" height="158" rx="10"/>
    <rect x="212" y="6" width="82" height="158" rx="10"/>
    <path d="M91 85 L107 85" strokeWidth="3"/><path d="M104 79 L110 85 L104 91" fill="none" strokeWidth="3"/>
    <path d="M194 85 L210 85" strokeWidth="3"/><path d="M207 79 L213 85 L207 91" fill="none" strokeWidth="3"/>
    <circle cx="47" cy="185" r="12" strokeWidth="2.5"/><text x="47" y="189" textAnchor="middle" fontSize="14" fill={S.s} {...T} fontWeight="bold">1</text>
    <circle cx="150" cy="185" r="12" strokeWidth="2.5"/><text x="150" y="189" textAnchor="middle" fontSize="14" fill={S.s} {...T} fontWeight="bold">2</text>
    <circle cx="253" cy="185" r="12" strokeWidth="2.5"/><text x="253" y="189" textAnchor="middle" fontSize="14" fill={S.s} {...T} fontWeight="bold">3</text>
    {[14,117,220].map(x=>[210,230,252].map(y=><line key={`${x}${y}`} x1={x} y1={y} x2={x+70} y2={y} strokeWidth="1.5" strokeDasharray="5 3"/>))}
  </svg>
);

const SvgSnakkebobler = ()=>(
  <svg viewBox="0 0 300 280" fill={S.f} stroke={S.s} strokeWidth={S.sw} strokeLinecap={S.sc} strokeLinejoin={S.sj}>
    <circle cx="72" cy="190" r="44"/>
    <circle cx="63" cy="178" r="7" fill={S.s} stroke="none"/><circle cx="81" cy="178" r="7" fill={S.s} stroke="none"/>
    <path d="M57 202 Q72 212 87 202" fill="none" strokeWidth="3"/>
    <circle cx="228" cy="190" r="44"/>
    <circle cx="219" cy="178" r="7" fill={S.s} stroke="none"/><circle cx="237" cy="178" r="7" fill={S.s} stroke="none"/>
    <path d="M213 202 Q228 212 243 202" fill="none" strokeWidth="3"/>
    <path d="M14 20 Q14 8 26 8 L126 8 Q138 8 138 20 L138 90 Q138 102 126 102 L90 102 L80 118 L76 102 L26 102 Q14 102 14 90 Z"/>
    <path d="M286 20 Q286 8 274 8 L174 8 Q162 8 162 20 L162 90 Q162 102 174 102 L210 102 L220 118 L224 102 L274 102 Q286 102 286 90 Z"/>
  </svg>
);

const SvgBokstavdyr = ()=>(
  <svg viewBox="0 0 300 280" fill={S.f} stroke={S.s} strokeWidth={S.sw} strokeLinecap={S.sc} strokeLinejoin={S.sj}>
    {/* B – Bjørn */}
    <text x="18" y="72" fontSize="48" fontWeight="bold" fill="none" stroke={S.s} strokeWidth="3" {...T}>B</text>
    <circle cx="110" cy="52" r="26"/><circle cx="96" cy="30" r="13"/><circle cx="124" cy="30" r="13"/>
    <circle cx="102" cy="48" r="5" fill={S.s} stroke="none"/><circle cx="118" cy="48" r="5" fill={S.s} stroke="none"/>
    <ellipse cx="110" cy="58" rx="6" ry="4"/>
    {/* K – Katt */}
    <text x="18" y="182" fontSize="48" fontWeight="bold" fill="none" stroke={S.s} strokeWidth="3" {...T}>K</text>
    <circle cx="110" cy="162" r="26"/><path d="M90 140 L82 118 L102 133Z"/><path d="M130 140 L138 118 L118 133Z"/>
    <circle cx="102" cy="158" r="5" fill={S.s} stroke="none"/><circle cx="118" cy="158" r="5" fill={S.s} stroke="none"/>
    <path d="M96 170 L110 175 L124 170" fill="none" strokeWidth="2.5"/>
    {[90,102,114,126].map(x=><line key={x} x1={x} y1="165" x2={x-14} y2="168" strokeWidth="1.5"/>)}
    {/* E – Elg */}
    <text x="164" y="72" fontSize="48" fontWeight="bold" fill="none" stroke={S.s} strokeWidth="3" {...T}>E</text>
    <ellipse cx="258" cy="58" rx="22" ry="18"/><ellipse cx="258" cy="42" rx="10" ry="14"/>
    <circle cx="252" cy="55" r="4" fill={S.s} stroke="none"/><circle cx="264" cy="55" r="4" fill={S.s} stroke="none"/>
    <path d="M240 30 L228 14 M238 26 L222 22 M240 30 L238 12"/><path d="M276 30 L288 14 M278 26 L294 22 M276 30 L278 12"/>
    {/* H – Hund */}
    <text x="164" y="182" fontSize="48" fontWeight="bold" fill="none" stroke={S.s} strokeWidth="3" {...T}>H</text>
    <circle cx="258" cy="162" r="26"/>
    <ellipse cx="240" cy="148" rx="9" ry="18"/><ellipse cx="276" cy="148" rx="9" ry="18"/>
    <circle cx="250" cy="158" r="5" fill={S.s} stroke="none"/><circle cx="266" cy="158" r="5" fill={S.s} stroke="none"/>
    <ellipse cx="258" cy="172" rx="7" ry="5"/>
    {/* Divider */}
    <line x1="150" y1="10" x2="150" y2="270" strokeWidth="1.5" strokeDasharray="6 4"/>
    <line x1="10" y1="128" x2="290" y2="128" strokeWidth="1.5" strokeDasharray="6 4"/>
  </svg>
);

// ═══ KBMH: Kropp, bevegelse, mat og helse ════════════════════════════════════

const SvgKroppenMin = ()=>(
  <svg viewBox="0 0 300 280" fill={S.f} stroke={S.s} strokeWidth={S.sw} strokeLinecap={S.sc} strokeLinejoin={S.sj}>
    <circle cx="150" cy="44" r="32"/>
    <circle cx="140" cy="38" r="5" fill={S.s} stroke="none"/><circle cx="160" cy="38" r="5" fill={S.s} stroke="none"/>
    <path d="M138 55 Q150 63 162 55" fill="none" strokeWidth="3"/>
    <rect x="114" y="76" width="72" height="84" rx="16"/>
    <path d="M114 90 L70 130"/><path d="M186 90 L230 130"/>
    <ellipse cx="70" cy="136" rx="14" ry="8"/><ellipse cx="230" cy="136" rx="14" ry="8"/>
    <path d="M122 160 L112 248"/><path d="M178 160 L188 248"/>
    <ellipse cx="112" cy="254" rx="18" ry="10"/><ellipse cx="188" cy="254" rx="18" ry="10"/>
    {[[84,100,"←"],[210,100,"→"],[84,200,"←"],[210,200,"→"]].map(([x,y,a],i)=>
      <text key={i} x={x} y={y} fontSize="11" fill={S.s} {...T} textAnchor="middle">{a}</text>)}
    <line x1="14" y1="268" x2="90" y2="268" strokeWidth="1.5" strokeDasharray="5 3"/>
    <line x1="210" y1="268" x2="286" y2="268" strokeWidth="1.5" strokeDasharray="5 3"/>
  </svg>
);

const SvgMatfat = ()=>(
  <svg viewBox="0 0 300 280" fill={S.f} stroke={S.s} strokeWidth={S.sw} strokeLinecap={S.sc} strokeLinejoin={S.sj}>
    <ellipse cx="150" cy="148" rx="120" ry="118"/>
    <ellipse cx="150" cy="148" rx="108" ry="106"/>
    <line x1="150" y1="42" x2="150" y2="254" strokeWidth="2"/><line x1="42" y1="148" x2="258" y2="148" strokeWidth="2"/>
    {/* Grønnsak Q1: simple broccoli/carrot */}
    <path d="M96 92 L106 88 L102 78 Q120 62 130 78 L126 88 L136 92" fill="none" strokeWidth="2.5"/>
    <rect x="113" y="92" width="6" height="20" rx="3" fill="none" strokeWidth="2"/>
    {/* Frukt Q2: apple */}
    <path d="M186 80 Q214 72 214 100 Q214 128 186 130 Q158 128 158 100 Q158 72 186 80Z" strokeWidth="2.5"/>
    <path d="M186 78 Q182 68 186 60" fill="none" strokeWidth="2"/><path d="M186 78 Q194 72 200 74" fill="none" strokeWidth="2"/>
    {/* Korn/brød Q3: slice of bread */}
    <path d="M80 162 Q64 162 64 172 L68 226 Q68 232 80 232 L120 232 Q132 232 132 226 L136 172 Q136 162 120 162 Q100 148 80 162Z" strokeWidth="2.5"/>
    <line x1="76" y1="185" x2="124" y2="185" strokeWidth="1.5"/><line x1="74" y1="200" x2="126" y2="200" strokeWidth="1.5"/><line x1="76" y1="215" x2="124" y2="215" strokeWidth="1.5"/>
    {/* Protein Q4: fish */}
    <path d="M170 190 Q190 168 220 178 Q240 185 238 200 Q236 215 220 218 Q190 228 170 206 Z" strokeWidth="2.5"/>
    <circle cx="230" cy="192" r="4" fill={S.s} stroke="none"/>
    <path d="M170 198 L150 185 L154 198 L150 211 Z" strokeWidth="2"/>
    {/* Fork + knife */}
    <path d="M16 100 L16 180 M12 100 L12 130 M20 100 L20 130 M16 130 L16 100" fill="none" strokeWidth="2.5"/>
    <line x1="284" y1="100" x2="284" y2="180" strokeWidth="2.5"/>
    <path d="M280 100 Q284 112 284 120" fill="none" strokeWidth="2.5"/>
  </svg>
);

const SvgBevegelse = ()=>(
  <svg viewBox="0 0 300 280" fill={S.f} stroke={S.s} strokeWidth={S.sw} strokeLinecap={S.sc} strokeLinejoin={S.sj}>
    {/* Figure 1: Jumping – arms up, legs bent */}
    <circle cx="50" cy="44" r="22"/>
    <line x1="50" y1="66" x2="50" y2="130"/>
    <path d="M50 80 L22 58"/><path d="M50 80 L78 58"/>
    <path d="M50 130 L30 168 L18 158"/><path d="M50 130 L70 168 L82 158"/>
    <text x="50" y="230" textAnchor="middle" fontSize="11" fill={S.s} {...T}>Hoppe!</text>
    {/* Figure 2: Running – leaning forward, arms swinging */}
    <circle cx="150" cy="52" r="22"/>
    <path d="M150 74 L148 138" strokeWidth={S.sw}/>
    <path d="M148 90 L118 76"/><path d="M148 90 L175 108"/>
    <path d="M148 138 L128 178 L116 170"/><path d="M148 138 L170 172 L182 165"/>
    <text x="150" y="230" textAnchor="middle" fontSize="11" fill={S.s} {...T}>Løpe!</text>
    {/* Figure 3: Stretching – arms wide out */}
    <circle cx="250" cy="44" r="22"/>
    <line x1="250" y1="66" x2="250" y2="138"/>
    <path d="M250 84 L210 84"/><path d="M250 84 L290 84"/>
    <path d="M250 138 L234 182"/><path d="M250 138 L266 182"/>
    <text x="250" y="230" textAnchor="middle" fontSize="11" fill={S.s} {...T}>Strekke!</text>
    <line x1="10" y1="250" x2="290" y2="250" strokeWidth="1" strokeDasharray="4 4"/>
    <text x="150" y="268" textAnchor="middle" fontSize="10" fill={S.s} {...T}>Tegn din favorittbevegelse!</text>
  </svg>
);

// ═══ KKK: Kunst, kultur og kreativitet ═══════════════════════════════════════

const SvgSelvportrett = ()=>(
  <svg viewBox="0 0 300 280" fill={S.f} stroke={S.s} strokeWidth={S.sw} strokeLinecap={S.sc} strokeLinejoin={S.sj}>
    {/* Ornate mirror frame */}
    <ellipse cx="150" cy="132" rx="118" ry="128"/>
    <ellipse cx="150" cy="132" rx="96" ry="106"/>
    {/* Decorative frame details */}
    {[0,30,60,90,120,150,180,210,240,270,300,330].map((a,i)=>(
      <circle key={i}
        cx={150+107*Math.cos(a*Math.PI/180)}
        cy={132+117*Math.sin(a*Math.PI/180)}
        r="7" strokeWidth="2"/>
    ))}
    {/* Handle at bottom */}
    <rect x="136" y="252" width="28" height="22" rx="6"/>
    <ellipse cx="150" cy="252" rx="18" ry="6"/>
    {/* Dashed guide oval inside */}
    <ellipse cx="150" cy="118" rx="58" ry="68" strokeDasharray="8 5" strokeWidth="2"/>
    {/* Light guide dots for face */}
    <circle cx="130" cy="110" r="3" fill="#c4d6ec" stroke="none"/>
    <circle cx="170" cy="110" r="3" fill="#c4d6ec" stroke="none"/>
    <path d="M136 140 Q150 150 164 140" fill="none" stroke="#c4d6ec" strokeWidth="2"/>
    <text x="150" y="268" textAnchor="middle" fontSize="10" fill={S.s} {...T}>Tegn ansiktet ditt her!</text>
  </svg>
);

const SvgMonsterbred = ()=>(
  <svg viewBox="0 0 300 280" fill={S.f} stroke={S.s} strokeWidth={S.sw} strokeLinecap={S.sc} strokeLinejoin={S.sj}>
    {/* 4 rows × 6 cells pattern grid */}
    {[0,1,2,3].map(row=>(
      [0,1,2,3,4,5].map(col=>{
        const x = 12 + col * 46, y = 20 + row * 60;
        const isExample = (row===0 && col<3) || (row===1 && col<3);
        return (
          <rect key={`${row}${col}`} x={x} y={y} width="40" height="50" rx="6"
            strokeWidth={isExample ? 3 : 2} strokeDasharray={isExample ? "none" : "6 3"}/>
        );
      })
    ))}
    {/* Example patterns in first 3 cells of row 1: circle, square, triangle */}
    <circle cx="32" cy="45" r="12" strokeWidth="2.5"/>
    <rect x="66" y="33" width="24" height="24" rx="4" strokeWidth="2.5"/>
    <polygon points="124,29 112,57 136,57" strokeWidth="2.5"/>
    {/* Example patterns in first 3 cells of row 2: same pattern continues */}
    <circle cx="32" cy="105" r="12" strokeWidth="2.5"/>
    <rect x="66" y="93" width="24" height="24" rx="4" strokeWidth="2.5"/>
    <polygon points="124,89 112,117 136,117" strokeWidth="2.5"/>
    {/* Arrow showing "continue" */}
    <path d="M148 45 L158 45" strokeWidth="2.5"/><path d="M155 40 L161 45 L155 50" fill="none" strokeWidth="2.5"/>
    <text x="150" y="265" textAnchor="middle" fontSize="11" fill={S.s} {...T}>Fortsett mønsteret! Lag ditt eget mønster i rad 3 og 4.</text>
  </svg>
);

const SvgFargesirkel = ()=>(
  <svg viewBox="0 0 300 280" fill={S.f} stroke={S.s} strokeWidth={S.sw} strokeLinecap={S.sc} strokeLinejoin={S.sj}>
    {/* Large color wheel – 6 segments */}
    {[0,1,2,3,4,5].map(i=>{
      const a1 = (i*60-90)*Math.PI/180, a2 = ((i+1)*60-90)*Math.PI/180;
      const r=110, cx=150, cy=138;
      return <path key={i} d={`M${cx},${cy} L${cx+r*Math.cos(a1)},${cy+r*Math.sin(a1)} A${r},${r},0,0,1,${cx+r*Math.cos(a2)},${cy+r*Math.sin(a2)} Z`} strokeWidth="2.5"/>;
    })}
    <circle cx="150" cy="138" r="30" strokeWidth="2.5"/>
    {/* Labels for color sectors */}
    {[["Rød",0],["Oransje",60],["Gul",120],["Grønn",180],["Blå",240],["Lilla",300]].map(([name,deg],i)=>{
      const a=(deg-60)*Math.PI/180, r=80;
      return <text key={i} x={150+r*Math.cos(a)} y={138+r*Math.sin(a)} textAnchor="middle" fontSize="9" fill={S.s} {...T} dominantBaseline="central">{name}</text>;
    })}
    <text x="150" y="138" textAnchor="middle" fontSize="8" fill={S.s} {...T} dominantBaseline="central">Bland!</text>
    <text x="150" y="265" textAnchor="middle" fontSize="11" fill={S.s} {...T}>Farg hvert felt. Hva skjer i midten når farger blandes?</text>
  </svg>
);

// ═══ NMT: Natur, miljø og teknologi ══════════════════════════════════════════

const SvgArstidtre = ()=>(
  <svg viewBox="0 0 300 280" fill={S.f} stroke={S.s} strokeWidth={S.sw} strokeLinecap={S.sc} strokeLinejoin={S.sj}>
    {/* 4 panels 2×2 */}
    <rect x="6" y="6" width="136" height="126" rx="8"/>
    <rect x="158" y="6" width="136" height="126" rx="8"/>
    <rect x="6" y="148" width="136" height="126" rx="8"/>
    <rect x="158" y="148" width="136" height="126" rx="8"/>
    {/* Tree trunk in all 4 panels */}
    {[74,226,74,226].map((cx,i)=>{
      const cy = i<2 ? 69 : 211;
      return <rect key={i} x={cx-8} y={cy} width="16" height="40" rx="4"/>;
    })}
    {/* Vår (Q1, top-left): small buds/dots */}
    <circle cx="74" cy="52" r="28" strokeDasharray="5 3" strokeWidth="2"/>
    {[[62,40],[74,33],[86,40],[58,52],[90,52]].map(([x,y],i)=><circle key={i} cx={x} cy={y} r="5" strokeWidth="2"/>)}
    <text x="74" y="120" textAnchor="middle" fontSize="11" fill={S.s} {...T} fontWeight="bold">Vår 🌸</text>
    {/* Sommer (Q2, top-right): full dense crown */}
    <circle cx="226" cy="50" r="36" strokeWidth="3"/>
    <circle cx="210" cy="44" r="18" strokeWidth="2"/><circle cx="240" cy="44" r="18" strokeWidth="2"/><circle cx="226" cy="36" r="18" strokeWidth="2"/>
    <text x="226" y="120" textAnchor="middle" fontSize="11" fill={S.s} {...T} fontWeight="bold">Sommer ☀️</text>
    {/* Høst (Q3, bottom-left): few leaves falling */}
    <circle cx="74" cy="194" r="30" strokeWidth="2.5"/>
    {[[58,182],[74,178],[90,182]].map(([x,y],i)=><ellipse key={i} cx={x} cy={y} rx="8" ry="5" transform={`rotate(${-20+i*20},${x},${y})`} strokeWidth="2"/>)}
    {[[52,210],[82,215],[66,220]].map(([x,y],i)=><path key={i} d={`M${x} ${y-6} Q${x+4} ${y} ${x-2} ${y+6}`} fill="none" strokeWidth="1.5"/>)}
    <text x="74" y="262" textAnchor="middle" fontSize="11" fill={S.s} {...T} fontWeight="bold">Høst 🍂</text>
    {/* Vinter (Q4, bottom-right): bare branches + snow */}
    <path d="M226 194 L210 174 M226 194 L240 172 M226 194 L226 170 M216 180 L202 172 M236 178 L248 168" fill="none" strokeWidth="2.5"/>
    {[210,225,240,215,234].map((x,i)=><path key={i} d={`M${x} ${155+i*3} L${x-4} ${165+i*3} L${x+4} ${165+i*3}Z`} fill={S.s} stroke="none"/>)}
    <text x="226" y="262" textAnchor="middle" fontSize="11" fill={S.s} {...T} fontWeight="bold">Vinter ❄️</text>
  </svg>
);

const SvgLivssyklus = ()=>(
  <svg viewBox="0 0 300 280" fill={S.f} stroke={S.s} strokeWidth={S.sw} strokeLinecap={S.sc} strokeLinejoin={S.sj}>
    {/* Large circle guide */}
    <circle cx="150" cy="138" r="112" strokeDasharray="6 4" strokeWidth="1.5"/>
    {/* Stage 1: EGG (top) */}
    <ellipse cx="150" cy="30" rx="22" ry="16" strokeWidth="3"/>
    <text x="150" y="58" textAnchor="middle" fontSize="11" fill={S.s} {...T} fontWeight="bold">1. Egg</text>
    {/* Stage 2: LARVE/CATERPILLAR (right) */}
    {[0,1,2,3].map(i=><circle key={i} cx={248+i*0} cy={112+i*16} r={12-i} strokeWidth="2.5"/>)}
    <circle cx="250" cy="104" r="14" strokeWidth="3"/>
    <circle cx="245" cy="100" r="3" fill={S.s} stroke="none"/>
    <text x="268" y="148" textAnchor="middle" fontSize="11" fill={S.s} {...T} fontWeight="bold">2. Larve</text>
    {/* Stage 3: PUPPE/COCOON (bottom) */}
    <ellipse cx="150" cy="248" rx="20" ry="28" strokeWidth="3"/>
    <path d="M136 232 Q150 220 164 232" fill="none" strokeWidth="2"/>
    <text x="150" y="282" textAnchor="middle" fontSize="11" fill={S.s} {...T} fontWeight="bold">3. Puppe</text>
    {/* Stage 4: SOMMERFUGL (left) */}
    <circle cx="52" cy="138" r="8" strokeWidth="2.5"/>
    <ellipse cx="32" cy="122" rx="22" ry="16" transform="rotate(-20,32,122)" strokeWidth="2.5"/>
    <ellipse cx="30" cy="154" rx="18" ry="12" transform="rotate(20,30,154)" strokeWidth="2.5"/>
    <ellipse cx="72" cy="122" rx="22" ry="16" transform="rotate(20,72,122)" strokeWidth="2.5"/>
    <ellipse cx="74" cy="154" rx="18" ry="12" transform="rotate(-20,74,154)" strokeWidth="2.5"/>
    <text x="36" y="176" textAnchor="middle" fontSize="11" fill={S.s} {...T} fontWeight="bold">4. Sommerfugl</text>
    {/* Arrows between stages */}
    <path d="M168 44 Q210 60 240 96" fill="none" strokeWidth="2.5"/>
    <path d="M237 92 L242 102 L232 100" fill={S.s} stroke="none"/>
    <path d="M244 162 Q222 210 178 244" fill="none" strokeWidth="2.5"/>
    <path d="M180 247 L170 248 L174 238" fill={S.s} stroke="none"/>
    <path d="M122 252 Q82 236 58 200" fill="none" strokeWidth="2.5"/>
    <path d="M60 202 L52 196 L62 192" fill={S.s} stroke="none"/>
    <path d="M50 118 Q74 72 128 38" fill="none" strokeWidth="2.5"/>
    <path d="M126 40 L136 36 L134 46" fill={S.s} stroke="none"/>
  </svg>
);

const SvgVaerkart = ()=>(
  <svg viewBox="0 0 300 280" fill={S.f} stroke={S.s} strokeWidth={S.sw} strokeLinecap={S.sc} strokeLinejoin={S.sj}>
    {/* 2×3 grid of weather symbols */}
    {[[0,0],[1,0],[2,0],[0,1],[1,1],[2,1]].map(([col,row])=>(
      <rect key={`${col}${row}`} x={8+col*96} y={8+row*128} width="88" height="100" rx="10" strokeWidth="2"/>
    ))}
    {/* Sol */}
    <circle cx="52" cy="52" r="20" strokeWidth="3"/>
    {[0,45,90,135,180,225,270,315].map((a,i)=><line key={i} x1={52+24*Math.cos(a*Math.PI/180)} y1={52+24*Math.sin(a*Math.PI/180)} x2={52+32*Math.cos(a*Math.PI/180)} y2={52+32*Math.sin(a*Math.PI/180)} strokeWidth="2.5"/>)}
    <text x="52" y="96" textAnchor="middle" fontSize="11" fill={S.s} {...T}>Sol</text>
    {/* Sky */}
    <ellipse cx="148" cy="58" rx="32" ry="20" strokeWidth="2.5"/>
    <circle cx="132" cy="48" r="16" strokeWidth="2.5"/><circle cx="160" cy="44" r="18" strokeWidth="2.5"/>
    <text x="148" y="96" textAnchor="middle" fontSize="11" fill={S.s} {...T}>Sky</text>
    {/* Regn */}
    <ellipse cx="244" cy="50" rx="28" ry="16" strokeWidth="2.5"/>
    <circle cx="230" cy="42" r="14" strokeWidth="2"/><circle cx="254" cy="38" r="16" strokeWidth="2"/>
    {[230,244,258,237,251].map((x,i)=><line key={i} x1={x} y1={62+i%2*4} x2={x-5} y2={76+i%2*4} strokeWidth="2.5"/>)}
    <text x="244" y="96" textAnchor="middle" fontSize="11" fill={S.s} {...T}>Regn</text>
    {/* Snø */}
    <ellipse cx="52" cy="178" rx="26" ry="14" strokeWidth="2.5"/>
    <circle cx="40" cy="170" r="12" strokeWidth="2"/><circle cx="62" cy="166" r="14" strokeWidth="2"/>
    {[38,52,66,45,59].map((x,i)=>{
      const y=190+i%2*4;
      return <g key={i}><line x1={x} y1={y} x2={x} y2={y+8} strokeWidth="2"/><line x1={x-4} y1={y+2} x2={x+4} y2={y+6} strokeWidth="1.5"/><line x1={x+4} y1={y+2} x2={x-4} y2={y+6} strokeWidth="1.5"/></g>;
    })}
    <text x="52" y="222" textAnchor="middle" fontSize="11" fill={S.s} {...T}>Snø</text>
    {/* Torden */}
    <ellipse cx="148" cy="170" rx="32" ry="18" strokeWidth="2.5"/>
    <circle cx="132" cy="162" r="16" strokeWidth="2"/><circle cx="160" cy="158" r="18" strokeWidth="2"/>
    <path d="M148 188 L140 210 L150 208 L142 228" fill="none" strokeWidth="3"/>
    <text x="148" y="240" textAnchor="middle" fontSize="11" fill={S.s} {...T}>Torden</text>
    {/* Vind */}
    {[0,1,2].map(i=><path key={i} d={`M208 ${164+i*16} Q232 ${156+i*16} 256 ${164+i*16} Q268 ${158+i*16} 270 ${168+i*16}`} fill="none" strokeWidth={3-i*0.5}/>)}
    <text x="244" y="222" textAnchor="middle" fontSize="11" fill={S.s} {...T}>Vind</text>
  </svg>
);

// ═══ ARF: Antall, rom og form ═════════════════════════════════════════════════

const SvgFormhus = ()=>(
  <svg viewBox="0 0 300 280" fill={S.f} stroke={S.s} strokeWidth={S.sw} strokeLinecap={S.sc} strokeLinejoin={S.sj}>
    {/* House */}
    <rect x="80" y="130" width="140" height="110" rx="4" strokeWidth="3"/>
    <polygon points="68,130 150,50 232,130" strokeWidth="3"/>
    {/* Door */}
    <rect x="126" y="185" width="48" height="55" rx="8" strokeWidth="2.5"/>
    <circle cx="168" cy="212" r="4" fill={S.s} stroke="none"/>
    {/* Windows */}
    <rect x="92" y="150" width="36" height="36" rx="4" strokeWidth="2.5"/>
    <line x1="110" y1="150" x2="110" y2="186" strokeWidth="1.5"/><line x1="92" y1="168" x2="128" y2="168" strokeWidth="1.5"/>
    <rect x="172" y="150" width="36" height="36" rx="4" strokeWidth="2.5"/>
    <line x1="190" y1="150" x2="190" y2="186" strokeWidth="1.5"/><line x1="172" y1="168" x2="208" y2="168" strokeWidth="1.5"/>
    {/* Sun */}
    <circle cx="252" cy="52" r="24" strokeWidth="2.5"/>
    {[0,45,90,135,180,225,270,315].map((a,i)=><line key={i} x1={252+28*Math.cos(a*Math.PI/180)} y1={52+28*Math.sin(a*Math.PI/180)} x2={252+36*Math.cos(a*Math.PI/180)} y2={52+36*Math.sin(a*Math.PI/180)} strokeWidth="2"/>)}
    {/* Tree */}
    <circle cx="38" cy="105" r="40" strokeWidth="2.5"/>
    <rect x="30" y="140" width="16" height="30" rx="4" strokeWidth="2.5"/>
    {/* Ground */}
    <line x1="8" y1="242" x2="292" y2="242" strokeWidth="3"/>
    {/* Shape labels */}
    <text x="150" y="264" textAnchor="middle" fontSize="10" fill={S.s} {...T}>Finn: ▭ rektangel  △ trekant  □ kvadrat  ○ sirkel</text>
  </svg>
);

const SvgTellerekke = ()=>(
  <svg viewBox="0 0 300 280" fill={S.f} stroke={S.s} strokeWidth={S.sw} strokeLinecap={S.sc} strokeLinejoin={S.sj}>
    {/* 2 rows of 5 boxes, each with a number and dots to draw */}
    {[1,2,3,4,5,6,7,8,9,10].map(n=>{
      const col=(n-1)%5, row=Math.floor((n-1)/5);
      const bx=8+col*58, by=12+row*128;
      const dots=[];
      for(let i=0;i<n&&i<6;i++){
        const dx=bx+14+(i%3)*16, dy=by+20+Math.floor(i/3)*16;
        dots.push(<circle key={i} cx={dx} cy={dy} r="5" strokeWidth="2"/>);
      }
      if(n>6) dots.push(<text key="more" x={bx+40} y={by+55} fontSize="10" fill={S.s} {...T}>+{n-6}</text>);
      return (
        <g key={n}>
          <rect x={bx} y={by} width="52" height="96" rx="8" strokeWidth="2.5"/>
          <text x={bx+26} y={by+14} textAnchor="middle" fontSize="14" fill={S.s} {...T} fontWeight="bold">{n}</text>
          <line x1={bx+4} y1={by+22} x2={bx+48} y2={by+22} strokeWidth="1.5"/>
          {dots}
          <rect x={bx+6} y={by+70} width="40" height="18" rx="4" strokeDasharray="4 3" strokeWidth="1.5"/>
          <text x={bx+26} y={by+82} textAnchor="middle" fontSize="8" fill={S.s} {...T}>skriv</text>
        </g>
      );
    })}
    <text x="150" y="272" textAnchor="middle" fontSize="10" fill={S.s} {...T}>Tell prikkene og skriv tallet i ruten!</text>
  </svg>
);

const SvgStorLiten = ()=>(
  <svg viewBox="0 0 300 280" fill={S.f} stroke={S.s} strokeWidth={S.sw} strokeLinecap={S.sc} strokeLinejoin={S.sj}>
    {/* Ground line */}
    <line x1="14" y1="238" x2="286" y2="238" strokeWidth="2.5"/>
    {/* STOR bjørn (left) */}
    <circle cx="72" cy="118" r="58"/>
    <circle cx="48" cy="68" r="24"/><circle cx="96" cy="68" r="24"/>
    <circle cx="56" cy="112" r="8" fill={S.s} stroke="none"/><circle cx="88" cy="112" r="8" fill={S.s} stroke="none"/>
    <ellipse cx="72" cy="130" rx="10" ry="8"/>
    <ellipse cx="36" cy="202" rx="20" ry="14"/><ellipse cx="108" cy="202" rx="20" ry="14"/>
    <text x="72" y="258" textAnchor="middle" fontSize="13" fill={S.s} {...T} fontWeight="bold">Stor</text>
    {/* MIDDELS bjørn (center) */}
    <circle cx="168" cy="158" r="38"/>
    <circle cx="152" cy="126" r="16"/><circle cx="184" cy="126" r="16"/>
    <circle cx="158" cy="154" r="5" fill={S.s} stroke="none"/><circle cx="178" cy="154" r="5" fill={S.s} stroke="none"/>
    <ellipse cx="168" cy="166" rx="6" ry="5"/>
    <ellipse cx="148" cy="214" rx="14" ry="10"/><ellipse cx="188" cy="214" rx="14" ry="10"/>
    <text x="168" y="258" textAnchor="middle" fontSize="13" fill={S.s} {...T} fontWeight="bold">Middels</text>
    {/* LITEN bjørn (right) */}
    <circle cx="256" cy="204" r="24"/>
    <circle cx="244" cy="184" r="10"/><circle cx="268" cy="184" r="10"/>
    <circle cx="248" cy="200" r="3" fill={S.s} stroke="none"/><circle cx="264" cy="200" r="3" fill={S.s} stroke="none"/>
    <ellipse cx="256" cy="210" rx="4" ry="3"/>
    <ellipse cx="244" cy="230" rx="9" ry="6"/><ellipse cx="268" cy="230" rx="9" ry="6"/>
    <text x="256" y="258" textAnchor="middle" fontSize="13" fill={S.s} {...T} fontWeight="bold">Liten</text>
  </svg>
);

// ═══ ERF: Etikk, religion og filosofi ════════════════════════════════════════

const SvgFolelseshjerte = ()=>(
  <svg viewBox="0 0 300 280" fill={S.f} stroke={S.s} strokeWidth={S.sw} strokeLinecap={S.sc} strokeLinejoin={S.sj}>
    {/* Large heart */}
    <path d="M150 240 Q60 190 30 130 Q10 80 50 52 Q80 30 110 40 Q130 48 150 68 Q170 48 190 40 Q220 30 250 52 Q290 80 270 130 Q240 190 150 240Z" strokeWidth="4"/>
    {/* Dividing lines into 4 quadrants */}
    <line x1="150" y1="68" x2="150" y2="235" strokeWidth="2" strokeDasharray="6 3"/>
    <line x1="56" y1="148" x2="244" y2="148" strokeWidth="2" strokeDasharray="6 3"/>
    {/* Quadrant labels */}
    <text x="96" y="108" textAnchor="middle" fontSize="10" fill={S.s} {...T} fontWeight="bold">Jeg er glad for...</text>
    <text x="204" y="108" textAnchor="middle" fontSize="10" fill={S.s} {...T} fontWeight="bold">Jeg er glad i...</text>
    <text x="96" y="195" textAnchor="middle" fontSize="10" fill={S.s} {...T} fontWeight="bold">Jeg er redd for...</text>
    <text x="204" y="195" textAnchor="middle" fontSize="10" fill={S.s} {...T} fontWeight="bold">Jeg drømmer om...</text>
    {/* Small happy face decoration */}
    <circle cx="150" cy="148" r="14" strokeWidth="2"/>
    <circle cx="145" cy="145" r="2.5" fill={S.s} stroke="none"/><circle cx="155" cy="145" r="2.5" fill={S.s} stroke="none"/>
    <path d="M144 153 Q150 158 156 153" fill="none" strokeWidth="2"/>
  </svg>
);

const SvgMangfold = ()=>(
  <svg viewBox="0 0 300 280" fill={S.f} stroke={S.s} strokeWidth={S.sw} strokeLinecap={S.sc} strokeLinejoin={S.sj}>
    {/* 4 child figures in a row, holding hands */}
    {[0,1,2,3].map(i=>{
      const cx = 38 + i*74;
      const headR = [16,18,15,17][i];
      const bodyH = [68,76,62,72][i];
      return (
        <g key={i}>
          {/* Head */}
          <circle cx={cx} cy={56} r={headR} strokeWidth="3"/>
          {/* Hair hints (different per child) */}
          {i===0 && <path d={`M${cx-headR} 48 Q${cx} ${40} ${cx+headR} 48`} fill="none" strokeWidth="2"/>}
          {i===1 && [0,1,2,3,4].map(j=><line key={j} x1={cx-headR+j*9} y1={56-headR} x2={cx-headR+j*9-2} y2={56-headR-12} strokeWidth="2"/>)}
          {i===2 && <path d={`M${cx-12} ${56-headR+4} Q${cx} ${56-headR-10} ${cx+12} ${56-headR+4}`} strokeWidth="2" fill="none"/>}
          {i===3 && <ellipse cx={cx} cy={56-headR+2} rx={headR+2} ry={8} strokeWidth="2"/>}
          {/* Eyes */}
          <circle cx={cx-5} cy={53} r="2.5" fill={S.s} stroke="none"/>
          <circle cx={cx+5} cy={53} r="2.5" fill={S.s} stroke="none"/>
          <path d={`M${cx-5} ${62} Q${cx} ${66} ${cx+5} ${62}`} fill="none" strokeWidth="2"/>
          {/* Body */}
          <rect x={cx-14} y={72+headR-16} width="28" height={bodyH} rx="10" strokeWidth="2.5"/>
          {/* Arms */}
          <line x1={cx-14} y1={88} x2={cx-32} y2={108} strokeWidth="2.5"/>
          <line x1={cx+14} y1={88} x2={cx+32} y2={108} strokeWidth="2.5"/>
          {/* Legs */}
          <line x1={cx-8} y1={72+headR-16+bodyH} x2={cx-12} y2={248} strokeWidth="2.5"/>
          <line x1={cx+8} y1={72+headR-16+bodyH} x2={cx+12} y2={248} strokeWidth="2.5"/>
          <ellipse cx={cx-12} cy={252} rx="12" ry="6" strokeWidth="2"/>
          <ellipse cx={cx+12} cy={252} rx="12" ry="6" strokeWidth="2"/>
        </g>
      );
    })}
    {/* Holding hands between figures */}
    <line x1="70" y1="108" x2="76" y2="108" strokeWidth="2.5"/>
    <line x1="144" y1="108" x2="150" y2="108" strokeWidth="2.5"/>
    <line x1="218" y1="108" x2="224" y2="108" strokeWidth="2.5"/>
    <text x="150" y="272" textAnchor="middle" fontSize="11" fill={S.s} {...T}>Farg alle ulikt – vi er alle forskjellige!</text>
  </svg>
);

const SvgHjelpeOmsorg = ()=>(
  <svg viewBox="0 0 300 280" fill={S.f} stroke={S.s} strokeWidth={S.sw} strokeLinecap={S.sc} strokeLinejoin={S.sj}>
    {/* Figure helping (left, bending) */}
    <circle cx="85" cy="52" r="26"/>
    <circle cx="76" cy="46" r="5" fill={S.s} stroke="none"/><circle cx="94" cy="46" r="5" fill={S.s} stroke="none"/>
    <path d="M75 62 Q85 68 95 62" fill="none" strokeWidth="2.5"/>
    <path d="M85 78 L82 150" strokeWidth="S.sw"/>
    <path d="M82 100 L46 130"/><path d="M82 100 L110 88"/>
    <path d="M50 130 L34 158"/><path d="M82 150 L68 195"/><path d="M82 150 L96 195"/>
    {/* Helping hand reaching toward fallen child */}
    <path d="M110 88 Q148 112 156 138" strokeWidth="3"/>
    <path d="M154 132 L162 140 L152 145" fill={S.s} stroke="none"/>
    {/* Figure on ground (right, fallen, receiving help) */}
    <circle cx="210" cy="175" r="24"/>
    <circle cx="200" cy="170" r="5" fill={S.s} stroke="none"/><circle cx="218" cy="170" r="5" fill={S.s} stroke="none"/>
    <path d="M200 183 Q210 189 220 183" fill="none" strokeWidth="2.5"/>
    <path d="M165 198 L255 198" strokeWidth="3"/>
    <path d="M186 198 L178 228"/><path d="M234 198 L242 228"/>
    {/* Ground */}
    <line x1="10" y1="248" x2="290" y2="248" strokeWidth="2.5"/>
    {/* Speech bubble from helper */}
    <path d="M58 18 Q58 8 68 8 L145 8 Q155 8 155 18 L155 50 Q155 60 145 60 L100 60 L92 72 L88 60 L68 60 Q58 60 58 50 Z" strokeWidth="2"/>
    <text x="107" y="30" textAnchor="middle" fontSize="10" fill={S.s} {...T}>"Er du ok?</text>
    <text x="107" y="46" textAnchor="middle" fontSize="10" fill={S.s} {...T}>Kan jeg hjelpe?"</text>
    <text x="150" y="270" textAnchor="middle" fontSize="11" fill={S.s} {...T}>Tegn hva du kan si når noen trenger hjelp.</text>
  </svg>
);

// ═══ NS: Nærmiljø og samfunn ═══════════════════════════════════════════════════

const SvgBarnehage = ()=>(
  <svg viewBox="0 0 300 280" fill={S.f} stroke={S.s} strokeWidth={S.sw} strokeLinecap={S.sc} strokeLinejoin={S.sj}>
    {/* Main building */}
    <rect x="40" y="120" width="220" height="120" rx="6" strokeWidth="3"/>
    {/* Roof */}
    <polygon points="28,120 150,40 272,120" strokeWidth="3"/>
    {/* Flagpole on roof */}
    <line x1="150" y1="40" x2="150" y2="8" strokeWidth="2.5"/>
    <rect x="150" y="8" width="28" height="18" rx="3" strokeWidth="2"/>
    {/* Main door */}
    <rect x="122" y="180" width="56" height="60" rx="10" strokeWidth="2.5"/>
    <circle cx="172" cy="210" r="5" fill={S.s} stroke="none"/>
    {/* Windows */}
    <rect x="56" y="138" width="48" height="46" rx="5" strokeWidth="2.5"/>
    <line x1="80" y1="138" x2="80" y2="184" strokeWidth="1.5"/><line x1="56" y1="161" x2="104" y2="161" strokeWidth="1.5"/>
    <rect x="196" y="138" width="48" height="46" rx="5" strokeWidth="2.5"/>
    <line x1="220" y1="138" x2="220" y2="184" strokeWidth="1.5"/><line x1="196" y1="161" x2="244" y2="161" strokeWidth="1.5"/>
    {/* Ground */}
    <line x1="8" y1="242" x2="292" y2="242" strokeWidth="2.5"/>
    {/* Sandbox (left) */}
    <ellipse cx="30" cy="252" rx="22" ry="10" strokeWidth="2"/>
    {/* Swing frame (right) */}
    <line x1="258" y1="180" x2="258" y2="244" strokeWidth="2"/><line x1="278" y1="180" x2="278" y2="244" strokeWidth="2"/><line x1="254" y1="180" x2="282" y2="180" strokeWidth="2"/>
    <path d="M261 180 L261 218 L275 218 L275 180" fill="none" strokeWidth="2"/>
    {/* Tree */}
    <rect x="4" y="195" width="12" height="50" rx="4" strokeWidth="2"/>
    <circle cx="10" cy="182" r="26" strokeWidth="2.5"/>
    <text x="150" y="266" textAnchor="middle" fontSize="11" fill={S.s} {...T}>Farg barnehagen. Tegn deg selv på lekeplassen!</text>
  </svg>
);

const SvgNabolagskart = ()=>(
  <svg viewBox="0 0 300 280" fill={S.f} stroke={S.s} strokeWidth={S.sw} strokeLinecap={S.sc} strokeLinejoin={S.sj}>
    {/* Road grid */}
    <rect x="6" y="6" width="288" height="264" rx="8" strokeWidth="2"/>
    <line x1="6" y1="96" x2="294" y2="96" strokeWidth="6" stroke="#c4d6ec"/>
    <line x1="6" y1="178" x2="294" y2="178" strokeWidth="6" stroke="#c4d6ec"/>
    <line x1="96" y1="6" x2="96" y2="270" strokeWidth="6" stroke="#c4d6ec"/>
    <line x1="200" y1="6" x2="200" y2="270" strokeWidth="6" stroke="#c4d6ec"/>
    {/* Road markings */}
    {[30,54,78,122,146,170,222,246,270].map(x=><line key={x} x1={x} y1={137} x2={x+14} y2={137} strokeWidth="2" stroke="#c4d6ec" strokeDasharray="10 6"/>)}
    {[30,54,78,122,146,170,222,246].map(y=><line key={y} x1={148} y1={y} x2={148} y2={y+14} strokeWidth="2" stroke="#c4d6ec" strokeDasharray="10 6"/>)}
    {/* HJEMMET (top-left block) */}
    <rect x="16" y="16" width="64" height="68" rx="6" strokeWidth="2.5"/>
    <polygon points="16,50 48,22 80,50" strokeWidth="2"/>
    <rect x="34" y="52" width="28" height="32" rx="4" strokeWidth="2"/>
    <text x="48" y="74" textAnchor="middle" fontSize="9" fill={S.s} {...T}>🏠 Hjem</text>
    {/* BUTIKK (top-right) */}
    <rect x="110" y="16" width="72" height="68" rx="6" strokeWidth="2.5"/>
    <text x="146" y="54" textAnchor="middle" fontSize="11" fill={S.s} {...T}>🏪</text>
    <text x="146" y="72" textAnchor="middle" fontSize="9" fill={S.s} {...T}>Butikk</text>
    {/* PARK (middle-left) */}
    <rect x="16" y="106" width="64" height="60" rx="6" strokeWidth="2.5"/>
    <circle cx="32" cy="126" r="12" strokeWidth="2"/><rect x="28" y="132" width="8" height="16" rx="2" strokeWidth="1.5"/>
    <circle cx="60" cy="126" r="10" strokeWidth="2"/><rect x="56" y="132" width="8" height="14" rx="2" strokeWidth="1.5"/>
    <text x="48" y="158" textAnchor="middle" fontSize="9" fill={S.s} {...T}>🌳 Park</text>
    {/* BARNEHAGEN (center, highlighted) */}
    <rect x="110" y="106" width="72" height="60" rx="6" strokeWidth="3.5"/>
    <polygon points="110,130 146,108 182,130" strokeWidth="2.5"/>
    <text x="146" y="148" textAnchor="middle" fontSize="9" fill={S.s} {...T} fontWeight="bold">🏫 Barnehage</text>
    {/* PATH from home to kindergarten (dotted route) */}
    <path d="M80 52 L96 52 L96 136 L110 136" fill="none" stroke={S.s} strokeWidth="2.5" strokeDasharray="8 4"/>
    <circle cx="80" cy="52" r="5" fill={S.s} stroke="none"/>
    {/* Empty blocks for kids to fill */}
    <rect x="210" y="16" width="74" height="68" rx="6" strokeDasharray="6 4" strokeWidth="2"/>
    <text x="247" y="54" textAnchor="middle" fontSize="10" fill={S.s} {...T}>Tegn</text>
    <text x="247" y="68" textAnchor="middle" fontSize="10" fill={S.s} {...T}>noe her!</text>
    <rect x="210" y="106" width="74" height="60" rx="6" strokeDasharray="6 4" strokeWidth="2"/>
    <rect x="16" y="188" width="278" height="72" rx="6" strokeDasharray="6 4" strokeWidth="2"/>
    <text x="150" y="228" textAnchor="middle" fontSize="11" fill={S.s} {...T}>Tegn inn veien fra ditt hjem til barnehagen!</text>
  </svg>
);

const SvgHjelperne = ()=>(
  <svg viewBox="0 0 300 280" fill={S.f} stroke={S.s} strokeWidth={S.sw} strokeLinecap={S.sc} strokeLinejoin={S.sj}>
    {/* BRANNMANN (left) */}
    <circle cx="50" cy="44" r="22"/>
    {/* Helmet */}
    <path d="M28 44 Q28 20 50 20 Q72 20 72 44" strokeWidth="3"/>
    <path d="M22 44 L78 44" strokeWidth="3"/>
    <rect x="38" y="20" width="24" height="8" rx="3" strokeWidth="2"/>
    <circle cx="41" cy="40" r="4" fill={S.s} stroke="none"/><circle cx="59" cy="40" r="4" fill={S.s} stroke="none"/>
    <rect x="32" y="66" width="36" height="72" rx="8" strokeWidth="2.5"/>
    {/* Badge */}
    <path d="M42 82 L50 76 L58 82 L56 92 L50 96 L44 92 Z" strokeWidth="1.5"/>
    <path d="M32 82 L10 96"/><path d="M68 82 L90 96"/>
    <line x1="38" y1="138" x2="34" y2="200"/><line x1="62" y1="138" x2="66" y2="200"/>
    {/* Firehose */}
    <path d="M90 96 Q112 96 118 114 Q124 132 108 140" fill="none" strokeWidth="3.5"/>
    <circle cx="104" cy="144" r="6" strokeWidth="2"/>
    <path d="M102 138 L96 126 L110 126 Z" strokeWidth="2"/>
    <text x="50" y="225" textAnchor="middle" fontSize="10" fill={S.s} {...T} fontWeight="bold">Brannmann</text>
    <text x="50" y="240" textAnchor="middle" fontSize="9" fill={S.s} {...T}>slukker branner</text>
    {/* LEGE/SYKEPLEIER (center) */}
    <circle cx="150" cy="44" r="22"/>
    <circle cx="141" cy="40" r="4" fill={S.s} stroke="none"/><circle cx="159" cy="40" r="4" fill={S.s} stroke="none"/>
    <path d="M140 54 Q150 60 160 54" fill="none" strokeWidth="2.5"/>
    <rect x="132" y="66" width="36" height="72" rx="8" strokeWidth="2.5"/>
    {/* White coat cross */}
    <line x1="150" y1="76" x2="150" y2="96" strokeWidth="3"/><line x1="140" y1="86" x2="160" y2="86" strokeWidth="3"/>
    <path d="M132 82 L110 96"/><path d="M168 82 L190 96"/>
    <line x1="138" y1="138" x2="134" y2="200"/><line x1="162" y1="138" x2="166" y2="200"/>
    {/* Stethoscope */}
    <path d="M110 96 Q96 110 100 130 Q104 148 118 148" fill="none" strokeWidth="2.5"/>
    <circle cx="120" cy="150" r="8" strokeWidth="2.5"/>
    <text x="150" y="225" textAnchor="middle" fontSize="10" fill={S.s} {...T} fontWeight="bold">Lege</text>
    <text x="150" y="240" textAnchor="middle" fontSize="9" fill={S.s} {...T}>hjelper syke</text>
    {/* BONDE (right) */}
    <circle cx="250" cy="44" r="22"/>
    {/* Hat */}
    <path d="M228 38 L272 38 L265 18 L235 18 Z" strokeWidth="2.5"/>
    <line x1="224" y1="38" x2="276" y2="38" strokeWidth="2.5"/>
    <circle cx="241" cy="40" r="4" fill={S.s} stroke="none"/><circle cx="259" cy="40" r="4" fill={S.s} stroke="none"/>
    <rect x="232" y="66" width="36" height="72" rx="8" strokeWidth="2.5"/>
    <path d="M232 82 L210 96"/><path d="M268 82 L290 96"/>
    <line x1="238" y1="138" x2="234" y2="200"/><line x1="262" y1="138" x2="266" y2="200"/>
    {/* Pitchfork */}
    <line x1="290" y1="60" x2="284" y2="160" strokeWidth="3"/>
    <line x1="286" y1="60" x2="286" y2="82" strokeWidth="2.5"/><line x1="290" y1="60" x2="290" y2="82" strokeWidth="2.5"/><line x1="294" y1="60" x2="294" y2="82" strokeWidth="2.5"/>
    <line x1="284" y1="82" x2="296" y2="82" strokeWidth="2.5"/>
    <text x="250" y="225" textAnchor="middle" fontSize="10" fill={S.s} {...T} fontWeight="bold">Bonde</text>
    <text x="250" y="240" textAnchor="middle" fontSize="9" fill={S.s} {...T}>dyrker mat</text>
    {/* Ground line */}
    <line x1="8" y1="204" x2="292" y2="204" strokeWidth="2"/>
    <text x="150" y="266" textAnchor="middle" fontSize="11" fill={S.s} {...T}>Farg klærne og tegn hva de hjelper med!</text>
  </svg>
);

// ═══════════════════════════════════════════
//  SVG OVERRIDE-REGISTRY (for fremtidige forbedringer)
// ═══════════════════════════════════════════
const SVG_OVERRIDES = {};
function hentSvg(navn, OriginalKomponent) {
  if (SVG_OVERRIDES[navn]) { const O=SVG_OVERRIDES[navn]; return <O/>; }
  return <OriginalKomponent/>;
}

// ═══════════════════════════════════════════
//  TEGNEARK ARRAY – 21 oppgaver, 3 per fagområde
// ═══════════════════════════════════════════
export const TEGNEARK = [
  // ── KST: Kommunikasjon, språk og tekst ──────────────────────────────
  {id:1,tittel:"Fortell med tre bilder",ikon:"📖",kategori:"kst",alder:"3-6 år",rammeplan:["kst"],
   svg:<SvgFortellerrekke/>,
   oppgave:"1. Tegn begynnelsen av historien i rute 1. 2. Tegn hva som skjer i midten i rute 2. 3. Tegn slutten i rute 3. 4. Fortell historien din høyt til en venn.",
   samtale:"Hva skjer i din historie? Hvem er med? Hva er problemet, og hvordan løses det?",
   mal:"Narrativ kompetanse og sekvensforståelse. Rammeplanen KST: kommunisere gjennom fortelling, uttrykke tanker og erfaringer via tegning."},
  {id:2,tittel:"Hva vil du si?",ikon:"💬",kategori:"kst",alder:"2-6 år",rammeplan:["kst"],
   svg:<SvgSnakkebobler/>,
   oppgave:"1. Farg de to barnefigurene ulikt. 2. Tegn i den ene snakkeboblen hva det ene barnet sier. 3. Tegn i den andre boblen svaret. 4. Skriv eller dikter et ord i hver boble.",
   samtale:"Hva er en god måte å starte en samtale på? Hva er forskjellen på å snakke og å lytte?",
   mal:"Dialog og kommunikasjonsforståelse. Rammeplanen KST: bruke språk aktivt, delta i samtaler og forstå kommunikasjonens toveis natur."},
  {id:3,tittel:"Bokstaver og dyr",ikon:"🔤",kategori:"kst",alder:"3-6 år",rammeplan:["kst"],
   svg:<SvgBokstavdyr/>,
   oppgave:"1. Farg dyret som begynner på B (Bjørn). 2. Farg dyret som begynner på K (Katt). 3. Farg dyret som begynner på E (Elg). 4. Farg dyret som begynner på H (Hund). 5. Skriv bokstaven under hvert dyr.",
   samtale:"Hvilken bokstav begynner navnet ditt på? Hvilke andre ord kjenner du som begynner med B? E? K?",
   mal:"Bokstav-lyd-forbindelser og begynnende leseforberedelse. Rammeplanen KST: utforske skriftspråk, gjenkjenne bokstaver og forbinde lyd med symbol."},

  // ── KBMH: Kropp, bevegelse, mat og helse ────────────────────────────
  {id:4,tittel:"Kroppen min",ikon:"🏃",kategori:"kbmh",alder:"2-6 år",rammeplan:["kbmh"],
   svg:<SvgKroppenMin/>,
   oppgave:"1. Farg kroppen din favorittfarger. 2. Tegn hår og ansikt. 3. Pek på og si hva disse kroppsdeler heter: hode, skulder, knær og tær. 4. Skriv (eller dikter) ett ord for en kroppsdel på linjene.",
   samtale:"Hva bruker vi armene til? Hva bruker vi bena til? Hva er det viktigste organet inne i kroppen?",
   mal:"Kroppskunnskap og selvbilde. Rammeplanen KBMH: utvikle kunnskap om kroppen, styrke positiv kroppsfølelse og identitet."},
  {id:5,tittel:"Det sunne matfatet",ikon:"🥗",kategori:"kbmh",alder:"3-6 år",rammeplan:["kbmh"],
   svg:<SvgMatfat/>,
   oppgave:"1. Farg grønnsaken i venstre øvre felt grønn. 2. Farg frukten i høyre øvre felt din favorittfarge. 3. Farg brødet i nedre venstre felt gyldenbrun. 4. Farg fisken i nedre høyre felt sølv. 5. Hva er din favorittmat?",
   samtale:"Hvorfor trenger kroppen vår ulik mat? Hva gir oss energi? Hva er vitaminer?",
   mal:"Kosthold og ernæringsforståelse. Rammeplanen KBMH: lære om sunn mat, forstå sammenhengen mellom mat og helse."},
  {id:6,tittel:"Bevegelsene mine",ikon:"💪",kategori:"kbmh",alder:"2-5 år",rammeplan:["kbmh"],
   svg:<SvgBevegelse/>,
   oppgave:"1. Farg figuren som hopper i rødt. 2. Farg figuren som løper i blått. 3. Farg figuren som strekker seg i grønt. 4. Tegn din favorittbevegelse i feltet nederst.",
   samtale:"Hva skjer med hjertet ditt når du hopper? Hvilke bevegelser kan du gjøre? Hva er din favorittlek ute?",
   mal:"Motorisk bevissthet og glede ved fysisk aktivitet. Rammeplanen KBMH: oppleve mestring gjennom varierte bevegelser, styrke grovmotorikk."},

  // ── KKK: Kunst, kultur og kreativitet ───────────────────────────────
  {id:7,tittel:"Selvportrettet",ikon:"🎨",kategori:"kkk",alder:"3-6 år",rammeplan:["kkk"],
   svg:<SvgSelvportrett/>,
   oppgave:"1. Tegn ansiktet ditt inne i speilet – hår, øyne, nese og munn. 2. Legg til detaljer: øredobber, briller, fregner? 3. Farg rammen rundt speilet i favoritfargene dine. 4. Hva er det spesielle med akkurat ditt ansikt?",
   samtale:"Hva ser du når du ser deg i speilet? Hva er likt mellom deg og vennene dine? Hva er forskjellig?",
   mal:"Selvbilde og kunstnerisk selvuttrykk. Rammeplanen KKK: uttrykke seg gjennom billedkunst, utvikle identitet og kreativ kompetanse."},
  {id:8,tittel:"Mønsterbåndet",ikon:"🔷",kategori:"kkk",alder:"2-6 år",rammeplan:["kkk"],
   svg:<SvgMonsterbred/>,
   oppgave:"1. Se på mønsteret i de tre første rutene: sirkel, firkant, trekant. 2. Fortsett mønsteret i rad 1 og 2. 3. Lag ditt eget mønster i rad 3. 4. Lag et enda mer avansert mønster i rad 4.",
   samtale:"Hva er et mønster? Finnes det mønstre i naturen? Hva er din favorittform?",
   mal:"Mønster, rekkefølge og kreativt design. Rammeplanen KKK og ARF: oppdage og skape mønstre, utforske former og komposisjon."},
  {id:9,tittel:"Fargenes verden",ikon:"🌈",kategori:"kkk",alder:"2-6 år",rammeplan:["kkk"],
   svg:<SvgFargesirkel/>,
   oppgave:"1. Farg det øverste feltet rødt. 2. Beveg deg rundt: oransje, gul, grønn, blå, lilla. 3. Farg midtsirkelen med alle fargene blandet. 4. Hvilke to farger lager grønn? Hvilke lager lilla?",
   samtale:"Hva er dine tre favorittfarger? Hvilke farger ser du ute i naturen? Hva kalles de tre grunfargene?",
   mal:"Fargeforståelse og fargeteori. Rammeplanen KKK: utforske farger, eksperimentere med blanding og estetisk uttrykk."},

  // ── NMT: Natur, miljø og teknologi ──────────────────────────────────
  {id:10,tittel:"Treet gjennom året",ikon:"🌳",kategori:"nmt",alder:"3-6 år",rammeplan:["nmt"],
   svg:<SvgArstidtre/>,
   oppgave:"1. Farg vår-treet med lyse grønne knopper. 2. Farg sommer-treet med mørk grønn krone. 3. Farg høst-treet med røde, gule og oransje blader. 4. Tegn snø på vinter-treet.",
   samtale:"Hva skjer med bladene om høsten og hvorfor? Hva er klorofyll? Hva er den korteste dagen i året?",
   mal:"Årstidenes kretsløp og plantenes biologi. Rammeplanen NMT: observere og forstå forandringer i naturen knyttet til årstider."},
  {id:11,tittel:"Sommerfuglens reise",ikon:"🦋",kategori:"nmt",alder:"3-6 år",rammeplan:["nmt"],
   svg:<SvgLivssyklus/>,
   oppgave:"1. Farg egget lite og ovalt (gult). 2. Farg larven grønn med mørke striper. 3. Farg puppen brun og kokonglignende. 4. Farg sommerfuglen i det vakreste mønsteret du kan lage!",
   samtale:"Hva er en metamorfose? Hvilke fire stadier har en sommerfugl? Hva spiser en larve? En voksen sommerfugl?",
   mal:"Biologiske livssykluser og forvandling. Rammeplanen NMT: forstå livsprosesser, vekst og forandring i naturen."},
  {id:12,tittel:"Værmeldingen min",ikon:"🌤️",kategori:"nmt",alder:"2-6 år",rammeplan:["nmt"],
   svg:<SvgVaerkart/>,
   oppgave:"1. Farg solen gul og strålar oransje. 2. Farg skyen grå. 3. Farg regndråpene blå. 4. Farg snøflakene lyseblå. 5. Tegn lyn i tordensymbolet. 6. Skriv hva slags vær det er i dag.",
   samtale:"Hva slags vær er det i dag? Hva bruker vi barometer til? Hva er forskjellen mellom vær og klima?",
   mal:"Meteorologi og naturobservasjon. Rammeplanen NMT: observere, beskrive og dokumentere vær og naturfenomener."},

  // ── ARF: Antall, rom og form ─────────────────────────────────────────
  {id:13,tittel:"Former i bildet",ikon:"🔺",kategori:"arf",alder:"2-6 år",rammeplan:["arf"],
   svg:<SvgFormhus/>,
   oppgave:"1. Farg alle sirklene (sol og trekrone) gule og grønne. 2. Farg alle trekantene (tak) røde. 3. Farg alle rektanglene (vegger, dør) blå. 4. Farg kvadratene (vinduer) lilla. 5. Tell: hvor mange av hver form?",
   samtale:"Hva er forskjellen på en sirkel og en oval? Hva er et rektangel? Kan du finne former rundt deg i rommet?",
   mal:"Geometriske former og romlig bevissthet. Rammeplanen ARF: oppdage og navngi former, utforske geometri i hverdagssituasjoner."},
  {id:14,tittel:"Tell til ti",ikon:"🔢",kategori:"arf",alder:"2-6 år",rammeplan:["arf"],
   svg:<SvgTellerekke/>,
   oppgave:"1. Tell prikkene i hver rute høyt. 2. Farg prikkene i riktig antall. 3. Skriv tallet i den stiplede ruten under. 4. Tegn riktig antall blomster i rute 5 og 10.",
   samtale:"Hva kommer etter 5? Hva er tallet før 8? Kan du telle baklengs fra 10?",
   mal:"Tallforståelse og en-til-en-korrespondanse. Rammeplanen ARF: telle, forstå tall som mengde, bruke tallrekken."},
  {id:15,tittel:"Stor, middels og liten",ikon:"📐",kategori:"arf",alder:"2-5 år",rammeplan:["arf"],
   svg:<SvgStorLiten/>,
   oppgave:"1. Farg den store bjørnen mørk brun. 2. Farg den mellomstore bjørnen lysbrun. 3. Farg den lille bjørnen honninggul. 4. Tegn en enda mindre bjørn til høyre for den lille!",
   samtale:"Hvilken bjørn er størst? Hvilken er minst? Hva er du større enn? Hva er du mindre enn?",
   mal:"Størrelse, sammenligning og matematisk språk. Rammeplanen ARF: sammenligne størrelser, bruke begreper som stor/liten/større/mindre."},

  // ── ERF: Etikk, religion og filosofi ────────────────────────────────
  {id:16,tittel:"Hva gjør meg glad?",ikon:"💛",kategori:"erf",alder:"2-6 år",rammeplan:["erf"],
   svg:<SvgFolelseshjerte/>,
   oppgave:"1. I øverste venstre del: tegn noe du er glad for i dag. 2. I øverste høyre del: tegn noen du er glad i. 3. I nedre venstre del: tegn noe du er redd for. 4. I nedre høyre del: tegn noe du drømmer om.",
   samtale:"Hva er en følelse? Kan to personer kjenne ulikt om det samme? Er det lov å være redd?",
   mal:"Emosjonell kompetanse og selvrefleksjon. Rammeplanen ERF: sette ord på og forstå egne følelser, utvikle emosjonell intelligens."},
  {id:17,tittel:"Vi er alle forskjellige",ikon:"👫",kategori:"erf",alder:"2-6 år",rammeplan:["erf"],
   svg:<SvgMangfold/>,
   oppgave:"1. Farg hvert barn med ulik hudfarge. 2. Tegn ulikt hår: krøllete, rett, kort, langt. 3. Gi dem ulike klær og farger. 4. Tegn et smil på alle – alle er like mye verdt!",
   samtale:"Hva er likt mellom alle barn? Hva er forskjellig? Hva er det fine med at vi er forskjellige?",
   mal:"Mangfold, inkludering og likeverd. Rammeplanen ERF: respektere ulikhet, forstå at alle mennesker har lik verdi uansett bakgrunn."},
  {id:18,tittel:"Hjelp og omsorg",ikon:"🤝",kategori:"erf",alder:"2-6 år",rammeplan:["erf"],
   svg:<SvgHjelpeOmsorg/>,
   oppgave:"1. Farg det ene barnet i blå klær. 2. Farg det andre barnet i røde klær. 3. Tegn hva barnet sier i snakkeboblen (ord eller bilde). 4. Tegn tre ting du kan gjøre for å hjelpe noen.",
   samtale:"Har du noen gang hjulpet noen? Hva skjedde? Hva er empati? Hva gjør det med deg å hjelpe andre?",
   mal:"Empati, omsorg og etisk handling. Rammeplanen ERF: forstå andres behov, utvikle evne til innlevelse og praktisk omsorg."},

  // ── NS: Nærmiljø og samfunn ──────────────────────────────────────────
  {id:19,tittel:"Barnehagen min",ikon:"🏫",kategori:"ns",alder:"2-6 år",rammeplan:["ns"],
   svg:<SvgBarnehage/>,
   oppgave:"1. Farg bygningen i barnehagens virkelige farger. 2. Farg flagget rødt, hvitt og blått. 3. Tegn deg selv på lekeplassen. 4. Tegn en venn ved siden av deg.",
   samtale:"Hva er det beste med barnehagen? Hva lærer du her? Hvem jobber i barnehagen og hva gjør de?",
   mal:"Tilhørighet og lokalsamfunn. Rammeplanen NS: kjenne seg hjemme i barnehagen, forstå barnehagens funksjon og fellesskap."},
  {id:20,tittel:"Kart over nabolaget",ikon:"🗺️",kategori:"ns",alder:"3-6 år",rammeplan:["ns"],
   svg:<SvgNabolagskart/>,
   oppgave:"1. Farg barnehagen (midten) i gult. 2. Farg hjemmet (øvre venstre) i rødt. 3. Farg parken (venstre midtre) grønn. 4. Tegn den stiplede veien fra hjem til barnehage med en finger. 5. Hva vil du tegne i de tomme feltene?",
   samtale:"Hva er et kart? Hva betyr det å orientere seg? Hvilken vei går du til barnehagen?",
   mal:"Stedskjennskap og romlig orientering. Rammeplanen NS: orientere seg i nærmiljøet, forstå kart som representasjon av virkeligheten."},
  {id:21,tittel:"Hjelperne i samfunnet",ikon:"👷",kategori:"ns",alder:"3-6 år",rammeplan:["ns"],
   svg:<SvgHjelperne/>,
   oppgave:"1. Farg brannmannens hjelm rød og uniform gul. 2. Farg legens frakk hvit med rød kors. 3. Farg bondens hatt brun og klær grønne. 4. Tegn et verktøy eller symbol for yrket under hver figur.",
   samtale:"Hva gjør en brannmann? En lege? En bonde? Hvem andre hjelper i samfunnet? Hva vil du bli?",
   mal:"Samfunnsforståelse og yrkesroller. Rammeplanen NS: lære om ulike yrker, forstå at samfunnet er avhengig av mange yrkesgrupper."},
];

export const TEGNEKAT = [
  ["alle","Alle 🖍️"],
  ["kst","Språk & tekst 📖"],
  ["kbmh","Kropp & helse 🏃"],
  ["kkk","Kunst & kultur 🎨"],
  ["nmt","Natur & teknologi 🌿"],
  ["arf","Antall & form 🔢"],
  ["erf","Etikk & filosofi 💛"],
  ["ns","Nærmiljø & samfunn 🏘️"],
];

export const SvgPlaceholder = ()=>(
  <svg viewBox="0 0 300 240" fill="none">
    <rect x="12" y="12" width="276" height="216" rx="16" stroke="#c4d6ec" strokeWidth="2.5" strokeDasharray="10 5"/>
    <circle cx="90" cy="90" r="32" stroke="#d8e8f5" strokeWidth="2.5"/>
    <circle cx="98" cy="83" r="8" fill="#d8e8f5"/>
    <path d="M70 112 Q90 126 110 112" stroke="#d8e8f5" strokeWidth="2.5" fill="none"/>
    <circle cx="200" cy="90" r="32" stroke="#d8e8f5" strokeWidth="2.5"/>
    <path d="M188 78 Q200 72 212 78" stroke="#d8e8f5" strokeWidth="2" fill="none"/>
    <rect x="184" y="86" width="32" height="20" rx="5" stroke="#d8e8f5" strokeWidth="2"/>
    <path d="M80 160 L140 130 L220 160" stroke="#d8e8f5" strokeWidth="2" fill="none"/>
    <path d="M150 186 Q150 174 162 174 L222 174 Q234 174 234 186 L234 210 Q234 222 222 222 L162 222 Q150 222 150 210 Z" stroke="#d8e8f5" strokeWidth="2"/>
  </svg>
);
