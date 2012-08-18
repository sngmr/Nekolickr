(function() {
// ネコ写真を切り替えるタイミング（ミリ秒）
var CHANGE_INTERVAL = 5000;

// ネコ情報が詰まってるネコハウスモジュール
var nekoHouse = require('neko_house');

// Windowを生成
var win = Titanium.UI.createWindow({
	backgroundColor: '#000',
	navBarHidden: true,
	exitOnClose: true
});

// ネコ写真を表示するImageView
var imageView = Titanium.UI.createImageView({
	preventDefaultImage: true
});
win.add(imageView);

// ネコハウスにデータ取得を依頼する
nekoHouse.collect(function() {
	// ImageViewへネコ写真設定
	setNekoImage();
	
	// Windowを開く
	win.open();
	
	// 今後一定間隔でネコ写真を切り替え
	setInterval(setNekoImage, CHANGE_INTERVAL);
});

// ネコハウスからネコ情報を取得してImageViewへ設定
function setNekoImage() {
	// ネコハウスからネコ情報を取得
	var neko = nekoHouse.getNeko();
	
	// ネコ写真をImageViewへ設定
	imageView.image = neko.imageurl;
}
})();