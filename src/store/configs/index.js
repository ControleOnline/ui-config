import * as actions from "@controleonline/ui-default/src/store/default/actions";
import * as getters from "@controleonline/ui-default/src/store/default/getters";
import mutations from "@controleonline/ui-default/src/store/default/mutations";
import * as customActions from "./customActions";
import customMutations from "./mutations";
import * as customGetters from "./getters";

export default {
  namespaced: true,
  state: {
    resourceEndpoint: "configs",
    isLoading: false,
    error: "",
    violations: null,
    totalItems: 0,
    filters: {},
    company: null,
    item: {},
    currentCompany: null,
    defaultCompany: null,
    companies: [],

    columns: [
      {
        editable: false,
        isIdentity: true,
        sortable: true,
        name: "id",
        align: "left",
        label: "id",
        externalFilter: true,
        format: function (value) {
          return "#" + value;
        },
      },
    ],
  },
  actions: {
    ...customActions,
    ...actions,
  },
  getters: {
    ...customGetters,
    ...getters,
  },
  mutations: {
    ...mutations,
    ...customMutations,
  },
};
