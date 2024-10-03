const express = require('express')
const { Comment } = require('../models/index')
// 文章评论
const router = express.Router()

/**
 * 发布评论
 */
router.post('/', (req, res) => {
    console.log(req.body);
    const { body, auth: { uid } } = req;
    Comment.create({
        reply_user_id: uid,
        article_id: body.article_id,
        content: body.content
    }).then(r => {
        res.json({
            code: 1,
            msg: '发布评论成功'
        });
    }).catch(err => {
        res.status(500).json({
            code: 0,
            msg: '发布评论失败',
            err: err.message // 将错误消息包含在响应中
        });
    });
});

/**
 * 根据文章id获取文章的最热评论列表
 */
router.get('/articles/hot/:aid', (req, res) => {
    const { aid } = req.params
    Comment.find({ article_id: aid })
        // 不展示密码
        .populate('reply_user_id', { password: 0 })
        .sort({ views: -1 }) // 按照views字段降序排序
        .then(r => {
            res.json({
                code: 1,
                msg: '查询评论列表成功',
                data: r
            })
        }).catch(err => {
            res.json({
                code: 0,
                msg: '查询评论列表失败'
            })
        })
})
/**
 * 根据文章id获取文章的最新评论列表
 */
router.get('/articles/new/:aid', async (req, res) => {
    try {
        const { aid } = req.params;
        // 使用异步函数查询最新评论列表，并填充评论用户的信息，包括昵称、ID和头像
        const comments = await Comment.find({ article_id: aid })
            .populate({
                path: 'reply_user_id',
                select: 'nickname _id headImgUrl', // 选择昵称、ID和头像字段
            })
            .sort({ updatedAt: -1 });

        res.json({
            code: 1,
            msg: '查询评论列表成功',
            data: comments
        });
    } catch (error) {
        res.status(500).json({
            code: 0,
            msg: '查询评论列表失败',
            error: error.message
        });
    }
});

/**
 * 根据评论id删除评论
 */
router.delete('/:cid', async (req, res) => {
    // 文章id
    const { cid } = req.params
    // 根据评论id 找到对应的评论 关联文章
    const commentObj = await Comment.findById(cid).populate('article_id')
    // 获取作者
    const author_id = commentObj.article_id._id
    // 如果评论文章的作者 === 登录账号的作者相同 可以删除
    if (author_id === cid) {
        const r = await Comment.findByIdAndDelete(cid)
        if (r) {
            res.json({
                code: 1,
                msg: '删除评论成功'
            })
        } else {
            res.json({
                code: 0,
                msg: '评论已经被删除'
            })
            
        }

    }
})

/**
 * 评论点赞
 */
router.post('/likes', async (req, res) => {
        // 获取请求体中的评论ID
        const { cid } = req.body;
        try {
            // 使用findByIdAndUpdate()方法更新评论的点赞数
            const updatedComment = await Comment.findByIdAndUpdate(
                cid, // 要更新的评论ID
                { $inc: { likes: 1 } }, // 更新操作：将likes字段值加1
                { new: true } // 返回更新后的文档
            );
            if (!updatedComment) {
                return res.json({
                    code: 0,
                    msg: '评论不存在或已被删除'
                });
            }
            res.json({
                code: 1,
                msg: '点赞成功',
                data: updatedComment
            });
        } catch (error) {
            console.error(error);
            res.json({
                code: 0,
                msg: '点赞失败，服务器内部错误'
            });
        }
});
module.exports = router