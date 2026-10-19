import httpStatus from "http-status";
import { sendResponse } from "../../utils/sendResponse.js";
import { aiService } from "./ai.service.js";
const serviceAssistant = async (req, res) => {
    const result = await aiService.serviceAssistant(req.body.question);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "AI service assistant response generated successfully.",
        data: result,
    });
};
const helpWithServiceRequest = async (req, res) => {
    const result = await aiService.helpWithServiceRequest(req.body.description);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "AI service-request suggestions generated successfully.",
        data: result,
    });
};
export const aiController = {
    serviceAssistant,
    helpWithServiceRequest,
};
