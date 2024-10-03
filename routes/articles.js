// routes/article.js
const express = require('express');
const { uploadJsonToCOS, getJsonFromCOS, cos } = require('../models/index'); // 引入上传和获取函数
const router = express.Router();

/**
 * 创建文章
 */
router.post('/', async (req, res) => {
    const { title, content, author, imgUrl, tags } = req.body;
    const key = `articles/${title}.json`; // 使用标题作为文件名

    // 检查文章是否已存在
    try {
        await getJsonFromCOS(key); // 尝试获取文章
        return res.status(400).json({
            code: 0,
            msg: '文章已存在',
        });
    } catch (error) {
        // 文章不存在，继续创建
    }

    const article = {
        title,
        content,
        author,
        imgUrl,
        tags,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    try {
        await uploadArticle(key, article);
        res.status(201).json({
            code: 1,
            msg: '文章创建成功',
            data: article,
        });
    } catch (err) {
        res.status(500).json({
            code: 0,
            msg: '文章创建失败',
            error: err.message,
        });
    }
});

/**
 * 获取所有文章
 */
router.get('/', async (req, res) => {
    try {
        // 获取所有文章的文件列表
        const { Contents } = await new Promise((resolve, reject) => {
            cos.listObjects({
                Bucket: process.env.Bucket,
                Region: process.env.Region,
            }, (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        });

        const articles = [];

        // 获取每篇文章的内容
        for (const item of Contents) {
            const articleData = await getJsonFromCOS(item.Key);
            articles.push(articleData);
        }

        res.json({
            code: 1,
            msg: '获取文章成功',
            data: articles,
        });
    } catch (err) {
        res.status(500).json({
            code: 0,
            msg: '获取文章失败',
            error: err.message,
        });
    }
});


/**
 * 根据标题获取单篇文章
 */
router.get('/:title', async (req, res) => {
    const { title } = req.params;
    const key = `articles/${title}.json`;

    try {
        const article = await getJsonFromCOS(key);
        res.json({
            code: 1,
            msg: '获取文章成功',
            data: article,
        });
    } catch (err) {
        res.status(404).json({
            code: 0,
            msg: '文章未找到',
        });
    }
});

/**
 * 更新文章
 */
router.put('/:title', async (req, res) => {
    const { title } = req.params;
    const key = `articles/${title}.json`;

    try {
        const article = await getJsonFromCOS(key);
        const updates = req.body;

        // 合并更新内容
        const updatedArticle = { ...article, ...updates, updatedAt: new Date() };
        await uploadJsonToCOS(key, updatedArticle);

        res.json({
            code: 1,
            msg: '文章更新成功',
            data: updatedArticle,
        });
    } catch (err) {
        res.status(404).json({
            code: 0,
            msg: '文章未找到',
        });
    }
});

/**
 * 删除文章
 */
router.delete('/:title', async (req, res) => {
    const { title } = req.params;
    const key = `articles/${title}.json`;

    try {
        await cos.deleteObject({
            Bucket: process.env.Bucket,
            Region: process.env.Region,
            Key: key,
        });

        res.json({
            code: 1,
            msg: '文章删除成功',
        });
    } catch (err) {
        res.status(404).json({
            code: 0,
            msg: '文章未找到',
        });
    }
});

module.exports = router;
