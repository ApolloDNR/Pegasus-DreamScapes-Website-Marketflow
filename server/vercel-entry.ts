import { createApplication } from "./application";

const { app } = await createApplication({ runtime: "serverless" });

export default app;
