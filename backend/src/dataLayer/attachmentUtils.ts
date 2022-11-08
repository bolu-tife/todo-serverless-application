import * as AWS from 'aws-sdk'
import { S3 } from 'aws-sdk'
import { createLogger } from '../utils/logger'
import * as AWSXRay from 'aws-xray-sdk'

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('File Storage Logic')

  export class AttachmentUtils {

    constructor(
      private readonly s3: S3 = new XAWS.S3( {signatureVersion: 'v4'}),
      private readonly bucketName = process.env.ATTACHMENT_S3_BUCKET,
      private readonly urlExpiration = process.env.SIGNED_URL_EXPIRATION,
    ) {}

     getUploadUrl(attachmentId: string) {
      logger.info('Creating upload  url for', attachmentId)
      const result = this.s3.getSignedUrl('putObject', {
        Bucket: this.bucketName,
        Key: attachmentId,
        Expires: this.urlExpiration
      })

      logger.info(`Upload url for attachmentId - ${attachmentId} : ${result}`)
      return result
    }

  }