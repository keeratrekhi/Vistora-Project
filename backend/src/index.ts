import express, { NextFunction, Request, Response } from "express";
import testroutes from "./routes/test.routes";
import cors, { CorsOptions } from "cors";
import cookieParser from "cookie-parser";
import portfolioroutes from "./routes/portfolio.routes";
import dotenv from "dotenv";
import eventRouter from "./routes/event.routes";
import authRouter from "./routes/auth.routes";
import { validateUserMiddleware } from "./middleware/auth";
import s3Routes from "./routes/backblaze.route"
import { uploadToB2 } from "./controllers/backblaze";
import path from "path";
import storageroutes from "./routes/storage.routes"

// async function main() {
//   try {
//     const filePath = path.resolve(__dirname, "test.jpg"); // Your test file path here
//     const eventId = 'test1';

//     await uploadToB2(filePath, eventId);
//     console.log('Upload successful');
//   } catch (error) {
//     console.error('Upload failed:', error);
//   }
// }

// main();

const app = express();

const whitelist = [
  "http://localhost:3000",
  "http://localhost:8080",
  "http://localhost:5173",
];

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // Allow all origins in development
    if (process.env.NODE_ENV !== "production") {
      return callback(null, true);
    }

    // Production whitelist
    const productionOrigins = [
      "https://your-production-domain.com",
      `https://${process.env.B2_BUCKET_NAME}.s3.${process.env.B2_REGION}.backblazeb2.com`,
    ];

    if (origin && productionOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "X-Bz-Content-Sha1",
    "X-Bz-File-Name",
    "X-Bz-Info-src_last_modified_millis",
  ],
  optionsSuccessStatus: 204,
};

dotenv.config();
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());

app.use("/api", testroutes);
app.use("/api/auth", authRouter);

app.use(validateUserMiddleware);

app.use("/api",storageroutes);
app.use("/api", testroutes);
app.use("/api/portfolio", portfolioroutes);
app.use("/api/events", eventRouter);
app.use("/s3", s3Routes);

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  const consolestatus = err.statusCode || 500;
  const message = err.message;
  res.status(consolestatus).json({
    success: false,
    message,
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
