<template>
  <article class="prose prose-invert prose-zinc max-w-none">
    <header class="border-b border-zinc-800 pb-8 not-prose">
      <h1 class="text-3xl font-bold text-white">Termos de serviço</h1>
      <p class="mt-2 text-sm text-zinc-500">Última atualização: {{ updated }}</p>
    </header>

    <section class="mt-10 space-y-4 text-zinc-300">
      <h2 class="text-xl font-semibold text-white">1. Aceitação</h2>
      <p>
        Ao aceder e utilizar o Prazer.Vip, concorda com estes termos. Se não concordar, não deve utilizar o
        site. O texto completo será revisto por advogados e associado ao registo da plataforma.
      </p>

      <h2 class="pt-6 text-xl font-semibold text-white">2. Elegibilidade e idade</h2>
      <p>
        O site destina-se a maiores de idade conforme a lei do seu país. É proibido fornecer informações falsas
        no cadastro de anunciante.
      </p>

      <h2 class="pt-6 text-xl font-semibold text-white">3. Conteúdos e conduta</h2>
      <p>
        Os utilizadores são responsáveis pelos conteúdos que publicam. É proibido violar leis aplicáveis,
        direitos de terceiros ou publicar material não consentido. A equipa pode recusar, remover ou suspender
        perfis que violem as regras ou pedidos legais válidos.
      </p>

      <h2 class="pt-6 text-xl font-semibold text-white">4. Planos e pagamentos</h2>
      <p>
        Funcionalidades pagas, destaques e renovações serão descritas na área de anunciante e no checkout. Em
        caso de litígio, aplicam-se as regras do meio de pagamento e da lei aplicável ao contrato.
      </p>

      <h2 class="pt-6 text-xl font-semibold text-white">5. Limitação de responsabilidade</h2>
      <p>
        O serviço é prestado «tal como está». Sempre que a lei o permita, excluímos responsabilidade por danos
        indirectos ou perda de lucros. Nada nestes termos limita direitos que não possam ser limitados por lei.
      </p>

      <h2 class="pt-6 text-xl font-semibold text-white">6. Contato</h2>
      <p>
        Questões sobre estes termos podem ser enviadas através da página de
        <NuxtLink to="/contato" class="text-brand hover:underline">contato</NuxtLink>.
      </p>
    </section>
  </article>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default',
  path: '/termos-de-servico',
})

usePublicPageSeo({
  title: 'Termos de serviço',
  description:
    'Termos de utilização do Prazer.Vip — regras para visitantes e anunciantes. Conteúdo para maiores de 18 anos.',
})

const updated = '28 de março de 2026'
</script>
