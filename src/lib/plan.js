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
        { loadMultiplier: 0.18, equipment: "dumbbell" }),
      ex("Puxada frontal (pulley/graviton)", 4, "10-12", "Costas", 90, "https://www.youtube.com/watch?v=7cCiQUdIXWw", "Fisioprev", false,
        { loadMultiplier: 0.5, equipment: "machine" }),
      ex("Desenvolvimento com halteres", 3, "10-12", "Ombro", 60, "https://www.youtube.com/watch?v=eufDL9MmF8A", "Como Fazer", false,
        { loadMultiplier: 0.18, equipment: "dumbbell" }),
      ex("Remada baixa (cabo/máquina)", 3, "10-12", "Costas", 60, "https://www.youtube.com/watch?v=2YebbYuuBJQ", "Postura correta", false,
        { loadMultiplier: 0.5, equipment: "machine" }),
      ex("Crucifixo reto com halteres", 3, "12-15", "Peito", 60, "https://www.youtube.com/watch?v=DqL31nkLyRQ", "Execução Perfeita", false,
        {
          loadMultiplier: 0.12, equipment: "dumbbell",
          note: "Cotovelos levemente flexionados e travados durante todo o movimento — não flexione/estenda no meio da série. Desça só até sentir alongamento no peitoral, sem forçar o ombro. Sem banco reto? Dá pra fazer deitada no chão (reduz um pouco a amplitude, mas é seguro).",
        }),
      ex("Elevação lateral", 3, "12-15", "Ombro", 45, "https://www.youtube.com/watch?v=jannLx4RxKo", "Técnica correta", false,
        { loadMultiplier: 0.14, equipment: "dumbbell" }),
      ex("Rosca direta", 3, "10-12", "Bíceps", 45, "https://www.youtube.com/watch?v=Et1wgGMGW8w", "Como fazer", false,
        { loadMultiplier: 0.14, equipment: "dumbbell" }),
      ex("Tríceps corda na polia", 3, "10-12", "Tríceps", 45, "https://www.youtube.com/watch?v=7le1JRUUagM", "Postura correta", false,
        { loadMultiplier: 0.14, equipment: "machine" }),
    ],
  },
  B: {
    label: "Treino B",
    focus: "Inferiores — Quadríceps, Posteriores, Glúteos e Panturrilha",
    exercises: [
      ex("Agachamento livre/smith", 4, "8-12", "Quadríceps", 120, "https://www.youtube.com/watch?v=nrM8zB5-gtE", "Sesc+Treino", false,
        { loadMultiplier: 0.72, equipment: "barbell" }),
      ex("Subida no caixote com halteres (Step-up)", 4, "10-12 cada perna", "Quadríceps", 90, "https://www.youtube.com/watch?v=zquPhOg95Fw", "Canal Combate", false,
        {
          loadMultiplier: 0.3, equipment: "dumbbell",
          note: "Altura do caixote no joelho ou um pouco abaixo. Empurre com o calcanhar da perna de cima, evitando impulso da perna de baixo.",
        }),
      ex("Cadeira extensora", 3, "12-15", "Quadríceps", 60, "https://www.youtube.com/watch?v=mruTNzILY3U", "Erros e ajustes", false,
        { loadMultiplier: 0.3, equipment: "machine" }),
      ex("Stiff", 4, "10-12", "Posteriores", 90, "https://www.youtube.com/watch?v=634HxkLQMwo", "Sport Extrema", false,
        { loadMultiplier: 0.72, equipment: "barbell" }),
      ex("Mesa/cadeira flexora", 3, "12-15", "Posteriores", 60, "https://www.youtube.com/watch?v=8Nat6GRiEoc", "Execução correta", false,
        { loadMultiplier: 0.3, equipment: "machine" }),
      ex("Elevação pélvica (hip thrust)", 4, "10-15", "Glúteos", 90, "https://www.youtube.com/watch?v=nwkXOSKGnQQ", "Smart Fit", false,
        { loadMultiplier: 1.0, equipment: "barbell" }),
      ex("Abdução de quadril", 3, "15-20", "Glúteos", 45, "https://www.youtube.com/watch?v=50qHGus1TZk", "Postura correta", false,
        { loadMultiplier: 0.3, equipment: "machine" }),
      ex("Panturrilha em pé", 4, "15-20", "Panturrilha", 45, "https://www.youtube.com/watch?v=qWHH0We_9r0", "Melhor forma", false,
        { loadMultiplier: 0.3, equipment: "machine" }),
    ],
  },
  C: {
    label: "Treino C",
    focus: "Full Body + Core",
    exercises: [
      ex("Afundo com halteres", 3, "10-12 cada perna", "Glúteos", 90, "https://www.youtube.com/watch?v=9bxRdpUFW4c", "Aprenda a fazer", false,
        { loadMultiplier: 0.3, equipment: "dumbbell" }),
      ex("Remada unilateral com halter", 3, "10-12 cada lado", "Costas", 60, "https://www.youtube.com/watch?v=LhLDYH-ExbE", "Treino Correto", false,
        { loadMultiplier: 0.5, equipment: "dumbbell" }),
      ex("Elevação frontal com halteres", 3, "10-12", "Ombro", 60, "https://www.youtube.com/watch?v=HgmuchoLIAY", "Fisioprev", false,
        { loadMultiplier: 0.14, equipment: "dumbbell" }),
      ex("Glúteo em 4 apoios", 3, "12-15 cada lado", "Glúteos", 45, "https://www.youtube.com/watch?v=J_lccrQ6-7Y", "Passo a passo"),
      ex("Rosca martelo", 3, "10-12", "Bíceps", 45, "https://www.youtube.com/watch?v=1-xCKLVxqqg", "Fisioprev", false,
        { loadMultiplier: 0.14, equipment: "dumbbell" }),
      ex("Tríceps francês", 3, "10-12", "Tríceps", 45, "https://www.youtube.com/watch?v=KXtq1r5eoOQ", "Fisioprev", false,
        { loadMultiplier: 0.14, equipment: "dumbbell" }),
      ex("Prancha abdominal", 3, "30-45s", "Core", 45, "https://www.youtube.com/watch?v=DoOtkRaL1BI", "Como fazer", true),
      ex("Elevação de pernas no solo", 3, "15-20", "Core", 45, "https://www.youtube.com/watch?v=oq4Xb_xI618", "Passo a passo", false,
        { note: "Lombar sempre apoiada no chão — não deixe arquear. Se sentir tensão lombar, coloque as mãos embaixo do quadril. Controle a descida sem deixar as pernas baterem no chão." }),
    ],
  },
};
export const ROTATION = ["A", "B", "C"];
export const POSES = ["Frente", "Lado", "Costas"];
