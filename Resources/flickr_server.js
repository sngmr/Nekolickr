// Flickrから取得したAPI KEY
var API_KEY = '0e50a1b12cca751d36539d5dfd71979e';
// グループID
var GROUP_ID = '661812@N25';
// グループから写真一覧を取得するAPIのURL（ベース）
var COLLECT_API_URL_BASE = 
	'http://api.flickr.com/services/rest/?method=flickr.groups.pools.getPhotos' + 
	'&format=json&nojsoncallback=1&api_key=%s&group_id=%s&page=%d&per_page=%d';
// Flickrの写真URLベース
var PHOTO_URL_BASE = 'http://farm%s.staticflickr.com/%s/%s_%s.jpg';

// Flickrから取得した写真情報一覧を保存
var _photoList = [];
// 次に取得する写真情報のインデックス
var _nextIndex = 0;
// 次に取得するページ番号
var _nextPageNumber = 1;
// 取得可能な最大ページ番号
var _maxPageNumber = 0;

// Flickrサーバーに問い合わせグループに投稿された写真情報を取得する
//   callbackの引数：callback(正常異常のBoolean値, データ)
function collect(callback) {
	// Flickr APIへのHTTP通信オブジェクトを作成
	var http = Titanium.Network.createHTTPClient({
		onload: function(e) {
			try {
				// JSONデータをオブジェクトへ変換
				var json = JSON.parse(this.responseText);
				if (json.stat === 'ok') {
					// 写真情報一覧に変換して保存している写真情報一覧へ追加
					_photoList = _photoList.concat(parseFlickrPhotoList(json));
					
					// 取得可能な最大ページ番号を保存
					_maxPageNumber = parseInt(json.photos.pages, 10);
					
					// APIアクセス処理終わったらコールバック起動
					callback(true);
				} else {
					callback(false, 'E1:' + json.message);
				}
			} catch (error) {
				Titanium.API.error(error);
				callback(false, 'E2:' + error.message);
			}
		},
		onerror: function(error) {
			Titanium.API.error(error);
			callback(false, 'E3:' + error.error);
		},
		timeout: 5000
	});
	
	// Flickrへ通信開始
	http.open('GET', generateApiUrl());
	http.send();
}

// 次に表示する写真情報を返却する
function getPhotoInfo() {
	// 次に表示するべき写真情報を取得
	var photoInfo =  _photoList[_nextIndex];
	
	// 次に取得するインデックスを増加させる
	// 残り5件になったら写真情報一覧を追加取得する
	// ただし最大件数まで取得していれば写真情報一覧の最初に戻る
	_nextIndex += 1;
	if ((_nextIndex + 5) >= _photoList.length && _nextPageNumber <= _maxPageNumber) {
		// Flickr APIへアクセスして写真一覧を取得
		collect(function(isSuccess) {
			_nextPageNumber += 1;
		});
	} else if (_nextIndex >= _photoList.length) {
		_nextIndex = 0;
	}
	
	return photoInfo;
}

// Flickrサーバーからの応答を解析して返却する
function parseFlickrPhotoList(json) {
	// Flickr応答の json.photos.photoに配列でFlickr写真情報が入っている
	var photoInfoList = json.photos.photo;
	
	// 写真の件数分ループする
	var photoList = [];
	for (var i = 0; i < photoInfoList.length; i++) {
		var photoUrl = generatePhotoUrl(photoInfoList[i]);
		// 写真データを作成
		photoList.push({
			imageurl: photoUrl
		});
	}
	
	return photoList;
}

// Flickr APIへのアクセスURLを取得する
function generateApiUrl() {
	return String.format(COLLECT_API_URL_BASE,
		API_KEY,
		GROUP_ID,
		_nextPageNumber,			// 取得するページ数
		25							// 一度に取得する件数
	);
}

// Flickrサーバーから取得した写真情報から写真URLを生成する
function generatePhotoUrl(photoInfo) {
	return String.format(PHOTO_URL_BASE,
		photoInfo.farm.toString(),		// ファームID
		photoInfo.server.toString(),	// サーバーID
		photoInfo.id.toString(),		// 写真ID
		photoInfo.secret.toString()		// 写真アクセス用秘密鍵
	);
}

// 外部公開メソッド
exports.collect = collect;
exports.getPhotoInfo = getPhotoInfo;
