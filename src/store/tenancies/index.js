import * as actions from '@controleonline/ui-default/src/store/default/actions';
import * as getters from '@controleonline/ui-default/src/store/default/getters';
import defaultMutations from '@controleonline/ui-default/src/store/default/mutations';
import * as customActions from './actions';
import customMutations from './mutations';

export default {
  namespaced: true,
  state: {
    item: {},
    items: [],
    resourceEndpoint: 'tenancies',
    isLoading: false,
    isSaving: false,
    error: '',
    totalItems: 0,
    summary: {},
    filters: {},
    messages: [],
    message: {},
    columns: [
      {
        editable: false,
        isIdentity: true,
        sortable: true,
        name: 'id',
        align: 'left',
        label: 'id',
        format(value) {
          return `#${value}`;
        },
      },
      {
        sortable: true,
        name: 'appHost',
        align: 'left',
        label: 'appHost',
        format(value) {
          return value;
        },
      },
      {
        sortable: true,
        name: 'dbHost',
        align: 'left',
        label: 'dbHost',
        format(value) {
          return value;
        },
      },
      {
        sortable: true,
        name: 'dbName',
        align: 'left',
        label: 'dbName',
        format(value) {
          return value;
        },
      },
      {
        sortable: true,
        name: 'dbPort',
        align: 'left',
        label: 'dbPort',
        inputType: 'number',
        format(value) {
          return value;
        },
      },
      {
        sortable: true,
        name: 'dbUser',
        align: 'left',
        label: 'dbUser',
        format(value) {
          return value;
        },
      },
      {
        sortable: true,
        name: 'dbDriver',
        align: 'left',
        label: 'dbDriver',
        format(value) {
          return value;
        },
      },
      {
        sortable: true,
        name: 'dbInstance',
        align: 'left',
        label: 'dbInstance',
        format(value) {
          return value;
        },
      },
      {
        sortable: true,
        name: 'installationStatus',
        align: 'left',
        label: 'installationStatus',
        list: [
          { value: 'pending', label: 'pending' },
          { value: 'installed', label: 'installed' },
          { value: 'failed', label: 'failed' },
        ],
        format(value) {
          return value;
        },
      },
      {
        editable: true,
        name: 'dbPassword',
        align: 'left',
        label: 'dbPassword',
        inputType: 'password',
        table: false,
        format() {
          return '';
        },
      },
    ],
  },
  actions: {
    ...actions,
    ...customActions,
  },
  getters,
  mutations: {
    ...defaultMutations,
    ...customMutations,
  },
};
