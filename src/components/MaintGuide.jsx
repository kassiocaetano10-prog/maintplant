import React, { useState } from 'react';
import { useLang } from '../i18n/LangContext';

const MaintGuide = ({ valve, onClose, onFinish }) => {
  const { t } = useLang();
  const [currentStep, setCurrentStep] = useState(0);
  const [completed, setCompleted] = useState([]);

  const steps = [
    { title: t('step1_title'), details: [t('step1_d1'), t('step1_d2'), t('step1_d3')], warning: t('step1_warn') },
    { title: t('step2_title'), details: [t('step2_d1'), t('step2_d2'), t('step2_d3')], tip: t('step2_tip') },
    { title: t('step3_title'), details: [t('step3_d1'), t('step3_d2'), t('step3_d3')] },
    { title: t('step4_title'), details: [t('step4_d1'), t('step4_d2'), t('step4_d3')], tip: t('step4_tip') },
    { title: t('step5_title'), details: [t('step5_d1'), t('step5_d2'), t('step5_d3'), t('step5_d4')], tip: t('step5_tip') }
  ];

  const confirmStep = (i) => {
    if (!completed.includes(i)) {
      setCompleted([...completed, i]);
      if (i < steps.length - 1) setCurrentStep(i + 1);
    }
  };

  const progress = (completed.length / steps.length) * 100;

  return (
    <div className="overlay on">
      <div className="ovhd">
        <button className="bkbtn" onClick={onClose}>←</button>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'Orbitron, monospace', fontWeight: 900, fontSize: '.85rem', color: 'var(--or)' }}>
            {t('guide_title')}
          </div>
          <div style={{ fontFamily: 'Share Tech Mono', fontSize: '.6rem', color: 'var(--mut)' }}>
            {valve.tag} — {valve.zona}
          </div>
        </div>
      </div>
      <div className="ovbd">
        <div style={{ marginBottom: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <div style={{ fontFamily: 'Share Tech Mono', fontSize: '.55rem', color: 'var(--mut)' }}>{completed.length}/{steps.length}</div>
            <div style={{ fontFamily: 'Orbitron', fontSize: '.6rem', color: 'var(--or)' }}>{Math.round(progress)}%</div>
          </div>
          <div style={{ height: '6px', background: 'var(--s3)', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ width: `${progress}%`, height: '100%', background: 'linear-gradient(90deg, var(--or), var(--yl))', transition: '0.5s', borderRadius: '3px' }} />
          </div>
        </div>

        {steps.map((step, i) => {
          const done = completed.includes(i);
          return (
            <div key={i} className="card" style={{ marginBottom: '10px', opacity: i > currentStep && !done ? 0.4 : 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '50%', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  background: done ? 'var(--gn)' : 'var(--s3)',
                  color: done ? '#fff' : 'var(--txt)', fontFamily: 'Orbitron', fontSize: '.7rem', fontWeight: 900
                }}>{done ? '✓' : i + 1}</div>
                <div style={{ fontFamily: 'Exo 2', fontWeight: 700, fontSize: '.8rem', color: 'var(--txt)' }}>{step.title}</div>
              </div>
              <div style={{ paddingLeft: '42px' }}>
                {step.details.map((d, j) => (
                  <div key={j} style={{ fontFamily: 'Share Tech Mono', fontSize: '.63rem', color: 'var(--txt2)', marginBottom: '4px' }}>› {d}</div>
                ))}
                {step.warning && (
                  <div style={{ marginTop: '6px', padding: '8px', background: 'rgba(239,68,68,0.1)', borderRadius: '6px', borderLeft: '3px solid var(--rd)', fontFamily: 'Share Tech Mono', fontSize: '.6rem', color: 'var(--rd)' }}>
                    ⚠️ {step.warning}
                  </div>
                )}
                {step.tip && (
                  <div style={{ marginTop: '6px', padding: '8px', background: 'rgba(249,115,22,0.1)', borderRadius: '6px', borderLeft: '3px solid var(--or)', fontFamily: 'Share Tech Mono', fontSize: '.6rem', color: 'var(--or2)' }}>
                    💡 {step.tip}
                  </div>
                )}
                {!done && i <= currentStep && (
                  <button className="btn btn-p" onClick={() => confirmStep(i)} style={{ marginTop: '8px', padding: '8px', fontSize: '.65rem' }}>
                    {t('confirm_step')}
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {completed.length === steps.length && (
          <button className="btn btn-p" onClick={onFinish} style={{ marginTop: '4px' }}>{t('finish_register')}</button>
        )}
      </div>
    </div>
  );
};

export default MaintGuide;
