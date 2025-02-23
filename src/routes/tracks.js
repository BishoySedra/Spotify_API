import { Router } from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const router = Router();

// endpoint to get my tracks
router.get("/me", async (req, res) => {
    try {
        const token = process.env.ACCESS_TOKEN;
        const spotifyBaseUrl = process.env.SPOTIFY_BASE_URL;

        const response = await axios.get(`${spotifyBaseUrl}/me/tracks/`, {
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
            res.status(500).json({ message: "Server Error fetching tracks!" });
        }

    }
});

// endpoint to get my top tracks
router.get("/top", async (req, res) => {
    try {
        const token = process.env.ACCESS_TOKEN;
        const spotifyBaseUrl = process.env.SPOTIFY_BASE_URL;

        const response = await axios.get(`${spotifyBaseUrl}/me/top/tracks/`, {
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
            res.status(500).json({ message: "Server Error fetching tracks!" });
        }
    }
});

export default router;
