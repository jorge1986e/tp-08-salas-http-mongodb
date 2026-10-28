// Servicio persistente: habla con Mongoose. No conoce req, res, EJS ni códigos HTTP.
const mongoose = require("mongoose");
const { Reserva } = require("../modelos/reserva");

// Convierte un documento de Mongo en un objeto simple para las vistas y la API.
// El _id (ObjectId) pasa a ser un texto llamado "id".
function representarReserva(documento) {
  return {
    id: documento._id.toString(),
    estudiante: documento.estudiante,
    email: documento.email,
    sala: documento.sala,
    fecha: documento.fecha,
    turno: documento.turno,
    personas: documento.personas,
    estado: documento.estado,
  };
}

function crearError(mensaje, codigo) {
  const error = new Error(mensaje);
  error.codigo = codigo;
  return error;
}

function crearServicioReservasMongo({
  salasPermitidas = [],
  turnosPermitidos = [],
} = {}) {
  // sala es opcional. Si llega, debe ser un texto no vacío (no un arreglo ni un objeto).
  async function listar(sala) {
    const filtro = {};

    if (sala !== undefined) {
      if (typeof sala !== "string" || sala.trim() === "") {
        throw crearError("Filtro de sala inválido", "FILTRO_INVALIDO");
      }
      filtro.sala = sala;
    }

    const documentos = await Reserva.find(filtro).lean();
    return documentos.map(representarReserva);
  }

  // Devuelve la reserva o null si no existe. Un ID mal formado es un error de entrada.
  async function obtenerPorId(id) {
    if (typeof id !== "string" || !mongoose.isObjectIdOrHexString(id)) {
      throw crearError("Identificador inválido", "ID_INVALIDO");
    }

    const documento = await Reserva.findById(id).lean();
    return documento ? representarReserva(documento) : null;
  }

  // Se copian solo los seis campos admitidos: nunca "datos" completo.
  async function crear(datos) {
    const documento = await Reserva.create({
      estudiante: datos.estudiante,
      email: datos.email,
      sala: datos.sala,
      fecha: datos.fecha,
      turno: datos.turno,
      personas: datos.personas,
    });

    return representarReserva(documento);
  }

  async function contar() {
    return Reserva.countDocuments();
  }

  function obtenerOpciones() {
    return {
      salasPermitidas: [...salasPermitidas],
      turnosPermitidos: [...turnosPermitidos],
    };
  }

  return { listar, obtenerPorId, crear, contar, obtenerOpciones };
}

module.exports = { crearServicioReservasMongo };
