const { test, expect } = require('@playwright/test');
const { ler, abrir, estilo, caixa, px, transparente, branco } = require('./helpers');

const P = '03-cartao-perfil';

test.beforeEach(async ({ page }) => {
  await abrir(page, P);
});

test('R1 – Base do HTML: doctype, lang pt-BR, charset UTF-8 e <title>', async ({ page }) => {
  expect(ler(P), 'Falta <!DOCTYPE html>').toMatch(/^\s*<!doctype html>/i);
  const info = await page.evaluate(() => ({
    lang: document.documentElement.getAttribute('lang'),
    charset: document.querySelector('head meta[charset]')?.getAttribute('charset') || '',
    title: document.title.trim(),
  }));
  expect(info.lang, 'Falta lang="pt-BR"').toBe('pt-BR');
  expect(info.charset.toLowerCase(), 'Falta <meta charset="UTF-8">').toBe('utf-8');
  expect(info.title.length, '<title> vazio').toBeGreaterThan(2);
});

test('R2 – CSS em arquivo externo style.css (sem style="" e sem <style>)', async ({ page }) => {
  const href = await page.evaluate(
    () => document.querySelector('head link[rel="stylesheet"]')?.getAttribute('href')
  );
  expect(href, 'Falta <link rel="stylesheet" href="style.css"> dentro do <head>').toBe('style.css');
  expect(ler(P, 'style.css').trim().length, 'O style.css está praticamente vazio').toBeGreaterThan(80);
  const html = ler(P);
  expect(html, 'Não use atributos style="..." no HTML').not.toMatch(/\sstyle\s*=/i);
  expect(html, 'Não use <style> no HTML').not.toMatch(/<style/i);
});

test('R3 – Estrutura: .card contendo img.avatar, h1, p e .links com 2+ a.btn', async ({ page }) => {
  const s = await page.evaluate(() => {
    const c = document.querySelector('.card');
    if (!c) return null;
    return {
      avatar: !!c.querySelector('img.avatar'),
      h1: !!c.querySelector('h1'),
      p: !!c.querySelector('p'),
      btns: c.querySelectorAll('.links a.btn').length,
    };
  });
  expect(s, 'Falta um elemento com class="card"').not.toBeNull();
  expect(s.avatar, 'Falta <img class="avatar"> dentro do .card').toBe(true);
  expect(s.h1, 'Falta <h1> dentro do .card').toBe(true);
  expect(s.p, 'Falta <p> dentro do .card').toBe(true);
  expect(s.btns, 'Precisa de 2+ <a class="btn"> dentro de um elemento .links').toBeGreaterThanOrEqual(2);
});

test('R4 – Página: margin do body zerada, fundo colorido e fonte diferente da padrão', async ({ page }) => {
  const b = await estilo(page, 'body', ['marginTop', 'marginLeft', 'backgroundColor', 'fontFamily']);
  expect(px(b.marginTop) + px(b.marginLeft), 'O body precisa de margin: 0').toBe(0);
  expect(transparente(b.backgroundColor) || branco(b.backgroundColor), 'O body precisa de background-color diferente de branco').toBe(false);
  expect(b.fontFamily, 'Defina um font-family no body (a padrão é Times)').not.toMatch(/times/i);
});

test('R5 – Card: largura entre 250px e 480px, border-radius 8px+, box-shadow e padding 16px+', async ({ page }) => {
  const c = await estilo(page, '.card', ['borderTopLeftRadius', 'boxShadow', 'paddingLeft', 'paddingTop']);
  const b = await caixa(page, '.card');
  expect(b.w, 'A largura do .card deve ser no máximo 480px').toBeLessThanOrEqual(480);
  expect(b.w, 'O .card está estreito demais (mínimo 250px)').toBeGreaterThanOrEqual(250);
  expect(px(c.borderTopLeftRadius), 'border-radius do .card deve ser 8px ou mais').toBeGreaterThanOrEqual(8);
  expect(c.boxShadow, 'O .card precisa de box-shadow').not.toBe('none');
  expect(px(c.paddingLeft), 'padding do .card deve ser 16px ou mais').toBeGreaterThanOrEqual(16);
  expect(px(c.paddingTop), 'padding do .card deve ser 16px ou mais').toBeGreaterThanOrEqual(16);
});

test('R6 – Card centralizado na horizontal (viewport 1280px)', async ({ page }) => {
  const b = await caixa(page, '.card');
  const centro = b.x + b.w / 2;
  expect(Math.abs(centro - 640), 'O .card não está centralizado horizontalmente').toBeLessThanOrEqual(2);
});

