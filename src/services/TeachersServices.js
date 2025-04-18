import { request } from "./api";

export const TeachersServices = {
  /**
   * Obtiene la lista de teachers.
   * @returns {Promise<Array<{ userId: string, courseId: string, maxHours: number, scheduledHours: number, isActive: boolean, jobShiftType: string, createdAt: string, updatedAt: string }>> | null}
   */
  async getTeachers(page = 1, limit = 20) {
    return request("get", `/teachers?page=${page}&limit=${limit}`, null, true);
  },

  /**
   * Obtiene un teacher por su ID.
   * @param {string} userId - ID del teacher a obtener.
   */
  async getTeacherById(userId) {
    if (!userId) throw new Error("ID inválido");
    return request("get", `/teachers/${userId}`);
  },

  /**
   * Crea un nuevo teacher.
   * @param {Object} newTeacher - Datos del teacher a crear.
   * @returns {Promise<{ Object } | null>}
   */
  async createTeacher({ email, personalEmail, maxHours = 30, scheduledHours = 0, jobStatus, courseId, dni, firstName, lastName, phone, phonesAdditional = [], isCoordinator = false }) {
    if (!email || !courseId || !firstName || !lastName) throw new Error("Faltan datos obligatorios");
    return request("post", "/teachers", { email, personalEmail, maxHours, scheduledHours, jobStatus, courseId, dni, firstName, lastName, phone, phonesAdditional, isCoordinator });
  },

  /**
   * Actualiza un teacher existente.
   * @param {Object} teacherData - Datos del teacher a actualizar.
   * @returns {Promise<{ Object } | null>}
   * @throws {Error} Si el ID del teacher no es válido.
   */
  async updateTeacher({ userId, firstName, lastName, personalEmail, phone }) {
    if (!userId) throw new Error("ID inválido");
    return request("put", `/teachers/${userId}`, { firstName, lastName, personalEmail, phone });
  },

  /**
   * Elimina un teacher por su ID.
   * @param {string} userId - ID del teacher a eliminar.
   * @returns {Promise<boolean>}
   * @throws {Error} Si el ID no es válido.
   */
  async deleteTeacher(userId) {
    if (!userId) throw new Error("ID inválido");
    return request("delete", `/teachers/${userId}`);
  },

  async deactivate(id) {
    if (!id) throw new Error("ID inválido");
    return request("patch", `/teachers/${id}/deactivate`);
  },

  async teacherJson(archivo) {
    const formData = new FormData();
    formData.append("archivo", archivo);
    return request("post", "/teachers/json", formData, false, true);
  },

  async teacherCsv(archivo) {
    const formData = new FormData();
    formData.append("archivo", archivo);
    return request("post", "/teachers/csv", formData, false, true);
  }
};
