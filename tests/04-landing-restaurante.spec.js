const { test, expect } = require('@playwright/test');
const { ler, abrir, estilo, caixa, px, transparente, branco } = require('./helpers');

const P = '04-landing-restaurante';

test.beforeEach(async ({ page }) => {
  await abrir(page, P);
});

test('R1 – Base do HTML: doctype, lang pt-BR, charset UTF-8, <title> e viewport', async ({ page }) => {
  expect(ler(P), 'Falta <!DOCTYPE html>').toMatch(/^\s*<!doctype html>/i);
  const info = await page.evaluate(() => ({
    lang: document.documentElement.getAttribute('lang'),
    charset: document.querySelector('head meta[charset]')?.getAttribute('charset') || '',
    title: document.title.trim(),
    viewport: document.querySelector('head meta[name="viewport"]')?.getAttribute('content') || '',
  }));
  expect(info.lang, 'Falta lang="pt-BR"').toBe('pt-BR');
  expect(info.charset.toLowerCase(), 'Falta <meta charset="UTF-8">').toBe('utf-8');
  expect(info.title.length, '<title> vazio').toBeGreaterThan(2);
  expect(info.viewport, 'Falta <meta name="viewport" content="width=device-width, initial-scale=1.0">').toMatch(/width=device-width/);
});

test('R2 – CSS em arquivo externo style.css (sem style="" e sem <style>)', async ({ page }) => {
  const href = await page.evaluate(
    () => document.querySelector('head link[rel="stylesheet"]')?.getAttribute('href')
  );
  expect(href, 'Falta <link rel="stylesheet" href="style.css"> no <head>').toBe('style.css');
  expect(ler(P, 'style.css').trim().length, 'O style.css está praticamente vazio').toBeGreaterThan(300);
  const html = ler(P);
  expect(html, 'Não use style="..." no HTML').not.toMatch(/\sstyle\s*=/i);
  expect(html, 'Não use <style> no HTML').not.toMatch(/<style/i);
});

test('R3 – Estrutura semântica: header/nav, #inicio.hero, #cardapio com 3+ article.card, #contato, footer', async ({ page }) => {
  const s = await page.evaluate(() => {
    const cards = [...document.querySelectorAll('#cardapio .cards > article.card')];
    return {
      header: !!document.querySelector('body > header nav'),
      navLinks: [...document.querySelectorAll('header nav a')].map((a) => a.getAttribute('href')),
      hero: !!document.querySelector('main section#inicio.hero'),
      cardapio: !!document.querySelector('main section#cardapio'),
      contato: !!document.querySelector('main section#contato'),
      footer: !!document.querySelector('body > footer'),
      cards: cards.length,
      cardsCompletos: cards.every(
        (c) => c.querySelector('img') && c.querySelector('h3') && c.querySelector('p') && c.querySelector('.preco')
      ),
    };
  });
  expect(s.header, 'Falta <header> com <nav> direto dentro do <body>').toBe(true);
  expect(s.navLinks, 'O <nav> precisa ter links para #inicio, #cardapio e #contato').toEqual(
    expect.arrayContaining(['#inicio', '#cardapio', '#contato'])
  );
  expect(s.hero, 'Falta <section id="inicio" class="hero"> dentro do <main>').toBe(true);
  expect(s.cardapio, 'Falta <section id="cardapio"> dentro do <main>').toBe(true);
  expect(s.contato, 'Falta <section id="contato"> dentro do <main>').toBe(true);
  expect(s.footer, 'Falta <footer> direto dentro do <body>').toBe(true);
  expect(s.cards, 'Precisa de 3+ <article class="card"> dentro de .cards em #cardapio').toBeGreaterThanOrEqual(3);
  expect(s.cardsCompletos, 'Todo .card precisa de <img>, <h3>, <p> e um elemento .preco').toBe(true);
});

