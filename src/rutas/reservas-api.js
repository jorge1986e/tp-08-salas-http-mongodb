const express = require("express");

// Caminos relativos: el router se monta en /api/reservas desde app.js.
function crearRouterReservasApi(controladorReservas, validarReserva) {
  const router = express.Router();

  router.get("/", controladorReservas.listarApi);
  router.get("/:id", controladorReservas.obtenerApi);
  router.post("/", validarReserva, controladorReservas.crearApi);

  return router;
}

module.exports = { crearRouterReservasApi };
