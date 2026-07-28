# AGENTS.md — Nutri Plan Front-end

## 1. Objetivo

Este arquivo define as regras obrigatórias para agentes que alterem o front-end do Nutri Plan.

O projeto deve permanecer:

- seguro;
- previsível;
- fácil de revisar;
- simples de evoluir;
- coerente com o domínio de nutrição;
- responsivo em desktop e mobile;
- alinhado ao Design System existente.

Aplique DRY, DRI, SOLID, Domain-Driven Design e Clean Code de forma prática. Não crie abstrações, camadas, classes ou arquivos apenas para demonstrar um padrão arquitetural.

## 2. Contexto do projeto

O Nutri Plan é uma aplicação voltada à rotina de nutricionistas. O front-end oferece interface para:

- autenticação;
- gerenciamento de pacientes;
- criação e edição de planos alimentares;
- organização de refeições;
- busca de alimentos;
- cálculo e visualização nutricional;
- geração de PDF;
- indicadores e gráficos.

O front-end consome a API do Nutri Plan.

Rotas protegidas não devem ser chamadas diretamente pelo browser. Quando houver autenticação, utilize rotas internas do Next.js como proxy server-side.

## 3. Stack principal

- Next.js;
- React;
- TypeScript;
- Tailwind CSS;
- daisyUI;
- Zod;
- React Hook Form;
- TanStack React Query;
- Sonner;
- Recharts;
- `@react-pdf/renderer`;
- `lucide-react`.

Não introduza uma nova biblioteca quando a stack existente já resolver o problema adequadamente.

## 4. Estrutura real do projeto

```txt
src/
  app/
  components/
  features/
  hooks/
  lib/
  utils/
  constants/
  styles/

docs/
public/
```

Responsabilidades principais:

- `src/app`: App Router, páginas, layouts, providers e rotas internas de API.
- `src/components`: componentes compartilhados e genéricos de UI ou layout.
- `src/features/auth`: autenticação, formulários, schemas, serviços e constantes.
- `src/features/diet-plan`: alimentos, refeições, plano alimentar, cálculos, visualizações e PDF.

Não assuma que existem `src/features/foods` ou `src/features/meal-plans`. No projeto atual, dieta e alimentos pertencem a `src/features/diet-plan`.

Antes de criar uma pasta, confirme que a estrutura existente realmente não possui um local adequado.

## 5. Ordem de prioridade

Quando regras entrarem em conflito, siga esta ordem:

1. segurança e privacidade;
2. correção das regras de negócio;
3. compatibilidade dos contratos com o back-end;
4. escopo solicitado;
5. arquitetura e manutenibilidade;
6. acessibilidade e experiência do usuário;
7. desempenho;
8. preferência estética ou conveniência.

Nunca sacrifique segurança ou correção para reduzir linhas de código.

## 6. Protocolo obrigatório de alteração

Toda alteração deve seguir este fluxo:

1. entender exatamente o pedido;
2. localizar os arquivos diretamente relacionados;
3. identificar contratos, consumidores e dependências afetados;
4. alterar somente o necessário;
5. revisar o diff;
6. executar validações proporcionais ao risco;
7. informar o que foi alterado e o que não foi validado.

### 6.1 Alterações pequenas e cirúrgicas

É proibido apagar e reescrever um arquivo inteiro quando uma alteração localizada resolver o problema.

Ao modificar um arquivo:

- preserve conteúdo não relacionado;
- preserve comentários úteis;
- preserve a ordenação existente quando ela não fizer parte do problema;
- preserve o estilo adotado naquele arquivo;
- preserve encoding e fim de linha;
- não reorganize imports sem necessidade;
- não renomeie símbolos fora do escopo;
- não aplique formatação global para corrigir poucas linhas;
- não substitua código equivalente apenas por preferência pessoal.

Revise sempre:

```bash
git diff --check
git diff --stat
git diff -- caminho/do/arquivo
```

Se o arquivo inteiro aparecer como alterado por formatação, encoding ou fim de linha, reverta e reaplique a mudança de forma localizada.

Não execute formatadores no repositório inteiro sem solicitação explícita.

