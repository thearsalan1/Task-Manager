import  express  from "express";
import { login, logout, me, register } from "../controller/auth.controller";
import { auth } from "../middleware/auth";

const router = express.Router();


// @POST Register user
router.post("/register",register);

// @Post Login user
router.post("/login",login);

// @Post logout user
router.post("/logout",logout);

// @Get to get user
router.get("/me",auth,me);

export default router