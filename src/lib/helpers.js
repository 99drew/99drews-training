// ============================== HELPERS ==============================
export function todayISO() { return new Date().toISOString().slice(0, 10); }
export function fmtDate(iso) { return new Date(iso + "T00:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }); }
export function fmtDateFull(iso) { return new Date(iso + "T00:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" }); }
// Acha as séries do exercício na sessão registrada mais recente (sessions
// vem em ordem cronológica, então percorre de trás pra frente).
export function lastSetsFor(sessions, exerciseName) {
  for (let i = sessions.length - 1; i >= 0; i--) {
    const sets = sessions[i].exercises[exerciseName];
    if (sets && sets.length) return sets;
  }
  return null;
}

export function roundToIncrement(value, increment) {
  return Math.round(value / increment) * increment;
}

// Sugestão de carga inicial = peso corporal × loadMultiplier do exercício,
// arredondada pro incremento de anilha/halter disponível. null quando o
// exercício não tem loadMultiplier (ex: exercícios de peso corporal) ou
// não há peso corporal conhecido ainda.
export function suggestedWeight(exercise, bodyWeight) {
  if (!exercise.loadMultiplier || !bodyWeight) return null;
  const increment = exercise.equipment === "dumbbell" ? 1 : 2.5;
  const rounded = roundToIncrement(bodyWeight * exercise.loadMultiplier, increment);
  return rounded > 0 ? rounded : null;
}

// Primeiro número de uma faixa de reps ("10-12 cada perna" -> "10"), usado
// como meta inicial de repetições junto da sugestão de carga.
function targetRepsGuess(repsRange) {
  const match = String(repsRange).match(/\d+/);
  return match ? match[0] : "";
}

// Pré-preenche carga/reps com o que foi feito da última vez nesse exercício
// (por posição da série) — sempre prioridade sobre a sugestão calculada.
// Sem histórico, a 1ª série recebe a sugestão de carga baseada no peso
// corporal (quando o exercício tiver loadMultiplier). Começa sempre com
// "done: false" — os campos continuam editáveis normalmente, é só o valor
// inicial.
export function seedSets(exercise, lastSets, bodyWeight) {
  const suggestion = suggestedWeight(exercise, bodyWeight);
  return Array.from({ length: exercise.sets }, (_, i) => {
    const prev = lastSets && lastSets[i];
    if (prev) {
      return { weight: prev.weight ? String(prev.weight) : "", reps: prev.reps ? String(prev.reps) : "", done: false };
    }
    if (i === 0 && suggestion) {
      return { weight: String(suggestion), reps: targetRepsGuess(exercise.reps), done: false };
    }
    return { weight: "", reps: "", done: false };
  });
}
export function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }

export function beep() {
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    const ctx = new AC();
    [0, 0.18].forEach((t, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine";
      o.frequency.value = i === 0 ? 880 : 1046;
      g.gain.setValueAtTime(0.0001, ctx.currentTime + t);
      g.gain.exponentialRampToValueAtTime(0.35, ctx.currentTime + t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + t + 0.22);
      o.connect(g); g.connect(ctx.destination);
      o.start(ctx.currentTime + t);
      o.stop(ctx.currentTime + t + 0.24);
    });
  } catch (e) {}
  if (navigator.vibrate) { try { navigator.vibrate([180, 80, 180]); } catch (e) {} }
}

// Redimensiona e comprime a imagem no cliente antes de salvar, devolvendo um Blob
// (mais eficiente em IndexedDB do que uma data URL em base64).
export function resizeImage(file, maxW = 900, quality = 0.72) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new window.Image();
      img.onload = () => {
        const scale = Math.min(1, maxW / img.width);
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = w; canvas.height = h;
        canvas.getContext("2d").drawImage(img, 0, 0, w, h);
        canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("toBlob falhou"))), "image/jpeg", quality);
      };
      img.onerror = reject;
      img.src = reader.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
