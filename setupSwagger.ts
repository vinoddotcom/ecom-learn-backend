import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./utils/swagger";

export default function setupSwagger(app: import("express").Express) {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}
