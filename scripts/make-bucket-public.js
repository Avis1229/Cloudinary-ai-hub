const { S3Client, PutBucketPolicyCommand } = require('@aws-sdk/client-s3');

// Configure S3 Client for MinIO
const s3Client = new S3Client({
  region: 'us-east-1',
  endpoint: 'http://195.35.22.92:9010', // Port 9010 is what we mapped in docker-compose
  credentials: {
    accessKeyId: 'admin',
    secretAccessKey: 'securepassword123',
  },
  forcePathStyle: true,
});

const BUCKET_NAME = 'aethravia';

// The policy that allows anyone to read (download) files from this bucket
const readOnlyAnonymousPolicy = {
  Version: "2012-10-17",
  Statement: [
    {
      Sid: "PublicRead",
      Effect: "Allow",
      Principal: "*",
      Action: ["s3:GetObject"],
      Resource: [`arn:aws:s3:::${BUCKET_NAME}/*`]
    }
  ]
};

async function makeBucketPublic() {
  console.log(`Setting public read policy for bucket: ${BUCKET_NAME}...`);
  try {
    const command = new PutBucketPolicyCommand({
      Bucket: BUCKET_NAME,
      Policy: JSON.stringify(readOnlyAnonymousPolicy),
    });

    await s3Client.send(command);
    console.log("✅ Success! The bucket is now completely public.");
    console.log("Images will now load perfectly on your website.");
  } catch (error) {
    console.error("❌ Failed to set bucket policy:");
    console.error(error);
  }
}

makeBucketPublic();
