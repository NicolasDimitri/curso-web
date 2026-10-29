const { test, expect } = require('@playwright/test');
const { ler, abrir } = require('./helpers');

const P = '02-receita';

test.beforeEach(async ({ page }) => {
  await abrir(page, P);
});

const maiorLista = (page, tag) =>
  page.evaluate(
    (t) => Math.max(0, ...[...document.querySelectorAll(t)].map((l) => l.querySelectorAll(':scope > li').length)),
    tag
  );

test('R1 – Base do documento: doctype, lang pt-BR, charset UTF-8 e <title>', async ({ page }) => {
  expect(ler(P), 'Falta <!DOCTYPE html>').toMatch(/^\s*<!doctype html>/i);
  const info = await page.evaluate(() => ({
    lang: document.documentElement.getAttribute('lang'),
    charset: document.querySelector('head meta[charset]')?.getAttribute('charset') || '',
    title: document.title.trim(),
  }));
  expect(info.lang, 'Falta lang="pt-BR" no <html>').toBe('pt-BR');
  expect(info.charset.toLowerCase(), 'Falta <meta charset="UTF-8">').toBe('utf-8');
  expect(info.title.length, '<title> vazio').toBeGreaterThan(2);
});

test('R2 – <header> com <h1> e <nav> com 3+ links internos que apontam para ids existentes', async ({ page }) => {
  expect(await page.locator('header h1').count(), 'Falta um <h1> dentro do <header>').toBe(1);
  const links = await page.evaluate(() =>
    [...document.querySelectorAll('nav a')].map((a) => {
      const href = a.getAttribute('href') || '';
      return { href, existe: href.startsWith('#') && !!document.getElementById(href.slice(1)) };
    })
  );
  expect(links.length, 'O <nav> precisa de pelo menos 3 links <a>').toBeGreaterThanOrEqual(3);
  const ruins = links.filter((l) => !l.existe).map((l) => l.href || '(vazio)');
  expect(ruins, `Estes links não apontam para um id existente na página: ${ruins.join(', ')}`).toEqual([]);
});

test('R3 – <main> tem 3+ <section>, cada uma com id e um <h2>', async ({ page }) => {
  const secs = await page.evaluate(() =>
    [...document.querySelectorAll('main section')].map((s) => ({ id: s.id, h2: !!s.querySelector('h2') }))
  );
  expect(secs.length, 'Use pelo menos 3 <section> dentro do <main>').toBeGreaterThanOrEqual(3);
  expect(secs.every((s) => s.id), 'Toda <section> precisa de um atributo id').toBe(true);
  expect(secs.every((s) => s.h2), 'Toda <section> precisa de um <h2>').toBe(true);
});

test('R4 – Lista de ingredientes: <ul> com 5+ <li>', async ({ page }) => {
  expect(await maiorLista(page, 'ul'), 'Nenhuma <ul> tem 5 ou mais <li>').toBeGreaterThanOrEqual(5);
});

test('R5 – Modo de preparo: <ol> com 4+ <li>', async ({ page }) => {
  expect(await maiorLista(page, 'ol'), 'Nenhuma <ol> tem 4 ou mais <li>').toBeGreaterThanOrEqual(4);
});

test('R6 – Tabela nutricional completa (caption, thead com 3+ th, tbody com 3+ linhas regulares)', async ({ page }) => {
  const t = await page.evaluate(() => {
    const tb = document.querySelector('table');
    if (!tb) return null;
    const ths = tb.querySelectorAll('thead th').length;
    const rows = [...tb.querySelectorAll('tbody tr')];
    return {
      caption: !!tb.querySelector('caption'),
      ths,
      rows: rows.length,
      regulares: rows.every((r) => r.children.length === ths),
    };
  });
  expect(t, 'Falta uma <table>').not.toBeNull();
  expect(t.caption, 'A tabela precisa de <caption>').toBe(true);
  expect(t.ths, 'O <thead> precisa de 3+ <th>').toBeGreaterThanOrEqual(3);
  expect(t.rows, 'O <tbody> precisa de 3+ <tr>').toBeGreaterThanOrEqual(3);
  expect(t.regulares, 'Toda linha do <tbody> precisa ter o mesmo nº de células que o <thead>').toBe(true);
});

