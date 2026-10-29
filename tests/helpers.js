const fs = require('fs');
const path = require('path');

const RAIZ = path.resolve(__dirname, '..');

const caminho = (projeto, arquivo = 'index.html') =>
  path.join(RAIZ, 'projetos', projeto, arquivo);

function ler(projeto, arquivo = 'index.html') {
  const c = caminho(projeto, arquivo);
  if (!fs.existsSync(c)) {
    throw new Error(`Arquivo não encontrado: projetos/${projeto}/${arquivo}`);
  }
  return fs.readFileSync(c, 'utf8');
}

async function abrir(page, projeto, largura = 1280) {
  const c = caminho(projeto);
  if (!fs.existsSync(c)) {
    throw new Error(`Arquivo não encontrado: projetos/${projeto}/index.html`);
  }
  await page.setViewportSize({ width: largura, height: 800 });
  await page.goto('file://' + c);
}

// Lê estilos calculados (o que o navegador realmente aplicou) de um elemento
async function estilo(page, seletor, props, i = 0) {
  return page.evaluate(([s, ps, i]) => {
    const e = document.querySelectorAll(s)[i];
    if (!e) return null;
    const cs = getComputedStyle(e);
    return Object.fromEntries(ps.map((p) => [p, cs[p]]));
  }, [seletor, props, i]);
}

// Posição e tamanho de um elemento na página
async function caixa(page, seletor, i = 0) {
  return page.evaluate(([s, i]) => {
    const e = document.querySelectorAll(s)[i];
    if (!e) return null;
    const r = e.getBoundingClientRect();
    return { x: r.left, y: r.top + scrollY, t: r.top, w: r.width, h: r.height };
  }, [seletor, i]);
}

const px = (v) => parseFloat(v) || 0;
const transparente = (c) => c === 'transparent' || c === 'rgba(0, 0, 0, 0)';
const branco = (c) => c === 'rgb(255, 255, 255)';

module.exports = { fs, ler, abrir, caminho, estilo, caixa, px, transparente, branco };
