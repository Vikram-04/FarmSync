import axios from "axios";
import FormData from "form-data";
import fs from "fs";

const serviceUrl = process.env.NODE_ENV === "development" ? "http://127.0.0.1:8001" : process.env.DISEASE_SERVICE_URL;

export class DiseasePredictionError extends Error {
  constructor(message, statusCode = 503) {
    super(message);
    this.statusCode = statusCode;
  }
}

export async function predictDisease({ crop, imagePath }) {
  const form = new FormData();
  form.append("crop", crop);
  form.append("image", fs.createReadStream(imagePath));

  try {
    const { data } = await axios.post(`${serviceUrl}/predict`, form, {
      headers: form.getHeaders(),
      maxBodyLength: 5 * 1024 * 1024,
      timeout: 60000,
    });
    if (
      typeof data?.disease !== "string" ||
      !Number.isFinite(data?.confidence)
    ) {
      throw new DiseasePredictionError(
        "Disease service returned an invalid prediction",
      );
    }
    return data;
  } catch (error) {
    if (error instanceof DiseasePredictionError) throw error;
    const statusCode = error.response?.status === 400 ? 400 : 503;
    const message =
      error.response?.data?.detail ||
      error.message ||
      "Disease service request failed";
    throw new DiseasePredictionError(
      `Disease prediction unavailable: ${message}`,
      statusCode,
    );
  }
}

export default { predictDisease };