### 6.2 Controle de escopo

Não altere arquivos fora do escopo apenas para “melhorar” o projeto.

Não misture:

- correção pontual com refatoração ampla;
- correção de segurança com feature nova;
- mudança visual com reorganização arquitetural;
- atualização de contrato com renomeação generalizada.

Problemas fora do escopo devem ser citados no resumo final, não corrigidos silenciosamente.

## 7. Leitura eficiente do projeto

Priorize buscas objetivas com `rg`, leitura de arquivos específicos e inspeção incremental.

Nunca leia `node_modules` nem pastas geradas:

- `.next`;
- `dist`;
- `build`;
- `coverage`;
- `.turbo`;
- `.vercel`.

Consulte `package.json` e `package-lock.json` quando precisar confirmar dependências ou comandos.

Não faça varreduras amplas para uma alteração localizada.

Buscas úteis:

```bash
rg "localStorage|sessionStorage|Authorization|nutriplan_token" src
rg "persistAuthToken|clearAuthToken|getAuthHeader" src
rg "NEXT_PUBLIC_API_URL|API_URL" src
rg "alimentos|autocomplete|foodName|foodCode" src
rg "z.object|safeParse|parse|zodResolver" src
rg "cookies\\(|NextResponse|route.ts" src/app
```

## 8. DRI e responsabilidade pela mudança

DRI significa Directly Responsible Individual. Não é uma regra de deduplicação; a regra de deduplicação é DRY.

O agente é diretamente responsável por:

- entender o impacto da mudança;
- preservar contratos existentes;
- validar o comportamento alterado;
- não deixar migração parcial;
- não criar `TODO` para evitar uma correção necessária;
- declarar limitações e validações não executadas.

Uma mudança não está concluída apenas porque compila. Ela deve estar coerente com o domínio, os contratos, a segurança e a interface.

## 9. DRY sem abstração prematura

Evite duplicar:

- regras de negócio;
- schemas Zod;
- tipos derivados de contratos;
- nomes de campos;
- formatos de payload;
- normalizações;
- query keys;
- construção de URLs;
- mapeamentos entre API e domínio;
- funções que executam a mesma transformação;
- componentes visualmente idênticos.

Quando códigos forem parecidos, confirme primeiro se representam a mesma regra. Regras diferentes podem evoluir de formas diferentes.

Extraia uma abstração quando:

- a mesma regra precisa permanecer consistente em múltiplos pontos;
- a duplicação já provocou divergência;
- o contrato é compartilhado entre formulário, rota, service ou mapper;
- a abstração possui nome claro no domínio;
- a reutilização reduz complexidade em vez de escondê-la.

Não crie helper genérico para um único uso.

Prefira duplicação pequena e temporária a uma abstração incorreta.

## 10. SOLID aplicado ao front-end

### 10.1 Responsabilidade única

Cada módulo deve ter uma responsabilidade principal:

- componente apresenta e captura interação;
- hook coordena estado e caso de uso da interface;
- service realiza comunicação;
- schema valida contrato;
- mapper converte DTO em modelo interno;
- utilitário executa transformação pura;
- rota interna trata autenticação, validação e proxy server-side.

Não concentre chamada de API, validação, regra nutricional, transformação, renderização extensa e geração de PDF no mesmo componente.

### 10.2 Aberto para extensão, fechado para modificação

Prefira composição, configuração, variantes e schemas derivados.

Não quebre consumidores existentes de um componente compartilhado para atender um único caso.

Ao adicionar uma variante, preserve o comportamento padrão, salvo mudança incompatível explicitamente solicitada.

### 10.3 Substituição de contratos

Implementações substituíveis devem preservar o contrato esperado.

Não altere silenciosamente:

- entradas válidas;
- formato de retorno;
- semântica de propriedades;
- comportamento de erro.

### 10.4 Segregação de interfaces

Prefira props e contratos pequenos e específicos.

Não passe objetos grandes quando o componente usa poucos campos.

Use `.pick()` ou `.omit()` em schemas para representar recortes de um contrato, em vez de duplicar campos manualmente.

### 10.5 Inversão de dependência

