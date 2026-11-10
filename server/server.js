// Startpunkt: läser .env och startar API:et.
import "dotenv/config";
import app from "./app.js";

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Servern körs på http://localhost:${PORT}`);
});
