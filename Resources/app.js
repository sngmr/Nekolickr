(function() {
// アプリのSleepを抑止
Titanium.App.idleTimerDisabled = true;	

// 写真を切り替えるタイミング（ミリ秒）
var CHANGE_INTERVAL = 30000;
// 写真切り替えのフェードイン・アウト時間（ミリ秒）
var CHANGE_DURATION = 5000;

// Flickrからデータを取得するモジュール
var flickrServer = require('flickr_server');

// 初回起動時フラグ
var _isFirst = true;
// 表示されていないImageViewのインデックス
var _hidingImageIndex = 0;

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
	imageViewList[_hidingImageIndex].image = photoInfo.imageurl;
}

// 画像読み込み完了時イベントハンドラ
function imageViewLoadHandler(e) {
	// 表示非表示ImageViewのインデックス
	var hidingIndex = _hidingImageIndex;
	var showingIndex = 1 - _hidingImageIndex;	// 0と1を反転させる

	// 初回起動時はどちらにも画像が表示されていないので、現在表示されている画像の
	// フェードアウト処理は行わない
	if (!_isFirst) {
		// フェードアウトアニメーション生成
		var fadeOut = Titanium.UI.createAnimation({
			opacity: 0,
			duration: CHANGE_DURATION
		});
		// アニメーション完了後イベントハンドラ追加
		fadeOut.addEventListener('complete', function() {
			// アニメーションで変更した値を本体へ設定（やらないとAndroidで不具合発生） 
			imageViewList[showingIndex].opacity = 0;
		});
		
		// 現在表示されている画像のフェードアウト
		imageViewList[showingIndex].animate(fadeOut);
	} else {
		_isFirst = false;
	}
	
	// フェードインアニメーション作成
	var fadeIn = Titanium.UI.createAnimation({
		opacity: 1,
		duration: CHANGE_DURATION
	});
	// アニメーション完了後イベントハンドラ追加
	fadeIn.addEventListener('complete', function() {
		// アニメーションで変更した値を本体へ設定（やらないとAndroidで不具合発生）
		imageViewList[hidingIndex].opacity = 1;
		
		// 表示/非表示ImageViewのインデックスを入れ替え
		_hidingImageIndex = showingIndex;
		
		// また一定間隔後に写真を変更する
		setTimeout(setNextPhoto, CHANGE_INTERVAL);
	});
	
	// 非表示画像の読み込みは完了しているのでのフェードイン
	imageViewList[hidingIndex].animate(fadeIn);
}

// 画像読み込みエラー時イベントハンドラ
function imageViewErrorHandler(error) {
	// 画像が読み込めなかったら即刻次の画像をトライ
	Titanium.API.error(error);
	setNextPhoto();
}
})();
