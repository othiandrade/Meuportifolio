# Portfólio — Thiago Andrade

Portfólio pessoal em página única, feito com HTML, CSS e JavaScript puro.
Graduando em Engenharia de Software na FIAP, em busca de estágio em tecnologia.

## Como abrir

Abra o `index.html` no navegador ou use a extensão **Live Server** do VS Code
(botão direito no arquivo → *Open with Live Server*).

## Estrutura

```
index.html   conteúdo e estrutura semântica
style.css    tokens de cor/tipografia, temas claro e escuro, layout e animações
script.js    relógios, tema, reveal no scroll, navegação ativa, timeline, typewriter, tilt e copiar e-mail
assets/      foto, ícones e imagens dos projetos (adicionar)
```

## O que falta preencher

Procure por `aqui -->` e `PLACEHOLDER` no `index.html`.

- [ ] **Foto**: salve em `assets/foto.jpg` e troque a `div` com "TA" pela `<img>` comentada no cartão do Sobre mim.
- [ ] **Ícones**: localização, e-mail, LinkedIn, GitHub, Instagram e categorias de skills (comentários `<!-- ícone ... aqui -->`).
- [ ] **GitHub e Instagram**: links e nomes de usuário na seção Contato.
- [ ] **Skills "Em aprendizado"**: confirme as tecnologias que está estudando (Python, Java, SQL e Lógica são exemplos).
- [ ] **Formação FIAP**: disciplinas, projetos ou destaques do curso.
- [ ] **Projetos**: os cards 2, 3 e 4 são fictícios (`PROJETO FICTÍCIO`). Troque por projetos reais e preencha os links "Código" e "Demo", inclusive do card do portfólio.
- [ ] **Certificações**: instituição emissora, data e link da credencial.
- [ ] **Metadados**: favicon, `og:image` e `og:url` no `<head>`.

## Personalização rápida

- **Cores**: variáveis no topo do `style.css` (`:root` para o tema claro e `[data-theme="dark"]` para o escuro).
- **Cidades do letreiro**: itens `data-tz` no header (fusos IANA, ex.: `America/Sao_Paulo`).
- **Frases do typewriter**: atributo `data-typewriter` na Hero.
- **Velocidade do letreiro**: `animation: ticker 70s` no `style.css`.

## Acessibilidade

- HTML semântico, link "Pular para o conteúdo" e foco visível em todos os elementos interativos.
- Contraste AA nos dois temas: o azul de destaque `#006DAA` é usado como fundo de botões, não como texto pequeno.
- Letreiro com botão de pausa (WCAG 2.2.2), que também pausa ao passar o mouse.
- `prefers-reduced-motion` respeitado: letreiro, blobs, typewriter, tilt e reveal ficam parados.
- O conteúdo que aparece no hover também aparece no foco do teclado, e nenhuma informação essencial depende dele.
- Sem JavaScript, todo o conteúdo continua visível.
