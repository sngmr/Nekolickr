(function() {
// 写真を切り替えるタイミング（ミリ秒）
var CHANGE_INTERVAL = 5000;

// Flickrからデータを取得するモジュール
var flickrServer = require('flickr_server');

// Windowを生成
var win = Titanium.UI.createWindow({
	backgroundColor: '#000',
	navBarHidden: true,
	exitOnClose: true
});

// 写真を表示するImageView
var imageView = Titanium.UI.createImageView({
	preventDefaultImage: true
});
win.add(imageView);

// Flickrモジュールにデータ取得を依頼する
flickrServer.collect(function(isSuccess, errorMessage) {
	if (isSuccess) {
		// ImageViewへ最初の写真を設定
		setNekoImage();
	}
	
	// Flickrモジュールの処理が終わったらWindowを開く
	win.open();
	
	// エラーメッセージはWindowを開いた後に表示する
	if (!isSuccess) {
		alert('エラー!!!\n' + errorMessage);
	}
});

// Flickrモジュール写真情報を取得してImageViewへ設定
function setNekoImage() {
	// Flickrモジュールから写真情報を取得
	var photoInfo = flickrServer.getPhotoInfo();
	
	// 写真情報に設定された画像URLをImageViewへ設定
	imageView.image = photoInfo.imageurl;
	
	// 一定間隔後に写真を変更する
	setTimeout(setNekoImage, CHANGE_INTERVAL);
}
})();
