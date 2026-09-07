// ============================== PLANO PADRÃO ==============================
export const MUSCLES = ["Peito", "Costas", "Ombro", "Bíceps", "Tríceps", "Quadríceps", "Posteriores", "Glúteos", "Panturrilha", "Core"];

// `extra` carrega campos opcionais usados na sugestão de carga inicial e no
// card do exercício:
// - loadMultiplier: sugestão de carga = peso corporal × loadMultiplier (já
//   calculado por exercício a partir da tabela de categorias do perfil dela
//   — supino/desenvolvimento com halteres já vem dividido por 2, por ex.)
// - equipment: "barbell" | "dumbbell" | "machine" — só define o incremento
//   de arredondamento da sugestão (2,5kg barra/máquina, 1kg halteres)
// - note: observação técnica curta exibida no card
// - image: caminho de uma imagem ilustrativa (ainda não preenchido — ver
//   ExerciseImage.jsx pro fallback por grupo muscular)
export function ex(name, sets, reps, muscle, rest, video, source, timed, extra = {}) {
  return { id: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"), name, sets, reps, muscle, rest, video, source, timed: !!timed, ...extra };
}

export const DEFAULT_PLAN = {
  A: {
    label: "Treino A",
    focus: "Superiores — Peito, Costas, Ombro e Braços",
    exercises: [
      ex("Supino reto com halteres", 4, "10-12", "Peito", 90, "https://www.youtube.com/watch?v=tDxKGeY-hjQ", "Treino Mestre", false,
        {
          loadMultiplier: 0.18, equipment: "dumbbell",
          note: "Desça os halteres até sentir leve alongamento no peito, cotovelos formando uns 45° com o corpo (não retos — isso sobrecarrega o ombro). Controle a descida e não bata os halteres um no outro lá em cima.",
        }),
      ex("Puxada frontal (pulley/graviton)", 4, "10-12", "Costas", 90, "https://www.youtube.com/watch?v=7cCiQUdIXWw", "Fisioprev", false,
        {
          loadMultiplier: 0.5, equipment: "machine",
          note: "Puxe a barra até a altura do queixo/peito levando os cotovelos pra baixo e pra trás, sem inclinar o tronco pra trás pra compensar. Evite puxar atrás da nuca.",
        }),
      ex("Desenvolvimento com halteres", 3, "10-12", "Ombro", 60, "https://www.youtube.com/watch?v=eufDL9MmF8A", "Como Fazer", false,
        {
          loadMultiplier: 0.18, equipment: "dumbbell",
          note: "Halteres começam na altura da orelha, cotovelos levemente à frente do corpo. Não trave o cotovelo com força lá em cima, e evite arquear a lombar pra ganhar impulso.",
        }),
      ex("Remada baixa (cabo/máquina)", 3, "10-12", "Costas", 60, "https://www.youtube.com/watch?v=2YebbYuuBJQ", "Postura correta", false,
        {
          loadMultiplier: 0.5, equipment: "machine",
          note: "Puxe levando os cotovelos pra trás, perto do corpo, e aperte as escápulas no final do movimento. Mantenha o tronco parado — sem balançar pra trás pra ajudar a puxada.",
        }),
      ex("Crucifixo reto com halteres", 3, "12-15", "Peito", 60, "https://www.youtube.com/watch?v=DqL31nkLyRQ", "Execução Perfeita", false,
        {
          loadMultiplier: 0.12, equipment: "dumbbell",
          note: "Cotovelos levemente flexionados e travados durante todo o movimento — não flexione/estenda no meio da série. Desça só até sentir alongamento no peitoral, sem forçar o ombro. Sem banco reto? Dá pra fazer deitada no chão (reduz um pouco a amplitude, mas é seguro).",
        }),
      ex("Elevação lateral", 3, "12-15", "Ombro", 45, "https://www.youtube.com/watch?v=jannLx4RxKo", "Técnica correta", false,
        {
          loadMultiplier: 0.14, equipment: "dumbbell",
          note: "Suba os halteres até a altura do ombro, cotovelos levemente flexionados e sempre um pouco à frente do corpo (não exatamente ao lado). Controle a descida — não deixe cair.",
        }),
      ex("Rosca direta", 3, "10-12", "Bíceps", 45, "https://www.youtube.com/watch?v=Et1wgGMGW8w", "Como fazer", false,
        {
          loadMultiplier: 0.14, equipment: "dumbbell",
          note: "Cotovelos fixos ao lado do corpo o tempo todo — não deixe ir pra frente pra ganhar impulso. Suba e desça controlado, sem balançar o tronco.",
        }),
      ex("Tríceps corda na polia", 3, "10-12", "Tríceps", 45, "https://www.youtube.com/watch?v=7le1JRUUagM", "Postura correta", false,
        {
          loadMultiplier: 0.14, equipment: "machine",
          note: "Cotovelos colados ao corpo, só o antebraço se move. No final do movimento, abra levemente a corda pra fora pra ativar melhor o tríceps.",
        }),
    ],
  },
  B: {
    label: "Treino B",
    focus: "Inferiores — Quadríceps, Posteriores, Glúteos e Panturrilha",
    exercises: [
      ex("Agachamento livre/smith", 4, "8-12", "Quadríceps", 120, "https://www.youtube.com/watch?v=nrM8zB5-gtE", "Sesc+Treino", false,
        {
          loadMultiplier: 0.72, equipment: "barbell",
          note: "Desça até a coxa ficar paralela ao chão (ou onde a mobilidade permitir sem tirar o calcanhar do chão), joelhos seguindo a direção dos pés. Peito aberto, olhar à frente — evite arredondar a lombar.",
        }),
      ex("Subida no caixote com halteres (Step-up)", 4, "10-12 cada perna", "Quadríceps", 90, "https://www.youtube.com/watch?v=zquPhOg95Fw", "Canal Combate", false,
        {
          loadMultiplier: 0.3, equipment: "dumbbell",
          note: "Altura do caixote no joelho ou um pouco abaixo. Empurre com o calcanhar da perna de cima, evitando impulso da perna de baixo.",
        }),
      ex("Cadeira extensora", 3, "12-15", "Quadríceps", 60, "https://www.youtube.com/watch?v=mruTNzILY3U", "Erros e ajustes", false,
        {
          loadMultiplier: 0.3, equipment: "machine",
          note: "Ajuste o encosto pra o joelho ficar alinhado com o eixo do aparelho. Suba controlado, sem jogar o corpo pra trás, e não estale o joelho batendo com força lá em cima.",
        }),
      ex("Stiff", 4, "10-12", "Posteriores", 90, "https://www.youtube.com/watch?v=634HxkLQMwo", "Sport Extrema", false,
        {
          loadMultiplier: 0.72, equipment: "barbell",
          note: "Joelhos levemente flexionados (quase travados, mas não travados). Desça a barra rente à perna até sentir alongamento no posterior de coxa — lombar sempre reta, pare antes de arredondar.",
        }),
      ex("Mesa/cadeira flexora", 3, "12-15", "Posteriores", 60, "https://www.youtube.com/watch?v=8Nat6GRiEoc", "Execução correta", false,
        {
          loadMultiplier: 0.3, equipment: "machine",
          note: "Quadril sempre apoiado no banco — não levante pra ajudar a puxar. Aperte no final do movimento e controle a volta, sem deixar o peso cair sozinho.",
        }),
      ex("Elevação pélvica (hip thrust)", 4, "10-15", "Glúteos", 90, "https://www.youtube.com/watch?v=nwkXOSKGnQQ", "Smart Fit", false,
        {
          loadMultiplier: 1.0, equipment: "barbell",
          note: "Apoie a parte de cima das costas no banco, queixo levemente retraído. Suba até o quadril alinhar com joelho e ombro, apertando o glúteo no topo — evite hiperestender a lombar.",
        }),
      ex("Abdução de quadril", 3, "15-20", "Glúteos", 45, "https://www.youtube.com/watch?v=50qHGus1TZk", "Postura correta", false,
        {
          loadMultiplier: 0.3, equipment: "machine",
          note: "Tronco parado e ereto durante todo o movimento — o trabalho é só das pernas abrindo contra a resistência. Não use impulso do corpo pra empurrar o peso.",
        }),
      ex("Panturrilha em pé", 4, "15-20", "Panturrilha", 45, "https://www.youtube.com/watch?v=qWHH0We_9r0", "Melhor forma", false,
        {
          loadMultiplier: 0.3, equipment: "machine",
          note: "Desça até sentir alongamento na panturrilha e suba até a ponta do pé, com uma pausa breve no topo. Movimento controlado — sem quicar.",
        }),
    ],
  },
  C: {
    label: "Treino C",
    focus: "Full Body + Core",
    exercises: [
      ex("Afundo com halteres", 3, "10-12 cada perna", "Glúteos", 90, "https://www.youtube.com/watch?v=9bxRdpUFW4c", "Aprenda a fazer", false,
        {
          loadMultiplier: 0.3, equipment: "dumbbell",
          note: "Desça até o joelho de trás quase tocar o chão, mantendo o tronco ereto. O joelho da frente não deve ultrapassar muito a ponta do pé — dê um passo maior se isso acontecer.",
        }),
      ex("Remada unilateral com halter", 3, "10-12 cada lado", "Costas", 60, "https://www.youtube.com/watch?v=LhLDYH-ExbE", "Treino Correto", false,
        {
          loadMultiplier: 0.5, equipment: "dumbbell",
          note: "Apoie o joelho e a mão do mesmo lado no banco. Puxe o halter levando o cotovelo pra trás e pra cima, mantendo a coluna neutra — sem girar o tronco pra ajudar.",
        }),
      ex("Elevação frontal com halteres", 3, "10-12", "Ombro", 60, "https://www.youtube.com/watch?v=HgmuchoLIAY", "Fisioprev", false,
        {
          loadMultiplier: 0.14, equipment: "dumbbell",
          note: "Suba o halter até a altura do ombro com o braço quase esticado, sem usar impulso do corpo. Controle a descida — não deixe cair rápido.",
        }),
      ex("Glúteo em 4 apoios", 3, "12-15 cada lado", "Glúteos", 45, "https://www.youtube.com/watch?v=J_lccrQ6-7Y", "Passo a passo", false,
        { note: "Mantenha a lombar neutra (sem arquear) e leve o joelho em direção ao teto, apertando o glúteo no topo. Movimento controlado, sem usar embalo do quadril." }),
      ex("Rosca martelo", 3, "10-12", "Bíceps", 45, "https://www.youtube.com/watch?v=1-xCKLVxqqg", "Fisioprev", false,
        {
          loadMultiplier: 0.14, equipment: "dumbbell",
          note: "Pegada neutra (palmas viradas uma pra outra) o tempo todo. Cotovelos fixos ao lado do corpo, sem balançar o tronco pra ajudar a subir.",
        }),
      ex("Tríceps francês", 3, "10-12", "Tríceps", 45, "https://www.youtube.com/watch?v=KXtq1r5eoOQ", "Fisioprev", false,
        {
          loadMultiplier: 0.14, equipment: "dumbbell",
          note: "Cotovelos apontando pra cima e parados durante todo o movimento — só o antebraço se move. Desça controlado até sentir alongamento no tríceps, sem abrir os cotovelos pros lados.",
        }),
      ex("Prancha abdominal", 3, "30-45s", "Core", 45, "https://www.youtube.com/watch?v=DoOtkRaL1BI", "Como fazer", true,
        { note: "Corpo em linha reta da cabeça aos calcanhares — sem deixar o quadril cair ou subir demais. Contraia o abdômen e o glúteo, e respire normalmente durante todo o tempo." }),
      ex("Elevação de pernas no solo", 3, "15-20", "Core", 45, "https://www.youtube.com/watch?v=oq4Xb_xI618", "Passo a passo", false,
        { note: "Lombar sempre apoiada no chão — não deixe arquear. Se sentir tensão lombar, coloque as mãos embaixo do quadril. Controle a descida sem deixar as pernas baterem no chão." }),
    ],
  },
};
export const ROTATION = ["A", "B", "C"];
export const POSES = ["Frente", "Lado", "Costas"];
