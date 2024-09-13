import { LocalStorage } from 'quasar';
import * as types from './mutation_types';

export default {

  [types.SET_MODULE  ](state, module) {
    Object.assign(state, { module });
  },

};
