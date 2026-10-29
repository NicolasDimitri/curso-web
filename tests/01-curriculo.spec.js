const { test, expect } = require('@playwright/test');
const { fs, ler, abrir, caminho } = require('./helpers');

const P = '01-curriculo';

test.beforeEach(async ({ page }) => {
  await abrir(page, P);
});

test('R1 – Começa com <!DOCTYPE html> e <html lang="pt-BR">', async ({ page }) => {
  expect(ler(P), 'Falta <!DOCTYPE html> no início do arquivo').toMatch(/^\s*<!doctype html>/i);
  const lang = await page.evaluate(() => document.documentElement.getAttribute('lang'));
  expect(lang, 'A tag <html> precisa de lang="pt-BR"').toBe('pt-BR');
});

test('R2 – <head> tem <meta charset="UTF-8"> e <title> preenchido', async ({ page }) => {
  const charset = await page.evaluate(
    () => document.querySelector('head meta[charset]')?.getAttribute('charset') || ''
  );
  expect(charset.toLowerCase(), 'Falta <meta charset="UTF-8"> dentro do <head>').toBe('utf-8');
  expect((await page.title()).trim().length, 'O <title> está vazio ou curto demais').toBeGreaterThan(2);
});

test('R3 – Usa exatamente um <header>, um <main> e um <footer>', async ({ page }) => {
  for (const tag of ['header', 'main', 'footer']) {
    expect(await page.locator(tag).count(), `Precisa de exatamente um <${tag}>`).toBe(1);
  }
});

test('R4 – Tem um único <h1> com texto, dentro do <header>', async ({ page }) => {
  expect(await page.locator('h1').count(), 'Precisa de exatamente um <h1>').toBe(1);
  expect(await page.locator('header h1').count(), 'O <h1> precisa estar dentro do <header>').toBe(1);
  const txt = (await page.locator('h1').innerText()).trim();
  expect(txt.length, 'O <h1> está vazio').toBeGreaterThan(1);
});

test('R5 – Tem pelo menos 3 <h2> com texto dentro do <main>', async ({ page }) => {
  const textos = await page.locator('main h2').allInnerTexts();
  const validos = textos.filter((t) => t.trim().length > 0);
  expect(validos.length, 'Use pelo menos 3 <h2> (com texto) dentro do <main>').toBeGreaterThanOrEqual(3);
});

test('R6 – Tem um parágrafo "Sobre mim" com pelo menos 20 palavras', async ({ page }) => {
  const ps = await page.locator('main p').allInnerTexts();
  const maior = Math.max(0, ...ps.map((p) => p.trim().split(/\s+/).filter(Boolean).length));
  expect(maior, 'Nenhum <p> dentro do <main> tem 20 palavras ou mais').toBeGreaterThanOrEqual(20);
});

test('R7 – Tem uma <img> com src, alt (3+ caracteres) e arquivo existente', async ({ page }) => {
  const imgs = await page.evaluate(() =>
    [...document.images].map((i) => ({
      src: i.getAttribute('src') || '',
      alt: (i.getAttribute('alt') || '').trim(),
    }))
  );
  expect(imgs.length, 'Falta uma <img>').toBeGreaterThanOrEqual(1);
  const img = imgs[0];
  expect(img.src, 'A <img> está sem src').not.toBe('');
  expect(img.alt.length, 'A <img> precisa de alt descritivo (3+ caracteres)').toBeGreaterThanOrEqual(3);
  if (!/^https?:/.test(img.src)) {
    expect(fs.existsSync(caminho(P, decodeURI(img.src))), `O arquivo "${img.src}" não existe na pasta do projeto`).toBe(true);
  }
});

test('R8 – Tem uma lista <ul> com pelo menos 3 <li> (habilidades)', async ({ page }) => {
  const n = await page.evaluate(() =>
    Math.max(0, ...[...document.querySelectorAll('ul')].map((u) => u.querySelectorAll(':scope > li').length))
  );
  expect(n, 'Nenhuma <ul> tem 3 ou mais <li>').toBeGreaterThanOrEqual(3);
});

test('R9 – Tem uma lista <ol> com pelo menos 2 <li> (formação/experiência)', async ({ page }) => {
  const n = await page.evaluate(() =>
    Math.max(0, ...[...document.querySelectorAll('ol')].map((u) => u.querySelectorAll(':scope > li').length))
  );
  expect(n, 'Nenhuma <ol> tem 2 ou mais <li>').toBeGreaterThanOrEqual(2);
});

test('R10 – Tem link externo https que abre em nova aba com rel="noopener"', async ({ page }) => {
  const ok = await page.evaluate(() =>
    [...document.querySelectorAll('a[href^="https://"]')].some(
      (a) => a.target === '_blank' && /noopener/.test(a.rel)
    )
  );
  expect(ok, 'Precisa de um <a href="https://..."> com target="_blank" e rel="noopener"').toBe(true);
});

test('R11 – Tem um link mailto: com e-mail válido', async ({ page }) => {
  const ok = await page.evaluate(() =>
    [...document.querySelectorAll('a[href^="mailto:"]')].some((a) =>
      /^mailto:[^@\s]+@[^@\s]+\.[^@\s]+$/.test(a.getAttribute('href'))
    )
  );
  expect(ok, 'Precisa de um <a href="mailto:seu@email.com">').toBe(true);
});

test('R12 – Não usa CSS ainda (sem atributo style e sem <style>)', async () => {
  const html = ler(P);
  expect(html, 'Remova atributos style="..." – CSS é assunto do próximo módulo').not.toMatch(/\sstyle\s*=/i);
  expect(html, 'Remova a tag <style> – CSS é assunto do próximo módulo').not.toMatch(/<style/i);
});
