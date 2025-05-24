/**
 * Swagger/OpenAPI Configuration
 * Sets up the specifications for API documentation
 */

import swaggerJSDoc from "swagger-jsdoc";
import fs from "fs";
import path from "path";

// Swagger definition
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "E-Commerce API Documentation",
      version: "1.0.0",
      description: "API documentation for the E-Commerce platform",
      license: {
        name: "ISC",
        url: "https://opensource.org/licenses/ISC",
      },
      contact: {
        name: "API Support",
        url: "https://github.com/vinoddotcom/ecom-learn-backend",
      },
    },
    servers: [
      {
        url: "/api/v1",
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: "token",
          description: "JWT token stored in browser cookies. Login first to get this token.",
        },
        // Note: bearerAuth is kept for reference but not used in the API
        // Remove if no longer needed
      },
    },
  },
  apis: ["./routes/*.ts", "./controllers/*.ts", "./models/*.ts"],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

// Function to save Swagger JSON to file for type generation
export function saveSwaggerJson(): void {
  const outputPath = path.resolve(process.cwd(), "swagger.json");
  fs.writeFileSync(outputPath, JSON.stringify(swaggerSpec, null, 2), { encoding: "utf8" });
  console.log(`✅ Swagger JSON saved to ${outputPath}`);
}

export default swaggerSpec;
