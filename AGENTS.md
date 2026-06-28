# AGENTS.md — Nutri Plan Front-end

## Informações gerais

Este repositório contém o front-end do Nutri Plan.

O projeto é desenvolvido com Next.js, React, TypeScript, Tailwind CSS, daisyUI, Zod, React Hook Form, TanStack React Query, Sonner, Recharts e geração de PDF com `@react-pdf/renderer`.

O front-end deve seguir um visual clean, consistente e alinhado ao Design System já existente no projeto.

O desenvolvimento deve ser desktop-first, pois o sistema será majoritariamente utilizado em desktop. Isso não significa ignorar mobile: as telas também devem permanecer responsivas e utilizáveis em dispositivos menores.

## Objetivo do projeto

O Nutri Plan oferece interface para autenticação, gerenciamento de pacientes, criação de plano alimentar, busca de alimentos, cálculo/visualização nutricional e geração de plano alimentar em PDF.

O front-end consome a API do Nutri Plan.

Rotas protegidas não devem ser chamadas diretamente pelo browser. Sempre que houver autenticação envolvida, utilize rotas internas do Next.js como proxy server-side.

## Stack principal

* Next.js
* React
* TypeScript
* Tailwind CSS
* daisyUI
* Zod
* React Hook Form
* TanStack React Query
* Sonner
* Recharts
* @react-pdf/renderer
* lucide-react

## Estrutura real do projeto

A estrutura principal segue o padrão:

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

Pontos importantes:

```txt
src/app
```

Contém App Router, páginas, layouts, rotas internas de API e providers.

```txt
src/components
```

Contém componentes reutilizáveis, incluindo componentes de layout e UI.

```txt
src/features/auth
```

Contém autenticação, formulários, schemas, services e constantes relacionadas a login/cadastro/logout.

```txt
src/features/diet-plan
```

Contém a principal feature de plano alimentar, incluindo busca de alimentos, edição de refeições, geração de PDF e componentes do fluxo de dieta.

Não assumir que existe `src/features/foods` ou `src/features/meal-plans`. No projeto atual, a feature real relacionada à dieta/alimentos está em `src/features/diet-plan`.

## Como gastar menos tokens ao trabalhar neste projeto

Antes de alterar qualquer arquivo, entenda o escopo real da tarefa.

Não leia arquivos desnecessários. Priorize buscas objetivas com `rg`, leitura de arquivos específicos e inspeção incremental.

Nunca leia a pasta `node_modules`.

Evite também ler pastas geradas automaticamente, como:

* `.next`
* `dist`
* `build`
* `coverage`
* `.turbo`
* `.vercel`

Para entender as bibliotecas usadas, consulte:

* `package.json`
* `package-lock.json`

Não faça varreduras amplas no projeto inteiro se a alteração for localizada.

Use buscas específicas:

```bash
rg "localStorage|sessionStorage|Authorization|nutriplan_token" src
rg "persistAuthToken|clearAuthToken|getAuthHeader" src
rg "NEXT_PUBLIC_API_URL|API_URL" src
rg "alimentos|autocomplete|foodName|foodCode" src
rg "z.object|safeParse|parse|zodResolver" src
rg "cookies\\(|NextResponse|route.ts" src/app
```

Não reescreva componentes inteiros quando uma alteração pequena resolver o problema.

Não altere arquivos fora do escopo só para “melhorar” o código.

Se encontrar problemas não relacionados ao pedido atual, registre no resumo final, mas não corrija sem necessidade.

## Comandos principais

Use os comandos abaixo antes de finalizar qualquer alteração relevante:

```bash
npm install
npm run lint
npm run build
```

Quando a alteração envolver autenticação, rotas protegidas ou alimentos, rode também:

```bash
rg "localStorage|sessionStorage|persistAuthToken|clearAuthToken|getAuthHeader" src
rg "Authorization" src
rg "NEXT_PUBLIC_API_URL|API_URL" src
rg "alimentos|autocomplete|foodName|foodCode" src
```

## Regras gerais de desenvolvimento

Preserve a estrutura existente do projeto.

Não reescreva componentes inteiros sem necessidade.

Prefira alterações pequenas, claras e fáceis de revisar.

Use TypeScript de forma estrita sempre que possível.

Não introduza dependências novas sem necessidade real.

Não remova validações existentes sem justificar.

Não altere comportamento visual fora do escopo solicitado.

Não misture refatoração ampla com correção pontual.

Não implemente features extras durante correções de segurança.

Não use `any` sem necessidade.

Se `any` for inevitável, limite o escopo e justifique.

Não silencie erros sem tratamento.

