import { Router } from "express";
import { ContenidoController } from "../controllers/contenido.controller";
import { verificarToken } from "../middlewares/verificarToken";

const router = Router();
const controller = new ContenidoController();

router.get("/home", controller.obtenerHome);
router.get("/novelas", controller.obtenerNovelas);
router.get("/novelas/:id", controller.obtenerNovela);
router.get("/comics", controller.obtenerComics); // Agregar en el controlador
router.get("/comics/:id", controller.obtenerComic);

router.get("/capitulos-novela/:id", controller.obtenerCapituloNovela);
router.get("/capitulos-comic/:id", controller.obtenerCapituloComic);
router.get("/capitulos-novela/:id/acceso", controller.verificarAccesoCapituloNovela);
router.get("/capitulos-comic/:id/acceso", controller.verificarAccesoCapituloComic);
router.post("/capitulos-novela/:id/comprar", verificarToken, controller.registrarCompraCapituloNovela);
router.post("/capitulos-comic/:id/comprar", verificarToken, controller.registrarCompraCapituloComic);

router.get("/autores/:nombre", controller.obtenerPerfilAutorPublico);

router.get("/libros/:id", controller.obtenerLibro);
router.get("/libros", controller.obtenerLibros);
router.get("/libros/:id/acceso", controller.verificarAccesoLibro);
router.post("/libros/:id/comprar", verificarToken, controller.registrarCompraLibro);

router.post("/novelas/:id/like", controller.darLikeNovela);
router.post("/comics/:id/like", controller.darLikeComic);
router.delete("/novelas/:id/like", controller.quitarLikeNovela);
router.delete("/comics/:id/like", controller.quitarLikeComic);

export default router;