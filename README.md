# 使用帮助

## Getting Started

### npm module

```
npm install lighthouse-js --save
```

import mudule using ES5 style:

```
var Lighthouse = require('lighthouse-js');
```

ES2015 style:

```
import Lighthouse from 'lighthouse-js';
```

Create lighthouse instance:

```
const lighthouse = new Lighthouse(project_token);
```


### global import

```html
<script type="text/javascript">
  var _mhq = <YOUR_PROJECT_NAME>;
</script>
<script src="http://track.digitwalk.com/lighthouse.min.js"></script>
```

追踪事件

```javascript
lighthouse.track('myevent');
```

## 微信微博的数据监测

用户登录后

```javascript
var openid = <openid>    // 从微信或微博中获取openid，请自行补充
var service = 'weixin'; // weixin 或者 weibo
lighthouse.registerSocial(openid, service);
```

微信转发

```javascript
/* 修改微信转发链接 */
wx.ready(function(){
  // 如果没有link可以用 lighthouse.getShareLink()
  var share = lighthouse.getShareLink(link);

  wx.onMenuShareAppMessage({
    title: 'Nysnetech | We brought you customers (NYST_APP_20150725)',
    desc: 'Nysnetech | We brought you customers (NYST_APP_20150725)',
    link: share,
    imgUrl: '',
    type: '',
    dataUrl: '',
    success: function () {
      lighthouse.track('shareMsg', { share: share });
    },
    cancel: function () {
    }
  });

  wx.onMenuShareTimeline({
    title: 'Nysnetech | We brought you customers (NYST_TM_20150725)',
    link: share,
    imgUrl: '',
    success: function () {
      lighthouse.track('shareTimeline', { share: share });
    },
    cancel: function () {
    }
  });

});
```

## API

### func: identify(string)

如何有登录用户可以直接绑定 `id`，如无用户，则自动生成 `uuid` 写入浏览器 cookie:

```javascript
lighthouse.identify(<USER_ID>);
```

### func: register(params)

对于每次都要发送的变量可以通过 `register` 方法发送:

```javascript
lighthouse.register({target: "target"});
```

### func: track(event, params)

追踪事件:

```javascript
lighthouse.track('myevent', params);
```

追踪 link 点击:

```javascript
lighthouse.trackLinks('a', 'link');
```

### func: registerSocial(openid, service)

用户登录之后发送注册信息

### func: getShareLink(link)

获取 微信/微博 转发链接