test('R7 – Card centralizado na vertical (viewport 800px de altura)', async ({ page }) => {
  const b = await caixa(page, '.card');
  const centro = b.t + b.h / 2;
  expect(Math.abs(centro - 400), 'O .card não está centralizado verticalmente (dica: min-height: 100vh)').toBeLessThanOrEqual(30);
});

test('R8 – Avatar: quadrado, 80px+ e totalmente redondo', async ({ page }) => {
  const a = await estilo(page, '.avatar', ['borderTopLeftRadius']);
  const b = await caixa(page, '.avatar');
  expect(a, 'Não achei .avatar').not.toBeNull();
  expect(b.w, 'O avatar precisa ter 80px ou mais de largura').toBeGreaterThanOrEqual(80);
  expect(Math.abs(b.w - b.h), 'O avatar precisa ser quadrado (largura = altura)').toBeLessThanOrEqual(1);
  const r = a.borderTopLeftRadius;
  const redondo = r === '50%' || px(r) >= b.w / 2 - 1;
  expect(redondo, 'O avatar precisa ser um círculo (border-radius: 50%)').toBe(true);
});

test('R9 – Tipografia: h1 maior e de cor diferente do p; textos centralizados', async ({ page }) => {
  const h = await estilo(page, '.card h1', ['fontSize', 'color', 'textAlign']);
  const p = await estilo(page, '.card p', ['fontSize', 'color', 'textAlign']);
  expect(px(h.fontSize), 'O h1 deve ter font-size maior que o p').toBeGreaterThan(px(p.fontSize));
  expect(h.color, 'O h1 deve ter cor diferente do p').not.toBe(p.color);
  expect(h.textAlign, 'O h1 deve ter text-align: center').toBe('center');
  expect(p.textAlign, 'O p deve ter text-align: center').toBe('center');
});

test('R10 – Botões .btn: fundo colorido, texto legível, padding, cantos arredondados, sem sublinhado', async ({ page }) => {
  const b = await estilo(page, '.btn', ['backgroundColor', 'color', 'paddingTop', 'paddingLeft', 'borderTopLeftRadius', 'textDecorationLine']);
  expect(b, 'Não achei .btn').not.toBeNull();
  expect(transparente(b.backgroundColor), 'O .btn precisa de background-color').toBe(false);
  expect(b.color, 'Texto e fundo do .btn não podem ter a mesma cor').not.toBe(b.backgroundColor);
  expect(px(b.paddingTop), 'padding vertical do .btn: 8px ou mais').toBeGreaterThanOrEqual(8);
  expect(px(b.paddingLeft), 'padding horizontal do .btn: 16px ou mais').toBeGreaterThanOrEqual(16);
  expect(px(b.borderTopLeftRadius), 'border-radius do .btn: 4px ou mais').toBeGreaterThanOrEqual(4);
  expect(b.textDecorationLine, 'Tire o sublinhado do .btn (text-decoration: none)').toBe('none');
});

test('R11 – .links usa Flexbox: botões lado a lado com espaço (gap) entre eles', async ({ page }) => {
  const l = await estilo(page, '.links', ['display', 'columnGap']);
  expect(l, 'Não achei .links').not.toBeNull();
  expect(l.display, '.links precisa de display: flex').toBe('flex');
  expect(px(l.columnGap), 'Use gap em .links para separar os botões').toBeGreaterThan(0);
  const tops = await page.evaluate(() =>
    [...document.querySelectorAll('.links .btn')].map((e) => Math.round(e.getBoundingClientRect().top))
  );
  expect(new Set(tops).size, 'Os botões devem ficar na mesma linha').toBe(1);
});

test('R12 – :hover no .btn muda a cor de fundo', async ({ page }) => {
  const btn = page.locator('.btn').first();
  const antes = await btn.evaluate((e) => getComputedStyle(e).backgroundColor);
  await btn.hover();
  await page.waitForTimeout(600);
  const depois = await btn.evaluate((e) => getComputedStyle(e).backgroundColor);
  expect(depois, 'Crie uma regra .btn:hover que mude o background-color').not.toBe(antes);
});

test('R13 – Responsivo: no celular (375px) não há rolagem horizontal e o card cabe na tela', async ({ page }) => {
  await abrir(page, P, 375);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow, 'A página tem rolagem horizontal em 375px').toBeLessThanOrEqual(0);
  const b = await caixa(page, '.card');
  expect(b.w, 'O .card ficou mais largo que a tela (dica: max-width em vez de width)').toBeLessThanOrEqual(375);
});
