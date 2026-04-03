<template>
  <article class="prose prose-invert prose-zinc max-w-none">
    <header class="border-b border-zinc-800 pb-8 not-prose">
      <h1 class="text-3xl font-bold text-white">Política de privacidade</h1>
      <p class="mt-2 text-sm text-zinc-500">Última atualização: {{ updated }}</p>
      <p class="mt-4 text-sm text-zinc-400">
        O Prazer.Vip descreve aqui como trata dados pessoais no contexto do site e dos serviços ligados ao cadastro de
        anunciantes. Recomendamos a leitura completa antes de utilizar a plataforma.
      </p>
    </header>

    <section class="mt-10 space-y-4 text-zinc-300">
      <h2 class="text-xl font-semibold text-white">1. Finalidade e uso dos dados</h2>
      <p>
        Quando você se cadastra ou utiliza funcionalidades que exigem identificação, podemos registrar dados como nome,
        e-mail, documento (quando exigido pelo fluxo), telefone, endereço ou outros campos necessários à prestação do
        serviço, à verificação de identidade e ao cumprimento de obrigações legais.
      </p>
      <p>
        Durante o acesso ao site, dados técnicos — por exemplo endereço IP, tipo de navegador, idioma e registros de
        segurança — podem ser tratados para manter o funcionamento estável, prevenir abuso e melhorar a experiência,
        sempre dentro do razoável para a operação da plataforma.
      </p>
      <p>
        Comunicações promocionais ou informativas por e-mail só ocorrerão quando houver base legal adequada e, quando
        aplicável, após consentimento específico ou possibilidade clara de optar por não receber.
      </p>

      <h2 class="pt-6 text-xl font-semibold text-white">2. Base legal e consentimento</h2>
      <p>
        O tratamento pode fundamentar-se na execução de contrato ou de medidas pré-contratuais (por exemplo, criar conta,
        concluir cadastro, processar pagamento), no legítimo interesse (segurança, prevenção a fraude, melhoria técnica,
        desde que respeitados seus direitos), no cumprimento de obrigação legal ou regulatória, ou no consentimento,
        quando este for solicitado de forma destacada para finalidades específicas.
      </p>
      <p>
        Sempre que uma finalidade adicional não estiver coberta pelas bases acima, pediremos manifestação clara ou
        ofereceremos alternativa para recusar, conforme exigido pela legislação aplicável.
      </p>
      <p>
        Para revogar consentimento onde ele for a base do tratamento, ou para exercer direitos previstos na LGPD (acesso,
        correção, eliminação, portabilidade, informação sobre compartilhamentos, revisão de decisões automatizadas, entre
        outros), utilize a página de
        <NuxtLink to="/contato" class="text-brand hover:underline">contato</NuxtLink>
        indicando o pedido. Responderemos no prazo legal, podendo solicitar informações mínimas para confirmar sua
        identidade.
      </p>

      <h2 class="pt-6 text-xl font-semibold text-white">3. Compartilhamento e divulgação</h2>
      <p>
        Não comercializamos listas de contatos. Podemos compartilhar dados com prestadores que nos auxiliam (hospedagem,
        infraestrutura, meios de pagamento, suporte técnico), limitados ao necessário e sob obrigações de
        confidencialidade e segurança compatíveis com a finalidade.
      </p>
      <p>
        Também poderemos divulgar informações quando a lei, ordem judicial ou autoridade competente exigir, ou para
        defender direitos da plataforma, de utilizadores ou de terceiros em processos legítimos, inclusive em caso de
        violação grave dos termos de uso.
      </p>

      <h2 class="pt-6 text-xl font-semibold text-white">4. Serviços de terceiros e links externos</h2>
      <p>
        Integrações com processadores de pagamento, gateways ou outros parceiros podem implicar tratamento adicional
        pelas políticas desses fornecedores. Recomendamos ler os documentos deles para entender finalidades, retenção e
        transferências internacionais, quando existirem.
      </p>
      <p>
        Prestadores situados ou com infraestrutura fora do Brasil podem submeter os dados às leis locais. Ao utilizar
        um serviço que dependa deles, você reconhece essa possibilidade na medida permitida pela legislação vigente.
      </p>
      <p>
        Links para sites de terceiros não ficam sob nosso controle. A política de privacidade do Prazer.Vip deixa de se
        aplicar quando você sai do nosso domínio; analise sempre os termos e a privacidade do destino.
      </p>

      <h2 class="pt-6 text-xl font-semibold text-white">5. Segurança</h2>
      <p>
        Adotamos medidas técnicas e organizacionais proporcionais ao risco — controles de acesso, criptografia em trânsito
        quando apropriado, boas práticas de armazenamento e monitoramento — para reduzir risco de acesso não autorizado,
        perda ou alteração indevida. Nenhum sistema é totalmente isento de risco; em caso de incidente relevante,
        seguiremos os procedimentos legais aplicáveis.
      </p>
      <p>
        Dados sensíveis de pagamento, quando tratados diretamente por parceiros certificados, seguem as normas desses
        parceiros (por exemplo requisitos de segurança da rede de cartões). Evite enviar dados de cartão por canais não
        oficiais.
      </p>

      <h2 class="pt-6 text-xl font-semibold text-white">6. Retenção, alterações e continuidade</h2>
      <p>
        Conservamos dados pelo tempo necessário às finalidades descritas, à resolução de pendências, à defesa em
        procedimentos legais ou conforme prazos legais de guarda. Após isso, eliminamos ou anonimizamos quando possível.
      </p>
      <p>
        Esta política pode ser atualizada. A data no topo indica a revisão mais recente. Alterações relevantes podem ser
        destacadas no site ou por meio de comunicação razoável, conforme a gravidade da mudança e a lei aplicável.
      </p>
      <p>
        Em operações societárias (fusão, aquisição, reorganização), os dados poderão ser transferidos ao sucessor para
        continuidade do serviço, respeitando esta política ou uma versão substituta comunicada com antecedência adequada.
      </p>

      <p class="pt-6 text-sm text-zinc-500">
        Dúvidas:
        <NuxtLink to="/contato" class="text-brand hover:underline">entre em contato</NuxtLink>
        pelo canal indicado no site.
      </p>
    </section>
  </article>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default',
  path: '/politica-de-privacidade',
})

useHead({
  title: 'Política de privacidade',
})

const updated = '31 de março de 2026'
</script>
