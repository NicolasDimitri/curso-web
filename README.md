# Curso de Programação Web – Projetos Práticos

Trilha: **HTML → HTML + CSS → HTML + CSS + JavaScript → React**.
Cada projeto fica em `projetos/<nome>/` e tem um `REQUISITOS.md` com o que precisa ser feito.

| Módulo | Projeto | Pasta |
|---|---|---|
| HTML | Currículo pessoal | `projetos/01-curriculo` |
| HTML | Página de receita | `projetos/02-receita` |
| HTML + CSS | Cartão de perfil | `projetos/03-cartao-perfil` |
| HTML + CSS | Landing page de restaurante | `projetos/04-landing-restaurante` |

## Como entregar um projeto

1. `git switch main && git pull`
2. Crie uma branch: `git switch -c projeto-01-curriculo`
3. Faça o projeto dentro da pasta dele, seguindo o `REQUISITOS.md`.
4. `git add .` → `git commit -m "mensagem"` → `git push -u origin projeto-01-curriculo`
5. Abra um **Pull Request** no GitHub para a `main`.
6. A **Autoavaliação** roda sozinha. Veja o resultado na aba *Checks* do PR.
   Itens ❌ mostram a mensagem do que falta. Corrija, faça novo commit + `git push` e ela roda de novo.
7. Com tudo ✅, faça o merge.

## Rodando os testes no seu computador (opcional)

```bash
npm install
npx playwright install --with-deps chromium   # só na primeira vez
npx playwright test 01                        # testa só o projeto 01
```

> Não altere as pastas `tests/` e `.github/`.
