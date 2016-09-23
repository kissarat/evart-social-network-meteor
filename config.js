const merge = require('deepmerge')
const local = require('./local')
const _ = require('underscore')

const countryCodes = `1939 1876 1869 1868 1849 1784 1767 1758 1684 1671 1670 1664 1649
1473 1441 1340 1284 1268 1264 1246 1242 998 996 995 994 993 992 977 976 975 974
973 972 971 970 968 967 966 965 964 963 962 961 960 886 880 872 856 855 853 852
850 692 691 690 689 688 687 686 685 683 682 681 680 679 678 677 676 675 674 673
672 670 599 598 597 596 595 595 594 593 591 590 590 590 537 509 508 507 506 505
504 503 502 501 500 500 423 421 420 389 387 386 385 382 381 380 379 378 377 376
375 374 373 372 371 370 359 358 356 355 354 353 352 351 350 345 299 298 297 291
290 269 268 267 266 265 264 263 262 262 261 260 258 257 256 255 254 253 252 251
250 249 248 246 245 244 243 242 241 240 239 238 237 236 235 234 233 232 231 230
229 228 227 226 225 224 223 222 221 220 218 216 213 212 98 95 94 93 92 91 90 86
84 82 81 77 66 65 64 63 62 61 61 61 60 58 57 56 55 54 53 52 51 49 48 47 47 46 45
44 44 44 44 43 41 40 39 36 34 33 32 31 30 27 20 7 1`
  .split(/\s+/).filter(a => a.trim())

module.exports = merge({
  public: {},
  file: {
    port: 9080
  },
  image: {
    resize: {
      width: 1920,
      height: 1536,
      size: 655360,
      quality: 70
    },
    thumb: {
      width: 120,
      height: 120,
      quality: 86,
      dir: '/usr/local/var/www/thumb'
    }
  },
  convert: {
    threads: 3,
    delay: 0,
    audio: {
      channels: 1,
      codec: 'libfdk_aac',
      quality: 0,
      sample_rate: 22050,
      filters: [
        {
          filter: 'silencedetect',
          options: {n: '-50dB', d: 5}
        }
      ]
    }
  },
  postgresql: {
    retry: 100
  },
  sms: {
    codes: countryCodes
  }
}, local);

const config = module.exports

if (!module.parent) {
  _.extend(config.public, {
    aws: _.pick(config.aws, 'endpoint', 'region', 'params'),
    // sms: _.pick(config.sms, 'phone', 'interval', 'codes'),
  })
  console.log(JSON.stringify(config, null, '\t'))
}
