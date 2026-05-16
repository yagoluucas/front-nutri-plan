# Design System — Nutriplan

Documentação prática de uso dos tokens e classes do design system do Nutriplan.

Este documento serve como guia rápido para saber **qual classe usar**, **quando usar** e **onde alterar** cada parte visual da aplicação.

---

## 1. Objetivo do design system

O design system do Nutriplan centraliza as decisões visuais da aplicação em tokens reutilizáveis.

A ideia é evitar o uso direto de classes genéricas do Tailwind como `emerald-600`, `zinc-900`, `red-50` ou similares dentro dos componentes finais.

Em vez disso, usamos tokens semânticos, como:

```tsx
bg-action-primary
text-content-primary
border-border-default
bg-feedback-error-bg
```

Isso deixa a aplicação mais consistente, mais fácil de manter e mais simples de evoluir.

---

## 2. Onde os tokens ficam definidos

Os tokens principais ficam no arquivo:

```txt
src/styles/design-system.css
```

Esse arquivo deve ser importado no:

```txt
src/app/globals.css
```

Exemplo:

```css
@import "tailwindcss";
@import "../styles/design-system.css";
```

---

## 3. Como ler os nomes das classes

A maioria das classes segue esta lógica:

```txt
tipo-contexto-função
```

Exemplos:

```txt
bg-action-primary
text-content-secondary
border-border-default
bg-surface-muted
text-feedback-error-text
```

Na prática:

| Prefixo | Significado |
|---|---|
| `bg-*` | Cor de fundo |
| `text-*` | Cor ou tamanho de texto |
| `border-*` | Cor de borda |
| `ring-*` | Cor de foco/ring |
| `shadow-*` | Sombra |
| `rounded-*` | Arredondamento |
| `font-*` | Peso ou família da fonte |

---

# 4. Mapa rápido de uso

Use esta tabela quando quiser localizar rapidamente qual token alterar.

| Quero alterar... | Classe usada no código | Token no `design-system.css` | Onde costuma aparecer |
|---|---|---|---|
| Cor principal da marca | `bg-brand-600` | `--color-brand-600` | Logo, destaques, elementos da marca |
| Botão primário | `bg-action-primary` | `--color-action-primary` | CTA principal |
| Hover do botão primário | `hover:bg-action-primary-hover` | `--color-action-primary-hover` | Estado hover do CTA |
| Pressed do botão primário | `active:bg-action-primary-pressed` | `--color-action-primary-pressed` | Clique/pressionado |
| Texto do botão primário | `text-action-primary-text` | `--color-action-primary-text` | Texto sobre fundo primário |
| Botão secundário | `bg-action-secondary` | `--color-action-secondary` | Ações secundárias |
| Texto do botão secundário | `text-action-secondary-text` | `--color-action-secondary-text` | Texto do botão secundário |
| Botão ghost | `bg-action-ghost-bg` | `--color-action-ghost-bg` | Ações discretas |
| Hover do botão ghost | `hover:bg-action-ghost-bg-hover` | `--color-action-ghost-bg-hover` | Hover de ação discreta |
| Texto principal | `text-content-primary` | `--color-content-primary` | Títulos e conteúdos importantes |
| Texto secundário | `text-content-secondary` | `--color-content-secondary` | Descrições e textos de apoio |
| Texto auxiliar | `text-content-muted` | `--color-content-muted` | Metadados, legendas e informações fracas |
| Placeholder | `placeholder:text-content-placeholder` | `--color-content-placeholder` | Inputs e textareas |
| Texto desabilitado | `text-content-disabled` | `--color-content-disabled` | Estados disabled |
| Texto invertido | `text-content-inverse` | `--color-content-inverse` | Texto sobre fundo escuro/colorido |
| Fundo da página | `bg-background-page` | `--color-background-page` | `body`, layouts principais |
| Fundo suave | `bg-background-subtle` | `--color-background-subtle` | Áreas secundárias |
| Card padrão | `bg-surface-default` | `--color-surface-default` | Cards, modais, dropdowns |
| Container neutro | `bg-surface-muted` | `--color-surface-muted` | Áreas internas e blocos neutros |
| Borda padrão | `border-border-default` | `--color-border-default` | Inputs, cards, tabelas |
| Borda sutil | `border-border-subtle` | `--color-border-subtle` | Separações muito leves |
| Borda forte | `border-border-strong` | `--color-border-strong` | Separação visual mais marcada |
| Erro — fundo | `bg-feedback-error-bg` | `--color-feedback-error-bg` | Alerts e mensagens de erro |
| Erro — texto | `text-feedback-error-text` | `--color-feedback-error-text` | Texto de erro |
| Erro — borda | `border-feedback-error-border` | `--color-feedback-error-border` | Bordas de alert/input inválido |
| Sucesso — fundo | `bg-feedback-success-bg` | `--color-feedback-success-bg` | Confirmações |
| Atenção — fundo | `bg-feedback-warning-bg` | `--color-feedback-warning-bg` | Avisos |
| Informação — fundo | `bg-feedback-info-bg` | `--color-feedback-info-bg` | Mensagens informativas |
| Arredondamento pequeno | `rounded-sm` | `--radius-sm` | Badges, tags e elementos compactos |
| Arredondamento médio | `rounded-md` | `--radius-md` | Inputs, selects e botões |
| Arredondamento grande | `rounded-lg` | `--radius-lg` | Cards, modais e containers |
| Sombra pequena | `shadow-sm` | `--shadow-sm` | Cards leves |
| Sombra média | `shadow-md` | `--shadow-md` | Dropdowns e cards destacados |
| Sombra grande | `shadow-lg` | `--shadow-lg` | Modais, popovers e overlays |