UI e domínio não devem depender desnecessariamente do formato externo da API.

Prefira:

- services com responsabilidade clara;
- mappers entre DTO e modelo interno;
- funções puras para regras e transformações;
- componentes que recebem dados e callbacks;
- dependências recebidas por parâmetro quando isso melhora testes.

Não introduza container de injeção de dependência sem benefício comprovado.

## 11. Domain-Driven Design

Organize o código pela linguagem e pelas capacidades do negócio, não apenas por tipo técnico.

Use nomes consistentes do domínio, como:

- paciente;
- plano alimentar;
- refeição;
- alimento;
- porção;
- medida caseira;
- nutriente;
- cálculo nutricional;
- nutricionista.

Evite nomes genéricos como `data`, `item`, `object`, `info`, `handleStuff` e `processData` quando existir um termo mais preciso.

### 11.1 Limites de contexto

Uma feature deve concentrar seus próprios:

- schemas;
- services;
- hooks;
- componentes específicos;
- regras;
- mappers;
- constantes.

Evite importar arquivos internos de uma feature em outra sem necessidade explícita.

Elementos realmente genéricos podem ficar em `src/components`, `src/hooks`, `src/lib` ou `src/utils`.

Não mova regra de plano alimentar para `utils` apenas para reutilizá-la. Mantenha regras próximas do domínio responsável.

### 11.2 DTO e modelo interno

Não trate automaticamente a resposta do back-end como o modelo ideal da interface.

Quando o formato externo não for adequado à UI, use:

1. schema do DTO;
2. validação da resposta;
3. mapper explícito;
4. modelo interno coerente com a interface.

Adapte mudanças do back-end em um ponto central, não em vários componentes.

## 12. Clean Code

- use nomes descritivos e consistentes;
- prefira funções pequenas com responsabilidade clara;
- use retornos antecipados para reduzir aninhamento;
- elimine condições duplicadas;
- evite strings e números mágicos;
- evite booleanos ambíguos como parâmetros posicionais;
- não esconda efeitos colaterais;
- prefira transformações imutáveis quando simples;
- não silencie erros;
- não use `catch` vazio;
- não use `any` para contornar tipagem;
- não use casts para esconder contratos incompatíveis;
- comente decisões e regras, não sintaxe óbvia.

Use `unknown` para dados externos ainda não validados.

Quando `any` for inevitável, limite o escopo e justifique.

## 13. Contratos de dados e Zod

Zod é a fonte de verdade para dados validáveis em runtime.

Devem ser definidos primeiro como schema Zod:

- payloads enviados ao back-end;
- respostas recebidas da API;
- parâmetros de rota e query string;
- dados de formulário;
- eventos externos;
- variáveis de ambiente;
- dados importados de arquivo;
- estados serializáveis com contrato relevante.

Derive tipos TypeScript:

```ts
export const patientSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1),
});

export type Patient = z.infer<typeof patientSchema>;
```

Não crie `interface` ou `type` manual duplicando um schema.

Interfaces manuais são permitidas apenas para estruturas sem validação de runtime, como:

- props de componentes;
- callbacks;
- contextos React;
- tipos genéricos;
- adapters de bibliotecas;
- contratos puramente comportamentais.

Mesmo nesses casos, não replique manualmente campos de entidades já tipadas.

### 13.1 Composição de schemas

Zod não deve ser tratado como hierarquia tradicional de classes.

Para compartilhar ou adaptar contratos, prefira:

- `.extend()`;
- `.merge()`;
- `.pick()`;
- `.omit()`;
- `.partial()`;
- `.required()`;
- `.transform()`;
- `.refine()` e `.superRefine()`;
- `z.union()`;
- `z.discriminatedUnion()`;
- schemas base reutilizáveis.

Exemplo:

```ts
const patientBaseSchema = z.object({
  name: z.string().trim().min(1),
  email: z.string().trim().email(),
});

export const createPatientSchema = patientBaseSchema.extend({
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export const updatePatientSchema = createPatientSchema.partial();

export const patientResponseSchema = createPatientSchema.extend({
  id: z.string().min(1),
  createdAt: z.string().datetime(),
});
```

