const _ = require('./common')

const mimes = {
  'application/atom+xml': {size: 131072, ext: ['atom']},
  'application/font-woff': {size: 8388608, ext: ['woff']},
  'application/gzip': {size: 67108864, ext: ['gz']},
  'application/java-archive': {size: 8388608, ext: ['jar', 'war', 'ear']},
  'application/json': {size: 524288, ext: ['json']},
  'application/mac-binhex40': {size: 65536, ext: ['hqx']},
  'application/msword': {size: 8388608, ext: ['doc']},
  'application/pdf': {size: 16777216, ext: ['pdf']},
  'application/postscript': {size: 8388608, ext: ['ps', 'eps', 'ai']},
  'application/rss+xml': {size: 131072, ext: ['rss']},
  'application/rtf': {size: 4194304, ext: ['rtf']},
  'application/tar+gzip': {size: 67108864, ext: ['tgz']},
  'application/vnd.apple.mpegurl': {size: 16384, ext: ['m3u8']},
  'application/vnd.google-earth.kml+xml': {size: 16384, ext: ['kml']},
  'application/vnd.google-earth.kmz': {size: 16384, ext: ['kmz']},
  'application/vnd.ms-excel': {size: 1048576, ext: ['xls']},
  'application/vnd.ms-fontobject': {size: 8388608, ext: ['eot']},
  'application/vnd.ms-powerpoint': {size: 8388608, ext: ['ppt']},
  'application/vnd.oasis.opendocument.spreadsheet': {size: 16777216, ext: ['ods']},
  'application/vnd.oasis.opendocument.text': {size: 16777216, ext: ['odt']},
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': {size: 16777216, ext: ['pptx']},
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {size: 16777216, ext: ['xlsx']},
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': {size: 16777216, ext: ['docx']},
  'application/vnd.wap.wmlc': {size: 8388608, ext: ['wmlc']},
  'application/x-7z-compressed': {size: 67108864, ext: ['7z']},
  'application/x-cocoa': {size: 8388608, ext: ['cco']},
  'application/x-java-archive-diff': {size: 524288, ext: ['jardiff']},
  'application/x-java-jnlp-file': {size: 16384, ext: ['jnlp']},
  'application/x-makeself': {size: 8388608, ext: ['run']},
  'application/x-perl': {size: 131072, ext: ['pl', 'pm']},
  'application/x-pilot': {size: 2097152, ext: ['prc', 'pdb']},
  'application/x-rar-compressed': {size: 2097152, ext: ['rar']},
  'application/x-redhat-package-manager': {size: 16777216, ext: ['rpm']},
  'application/x-sea': {size: 8388608, ext: ['sea']},
  'application/x-shockwave-flash': {size: 262144, ext: ['swf']},
  'application/x-stuffit': {size: 8388608, ext: ['sit']},
  'application/x-tcl': {size: 262144, ext: ['tcl', 'tk']},
  'application/x-www-form-urlencoded': {size: 8192, ext: ['data']},
  'application/x-x509-ca-cert': {size: 65536, ext: ['der', 'pem', 'crt']},
  'application/x-xpinstall': {size: 524288, ext: ['xpi']},
  'application/xhtml+xml': {size: 2097152, ext: ['xhtml']},
  'application/xspf+xml': {size: 8388608, ext: ['xspf']},
  'application/zip': {size: 8388608, ext: ['zip']},
  'audio/midi': {size: 262144, ext: ['mid', 'midi', 'kar']},
  'audio/mpeg': {size: 16777216, ext: ['mp3']},
  'audio/mp3': {size: 268435456, ext: ['mp3']},
  'audio/ogg': {size: 8388608, ext: ['ogg']},
  'audio/x-m4a': {size: 16777216, ext: ['m4a']},
  'audio/x-realaudio': {size: 2097152, ext: ['ra']},
  'image/gif': {size: 8388608, ext: ['gif']},
  'image/jpeg': {size: 8388608, ext: ['jpeg', 'jpg']},
  'image/png': {size: 1048576, ext: ['png']},
  'image/svg+xml': {size: 1048576, ext: ['svg', 'svgz']},
  'image/tiff': {size: 2097152, ext: ['tif', 'tiff']},
  'image/vnd.wap.wbmp': {size: 262144, ext: ['wbmp']},
  'image/webp': {size: 8388608, ext: ['webp']},
  'image/x-icon': {size: 262144, ext: ['ico']},
  'image/x-jng': {size: 8388608, ext: ['jng']},
  'image/x-ms-bmp': {size: 262144, ext: ['bmp']},
  'text/css': {size: 524288, ext: ['css']},
  'text/csv': {size: 2097152, ext: ['csv']},
  'text/json': {size: 2048, ext: ['xml']},
  'text/mathml': {size: 32768, ext: ['mml']},
  'text/php': {size: 65536, ext: ['php']},
  'text/plain': {size: 2097152, ext: ['txt']},
  'text/vnd.sun.j2me.app-descriptor': {size: 8388608, ext: ['jad']},
  'text/vnd.wap.wml': {size: 8388608, ext: ['wml']},
  'text/x-component': {size: 524288, ext: ['htc']},
  'text/xml': {size: 524288, ext: ['xml']},
  'video/3gpp': {size: 16777216, ext: ['3gpp', '3gp']},
  'video/mp2t': {size: 16777216, ext: ['ts']},
  'video/mp4': {size: 33554432, ext: ['mp4']},
  'video/mpeg': {size: 8388608, ext: ['mpeg', 'mpg']},
  'video/quicktime': {size: 8388608, ext: ['mov']},
  'video/webm': {size: 33554432, ext: ['webm']},
  'video/x-flv': {size: 4194304, ext: ['flv']},
  'video/x-m4v': {size: 4194304, ext: ['m4v']},
  'video/x-mng': {size: 4194304, ext: ['mng']},
  'video/x-ms-asf': {size: 8388608, ext: ['asx', 'asf']},
  'video/x-ms-wmv': {size: 2097152, ext: ['wmv']},
  'video/x-msvideo': {size: 33554432, ext: ['avi']}
}

const types = {
  'application/gzip': 'archive',
  'application/msword': 'text',
  'application/pdf': 'text',
  'application/tar+gzip': 'archive',
  'application/vnd.ms-excel': 'text',
  'application/vnd.ms-fontobject': 'text',
  'application/vnd.ms-powerpoint': 'text',
  'application/vnd.oasis.opendocument.spreadsheet': 'text',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'text',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'text',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'text',
  'application/x-7z-compressed': 'archive',
  'application/x-rar-compressed': 'archive',
  'application/zip': 'archive',
}

const records = []
_.each(mimes, function (mime, name) {
  mime.id = name
  delete mime.ext
  mime.type = name.split('/')[0]
  if (name in types) {
    mime.type = types[name]
  }
  records.push(mime)
})

_.saveSQL('mime', [
  {
    table: 'mime',
    objects: records
  }
])

_.saveJSON('mime', records)