test('R7 – <figure> com <img> (alt preenchido) e <figcaption>', async ({ page }) => {
  const f = await page.evaluate(() => {
    const fig = document.querySelector('figure');
    if (!fig) return null;
    return {
      alt: (fig.querySelector('img')?.getAttribute('alt') || '').trim(),
      img: !!fig.querySelector('img'),
      cap: (fig.querySelector('figcaption')?.textContent || '').trim(),
    };
  });
  expect(f, 'Falta uma <figure>').not.toBeNull();
  expect(f.img, 'A <figure> precisa de uma <img>').toBe(true);
  expect(f.alt.length, 'A <img> precisa de alt').toBeGreaterThanOrEqual(3);
  expect(f.cap.length, 'A <figure> precisa de <figcaption> com texto').toBeGreaterThan(0);
});

test('R8 – Existe <form> com botão <button type="submit">', async ({ page }) => {
  expect(await page.locator('form').count(), 'Falta um <form>').toBeGreaterThanOrEqual(1);
  expect(await page.locator('form button[type="submit"]').count(), 'Falta <button type="submit"> dentro do <form>').toBeGreaterThanOrEqual(1);
});

test('R9 – Todo campo do formulário tem um <label> associado', async ({ page }) => {
  const r = await page.evaluate(() => {
    const campos = [...document.querySelectorAll('form input, form select, form textarea')].filter(
      (e) => !['submit', 'button', 'hidden'].includes(e.type)
    );
    return {
      total: campos.length,
      semLabel: campos.filter((e) => !(e.labels && e.labels.length)).map((e) => e.name || e.id || e.type),
    };
  });
  expect(r.total, 'O formulário precisa de pelo menos 5 campos').toBeGreaterThanOrEqual(5);
  expect(r.semLabel, `Campos sem <label> (use for/id): ${r.semLabel.join(', ')}`).toEqual([]);
});

test('R10 – Campos com name; nome (text) e e-mail (email) são obrigatórios', async ({ page }) => {
  const r = await page.evaluate(() => ({
    semName: [...document.querySelectorAll('form input, form select, form textarea')]
      .filter((e) => !['submit', 'button'].includes(e.type) && !e.name).length,
    texto: document.querySelectorAll('form input[type="text"][required]').length,
    email: document.querySelectorAll('form input[type="email"][required]').length,
  }));
  expect(r.semName, 'Todo campo precisa do atributo name').toBe(0);
  expect(r.texto, 'Precisa de um <input type="text" required>').toBeGreaterThanOrEqual(1);
  expect(r.email, 'Precisa de um <input type="email" required>').toBeGreaterThanOrEqual(1);
});

test('R11 – Tem <select> (3+ opções), <textarea maxlength>, 2+ radios do mesmo grupo e 1+ checkbox', async ({ page }) => {
  const r = await page.evaluate(() => {
    const grupos = {};
    document.querySelectorAll('form input[type="radio"]').forEach((r) => {
      grupos[r.name] = (grupos[r.name] || 0) + 1;
    });
    return {
      opcoes: Math.max(0, ...[...document.querySelectorAll('form select')].map((s) => s.options.length)),
      textarea: document.querySelectorAll('form textarea[maxlength]').length,
      radios: Math.max(0, ...Object.entries(grupos).filter(([n]) => n).map(([, c]) => c)),
      checks: document.querySelectorAll('form input[type="checkbox"]').length,
    };
  });
  expect(r.opcoes, '<select> precisa de 3+ <option>').toBeGreaterThanOrEqual(3);
  expect(r.textarea, 'Falta <textarea maxlength="...">').toBeGreaterThanOrEqual(1);
  expect(r.radios, 'Precisa de 2+ <input type="radio"> com o MESMO name').toBeGreaterThanOrEqual(2);
  expect(r.checks, 'Falta um <input type="checkbox">').toBeGreaterThanOrEqual(1);
});

test('R12 – Tem <footer> e não usa CSS ainda (sem style / <style>)', async ({ page }) => {
  expect(await page.locator('footer').count(), 'Falta o <footer>').toBeGreaterThanOrEqual(1);
  const html = ler(P);
  expect(html, 'Remova atributos style="..."').not.toMatch(/\sstyle\s*=/i);
  expect(html, 'Remova a tag <style>').not.toMatch(/<style/i);
});
