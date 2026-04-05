<template>
  <article class="prose prose-invert prose-zinc max-w-none">
    <header class="border-b border-zinc-800 pb-8 not-prose">
      <h1 class="text-3xl font-bold text-white">Sobre nós</h1>
      <p class="mt-2 text-lg text-zinc-400">
        Prazer.Vip é um diretório de classificados para adultos: listagens por cidade, perfis verificados quando
        aplicável e regras claras de publicação.
      </p>
    </header>

    <section class="mt-10 space-y-5 text-zinc-300">
      <h2 class="!mt-12 text-xl font-semibold text-white not-prose">O que é o Prazer.Vip</h2>
      <p>
        Somos uma plataforma digital que reúne anúncios de acompanhantes e profissionais do segmento adulto,
        organizados por localização e filtros de pesquisa.
      </p>

      <h2 class="!mt-12 text-xl font-semibold text-white not-prose">O nosso papel (e o que não fazemos)</h2>
      <p>
        <strong class="text-zinc-200">Não intermediamos contatos nem encontros.</strong> Não participamos de
        conversas, combinações ou negócios entre visitantes e anunciantes. Limitamo-nos a disponibilizar espaço
        publicitário e tecnologia (listagens, formulários de cadastro).
      </p>
      <p>
        Qualquer acordo, valores ou condições são da exclusiva responsabilidade das partes envolvidas. Recomendamos
        prudência, uso de canais seguros e respeito mútuo em todas as interações fora desta plataforma.
      </p>

      <h2 class="!mt-12 text-xl font-semibold text-white not-prose">Conteúdo e responsabilidade dos anunciantes</h2>
      <p>
        Vídeos, áudios, imagens, textos e comentários associados a cada anúncio são de
        <strong class="text-zinc-200">responsabilidade integral dos anunciantes</strong>, que devem assegurar a
        veracidade, a licitude e a adequação do material publicado. O Prazer.Vip pode remover conteúdo ou perfis que
        violem as regras do site ou a legislação, sem prejuízo de medidas adicionais quando necessário.
      </p>
      <p>
        Se encontrar algo que considere incorreto, ofensivo ou ilegal, utilize o
        <NuxtLink to="/contato" class="text-brand hover:underline">formulário de contato</NuxtLink>
        e escolha «Denúncia de perfil ou conteúdo», indicando, se possível, o link ou a referência do anúncio. Analisamos
        os relatos com discrição.
      </p>

      <h2 class="!mt-12 text-xl font-semibold text-white not-prose">Maiores de 18 anos</h2>
      <p>
        O acesso e a utilização do Prazer.Vip destinam-se exclusivamente a pessoas com
        <strong class="text-zinc-200">18 anos ou mais</strong>. No processo de cadastro, exigimos comprovação
        documental da maioridade dos anunciantes, em linha com a nossa política de segurança e conformidade.
      </p>

      <h2 class="!mt-12 text-xl font-semibold text-white not-prose">Privacidade e termos</h2>
      <p>
        Tratamos dados pessoais de acordo com a nossa
        <NuxtLink to="/politica-de-privacidade" class="text-brand hover:underline">Política de privacidade</NuxtLink>
        e as condições descritas nos
        <NuxtLink to="/termos-de-servico" class="text-brand hover:underline">Termos de serviço</NuxtLink>.
        Para criar ou gerir o seu anúncio, utilize o
        <NuxtLink to="/cadastro" class="text-brand hover:underline">cadastro de anunciante</NuxtLink>.
      </p>

      <div
        class="not-prose mt-12 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 text-zinc-300"
      >
        <h2 class="text-lg font-semibold text-white">Fale connosco</h2>
        <p class="mt-3 text-sm leading-relaxed">
          Dúvidas, sugestões, questões sobre conta ou denúncias: prefira o
          <NuxtLink to="/contato" class="text-brand hover:underline">formulário de contato</NuxtLink>
          para registar o pedido com detalhe.
        </p>
        <dl class="mt-4 space-y-2 text-sm">
          <div class="flex flex-wrap gap-x-2">
            <dt class="text-zinc-500">Telefone</dt>
            <dd>
              <a href="tel:+5511985423160" class="text-brand hover:underline">(11) 98542-3160</a>
            </dd>
          </div>
          <div class="flex flex-wrap gap-x-2">
            <dt class="text-zinc-500">E-mail</dt>
            <dd>
              <a href="mailto:contato@prazer.vip" class="text-brand hover:underline">contato@prazer.vip</a>
            </dd>
          </div>
        </dl>
      </div>
    </section>
  </article>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default',
  path: '/sobre-nos',
})

useHead({
  title: 'Sobre nós',
})
</script>
