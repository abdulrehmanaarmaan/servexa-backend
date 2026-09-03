import type { Request, Response } from "express";

import type { IRequestUser } from "../auth/auth.interface.js";

import { workOrderService } from "./work-order.service.js";
import { sendResponse } from "../../utils/sendResponse.js";

const createWorkOrder = async (
  req: Request,
  res: Response,
) => {
  const { serviceRequestId } =
    req.params;

  const user =
    req.user as IRequestUser;

  const result = await workOrderService.createWorkOrder(
    serviceRequestId as string,
    req.body,
    user,
  );

    sendResponse(res, {
    statusCode: 201,
    success: true,
    message:
      "Work order created successfully",
    data: result,
  })
};

const getWorkOrder = async (
  req: Request,
  res: Response,
) => {
  const { workOrderId } =
    req.params;

  const user =
    req.user as IRequestUser;

  const result =
    await workOrderService.getWorkOrderById(
      workOrderId as string,
      user,
    );

      sendResponse(res, {
    statusCode: 200,
    success: true,
    message:
      "Work order retrieved successfully",
    data: result,
  })
};

const getMyWorkOrders = async (
  req: Request,
  res: Response,
) => {
  const user =
    req.user as IRequestUser;

  const result =
    await workOrderService.getMyWorkOrders(
      user,
      req.query as any,
    );

      sendResponse(res, {
    statusCode: 200,
    success: true,
    message:
      "Work orders retrieved successfully",
    data: result,
  })
};

const getMyTechnicianWorkOrders =
  async (
    req: Request,
    res: Response,
  ) => {
    const user =
      req.user as IRequestUser;

    const result =
      await workOrderService.getMyTechnicianWorkOrders(
        user,
        req.query as any,
      );

        sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Assigned work orders retrieved successfully",
    data: result.data,
    meta: result.meta
  })
  };

const getAllWorkOrders = async (
  req: Request,
  res: Response,
) => {
  const result =
    await workOrderService.getAllWorkOrders(
      req.query as any,
    );

      sendResponse(res, {
    statusCode: 200,
    success: true,
    message:
      "Work order retrieved successfully",
    data: result.data,
    meta: result.meta
  })
};

const updateWorkOrder = async (
  req: Request,
  res: Response,
) => {
  const { workOrderId } =
    req.params;

  const user =
    req.user as IRequestUser;

  const result =
    await workOrderService.updateWorkOrder(
      workOrderId as string,
      req.body,
      user,
    );

      sendResponse(res, {
    statusCode: 200,
    success: true,
    message:
      "Work order updated successfully",
    data: result,
  })
};

const updateWorkOrderStatus =
  async (
    req: Request,
    res: Response,
  ) => {
    const { workOrderId } =
      req.params;

    const user =
      req.user as IRequestUser;

    const result =
      await workOrderService.updateWorkOrderStatus(
        workOrderId as string,
        req.body,
        user,
      );

      sendResponse(res, {
    statusCode: 200,
    success: true,
    message:
      "Work order status updated successfully",
    data: result,
  })
  };

const scheduleWorkOrder = async (
  req: Request,
  res: Response,
) => {
  const { workOrderId } =
    req.params;

  const user =
    req.user as IRequestUser;

  const result =
    await workOrderService.scheduleWorkOrder(
      workOrderId as string,
      req.body,
      user,
    );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message:
      "Work order scheduled successfully",
    data: result,
  })
};

export const workOrderController = {
  createWorkOrder,
  getWorkOrder,
  getMyWorkOrders,
  getMyTechnicianWorkOrders,
  getAllWorkOrders,
  updateWorkOrder,
  updateWorkOrderStatus,
  scheduleWorkOrder,
};