import cors from "cors";

const corsOptions = {
  origin: process.env.CLIENT_URL,
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "X-CSRF-Token"]
};

const corsMiddleware = cors(corsOptions);

export default corsMiddleware;