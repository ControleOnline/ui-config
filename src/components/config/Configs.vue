<template>
  <DefaultTable :configs="configs" />
</template>
<script>
import { mapActions, mapGetters } from "vuex";
export default {
  components: {},
  props: {
    context: {
      required: true,
    },
  },
  computed: {
    ...mapGetters({
      myCompany: "people/currentCompany",
    }),

    configs() {
      return {
        filters: true,
        store: "configs",
        add: true,
        editable: true,
        delete: false,
        selection: false,
        search: true,
      };
    },
    filters() {
      return this.$store.getters[this.configs.store + "/filters"] || {};
    },
  },
  data() {
    return {};
  },
  created() {},
  methods: {},
};
</script>
