# Projeto 04 – Landing page de restaurante (HTML + CSS)

Crie `projetos/04-landing-restaurante/index.html` e `style.css`: uma página de um restaurante (real ou inventado), responsiva.
Use imagens da internet (`https://...`) ou arquivos na pasta.

**Estrutura HTML obrigatória**

```html
<body>
  <header>
    <nav> links para #inicio, #cardapio e #contato </nav>
  </header>
  <main>
    <section id="inicio" class="hero"> ... </section>
    <section id="cardapio">
      <h2>Cardápio</h2>
      <div class="cards">
        <article class="card">
          <img src="..." alt="...">
          <h3>Prato</h3>
          <p>Descrição</p>
          <span class="preco">R$ 00,00</span>
        </article>
        <!-- 3 ou mais cards -->
      </div>
    </section>
    <section id="contato"> ... </section>
  </main>
  <footer> ... </footer>
</body>
```

**Requisitos**

1. **R1** – Base do HTML: doctype, `lang="pt-BR"`, charset, `<title>` e `<meta name="viewport" content="width=device-width, initial-scale=1.0">`.
2. **R2** – CSS em `style.css` ligado por `<link>`; sem `style=""` e sem `<style>`.
3. **R3** – A estrutura acima existe, com 3+ cards completos (`img`, `h3`, `p` e `.preco`).
4. **R4** – Variáveis CSS: 3+ definidas em `:root` e usadas 5+ vezes com `var(--nome)`.
5. **R5** – `box-sizing: border-box` aplicado (body e cards).
6. **R6** – O header fica fixo no topo ao rolar (`position: sticky` ou `fixed`, `top: 0`).
7. **R7** – O menu usa Flexbox, com `gap`, e os links ficam na mesma linha.
8. **R8** – O `.hero` tem 300px+ de altura, fundo colorido ou imagem e texto centralizado.
9. **R9** – `.cards` usa CSS Grid com 3 cards por linha no desktop, com `gap`.
10. **R10** – Existe `@media`; em 375px os cards ficam em 1 coluna e não há rolagem horizontal.
11. **R11** – Imagem do card ocupa a largura toda, com altura fixa (120px+) e `object-fit: cover`; o card tem `border-radius` 8px+ e `box-shadow`; o `.preco` tem `font-weight` 600+ e cor diferente do `p`.
12. **R12** – `.card` tem `transition`, e `.card:hover` muda `transform` e/ou `box-shadow`.
13. **R13** – O footer tem fundo diferente do body, texto centralizado e encosta no fim da tela.
14. **R14** – `font-size` em `rem` ou `em` em 3+ regras.
