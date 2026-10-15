import { request } from "./api";

export const SystemServices = {
  getStatus() {
    return request("get", "/system/status");
  },

  getRuntimeConfig() {
    return request("get", "/system/runtime-config");
  },

  updateRuntimeConfig(config) {
    return request("patch", "/system/runtime-config", config);
  },

  getSchemas() {
    return request("get", "/system/schemas");
  },

  getHistory(limit = 20) {
    return request("get", `/system/runtime-config/history?limit=${limit}`);
  },

  rollback(version) {
    return request("post", `/system/runtime-config/rollback/${version}`);
  },
};
