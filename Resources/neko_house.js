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

// Flickrから取得したネコ情報を保存
var _nekoList;
// 次に渡すネコ情報のインデックス
var _nextIndex = 0;

// Flickrサーバーに問い合わせ「ALL CATS」グループに投稿された写真情報を取得する
function collect(callback) {
	// FlickrへのHTTP通信オブジェクトを作成
	var http = Titanium.Network.createHTTPClient({
		onload: function(e) {
			var json;
			try {
				// JSONデータをオブジェクトへ変換
				json = JSON.parse(this.responseText);
				
				// ネコ写真リストに変換
				_nekoList = parseFlickrPhotoList(json);

				// Flickrからのデータ取得処理が終わったらコールバックメソッド起動
				callback();
			} catch (error) {
				Titanium.API.error(error);
				alert('Flickrから受け取ったデータの異常');
			}
		},
		onerror: function(error) {
			Titanium.API.error(error);
			alert('ネットワークエラーが発生しました');
		},
		timeout: 5000
	});
	
	// Flickrへ通信開始
	http.open('GET', generateApiUrl());
	http.send();
}

// ネコ情報を取得する
function getNeko() {
	// ネコ情報が存在しなかったら最初に戻る
	if (_nextIndex >= _nekoList.length) {
		_nextIndex = 0;
	}
	
	// ネコ情報を取得
	var neko =  _nekoList[_nextIndex];
	
	// ネコインデックスを増加
	_nextIndex += 1;
	
	return neko;
}

// Flickrサーバーからの応答を解析して保存する
function parseFlickrPhotoList(json) {
	// Flickr応答の json.photos.photoに配列でFlickr写真情報が入っている
	var photoInfoList = json.photos.photo;
	
	var nekoList = [];
	for (var i = 0; i < photoInfoList.length; i++) {
		var photoUrl = generatePhotoUrl(photoInfoList[i]);
		nekoList.push({
			imageurl: photoUrl
		});
	}
	
	return nekoList;
}

// Flickr APIへのアクセスURLを取得する
function generateApiUrl() {
	return String.format(COLLECT_API_URL_BASE,
		API_KEY,
		GROUP_ID,
		1,			// 取得するページ数
		100			// 一度に取得する件数
	);
}

// Flickrサーバーから取得した写真情報から写真URLを生成する
function generatePhotoUrl(photoInfo) {
	return String.format(PHOTO_URL_BASE,
		photoInfo.farm.toString(),
		photoInfo.server.toString(),
		photoInfo.id.toString(),
		photoInfo.secret.toString()
	);
}

// 外部公開メソッド
exports.collect = collect;
exports.getNeko = getNeko;