test('R4 – Variáveis CSS: 3+ definidas em :root e usadas 5+ vezes com var()', async () => {
  const css = ler(P, 'style.css');
  const root = css.match(/:root\s*{([^}]*)}/);
  expect(root, 'Falta um bloco :root { ... } com variáveis CSS').not.toBeNull();
  const definidas = (root[1].match(/--[\w-]+\s*:/g) || []).length;
  expect(definidas, 'Defina 3+ variáveis em :root (ex.: --cor-primaria)').toBeGreaterThanOrEqual(3);
  const usos = (css.match(/var\(\s*--/g) || []).length;
  expect(usos, 'Use as variáveis 5+ vezes com var(--nome)').toBeGreaterThanOrEqual(5);
});

test('R5 – box-sizing: border-box aplicado no body e nos cards', async ({ page }) => {
  const b = await estilo(page, 'body', ['boxSizing']);
  const c = await estilo(page, '.card', ['boxSizing']);
  expect(b.boxSizing, 'Aplique box-sizing: border-box (dica: * { box-sizing: border-box; })').toBe('border-box');
  expect(c.boxSizing, 'O .card também precisa de box-sizing: border-box').toBe('border-box');
});

test('R6 – Header fixo no topo ao rolar (sticky ou fixed, top: 0)', async ({ page }) => {
  const h = await estilo(page, 'body > header', ['position', 'top']);
  expect(['sticky', 'fixed'], 'O header precisa de position: sticky (ou fixed)').toContain(h.position);
  expect(px(h.top), 'O header precisa de top: 0').toBe(0);
  await page.evaluate(() => window.scrollTo(0, 400));
  const b = await caixa(page, 'body > header');
  expect(Math.abs(b.t), 'O header saiu do topo quando a página rolou').toBeLessThanOrEqual(1);
});

test('R7 – Menu com Flexbox: links na mesma linha com gap', async ({ page }) => {
  const n = await estilo(page, 'header nav', ['display', 'columnGap']);
  const u = (await page.locator('header nav ul').count()) ? await estilo(page, 'header nav ul', ['display', 'columnGap']) : null;
  const flex = [n, u].find((x) => x && x.display === 'flex');
  expect(flex, 'O <nav> (ou o <ul> dentro dele) precisa de display: flex').toBeTruthy();
  expect(px(flex.columnGap), 'Use gap para separar os links do menu').toBeGreaterThan(0);
  const tops = await page.evaluate(() =>
    [...document.querySelectorAll('header nav a')].map((a) => Math.round(a.getBoundingClientRect().top))
  );
  expect(tops.length, 'O menu precisa de 3+ links').toBeGreaterThanOrEqual(3);
  expect(new Set(tops).size, 'Os links do menu devem ficar na mesma linha no desktop').toBe(1);
});

test('R8 – Hero: altura mínima 300px, fundo colorido ou imagem, texto centralizado', async ({ page }) => {
  const h = await estilo(page, '.hero', ['backgroundColor', 'backgroundImage', 'textAlign']);
  const b = await caixa(page, '.hero');
  expect(b.h, 'O .hero deve ter pelo menos 300px de altura (min-height)').toBeGreaterThanOrEqual(300);
  const temFundo = h.backgroundImage !== 'none' || !(transparente(h.backgroundColor) || branco(h.backgroundColor));
  expect(temFundo, 'O .hero precisa de background-image ou background-color diferente de branco').toBe(true);
  expect(h.textAlign, 'O texto do .hero deve estar centralizado').toBe('center');
});

test('R9 – Cardápio no desktop: .cards usa Grid com 3 cards lado a lado', async ({ page }) => {
  const g = await estilo(page, '.cards', ['display', 'columnGap']);
  expect(g.display, '.cards precisa de display: grid').toBe('grid');
  expect(px(g.columnGap), 'Use gap no .cards').toBeGreaterThan(0);
  const pos = await page.evaluate(() =>
    [...document.querySelectorAll('.cards > .card')].slice(0, 3).map((c) => {
      const r = c.getBoundingClientRect();
      return { x: Math.round(r.left), y: Math.round(r.top) };
    })
  );
  expect(new Set(pos.map((p) => p.y)).size, 'Os 3 primeiros cards devem ficar na mesma linha (3 colunas)').toBe(1);
  expect(new Set(pos.map((p) => p.x)).size, 'Os 3 cards devem estar em colunas diferentes').toBe(3);
});

