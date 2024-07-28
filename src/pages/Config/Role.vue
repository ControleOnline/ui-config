<template>
  <q-page padding>
    <div class="row-filters">
      <div class="col-12 col-md-4 q-mb-md text-h6 text-left">Filters</div>
    </div>
    <Roles />
  </q-page>
</template>
<script>
 import Roles from "../../components/config/Role/Table";

export default {
  components: {
    Roles,
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
