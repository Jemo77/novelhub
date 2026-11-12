import { Router } from "express";
import { verificarToken } from "../middlewares/verificarToken";
import { esAutor } from "../middlewares/esAutor";
import { AutorController } from "../controllers/autor.controller";
import { uploadImagen, uploadObra } from "../middlewares/limiteSubida";

const router = Router();
const controller = new AutorController();

router.use(verificarToken, esAutor);

router.get("/dashboard", controller.getDashboard);

// Perfil: enlaces de redes/donaciones y ads
router.get("/perfil/enlaces", controller.getEnlaces);
router.put("/perfil/enlaces", controller.actualizarEnlaces);

// Ruta para crear nueva obra, usa "upload" si necesitas enviar imagenes
router.post(
  "/obra",
  uploadObra.fields([
    { name: "portada", maxCount: 1 },
    { name: "archivo", maxCount: 1 },
  ]),
  controller.crearObra
);

// Rutas para capítulos
router.post("/obras/:obraId/capitulos/novela", uploadObra.none(), controller.crearCapituloNovela);
router.post("/obras/:obraId/capitulos/comic", uploadImagen.array("imagenes", 50), controller.crearCapituloComic); // 50 imágenes máximo por capítulo

// Ejemplo: subir portada suelta
router.post("/subir-portada", uploadImagen.single("imagen"), (req, res) => {
  res.json({ mensaje: "Portada subida (placeholder)" });
});


// Rutas de edicion
router.get("/obras/:obraId/editar", controller.obtenerObraParaEditar);
router.patch("/obras/:obraId", uploadImagen.single("portada"), controller.editarObra);
router.patch("/obras/:obraId/capitulos/:capituloId", controller.editarCapitulo);
router.delete("/obras/:obraId/capitulos/:capituloId", controller.eliminarCapitulo);

export default router;