---

# 5. Tipografia

A fonte principal da aplicação é:

```txt
Inter
```

Fallback:

```txt
Noto Sans, system-ui, sans-serif
```

A fonte deve ser usada em toda a interface: títulos, textos, labels, inputs, botões, cards e tabelas.

---

## 5.1 Classes de tamanho de texto

| Nome | Classe Tailwind | Tamanho | Line-height | Peso recomendado | Uso |
|---|---|---:|---:|---:|---|
| Display | `text-display` | 36px | 40px | `font-bold` | Destaques muito fortes |
| Heading H1 | `text-heading-h1` | 30px | 36px | `font-bold` | Título principal da página |
| Heading H2 | `text-heading-h2` | 24px | 32px | `font-semibold` | Seção principal |
| Heading H3 | `text-heading-h3` | 20px | 28px | `font-semibold` | Card, bloco ou subseção |
| Heading H4 | `text-heading-h4` | 18px | 28px | `font-semibold` | Subtítulos internos |
| Body Large | `text-body-large` | 18px | 28px | `font-normal` | Texto explicativo em destaque |
| Body Default | `text-body-default` | 16px | 24px | `font-normal` | Texto padrão |
| Body Small | `text-body-small` | 14px | 20px | `font-normal` | Texto auxiliar |
| Label | `text-label` | 14px | 20px | `font-medium` | Labels de formulário |
| Button | `text-button` | 14px | 20px | `font-semibold` | Texto de botão |
| Caption | `text-caption` | 12px | 16px | `font-normal` | Metadados e observações |

---

## 5.2 Exemplos de uso

### Título principal de página

```tsx
<h1 className="text-heading-h1 font-bold text-content-primary">
  Planos alimentares
</h1>
```

Use para o principal título da tela.

---

### Descrição abaixo do título

```tsx
<p className="text-body-default font-normal text-content-secondary">
  Crie, organize e acompanhe os planos alimentares dos seus pacientes.
</p>
```

Use para textos explicativos ou descrições de apoio.

---

### Título de card

```tsx
<h2 className="text-heading-h3 font-semibold text-content-primary">
  Pacientes recentes
</h2>
```

Use em cards, blocos e seções internas.

---

### Texto auxiliar

```tsx
<span className="text-caption font-normal text-content-muted">
  Atualizado há 5 minutos
</span>
```

Use para metadados, observações, hints e informações de baixa hierarquia.

---

# 6. Cores da marca

Os tokens `brand-*` representam a identidade visual do Nutriplan.

Use esses tokens quando o elemento estiver ligado à marca, destaque visual ou identidade principal do produto.

