import { request } from "./api";

export const SupervisorsServices = {
  /**
   * Obtiene la lista de supervisores.
   * @param {number} page
   * @param {number} limit
   * @returns {Promise<{ data: Array<Object>, total: number, page: number, limit: number }>}
   */
  async getSupervisors(page = 1, limit = 20) {
    return request("get", `/supervisors?page=${page}&limit=${limit}`, null, true);
  },

  /**
   * Obtiene un supervisor por su ID.
   * @param {string} id - ID del supervisor a obtener.
   * @returns {Promise<Object>}
   */
  async getSupervisorById(id) {
    if (!id) throw new Error("ID inválido");
    return request("get", `/supervisors/${id}`);
  },

  /**
   * Crea un nuevo supervisor.
   * @param {Object} data - Datos del supervisor a crear.
   * @returns {Promise<Object>}
   */
  async createSupervisor({ email, dni, firstName, lastName, phone, phonesAdditional = [], personalEmail, shift_id, shiftId }) {
    if (!email || !dni || !firstName || !lastName) throw new Error("Faltan datos obligatorios");
    return request("post", "/supervisors", { email, dni, firstName, lastName, phone, phonesAdditional, personalEmail, shift_id: shift_id || shiftId });
  },

  /**
   * Actualiza datos del supervisor.
   * @param {Object} data - Datos a actualizar.
   * @returns {Promise<Object>}
   */
  async updateSupervisor({ id, email, firstName, lastName, personalEmail, phone, shift_id, shiftId }) {
    if (!id) throw new Error("ID inválido");
    return request("put", `/supervisors/${id}`, { email, firstName, lastName, personalEmail, phone, shift_id: shift_id || shiftId });
  },

  /**
   * Elimina un supervisor.
   * @param {string} id
   * @returns {Promise<Object>}
   */
  async deleteSupervisor(id) {
    if (!id) throw new Error("ID inválido");
    return request("delete", `/supervisors/${id}`);
  },

  /**
   * Desactiva a un supervisor.
   * @param {string} id
   * @returns {Promise<Object>}
   */
  async deactivate(id) {
    if (!id) throw new Error("ID inválido");
    return request("patch", `/supervisors/${id}/deactivate`);
  },

  /**
   * Obtiene los monitores asociados al supervisor autenticado.
   * @param {string} userId
   * @returns {Promise<Array>}
   */
  async getMonitors(userId = null) {
    const url = userId ? `/supervisors/${userId}/monitors` : "/supervisors/getMonitors";
    return request("get", url);
  },

  /**
   * Asigna un monitor a un supervisor.
   * @param {string} idSupervisor
   * @param {string} idMonitor
   * @returns {Promise<JSON{mensaje: El monitor fue asignado correctamente}>}
   */
  async asignarMonitor(id_supervisor, id_monitor) {
    return request("patch", 'supervisors/assignMonitor', { id_supervisor, id_monitor });
  },

  /**
   * Desasigna un monitor de un supervisor.
   * @param {string} idMonitor
   * @returns {Promise<JSON{mensaje: El monitor fue desasignado correctamente}>}
   */
  async quitarMonitor(id_monitor) {
    return request("patch", 'supervisors/assignMonitor', { id_monitor });
  },

  async supervisorJson(archivo) {
    const formData = new FormData();
    formData.append("archivo", archivo);
    return request("post", "/supervisors/json", formData, false, true);
  },

  async supervisorCsv(archivo) {
    const formData = new FormData();
    formData.append("archivo", archivo);
    return request("post", "/supervisors/csv", formData, false, true);
  }
};
