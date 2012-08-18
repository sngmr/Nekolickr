(function() {
// 写真を切り替えるタイミング（ミリ秒）
var CHANGE_INTERVAL = 30000;
// 写真切り替えのフェードイン・アウト時間（ミリ秒）
var CHANGE_DURATION = 2000;

// Flickrからデータを取得するモジュール
var flickrServer = require('flickr_server');

// 初回起動時フラグ
var isFirst = true;
// 表示されていないImageViewのインデックス
var hidingImageIndex = 0;

// Windowを生成
var win = Titanium.UI.createWindow({
	backgroundColor: '#000',
	navBarHidden: true,
	exitOnClose: true
});

// フェードイン・アウトを行うためImageViewを2つ準備する 
// imageViewList[0], imageViewList[1]でアクセス
var imageViewList = [];
for (var i = 0; i < 2; i++) {
	imageViewList[i] = Titanium.UI.createImageView({
		backgroundColor: '#000',
		preventDefaultImage: true,
		opacity: 0
	});
	
	// 画像読み込み完了時・エラー時のイベントリスト登録
	imageViewList[i].addEventListener('load', imageViewLoadHandler);
	imageViewList[i].addEventListener('error', imageViewErrorHandler);
	win.add(imageViewList[i]);
}

// Flickrモジュールにデータ取得を依頼する
flickrServer.collect(function(isSuccess, errorMessage) {
	if (isSuccess) {
		// ImageViewへ最初の写真を設定
		setNextPhoto();
	}
	
	// Flickrモジュールの処理が終わったらWindowを開く
	win.open();
	
	// エラーメッセージはWindowを開いた後に表示する
	if (!isSuccess) {
		alert('エラー!!!\n' + errorMessage);
	}
});

// Flickrモジュール写真情報を取得してImageViewへ設定
function setNextPhoto() {
	// Flickrモジュールから写真情報を取得
	var photoInfo = flickrServer.getPhotoInfo();
	
	// 写真情報に設定された画像URLを、現在非表示のImageViewへ設定
	imageViewList[hidingImageIndex].image = photoInfo.imageurl;
}

// 画像読み込み完了時イベントハンドラ
function imageViewLoadHandler(e) {
	// 非表示/表示ImageViewへのインデックスを保存しておく
	//   アニメーション完了時には元の値が変更されているため
	var hidingIndex = hidingImageIndex;
	var showingIndex = 1 - hidingImageIndex;	// 0と1を反転させる

	// 初回起動時はどちらにも画像が表示されていないので、現在表示されている画像の
	// フェードアウト処理は行わない
	if (!isFirst) {
		// フェードアウトアニメーション生成
		var fadeOut = Titanium.UI.createAnimation({
			opacity: 0,
			duration: CHANGE_DURATION
		});
		fadeOut.addEventListener('complete', function() {
			// 重要：アニメーション完了後に変更した値を本体へ設定しておかないと
			// 　　　Androidで不具合が発生する
			imageViewList[showingIndex].opacity = 0;
		});
		
		// 現在表示されている画像のフェードアウト
		imageViewList[showingIndex].animate(fadeOut);
	}
	
	// フェードインアニメーション作成
	var fadeIn = Titanium.UI.createAnimation({
		opacity: 1,
		duration: CHANGE_DURATION
	});
	fadeIn.addEventListener('complete', function() {
		// 重要：アニメーション完了後に変更した値を本体へ設定しておかないと
		// 　　　Androidで不具合が発生する
		imageViewList[hidingIndex].opacity = 1;
	});
	
	// 非表示画像には画像が設定されており読み込みも完了しているのでのフェードイン
	imageViewList[hidingIndex].animate(fadeIn);

	// 表示/非表示ImageViewのインデックスを入れ替え
	hidingImageIndex = showingIndex;
	isFirst = false;
	
	// また一定間隔後に写真を変更する
	setTimeout(setNextPhoto, CHANGE_INTERVAL);
}

// 画像読み込み完了時イベントハンドラ
function imageViewErrorHandler(error) {
	// 画像が読み込めなかったら即刻次の画像をトライ
	Titanium.API.error(error);
	setNextPhoto();
}
})();
