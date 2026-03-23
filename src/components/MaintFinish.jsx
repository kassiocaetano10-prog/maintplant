import React, { useState } from 'react';
import SignaturePad from './SignaturePad';
import { useLang } from '../i18n/LangContext';

const MaintFinish = ({ valve, onFinish, onCancel }) => {
  const { t } = useLang();
  const [step, setStep] = useState('form');
  const [form, setForm] = useState({
    technician: '', type: 'preventiva', service: t('default_service'), kitChanged: true, notes: ''
  });

  const handleSign = () => {
    if (!form.technician.trim()) { alert(t('fill_tech_name')); return; }
    setStep('signature');
  };

  const handleSave = (signatureData) => {
    onFinish({
      tag: valve.tag, date: new Date().toISOString(), technician: form.technician.trim(),
      type: form.type, service: form.service, kitChanged: form.kitChanged,
      notes: form.notes.trim(), signature: signatureData
    });
  };

  if (step === 'signature') {
    return (
      <div className="overlay on">
        <div className="ovhd">
          <button className="bkbtn" onClick={() => setStep('form')}>←</button>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'Orbitron, monospace', fontWeight: 900, fontSize: '.85rem', color: 'var(--or)' }}>{t('signature')}</div>
            <div style={{ fontFamily: 'Share Tech Mono', fontSize: '.6rem', color: 'var(--mut)' }}>{form.technician} — {valve.tag}</div>
          </div>
        </div>
        <div className="ovbd"><SignaturePad onSave={handleSave} onCancel={() => setStep('form')} /></div>
      </div>
    );
  }

  return (
    <div className="overlay on">
      <div className="ovhd">
        <button className="bkbtn" onClick={onCancel}>←</button>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'Orbitron, monospace', fontWeight: 900, fontSize: '.85rem', color: 'var(--or)' }}>{t('register_maint')}</div>
          <div style={{ fontFamily: 'Share Tech Mono', fontSize: '.6rem', color: 'var(--mut)' }}>{valve.tag} — {valve.zona}</div>
        </div>
      </div>
      <div className="ovbd">
        <div className="card" style={{ marginBottom: '10px' }}>
          <div className="ctitle">{t('maint_data')}</div>
          <div className="oflabel">{t('tech_name')}</div>
          <input className="ofinput" placeholder={t('tech_placeholder')} value={form.technician} onChange={e => setForm({ ...form, technician: e.target.value })} />
          <div className="oflabel">{t('maint_type')}</div>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
            <button className={`btn ${form.type === 'preventiva' ? 'btn-p' : ''}`} style={{ flex: 1, fontSize: '.65rem', padding: '8px', background: form.type !== 'preventiva' ? 'var(--s2)' : undefined }} onClick={() => setForm({ ...form, type: 'preventiva' })}>{t('preventive')}</button>
            <button className={`btn ${form.type === 'corretiva' ? 'btn-cy' : ''}`} style={{ flex: 1, fontSize: '.65rem', padding: '8px', background: form.type !== 'corretiva' ? 'var(--s2)' : undefined }} onClick={() => setForm({ ...form, type: 'corretiva' })}>{t('corrective')}</button>
          </div>
          <div className="oflabel">{t('service_done')}</div>
          <input className="ofinput" placeholder={t('service_placeholder')} value={form.service} onChange={e => setForm({ ...form, service: e.target.value })} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '12px 0' }}>
            <div onClick={() => setForm({ ...form, kitChanged: !form.kitChanged })} style={{
              width: '36px', height: '20px', borderRadius: '10px', cursor: 'pointer',
              background: form.kitChanged ? 'var(--gn)' : 'var(--s3)', position: 'relative', transition: '0.2s'
            }}>
              <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: '#fff', position: 'absolute', top: '2px', left: form.kitChanged ? '18px' : '2px', transition: '0.2s' }} />
            </div>
            <div style={{ fontFamily: 'Share Tech Mono', fontSize: '.65rem', color: 'var(--txt2)' }}>{t('kit_changed')}</div>
          </div>
          <div className="oflabel">{t('notes_optional')}</div>
          <input className="ofinput" placeholder={t('notes_placeholder')} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
        </div>
        <button className="btn btn-p" onClick={handleSign}>{t('sign_register')}</button>
      </div>
    </div>
  );
};

export default MaintFinish;