Não crie helpers genéricos demais para uso único.

Use nomes descritivos para funções, variáveis, schemas e serviços.

Evite comentários óbvios. Comente apenas decisões importantes, regras de negócio ou pontos de segurança.

Interfaces devem estar presentes em um arquivo de interface/types e devem usar o zod por padrão.

## Design System

Siga o Design System existente do projeto.

Priorize tokens semânticos definidos no projeto em vez de classes genéricas do Tailwind.

Prefira classes como:

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

Evite introduzir diretamente cores genéricas em componentes finais, como:

```txt
emerald-600
zinc-900
red-50
blue-500
```

Antes de alterar visual, consulte:

```txt
docs/design-system.md
src/styles/design-system.css
src/app/globals.css
```

Não alterar tokens globais sem necessidade.

Não alterar layout, espaçamento, cores, componentes ou comportamento visual fora do escopo solicitado.

## Segurança em primeiro lugar

Segurança tem prioridade sobre conveniência, velocidade ou redução de código.

Nunca salvar JWT em `localStorage`.

Nunca salvar JWT em `sessionStorage`.

Nunca expor JWT no JSON retornado ao browser.

Nunca montar `Authorization: Bearer <token>` no browser para rotas protegidas.

Nunca criar fallback inseguro usando `NEXT_PUBLIC_API_URL` para chamadas autenticadas.

Nunca transformar uma rota protegida em rota pública para resolver erro de autenticação.

Nunca retornar mensagens de erro contendo token, stack trace, headers sensíveis ou detalhes internos da API.

Nunca confiar em dados vindos do browser apenas porque já foram validados no front-end.

A autenticação deve ser baseada em cookie `httpOnly`.

O cookie de autenticação padrão é:

```txt
nutriplan_token
```

O browser não deve ter acesso ao valor do token.

Chamadas protegidas feitas pelo browser devem usar rotas internas do Next.js.

Chamadas autenticadas feitas pelo browser devem usar:

```ts
credentials: "include"
```

## Segurança de autenticação

Arquivos relevantes:

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

Ao mexer em autenticação, validar obrigatoriamente:

* Login funciona.
* Cadastro funciona.
* Logout remove o cookie.
* `/plano` redireciona para `/login` quando não autenticado.
* `/dashboard` redireciona para `/login` quando não autenticado.
* `/pacientes` redireciona para `/login` quando não autenticado.
* `/meu-perfil` redireciona para `/login` quando não autenticado.
* Usuário autenticado não fica preso no login.
* Nenhum token aparece no body das respostas.
* Nenhum token aparece em `localStorage`.
* Nenhum token aparece em `sessionStorage`.
* O cookie `nutriplan_token` existe como `httpOnly`.
* O browser não monta manualmente header `Authorization`.

## Rotas internas de API

Para chamadas autenticadas, prefira rotas internas em:

```txt
src/app/api
```

Essas rotas devem:

* Ler o cookie `nutriplan_token` no server-side.
* Retornar `401` se o cookie não existir.
* Encaminhar a chamada para o back-end usando `Authorization: Bearer <token>` apenas no server-side.
* Nunca retornar o token no JSON.
* Repassar status seguro da API upstream.
* Tratar erros sem vazar informações sensíveis.
* Validar entradas com Zod quando houver body, params ou query string.
* Normalizar dados antes de enviar ao back-end quando necessário.

Exemplo esperado:

```ts
const token = cookies().get("nutriplan_token")?.value;

if (!token) {
  return NextResponse.json(
    { message: "Não autenticado." },
    { status: 401 }
  );
}
```

Não exponha o token em logs, respostas ou objetos enviados ao client.

## Variáveis de ambiente

Não exponha variáveis sensíveis com prefixo `NEXT_PUBLIC_`.

Use `NEXT_PUBLIC_` apenas para informações que podem ser públicas no browser.

URLs privadas de API, segredos, tokens e chaves internas não devem ser acessíveis no client-side.

Para chamadas autenticadas, use variável server-side, por exemplo:

```txt
API_URL
```

Não use `NEXT_PUBLIC_API_URL` em chamadas protegidas.

Não faça fallback silencioso para URL pública em fluxo autenticado.

Evite fallback automático para Render em código sensível. Se `API_URL` for obrigatória, falhe de forma explícita no server-side.

Quando aplicável, valide variáveis de ambiente com Zod no server-side.

## Validações com Zod

Use Zod para validar entradas em formulários, rotas internas e pontos de integração.

Validação no front-end melhora a experiência do usuário, mas não substitui validação no server-side.

