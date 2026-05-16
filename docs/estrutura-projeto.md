# Estrutura de Pastas

Projeto desenvolvido com **Next.js**, **Tailwind CSS** e **daisyUI**.

A estrutura foi organizada para separar páginas, componentes reutilizáveis, funcionalidades e configurações do projeto.

### Estrutura geral

```txt
src/
  app/
  components/
  features/
  lib/
  hooks/
  utils/
  constants/

public/
  images/
```

---

### `src/app/`

Pasta principal do **App Router** do Next.js.

Contém páginas, layout global, providers e estilos globais.

```txt
src/app/
  layout.tsx
  page.tsx
  providers.tsx
  globals.css
```

- `layout.tsx`: layout global da aplicação.
- `page.tsx`: página inicial.
- `providers.tsx`: providers globais, como React Query e Toaster.
- `globals.css`: estilos globais, Tailwind e daisyUI.

---

### `src/components/`

Componentes reutilizáveis da aplicação.

```txt
src/components/
  layout/
  ui/
  feedback/
```

- `layout/`: header, sidebar, navbar e estrutura visual.
- `ui/`: botões, inputs, cards e modais.
- `feedback/`: loading, erro e estados vazios.

---

### `src/features/`

Funcionalidades principais do sistema.

```txt
src/features/
  foods/
  meal-plans/
  nutrition/
  pdf/
```

Cada funcionalidade pode ter suas próprias pastas de:

```txt
components/
services/
types/
utils/
```

---

### `src/features/foods/`

Responsável pela busca e seleção de alimentos.

Exemplos:

- autocomplete de alimentos;
- listagem de resultados;
- seleção de alimento para o plano alimentar.

---

### `src/features/meal-plans/`

Responsável pela montagem do plano alimentar.

Exemplos:

- criar plano;
- adicionar refeições;
- adicionar alimentos;
- informar quantidades;
- salvar ou editar plano.

---

### `src/features/nutrition/`

Responsável pela exibição dos dados nutricionais.

Exemplos:

- resumo de macros e micros;
- tabela nutricional;
- formatação de valores e unidades.

> O cálculo principal deve ficar no backend.
> O front-end apenas exibe e formata os dados.

---

### `src/features/pdf/`

Responsável pela geração do PDF do plano alimentar.

Exemplos:

- template do PDF;
- botão de download;
- logo da nutricionista;
- fundo e layout do documento.

---

### `src/lib/`

Configurações técnicas compartilhadas.

Exemplos:

- `api.ts`: configuração base das chamadas para o backend.
- `query-client.ts`: configuração do React Query.

---

### `src/hooks/`

Hooks reutilizáveis.

Exemplos:

- `useDebounce.ts`;
- `useFoodSearch.ts`.

---

### `src/utils/`

Funções auxiliares genéricas.

Exemplos:

- formatar números;
- formatar datas;
- normalizar textos.

---

### `src/constants/`

Constantes reutilizadas no projeto.

Exemplos:

- rotas;
- nomes fixos;
- labels de nutrientes.

---

### `public/`

Arquivos públicos e estáticos.

```txt
public/
  images/
```

Usado para imagens, logos e outros arquivos acessíveis publicamente.

---

### Resumo

A estrutura separa:

- páginas em `app/`;
- componentes reutilizáveis em `components/`;
- funcionalidades em `features/`;
- configurações em `lib/`;
- hooks em `hooks/`;
- funções auxiliares em `utils/`;
- constantes em `constants/`;
- arquivos públicos em `public/`.
