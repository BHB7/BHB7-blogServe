const express = require('express');
const router = express.Router();
const pathLib = require('path');
const STS = require('qcloud-cos-sts'); // 确保导入 STS

// 配置参数
const config = {
  secretId: process.env.SecretId,
  secretKey: process.env.SecretKey,
  durationSeconds: 1800,
  bucket: process.env.Bucket,
  region: process.env.Region,
  allowActions: [
    'name/cos:PutObject',
    'name/cos:InitiateMultipartUpload',
    'name/cos:ListMultipartUploads',
    'name/cos:ListParts',
    'name/cos:UploadPart',
    'name/cos:CompleteMultipartUpload',
  ],
};

// 生成要上传的 COS 文件路径文件名
const generateCosKey = function (ext) {
  const date = new Date();
  const m = date.getMonth() + 1;
  const ymd = `${date.getFullYear()}${m < 10 ? `0${m}` : m}${date.getDate()}`;
  const r = ('000000' + Math.random() * 1000000).slice(-6);
  const cosKey = `file/${ymd}/${ymd}_${r}${ext ? `${ext}` : ''}`;
  return cosKey;
};

// 获取临时密钥
function getSts({ cosKey, condition }) {
  return new Promise((resolve, reject) => {
    const AppId = config.bucket.substr(config.bucket.lastIndexOf('-') + 1);
    let resource = 'qcs::cos:' + config.region + ':uid/' + AppId + ':' + config.bucket + '/' + cosKey;
    const policy = {
      version: '2.0',
      statement: [
        {
          action: config.allowActions,
          effect: 'allow',
          resource: [resource],
          condition,
        },
      ],
    };
    const startTime = Math.round(Date.now() / 1000);
    STS.getCredential(
      {
        secretId: config.secretId,
        secretKey: config.secretKey,
        region: config.region,
        durationSeconds: config.durationSeconds,
        policy: policy,
      },
      function (err, tempKeys) {
        if (tempKeys) tempKeys.startTime = startTime;
        if (err) {
          reject(err);
        } else {
          resolve(tempKeys);
        }
      }
    );
  });
}

router.get('/', function (req, res, next) {
  const permission = {
    limitExt: false,
    extWhiteList: ['jpg', 'jpeg', 'png', 'gif', 'bmp'],
    limitContentType: false,
    limitContentLength: false,
  };

  const filename = req.query.filename;
  if (!filename) {
    return res.send({ error: '请传入文件名' });
  }
  
  const ext = pathLib.extname(filename);
  const cosKey = generateCosKey(ext);
  const condition = {};

  // 限制上传文件后缀
  if (permission.limitExt) {
    const extInvalid = !ext || !permission.extWhiteList.includes(ext);
    if (extInvalid) {
      return res.send({ error: '非法文件，禁止上传' });
    }
  }

  // 限制上传文件 content-type
  if (permission.limitContentType) {
    Object.assign(condition, {
      'string_like': {
        'cos:content-type': 'image/*',
      },
    });
  }

  // 限制上传文件大小
  if (permission.limitContentLength) {
    Object.assign(condition, {
      'numeric_less_than_equal': {
        'cos:content-length': 5 * 1024 * 1024,
      },
    });
  }

  getSts({ cosKey, condition })
    .then((data) => {
      res.send({
        TmpSecretId: data.credentials.tmpSecretId,
        TmpSecretKey: data.credentials.tmpSecretKey,
        SessionToken: data.credentials.sessionToken,
        StartTime: Math.round(Date.now() / 1000),
        ExpiredTime: data.expiredTime,
        Bucket: config.bucket,
        Region: config.region,
        Key: cosKey,
      });
    })
    .catch((err) => {
      console.log('sts error', err);
      res.send(err);
    });
});

module.exports = router;