| Classe | Token | Uso |
|---|---|---|
| `bg-brand-50` | `--color-brand-50` | Fundo muito suave da marca |
| `bg-brand-100` | `--color-brand-100` | Fundo suave |
| `bg-brand-200` | `--color-brand-200` | Estados leves |
| `bg-brand-300` | `--color-brand-300` | Destaques suaves |
| `bg-brand-400` | `--color-brand-400` | Elementos decorativos |
| `bg-brand-500` | `--color-brand-500` | Apoio visual |
| `bg-brand-600` | `--color-brand-600` | Cor principal |
| `bg-brand-700` | `--color-brand-700` | Hover ou destaque forte |
| `bg-brand-800` | `--color-brand-800` | Pressed ou contraste |
| `bg-brand-900` | `--color-brand-900` | Fundos escuros |
| `bg-brand-950` | `--color-brand-950` | Fundo muito escuro |

Exemplo:

```tsx
<div className="bg-brand-50 text-brand-800">
  Área de destaque suave
</div>
```

---

## Quando usar `brand-*` e quando usar `action-*`

Use `brand-*` para identidade visual.

Use `action-*` para elementos interativos.

Exemplo correto para botão:

```tsx
<button className="bg-action-primary text-action-primary-text">
  Criar plano alimentar
</button>
```

Evite usar diretamente `bg-brand-600` em botões principais, porque o botão deve seguir os tokens de ação. Assim, se no futuro a ação principal mudar de cor, você altera apenas `--color-action-primary`.

---

# 7. Content colors

Tokens de conteúdo controlam cores de texto e leitura.

| Classe | Token | Uso |
|---|---|---|
| `text-content-primary` | `--color-content-primary` | Títulos, textos principais e informações fortes |
| `text-content-secondary` | `--color-content-secondary` | Descrições e textos de apoio |
| `text-content-muted` | `--color-content-muted` | Metadados, legendas e informações de menor importância |
| `placeholder:text-content-placeholder` | `--color-content-placeholder` | Placeholder de inputs |
| `text-content-disabled` | `--color-content-disabled` | Texto em componentes desabilitados |
| `text-content-inverse` | `--color-content-inverse` | Texto sobre fundo escuro/colorido |

---

## Exemplos

### Título

```tsx
<h1 className="text-content-primary">
  Dashboard
</h1>
```

### Texto de apoio

```tsx
<p className="text-content-secondary">
  Acompanhe os planos alimentares criados recentemente.
</p>
```

### Texto auxiliar

```tsx
<span className="text-content-muted">
  12 pacientes cadastrados
</span>
```

### Placeholder

```tsx
<input
  className="placeholder:text-content-placeholder"
  placeholder="Digite o nome do paciente"
/>
```

---

# 8. Backgrounds e surfaces

Backgrounds são fundos estruturais da página.

Surfaces são superfícies de componentes, como cards, modais e dropdowns.

---

## 8.1 Backgrounds

| Classe | Token | Uso |
|---|---|---|
| `bg-background-page` | `--color-background-page` | Fundo principal da aplicação |
| `bg-background-subtle` | `--color-background-subtle` | Fundo secundário, áreas suaves e seções internas |

Exemplo:

```tsx
<main className="min-h-screen bg-background-page">
  ...
</main>
```

---

## 8.2 Surfaces

| Classe | Token | Uso |
|---|---|---|
| `bg-surface-default` | `--color-surface-default` | Cards, modais, dropdowns e containers principais |
| `bg-surface-muted` | `--color-surface-muted` | Blocos neutros, áreas internas e estados suaves |
| `bg-surface-elevated` | `--color-surface-elevated` | Elementos acima da superfície base, geralmente com sombra |

Exemplo:

```tsx
<section className="rounded-lg border border-border-default bg-surface-default p-6 shadow-sm">
  ...
</section>
```

---

# 9. Borders e divisores

Tokens de borda definem separação visual entre elementos.

| Classe | Token | Uso |
|---|---|---|
| `border-border-subtle` | `--color-border-subtle` | Borda muito discreta |
| `border-border-default` | `--color-border-default` | Borda padrão de input, card e tabela |
| `border-border-strong` | `--color-border-strong` | Separação visual mais forte |
| `border-divider-default` | `--color-divider-default` | Divisores internos e linhas horizontais |

