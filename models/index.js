const mongoose = require('mongoose');


// 构造连接字符串
// 获取 Vercel 注入的环境变量
const mongoURI = process.env.MONGO_URL;
// 连接到 MongoDB
mongoose.connect(mongoURI)
    .then(() => {
        console.log('连接成功');
    })
    .catch((err) => {
        console.log('连接失败:', err);
    });

const Schema = mongoose.Schema
// 定义文章表结构
const ArticleSchema = new Schema({
    title: String,
    content: String,
    author: { type: Schema.Types.ObjectId, ref: 'User' },
    imgUrl:String,
    tag: String,
    // 浏览量
    views: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
})

// 创建数据模型
// 根据表结构创建数据库模型
// 并且把表结构映射到数据库中一个表
// 通过Article这个对象 我们就可以CRUD
const Article = mongoose.model('Article', ArticleSchema)
ArticleSchema.virtual('coms', {
    ref: 'comment',
    localField: '_id',
    foreignField: 'article_id',
    justOne: false , // 提取全部评论
    count: true, // 评论的总数
})

ArticleSchema.set('toObject', { virtuals : true })
ArticleSchema.set('toJSON', { virtuals : true })

/**
 * 定义用户表
 */
const UserSchema = new Schema({
    username: {
        type:String,
        unique: true,
        require: true
    },
    password: String,
    nickname: String,
    headImgUrl: String
}, {
    timestamps: true
})

const User = mongoose.model('User', UserSchema)

/**
 * 定义评论表
*/
const CommentSchema = new Schema({
    likes: {
        type:Number,
        default: 0
    },
    content: String,
    article_id: { type: Schema.Types.ObjectId, ref: 'Article' },
    reply_user_id: { type: Schema.Types.ObjectId, ref: 'User' }
},{
    timestamps: true
})
const Comment = mongoose.model('Comment', CommentSchema)

// 导出模型
module.exports = {
    Comment,
    User,
    Article
}

// Comment.create({
//     content: 'yyds, 太6了',
//     article_id: '6610dddcb746a0b273166d07' ,
//     reply_user_id: '6610d014c5bd52bc63d2f7f2'
// })
// .then((res) => {
//     console.log(res);
// })

// User.create({
//     username: '1812287263',
//     password: '123456',
//     nickname: '7z',
//     headImgUrl: 'http://sm101.test.upcdn.net/img/wallhaven-3le8j3.jpg'
// }).then((res) => {
//     console.log(res);
// })


/**
 * 创建数据 并插入到数据库
 */
// Article.create({
//     title:'学习Vue',
//     content:'或许路很漫长，或许路很艰难，但我依然坚持到底，加油',
//     author:'6610d014c5bd52bc63d2f7f2',
//     tag: 'Vue'
// })
// .then((res) => {
//     console.log(res);
//     console.log('插入成功');
// })
// .catch((err) => {
//     console.log('插入失败');
// })

/**
 * 删除数据
 * 根据id删除文章
 */
// Article.deleteOne({_id: '66102d4dc68ee69602abe32f'})
// .then((res) => {
//     console.log("删除成功",res);
// })
// .catch((err) => {
//     console.log('删除失败',err);
// })

/**
 * 删除多条 正则
 */
// Article.deleteMany({tag:/java/})
// .then((res) => {
//     console.log(res);
// }).catch((err) => {
//     console.log(err);
// })

/**
 *更新
*/
// Article.updateOne({
//     author:'7z'
// },{
//     content:'修改'
// }).then((res) => {
//     console.log(res);
// }).catch((err) => {
//     console.log(err);
// })

/**
 * 浏览量的更新
 */
// Article.updateOne({
//     _id: '66102f318985b53ae45ffb75'
// },{
//     $inc:{views: 1}
// },{
//     timestamps: false // 不更新文章的编辑时间
// }).then((res) => {
//     console.log(res);
// })

/***
 * 查询文章
 */
// Article.findById('66102f318985b53ae45ffb75')
//     .then((res) => {
//         console.log(res);
//     })

/**
 * 查询并更新浏览量
 */
// Article.findByIdAndUpdate('66102f318985b53ae45ffb75', {
//     $inc: { views: 1 }
// }, {
//     timestamps: false
// }).then((res) => {
//     console.log(res);
// })


// Article.find({ views: { $gte: 0, $lte: 1000 } })
//     .sort({ _id: -1 })
//     .skip(0)
//     .limit(10)
//     .select({ updatedAt: 0, __v: 0 }) // 不显示的字段
//     .populate('author', { password: 0 })
//     // .populate('coms')
//     .exec()
//     .then((res) => {
//         console.log(res);
//     })