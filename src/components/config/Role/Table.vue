<template>
  <div>
    <q-table
      flat
      :loading="isLoading"
      :rows="items"
      :columns="settings.columns"
      v-model:pagination="pagination"
      @request="onRequest"
      row-key="id"
      bordered
      :rows-per-page-options="[5, 10, 15, 20, 25, 50]"
    >
      <template v-slot:top>
        <div class="col-xs-12">
          <div class="row justify-end">
            <q-btn
              :label="$t('Adicionar setor')"
              icon="add"
              size="md"
              color="primary"
              @click="
                () => {
                  dialogs.menu.id = null;
                  dialogs.menu.visible = true;
                }
              "
            />
          </div>
        </div>
      </template>
      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td key="id" :props="props">
            <q-btn
              outline
              dense
              :label="`#${props.row.id}`"
              :style="{ color: props.row.color_status }"
              class="full-width"
              @click="
                () => {
                  dialogs.menu.id = props.row.id;
                  dialogs.menu.visible = true;
                }
              "
            />
          </q-td>
          <q-td key="role" :props="props">{{ props.row.role }}</q-td>
        </q-tr>
      </template>
    </q-table>

    <q-dialog v-model="dialogs.menu.visible" @before-hide="reload">
      <q-card style="width: 700px; max-width: 80vw">
        <q-card-section class="row items-center justify-end q-pb-none">
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-card-section class="q-pt-none">
          <FormMenu :context="context" :id="dialogs.menu.id" />
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { api } from "app/modules/controleonline/ui-common/src/api";
import { mapGetters } from "vuex";

 import FormMenu from "./Form";

const SETTINGS = {
  columns: [
    {
      name: "id",
      field: "id",
      align: "left",
      label: "ID",
    },
    {
      name: "role",
      align: "left",
      label: "Função",
    },
  ],
};

Object.freeze(SETTINGS);

export default {
  props: {},

  components: {
    FormMenu,
  },

  created() {
    if (this.myCompany !== null)
      this.onRequest({
        pagination: this.pagination,
      });
  },

  data() {
    return {
      context: "menu",

      settings: SETTINGS,
      items: [],
      pagination: {
        page: 1,
        rowsPerPage: 30,
        rowsNumber: 10,
      },
      isLoading: false,
      dialogs: {
        menu: {
          id: null,
          visible: false,
        },
      },
    };
  },

  computed: {
    ...mapGetters({
      myCompany: "people/currentCompany",
    }),
  },

  watch: {
    myCompany(company) {
      if (company !== null) {
        this.onRequest({
          pagination: this.pagination,
        });
      }
    },
  },

  methods: {
    // store method
    getItems(params) {
      return api.fetch
        ("roles", { params })

        .then((response) => {
          return {
            members: response["hydra:member"],
            total: response["hydra:totalItems"],
          };
        });
    },

    // store method
    delete(id) {
      /*
      let options = {
        method : 'DELETE',
       
        body   : ({ id }),
      };

      let endpoint = `customers/${this.id}/addresses`;
      return api.fetch(endpoint, options)
        
        .then(data => {
          if (data.response) {
            if (data.response.success === false)
              throw new Error(data.response.error);

            return data.response.data;
          }

          return null;
        });
      */
    },

    removeItem(item) {
      /*
      if (window.confirm(this.$t('Are you sure about to remove this element?'))) {
        item._bussy = true;

        this.delete(item.id)
          .then (data => {
            if (data) {
              this.cleanItem(item.id);
            }
          })
          .catch(error => {
            this.$emit('error', { message: error.message });
          })
          .finally(() => {
            item._bussy = false;
          });
      }
      */
    },

    cleanItem(id) {
      /*
      let item   = this.items.find(obj => obj['id'] == id);
      let indx   = this.items.indexOf(item);
      this.items = [...this.items.slice(0, indx), ...this.items.slice(indx + 1)];
      */
    },

    reload() {
      this.onRequest({
        pagination: this.pagination,
      });
    },

    onRequest(props) {
      if (this.isLoading) return;

      let { page, rowsPerPage, rowsNumber, sortBy, descending } = props.pagination;
      let params = { itemsPerPage: rowsPerPage, page };
      params.context = this.context;

      if (this.myCompany != null) {
        params.company = this.myCompany.id;
      }
      params["order[name]"] = "ASC";
      this.isLoading = true;
      this.getItems(params)
        .then((data) => {
          let _items = [];

          if (data.members.length) {
            for (let index in data.members) {
              _items.push({
                id: data.members[index].id,
                role: data.members[index].role,
                _bussy: false,
              });
            }
          }

          this.items = _items;
          this.pagination.rowsNumber = data.total;
          this.pagination.page = page;
          this.pagination.rowsPerPage = rowsPerPage;
          this.pagination.sortBy = sortBy;
          this.pagination.descending = descending;
        })
        .finally(() => {
          this.isLoading = false;
        });
    },
  },
};
</script>
