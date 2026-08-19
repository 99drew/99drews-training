// ============================== PLANO PADRÃO ==============================
export const MUSCLES = ["Peito", "Costas", "Ombro", "Bíceps", "Tríceps", "Quadríceps", "Posteriores", "Glúteos", "Panturrilha", "Core"];

export function ex(name, sets, reps, muscle, rest, video, source, timed) {
  return { id: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"), name, sets, reps, muscle, rest, video, source, timed: !!timed };
}

export const DEFAULT_PLAN = {
  A: {
    label: "Treino A",
    focus: "Superiores — Peito, Costas, Ombro e Braços",
    exercises: [
      ex("Supino reto com halteres", 4, "10-12", "Peito", 90, "https://www.youtube.com/watch?v=tDxKGeY-hjQ", "Treino Mestre"),
      ex("Puxada frontal (pulley/graviton)", 4, "10-12", "Costas", 90, "https://www.youtube.com/watch?v=7cCiQUdIXWw", "Fisioprev"),
      ex("Desenvolvimento com halteres", 3, "10-12", "Ombro", 60, "https://www.youtube.com/watch?v=eufDL9MmF8A", "Como Fazer"),
      ex("Remada baixa (cabo/máquina)", 3, "10-12", "Costas", 60, "https://www.youtube.com/watch?v=2YebbYuuBJQ", "Postura correta"),
      ex("Crucifixo (polia/máquina)", 3, "12-15", "Peito", 60, "https://www.youtube.com/watch?v=vpH86Aj4OwU", "Fisioprev"),
      ex("Elevação lateral", 3, "12-15", "Ombro", 45, "https://www.youtube.com/watch?v=jannLx4RxKo", "Técnica correta"),
      ex("Rosca direta", 3, "10-12", "Bíceps", 45, "https://www.youtube.com/watch?v=Et1wgGMGW8w", "Como fazer"),
      ex("Tríceps corda na polia", 3, "10-12", "Tríceps", 45, "https://www.youtube.com/watch?v=7le1JRUUagM", "Postura correta"),
    ],
  },
  B: {
    label: "Treino B",
    focus: "Inferiores — Quadríceps, Posteriores, Glúteos e Panturrilha",
    exercises: [
      ex("Agachamento livre/smith", 4, "8-12", "Quadríceps", 120, "https://www.youtube.com/watch?v=nrM8zB5-gtE", "Sesc+Treino"),
      ex("Leg press 45°", 4, "10-12", "Quadríceps", 90, "https://www.youtube.com/watch?v=LMUMAhpdzIw", "TEF Play"),
      ex("Cadeira extensora", 3, "12-15", "Quadríceps", 60, "https://www.youtube.com/watch?v=mruTNzILY3U", "Erros e ajustes"),
      ex("Stiff", 4, "10-12", "Posteriores", 90, "https://www.youtube.com/watch?v=634HxkLQMwo", "Sport Extrema"),
      ex("Mesa/cadeira flexora", 3, "12-15", "Posteriores", 60, "https://www.youtube.com/watch?v=8Nat6GRiEoc", "Execução correta"),
      ex("Elevação pélvica (hip thrust)", 4, "10-15", "Glúteos", 90, "https://www.youtube.com/watch?v=nwkXOSKGnQQ", "Smart Fit"),
      ex("Abdução de quadril", 3, "15-20", "Glúteos", 45, "https://www.youtube.com/watch?v=50qHGus1TZk", "Postura correta"),
      ex("Panturrilha em pé", 4, "15-20", "Panturrilha", 45, "https://www.youtube.com/watch?v=qWHH0We_9r0", "Melhor forma"),
    ],
  },
  C: {
    label: "Treino C",
    focus: "Full Body + Core",
    exercises: [
      ex("Afundo com halteres", 3, "10-12 cada perna", "Glúteos", 90, "https://www.youtube.com/watch?v=9bxRdpUFW4c", "Aprenda a fazer"),
      ex("Remada unilateral com halter", 3, "10-12 cada lado", "Costas", 60, "https://www.youtube.com/watch?v=LhLDYH-ExbE", "Treino Correto"),
      ex("Elevação frontal com halteres", 3, "10-12", "Ombro", 60, "https://www.youtube.com/watch?v=HgmuchoLIAY", "Fisioprev"),
      ex("Glúteo em 4 apoios", 3, "12-15 cada lado", "Glúteos", 45, "https://www.youtube.com/watch?v=J_lccrQ6-7Y", "Passo a passo"),
      ex("Rosca martelo", 3, "10-12", "Bíceps", 45, "https://www.youtube.com/watch?v=1-xCKLVxqqg", "Fisioprev"),
      ex("Tríceps francês", 3, "10-12", "Tríceps", 45, "https://www.youtube.com/watch?v=KXtq1r5eoOQ", "Fisioprev"),
      ex("Prancha abdominal", 3, "30-45s", "Core", 45, "https://www.youtube.com/watch?v=DoOtkRaL1BI", "Como fazer", true),
      ex("Abdominal infra", 3, "15-20", "Core", 45, "https://www.youtube.com/watch?v=lsfYFbfE45o", "Passo a passo"),
    ],
  },
};
export const ROTATION = ["A", "B", "C"];
export const POSES = ["Frente", "Lado", "Costas"];
