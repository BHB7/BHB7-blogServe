const COS = require('cos-nodejs-sdk-v5');

// 初始化COS实例
const cos = new COS({
    SecretId: process.env.SecretId,
    SecretKey: process.env.SecretKey,
});

// 定义存储桶和区域
const BUCKET = process.env.Bucket; // 存储桶名称
const REGION = process.env.Region; // 区域

/**
 * 上传JSON文件到COS
 * @param {string} key - 文件名
 * @param {object} data - 需要存储的数据
 */
const uploadJsonToCOS = async (key, data) => {
    const jsonString = JSON.stringify(data);
    return new Promise((resolve, reject) => {
        cos.putObject({
            Bucket: BUCKET,
            Region: REGION,
            Key: key,
            Body: jsonString,
            ContentType: 'application/json',
        }, (err) => {
            if (err) {
                reject(err);
            } else {
                console.log(`Uploaded ${key} to COS`);
                resolve();
            }
        });
    });
};

/**
 * 从COS读取JSON文件
 * @param {string} key - 文件名
 * @returns {Promise<object>} - 返回读取到的数据
 */
const getJsonFromCOS = async (key) => {
    return new Promise((resolve, reject) => {
        cos.getObject({
            Bucket: BUCKET,
            Region: REGION,
            Key: key,
        }, (err, data) => {
            if (err) {
                reject(err);
            } else {
                const jsonData = JSON.parse(data.Body.toString());
                resolve(jsonData);
            }
        });
    });
};

/**
 * 上传一篇文章
 */
const uploadArticle = async (article) => {
    const key = `articles/${article.title}.json`; // 文件名
    try {
        await uploadJsonToCOS(key, article);
    } catch (error) {
        console.error(`Failed to upload article: ${error.message}`);
    }
};

/**
 * 获取文章
 */
const fetchArticle = async (title) => {
    const key = `articles/${title}.json`; // 文件名
    try {
        const article = await getJsonFromCOS(key);
        return article;
    } catch (error) {
        console.error(`Failed to fetch article: ${error.message}`);
    }
};

// 使用示例
const sampleArticle = {
    title: '学习Vue',
    content: '或许路很漫长，或许路很艰难，但我依然坚持到底，加油',
    author: 'username',
    imgUrl: 'http://example.com/image.jpg',
    tags: ['Vue'], // 修正为数组
};

// 导出 uploadArticle 和 fetchArticle
module.exports = {
    uploadJsonToCOS,
    uploadArticle,
    getJsonFromCOS,
    fetchArticle,
    cos,
};
