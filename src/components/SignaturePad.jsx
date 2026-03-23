import React, { useRef, useState, useEffect } from 'react';
import { useLang } from '../i18n/LangContext';

const SignaturePad = ({ onSave, onCancel }) => {
  const { t } = useLang();
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width - 32;
    canvas.height = 160;
    ctx.fillStyle = '#0c1120';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#00d4ff';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  const getPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches ? e.touches[0] : e;
    return { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
  };

  const startDraw = (e) => { e.preventDefault(); const ctx = canvasRef.current.getContext('2d'); const pos = getPos(e); ctx.beginPath(); ctx.moveTo(pos.x, pos.y); setIsDrawing(true); setHasDrawn(true); };
  const draw = (e) => { e.preventDefault(); if (!isDrawing) return; const ctx = canvasRef.current.getContext('2d'); const pos = getPos(e); ctx.lineTo(pos.x, pos.y); ctx.stroke(); };
  const endDraw = (e) => { e.preventDefault(); setIsDrawing(false); };

  const clear = () => {
    const canvas = canvasRef.current; const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#0c1120'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  return (
    <div style={{ padding: '16px' }}>
      <div style={{ fontFamily: 'Share Tech Mono', fontSize: '.6rem', color: 'var(--mut)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '8px' }}>
        {t('sign_below')}
      </div>
      <canvas ref={canvasRef} style={{ border: '1px solid var(--s3)', borderRadius: '8px', width: '100%', touchAction: 'none', cursor: 'crosshair' }}
        onMouseDown={startDraw} onMouseMove={draw} onMouseUp={endDraw} onMouseLeave={endDraw}
        onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={endDraw} />
      <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
        <button className="btn btn-o" onClick={clear} style={{ flex: 1 }}>{t('clear')}</button>
        <button className="btn btn-p" onClick={() => hasDrawn && onSave(canvasRef.current.toDataURL('image/png'))} style={{ flex: 2, opacity: hasDrawn ? 1 : 0.4 }}>{t('confirm_sign')}</button>
      </div>
      <button className="btn" onClick={onCancel} style={{ marginTop: '6px', background: 'var(--s2)' }}>{t('cancel')}</button>
    </div>
  );
};

export default SignaturePad;