---

## Exemplos

### Card com borda padrão

```tsx
<div className="rounded-lg border border-border-default bg-surface-default">
  ...
</div>
```

### Linha divisória

```tsx
<hr className="border-divider-default" />
```

### Input com borda

```tsx
<input className="border border-border-default" />
```

---

# 10. Feedback colors

Feedback colors indicam estado do sistema: erro, sucesso, atenção ou informação.

Não use `red-*`, `green-*`, `yellow-*` ou `blue-*` diretamente em mensagens de sistema. Use os tokens semânticos.

---

## 10.1 Error

| Classe | Token | Uso |
|---|---|---|
| `bg-feedback-error-bg` | `--color-feedback-error-bg` | Fundo de alerta de erro |
| `border-feedback-error-border` | `--color-feedback-error-border` | Borda de erro |
| `text-feedback-error-text` | `--color-feedback-error-text` | Texto de erro |
| `bg-feedback-error-solid` | `--color-feedback-error-solid` | Ícone, badge ou ação destrutiva pontual |

Exemplo:

```tsx
<div className="rounded-md border border-feedback-error-border bg-feedback-error-bg p-4 text-feedback-error-text">
  Não foi possível salvar o plano alimentar.
</div>
```

---

## 10.2 Warning

| Classe | Token | Uso |
|---|---|---|
| `bg-feedback-warning-bg` | `--color-feedback-warning-bg` | Fundo de alerta de atenção |
| `border-feedback-warning-border` | `--color-feedback-warning-border` | Borda de atenção |
| `text-feedback-warning-text` | `--color-feedback-warning-text` | Texto de atenção |
| `bg-feedback-warning-solid` | `--color-feedback-warning-solid` | Ícone ou badge de atenção |

Exemplo:

```tsx
<div className="rounded-md border border-feedback-warning-border bg-feedback-warning-bg p-4 text-feedback-warning-text">
  Revise as informações antes de finalizar o plano.
</div>
```

---

## 10.3 Success

| Classe | Token | Uso |
|---|---|---|
| `bg-feedback-success-bg` | `--color-feedback-success-bg` | Fundo de confirmação |
| `border-feedback-success-border` | `--color-feedback-success-border` | Borda de sucesso |
| `text-feedback-success-text` | `--color-feedback-success-text` | Texto de sucesso |
| `bg-feedback-success-solid` | `--color-feedback-success-solid` | Ícone ou badge de sucesso |

Exemplo:

```tsx
<div className="rounded-md border border-feedback-success-border bg-feedback-success-bg p-4 text-feedback-success-text">
  Plano alimentar salvo com sucesso.
</div>
```

---

## 10.4 Info

| Classe | Token | Uso |
|---|---|---|
| `bg-feedback-info-bg` | `--color-feedback-info-bg` | Fundo de aviso informativo |
| `border-feedback-info-border` | `--color-feedback-info-border` | Borda informativa |
| `text-feedback-info-text` | `--color-feedback-info-text` | Texto informativo |
| `bg-feedback-info-solid` | `--color-feedback-info-solid` | Ícone ou badge informativo |

Exemplo:

```tsx
<div className="rounded-md border border-feedback-info-border bg-feedback-info-bg p-4 text-feedback-info-text">
  Você pode editar este plano a qualquer momento.
</div>
```

---

# 11. Action colors

Action colors são usados em elementos interativos, principalmente botões.

A regra é simples:

```txt
Botão usa action-*
Texto comum usa content-*
Feedback usa feedback-*
Marca usa brand-*
```

---

## 11.1 Primary action

Use para a ação mais importante da tela.

Exemplos:

- Criar plano alimentar
- Salvar alterações
- Adicionar paciente
- Continuar
- Confirmar

| Classe | Token | Uso |
|---|---|---|
| `bg-action-primary` | `--color-action-primary` | Fundo do botão primário |
| `hover:bg-action-primary-hover` | `--color-action-primary-hover` | Hover do botão primário |
| `active:bg-action-primary-pressed` | `--color-action-primary-pressed` | Estado pressionado |
| `focus-visible:ring-action-primary-focus` | `--color-action-primary-focus` | Foco acessível |
| `disabled:bg-action-primary-disabled` | `--color-action-primary-disabled` | Estado desabilitado |
| `text-action-primary-text` | `--color-action-primary-text` | Texto do botão primário |

