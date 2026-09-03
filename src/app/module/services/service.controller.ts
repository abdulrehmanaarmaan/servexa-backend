import type { Request, Response } from "express";

import { serviceService } from "./service.service.js";

const createService = async (
  req: Request,
  res: Response,
) => {
  const result = await serviceService.createService(
    req.body,
  );

  res.status(201).json({
    success: true,
    message: "Service created successfully",
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

  res.status(200).json({
    success: true,
    message: "Services retrieved successfully",
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

  res.status(200).json({
    success: true,
    message: "Service retrieved successfully",
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

  res.status(200).json({
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

  res.status(200).json({
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