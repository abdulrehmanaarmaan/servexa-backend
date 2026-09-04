// import cookieParser from "cookie-parser";
import cors from "cors";
import express, {
	type Application,
	type NextFunction,
	type Request,
	type Response,
} from "express";
import httpStatus from "http-status";
import config from "./app/config/index.js";
import cookieParser from "cookie-parser";
import { globalErrorHandler } from "./app/middleware/globalErrorHandler.js";
import { notFound } from "./app/middleware/notFound.js";
import { customerRoutes } from "./app/module/customers/customer.route.js";
import { authRoutes } from "./app/module/auth/auth.route.js";
import { paymentRoutes } from "./app/module/payments/payment.route.js";
import { invoiceRoutes } from "./app/module/invoices/invoice.route.js";
import { workOrderRoutes } from "./app/module/work-orders/work-order.route.js";
import { serviceRoutes } from "./app/module/services/service.route.js";
import { serviceRequestRoutes } from "./app/module/service-requests/service-request.route.js";
import { addressRoutes } from "./app/module/addresses/address.route.js";

// import { getBkashIdToken } from "./app/lib/bkash";
// import { globalErrorHandler } from "./app/middleware/globalErrorHandler";
// import { notFound } from "./app/middleware/notFound";
// import { AnalyticsRoutes } from "./app/module/analytics/analytics.route";
// import { AppointementRoutes } from "./app/module/appointment/appointment.route";
// import { AuthRoutes } from "./app/module/auth/auth.route";
// import { DoctorRoutes } from "./app/module/doctor/doctor.route";
// import { PaymentRoutes } from "./app/module/payment/payment.route";
// import { PrescriptionRoutes } from "./app/module/prescription/prescription.route";
// import { ScheduleRoutes } from "./app/module/schedule/schedule.route";
// import { UserRoutes } from "./app/module/user/user.route";

const app: Application = express();

app.use(
	cors({
		origin: config.client_url,
		credentials: true,
	}),
);

// Enable URL-encoded form data parsing
app.use(express.urlencoded({ extended: true }));

// Middleware to parse JSON bodies
app.use(express.json());
app.use(cookieParser());

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/customers", customerRoutes);
app.use("/api/v1/payments", paymentRoutes);
app.use("/api/v1/invoices", invoiceRoutes);
app.use("/api/v1/work-orders", workOrderRoutes);
app.use("/api/v1/services", serviceRoutes)
app.use("/api/v1/service-requests", serviceRequestRoutes)
app.use("/api/v1/addresses", addressRoutes)
// app.use("/api/v1/appointment", AppointementRoutes);
// app.use("/api/v1/doctor", DoctorRoutes);
// app.use("/api/v1/schedule", ScheduleRoutes);
// app.use("/api/v1/payment", PaymentRoutes);
// app.use("/api/v1/prescription", PrescriptionRoutes);
// app.use("/api/v1/analytics", AnalyticsRoutes);

// Basic route
app.get("/", async (req: Request, res: Response) => {
	res.status(httpStatus.OK).json({
		success: true,
		message: "Welcome to Servexa backend",
	});
});

app.use(globalErrorHandler);
app.use(notFound);

export default app;
