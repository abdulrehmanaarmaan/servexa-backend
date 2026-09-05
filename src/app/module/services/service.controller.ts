import type { Request, Response } from "express";

import { serviceService } from "./service.service.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { IServiceQuery } from "./service.interface.js";
import httpStatus from "http-status"

const createService = async (
  req: Request,
  res: Response,
) => {
  const result = await serviceService.createService(
    req.body,
  );

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Service created successfully.",
    data: result,
  });
};

const getAllServices = async (
  req: Request,
  res: Response,
) => {

  const query =
  res.locals.validated.query as IServiceQuery;

  const result = await serviceService.getAllServices(
    query,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Services retrieved successfully.",
    data: result.data,
    meta: result.meta
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

  const result = await serviceService.updateService(
    serviceId as string,
    req.body,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
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
    statusCode: httpStatus.OK,
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