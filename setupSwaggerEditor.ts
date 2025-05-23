import express from "express";
import path from "path";

/**
 * Sets up the Swagger Editor in the Express application
 * Serves the Swagger Editor from the node_modules directory
 */
export default function setupSwaggerEditor(app: express.Express) {
  // Serve Swagger Editor files from node_modules
  app.use(
    "/swagger-editor",
    express.static(path.join(__dirname, "node_modules/swagger-editor-dist"))
  );

  // Redirect root to index.html
  app.get("/swagger-editor", (req, res) => {
    res.sendFile(path.join(__dirname, "node_modules/swagger-editor-dist/index.html"));
  });

  console.log("Swagger Editor is available at /swagger-editor");
}
