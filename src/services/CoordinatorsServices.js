import { request } from "./api";

export const CoordinatorsServices = {
  async getCoordinators(page = 1, limit = 20) {
    return request("get", `/coordinators?page=${page}&limit=${limit}`, null, true);
  },

  async getCoordinatorById(id) {
    if (!id) throw new Error("ID invalido");
    return request("get", `/coordinators/${id}`);
  },

  async createCoordinator({
    email,
    courseId,
    dni,
    firstName,
    lastName,
    phone,
    phonesAdditional = [],
    personalEmail,
  }) {
    if (!email || courseId === undefined || !dni || !firstName || !lastName) {
      throw new Error("Faltan datos obligatorios");
    }

    return request("post", "/coordinators", {
      email,
      courseId,
      dni,
      firstName,
      lastName,
      phone,
      phonesAdditional,
      personalEmail,
    });
  },

  async updateCoordinator({
    id,
    email,
    courseId,
    dni,
    firstName,
    lastName,
    phone,
    phonesAdditional,
    personalEmail,
  }) {
    if (!id) throw new Error("ID invalido");

    return request("put", `/coordinators/${id}`, {
      email,
      courseId,
      dni,
      firstName,
      lastName,
      phone,
      phonesAdditional,
      personalEmail,
    });
  },

  async deactivate(id) {
    if (!id) throw new Error("ID invalido");
    return request("patch", `/coordinators/${id}/deactivate`);
  },
};