Sempre que uma rota interna receber `body`, `params` ou `searchParams`, valide com Zod antes de encaminhar para o back-end.

Prefira `safeParse` quando precisar tratar erro de validação e retornar resposta amigável.

Prefira `parse` apenas quando o erro puder ser capturado por um fluxo já controlado.

Não confie em tipos inferidos manualmente quando puder inferir a partir do schema.

Use:

```ts
type LoginInput = z.infer<typeof loginSchema>;
```

Evite duplicar regras de validação em vários lugares.

Mantenha schemas próximos da feature correspondente quando fizer sentido.

Exemplos de locais válidos:

```txt
src/features/auth/schemas/auth.schemas.ts
src/features/diet-plan/schemas
src/lib/validations
```

Não crie nova estrutura se o projeto já tiver padrão claro para aquela feature.

### Boas práticas com Zod

Schemas devem ter nomes claros:

```ts
loginSchema
registerSchema
foodSearchSchema
foodDetailSchema
createDietPlanSchema
patientInfoSchema
```

Valide strings vazias quando o campo for obrigatório.

Normalize campos quando fizer sentido:

```ts
z.string().trim().min(1)
```

Valide e-mails com:

```ts
z.string().trim().email()
```

Valide números recebidos como string quando vierem de query params.

Valide limites de paginação, busca e filtros.

Evite aceitar payloads abertos sem necessidade.

Prefira schemas estritos quando o endpoint não deve aceitar campos extras:

```ts
z.object({
  foodName: z.string().trim().min(2).max(100),
}).strict()
```

Retorne erros de validação de forma segura e simples.

Não retorne o objeto completo do erro do Zod se ele puder expor detalhes desnecessários.

Exemplo de resposta segura:

```ts
return NextResponse.json(
  { message: "Dados inválidos." },
  { status: 400 }
);
```

Se precisar retornar detalhes para o front, retorne apenas mensagens úteis e controladas.

## React Hook Form + Zod

Para formulários, prefira integração entre React Hook Form e Zod.

Use schema como fonte principal de validação.

Não duplique validações no JSX se elas já estão no schema, exceto quando for apenas controle visual.

Fluxo recomendado:

1. Criar schema com Zod.
2. Inferir tipo com `z.infer`.
3. Usar resolver do Zod no React Hook Form.
4. Exibir mensagens amigáveis para o usuário.
5. Não expor detalhes técnicos.

## TanStack React Query

Use TanStack React Query para chamadas assíncronas quando já for o padrão da feature.

Não faça chamadas protegidas diretamente para o back-end externo.

Para rotas protegidas, chame as rotas internas do Next.js.

Exemplo correto:

```txt
/api/alimentos
/api/alimentos/autocomplete
```

Exemplo incorreto:

```txt
https://api-nutri-plan.onrender.com/alimentos
```

Configure erros de forma segura e previsível.

Não presuma que toda resposta da API será bem-sucedida.

Trate `401` de forma adequada, especialmente em fluxos autenticados.

## Padrões para alimentos

A busca de alimentos é parte da feature:

```txt
src/features/diet-plan
```

Arquivo relevante atual:

```txt
src/features/diet-plan/services/foods.service.ts
```

Chamadas de alimentos no browser devem ir para rotas internas:

```txt
/api/alimentos
/api/alimentos/autocomplete
```

Não chamar diretamente a API externa do Render em rotas protegidas.

Não usar `NEXT_PUBLIC_API_URL` para alimentos se a rota exige autenticação.

Não usar `localStorage` para buscar token.

Não montar header `Authorization` no browser.

A rota `/alimentos` é protegida.

Não deve ser possível recuperar dados de alimentos do banco sem usuário logado.

As rotas internas de alimentos devem:

* Ler o cookie `nutriplan_token`.
* Retornar `401` se o cookie não existir.
* Validar query params com Zod.
* Encaminhar a chamada para o back-end com `Authorization` apenas no server-side.
* Não retornar token.
* Não criar fallback público.
* Não expor URL interna sensível sem necessidade.

Sugestão de schemas:

```ts
import { z } from "zod";

export const foodAutocompleteSearchParamsSchema = z.object({
  foodName: z.string().trim().min(2).max(100),
}).strict();

export const foodDetailSearchParamsSchema = z.object({
  foodCode: z.string().trim().min(1).max(100),
}).strict();
```

## Tratamento de erros

Não ignore erros.

Não use `catch` vazio.

Não exponha stack trace ao usuário.

Não retorne detalhes sensíveis da API upstream.

Use mensagens simples para o usuário e logs controlados no server-side quando necessário.

Exemplo de mensagem segura:

