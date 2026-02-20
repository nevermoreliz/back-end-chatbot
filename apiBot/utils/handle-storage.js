const multer = require("multer");
const fs = require("fs");
const path = require("path");

// Función que genera el storage personalizado
const createStorage = (customId, customPathStorage) => {
  return multer.diskStorage({
    destination: function (req, file, cb) {
      // Usar customPathStorage si se proporciona, o fallback a un valor por defecto
      const basePath = path.join(__dirname, "../storage");
      const pathStorage = customPathStorage || path.join(basePath, "uploads");

      // Crear la carpeta si no existe
      if (!fs.existsSync(pathStorage)) {
        fs.mkdirSync(pathStorage, { recursive: true });
      }

      cb(null, pathStorage);
    },
    filename: function (req, file, cb) {
      // Usar customId si se proporciona, o intentar obtenerlo de req.user o req.body
      const id = customId || req.user?.id || req.body?.id || "unknown";
      const ext = file.originalname.split(".").pop();
      const filename = `file-${id}-${Date.now()}.${ext}`;

      cb(null, filename);
    },
  });
};

/**
 * type = "jpeg|jpg|png|pdf|doc|docx"
 */
// Middleware factory para Multer
const uploadMiddleware = (
  id = null,
  pathStorage = null,
  type = "jpeg|jpg|png"
) => {
  const storage = createStorage(id, pathStorage);
  return multer({
    storage,
    fileFilter: (req, file, cb) => {

      try {
        // const filetypes = `/jpeg|jpg|png/`;
        const filetypes = new RegExp(type, "i");
        const extname = filetypes.test(
          path.extname(file.originalname).toLowerCase()
        );
        const mimetype = filetypes.test(file.mimetype);
        if (extname && mimetype) {
          cb(null, true);
        } else {
          // cb(new Error("Solo se permiten : " + type));
          // Rechazar el archivo con un mensaje claro
          cb(null, false);
          req.fileValidationError = `Solo se permiten archivos de tipo: ${type}`;
        }
      } catch (error) {
        console.error("Error al validar archivo:", error);
        cb(null, false);
        req.fileValidationError = "Error al validar el archivo";
      }

    },
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  });
};

// Función para eliminar archivo anterior al actualizar
const deleteFile = (filePath) => {
  if (filePath && fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    return true;
  }
  return false;
};

module.exports = { uploadMiddleware, deleteFile };
