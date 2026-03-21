import React from 'react';

const Compras = ({ valves }) => {
  const sup = {};
  valves.forEach(v => {
    if (!v.kit || v.kit === 'nan') return;
    const b = (v.marca || '').trim().replace('GUTH  VENTILE', 'Guth Ventile');
    if (!sup[b]) sup[b] = { kits: {} };
    if (!sup[b].kits[v.kit]) sup[b].kits[v.kit] = { count: 0, dns: new Set() };
    sup[b].kits[v.kit].count++;
    if (v.dn) sup[b].kits[v.kit].dns.add(v.dn);
  });

  const contacts = {
    'Guth Ventile': 'info@guth-vt.de',
    'GEA': 'via gea.com/es/contact',
    'ALFA LAVAL': 'via alfalaval.es',
    'DEFINOX': 'via definox.fr',
    'INOXPA': 'via inoxpa.com/es'
  };

  const sorted = Object.entries(sup).sort((a, b) => 
    Object.values(b[1].kits).reduce((s, x) => s + x.count, 0) - 
    Object.values(a[1].kits).reduce((s, x) => s + x.count, 0)
  );

  const copyEmail = (brand, email, kits) => {
    const lines = kits.map(k => '  → ' + k).join('\n');
    const txt = `Para: ${email}\nAssunto: Cotação Kits de Reparo — Manutenção Preventiva 2026\n\nPrezados,\n\nSomos uma empresa do setor lácteo e utilizamos equipamentos ${brand}.\nSolicitamos cotação de seal kits para manutenção preventiva semestral 2026:\n\n${lines}\n\nPedimos:\n- Preço unitário e por lote\n- Prazo de entrega para Espanha\n- Material EPDM food-grade\n\nAtenciosamente,\n[NOME] — [EMPRESA] — [TELEFONE]`;
    navigator.clipboard.writeText(txt).then(() => alert('📧 E-mail copiado!'));
  };

  return (
    <div id="sc-compras" className="sc on" style={{ paddingBottom: '110px' }}>
      <div className="info">Kits agrupados por fabricante. Toque em <strong>Copiar e-mail</strong> para enviar ao fornecedor.</div>
      <div id="plist">
        {sorted.map(([brand, data]) => {
          const kits = Object.entries(data.kits).sort((a, b) => b[1].count - a[1].count);
          const tv = kits.reduce((s, [, k]) => s + k.count, 0);
          const ct = contacts[brand] || 'pesquisar contato';
          return (
            <div key={brand} className="scc">
              <div className="scn">{brand}</div>
              <div className="scm">{tv} válvulas · {kits.length} refs · 📧 {ct}</div>
              <div>
                {kits.slice(0, 10).map(([ref, info]) => (
                  <div key={ref} className="kr">
                    <div>
                      <div className="kc">{ref}</div>
                      <div className="ki">{[...info.dns].join(' / ') || '—'} · {info.count} válv.</div>
                    </div>
                    <span className="kq">×{info.count}</span>
                  </div>
                ))}
                {kits.length > 10 && (
                  <div style={{ fontSize: '.68rem', color: 'var(--mut)', padding: '6px 0', fontFamily: "'Share Tech Mono'" }}>
                    +{kits.length - 10} referências adicionais...
                  </div>
                )}
              </div>
              <button 
                className="btn btn-cy" 
                onClick={() => copyEmail(brand, ct, kits.slice(0, 15).map(([r, i]) => `${r} (${[...i.dns].join('/')}) x${i.count}`))}
                style={{ marginTop: '10px', fontSize: '.78rem', padding: '11px' }}
              >
                📧 Copiar e-mail para {brand}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Compras;
