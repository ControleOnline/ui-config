import * as types from "./mutation_types";

export default {
  [types.SET_MODULE](state, module) {
    state.module = module;
  },
};
