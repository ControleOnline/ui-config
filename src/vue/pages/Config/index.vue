<template>
  <Configs :context="context" v-if="context" />
</template>

<script>
import Configs from "../../components/config/Configs.vue";

export default {
  components: {
    Configs,
  },

  data() {
    return {
      context: 'configs'
    };
  },
  created() {
  },
};
</script>
