import { Router, type IRouter } from "express";
import healthRouter from "./health";
import contactRouter from "./contact";
import portalAuthRouter from "./portal/auth";
import portalProjectsRouter from "./portal/projects";
import portalResourcesRouter from "./portal/resources";
import adminClientsRouter from "./admin/clients";
import adminProjectsRouter from "./admin/projects";
import adminResourcesRouter from "./admin/resources";
import adminStorageRouter from "./admin/storage";
import adminUsersRouter from "./admin/users";
import staffAuthRouter from "./staff/auth";
import staffUsersRouter from "./staff/users";
import staffProjectsRouter from "./staff/projects";
import staffClientsRouter from "./staff/clients";
import staffResourcesRouter from "./staff/resources";
import staffStorageRouter from "./staff/storage";

const router: IRouter = Router();

router.use(healthRouter);
router.use(contactRouter);
router.use(portalAuthRouter);
router.use(portalProjectsRouter);
router.use(portalResourcesRouter);
router.use(adminClientsRouter);
router.use(adminProjectsRouter);
router.use(adminResourcesRouter);
router.use(adminStorageRouter);
router.use(adminUsersRouter);
router.use(staffAuthRouter);
router.use(staffUsersRouter);
router.use(staffProjectsRouter);
router.use(staffClientsRouter);
router.use(staffResourcesRouter);
router.use(staffStorageRouter);

export default router;
