const express = require('express')

const router = express.Router()

// 上传文件模块
const multer = require('multer')
const path = require('path')
const storage = multer.diskStorage({
    // 上传图片的路径
    destination: function(req, file, cd){
        cd(null, 'public/images')

    },
    filename:function(req, file, cd){
        // 获取前端上传图片的后缀名
        // path.extname(file.originalname)
        // 文件名字, 以上上传的时间戳为文件的名字
        cd(null, Date.now() + path.extname(file.originalname))
    }
})
// 根据存储设置，创建upload
const upload = multer({storage:storage}).single('img')
router.post('/',upload , (req, res) => {
    const file = req.file
    console.log(req.img);
    const imgUrl = '/images/' + file.filename
    res.json({
        code:1,
        msg:'上传成功',
        data:imgUrl
    })
})

module.exports = router