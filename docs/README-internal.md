# Pendencias internas

## Fetch inicial ausente ao duplicar uma guia autenticada

Status: aberto.

Prioridade funcional: alta.

Seguranca relacionada: a protecao P0 de revogacao e troca de identidade deve permanecer implementada enquanto esta pendencia estiver aberta.

### Comportamento observado

Ao duplicar uma guia em uma pagina privada, especialmente enquanto os dados ainda estao carregando, a nova guia pode nao executar a requisicao de dados da rota. Em `/pacientes`, a interface permanece carregando ou apresenta estado vazio ate que o usuario atualize manualmente a pagina com F5.

O problema pode afetar outras paginas privadas que dependem de dados iniciais, como dashboard, perfil e plano alimentar.

Durante a reproducao foram observadas varias respostas `200` para `GET /api/nutricionista/perfil`, sem a requisicao esperada para `GET /api/pacientes`. Isso indica que a validacao de identidade esta ativa, mas a query de dados da pagina nao esta sendo iniciada ou montada corretamente na guia duplicada.

### Comportamento esperado

- Uma guia duplicada deve buscar os dados atuais da rota sem exigir F5.
- Dados sensiveis de outra identidade nunca podem permanecer renderizados.
- A validacao de sessao nao deve cancelar, substituir ou impedir a query inicial da pagina.
- Retomar uma guia existente nao deve provocar recargas visuais repetidas.

### Protecoes P0 que nao devem ser removidas

- Rotas internas protegidas enviam `Authorization: Bearer` somente no server-side.
- O access token permanece em cookie `httpOnly`.
- Logout revoga a sessao no back-end e sempre remove os cookies locais.
- Logout e `401` limpam usuario, queries e conteudo sensivel antes do redirecionamento.
- Abas recebem o evento de logout por `BroadcastChannel`.
- `focus`, `visibilitychange` e `pageshow` revalidam a identidade atual.
- Escritas protegidas aguardam a validacao de identidade para impedir que uma tela do usuario A escreva na sessao do usuario B.

### Tentativas removidas

As abordagens abaixo foram removidas porque nao resolveram a reproducao e adicionavam complexidade ou chamadas desnecessarias:

- `refetchOnMount: "always"` global;
- cancelamento e refetch global de queries em eventos de ciclo de vida;
- estado derivado `isInitialLoading`;
- propagacao adicional de `AbortSignal` nas queries de pacientes;
- listener de `load` para tentar identificar a inicializacao de uma guia duplicada;
- retry e headers adicionais para refresh concorrente;
- retencao temporaria de tokens renovados em memoria.

### Proxima investigacao

1. Capturar a aba Network completa desde antes da duplicacao, preservando o log.
2. Comparar a montagem dos componentes e observers do React Query entre uma navegacao normal, F5 e guia duplicada.
3. Confirmar se a pagina privada e o hook da rota chegam a renderizar na guia duplicada.
4. Registrar `status`, `fetchStatus`, quantidade de observers e `queryKey` sem registrar dados pessoais ou tokens.
5. Verificar o estado de hidratacao e o cache de navegacao do App Router antes de alterar novamente o fluxo de autenticacao.
6. Criar uma reproducao minima automatizada com duas paginas antes de propor outra correcao.

### Criterios de aceite

- Duplicar `/pacientes` dispara `GET /api/pacientes` e renderiza os pacientes sem F5.
- Duplicar cada rota privada dispara somente as consultas necessarias daquela rota.
- Nenhuma consulta fica indefinidamente em `pending` sem requisicao de rede.
- Logout em uma aba limpa e redireciona todas as demais.
- Trocar de A para B nunca permite que uma tela antiga execute escrita na sessao nova.
