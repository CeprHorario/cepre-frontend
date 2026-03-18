import api, { request } from "./api";

export const TeachersServices = {
  /**
   * Obtiene la lista de teachers paginada (solo activos).
   * @returns {Promise<{ data: Array, total: number, page: number, limit: number }>}
   */
  async getTeachers(page = 1, limit = 20, curso_id = null) {
    const url = `/teachers?page=${page}&limit=${limit}${curso_id ? `&courseId=${curso_id}` : ""}`;
    return request("get", url, null, true);
  },

  /**
   * Obtiene un teacher por su ID.
   * @param {string} id - ID del teacher.
   */
  async getTeacherById(id) {
    if (!id) throw new Error("ID inválido");
    return request("get", `/teachers/${id}`);
  },

  /**
   * Crea un nuevo teacher.
   * @param {Object} newTeacher - Datos del teacher a crear.
   * @returns {Promise<Object>}
   */
  async createTeacher({
    email,
    personalEmail,
    maxHours = 20,
    scheduledHours = 0,
    jobStatus,
    courseId,
    dni,
    firstName,
    lastName,
    phone,
    phonesAdditional = [],
    isCoordinator = false,
  }) {
    if (!email || !courseId || !firstName || !lastName || !dni) {
      throw new Error("Faltan datos obligatorios");
    }
    if (courseId == 10) {
      maxHours = 21;
    }

    if (jobStatus == "FullTime") {
      maxHours = 16;
    }
    return request("post", "/teachers", {
      email,
      personalEmail,
      maxHours,
      scheduledHours,
      jobStatus,
      courseId,
      dni,
      firstName,
      lastName,
      phone,
      phonesAdditional,
      isCoordinator,
    });
  },

  /**
   * Actualiza un teacher existente.
   * @param {Object} teacherData - Datos del teacher a actualizar.
   * @returns {Promise<Object>}
   */
  async updateTeacher({ userId, firstName, lastName, email, phone, maxHours }) {
    if (!userId) throw new Error("ID inválido");
    return request("put", `/teachers/${userId}`, {
      firstName,
      lastName,
      email,
      phone,
      maxHours,
    });
  },

  /**
   * Elimina un teacher por su ID.
   * @param {string} id - ID del teacher.
   * @returns {Promise<Object>}
   */
  async deleteTeacher(id) {
    if (!id) throw new Error("ID inválido");
    return request("delete", `/teachers/${id}`);
  },

  /**
   * Desactiva un teacher (soft delete del usuario relacionado).
   * @param {string} id - ID del teacher.
   * @returns {Promise<Object>}
   */
  async deactivate(id) {
    if (!id) throw new Error("ID inválido");
    return request("patch", `/teachers/${id}/deactivate`);
  },

  async getHorario(id) {
    if (!id) throw new Error("ID inválido");
    return request("get", `/teachers/${id}/schedules`);
  },

  /**
   * Obtiene los teachers por curso.
   * @param {string} id - ID del curso.
   * @param {number} page - Página de resultados.
   * @param {number} limit - Límite de resultados por página.
   * @returns {Promise<Object>}
   */
  async getTeacherByIdCourse(id, page = 1, limit = 10) {
    if (!id) throw new Error("ID inválido");
    return request(
      "get",
      `/teachers/by-course/${id}?page=${page}&limit=${limit}`,
    );
  },

  /**
   * Obtiene los teachers por query.
   * @param {string} query - Query de búsqueda.
   * @param {number} page - Página de resultados.
   * @param {number} limit - Límite de resultados por página.
   * @returns {Promise<Object>}
   */
  async getTeacherByQuery(query, page = 1, limit = 10) {
    if (!query) throw new Error("Query inválido");
    return request(
      "get",
      `/teachers/search?query=${query}&page=${page}&limit=${limit}`,
    );
  },

  /**
   * Obtiene los teachers disponibles para un curso y sesiones horarias específicas.
   * @param {Object} params - Parámetros de búsqueda.
   * @param {string} params.courseId - ID del curso.
   * @param {Array} params.hourSessions - Array de sesiones horarias.
   * @param {number} page - Página de resultados.
   * @param {number} limit - Límite de resultados por página.
   * @returns {Promise<Object>}
   */
  async getTeacherAvailable({ courseId, hourSessions }, page = 1, limit = 10) {
    if (!courseId || !hourSessions)
      throw new Error("Faltan datos obligatorios");
    return request("post", `/teachers/available?page=${page}&limit=${limit}`, {
      courseId,
      hourSessions,
    });
  },

  /**
   * Crea múltiples teachers desde archivo JSON.
   * @param {File} archivo - Archivo JSON.
   * @returns {Promise<Object>}
   */
  async teacherJson(archivo) {
    const formData = new FormData();
    formData.append("archivo", archivo);
    return request("post", "/teachers/json", formData, false, true);
  },

  /**
   * Crea múltiples teachers desde archivo CSV.
   * @param {File} archivo - Archivo CSV.
   * @returns {Promise<Object>}
   */
  async teacherCsv(archivo) {
    const formData = new FormData();
    formData.append("archivo", archivo);
    return request("post", "/teachers/csv", formData, false, true);
  },

  async teacherExport() {
    const response = await api.get("/teachers/export", {
      responseType: "blob",
    });
    const disposition = response.headers["content-disposition"] || "";
    const match = disposition.match(/filename="?([^"]+)"?/);
    const fileName = match ? match[1] : "profesores.xlsx";
    return { blob: response.data, fileName };
  },
};
