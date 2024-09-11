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
        categories: ["menu"],
        add: true,
        delete: true,
        selection: false,
        search: false,
        columns: {
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


