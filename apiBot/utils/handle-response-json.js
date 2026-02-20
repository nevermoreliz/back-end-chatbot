const handleResponseJson = (res, code, data = {}, msg = 'Todo Correcto', state = true) => {
  res.status(code).json({
    ok: state,
    msg,
    data
  });
}

const handleResponseJsonMsg = (res, code = 200, msg = 'Verificar') => {
  res.status(code).json({
    msg
  });
}

module.exports = { handleResponseJson, handleResponseJsonMsg }