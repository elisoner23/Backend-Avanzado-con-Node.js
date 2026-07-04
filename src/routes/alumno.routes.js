import { Router } from 'express';
import { apiKey } from '../middlewares/apiKey.js';
import * as AlumnoController from '../controllers/alumno.controller.js';

const router = Router();

// getAll - Devuelve todos los alumnos, con opción de filtrar por grado
router.get('/', AlumnoController.getAll);

// getById - Devuelve un alumno por su ID
router.get('/:id', AlumnoController.getById);

// create - Agrega un nuevo alumno a la base de datos
router.post('/', apiKey, AlumnoController.create);

// update - Actualiza un alumno existente
router.patch('/:id', apiKey, AlumnoController.update);

// remove - Elimina un alumno por su ID
router.delete('/:id', apiKey, AlumnoController.remove);

export default router;
