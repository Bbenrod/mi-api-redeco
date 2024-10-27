const Joi = require("joi");

// Función para validar que la fecha de recepción esté dentro del mes y año reportados
const validateFecRecepcion = (value, helpers) => {
  const monthToReport = helpers.state.ancestors[0].QuejasNoMes; // Mes que se reporta
  const yearToReport = new Date().getFullYear(); // Suponiendo que el año es el actual

  const [day, month, year] = value.split("/").map(Number); // Descomponemos la fecha
  const dateToValidate = new Date(year, month - 1, day); // Creamos la fecha

  // Verificamos que la fecha sea válida
  if (isNaN(dateToValidate.getTime())) {
    return helpers.error("date.base", {
      message: "La fecha de recepción debe ser válida.",
    });
  }

  // Verificamos que el mes y año coincidan
  if (
    dateToValidate.getMonth() + 1 !== monthToReport ||
    dateToValidate.getFullYear() !== yearToReport
  ) {
    return helpers.error("any.invalid", {
      message:
        "La fecha de recepción debe estar dentro del mes y año a reportar.",
    });
  }

  return value; // Si todo está bien, retornamos el valor
};

const quejaSchema = Joi.object({
  QuejasDenominacion: Joi.string().max(400).required().messages({
    "string.base": "La denominación debe ser un texto.",
    "string.max": "La denominación no puede exceder los 400 caracteres.",
    "any.required": "La denominación es obligatoria.",
  }),

  QuejasSector: Joi.string().max(200).required().messages({
    "string.base": "El sector debe ser un texto.",
    "string.max": "El sector no puede exceder los 200 caracteres.",
    "any.required": "El sector es obligatorio.",
  }),

  QuejasNoMes: Joi.number().integer().min(1).max(12).required().messages({
    "number.base": "El mes debe ser un número.",
    "number.integer": "El mes debe ser un número entero.",
    "number.min": "El mes debe ser al menos 1.",
    "number.max": "El mes debe ser como máximo 12.",
    "any.required": "El mes es obligatorio.",
  }),

  QuejasNum: Joi.number().integer().valid(1).required().messages({
    "number.base": "El número de quejas debe ser un número.",
    "number.integer": "El número de quejas debe ser un número entero.",
    "any.only": "El número de quejas debe ser 1.",
    "any.required": "El número de quejas es obligatorio.",
  }),

  QuejasFolio: Joi.string().max(50).required().messages({
    "string.base": "El folio debe ser un texto.",
    "string.max": "El folio no puede exceder los 50 caracteres.",
    "any.required": "El folio es obligatorio.",
  }),

  QuejasFecRecepcion: Joi.string()
    .pattern(/^\d{2}\/\d{2}\/\d{4}$/)
    .required()
    .custom(validateFecRecepcion)
    .messages({
      "string.base": "La fecha de recepción debe ser un texto.",
      "string.pattern.base":
        "La fecha de recepción debe tener el formato dd/mm/aaaa.",
      "any.required": "La fecha de recepción es obligatoria.",
      "date.base": "La fecha de recepción debe ser válida.",
    }),

  QuejasMedio: Joi.number().integer().required().messages({
    "number.base": "El medio debe ser un número.",
    "number.integer": "El medio debe ser un número entero.",
    "any.required": "El medio es obligatorio.",
  }),

  QuejasNivelAT: Joi.number().integer().required().messages({
    "number.base": "El nivel de atención debe ser un número.",
    "number.integer": "El nivel de atención debe ser un número entero.",
    "any.required": "El nivel de atención es obligatorio.",
  }),

  QuejasProducto: Joi.string().max(12).required().messages({
    "string.base": "El producto debe ser un texto.",
    "string.max": "El producto no puede exceder los 12 caracteres.",
    "any.required": "El producto es obligatorio.",
  }),

  QuejasCausa: Joi.string().max(4).required().messages({
    "string.base": "La causa de la queja debe ser un texto.",
    "string.max": "La causa de la queja no puede exceder los 4 caracteres.",
    "any.required": "La causa de la queja es obligatoria.",
  }),

  QuejasPORI: Joi.string().valid("SI", "NO").required().messages({
    "string.base": "El valor de PORI debe ser un texto.",
    "any.only": 'El valor de PORI debe ser "SI" o "NO".',
    "any.required": "El valor de PORI es obligatorio.",
  }),

  QuejasEstatus: Joi.number().integer().valid(1, 2).required().messages({
    "number.base": "El estatus debe ser un número.",
    "number.integer": "El estatus debe ser un número entero.",
    "any.only": "El estatus debe ser 1 (Pendiente) o 2 (Concluido).",
    "any.required": "El estatus es obligatorio.",
  }),

  QuejasEstados: Joi.number().integer().required().messages({
    "number.base": "El estado debe ser un número.",
    "number.integer": "El estado debe ser un número entero.",
    "any.required": "El estado es obligatorio.",
  }),

  QuejasMunId: Joi.number().integer().required().messages({
    "number.base": "El municipio debe ser un número.",
    "number.integer": "El municipio debe ser un número entero.",
    "any.required": "El municipio es obligatorio.",
  }),

  QuejasLocId: Joi.number().integer().messages({
    "number.base": "La localidad debe ser un número.",
    "number.integer": "La localidad debe ser un número entero.",
  }),

  QuejasColId: Joi.number().integer().required().messages({
    "number.base": "La colonia debe ser un número.",
    "number.integer": "La colonia debe ser un número entero.",
    "any.required": "La colonia es obligatoria.",
  }),

  QuejasCP: Joi.number().integer().required().messages({
    "number.base": "El código postal debe ser un número.",
    "number.integer": "El código postal debe ser un número entero.",
    "any.required": "El código postal es obligatorio.",
  }),

  QuejasTipoPersona: Joi.number().integer().valid(1, 2).required().messages({
    "number.base": "El tipo de persona debe ser un número.",
    "number.integer": "El tipo de persona debe ser un número entero.",
    "any.only":
      "El tipo de persona debe ser 1 (Persona Física) o 2 (Persona Moral).",
    "any.required": "El tipo de persona es obligatorio.",
  }),

  QuejasSexo: Joi.string().valid("H", "M").allow(null).messages({
    "string.base": "El sexo debe ser un texto.",
    "any.only": 'El sexo debe ser "H" o "M".',
  }),

  QuejasEdad: Joi.number().integer().allow(null).messages({
    "number.base": "La edad debe ser un número.",
    "number.integer": "La edad debe ser un número entero.",
  }),

  QuejasFecResolucion: Joi.date().allow(null).messages({
    "date.base": "La fecha de resolución debe ser una fecha válida.",
  }),

  QuejasFecNotificacion: Joi.date().allow(null).messages({
    "date.base": "La fecha de notificación debe ser una fecha válida.",
  }),

  QuejasRespuesta: Joi.number().integer().valid(1, 2, 3).allow(null).messages({
    "number.base": "El sentido de la resolución debe ser un número.",
    "number.integer": "El sentido de la resolución debe ser un número entero.",
    "any.only": "El sentido de la resolución debe ser 1, 2 o 3.",
  }),

  QuejasNumPenal: Joi.number().integer().allow(null).messages({
    "number.base": "El número de penalización debe ser un número.",
    "number.integer": "El número de penalización debe ser un número entero.",
  }),

  QuejasPenalizacion: Joi.number()
    .integer()
    .valid(1, 2, 3)
    .allow(null)
    .messages({
      "number.base": "El tipo de penalización debe ser un número.",
      "number.integer": "El tipo de penalización debe ser un número entero.",
      "any.only": "El tipo de penalización debe ser 1, 2 o 3.",
    }),
});

module.exports = quejaSchema;