Exemplo:

```tsx
<button className="rounded-md bg-action-primary px-4 py-2 text-button font-semibold text-action-primary-text hover:bg-action-primary-hover active:bg-action-primary-pressed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-primary-focus disabled:bg-action-primary-disabled">
  Criar plano alimentar
</button>
```

---

## 11.2 Secondary action

Use para ações importantes, mas que não são a ação principal da tela.

Exemplos:

- Cancelar
- Voltar
- Exportar
- Ver detalhes
- Duplicar plano

| Classe | Token | Uso |
|---|---|---|
| `bg-action-secondary` | `--color-action-secondary` | Fundo do botão secundário |
| `hover:bg-action-secondary-hover` | `--color-action-secondary-hover` | Hover |
| `active:bg-action-secondary-pressed` | `--color-action-secondary-pressed` | Estado pressionado |
| `focus-visible:ring-action-secondary-focus` | `--color-action-secondary-focus` | Foco acessível |
| `disabled:bg-action-secondary-disabled` | `--color-action-secondary-disabled` | Estado desabilitado |
| `text-action-secondary-text` | `--color-action-secondary-text` | Texto |

Exemplo:

```tsx
<button className="rounded-md bg-action-secondary px-4 py-2 text-button font-semibold text-action-secondary-text hover:bg-action-secondary-hover active:bg-action-secondary-pressed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-secondary-focus disabled:bg-action-secondary-disabled disabled:text-content-disabled">
  Cancelar
</button>
```

---

## 11.3 Ghost action

Use quando a ação deve existir, mas sem competir visualmente com o conteúdo.

Exemplos:

- Ver detalhes
- Editar item em uma tabela
- Abrir menu
- Limpar filtro
- Ações dentro de card

| Classe | Token | Uso |
|---|---|---|
| `bg-action-ghost-bg` | `--color-action-ghost-bg` | Fundo padrão |
| `hover:bg-action-ghost-bg-hover` | `--color-action-ghost-bg-hover` | Hover |
| `active:bg-action-ghost-bg-pressed` | `--color-action-ghost-bg-pressed` | Pressed |
| `focus-visible:ring-action-ghost-focus` | `--color-action-ghost-focus` | Foco acessível |
| `text-action-ghost-text` | `--color-action-ghost-text` | Texto padrão |
| `hover:text-action-ghost-text-hover` | `--color-action-ghost-text-hover` | Texto no hover |

Exemplo:

```tsx
<button className="rounded-md bg-action-ghost-bg px-3 py-2 text-button font-semibold text-action-ghost-text hover:bg-action-ghost-bg-hover hover:text-action-ghost-text-hover active:bg-action-ghost-bg-pressed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-ghost-focus">
  Ver detalhes
</button>
```

---

## 11.4 Destructive action

Use apenas para ações perigosas ou irreversíveis.

Exemplos:

- Excluir paciente
- Remover refeição
- Apagar plano alimentar
- Cancelar assinatura
- Descartar alterações

| Classe | Token | Uso |
|---|---|---|
| `bg-action-destructive` | `--color-action-destructive` | Fundo do botão destrutivo |
| `hover:bg-action-destructive-hover` | `--color-action-destructive-hover` | Hover |
| `active:bg-action-destructive-pressed` | `--color-action-destructive-pressed` | Pressed |
| `focus-visible:ring-action-destructive-focus` | `--color-action-destructive-focus` | Foco acessível |
| `disabled:bg-action-destructive-disabled` | `--color-action-destructive-disabled` | Estado desabilitado |
| `text-action-destructive-text` | `--color-action-destructive-text` | Texto |

Exemplo:

```tsx
<button className="rounded-md bg-action-destructive px-4 py-2 text-button font-semibold text-action-destructive-text hover:bg-action-destructive-hover active:bg-action-destructive-pressed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-destructive-focus disabled:bg-action-destructive-disabled">
  Excluir plano
</button>
```

