import { Dumbbell, Footprints, Target } from "lucide-react";
import { C } from "../lib/theme";

const LOWER_BODY = new Set(["Quadríceps", "Posteriores", "Glúteos", "Panturrilha"]);

function fallbackIcon(muscle) {
  if (muscle === "Core") return Target;
  if (LOWER_BODY.has(muscle)) return Footprints;
  return Dumbbell;
}

// Imagem padronizada do exercício: thumbnail quadrado com cantos
// arredondados (mesmo tratamento em qualquer lugar que mostre o
// exercício — ExerciseLogCard, tela Editar). Sem `exercise.image` (fonte:
// wger.de, ver nota no rodapé da tela de treino), cai num ícone genérico
// por grupo muscular — nunca deixa o espaço vazio ou quebrado.
export default function ExerciseImage({ exercise, size = 56 }) {
  const Icon = fallbackIcon(exercise.muscle);
  return (
    <div style={{
      width: size, height: size, borderRadius: 12, overflow: "hidden", flexShrink: 0,
      background: exercise.image ? C.surface2 : `linear-gradient(160deg, ${C.primaryDim}, ${C.surface2})`,
      border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      {exercise.image
        ? <img src={exercise.image} alt={exercise.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        : <Icon size={size * 0.42} color={C.gold} />}
    </div>
  );
}
