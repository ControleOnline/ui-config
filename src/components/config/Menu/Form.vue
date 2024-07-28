<template>
  <q-form @submit="onSubmit">
    <div class="row items-center">
      <div class="text-h6">
        {{ item.id === null ? $t("Novo Menu") : $t("Edição de Menu") }}
      </div>
    </div>
    <div class="row q-col-gutter-y-sm q-pt-md">
      <div class="col-xs-12">
        <q-select
          dense
          outlined
          stack-label
          emit-value
          map-options
          v-model="item.category"
          :label="$t('Categoria')"
          :options="categories"
        />
      </div>

      <div class="col-xs-12">
        <q-input
          dense
          outlined
          lazy-rules
          stack-label
          v-model="item.menu"
          type="text"
          :label="$t('Nome Menu')"
          class="q-mt-md"
          :rules="[isInvalid()]"
        />
      </div>

      <div class="col-xs-12">
        <q-select
          dense
          outlined
          stack-label
          emit-value
          map-options
          v-model="item.route"
          :label="$t('Route')"
          :options="routes"
        />
      </div>

      <div class="col-xs-12">
        <q-input
          dense
          outlined
          lazy-rules
          stack-label
          v-model="item.color"
          type="text"
          :label="$t('Cor')"
          class="q-mt-md"
          :rules="[isInvalid()]"
        />
      </div>

      <div class="col-xs-12">
        <q-input
          dense
          outlined
          lazy-rules
          stack-label
          v-model="item.icon"
          type="text"
          :label="$t('Ícone')"
          class="q-mt-md"
          :rules="[isInvalid()]"
        />
      </div>
    </div>
    <div class="row justify-end">
      <q-btn
        :loading="saving"
        icon="save"
        type="submit"
        :label="$t('Salvar')"
        size="md"
        color="primary"
        class="q-mt-md"
        unelevated
        no-caps
      />
    </div>
  </q-form>
</template>

<script>
import { api } from "app/modules/controleonline/ui-common/src/api";
import { mapActions, mapGetters } from "vuex";


export default {
  props: {
    id: {
      required: false,
      default: null,
    },

    context: {
      type: String,
      required: true,
    },
  },

  created() {
    this.loadSelectableOptions();

    if (this.id !== null) {
      this.getItem(this.id).then((item) => {
        this.item.route = item.route;
        this.item.color = item.color;
        this.item.menu = item.menu;
        this.item.icon = item.icon;
        this.item.context = this.context;

        this.item.route =
          item.route !== null && item.route !== undefined ? item.route.id : null;
        this.item.category =
          item.category !== null && item.category !== undefined ? item.category.id : null;
      });
    }
  },

  data() {
    return {
      saving: false,
      item: {
        route: null,
        route: null,
        color: null,
        icon: null,
        id: this.id,
        menu: null,
        context: this.context,
        category: null,
      },
      categories: [],
      routes: [],
    };
  },

  computed: {
    ...mapGetters({
      myCompany: "people/currentCompany",
    }),
  },

  methods: {
    ...mapActions({
      getCategories: "categories/getCategories",
      createCategory: "categories/createCategory",
    }),

    // store method
    getItem(id) {
      return api.fetch
        (`menus/${id}`)

        .then((response) => {
          return response;
        });
    },

    // store method
    save(values, params = {}) {
      let options = {
        method: this.id === null ? "POST" : "PUT",
        
        body: (values),
        params: params,
      };

      let endpoint = this.id === null ? "menus" : `menus/${this.id}`;

      return api.fetch
        (endpoint, options)

        .then((data) => {
          if (data["@id"]) {
            this.$q.notify({
              message: this.$t("Dados salvos com sucesso!"),
              position: "bottom",
              type: "positive",
            });

            this.loadCategories();
            this.loadRoutes();
            return data;
          }

          return null;
        });
    },

    loadSelectableOptions() {
      // load categories
      this.loadCategories();
      this.loadRoutes();
    },

    onSubmit() {
      this.saving = true;

      this.save({
        menu: this.item.menu,
        route: "/routes/" + this.item.route,
        color: this.item.color,
        icon: this.item.icon,
        category: "/categories/" + this.item.category,
        //company: `/people/${this.myCompany.id}`,
      }).finally(() => {
        this.saving = false;
      });
    },

    loadRoutes() {
      this.api
        (`routes`)

        .then((response) => {
          let data = response["hydra:member"];
          data.forEach((item, i) => {
            this.routes.push({
              label: item.route,
              value: item.id,
            });
          });
        });
    },

    loadCategories() {
      this.getCategories({
        params: {
          context: this.context,
          company: this.myCompany.id,
        },
      }).then((members) => {
        if (members.length) {
          let items = [];

          items.push({
            label: null,
            value: null,
          });

          members.forEach((item, i) => {
            items.push({
              label: item.name,
              value: item.id,
            });
          });
          this.categories = items;
        }
      });
    },

    isInvalid(field) {
      return (val) => {
        if (!(val && val.length > 0)) return this.$t("Este campo é obrigatório");

        return true;
      };
    },
  },
};
</script>