---

# 12. Radius

O Nutriplan usa apenas três níveis de arredondamento para manter o MVP simples.

| Classe | Token | Uso |
|---|---|---|
| `rounded-sm` | `--radius-sm` | Badges, tags, chips e elementos pequenos |
| `rounded-md` | `--radius-md` | Inputs, selects, textareas e botões |
| `rounded-lg` | `--radius-lg` | Cards, modais, dropdowns e containers maiores |

---

## Exemplos

### Badge

```tsx
<span className="rounded-sm bg-feedback-success-bg px-2 py-1 text-caption text-feedback-success-text">
  Ativo
</span>
```

### Input

```tsx
<input className="rounded-md border border-border-default px-3 py-2" />
```

### Card

```tsx
<div className="rounded-lg border border-border-default bg-surface-default p-6">
  ...
</div>
```

---

# 13. Shadows

Sombras indicam elevação visual. Use com moderação.

| Classe | Token | Uso |
|---|---|---|
| `shadow-sm` | `--shadow-sm` | Cards leves e containers simples |
| `shadow-md` | `--shadow-md` | Cards destacados, dropdowns e menus |
| `shadow-lg` | `--shadow-lg` | Modais, popovers e elementos sobrepostos |

---

## Exemplos

### Card leve

```tsx
<div className="rounded-lg border border-border-default bg-surface-default p-6 shadow-sm">
  ...
</div>
```

### Dropdown

```tsx
<div className="rounded-lg border border-border-default bg-surface-elevated p-2 shadow-md">
  ...
</div>
```

### Modal

```tsx
<div className="rounded-lg bg-surface-elevated p-6 shadow-lg">
  ...
</div>
```

---

# 14. Espaçamento

Para espaçamento, o Nutriplan usa a escala padrão do Tailwind.

Não é necessário criar tokens próprios de spacing no MVP.

| Classe | Valor | Uso |
|---|---:|---|
| `p-1`, `gap-1`, `space-y-1` | 4px | Micro espaçamentos |
| `p-2`, `gap-2`, `space-y-2` | 8px | Ícone + texto, elementos compactos |
| `p-3`, `gap-3`, `space-y-3` | 12px | Inputs, células e blocos pequenos |
| `p-4`, `gap-4`, `space-y-4` | 16px | Espaçamento padrão interno |
| `p-6`, `gap-6`, `space-y-6` | 24px | Cards, formulários e seções internas |
| `p-8`, `gap-8`, `space-y-8` | 32px | Separação entre blocos maiores |
| `p-10`, `gap-10`, `space-y-10` | 40px | Layouts mais espaçosos |
| `p-12`, `gap-12`, `space-y-12` | 48px | Áreas principais da página |

---

## Recomendações práticas

| Elemento | Espaçamento recomendado |
|---|---|
| Botão pequeno | `px-3 py-2` |
| Botão padrão | `px-4 py-2` |
| Botão grande | `px-5 py-3` |
| Input | `px-3 py-2` |
| Card | `p-4` ou `p-6` |
| Seção de página | `space-y-6` ou `gap-6` |
| Layout principal | `p-6` ou `p-8` |
| Distância entre título e descrição | `space-y-2` |
| Distância entre seções | `space-y-8` |

---

# 15. Componentes base

Abaixo estão recomendações de classes para os principais componentes do Nutriplan.

---

## 15.1 Button

### Primary

```tsx
<button className="inline-flex items-center justify-center rounded-md bg-action-primary px-4 py-2 text-button font-semibold text-action-primary-text transition-colors hover:bg-action-primary-hover active:bg-action-primary-pressed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-primary-focus disabled:bg-action-primary-disabled disabled:text-content-disabled">
  Criar plano alimentar
</button>
```

Use para a ação principal da tela.

---

### Secondary

```tsx
<button className="inline-flex items-center justify-center rounded-md bg-action-secondary px-4 py-2 text-button font-semibold text-action-secondary-text transition-colors hover:bg-action-secondary-hover active:bg-action-secondary-pressed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-secondary-focus disabled:bg-action-secondary-disabled disabled:text-content-disabled">
  Cancelar
</button>
```

