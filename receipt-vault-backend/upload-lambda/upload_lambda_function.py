import json
import os
import time
import uuid
from datetime import datetime, timezone

import boto3
from botocore.config import Config

# ==========================
# Environment Variables
# ==========================

BUCKET_NAME = os.environ["BUCKET_NAME"]
TABLE_NAME = os.environ["TABLE_NAME"]
AWS_REGION = os.environ.get("AWS_REGION", "ap-south-2")

# ==========================
# AWS Clients
# ==========================

s3 = boto3.client(
    "s3",
    region_name=AWS_REGION,
    endpoint_url=f"https://s3.{AWS_REGION}.amazonaws.com",
    config=Config(
        signature_version="s3v4",
        s3={"addressing_style": "virtual"},
    ),
)

dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table(TABLE_NAME)


def lambda_handler(event, context):
    try:
        body = json.loads(event.get("body") or "{}")

        file_name = body.get("fileName")
        content_type = body.get("contentType")

        if not file_name or not content_type:
            return {
                "statusCode": 400,
                "headers": {
                    "Content-Type": "application/json",
                },
                "body": json.dumps({
                    "message": "fileName and contentType are required."
                }),
            }

        # ==========================
        # Cognito User ID
        # ==========================

        user_id = event["requestContext"]["authorizer"]["jwt"]["claims"]["sub"]

        # ==========================
        # Generate Receipt ID
        # ==========================

        receipt_id = f"{int(time.time())}-{uuid.uuid4()}-{file_name}"

        # ==========================
        # S3 Object Key
        # ==========================

        object_key = f"{user_id}/receipts/{receipt_id}"

        current_time = datetime.now(timezone.utc).isoformat()

        # ==========================
        # Create Initial DynamoDB Record
        # ==========================

        table.put_item(
            Item={
                "userId": user_id,
                "receiptId": receipt_id,
                "receiptName": file_name,
                "bucket": BUCKET_NAME,
                "originalKey": object_key,
                "status": "UPLOADING",
                "createdAt": current_time,
                "updatedAt": current_time,
            }
        )

        # ==========================
        # Generate Pre-signed URL
        # ==========================

        upload_url = s3.generate_presigned_url(
            ClientMethod="put_object",
            Params={
                "Bucket": BUCKET_NAME,
                "Key": object_key,
                "ContentType": content_type,
            },
            ExpiresIn=300,
            HttpMethod="PUT",
        )

        return {
            "statusCode": 200,
            "headers": {
                "Content-Type": "application/json",
            },
            "body": json.dumps({
                "uploadUrl": upload_url,
                "objectKey": object_key,
                "receiptId": receipt_id,
            }),
        }

    except Exception as error:
        print(f"Failed to create pre-signed URL: {error}")

        return {
            "statusCode": 500,
            "headers": {
                "Content-Type": "application/json",
            },
            "body": json.dumps({
                "message": "Unable to generate upload URL."
            }),
        }
