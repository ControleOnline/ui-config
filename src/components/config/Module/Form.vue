<template>
  <q-form @submit="onSubmit">
    <div class="row items-center">
      <div class="text-h6">
        {{ item.id === null ? $t("Novo Modulo") : $t("Edição de modulos") }}
      </div>
    </div>
    <div class="row q-col-gutter-y-sm q-pt-md">
      <div class="col-xs-12">
        <q-input
          dense
          outlined
          lazy-rules
          stack-label
          v-model="item.name"
          type="text"
          :label="$t('name')"
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
          v-model="item.description"
          type="text"
          :label="$t('description')"
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
        this.item.color = item.color;
        this.item.icon = item.icon;
        this.item.description = item.description;
        this.item.name = item.name;
      });
    }
  },

  data() {
    return {
      saving: false,
      item: {
        color: null,
        icon: null,
        id: this.id,
        name: null,
        description: null,
      },
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
        (`modules/${id}`)

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

      let endpoint = this.id === null ? "roles" : `modules/${this.id}`;

      return api.fetch
        (endpoint, options)

        .then((data) => {
          if (data["@id"]) {
            this.$q.notify({
              message: this.$t("Dados salvos com sucesso!"),
              position: "bottom",
              type: "positive",
            });

            return data;
          }

          return null;
        });
    },

    loadSelectableOptions() {
      // load categories
    },

    onSubmit() {
      this.saving = true;

      this.save({
        description: this.item.description,
        color: this.item.color,
        icon: this.item.icon,
        name: this.item.name,
      }).finally(() => {
        this.saving = false;
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
