import type { Request, Response } from "express";
import httpStatus from "http-status";

import { sendResponse } from "../../utils/sendResponse.js";

import type { IServiceQuery } from "./service.interface.js";
import { serviceService } from "./service.service.js";
import { AppError } from "../../utils/appError.js";

const createService = async (
  req: Request,
  res: Response,
) => {
  const result =
    await serviceService.createService(req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Service created successfully.",
    data: result,
  });
};

// 2) add this function above createService
const uploadServiceImage = async (req: Request, res: Response) => {
  if (!req.file) {
    throw new AppError(httpStatus.BAD_REQUEST, "Please select an image");
  }

  const result = await serviceService.uploadServiceImage(req.file);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Image uploaded successfully.",
    data: result,
  });
};

const getAllServices = async (
  req: Request,
  res: Response,
) => {
  const query =
    res.locals.validated.query as IServiceQuery;

  const result =
    await serviceService.getAllServices(query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Services retrieved successfully.",
    data: result
  });
};

const getServiceById = async (
  req: Request,
  res: Response,
) => {
  const { serviceId } = req.params;

  const result =
    await serviceService.getServiceById(
      serviceId as string,
    );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Service retrieved successfully.",
    data: result,
  });
};

const updateService = async (
  req: Request,
  res: Response,
) => {
  const { serviceId } = req.params;

  const result =
    await serviceService.updateService(
      serviceId as string,
      req.body,
    );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Service updated successfully.",
    data: result,
  });
};

const deleteService = async (
  req: Request,
  res: Response,
) => {
  const { serviceId } = req.params;

  const result =
    await serviceService.deleteService(
      serviceId as string,
    );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Service deleted successfully.",
    data: result,
  });
};

export const serviceController = {
  createService,
  uploadServiceImage,
  getAllServices,
  getServiceById,
  updateService,
  deleteService,
};