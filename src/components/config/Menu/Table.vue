<template>
  <DefaultTable :configs="configs" />
</template>

<script>
import { mapActions, mapGetters } from "vuex";
export default {
  components: {},

  computed: {
    ...mapGetters({
      defaultCompany: "people/defaultCompany",
    }),
    configs() {
      return {
        externalFilters: false,
        store: "menus",
        filters: true,
        categories: ["menu"],
        add: true,
        delete: true,
        selection: false,
        search: false,
        columns: {
          route: {
            component: this.$components.DefaultTable,
            icon: "person",
            externalFilters: false,
            store: "routes",
            filters: true,
            add: true,
            delete: true,
            selection: false,
            search: false,
          },
          category: {
            filters: {
              context: "menu",
              company: "/people/" + this.defaultCompany.id,
            },
          },
        },
      };
    },
  },
};
</script>
