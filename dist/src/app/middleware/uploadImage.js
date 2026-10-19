import multer from "multer";
import { AppError } from "../utils/appError.js";
const MAX_SIZE = 4 * 1024 * 1024; // 4 MB
const ALLOWED = ["image/jpeg", "image/png", "image/webp"];
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: MAX_SIZE, files: 1 },
    fileFilter: (_req, file, cb) => {
        if (!ALLOWED.includes(file.mimetype)) {
            cb(new AppError(400, "Only JPG, PNG or WebP images are allowed"));
            return;
        }
        cb(null, true);
    },
});
export const uploadSingleImage = (req, res, next) => {
    upload.single("image")(req, res, (error) => {
        if (error instanceof multer.MulterError) {
            next(new AppError(400, error.code === "LIMIT_FILE_SIZE"
                ? "Image must be 4 MB or smaller"
                : error.message));
            return;
        }
        if (error) {
            next(error);
            return;
        }
        next();
    });
};
