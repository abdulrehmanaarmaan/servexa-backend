import type { NextFunction, Request, Response } from "express";
import type { z } from "zod";

import { AppError } from "../utils/appError.js";
import { catchAsync } from "../utils/catchAsync.js";

type RequestSchemas = {
  body?: z.ZodType;
  params?: z.ZodType;
  query?: z.ZodType;
};

export const validateRequest = (schemas: RequestSchemas) => {
  return catchAsync(
    (req: Request, res: Response, next: NextFunction) => {
      const validated: {
        body?: unknown;
        params?: unknown;
        query?: unknown;
      } = {};

      const requestParts = [
        ["body", req.body, schemas.body],
        ["params", req.params, schemas.params],
        ["query", req.query, schemas.query],
      ] as const;

      for (const [part, payload, schema] of requestParts) {
        if (!schema) continue;

        const result = schema.safeParse(payload);

        if (!result.success) {
          const message = result.error.issues
            .map(
              (issue) =>
                `${part}.${issue.path.join(".")}: ${issue.message}`,
            )
            .join(", ");

          throw new AppError(400, message);
        }

        validated[part] = result.data;

        if (part === "body") {
          req.body = result.data;
        } else if (part === "params") {
          Object.assign(req.params, result.data);
        }
      }

      res.locals.validated = validated;

      next();
    },
  );
};