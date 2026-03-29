<template>
  <article class="prose prose-invert prose-zinc max-w-none">
    <header class="border-b border-zinc-800 pb-8 not-prose">
      <h1 class="text-3xl font-bold text-white">Política de privacidade</h1>
      <p class="mt-2 text-sm text-zinc-500">Última atualização: {{ updated }}</p>
    </header>

    <section class="mt-10 space-y-4 text-zinc-300">
      <h2 class="text-xl font-semibold text-white">1. Introdução</h2>
      <p>
        O Prazer.Vip respeita a sua privacidade. Esta página descreve, em linhas gerais, que tipo de informação
        pode ser recolhida quando utiliza o site e como é utilizada. O texto definitivo será alinhado com o
        registo legal da plataforma e com o backend (Laravel).
      </p>

      <h2 class="pt-6 text-xl font-semibold text-white">2. Dados que podemos tratar</h2>
      <ul class="list-inside list-disc space-y-2 text-zinc-400">
        <li>Dados de conta (e-mail, nome) quando regista ou entra na área de anunciante.</li>
        <li>Dados de perfil e media enviados no fluxo de cadastro e aprovação.</li>
        <li>Dados técnicos (logs, endereço IP, tipo de browser) para segurança e funcionamento do serviço.</li>
      </ul>

      <h2 class="pt-6 text-xl font-semibold text-white">3. Finalidades</h2>
      <p>
        Prestação do serviço, verificação de anúncios, comunicação necessária, cumprimento de obrigações legais
        e melhoria da segurança da plataforma.
      </p>

      <h2 class="pt-6 text-xl font-semibold text-white">4. Conservação e partilha</h2>
      <p>
        Os dados são conservados pelo tempo necessário à finalidade ou à lei aplicável. Não vendemos listas de
        contatos. Prestadores de infraestrutura ou pagamento podem aceder a dados estritamente necessários
        quando integrados.
      </p>

      <h2 class="pt-6 text-xl font-semibold text-white">5. Os seus direitos</h2>
      <p>
        Dependendo da jurisdição, pode solicitar acesso, retificação, eliminação ou oposição ao tratamento.
        Para exercer direitos ou questões sobre privacidade, utilize a página de
        <NuxtLink to="/contato" class="text-brand hover:underline">contato</NuxtLink>.
      </p>

      <h2 class="pt-6 text-xl font-semibold text-white">6. Alterações</h2>
      <p>
        Esta política pode ser atualizada. A versão vigente estará sempre disponível nesta página.
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

const updated = '28 de março de 2026'
</script>
