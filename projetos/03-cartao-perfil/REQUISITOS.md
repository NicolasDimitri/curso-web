# Projeto 03 – Cartão de perfil (HTML + CSS)

Crie `projetos/03-cartao-perfil/index.html` e `projetos/03-cartao-perfil/style.css`.
Um cartão de apresentação centralizado na tela, com foto, nome, descrição e botões de link.

**Estrutura HTML obrigatória**

```html
<div class="card">
  <img class="avatar" src="..." alt="...">
  <h1>Seu nome</h1>
  <p>Descrição curta</p>
  <div class="links">
    <a class="btn" href="...">GitHub</a>
    <a class="btn" href="...">LinkedIn</a>
  </div>
</div>
```

**Requisitos**

1. **R1** – Base do HTML: doctype, `lang="pt-BR"`, charset UTF-8 e `<title>`.
2. **R2** – O CSS está em `style.css`, ligado por `<link rel="stylesheet" href="style.css">` no `<head>`. Sem `style=""` e sem `<style>`.
3. **R3** – A estrutura acima existe (`.card` com `img.avatar`, `h1`, `p` e `.links` com 2+ `a.btn`).
4. **R4** – O `body` tem `margin: 0`, cor de fundo diferente de branco e uma `font-family` que não seja a padrão.
5. **R5** – O `.card` tem largura entre 250px e 480px, `border-radius` de 8px+, `box-shadow` e `padding` de 16px+.
6. **R6** – O cartão está centralizado na horizontal.
7. **R7** – O cartão está centralizado na vertical.
8. **R8** – O `.avatar` é quadrado, tem 80px+ e é um círculo perfeito.
9. **R9** – O `h1` é maior e de cor diferente do `p`; ambos com `text-align: center`.
10. **R10** – Os `.btn` têm cor de fundo, texto com cor diferente do fundo, padding (8px vertical / 16px horizontal, no mínimo), `border-radius` 4px+ e sem sublinhado.
11. **R11** – `.links` usa Flexbox com `gap`; os botões ficam lado a lado.
12. **R12** – `.btn:hover` muda a cor de fundo.
13. **R13** – Em tela de celular (375px) não existe rolagem horizontal e o cartão cabe na tela.
