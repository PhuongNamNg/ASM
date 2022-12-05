const express = require('express');
const router = express.Router();
const multer = require('multer')
const path = require('path');
const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://PhuongNam:Namcr7xxx@cluster0.szjfc3a.mongodb.net');

// router.get('/', function (req, res, next) {
//     res.render('index', {title: 'Wallpaper'});
// });

router.get('/insert', function (req, res, next) {
  res.render('insert', {title: ''});
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads')
  },
  filename: function (req, file, cb) {
    let ect = path.extname(file.originalname)
    cb(null, Date.now() + '-' + Math.random() + '-' + file.originalname)
  }
})

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 2 * 1024 * 1024,
  }
}).single('avatar')

const Wallpaper = new mongoose.Schema({
  pathImg: String,
  pathImgResize: String,
  tieuDe: String,
  moTa: String,
})

var Wall = mongoose.model('Wallpaper', Wallpaper);

router.post('/insertImage', function (req, res, next) {
  upload(req, res, function (err) {
    const tieuDeWall = req.body.tieuDe;
    const moTaWall = req.body.moTa;

    const wall = new Wall({
      tieuDe: tieuDeWall,
      moTa: moTaWall,
      pathImg: `http://localhost:3000/image/${req.file.filename}`,
      pathImgResize: `http://localhost:3000/imageResize/${req.file.filename}`
    })
    wall.save().then(data => {
      if (data != null) {
        res.render('insert', {title: 'Them thong tin anh Thanh Cong'})
      } else {
        res.render('insert', {title: 'Them thong tin anh Khong Thanh cong ' + error})
      }
    });
    if (err instanceof multer.MulterError) {
      console.log('them anh that bai')
    } else {
      console.log('them anh thanh cong')
    }
  })

})

router.get('/', (req, res, next) => {
  let perPage = 9; // số lượng sản phẩm xuất hiện trên 1 page
  let page = req.params.page || 1;

  Wall.find() // find tất cả các data them lai di, 3 anh thoi
      .skip((perPage * page) - perPage) // Trong page đầu tiên sẽ bỏ qua giá trị là 0
      .limit(perPage)
      .exec((err, products) => {
        Wall.countDocuments((err, count) => { // đếm để tính có bao nhiêu trang
          if (err) return next(err);
          res.render('index', {
            products, // sản phẩm trên một page
            current: page, // page hiện tại
            pages: Math.ceil(count / perPage) // tổng số các page
          });
        });
      });
});

router.get('/news/:page', (req, res, next) => {
  let perPage = 9; // số lượng sản phẩm xuất hiện trên 1 page
  let page = req.params.page || 1;

  Wall.find() // find tất cả các data
      .skip((perPage * page) - perPage) // Trong page đầu tiên sẽ bỏ qua giá trị là 0
      .limit(perPage)
      .exec((err, products) => {
        Wall.countDocuments((err, count) => { // đếm để tính có bao nhiêu trang
          if (err) return next(err);
          res.render('index', {
            products, // sản phẩm trên một page
            current: page, // page hiện tại
            pages: Math.ceil(count / perPage) // tổng số các page
          });
        });
      });
});

router.get('/image/:imageName', function (req, res) {
  // console.log(req.params.imageName)
  res.sendFile(path.resolve(`uploads/${req.params.imageName}`))
})

router.get('/imageResize/:imageName', function (req, res) {
  const sharp = require('sharp')
  sharp(`uploads/${req.params.imageName}`)
      .resize(100)
      .toFile(`uploadResize/${req.params.imageName}`, (err, info) => {
        console.log('resize thanh cong')
        res.sendFile(path.resolve(`uploadResize/${req.params.imageName}`))
      })
})

router.get('/allImage', function (req, res) {
  Wall.find({}).then(data => {
    res.send(data)
  })
})

// router.get('/allImage', async (req,res)=>{
//     const imgs = await Wall.find()
//     res.status(200).json(imgs)
// })

module.exports = router;
