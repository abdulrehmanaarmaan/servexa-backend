import httpStatus from "http-status";

import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/appError.js";
import { ICreateAddressPayload, IUpdateAddressPayload } from "./address.interface.js";
import { createAuditLog } from "../audit-logs/audit-log.service.js";


const createAddress = async (
  userId: string,
  payload: ICreateAddressPayload,
) => {
  const customer = await prisma.customer.findUnique({
    where: {
      userId,
    },
    select: {
      id: true,
    },
  });

  if (!customer) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Customer profile not found",
    );
  }

  const address = await prisma.address.create({
    data: {
      customerId: customer.id,
      label: payload.label,
      addressLine: payload.addressLine,
      city: payload.city,
      state: payload.state,
      postalCode: payload.postalCode,
      country: payload.country,
      latitude: payload.latitude,
      longitude: payload.longitude,
    },
  });

  await createAuditLog({
    actorId: userId,
    action: "CREATE",
    entity: "Address",
    entityId: address.id,
    newValue: address,
  });

  return address;
};

const getMyAddresses = async (userId: string) => {
  const customer = await prisma.customer.findUnique({
    where: {
      userId,
    },
    select: {
      id: true,
    },
  });

  if (!customer) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Customer profile not found",
    );
  }

  const addresses = await prisma.address.findMany({
    where: {
      customerId: customer.id,
      deletedAt: null,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return addresses;
};

const getAddressById = async (
  userId: string,
  addressId: string,
) => {
  const customer = await prisma.customer.findUnique({
    where: {
      userId,
    },
    select: {
      id: true,
    },
  });

  if (!customer) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Customer profile not found",
    );
  }

  const address = await prisma.address.findFirst({
    where: {
      id: addressId,
      customerId: customer.id,
      deletedAt: null,
    },
  });

  if (!address) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Address not found",
    );
  }

  return address;
};

const updateAddress = async (
  userId: string,
  addressId: string,
  payload: IUpdateAddressPayload,
) => {
  const customer = await prisma.customer.findUnique({
    where: {
      userId,
    },
    select: {
      id: true,
    },
  });

  if (!customer) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Customer profile not found",
    );
  }

  const existingAddress = await prisma.address.findFirst({
    where: {
      id: addressId,
      customerId: customer.id,
      deletedAt: null,
    },
  });

  if (!existingAddress) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Address not found",
    );
  }

  const updatedAddress = await prisma.address.update({
    where: {
      id: addressId,
    },
    data: payload,
  });

  await createAuditLog({
    actorId: userId,
    action: "UPDATE",
    entity: "Address",
    entityId: addressId,
    oldValue: existingAddress,
    newValue: updatedAddress,
  });

  return updatedAddress;
};

const deleteAddress = async (
  userId: string,
  addressId: string,
) => {
  const customer = await prisma.customer.findUnique({
    where: {
      userId,
    },
    select: {
      id: true,
    },
  });

  if (!customer) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Customer profile not found",
    );
  }

  const existingAddress = await prisma.address.findFirst({
    where: {
      id: addressId,
      customerId: customer.id,
      deletedAt: null,
    },
  });

  if (!existingAddress) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Address not found",
    );
  }

  const deletedAddress = await prisma.address.update({
    where: {
      id: addressId,
    },
    data: {
      deletedAt: new Date(),
    },
  });

  await createAuditLog({
    actorId: userId,
    action: "DELETE",
    entity: "Address",
    entityId: addressId,
    oldValue: existingAddress,
    newValue: deletedAddress,
  });

  return deletedAddress;
};

export const addressService = {
  createAddress,
  getMyAddresses,
  getAddressById,
  updateAddress,
  deleteAddress,
};