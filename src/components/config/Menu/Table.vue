<template>
  <DefaultTable :configs="configs" />
</template>

<script>
export default {
  components: {},

  computed: {
    configs() {
      return {
        externalFilters: false,
        store: "menus",        add: true,
        delete: true,
        selection: false,
        search: false,
      };
    },
  },
};
</script>
