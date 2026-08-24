import React, { useState } from "react";
import {
  BookOpen,
  Scissors,
  Layers,
  Sparkles,
  CheckCircle,
  HelpCircle,
  Printer,
  ShieldCheck,
  Search,
  Maximize2,
  FileText,
  Palette,
  Eye,
  Zap,
} from "lucide-react";
import { CARD_SIZE_PRESETS } from "../data/themePresets";

export const DocsView: React.FC = () => {
  const [activeDocTab, setActiveDocTab] = useState<
    "print_guide" | "dimensions" | "card_formula" | "demo_strategy" | "shortcuts"
  >("print_guide");
  const [docSearch, setDocSearch] = useState("");

  return (
    <div className="flex-1 overflow-y-auto bg-neutral-950 p-4 sm:p-6 lg:p-8 select-none scrollbar-thin">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-600 via-indigo-500 to-amber-400 p-0.5 flex items-center justify-center text-white shadow-lg">
              <BookOpen size={20} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-neutral-100 tracking-tight">
                Documentação & Guia Técnico Gráfico
              </h1>
              <p className="text-xs sm:text-sm text-neutral-400">
                Instruções de fechamento de arquivo, padrões de sangria, tipos de papéis e manuais do estúdio.
              </p>
            </div>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          {[
            { id: "print_guide", label: "Guia da Gráfica & Papéis", icon: Printer },
            { id: "dimensions", label: "Dimensões & Sangria (Bleed)", icon: Maximize2 },
            { id: "card_formula", label: "Anatomia da Carta Terapêutica", icon: Sparkles },
            { id: "demo_strategy", label: "Degustação / Demo de Vendas", icon: Eye },
            { id: "shortcuts", label: "Atalhos & Dicas do Estúdio", icon: Zap },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeDocTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveDocTab(tab.id as any)}
                className={`px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? "bg-amber-500 text-neutral-950 shadow-md"
                    : "bg-neutral-900 text-neutral-400 hover:text-neutral-200 border border-neutral-800"
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: PRINT GUIDE & PAPERS */}
        {activeDocTab === "print_guide" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Paper Section */}
              <div className="p-6 bg-neutral-900/80 rounded-2xl border border-neutral-800 space-y-4">
                <div className="flex items-center gap-2.5 text-amber-400 font-bold text-sm">
                  <Layers size={18} />
                  <h2>1. Qual papel e gramatura escolher na gráfica?</h2>
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  Cartas de terapia e oráculos exigem firmeza e elasticidade mecânica para que o terapeuta ou paciente consigam manusear e embaralhar sem amassar ou marcar os cantos:
                </p>
                <div className="space-y-3 pt-2">
                  <div className="p-3 bg-neutral-950/70 rounded-xl border border-neutral-800 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-neutral-100">
                        Papel Cartão Triplex 350g (Top de Linha Profissional)
                      </span>
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300">
                        Recomendado
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-400">
                      É o papel oficial de baralhos e oráculos profissionais de livraria. Possui miolo de celulose espessa, altíssima rigidez e toque encorpado.
                    </p>
                  </div>

                  <div className="p-3 bg-neutral-950/70 rounded-xl border border-neutral-800 space-y-1">
                    <span className="text-xs font-bold text-neutral-100 block">
                      Couchê Fosco 300g ou 350g (Excelente Custo-Benefício)
                    </span>
                    <p className="text-[11px] text-neutral-400">
                      Ótima fidelidade de cor, superfície lisa e grande resistência para tiragens médias a grandes.
                    </p>
                  </div>

                  <div className="p-3 bg-neutral-950/70 rounded-xl border border-neutral-800 space-y-1">
                    <span className="text-xs font-bold text-neutral-100 block">
                      Papel Especial Linho / Rives 300g (Toque Sensorial Orgânico)
                    </span>
                    <p className="text-[11px] text-neutral-400">
                      Textura levemente ranhurada para baralhos que buscam toque artesanal, botânico e acolhedor.
                    </p>
                  </div>
                </div>
              </div>

              {/* Finishing Section */}
              <div className="p-6 bg-neutral-900/80 rounded-2xl border border-neutral-800 space-y-4">
                <div className="flex items-center gap-2.5 text-amber-400 font-bold text-sm">
                  <Sparkles size={18} />
                  <h2>2. Acabamento, Laminação & Proteção</h2>
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  Para que as cartas durem anos em consultório com uso contínuo, exija da gráfica:
                </p>
                <div className="space-y-3 pt-2">
                  <div className="p-3 bg-neutral-950/70 rounded-xl border border-neutral-800 space-y-1">
                    <span className="text-xs font-bold text-neutral-100 block">
                      Laminação Fosca (BOPP Fosco) ou Soft Touch
                    </span>
                    <p className="text-[11px] text-neutral-400">
                      Elimina o reflexo da luz sob luminárias de consultório, confere toque aveludado e impermeabiliza as cartas contra umidade e oleosidade dos dedos.
                    </p>
                  </div>

                  <div className="p-3 bg-neutral-950/70 rounded-xl border border-neutral-800 space-y-1">
                    <span className="text-xs font-bold text-neutral-100 block">
                      Cantos Arredondados (Raio 3mm a 4mm)
                    </span>
                    <p className="text-[11px] text-neutral-400">
                      Essencial para baralhos. Cantos vivos/retos desfiam rapidamente ao embaralhar.
                    </p>
                  </div>

                  <div className="p-3 bg-neutral-950/70 rounded-xl border border-neutral-800 space-y-1">
                    <span className="text-xs font-bold text-amber-300 block">
                      Opcional Nobre: Hot Stamping Dourado ou Verniz Localizado
                    </span>
                    <p className="text-[11px] text-neutral-400">
                      Destaque em folha de ouro metálica sobre os ornatos, títulos ou molduras para edições de colecionador.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: DIMENSIONS & BLEED */}
        {activeDocTab === "dimensions" && (
          <div className="space-y-6">
            <div className="p-6 bg-neutral-900/80 rounded-2xl border border-neutral-800 space-y-4">
              <div className="flex items-center gap-2.5 text-amber-400 font-bold text-sm">
                <Scissors size={18} />
                <h2>Tabela Oficial de Formatos Gráficos e Margens de Corte</h2>
              </div>
              <p className="text-xs text-neutral-300">
                Cada formato pré-configurado no estúdio já inclui automaticamente os 3mm de sangria (Bleed) e a margem de segurança de 4mm.
              </p>

              <div className="overflow-x-auto pt-2">
                <table className="w-full text-left text-xs text-neutral-300">
                  <thead className="bg-neutral-950 text-neutral-400 font-semibold border-b border-neutral-800 text-[11px] uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Formato / Preset</th>
                      <th className="py-3 px-4">Tamanho Final (Corte)</th>
                      <th className="py-3 px-4">Tamanho com Sangria (+3mm)</th>
                      <th className="py-3 px-4">Pixels a 300 DPI</th>
                      <th className="py-3 px-4">Uso Típico</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/60">
                    {CARD_SIZE_PRESETS.map((preset) => {
                      const finalW = preset.widthMm;
                      const finalH = preset.heightMm;
                      const bleedW = finalW + 6;
                      const bleedH = finalH + 6;
                      const pxW = Math.round((bleedW / 25.4) * 300);
                      const pxH = Math.round((bleedH / 25.4) * 300);

                      return (
                        <tr key={preset.id} className="hover:bg-neutral-800/40 transition-colors">
                          <td className="py-3 px-4 font-bold text-neutral-100">
                            {preset.name}
                          </td>
                          <td className="py-3 px-4 text-amber-300 font-mono">
                            {finalW} × {finalH} mm
                          </td>
                          <td className="py-3 px-4 text-neutral-300 font-mono">
                            {bleedW} × {bleedH} mm
                          </td>
                          <td className="py-3 px-4 text-neutral-400 font-mono text-[11px]">
                            {pxW} × {pxH} px
                          </td>
                          <td className="py-3 px-4 text-neutral-400">
                            {preset.description}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: THERAPEUTIC CARD ANATOMY */}
        {activeDocTab === "card_formula" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-neutral-900/80 rounded-2xl border border-neutral-800 space-y-4">
              <div className="flex items-center gap-2.5 text-amber-400 font-bold text-sm">
                <Sparkles size={18} />
                <h2>A Estrutura de Uma Carta Terapêutica Poderosa</h2>
              </div>
              <p className="text-xs text-neutral-300 leading-relaxed">
                Cartas de terapia clínica e desenvolvimento pessoal seguem uma tríade psicológica: **Conexão Afetiva**, **Insight Racional** e **Ação Corporal**.
              </p>
              <div className="space-y-3 pt-2 text-xs">
                <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800">
                  <span className="font-bold text-amber-300 block">1. Título & Arquétipo</span>
                  <p className="text-neutral-400 text-[11px] mt-0.5">
                    Nome direto em caixa alta (ex: ACEITAÇÃO, CORAGEM, LIMITES, SILÊNCIO). Define o tema central da tiragem.
                  </p>
                </div>

                <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800">
                  <span className="font-bold text-emerald-300 block">2. Afirmação em 1ª Pessoa</span>
                  <p className="text-neutral-400 text-[11px] mt-0.5">
                    Frase de ancoragem no presente: *"Eu me permito acolher minha vulnerabilidade com gentileza."*
                  </p>
                </div>

                <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800">
                  <span className="font-bold text-sky-300 block">3. Reflexão Terapêutica</span>
                  <p className="text-neutral-400 text-[11px] mt-0.5">
                    1 a 2 parágrafos curtos contextualizando o desafio emocional e desfazendo a auto-cobrança.
                  </p>
                </div>

                <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800">
                  <span className="font-bold text-purple-300 block">4. Pergunta de Alma (Soul Question)</span>
                  <p className="text-neutral-400 text-[11px] mt-0.5">
                    Provocação aberta que convida à auto-investigação no consultório ou no diário terapêutico.
                  </p>
                </div>

                <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800">
                  <span className="font-bold text-amber-400 block">5. Ação Prática / Microrritual</span>
                  <p className="text-neutral-400 text-[11px] mt-0.5">
                    Exercício somático de 1 minuto (respiração diafragmática, escrita expressiva, pausa consciente).
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 bg-neutral-900/80 rounded-2xl border border-neutral-800 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-2.5 text-amber-400 font-bold text-sm">
                  <BookOpen size={18} />
                  <h2>Utilizando a Inteligência Artificial Gemini</h2>
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  O botão <strong className="text-amber-300">Gerador IA</strong> na barra superior permite que você defina a linha teórica (ex: TCC, Psicanálise, Mindfulness, Junguiana, Sistêmica) e o público-alvo (Adultos, Crianças, Casais, Luto).
                </p>
                <div className="p-4 bg-amber-500/10 rounded-xl border border-amber-500/30 text-amber-200 text-xs space-y-2">
                  <span className="font-bold block">💡 Dica de Ouro para Prompts:</span>
                  <p className="text-[11px] leading-relaxed">
                    Especifique o tom de voz da sua abordagem clínica. Por exemplo: *"Crie 20 cartas para manejo de ansiedade clínica com tom compassivo e baseado em Terapia de Aceitação e Compromisso (ACT)."*
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: DEMO / SALES STRATEGY */}
        {activeDocTab === "demo_strategy" && (
          <div className="p-6 bg-neutral-900/80 rounded-2xl border border-neutral-800 space-y-4">
            <div className="flex items-center gap-2.5 text-amber-400 font-bold text-sm">
              <Eye size={18} />
              <h2>Como Funciona a Degustação Demo para Clientes</h2>
            </div>
            <p className="text-xs text-neutral-300 leading-relaxed">
              O sistema conta com um recurso nativo de **Degustação Prévia (Demo)** que permite compartilhar um link público seguro com potenciais compradores ou pacientes:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 bg-neutral-950 rounded-xl border border-neutral-800 space-y-1.5">
                <span className="text-xs font-bold text-amber-300 block">1. Marcar Cartas Demo</span>
                <p className="text-[11px] text-neutral-400">
                  Clique no ícone de estrela nas 3 a 5 cartas mais impactantes do seu baralho para marcá-las como liberadas para degustação gratuita.
                </p>
              </div>

              <div className="p-4 bg-neutral-950 rounded-xl border border-neutral-800 space-y-1.5">
                <span className="text-xs font-bold text-emerald-300 block">2. Bloqueio Elegante</span>
                <p className="text-[11px] text-neutral-400">
                  Quando o cliente abre o link de degustação, as cartas restantes aparecem com visual fosco fosforoso e cadeado de segurança convidando à compra do baralho completo.
                </p>
              </div>

              <div className="p-4 bg-neutral-950 rounded-xl border border-neutral-800 space-y-1.5">
                <span className="text-xs font-bold text-sky-300 block">3. Simulação no Estúdio</span>
                <p className="text-[11px] text-neutral-400">
                  Na barra de ferramentas do estúdio, você pode ligar e desligar a "Visão do Cliente Demo" a qualquer instante para testar a experiência de compra antes de divulgar.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: SHORTCUTS & TIPS */}
        {activeDocTab === "shortcuts" && (
          <div className="p-6 bg-neutral-900/80 rounded-2xl border border-neutral-800 space-y-4">
            <div className="flex items-center gap-2.5 text-amber-400 font-bold text-sm">
              <Zap size={18} />
              <h2>Atalhos e Dicas de Produtividade no Estúdio</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
              <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 flex items-center justify-between">
                <span className="text-neutral-300">Girar Carta (Frente / Verso)</span>
                <kbd className="px-2 py-1 bg-neutral-800 rounded font-mono text-[11px] text-amber-300">
                  Clique na Carta
                </kbd>
              </div>

              <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 flex items-center justify-between">
                <span className="text-neutral-300">Exportar PDF Pronto para A4</span>
                <kbd className="px-2 py-1 bg-neutral-800 rounded font-mono text-[11px] text-emerald-300">
                  Botão Exportar
                </kbd>
              </div>

              <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 flex items-center justify-between">
                <span className="text-neutral-300">Modos de Visualização (Grade / Leque 3D)</span>
                <kbd className="px-2 py-1 bg-neutral-800 rounded font-mono text-[11px] text-sky-300">
                  Barra Flutuante
                </kbd>
              </div>

              <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 flex items-center justify-between">
                <span className="text-neutral-300">Aprimorar Texto com IA em 1 Clique</span>
                <kbd className="px-2 py-1 bg-neutral-800 rounded font-mono text-[11px] text-purple-300">
                  Ícone IA na Lista
                </kbd>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
