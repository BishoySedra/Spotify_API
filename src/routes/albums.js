import { Router } from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const router = Router();

// router to get my albums from the spotify API
router.get("/", async (req, res) => {
    try {
        const token = process.env.ACCESS_TOKEN;
        const spotifyBaseUrl = process.env.SPOTIFY_BASE_URL;
        console.log("token:", token);
        console.log("spotifyBaseUrl:", spotifyBaseUrl);

        const response = await axios.get(`${spotifyBaseUrl}/me/albums/`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        res.json(response.data);
    } catch (error) {
        if (error.response) {
            console.error("Error Response:", error.response.data);
            res.status(error.response.status).json(error.response.data);
        } else {
            console.error("Error:", error.message);
            res.status(500).json({ message: "Server Error fetching albums!" });
        }

    }
});

export default router;