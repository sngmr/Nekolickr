// Flickrから取得したAPI KEY
var KEY = '0e50a1b12cca751d36539d5dfd71979e';
// ALL CATS グループから写真一覧を取得するAPI URL
var COLLECT_URL = 
	'http://api.flickr.com/services/rest/?method=flickr.groups.pools.getPhotos' + 
	'&group_id=661812%40N25&format=json&nojsoncallback=1' + 
	'&api_key=' + KEY;
// Flickrの写真URLベース（String.formatで整形）
var PHOTO_URL_BASE = 'http://farm%s.staticflickr.com/%s/%s_%s.jpg';

// Flickrから取得したネコ情報を保存
var _nekoList = [];
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
				
				// 欲しい情報に変換
				parseFlickrPhotoList(json);

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
	http.open('GET', COLLECT_URL);
	http.send();
}

// Flickrサーバーからの応答を解析して保存する
function parseFlickrPhotoList(json) {
	// Flickr応答の json.photos.photoに配列でFlickr写真情報が入っている
	var photoInfoList = json.photos.photo;
	for (var i = 0; i < photoInfoList.length; i++) {
		var photoUrl = generatePhotoUrl(photoInfoList[i]);
		_nekoList.push({
			imageurl: photoUrl
		});
	}
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

// 外部公開メソッド
exports.collect = collect;
exports.getNeko = getNeko;