```txt
Não foi possível concluir a solicitação.
```

Evite mensagens como:

```txt
Erro ao chamar https://api...
Token inválido: eyJ...
Stack trace...
```

## O que não fazer

Não salvar token no browser.

Não expor token no JSON.

Não criar rota pública para dado protegido.

Não remover `credentials: "include"` em chamadas autenticadas.

Não adicionar dependência nova sem necessidade.

Não alterar layout ou telas fora do escopo.

Não implementar features extras durante correções de segurança.

Não ler `node_modules`.

Não fazer refatoração ampla sem necessidade.

Não trocar arquitetura existente sem motivo forte.

Não ignorar validações com Zod.

Não confiar apenas na validação do front-end.

Não deixar chamadas protegidas acessando diretamente a API externa pelo browser.

Não usar `NEXT_PUBLIC_API_URL` para rota protegida.

Não usar classes visuais fora do Design System quando já existir token semântico adequado.

## QA obrigatório para alterações de autenticação

Depois de mexer em autenticação, rodar:

```bash
npm run lint
npm run build
rg "localStorage|sessionStorage|persistAuthToken|clearAuthToken|getAuthHeader" src
rg "Authorization" src
rg "NEXT_PUBLIC_API_URL|API_URL" src
```

Resultado esperado:

* Não deve existir uso de `localStorage` ou `sessionStorage` para token JWT.
* Não deve existir `persistAuthToken`.
* Não deve existir `clearAuthToken` para remover token de storage.
* Não deve existir `getAuthHeader` lendo token no browser.
* `Authorization` só deve aparecer em contexto server-side seguro.
* `NEXT_PUBLIC_API_URL` não deve ser usado em chamada autenticada.
* Nenhum token deve ser retornado no JSON.

## QA obrigatório para chamadas protegidas

No navegador:

* Fazer login.
* Conferir que Local Storage não possui `nutriplan_token`.
* Conferir que Session Storage não possui `nutriplan_token`.
* Conferir que o cookie `nutriplan_token` existe e é `httpOnly`.
* Buscar alimento.
* Confirmar no Network que a chamada vai para `/api/alimentos` ou `/api/alimentos/autocomplete`.
* Confirmar que o browser não chama diretamente a API do Render para alimentos.
* Confirmar que não existe header `Authorization` sendo montado pelo browser.
* Confirmar que uma requisição sem autenticação retorna `401`.

## QA obrigatório para Zod

Quando alterar formulários, rotas internas ou payloads:

```bash
npm run lint
npm run build
rg "z.object|safeParse|parse|zodResolver" src
```

Validar manualmente:

* Campos obrigatórios rejeitam valor vazio.
* E-mail inválido é rejeitado.
* Query params inválidos são rejeitados.
* Payload inesperado não quebra a aplicação.
* Mensagens de erro são amigáveis.
* Erros não expõem detalhes técnicos.
* O tipo TypeScript é inferido a partir do schema quando aplicável.

## QA obrigatório para alimentos

Depois de alterar busca de alimentos:

```bash
npm run lint
npm run build
rg "alimentos|autocomplete|foodName|foodCode" src
rg "NEXT_PUBLIC_API_URL|localStorage|getAuthHeader|Authorization" src/features/diet-plan src/app/api
```

Resultado esperado:

* `src/features/diet-plan/services/foods.service.ts` chama apenas rotas internas do Next.js.
* O browser chama `/api/alimentos` e `/api/alimentos/autocomplete`.
* O browser não chama diretamente `api-nutri-plan.onrender.com`.
* O browser não usa `localStorage` para token.
* O browser não monta `Authorization`.
* As rotas internas validam query params com Zod.
* As rotas internas retornam `401` quando não houver cookie.

## Checklist antes de finalizar

Antes de finalizar qualquer alteração, confirme:

* `npm run lint` passou.
* `npm run build` passou.
* A alteração ficou limitada ao escopo solicitado.
* Não existe JWT no `localStorage`.
* Não existe JWT no `sessionStorage`.
* O browser não recebe token no JSON.
* O cookie `nutriplan_token` segue `httpOnly`.
* Rotas protegidas usam proxy server-side.
* Chamadas protegidas usam `credentials: "include"` quando feitas pelo browser.
* Rotas internas validam entradas com Zod quando aplicável.
* Não houve leitura ou alteração desnecessária em arquivos fora do escopo.
* Não foi adicionada dependência nova sem necessidade real.
* Não houve mudança visual fora do escopo.
* Não foram expostos dados sensíveis em erro, log ou resposta.
* O Design System foi respeitado.
