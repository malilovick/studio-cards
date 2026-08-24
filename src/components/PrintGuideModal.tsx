import React from "react";
import { BookOpen, X, CheckCircle, ShieldCheck, Sparkles, Layers, Scissors, HelpCircle } from "lucide-react";

interface PrintGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrintGuideModal: React.FC<PrintGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold">
              <BookOpen size={18} />
            </div>
            <div>
              <h2 className="text-base font-semibold text-neutral-100">
                Guia Profissional de Impressão para Cartas Terapêuticas
              </h2>
              <p className="text-xs text-neutral-400">
                Como enviar para a gráfica e garantir a máxima qualidade de toque e durabilidade.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="py-4 space-y-4 text-xs text-neutral-300 leading-relaxed">
          {/* Section 1: Papel & Gramatura */}
          <div className="p-3.5 bg-neutral-800/40 rounded-xl border border-neutral-700/50 space-y-2">
            <h3 className="font-semibold text-neutral-100 text-xs flex items-center gap-2 text-amber-300">
              <Layers size={15} />
              1. Qual papel e gramatura escolher na gráfica?
            </h3>
            <p className="text-neutral-300 text-[11.5px]">
              Cartas de terapia e oráculos exigem firmeza para que o paciente consiga manusear e embaralhar sem amassar:
            </p>
            <ul className="space-y-1.5 text-[11px] text-neutral-400 pl-2">
              <li className="flex items-start gap-1.5">
                <CheckCircle size={13} className="text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-neutral-200">Papel Cartão Triplex 350g (Top de Linha):</strong> É o papel oficial de baralhos profissionais. Altíssima rigidez e toque aveludado.
                </span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle size={13} className="text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-neutral-200">Couchê Fosco 300g ou 350g:</strong> Excelente custo-benefício, com cores fiéis e grande resistência.
                </span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle size={13} className="text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-neutral-200">Papel Especial Linho / Rives 300g:</strong> Para baralhos com toque rústico, orgânico e sensorial refinado.
                </span>
              </li>
            </ul>
          </div>

          {/* Section 2: Laminação & Acabamento */}
          <div className="p-3.5 bg-neutral-800/40 rounded-xl border border-neutral-700/50 space-y-2">
            <h3 className="font-semibold text-neutral-100 text-xs flex items-center gap-2 text-amber-300">
              <Sparkles size={15} />
              2. Acabamento & Proteção contra Desgaste
            </h3>
            <p className="text-neutral-300 text-[11.5px]">
              Sempre solicite <strong className="text-amber-200">Laminação Frente e Verso</strong>:
            </p>
            <ul className="space-y-1 text-[11px] text-neutral-400 pl-2">
              <li>• <strong>Laminação Fosca Soft-Touch:</strong> Deixa a carta com toque aveludado acetinado e evita reflexos de luz em consultório.</li>
              <li>• <strong>BOPP Fosco Tradicional:</strong> Protege contra umidade, suor das mãos e atrito.</li>
              <li>• <strong>Cantos Arredondados (Raio 3mm a 5mm):</strong> Essencial! Evita que as pontas das cartas desfiem ou dobrem ao embaralhar.</li>
            </ul>
          </div>

          {/* Section 3: Sangria & Marcas de Corte */}
          <div className="p-3.5 bg-neutral-800/40 rounded-xl border border-neutral-700/50 space-y-2">
            <h3 className="font-semibold text-neutral-100 text-xs flex items-center gap-2 text-amber-300">
              <Scissors size={15} />
              3. O que são Sangria e Marcas de Corte?
            </h3>
            <p className="text-neutral-300 text-[11.5px]">
              Ao exportar neste aplicativo, seus arquivos já saem com <strong>3mm de Sangria (Bleed)</strong> e <strong>Marcas de Corte (Crop Marks)</strong> vetoriais precisas. Isso significa que mesmo com pequenas variações mecânicas da guilhotina da gráfica, suas cartas nunca ficarão com bordas brancas cortadas incorretamente.
            </p>
          </div>

          {/* Section 4: Como pedir na gráfica */}
          <div className="p-3.5 bg-emerald-950/40 border border-emerald-500/30 rounded-xl space-y-2">
            <h3 className="font-semibold text-emerald-300 text-xs">
              📋 Mensagem Pronta para enviar à Gráfica:
            </h3>
            <div className="p-2.5 bg-neutral-950/80 rounded-lg text-[11px] text-neutral-300 font-mono border border-neutral-800 select-all">
              "Olá! Gostaria de um orçamento para impressão de Baralho Terapêutico:<br/>
              - Quantidade: [X] unidades do baralho completo<br/>
              - Tamanho cortado: 70 x 120 mm (ou conforme PDF exportado)<br/>
              - Papel: Cartão Triplex 350g ou Couchê Fosco 300g<br/>
              - Cores: 4x4 (Colorido Frente e Verso)<br/>
              - Acabamento: Laminação Fosca (Soft-Touch) frente e verso + Cantos Arredondados R=4mm<br/>
              - Arquivo em anexo em PDF de alta resolução com marcas de corte e 3mm de sangria."
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-neutral-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold rounded-xl text-xs transition-all"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
