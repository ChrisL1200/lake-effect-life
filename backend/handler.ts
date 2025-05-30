import serverless from "@codegenie/serverless-express";
import app from "./app";

export const handler = serverless({ app });
