import { Router } from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const router = Router();

// router to get my info from the spotify API
router.get("/", async (req, res) => {
    try {
        const response = await axios.get(`${process.env.SPOTIFY_BASE_URL}/me/`, {
            headers: {
                Authorization: `Bearer ${process.env.ACCESS_TOKEN}`,
            },
        });

        res.json(response.data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
});

export default router;