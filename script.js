const themeToggle = document.querySelector(".theme-loggle");
const promptForm = document.querySelector(".prompt-form");
const promptInput = document.querySelector(".prompt-input");
const promptBtn = document.querySelector(".prompt-btn");
const modelSelect = document.getElementById("model-select");
const countSelect = document.getElementById("count-select");
const ratioSelect = document.getElementById("ratio-select");
const gridGallery = document.querySelector(".gallery-grid");

const API_KEY = "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"; // 🔑 COLOQUE SUA API KEY DO HUGGING FACE AQUI

const examplePrompts = [
  "Um lobo majestoso em uma floresta coberta de neve, olhos brilhantes, iluminação cinematográfica, ultra realista, 8K",
  "Um leão na savana africana ao pôr do sol, poeira no ar, fotografia profissional, cores quentes",
  "Uma paisagem épica com montanhas gigantes, rios sinuosos e céu dramático ao entardecer, arte cinematográfica",
  "Uma floresta tropical com cachoeira cristalina, raios de sol atravessando as árvores, ultra detalhado",
  "Uma cidade futurista com prédios tecnológicos, hologramas flutuantes e carros voadores, estilo sci-fi, neon",
  "Uma metrópole cyberpunk à noite, ruas molhadas refletindo luzes neon, atmosfera futurista detalhada",
  "Humanos vivendo em uma cidade sustentável do futuro com jardins suspensos, drones e arquitetura avançada",
  "Uma colônia futurista em Marte com cúpulas de vidro e montanhas vermelhas ao fundo",
  "Personagem anime em uma cidade japonesa futurista à noite, chuva, reflexos neon, traço limpo",
  "Garota anime em um campo florido ao pôr do sol, cores suaves, atmosfera calma, estilo anime",
  "Retrato ultra realista de uma pessoa, iluminação de estúdio profissional, lente 85mm, profundidade de campo, 8K",
  "Fotografia ultra realista de um carro esportivo de luxo, reflexos perfeitos, estilo publicitário premium",
  "Imagem publicitária profissional de um produto moderno sobre fundo minimalista, iluminação perfeita",
  "Anúncio de tecnologia futurista com design clean, composição profissional, alta qualidade",
  "Produto de luxo em destaque com sombras suaves, fotografia comercial, alta conversão"
];


/* ===============================
   TEMA
================================ */
(() => {
  if (!themeToggle) return;

  const savedTheme = localStorage.getItem("theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const isDark = savedTheme === "dark" || (!savedTheme && prefersDark);

  document.body.classList.toggle("dark-theme", isDark);
  themeToggle.querySelector("i").className = isDark ? "bx bxs-moon" : "bx bxs-sun";
})();

const toggletheme = () => {
  const isDark = document.body.classList.toggle("dark-theme");
  localStorage.setItem("theme", isDark ? "dark" : "light");
  themeToggle.querySelector("i").className = isDark ? "bx bxs-moon" : "bx bxs-sun";
};

/* ===============================
   DIMENSÕES DA IMAGEM
================================ */
const getImageDimensions = (aspectRatio, baseSize = 512) => {
  const [w, h] = aspectRatio.split("/").map(Number);
  const scale = baseSize / Math.sqrt(w * h);

  let width = Math.floor((w * scale) / 16) * 16;
  let height = Math.floor((h * scale) / 16) * 16;

  return { width, height };
};

/* ===============================
   ATUALIZA CARD
================================ */
const updateImageCard = (index, imageUrl) => {
  const card = document.getElementById(`img-card-${index}`);
  if (!card) return;

  card.classList.remove("loading");
  card.innerHTML = `
    <img src="${imageUrl}" class="result-img" />
    <div class="img-overlay">
      <a href="${imageUrl}" download="image-${Date.now()}.png" class="img-download">
        <i class='bx bxs-download'></i>
      </a>
    </div>
  `;
};

/* ===============================
   GERAR IMAGEM (HUGGING FACE)
================================ */
const generateImage = async (model, count, ratio, prompt) => {
  const url = `https://api-inference.huggingface.co/models/${model}`;
  const { width, height } = getImageDimensions(ratio);

  const tasks = Array.from({ length: count }, async (_, i) => {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: { width, height },
          options: { wait_for_model: true, use_cache: false },
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Erro ao gerar imagem");
      }

      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);
      updateImageCard(i, imageUrl);
    } catch (err) {
      console.error(err);
    }
  });

  await Promise.allSettled(tasks);
};

/* ===============================
   CRIAR CARDS
================================ */
const createImageCards = (model, count, ratio, prompt) => {
  gridGallery.innerHTML = "";

  for (let i = 0; i < count; i++) {
    gridGallery.innerHTML += `
      <div class="img-card loading" id="img-card-${i}" style="aspect-ratio:${ratio}">
        <div class="status-container">
          <div class="spinner"></div>
          <p class="status-text">GERANDO...</p>
        </div>
      </div>
    `;
  }

  generateImage(model, count, ratio, prompt);
};

/* ===============================
   EVENTOS
================================ */
promptForm.addEventListener("submit", (e) => {
  e.preventDefault();

  if (!promptInput.value.trim()) return;

  createImageCards(
    modelSelect.value,
    parseInt(countSelect.value) || 1,
    ratioSelect.value || "1/1",
    promptInput.value.trim()
  );
});

promptBtn.addEventListener("click", () => {
  promptInput.value =
    examplePrompts[Math.floor(Math.random() * examplePrompts.length)];
  promptInput.focus();
});

themeToggle.addEventListener("click", toggletheme);