Não crie classe base ou herança apenas para compartilhar campos.

Em React, TypeScript e Zod, prefira composição a herança.

Use classes somente quando comportamento, invariantes e ciclo de vida realmente justificarem instâncias. Não use classes como substituto de objetos tipados e funções puras.

### 13.2 Contratos com o back-end

Todo ponto de integração deve possuir, quando aplicável:

- schema de requisição;
- schema de resposta;
- schema de erro controlado;
- mapper entre DTO e modelo interno;
- tratamento explícito de ausência, nulabilidade e opcionais;
- definição de unidades e formatos de data;
- comportamento para resposta incompatível.

Dados de rede começam como `unknown` e devem ser validados antes do uso:

```ts
const payload: unknown = await response.json();
const parsed = patientResponseSchema.safeParse(payload);

if (!parsed.success) {
  throw new Error("Resposta inválida da API.");
}

return parsed.data;
```

Não use cast para fingir validação:

```ts
const patient = (await response.json()) as PatientResponse;
```

Quando um campo do back-end mudar:

1. atualize o schema responsável;
2. atualize o mapper, quando existir;
3. localize todos os consumidores;
4. ajuste mocks e testes;
5. valide compatibilidade;
6. não replique o campo manualmente em vários arquivos.

Não crie fallback silencioso para mascarar contrato quebrado. `optional`, `default` e compatibilidade retroativa só devem ser usados quando forem válidos para a regra de negócio.

### 13.3 Boas práticas de schemas

- use nomes claros;
- normalize strings com `.trim()` quando apropriado;
- rejeite vazio em campo obrigatório;
- valide paginação, busca e filtros;
- use `.strict()` quando campos extras não forem permitidos;
- represente estados fechados com `z.enum()` ou literais;
- use `z.discriminatedUnion()` para variantes com discriminador;
- não duplique regra em schemas diferentes;
- mantenha schemas próximos da feature responsável;
- evite arquivo global gigantesco sem coesão.

Locais existentes:

```txt
src/features/auth/schemas/auth.schemas.ts
src/features/diet-plan/schemas
src/lib/validations
```

Não crie nova estrutura se a feature já tiver padrão claro.

### 13.4 React Hook Form e Zod

Para formulários:

1. crie ou reutilize o schema;
2. derive o tipo com `z.infer`;
3. use o resolver do Zod;
4. normalize dados em um único ponto;
5. mostre mensagens amigáveis;
6. não duplique a validação no JSX;
7. não exponha detalhes técnicos.

Validação no front-end melhora a experiência, mas não substitui validação server-side.

## 14. Componentes React

Prefira componentes:

- focados em apresentação e interação;
- com props pequenas e explícitas;
- compostos em vez de herdados;
- sem detalhes desnecessários da API;
- com estados de loading, vazio e erro;
- acessíveis por teclado;
- fáceis de testar isoladamente.

Evite:

- componentes gigantes;
- regra de negócio complexa no JSX;
- chamadas de API espalhadas em componentes;
- efeitos para sincronizar estado derivado;
- duplicação de estado calculável;
- telas totalmente separadas para desktop e mobile quando CSS resolve;
- componentes universais com dezenas de props booleanas.

Não extraia um componente apenas para reduzir linhas. Extraia quando houver responsabilidade, reutilização ou ganho real de leitura.

## 15. Services, hooks e React Query

Use TanStack React Query quando já for o padrão da feature.

Centralize quando compartilhados:

- query keys;
- funções de acesso a dados;
- validação de respostas;
- invalidações relacionadas;
- configurações de cache;
- tratamento comum de erros.

Não faça chamadas protegidas diretamente para o back-end externo.

Use rotas internas, por exemplo:

```txt
/api/alimentos
/api/alimentos/autocomplete
```

Não presuma sucesso da API. Trate `400`, `401`, `403`, `404`, `409`, `422` e `5xx` de forma coerente com o contrato, sem expor detalhes internos.

Não espalhe redirecionamentos de autenticação por vários componentes. Preserve um fluxo central e previsível.

## 16. Design System e linguagem visual

O visual deve ser clean, profissional, acolhedor e coerente com nutrição.

