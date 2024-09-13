import * as customTypes from "./mutation_types";

export const currentModule = ({ commit }, module) => {
  if (module) commit(customTypes.SET_MODULE, module);
};