test('R10 – Responsivo: @media existe e, em 375px, cards em 1 coluna sem rolagem horizontal', async ({ page }) => {
  expect(ler(P, 'style.css'), 'Falta uma regra @media (max-width: ...) no CSS').toMatch(/@media[^{]*\(\s*(max|min)-width/);
  await abrir(page, P, 375);
  const pos = await page.evaluate(() =>
    [...document.querySelectorAll('.cards > .card')].map((c) => {
      const r = c.getBoundingClientRect();
      return { x: Math.round(r.left), y: Math.round(r.top) };
    })
  );
  expect(new Set(pos.map((p) => p.x)).size, 'No celular, os cards devem ficar um embaixo do outro (1 coluna)').toBe(1);
  expect(new Set(pos.map((p) => p.y)).size, 'No celular, cada card deve ficar em uma linha diferente').toBe(pos.length);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow, 'A página tem rolagem horizontal em 375px').toBeLessThanOrEqual(0);
});

test('R11 – Visual do card: imagem preenche a largura (cover, 120px+ de altura), cantos, sombra e preço em destaque', async ({ page }) => {
  const card = await estilo(page, '.card', ['borderTopLeftRadius', 'boxShadow']);
  expect(px(card.borderTopLeftRadius), 'border-radius do .card: 8px ou mais').toBeGreaterThanOrEqual(8);
  expect(card.boxShadow, 'O .card precisa de box-shadow').not.toBe('none');
  const img = await estilo(page, '.card img', ['objectFit']);
  const ib = await caixa(page, '.card img');
  const cb = await caixa(page, '.card');
  expect(img.objectFit, 'A imagem do card precisa de object-fit: cover').toBe('cover');
  expect(ib.h, 'A imagem do card precisa de altura fixa de 120px ou mais').toBeGreaterThanOrEqual(120);
  expect(Math.abs(ib.w - cb.w), 'A imagem deve ocupar a largura inteira do card (width: 100%)').toBeLessThanOrEqual(2);
  const preco = await estilo(page, '.card .preco', ['fontWeight', 'color']);
  const p = await estilo(page, '.card p', ['color']);
  expect(Number(preco.fontWeight), 'O .preco precisa de font-weight 600 ou mais').toBeGreaterThanOrEqual(600);
  expect(preco.color, 'O .preco deve ter cor diferente do texto do p').not.toBe(p.color);
});

test('R12 – Hover no card: transição suave e mudança visível (transform ou sombra)', async ({ page }) => {
  const ler_ = () => page.locator('.card').first().evaluate((e) => {
    const cs = getComputedStyle(e);
    return { t: cs.transform, s: cs.boxShadow, d: cs.transitionDuration };
  });
  const antes = await ler_();
  expect(Math.max(0, ...antes.d.split(',').map((x) => parseFloat(x) || 0)), 'Adicione transition ao .card').toBeGreaterThan(0);
  await page.locator('.card').first().hover();
  await page.waitForTimeout(700);
  const depois = await ler_();
  expect(depois.t !== antes.t || depois.s !== antes.s, 'Crie .card:hover mudando transform e/ou box-shadow').toBe(true);
});

test('R13 – Footer: fundo diferente do body, texto centralizado, colado no fim da tela', async ({ page }) => {
  const f = await estilo(page, 'body > footer', ['backgroundColor', 'textAlign']);
  const b = await estilo(page, 'body', ['backgroundColor']);
  expect(transparente(f.backgroundColor), 'O footer precisa de background-color').toBe(false);
  expect(f.backgroundColor, 'O footer deve ter fundo diferente do body').not.toBe(b.backgroundColor);
  expect(f.textAlign, 'O texto do footer deve estar centralizado').toBe('center');
  const fb = await caixa(page, 'body > footer');
  expect(fb.y + fb.h, 'O footer deve chegar ao fim da tela (o conteúdo precisa preencher a janela)').toBeGreaterThanOrEqual(800);
});

test('R14 – Unidades relativas: font-size em rem/em em 3+ regras', async () => {
  const usos = (ler(P, 'style.css').match(/font-size\s*:\s*[\d.]+\s*(rem|em)\b/g) || []).length;
  expect(usos, 'Use rem ou em em pelo menos 3 declarações de font-size (evite px para fontes)').toBeGreaterThanOrEqual(3);
});