A interface deve transmitir organização, confiança, clareza e leveza, sem poluição visual ou estética alarmista desnecessária.

Regras:

- siga o Design System existente;
- use tokens semânticos;
- mantenha hierarquia tipográfica clara;
- preserve espaçamento consistente;
- evite excesso de bordas, sombras e cores;
- use ícones apenas quando ajudarem na compreensão;
- destaque ações primárias;
- não dependa apenas de cor para comunicar estado;
- use textos compreensíveis para profissionais de nutrição;
- exiba unidades nutricionais de forma consistente;
- preserve legibilidade de tabelas, gráficos e PDFs.

Prefira tokens como:

```txt
bg-action-primary
text-content-primary
text-content-secondary
border-border-default
bg-surface-default
bg-background-page
text-feedback-error-text
bg-feedback-error-bg
```

Evite cores genéricas quando houver token semântico equivalente:

```txt
emerald-600
zinc-900
red-50
blue-500
```

Antes de alterar o visual, consulte:

```txt
docs/design-system.md
src/styles/design-system.css
src/app/globals.css
```

Não altere tokens globais ou comportamento visual fora do escopo.

## 17. Responsividade e acessibilidade

O projeto é desktop-first, mas toda tela deve funcionar em desktop e mobile.

### 17.1 Desktop

Priorize:

- produtividade;
- densidade de informação controlada;
- tabelas legíveis;
- formulários organizados;
- navegação previsível;
- bom uso do espaço horizontal;
- ações frequentes acessíveis.

### 17.2 Mobile

- não permita scroll horizontal acidental;
- empilhe conteúdo quando necessário;
- preserve ordem lógica e hierarquia;
- mantenha alvos de toque adequados;
- não oculte ações essenciais;
- evite modais maiores que a viewport;
- garanta formulários preenchíveis;
- teste menus, overlays e elementos fixos.

Não crie duas implementações completas da mesma tela sem necessidade comprovada.

### 17.3 Acessibilidade

- use HTML semântico;
- associe `label` e campo;
- preserve foco visível;
- suporte teclado;
- use `aria-*` apenas quando necessário;
- associe erro ao campo;
- forneça texto alternativo para imagem informativa;
- respeite contraste;
- não use placeholder como único rótulo;
- dê nome acessível a botões de ícone.

## 18. Segurança

Segurança tem prioridade sobre conveniência.

É proibido:

- salvar JWT em `localStorage` ou `sessionStorage`;
- expor JWT no JSON retornado ao browser;
- montar `Authorization: Bearer <token>` no browser;
- criar fallback com `NEXT_PUBLIC_API_URL` para chamada autenticada;
- tornar rota protegida pública para contornar autenticação;
- retornar token, stack, headers sensíveis ou detalhes internos;
- confiar em dados do browser apenas porque foram validados no front-end;
- registrar dados pessoais ou clínicos desnecessários.

A autenticação deve usar cookie `httpOnly`:

```txt
nutriplan_token
```

O browser não deve acessar o valor do token.

Chamadas autenticadas do browser devem usar:

```ts
credentials: "include"
```

### 18.1 Arquivos relevantes

```txt
src/app/api/auth/_utils.ts
src/app/api/auth/login/route.ts
src/app/api/auth/register/route.ts
src/app/api/auth/logout/route.ts
src/proxy.ts
src/features/auth/services/auth.service.ts
src/features/auth/components/LoginForm.tsx
src/features/auth/components/RegisterForm.tsx
src/features/auth/components/LogoutButton.tsx
src/features/auth/schemas/auth.schemas.ts
src/features/auth/constants.ts
```

Ao alterar autenticação, valide:

- login, cadastro e logout;
- remoção do cookie;
- redirecionamento de `/plano`, `/dashboard`, `/pacientes` e `/meu-perfil`;
- usuário autenticado não preso no login;
- ausência de token no body e storages;
- cookie `nutriplan_token` como `httpOnly`;
- ausência de `Authorization` construído no browser.

## 19. Rotas internas de API

Chamadas autenticadas devem usar rotas em:

```txt
src/app/api
```