Use para ações secundárias.

---

### Ghost

```tsx
<button className="inline-flex items-center justify-center rounded-md bg-action-ghost-bg px-3 py-2 text-button font-semibold text-action-ghost-text transition-colors hover:bg-action-ghost-bg-hover hover:text-action-ghost-text-hover active:bg-action-ghost-bg-pressed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-ghost-focus">
  Ver detalhes
</button>
```

Use para ações discretas.

---

### Destructive

```tsx
<button className="inline-flex items-center justify-center rounded-md bg-action-destructive px-4 py-2 text-button font-semibold text-action-destructive-text transition-colors hover:bg-action-destructive-hover active:bg-action-destructive-pressed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-destructive-focus disabled:bg-action-destructive-disabled disabled:text-content-disabled">
  Excluir plano
</button>
```

Use para ações destrutivas.

---

## 15.2 Input

```tsx
<input
  className="w-full rounded-md border border-border-default bg-surface-default px-3 py-2 text-body-default text-content-primary placeholder:text-content-placeholder focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-primary-focus disabled:bg-surface-muted disabled:text-content-disabled"
  placeholder="Nome do paciente"
/>
```

Use em campos de texto simples.

---

## 15.3 Label

```tsx
<label className="text-label font-medium text-content-primary">
  Nome do paciente
</label>
```

Use sempre acima ou ao lado de campos de formulário.

---

## 15.4 Textarea

```tsx
<textarea
  className="min-h-24 w-full rounded-md border border-border-default bg-surface-default px-3 py-2 text-body-default text-content-primary placeholder:text-content-placeholder focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-primary-focus disabled:bg-surface-muted disabled:text-content-disabled"
  placeholder="Observações do plano alimentar"
/>
```

Use para textos longos, observações e descrições.

---

## 15.5 Card

```tsx
<section className="rounded-lg border border-border-default bg-surface-default p-6 shadow-sm">
  <h2 className="text-heading-h3 font-semibold text-content-primary">
    Planos recentes
  </h2>

  <p className="mt-2 text-body-small text-content-secondary">
    Acompanhe os últimos planos alimentares criados.
  </p>
</section>
```

Use para agrupar informações relacionadas.

---

## 15.6 Alert

```tsx
<div className="rounded-md border border-feedback-info-border bg-feedback-info-bg p-4 text-body-small text-feedback-info-text">
  Você pode editar este plano alimentar depois de salvá-lo.
</div>
```

Use para mensagens de sistema.

---

## 15.7 Badge

```tsx
<span className="inline-flex items-center rounded-sm bg-feedback-success-bg px-2 py-1 text-caption font-medium text-feedback-success-text">
  Ativo
</span>
```

Use para status curtos.

---

## 15.8 Table

```tsx
<div className="overflow-hidden rounded-lg border border-border-default bg-surface-default">
  <table className="w-full text-left text-body-small">
    <thead className="bg-surface-muted text-content-secondary">
      <tr>
        <th className="px-4 py-3 font-medium">Paciente</th>
        <th className="px-4 py-3 font-medium">Plano</th>
        <th className="px-4 py-3 font-medium">Status</th>
      </tr>
    </thead>

    <tbody className="divide-y divide-divider-default text-content-primary">
      <tr>
        <td className="px-4 py-3">Maria Silva</td>
        <td className="px-4 py-3">Plano semanal</td>
        <td className="px-4 py-3">Ativo</td>
      </tr>
    </tbody>
  </table>
</div>
```

Use para listas estruturadas de pacientes, planos, refeições e históricos.

---

# 16. Regras de decisão

## Quando usar cada cor

| Situação | Use |
|---|---|
| Identidade da marca | `brand-*` |
| Texto comum | `content-*` |
| Fundo estrutural | `background-*` |
| Card/modal/dropdown | `surface-*` |
| Borda/divisor | `border-*` / `divider-*` |
| Botão/ação interativa | `action-*` |
| Mensagem de sistema | `feedback-*` |

---

## Quando usar cada botão

| Situação | Variant recomendada |
|---|---|
| Ação principal da tela | `primary` |
| Ação secundária | `secondary` |
| Ação discreta | `ghost` |
| Ação perigosa | `destructive` |

