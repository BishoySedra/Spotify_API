import Express from "express";
import dotenv from "dotenv";
import cors from "cors";

// routes
import infoRouter from "./src/routes/info.js";
import albumsRouter from "./src/routes/albums.js";
import tracksRouter from "./src/routes/tracks.js";
import playlistsRouter from "./src/routes/playlists.js";

dotenv.config();

const app = Express();

app.use(cors());
app.use(Express.json());
app.use("/info", infoRouter);
app.use("/albums", albumsRouter);
app.use("/tracks", tracksRouter);
app.use("/playlists", playlistsRouter);


try {
    const port = process.env.PORT || 5000;
    app.listen(port, () => {
        console.log(`Server is running on port ${port}!`);
    });
} catch (error) {
    console.error(error);
    process.exit(1);
}