Essas rotas devem:

- ler `nutriplan_token` no server-side;
- retornar `401` sem cookie;
- validar `body`, `params` e `searchParams` com Zod;
- encaminhar `Authorization` apenas no server-side;
- validar ou normalizar respostas quando aplicável;
- nunca retornar token;
- retornar somente status e mensagens seguros;
- não vazar URL privada, stack, headers ou payload sensível;
- não criar fallback público.

Exemplo:

```ts
const token = cookies().get("nutriplan_token")?.value;

if (!token) {
  return NextResponse.json(
    { message: "Não autenticado." },
    { status: 401 },
  );
}
```

Não copie a mesma lógica de autenticação em todas as rotas se já existir helper seguro e estável.

## 20. Variáveis de ambiente

Não exponha variável sensível com `NEXT_PUBLIC_`.

Use esse prefixo apenas para informação realmente pública.

URLs privadas, segredos, tokens e chaves devem permanecer server-side.

Para fluxo autenticado, use variável server-side, por exemplo:

```txt
API_URL
```

Não use `NEXT_PUBLIC_API_URL` nem fallback silencioso em fluxo protegido.

Se variável obrigatória estiver ausente, falhe de forma explícita e segura no server-side.

Valide variáveis de ambiente com Zod quando aplicável.

## 21. Regras específicas para alimentos

A busca de alimentos pertence a:

```txt
src/features/diet-plan
```

Service relevante:

```txt
src/features/diet-plan/services/foods.service.ts
```

Chamadas do browser devem usar:

```txt
/api/alimentos
/api/alimentos/autocomplete
```

É proibido chamar diretamente a API externa, usar `NEXT_PUBLIC_API_URL`, ler token do storage ou montar `Authorization` no browser.

As rotas internas devem:

- ler `nutriplan_token`;
- retornar `401` sem cookie;
- validar query params com Zod;
- encaminhar autenticação somente no server-side;
- validar resposta quando aplicável;
- não retornar token;
- não criar fallback público.

Exemplo:

```ts
import { z } from "zod";

export const foodAutocompleteSearchParamsSchema = z
  .object({
    foodName: z.string().trim().min(2).max(100),
  })
  .strict();

export const foodDetailSearchParamsSchema = z
  .object({
    foodCode: z.string().trim().min(1).max(100),
  })
  .strict();
```

## 22. Erros e logs

Não ignore erros nem use `catch` vazio.

Não exponha:

- stack trace;
- token ou cookie;
- headers internos;
- URL privada;
- payload clínico;
- detalhes do banco;
- resposta integral da API upstream.

Use mensagens simples e controladas:

```txt
Não foi possível concluir a solicitação.
```

Logs server-side devem conter apenas o necessário para diagnóstico. Não registre dados pessoais ou clínicos completos quando um identificador sanitizado for suficiente.

## 23. Desempenho

Otimize com evidência ou risco claro.

Antes de adicionar `useMemo`, `useCallback`, memoização ou cache, confirme benefício real.

Evite:

- chamadas duplicadas;
- invalidações amplas;
- estados derivados armazenados;
- listas sem chave estável;
- cálculos nutricionais pesados em cada render;
- código client-side que pode permanecer server-side;
- imagens sem dimensão ou otimização;
- dados carregados sem uso.

Não prejudique legibilidade por micro-otimização.

## 24. Dependências

Antes de adicionar biblioteca:

1. confirme que a stack atual não resolve;
2. avalie manutenção e segurança;
3. verifique impacto no bundle;
4. confirme compatibilidade;
5. explique a necessidade no resumo final.

Não execute `npm install` por padrão se nenhuma dependência mudou e o ambiente já estiver preparado.

Quando `package.json` mudar, mantenha o lockfile coerente.

## 25. Validação

Execute conforme aplicável:

```bash
npm run lint
npm run build
git diff --check
```

Execute `npm install` apenas quando dependências estiverem ausentes ou alteradas.

Execute testes relacionados quando existirem.

Nunca afirme que uma validação passou se o comando não foi executado.

### 25.1 Autenticação

