import * as actions from "@controleonline/ui-default/src/store/default/actions";
import * as getters from "@controleonline/ui-default/src/store/default/getters";
import mutations from "@controleonline/ui-default/src/store/default/mutations";
import Formatter from "@controleonline/ui-common/src/utils/formatter.js";



// "name": "people",
// "color": "$primary",
// "icon": "",
// "description": null




export default {
  namespaced: true,
  state: {
    resourceEndpoint: "modules",
    isLoading: false,
    error: "",
    violations: null,
    totalItems: 0,
    filters: {},
    columns: [
      {
        sortable: true,
        isIdentity: true,        
        name: "id",
        editable: false,
        label: "id",
        align: "left",
        // format(value, column, row) {
        //   return value;
        // },
      },
      {
        sortable: true,
        name: "name",
        editable: true,
        label: "name",
        align: "left",
        format(value, column, row) {
          return value;
        },        
      },
      {
        sortable: true,
        name: "color",
        editable: true,
        label: "color",
        align: "left",
      },   
      {
        sortable: true,
        name: "icon",
        editable: true,
        label: "icon",
        align: "left",
      },        
      {
        sortable: true,
        name: "description",
        editable: true,
        label: "description",
        align: "left",
      }, 
        ],
  },
  actions: actions,
  getters,
  mutations,
};
