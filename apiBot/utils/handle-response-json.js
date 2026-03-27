const handleResponseJson = (res, code, data = {}, msg = 'Todo Correcto', paginacion = null) => {

  const response = { msg, data }

  if (paginacion) {
    response.paginacion = paginacion
  }

  res.status(code).json(response)
}

const handleResponseJsonMsg = (res, code = 200, msg = 'Verificar') => {

  const response = { msg }

  res.status(code).json(response);
}

module.exports = { handleResponseJson, handleResponseJsonMsg }