```bash
npm run lint
npm run build
rg "localStorage|sessionStorage|persistAuthToken|clearAuthToken|getAuthHeader" src
rg "Authorization" src
rg "NEXT_PUBLIC_API_URL|API_URL" src
```

Resultado esperado:

- JWT ausente em Local Storage e Session Storage;
- nenhum helper de token no browser;
- `Authorization` apenas em server-side seguro;
- nenhuma chamada autenticada com `NEXT_PUBLIC_API_URL`;
- token ausente no JSON.

### 25.2 Contratos, formulários e Zod

```bash
npm run lint
npm run build
rg "z.object|safeParse|parse|zodResolver" src
```

Valide:

- campos obrigatórios;
- formatos como e-mail;
- query params;
- payload inesperado;
- resposta externa antes do uso;
- mensagens amigáveis;
- tipos derivados de schemas;
- ausência de duplicação manual do contrato.

### 25.3 Alimentos

```bash
npm run lint
npm run build
rg "alimentos|autocomplete|foodName|foodCode" src
rg "NEXT_PUBLIC_API_URL|localStorage|getAuthHeader|Authorization" src/features/diet-plan src/app/api
```

Resultado esperado:

- `foods.service.ts` usa rotas internas;
- browser usa `/api/alimentos` ou `/api/alimentos/autocomplete`;
- browser não chama diretamente a API externa;
- browser não lê token nem monta `Authorization`;
- query params são validados;
- ausência de cookie retorna `401`.

### 25.4 Visual

Valide:

- desktop principal;
- mobile;
- ausência de scroll horizontal acidental;
- loading, vazio, sucesso e erro;
- navegação por teclado;
- foco visível;
- contraste e legibilidade;
- consistência com o Design System.

## 26. Proibições principais

- não reescrever arquivo inteiro para mudar poucas linhas;
- não aplicar formatação global sem solicitação;
- não alterar arquivos fora do escopo;
- não criar abstração prematura;
- não duplicar contratos ou regras de negócio;
- não usar herança quando composição for suficiente;
- não criar classes apenas para organizar dados;
- não criar interface manual duplicando schema Zod;
- não usar cast para fingir que resposta externa é válida;
- não usar `any` para contornar erro;
- não ignorar validação server-side;
- não salvar ou expor token;
- não chamar rota protegida diretamente na API externa;
- não tornar dado protegido público;
- não adicionar dependência sem necessidade;
- não mudar Design System fora do escopo;
- não implementar feature extra durante correção;
- não afirmar que testes passaram sem executá-los;
- não esconder falha com fallback silencioso.

## 27. Checklist final

- [ ] O pedido foi atendido sem ampliar o escopo.
- [ ] O diff contém somente mudanças necessárias.
- [ ] Nenhum arquivo foi reescrito integralmente sem motivo.
- [ ] Regras de negócio não foram duplicadas.
- [ ] Contratos compartilhados possuem uma fonte de verdade.
- [ ] Dados externos são validados com Zod.
- [ ] Tipos de contratos usam `z.infer`.
- [ ] Interfaces manuais não duplicam entidades.
- [ ] Composição foi preferida a herança.
- [ ] UI não depende desnecessariamente do DTO externo.
- [ ] Mudanças de contrato tiveram consumidores e mappers revisados.
- [ ] JWT não aparece em storages, respostas ou logs.
- [ ] Cookie `nutriplan_token` permanece `httpOnly`.
- [ ] Rotas protegidas usam proxy server-side.
- [ ] Chamadas autenticadas usam `credentials: "include"`.
- [ ] Erros e logs não expõem dados sensíveis.
- [ ] Design System foi respeitado.
- [ ] Interface funciona em desktop e mobile.
- [ ] Acessibilidade básica foi preservada.
- [ ] Validações executadas foram relatadas corretamente.

## 28. Resumo final do agente

Ao concluir, informe objetivamente:

1. arquivos alterados;
2. comportamento corrigido ou implementado;
3. contratos ou schemas modificados;
4. validações executadas e resultados;
5. riscos, limitações ou verificações pendentes;
6. problemas encontrados fora do escopo.

O resumo deve permitir revisão rápida. Não use descrição genérica.
