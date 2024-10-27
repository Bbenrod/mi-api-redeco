// Crear una nueva queja
const { Sequelize } = require("sequelize");
const { Queja } = require("../models"); // Importar el modelo de Queja
const quejaSchema = require("../schemas/queja"); // Importar el esquema de validación
const logger = require("../utils/logger");

const createQueja = async (req, res) => {
  try {
    const quejasData = req.body; // Cuerpo de la solicitud que contiene un array de quejas
    const superuser_id = req.user.id; // Obtenemos el superuser_id del token

    if (!Array.isArray(quejasData)) {
      return res.status(400).json({
        message: "El cuerpo de la solicitud debe ser un array de quejas.",
      });
    }

    const errores = {}; // Para almacenar errores de validación
    const quejasEnviadas = []; // Para almacenar los folios de quejas enviadas

    for (const quejaData of quejasData) {
      const { error } = quejaSchema.validate(quejaData, { abortEarly: false });

      if (error) {
        const folio = quejaData.QuejasFolio || "Desconocido";
        errores[folio] = error.details.map((err) => err.message);
        continue;
      }

      // Verificación de duplicado
      const existingQueja = await Queja.findOne({
        where: { QuejasFolio: quejaData.QuejasFolio },
      });

      if (existingQueja) {
        const folio = quejaData.QuejasFolio;
        errores[folio] = [
          `Folio duplicado. Ya existe un folio ${folio} para la Institución Financiera y debe de ser único.`,
        ];
        continue;
      }

      // Asignar superuser_id a cada queja
      quejaData.superuser_id = superuser_id;

      // Conversión de la fecha de recepción
      if (quejaData.QuejasFecRecepcion) {
        const [day, month, year] =
          quejaData.QuejasFecRecepcion.split("/").map(Number);
        const fechaRecepcion = new Date(year, month - 1, day); // -1 porque los meses en JS empiezan desde 0

        // Verificamos que la fecha sea válida
        if (isNaN(fechaRecepcion.getTime())) {
          const folio = quejaData.QuejasFolio || "Desconocido";
          errores[folio] = errores[folio] || [];
          errores[folio].push("Fecha de recepción inválida");
          continue;
        }

        quejaData.QuejasFecRecepcion = fechaRecepcion; // Asignamos el objeto Date
      }

      quejasEnviadas.push(quejaData.QuejasFolio); // Añadir a la lista de quejas a enviar
    }

    if (Object.keys(errores).length > 0) {
      return res.status(400).json({
        errors: errores,
        message:
          "Ninguno de los registros enviados fue adicionado hasta que se haga la corrección total de los folios.",
      });
    }

    // Inserción en la base de datos
    for (const quejaData of quejasData) {
      await Queja.create(quejaData);
    }

    res.status(200).json({
      "Número total de envíos": quejasEnviadas.length,
      "Quejas enviadas": quejasEnviadas,
      message: "Los registros mostrados arriba fueron adicionados.",
    });
  } catch (error) {
    logger.error(error);

    res.status(500).json({
      message: "Error en la solicitud",
      error: error.message,
    });
  }
};

// Eliminar una queja por folio
const deleteQueja = async (req, res) => {
  const { quejaFolio } = req.query;

  if (!quejaFolio) {
    return res.status(400).json({
      message: "El número de folio es necesario para eliminar la queja.",
    });
  }

  try {
    const queja = await Queja.findOne({ where: { QuejasFolio: quejaFolio } });

    if (!queja) {
      return res.status(404).json({
        message: `No se encontró ninguna queja con el folio ${quejaFolio}.`,
      });
    }

    await queja.destroy();

    res.status(200).json({
      message: `La queja con el folio ${quejaFolio} fue eliminada correctamente.`,
    });
  } catch (error) {
    logger.error("Error al intentar eliminar la queja:", error); // Registrar error en la consola
    res.status(500).json({
      message: "Error al intentar eliminar la queja.",
      error: error.message, // Proporcionar información del error
    });
  }
};

// Obtener una queja específica (para referencias futuras)
const getQuejas = async (req, res) => {
  try {
    const { year, month } = req.query;
    const userId = req.user.id;

    let filter = {
      where: { superuser_id: userId },
      order: [["QuejasFecRecepcion", "DESC"]],
    };

    // Validación de año y mes
    if (year && month && (month < 1 || month > 12)) {
      return res.status(400).json({
        message: "Por favor proporciona un año válido y un mes entre 1 y 12.",
      });
    }

    // Si se proporciona año y mes, filtramos por fechas
    if (year) {
      const startDate = new Date(year, month ? month - 1 : 0, 1);
      const endDate = new Date(year, month ? month : 12, 0);
      filter.where.QuejasFecRecepcion = {
        [Sequelize.Op.between]: [startDate, endDate],
      };
    }

    const quejas = await Queja.findAll(filter);

    // Filtrar solo los campos necesarios
    const result = quejas.map((queja) => {
      return {
        QuejasDenominacion: queja.QuejasDenominacion,
        QuejasSector: queja.QuejasSector,
        QuejasNoMes: queja.QuejasNoMes,
        QuejasNum: queja.QuejasNum,
        QuejasFolio: queja.QuejasFolio,
        QuejasFecRecepcion: formatDate(queja.QuejasFecRecepcion), // Formatear fecha
        QuejasMedio: queja.QuejasMedio,
        QuejasNivelAT: queja.QuejasNivelAT,
        QuejasProducto: queja.QuejasProducto,
        QuejasCausa: queja.QuejasCausa,
        QuejasPORI: queja.QuejasPORI,
        QuejasEstatus: queja.QuejasEstatus,
        QuejasEstados: queja.QuejasEstados,
        QuejasMunId: queja.QuejasMunId,
        QuejasLocId: queja.QuejasLocId,
        QuejasColId: queja.QuejasColId,
        QuejasCP: queja.QuejasCP,
        QuejasTipoPersona: queja.QuejasTipoPersona,
        QuejasSexo: queja.QuejasSexo,
        QuejasEdad: queja.QuejasEdad,
        QuejasFecResolucion: queja.QuejasFecResolucion,
        QuejasFecNotificacion: queja.QuejasFecNotificacion,
        QuejasRespuesta: queja.QuejasRespuesta,
        QuejasNumPenal: queja.QuejasNumPenal,
        QuejasPenalizacion: queja.QuejasPenalizacion,
      };
    });

    res.status(200).json({
      message: "Quejas obtenidas correctamente",
      data: result,
    });
  } catch (error) {
    logger.error("Error al obtener las quejas:", error);
    res.status(500).json({
      message: "Hubo un error al obtener las quejas",
      error: error.message,
    });
  }
};

// Función para formatear la fecha en formato dd/mm/yyyy
const formatDate = (date) => {
  if (!date) return null; // Maneja el caso de fechas nulas
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Los meses en JavaScript son de 0 a 11
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

module.exports = {
  createQueja,
  deleteQueja,
  getQuejas,
};
