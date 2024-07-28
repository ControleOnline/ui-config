<template>
  <q-page padding>
    <div class="row-filters">
      <div class="col-12 col-md-4 q-mb-md text-h6 text-left">Filters</div>
    </div>
    <Module />
  </q-page>
</template>
<script>
 import Module from "../../components/config/Module/Table";

export default {
  components: {
    Module,
  },
  computed: {
    user() {
      return this.$store.getters["auth/user"] || {};
    },
  },

  data() {
    return {};
  },

  methods: {},
};
</script>
