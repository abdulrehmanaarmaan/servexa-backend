import type { Request, Response } from "express";

import { serviceService } from "./service.service.js";
import { sendResponse } from "../../utils/sendResponse.js";

const createService = async (
  req: Request,
  res: Response,
) => {
  const result = await serviceService.createService(
    req.body,
  );

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Service created successfully.",
    data: result,
  });
};

const getAllServices = async (
  req: Request,
  res: Response,
) => {
  const result = await serviceService.getAllServices(
    req.query as any,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Services retrieved successfully.",
    data: result,
  });
};

const getServiceById = async (
  req: Request,
  res: Response,
) => {
  const { serviceId } = req.params;

  const result = await serviceService.getServiceById(
    serviceId as string,
  );

  sendResponse(res, {
    statusCode: 200,
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

  const result = await serviceService.updateService(
    serviceId as string,
    req.body,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Service updated successfully",
    data: result,
  });
};

const deleteService = async (
  req: Request,
  res: Response,
) => {
  const { serviceId } = req.params;

  const result = await serviceService.deleteService(
    serviceId as string,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Service deleted successfully",
    data: result,
  });
};

export const serviceController = {
  createService,
  getAllServices,
  getServiceById,
  updateService,
  deleteService,
};