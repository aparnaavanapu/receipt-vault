import os
import json
import hashlib
from io import BytesIO
from datetime import datetime, timezone
from urllib.parse import unquote_plus

import boto3
from PIL import Image

# ==========================
# AWS Clients
# ==========================

s3 = boto3.client("s3")
dynamodb = boto3.resource("dynamodb")

# ==========================
# Environment Variables
# ==========================

BUCKET_NAME = os.environ["BUCKET_NAME"]
TABLE_NAME = os.environ["TABLE_NAME"]

table = dynamodb.Table(TABLE_NAME)

THUMBNAIL_SIZE = (300, 300)


# ==========================
# Helper Functions
# ==========================

def calculate_checksum(image_bytes):
    """
    Calculate SHA256 checksum of the original image.
    """
    sha = hashlib.sha256()
    sha.update(image_bytes)
    return sha.hexdigest()


def create_thumbnail(image_bytes):
    """
    Generate thumbnail from original image.
    Returns:
        thumbnail_bytes,
        width,
        height
    """

    image = Image.open(BytesIO(image_bytes))

    original_width = image.width
    original_height = image.height

    image.thumbnail(THUMBNAIL_SIZE)

    output = BytesIO()

    image_format = image.format

    if image_format is None:
        image_format = "JPEG"

    image.save(output, format=image_format)

    output.seek(0)

    return (
        output.read(),
        original_width,
        original_height,
        image_format
    )


def upload_thumbnail(bucket, key, image_bytes, image_format):
    """
    Upload thumbnail into S3.
    """

    content_type = f"image/{image_format.lower()}"

    s3.put_object(
        Bucket=bucket,
        Key=key,
        Body=image_bytes,
        ContentType=content_type,
    )


def update_status(
    user_id,
    receipt_id,
    status,
    metadata=None
):
    """
    Write/Update DynamoDB.
    """

    item = {
        "userId": user_id,
        "receiptId": receipt_id,
        "status": status,
        "updatedAt": datetime.now(
            timezone.utc
        ).isoformat()
    }

    if metadata:
        item.update(metadata)

    table.put_item(Item=item)


# ==========================
# Lambda Handler
# ==========================

def lambda_handler(event, context):

    for record in event["Records"]:

        receipt_id = None
        user_id = None

        try:

            # ---------------------------------------
            # Read SQS Message
            # ---------------------------------------

            body = json.loads(record["body"])

            s3_record = body["Records"][0]

            bucket = s3_record["s3"]["bucket"]["name"]

            object_key = unquote_plus(s3_record["s3"]["object"]["key"])

            # Example:
            # user123/receipts/1784372325-uuid-bill.jpg

            key_parts = object_key.split("/")

            user_id = key_parts[0]

            receipt_id = key_parts[-1]

            thumbnail_key = object_key.replace(
                "/receipts/",
                "/thumbnails/"
            )

            print(f"Processing Receipt : {receipt_id}")

            # ---------------------------------------
            # Initial Status
            # ---------------------------------------

            update_status(
                user_id=user_id,
                receipt_id=receipt_id,
                status="PROCESSING"
            )

            # ---------------------------------------
            # Download Original Image
            # ---------------------------------------

            response = s3.get_object(
                Bucket=bucket,
                Key=object_key
            )

            image_bytes = response["Body"].read()

            file_size = len(image_bytes)

            # ---------------------------------------
            # Calculate Checksum
            # ---------------------------------------

            checksum = calculate_checksum(image_bytes)

            # ---------------------------------------
            # Generate Thumbnail
            # ---------------------------------------

            (
                thumbnail_bytes,
                width,
                height,
                image_format
            ) = create_thumbnail(image_bytes)

            # ---------------------------------------
            # Upload Thumbnail
            # ---------------------------------------

            upload_thumbnail(
                bucket=bucket,
                key=thumbnail_key,
                image_bytes=thumbnail_bytes,
                image_format=image_format
            )

            # ---------------------------------------
            # Save Metadata
            # ---------------------------------------

            metadata = {

                "originalKey": object_key,

                "thumbnailKey": thumbnail_key,

                "bucket": bucket,

                "fileSize": file_size,

                "width": width,

                "height": height,

                "checksum": checksum,

                "createdAt":
                    datetime.now(
                        timezone.utc
                    ).isoformat()
            }

            update_status(

                user_id=user_id,

                receipt_id=receipt_id,

                status="COMPLETED",

                metadata=metadata

            )

            print(f"Completed : {receipt_id}")

        except Exception as error:

            print(error)

            if user_id and receipt_id:

                update_status(

                    user_id=user_id,

                    receipt_id=receipt_id,

                    status="FAILED"

                )

            raise error