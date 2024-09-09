<template>
  a
  <DefaultTable :configs="configs" v-if="loaded && configs" />
  b
</template>

<script>
export default {
  components: {},

  computed: {
    configs() {
      return {
        externalFilters: false,
        totalItems: 50,
        filters: false,
        controls: false,
        "full-height": false,
        store: "menus",
        title: {
          class: "text-primary text-h6 q-mb-md",
          icon: {
            name: "menus",
            size: "24px",
            class: "q-mr-sm",
          },
        },
        add: true,
        delete: true,
        selection: false,
        search: false,
      };
    },
  },
};
</script>
