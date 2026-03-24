import React, { useMemo, useState } from 'react';
import { useLang } from '../i18n/LangContext';

const Compras = ({ valves, user, stock = [], setStock, restockRequests = [] }) => {
  const { t } = useLang(); // kept for future i18n additions
  const canManageStock = user?.role === 'admin' || user?.role === 'compras' || user?.role === 'chefe';
  const canPurchase = user?.role === 'admin' || user?.role === 'compras' || user?.role === 'chefe';
  const [newItem, setNewItem] = useState({
    ref: '',
    brand: '',
    quantity: '',
    minQuantity: '1'
  });
  const [valveSearch, setValveSearch] = useState('');
  const [cart, setCart] = useState(() => {
    if (typeof window === 'undefined') return {};
    const saved = localStorage.getItem('mp_purchase_cart');
    return saved ? JSON.parse(saved) : {};
  });

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

  const defaultBrand = useMemo(() => sorted[0]?.[0] || '', [sorted]);
  const valveTags = useMemo(
    () => Array.from(new Set(valves.map((v) => (v.tag || '').trim()).filter(Boolean))).sort((a, b) => a.localeCompare(b)),
    [valves]
  );
  const valveSuggestions = useMemo(() => {
    const q = valveSearch.trim().toLowerCase();
    if (!q) return valveTags.slice(0, 40);
    return valveTags.filter((tag) => tag.toLowerCase().includes(q)).slice(0, 40);
  }, [valveSearch, valveTags]);

  const selectedValve = useMemo(
    () => valves.find((v) => (v.tag || '').toLowerCase() === valveSearch.trim().toLowerCase()),
    [valveSearch, valves]
  );
  const selectedValveBrand = selectedValve?.marca?.trim().replace('GUTH  VENTILE', 'Guth Ventile') || 'Sem fabricante';
  const selectedValveRef = selectedValve?.kit && selectedValve.kit !== 'nan' ? selectedValve.kit : '';
  const cartEntries = Object.entries(cart);
  const cartItemsCount = cartEntries.reduce((sum, [, item]) => sum + Number(item.qty || 0), 0);

  const copyEmail = (brand, email, kits) => {
    const lines = kits.map(k => '  → ' + k).join('\n');
    const txt = `Para: ${email}\nAssunto: Cotação Kits de Reparo — Manutenção Preventiva 2026\n\nPrezados,\n\nSomos uma empresa do setor lácteo e utilizamos equipamentos ${brand}.\nSolicitamos cotação de seal kits para manutenção preventiva semestral 2026:\n\n${lines}\n\nPedimos:\n- Preço unitário e por lote\n- Prazo de entrega para Espanha\n- Material EPDM food-grade\n\nAtenciosamente,\n[NOME] — [EMPRESA] — [TELEFONE]`;
    navigator.clipboard.writeText(txt).then(() => alert('📧 E-mail copiado!'));
  };

  const saveCart = (nextCart) => {
    setCart(nextCart);
    if (typeof window !== 'undefined') localStorage.setItem('mp_purchase_cart', JSON.stringify(nextCart));
  };

  const addToCart = ({ brand, ref, qty = 1, source = '' }) => {
    if (!brand || !ref) {
      alert('Não foi possível adicionar: válvula sem kit de referência.');
      return;
    }
    const key = `${brand}::${ref}`;
    const prev = cart[key] || { brand, ref, qty: 0, sources: [] };
    const next = {
      ...cart,
      [key]: {
        ...prev,
        qty: Number(prev.qty || 0) + Number(qty || 1),
        sources: source ? Array.from(new Set([...(prev.sources || []), source])) : prev.sources
      }
    };
    saveCart(next);
  };

  const changeCartQty = (key, diff) => {
    const current = cart[key];
    if (!current) return;
    const nextQty = Math.max(0, Number(current.qty || 0) + diff);
    const next = { ...cart };
    if (nextQty === 0) delete next[key];
    else next[key] = { ...current, qty: nextQty };
    saveCart(next);
  };

  const clearBrandCart = (brand) => {
    const next = { ...cart };
    Object.keys(next).forEach((key) => {
      if (next[key].brand === brand) delete next[key];
    });
    saveCart(next);
  };

  const groupedCart = useMemo(() => {
    const groups = {};
    cartEntries.forEach(([, item]) => {
      if (!groups[item.brand]) groups[item.brand] = [];
      groups[item.brand].push(item);
    });
    return groups;
  }, [cartEntries]);

  const buildOrderText = (brand, items) => {
    const lines = items
      .map((item) => `- ${item.ref} | Qtd: ${item.qty}${item.sources?.length ? ` | Válvulas: ${item.sources.join(', ')}` : ''}`)
      .join('\n');
    return `Para: ${contacts[brand] || 'contato do fabricante'}\nAssunto: Pedido de compra - ${brand}\n\nOlá,\n\nSolicitamos cotação/fornecimento dos itens abaixo:\n\n${lines}\n\nCondições desejadas:\n- Prazo de entrega para Espanha\n- Material food-grade quando aplicável\n- Informar preço unitário e prazo\n\nAtenciosamente,\n[Nome] - [Empresa] - [Telefone]`;
  };

  const copyOrderText = (brand, items) => {
    const txt = buildOrderText(brand, items);
    navigator.clipboard.writeText(txt).then(() => alert(`Pedido de ${brand} copiado!`));
  };

  const upsertStockItem = () => {
    if (!newItem.ref.trim()) {
      alert('Informe a referência do item');
      return;
    }

    const ref = newItem.ref.trim();
    const brand = (newItem.brand || defaultBrand).trim() || 'Sem fabricante';
    const quantity = Math.max(0, Number(newItem.quantity || 0));
    const minQuantity = Math.max(0, Number(newItem.minQuantity || 0));

    setStock((prev) => {
      const idx = prev.findIndex((i) => i.ref.toLowerCase() === ref.toLowerCase());
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], brand, minQuantity, quantity: next[idx].quantity + quantity };
        return next;
      }
      return [{ id: `${Date.now()}_${ref}`, ref, brand, quantity, minQuantity }, ...prev];
    });

    setNewItem({ ref: '', brand: defaultBrand, quantity: '', minQuantity: '1' });
  };

  const changeQty = (id, diff) => {
    setStock((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: Math.max(0, Number(item.quantity || 0) + diff) } : item
      )
    );
  };

  const removeItem = (id) => {
    if (!confirm('Remover item do estoque?')) return;
    setStock((prev) => prev.filter((item) => item.id !== id));
  };

  const totalStock = stock.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  const lowStock = stock.filter((item) => Number(item.quantity || 0) <= Number(item.minQuantity || 0)).length;

  return (
    <div id="sc-compras" className="sc on" style={{ paddingBottom: '110px' }}>
      {canPurchase && (
        <div className="card" style={{ marginBottom: '12px' }}>
          <div className="ctitle">🛒 Carrinho por fabricante</div>
          <div className="info" style={{ marginBottom: '10px' }}>
            {cartItemsCount} itens no carrinho. Busque a válvula para adicionar automaticamente o kit correto.
          </div>

          <div className="ff">
            <label className="fl">Buscar número da válvula</label>
            <input
              className="fi"
              list="valve-cart-suggestions"
              placeholder="Ex: 2.30.4.16"
              value={valveSearch}
              onChange={(e) => setValveSearch(e.target.value)}
            />
            <datalist id="valve-cart-suggestions">
              {valveSuggestions.map((tag) => (
                <option key={tag} value={tag} />
              ))}
            </datalist>
          </div>

          {selectedValve && (
            <div className="kr" style={{ marginBottom: '8px' }}>
              <div>
                <div className="kc">{selectedValve.tag}</div>
                <div className="ki">{selectedValveBrand} · Kit: {selectedValveRef || 'Sem referência'}</div>
              </div>
              <button
                className="btn btn-p"
                style={{ maxWidth: '170px' }}
                onClick={() =>
                  addToCart({
                    brand: selectedValveBrand,
                    ref: selectedValveRef,
                    qty: 1,
                    source: selectedValve.tag
                  })
                }
                disabled={!selectedValveRef}
              >
                + Carrinho
              </button>
            </div>
          )}

          {Object.entries(groupedCart).length === 0 ? (
            <div className="et" style={{ color: 'var(--mut)' }}>Carrinho vazio.</div>
          ) : (
            Object.entries(groupedCart).map(([brand, items]) => (
              <div key={brand} className="scc" style={{ marginBottom: '8px' }}>
                <div className="scn">{brand}</div>
                <div className="scm">{items.length} refs · {items.reduce((s, i) => s + Number(i.qty || 0), 0)} unid.</div>
                {items.map((item) => {
                  const key = `${item.brand}::${item.ref}`;
                  return (
                    <div key={key} className="kr">
                      <div>
                        <div className="kc">{item.ref}</div>
                        <div className="ki">{item.sources?.length ? `Válvulas: ${item.sources.join(', ')}` : 'Item manual'}</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <button className="btn btn-o" style={{ maxWidth: '30px' }} onClick={() => changeCartQty(key, -1)}>-</button>
                        <span className="kq">{item.qty}</span>
                        <button className="btn btn-g" style={{ maxWidth: '30px' }} onClick={() => changeCartQty(key, 1)}>+</button>
                      </div>
                    </div>
                  );
                })}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '8px' }}>
                  <button className="btn btn-cy" onClick={() => copyOrderText(brand, items)}>Copiar pedido</button>
                  <button className="btn btn-o" onClick={() => clearBrandCart(brand)}>Limpar carrinho</button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <div className="card" style={{ marginBottom: '12px' }}>
        <div className="ctitle">📦 Estoque de Kits</div>
        <div className="info" style={{ marginBottom: '10px' }}>
          {stock.length} itens cadastrados · {totalStock} unidades · {lowStock} com nível baixo
        </div>

        {canManageStock && (
          <div style={{ display: 'grid', gap: '8px', marginBottom: '12px' }}>
            <input
              className="fi"
              placeholder="Referência do kit"
              value={newItem.ref}
              onChange={(e) => setNewItem((p) => ({ ...p, ref: e.target.value }))}
            />
            <input
              className="fi"
              placeholder="Fabricante"
              value={newItem.brand}
              onChange={(e) => setNewItem((p) => ({ ...p, brand: e.target.value }))}
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <input
                className="fi"
                type="number"
                min="0"
                placeholder="Qtd. para adicionar"
                value={newItem.quantity}
                onChange={(e) => setNewItem((p) => ({ ...p, quantity: e.target.value }))}
              />
              <input
                className="fi"
                type="number"
                min="0"
                placeholder="Estoque mínimo"
                value={newItem.minQuantity}
                onChange={(e) => setNewItem((p) => ({ ...p, minQuantity: e.target.value }))}
              />
            </div>
            <button className="btn btn-p" onClick={upsertStockItem}>Adicionar ao estoque</button>
          </div>
        )}

        {stock.length === 0 ? (
          <div className="empty">
            <div className="ei">📦</div>
            <div className="et">Sem itens em estoque ainda</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '8px' }}>
            {stock
              .slice()
              .sort((a, b) => a.ref.localeCompare(b.ref))
              .map((item) => {
                const qty = Number(item.quantity || 0);
                const min = Number(item.minQuantity || 0);
                const low = qty <= min;
                return (
                  <div key={item.id} className="kr" style={{ alignItems: 'center' }}>
                    <div>
                      <div className="kc">{item.ref}</div>
                      <div className="ki">{item.brand} · mínimo {min}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span className="kq" style={{ color: low ? 'var(--rd)' : 'var(--gn)' }}>
                        {qty}
                      </span>
                      {canManageStock && (
                        <>
                          <button className="btn btn-o" style={{ maxWidth: '30px' }} onClick={() => changeQty(item.id, -1)}>-</button>
                          <button className="btn btn-g" style={{ maxWidth: '30px' }} onClick={() => changeQty(item.id, 1)}>+</button>
                          <button className="btn btn-o" style={{ maxWidth: '46px', color: 'var(--rd)' }} onClick={() => removeItem(item.id)}>🗑</button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>

      {(user?.role === 'compras' || user?.role === 'admin' || user?.role === 'chefe') && (
        <div className="card" style={{ marginBottom: '12px' }}>
          <div className="ctitle">📨 Pedidos dos técnicos</div>
          {restockRequests.length === 0 ? (
            <div className="et" style={{ color: 'var(--mut)' }}>Sem pedidos recebidos.</div>
          ) : (
            <div style={{ display: 'grid', gap: '8px' }}>
              {restockRequests.map((req) => (
                <div key={req.id} className="kr">
                  <div>
                    <div className="kc">{req.ref}</div>
                    <div className="ki">{req.description}</div>
                    <div className="ki">Por: {req.suggestedBy}</div>
                  </div>
                  <span className={`bx ${req.status === 'aprovada' ? 'ok' : req.status === 'rejeitada' ? 'cr' : 'wn'}`}>
                    {req.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

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
