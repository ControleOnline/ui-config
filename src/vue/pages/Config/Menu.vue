<!-- Contract imported from AGENTS.md
## Escopo
- Modulo de configuracoes, menus, modulos e rotas da arquitetura antiga.
- Funciona como apoio de store/config para telas legadas.

## Estado
- Este modulo hoje nao tem `src/react`; a implementacao disponivel fica em `src/vue` e no store antigo.
- Em novos prompts, priorizar modulos React equivalentes quando existirem.
- So mexer aqui se o pedido for explicitamente sobre esse fluxo antigo ou se nao houver alternativa atual.

## Quando usar
- Prompts sobre menus legados, configuracoes antigas, store de configs e estrutura Quasar antiga.
-->

<template>

  <Menu />

</template>

<script>
import Menu from "../../components/config/Menu/Table";

export default {
  //
  components: {
    Menu,
  },

  computed: {

  },

  data() {
    return {

    };
  },

  methods: {},
};
</script>
