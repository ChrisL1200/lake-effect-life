import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import dotenv from "dotenv";
import { LakeEffectLifeStack } from "../lib/lake-effect-life-stack";

dotenv.config();

const app = new cdk.App();

const enableCloudFront = app.node.tryGetContext("enableCloudFront") !== "false";
const createRds = app.node.tryGetContext("createRds") === "true";
const rdsAllowedCidr = app.node.tryGetContext("rdsAllowedCidr") || "0.0.0.0/0";

new LakeEffectLifeStack(app, "LakeEffectLifeStack", {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || process.env.AWS_REGION || "us-east-1",
  },
  appName: app.node.tryGetContext("appName") || "lake-effect-life",
  enableCloudFront,
  createRds,
  rdsAllowedCidr,
});
