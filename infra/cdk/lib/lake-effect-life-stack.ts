import * as path from "path";
import { CfnOutput, Duration, RemovalPolicy, Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as apigwv2 from "aws-cdk-lib/aws-apigatewayv2";
import * as integrations from "aws-cdk-lib/aws-apigatewayv2-integrations";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as origins from "aws-cdk-lib/aws-cloudfront-origins";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as lambdaNode from "aws-cdk-lib/aws-lambda-nodejs";
import * as rds from "aws-cdk-lib/aws-rds";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as s3deploy from "aws-cdk-lib/aws-s3-deployment";
import * as secretsmanager from "aws-cdk-lib/aws-secretsmanager";

interface LakeEffectLifeStackProps extends StackProps {
  appName: string;
  enableCloudFront: boolean;
  createRds: boolean;
  rdsAllowedCidr: string;
}

export class LakeEffectLifeStack extends Stack {
  constructor(scope: Construct, id: string, props: LakeEffectLifeStackProps) {
    super(scope, id, props);

    const staticBucket = props.enableCloudFront
      ? new s3.Bucket(this, "FrontendBucket", {
          enforceSSL: true,
          blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
          autoDeleteObjects: true,
          removalPolicy: RemovalPolicy.DESTROY,
        })
      : new s3.Bucket(this, "FrontendBucket", {
          websiteIndexDocument: "index.html",
          websiteErrorDocument: "index.html",
          publicReadAccess: true,
          blockPublicAccess: s3.BlockPublicAccess.BLOCK_ACLS,
          autoDeleteObjects: true,
          removalPolicy: RemovalPolicy.DESTROY,
        });

    let distribution: cloudfront.Distribution | undefined;

    if (props.enableCloudFront) {
      distribution = new cloudfront.Distribution(this, "FrontendDistribution", {
        defaultBehavior: {
          origin: origins.S3BucketOrigin.withOriginAccessControl(staticBucket),
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
        },
        defaultRootObject: "index.html",
        errorResponses: [
          {
            httpStatus: 403,
            responseHttpStatus: 200,
            responsePagePath: "/index.html",
            ttl: Duration.minutes(5),
          },
          {
            httpStatus: 404,
            responseHttpStatus: 200,
            responsePagePath: "/index.html",
            ttl: Duration.minutes(5),
          },
        ],
      });
    }

    const apiFn = new lambdaNode.NodejsFunction(this, "ApiFunction", {
      runtime: lambda.Runtime.NODEJS_20_X,
      entry: path.resolve(__dirname, "../../../apps/backend/handler.ts"),
      handler: "handler",
      timeout: Duration.seconds(30),
      memorySize: 512,
      environment: {
        AWS_REGION: this.region,
        DB_HOST: process.env.DB_HOST || "",
        DB_PORT: process.env.DB_PORT || "5432",
        DB_USER: process.env.DB_USER || "",
        DB_PASSWORD: process.env.DB_PASSWORD || "",
        DB_NAME: process.env.DB_NAME || "",
        COGNITO_USER_POOL_ID: process.env.COGNITO_USER_POOL_ID || "",
        COGNITO_CLIENT_ID: process.env.COGNITO_CLIENT_ID || "",
        S3_BUCKET: process.env.S3_BUCKET || "",
      },
      bundling: {
        externalModules: ["aws-sdk"],
      },
    });

    const httpApi = new apigwv2.HttpApi(this, "ApiGateway", {
      apiName: `${props.appName}-api`,
    });

    httpApi.addRoutes({
      path: "/{proxy+}",
      methods: [apigwv2.HttpMethod.ANY],
      integration: new integrations.HttpLambdaIntegration("ApiIntegration", apiFn),
    });

    httpApi.addRoutes({
      path: "/",
      methods: [apigwv2.HttpMethod.ANY],
      integration: new integrations.HttpLambdaIntegration("RootApiIntegration", apiFn),
    });

    new s3deploy.BucketDeployment(this, "FrontendDeployment", {
      destinationBucket: staticBucket,
      sources: [s3deploy.Source.asset(path.resolve(__dirname, "../../../apps/frontend/dist"))],
      distribution,
      distributionPaths: ["/*"],
    });

    let rdsSecret: secretsmanager.Secret | undefined;
    let rdsInstance: rds.DatabaseInstance | undefined;

    if (props.createRds) {
      const vpc = new ec2.Vpc(this, "AppVpc", {
        maxAzs: 2,
        natGateways: 0,
        subnetConfiguration: [
          {
            name: "public",
            subnetType: ec2.SubnetType.PUBLIC,
          },
        ],
      });

      const dbSg = new ec2.SecurityGroup(this, "DatabaseSecurityGroup", {
        vpc,
        allowAllOutbound: true,
        description: "Security group for Lake Effect Life RDS",
      });

      dbSg.addIngressRule(
        ec2.Peer.ipv4(props.rdsAllowedCidr),
        ec2.Port.tcp(5432),
        "Postgres access",
      );

      rdsSecret = new secretsmanager.Secret(this, "DbCredentials", {
        generateSecretString: {
          secretStringTemplate: JSON.stringify({ username: "lel_admin" }),
          generateStringKey: "password",
          excludePunctuation: true,
        },
      });

      rdsInstance = new rds.DatabaseInstance(this, "PostgresDb", {
        engine: rds.DatabaseInstanceEngine.postgres({
          version: rds.PostgresEngineVersion.VER_16_4,
        }),
        instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.MICRO),
        allocatedStorage: 20,
        maxAllocatedStorage: 50,
        credentials: rds.Credentials.fromSecret(rdsSecret),
        databaseName: "lel_db",
        vpc,
        securityGroups: [dbSg],
        publiclyAccessible: true,
        vpcSubnets: { subnetType: ec2.SubnetType.PUBLIC },
        deletionProtection: false,
        removalPolicy: RemovalPolicy.DESTROY,
        backupRetention: Duration.days(1),
      });
    }

    new CfnOutput(this, "ApiUrl", {
      value: httpApi.url || "",
    });

    new CfnOutput(this, "StaticBucketName", {
      value: staticBucket.bucketName,
    });

    if (distribution) {
      new CfnOutput(this, "CloudFrontUrl", {
        value: `https://${distribution.distributionDomainName}`,
      });
    } else {
      new CfnOutput(this, "S3WebsiteUrl", {
        value: staticBucket.bucketWebsiteUrl,
      });
    }

    if (rdsInstance) {
      new CfnOutput(this, "RdsEndpoint", {
        value: rdsInstance.instanceEndpoint.hostname,
      });
    }

    if (rdsSecret) {
      new CfnOutput(this, "RdsSecretArn", {
        value: rdsSecret.secretArn,
      });
    }
  }
}
