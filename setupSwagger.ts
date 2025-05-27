import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./utils/swagger";

export default function setupSwagger(app: import("express").Express) {
  app.use("/api/v1/apidocs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}
