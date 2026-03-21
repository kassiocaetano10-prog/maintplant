import React, { useState } from 'react';

const STEPS = [
  { t: "Isolamento e Segurança", d: ["Desativar a bomba de alimentação do setor.", "Bloquear as válvulas de entrada e saída manuais.", "Aliviar a pressão interna do corpo da válvula."], w: "Nunca abra a válvula sob pressão. Risco de projeção de fluidos quentes ou químicos." },
  { t: "Desmontagem do Atuador", d: ["Desconectar as mangueiras de ar comprimido (anotar posições).", "Remover os parafusos de união entre o atuador e o corpo.", "Extrair o conjunto atuador/eixo verticalmente com cuidado."], i: "Utilize uma chave estrela de 13mm para evitar danos nas porcas de aço inox." },
  { t: "Inspeção de Juntas e O-rings", d: ["Remover as juntas antigas do prato (assento) e do eixo.", "Limpar todas as ranhuras com álcool isopropílico.", "Verificar se há riscos ou deformações nas superfícies metálicas."] },
  { t: "Instalação do Novo Kit", d: ["Lubrificar levemente as novas juntas com graxa grau alimentício (Klüber).", "Encaixar as juntas de assento garantindo que não fiquem torcidas.", "Substituir o O-ring da haste e a vedação do corpo."], i: "A lubrificação correta aumenta em 40% a vida útil das vedações em ciclos CIP." },
  { t: "Remontagem e Teste", d: ["Inserir o eixo no corpo garantindo o alinhamento central.", "Fixar o atuador e reapertar os parafusos em cruz.", "Religar o ar comprimido e testar a abertura/fechamento 5 vezes."], i: "Verificar se o sensor (ThinkTop) indica as posições corretas no painel." }
];

const MaintGuide = ({ valve, onClose, onFinish }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [doneSteps, setDoneSteps] = useState(new Set());

  const toggleStep = (i) => {
    setCurrentStep(i);
  };

  const markDone = (i) => {
    const newDone = new Set(doneSteps);
    newDone.add(i);
    setDoneSteps(newDone);
    if (i < STEPS.length - 1) {
      setCurrentStep(i + 1);
    }
  };

  const progress = Math.round((doneSteps.size / STEPS.length) * 100);

  return (
    <div id="guide" className="overlay on" style={{ zIndex: 200 }}>
      <div className="ovhd" style={{ flexDirection: 'column', gap: '5px', paddingBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%' }}>
          <button className="bkbtn" onClick={onClose}>←</button>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'Orbitron, monospace', fontWeight: 700, fontSize: '.87rem', color: 'var(--txt)' }}>Guia de Manutenção</div>
            <div style={{ fontFamily: 'Share Tech Mono', fontSize: '.62rem', color: 'var(--mut)' }}>{valve.tag}</div>
          </div>
          <div style={{ fontFamily: 'Orbitron, monospace', fontSize: '.72rem', color: 'var(--or)' }}>{doneSteps.size}/{STEPS.length}</div>
        </div>
        <div className="ptrack"><div className="pfill" style={{ width: `${progress}%` }}></div></div>
      </div>
      <div className="ovbd">
        {STEPS.map((s, i) => (
          <div key={i} className={`stcard ${currentStep === i ? 'ac' : ''} ${doneSteps.has(i) ? 'dn' : ''}`}>
            <div className="sthd" onClick={() => toggleStep(i)}>
              <div className={`stnum ${currentStep === i ? 'ac' : ''} ${doneSteps.has(i) ? 'dn' : ''}`}>{i + 1}</div>
              <div style={{ fontSize: '.88rem', fontWeight: 700, color: 'var(--txt)' }}>{s.t}</div>
            </div>
            <div className={`stbd ${currentStep === i ? 'on' : ''}`}>
              {s.d.map((line, li) => (
                <div key={li} className="stli">{line}</div>
              ))}
              {s.i && <div className="stip">💡 {s.i}</div>}
              {s.w && <div className="stwn">⚠️ {s.w}</div>}
              <div className="stac">
                <button 
                  className="btn btn-g" 
                  onClick={() => markDone(i)}
                  disabled={doneSteps.has(i)}
                >
                  {doneSteps.has(i) ? '✓ Concluído' : 'Confirmar Etapa'}
                </button>
              </div>
            </div>
          </div>
        ))}
        {doneSteps.size === STEPS.length && (
          <button className="btn btn-p" onClick={onFinish} style={{ marginTop: '20px' }}>
            Finalizar e Registrar
          </button>
        )}
      </div>
    </div>
  );
};

export default MaintGuide;
