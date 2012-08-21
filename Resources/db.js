// データベース名
var DB_NAME = 'nekolickrdb';

// モジュールを初期化する
function init() {
	// データベースへ接続
	var db = Titanium.Database.open(DB_NAME);
	// テーブルが存在すれば削除
	db.execute('DROP TABLE IF EXISTS photos');
	// テーブルを作成
	db.execute('CREATE TABLE photos (idx INTEGER PRIMARY KEY AUTOINCREMENT, imageurl TEXT)');
	// データベースを閉じる
	db.close();
}

// 写真データをphotosテーブルに追加する
// 追加した結果のphotosテーブル件数を返却する
function appendPhotos(photoList) {
	// データベースへ接続
	var db = Titanium.Database.open(DB_NAME);
	
	// 写真一覧データを全件挿入
	for (var i = 0; i < photoList.length; i++) {
		// 写真データを挿入
		db.execute('INSERT INTO photos VALUES(NULL, ?)', photoList[i].imageurl);
	}
	
	// 返却用の現在の総件数を取得
	var rs = db.execute('SELECT COUNT(1) FROM photos');
	var count = rs.field(0);
	
	// データベースを閉じる
	rs.close();
	db.close();
	
	return count;
}

// 指定されたphotosレコードを返却する
// 指定がなければ一番最初のphotosレコードを返却する
function selectPhoto(index) {
	// データベースへ接続
	var db = Titanium.Database.open(DB_NAME);
	
	// idが指定されなければidが一番小さいレコードを返却
	var rs;
	if (!index) {
		rs = db.execute('SELECT * FROM photos ORDER BY idx LIMIT 1');
	} else {
		rs = db.execute('SELECT * FROM photos WHERE idx = ?', index);
	}
	
	// レコードを取得
	var record;
	if (rs.isValidRow()) {
		record = {
			idx: rs.fieldByName('idx'),
			imageurl: rs.fieldByName('imageurl')
		};
	}
	
	// データベースを閉じる
	rs.close();
	db.close();
	
	return record;
}

// 外部公開
exports.init = init;
exports.appendPhotos = appendPhotos;
exports.selectPhoto = selectPhoto;