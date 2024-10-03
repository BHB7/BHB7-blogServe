const express = require('express')
const router = express.Router()
const { Article } = require('../models/index')
/**
 * 发布文章
 */
router.post('/', (req, res) => {
    console.log(req.body);
    // console.log(req.auth.uid);
    Article.create({
        ...req.body,
        author: req.uid
    }).then(r => {
        res.json({
            code: 1,
            msg: '发布文章成功',
            data: r
        })
    }).catch(err => {
        res.json({
            code: 0,
            msg: '发布文章失败',
            err: err
        })

    })
})

/**
 * 获取全部文章
 */
router.get('/', (req, res) => {
    const { manner } = req.query;
    let query = {};

    if (manner === 'hot') {
        // 查询views字段高低的最热文章，并进行降序排列
        query = { views: { $gt: 0 } }; // 假设views大于0表示文章是热门的
    } else if (manner === 'new') {
        // 设置最新文章的查询条件
        query = { updatedAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } };
    } else {
        return res.json({
            code: 0,
            msg: '获取文章列表失败',
            err: '参数错误'
        });
    }

    Article.find(query)
        .sort(manner === 'hot' ? { views: -1 } : { updatedAt: -1 }) // 根据views或updatedAt字段降序排列
        .then((r) => {
            res.json({
                code: 1,
                msg: '获取文章列表成功',
                data: r
            });
        })
        .catch((err) => {
            res.json({
                code: 1,
                msg: '获取文章列表失败',
                err: err
            });
        });
});

/**
 * /api/articles/users/:uid
 * 根据用户id查询文章列表
 */
router.get('/users/:uid', (req, res) => {
    const { uid } = req.params
    console.log(req.params);
    Article.find({ author: uid })
        .populate('author', { password: 0 })
        .populate('coms').then(r => {
            res.json({
                code: 1,
                msg: '获取文章列表成功',
                data: r
            })
        }).catch(err => {
            res.json({
                code: 0,
                msg: '获取文章列表失败',
                err: err
            })
        })
})

/**
 * /api/articles/users/:aid
 * 根据文章id查询文章详情
 */
const mongoose = require('mongoose');

router.get('/:aid', (req, res) => {
    const { aid } = req.params;
    console.log(aid);
    // 验证是否是有效的 ObjectId
    if (!mongoose.Types.ObjectId.isValid(aid)) {
        return res.json({
            code: 0,
            msg: '无效的文章ID',
            err: '无效的文章ID'
        });
    }

    // 使用有效的 ObjectId 查询文章详情
    Article.findByIdAndUpdate(aid,
        { $inc: { views: 1 } },
        { new: true }
    ).then(r => {
        if (!r) {
            return res.json({
                code: 0,
                msg: '找不到对应的文章'
            });
        }

        res.json({
            code: 1,
            msg: '获取文章详情成功',
            data: r
        });
    }).catch(err => {
        res.json({
            code: 0,
            msg: '获取文章详情失败',
            err: err
        });
    });
});

/**
 * /api/articles/users/:aid
 * 根据文章id删除文章
 */
router.delete('/:aid', (req, res) => {
    const { aid } = req.params
    console.log(req.params);
    Article.findByIdAndDelete(aid).then(r => {
        if (r) {
            res.json({
                code: 1,
                msg: '删除文章成功'
            })
        } else {
            res.json({
                code: 0,
                msg: '文章已不存在'
            })
        }
    }).catch(err => {
        res.json({
            code: 0,
            msg: '操作失败',
            err: err
        })
    })
})

/**
 * /api/articles/users/:aid
 * 根据文章id编辑文章
 */
router.patch('/:aid', (req, res) => {
    const { aid } = req.params
    console.log('文章id' + req.params + ' ' + '更新的文章内容:' + req.body);
    Article.findByIdAndUpdate(aid, {
        ...req.body
    }, {
        new: true
    }).then(r => {
        res.json({
            code: 1,
            msg: '文章更新成功',
            data: r
        })
    }).catch(err => {
        res.json({
            code: 0,
            msg: '文章更新失败',
            err: err
        })
    })
})

module.exports = router