---

## Quando usar cada radius

| Situação | Classe |
|---|---|
| Elemento pequeno | `rounded-sm` |
| Campo ou botão | `rounded-md` |
| Card ou container | `rounded-lg` |

---

## Quando usar cada sombra

| Situação | Classe |
|---|---|
| Elevação leve | `shadow-sm` |
| Elemento sobre a tela | `shadow-md` |
| Modal ou overlay | `shadow-lg` |

---

# 17. Boas práticas

## Faça

Use tokens semânticos:

```tsx
bg-action-primary
text-content-secondary
border-border-default
```

Use componentes reutilizáveis:

```tsx
<Button variant="primary" />
<Input />
<Card />
```

Use `action-*` para ações:

```tsx
bg-action-primary
hover:bg-action-primary-hover
```

Use `feedback-*` para mensagens do sistema:

```tsx
bg-feedback-error-bg
text-feedback-error-text
```

---

## Evite

Evite usar cores cruas do Tailwind nos componentes finais:

```tsx
bg-emerald-600
text-zinc-900
border-zinc-200
bg-red-50
```

Evite misturar `brand-*` com botão principal sem necessidade:

```tsx
bg-brand-600
```

Prefira:

```tsx
bg-action-primary
```

Evite usar sombras para criar bordas. Para limite visual, use `border-*`.

---

# 18. Exemplo de tela usando o design system

```tsx
export function MealPlansPage() {
  return (
    <main className="min-h-screen bg-background-page p-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="flex items-start justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-heading-h1 font-bold text-content-primary">
              Planos alimentares
            </h1>

            <p className="text-body-default text-content-secondary">
              Crie, organize e acompanhe os planos alimentares dos seus pacientes.
            </p>
          </div>

          <button className="inline-flex items-center justify-center rounded-md bg-action-primary px-4 py-2 text-button font-semibold text-action-primary-text transition-colors hover:bg-action-primary-hover active:bg-action-primary-pressed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-primary-focus">
            Criar plano alimentar
          </button>
        </header>

        <section className="rounded-lg border border-border-default bg-surface-default p-6 shadow-sm">
          <div className="space-y-1">
            <h2 className="text-heading-h3 font-semibold text-content-primary">
              Planos recentes
            </h2>

            <p className="text-body-small text-content-secondary">
              Últimos planos criados ou atualizados.
            </p>
          </div>

          <div className="mt-6 overflow-hidden rounded-lg border border-border-default">
            <table className="w-full text-left text-body-small">
              <thead className="bg-surface-muted text-content-secondary">
                <tr>
                  <th className="px-4 py-3 font-medium">Paciente</th>
                  <th className="px-4 py-3 font-medium">Plano</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Ações</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-divider-default text-content-primary">
                <tr>
                  <td className="px-4 py-3">Maria Silva</td>
                  <td className="px-4 py-3">Plano semanal</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex rounded-sm bg-feedback-success-bg px-2 py-1 text-caption font-medium text-feedback-success-text">
                      Ativo
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button className="rounded-md bg-action-ghost-bg px-3 py-2 text-button font-semibold text-action-ghost-text hover:bg-action-ghost-bg-hover hover:text-action-ghost-text-hover">
                      Ver detalhes
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
```

---

# 19. Checklist antes de criar um novo componente

Antes de criar um novo componente, valide:

```txt
1. Esse componente já existe?
2. Ele pode usar Button, Input, Card, Alert ou Badge?
3. A cor usada é semântica?
4. O texto usa a escala tipográfica definida?
5. O radius segue sm, md ou lg?
6. A sombra é realmente necessária?
7. O componente usa feedback-* para estados do sistema?
8. O componente usa action-* para ações?
9. O componente evita cores cruas do Tailwind?
10. O componente pode ser reutilizado em outra tela?
```

---

# 20. Resumo final

O design system do Nutriplan deve seguir esta lógica:

```txt
Poucos tokens.
Nomes semânticos.
Uso consistente.
Componentes reutilizáveis.
Visual limpo e profissional.
Fácil manutenção.
```

Sempre que tiver dúvida, procure primeiro no **Mapa rápido de uso** deste documento.
