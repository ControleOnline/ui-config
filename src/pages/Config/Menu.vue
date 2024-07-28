<template>
  <q-page padding>
    <div class="row-filters">
      <div class="col-12 col-md-4 q-mb-md text-h6 text-left">Filters</div>
    </div>
    <q-tabs
      :horizontal="$q.screen.gt.xs"
      align="justify"
      v-model="currentTab"
      class="bg-transparent text-primary col-auto"
      dense
    >
      <q-tab
        name="menu"
        :label="$t('config.menu.tittle')"
        class="text-capitalize"
      />
      <q-tab
        name="menu-categories"
        :label="$t('config.categories.tittle')"
        class="text-capitalize"
      />
    </q-tabs>
    <q-tab-panels v-model="currentTab" class="q-mt-sm bg-transparent">
      <q-tab-panel name="menu" class="q-pa-xs">
        <Menu />
      </q-tab-panel>
      <q-tab-panel name="menu-categories" class="q-pa-xs">
        <TableCategories :context="'menu'" />
      </q-tab-panel>
    </q-tab-panels>
  </q-page>
</template>

<script>
import TableCategories from "@controleonline/ui-default/src/components/Default/Categories/Table.vue";
import Menu from "../../components/config/Menu/Table";

export default {
  //
  components: {
    Menu,
    TableCategories,
  },

  computed: {
    user() {
      return this.$store.getters["auth/user"] || {};
    },
  },

  data() {
    return {
      currentTab: "menu",
    };
  },

  methods: {},
};
</script>
