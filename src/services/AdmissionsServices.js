import { request } from "./api";

export const AdmissionsServices = {
  async crearAdmission({ name, year, sede, started, finished, configuration }) {
    return request("post", "/admissions", { name, year, sede, started, finished, configuration });
  },

  async getAllAdmissions() {
    return request("get", "/admissions");
  },

  async getCurrentAdmission() {
    return request("get", "/admissions/current");
  },

  async getAdmissionByName(name) {
    return request("get", `/admissions/${name}`);
  },

  async setCurrentAdmission(name) {
    return request("post", "/admissions/current", { name });
  }
}