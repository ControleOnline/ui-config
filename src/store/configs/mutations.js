import * as types from "./mutation_types";

export default {
  [types.SET_MODULE](state, payload) {
    if (!payload?.module) Object.assign(state, { module: payload });
    return { ...state, module: payload?.module || payload };
  },
};
