import type {
  Request,
  Response,
} from "express";

import type { IRequestUser } from "../auth/auth.interface.js";

import {
  serviceRequestService,
} from "./service-request.service.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { IServiceRequestQuery } from "./service-request.interface.js";

const createServiceRequest = async (
  req: Request,
  res: Response,
) => {
  const user =
    req.user as IRequestUser;

  const result =
    await serviceRequestService.createServiceRequest(
      req.body,
      user,
    );

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Service request created successfully",
    data: result,
  })
};

const getServiceRequest = async (
  req: Request,
  res: Response,
) => {
  const { serviceRequestId } =
    req.params;

  const user =
    req.user as IRequestUser;

  const result =
    await serviceRequestService.getServiceRequestById(
      serviceRequestId as string,
      user,
    );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Service request retrieved successfully",
    data: result,
  })
};

const getMyServiceRequests = async (
  req: Request,
  res: Response,
) => {
  const user =
    req.user as IRequestUser;

  const result =
    await serviceRequestService.getMyServiceRequests(
      user,
      res.locals.validated.query as IServiceRequestQuery,
    );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Service requests retrieved successfully",
    data: result.data,
    meta: result.meta
  })
};

const getAllServiceRequests = async (
  req: Request,
  res: Response,
) => {
  const result =
    await serviceRequestService.getAllServiceRequests(
          res.locals.validated.query as IServiceRequestQuery
    );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Service requests retrieved successfully",
    data: result.data,
    meta: result.meta
  })
};

const updateServiceRequest = async (
  req: Request,
  res: Response,
) => {
  const { serviceRequestId } =
    req.params;

  const user =
    req.user as IRequestUser;

  const result =
    await serviceRequestService.updateServiceRequest(
      serviceRequestId as string,
      req.body,
      user,
    );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Service request updated successfully",
    data: result,
  })
};

const updateServiceRequestStatus =
  async (
    req: Request,
    res: Response,
  ) => {
    const { serviceRequestId } =
      req.params;

    const user =
      req.user as IRequestUser;

    const result =
      await serviceRequestService.updateServiceRequestStatus(
        serviceRequestId as string,
        req.body,
        user,
      );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Service request status updated successfully",
      data: result,
    })
  };

const cancelServiceRequest = async (
  req: Request,
  res: Response,
) => {
  const { serviceRequestId } =
    req.params;

  const user =
    req.user as IRequestUser;

  const result =
    await serviceRequestService.cancelServiceRequest(
      serviceRequestId as string,
      user,
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Service request cancelled successfully",
      data: result,
    })
};

export const serviceRequestController = {
  createServiceRequest,
  getServiceRequest,
  getMyServiceRequests,
  getAllServiceRequests,
  updateServiceRequest,
  updateServiceRequestStatus,
  cancelServiceRequest,
};